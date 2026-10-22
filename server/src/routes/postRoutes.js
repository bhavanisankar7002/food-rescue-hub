import express from 'express';
import FoodPost from '../models/FoodPost.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

export const computeRisk = (preparedAt, expiresAt, qualityChecked) => {
  const now = new Date();
  const prepDate = new Date(preparedAt);
  const expDate = new Date(expiresAt);

  const hoursDiff = (now - prepDate) / (1000 * 60 * 60);
  const hoursToExpire = (expDate - now) / (1000 * 60 * 60);

  if (!qualityChecked) {
    return {
      level: 'High',
      reason: 'Quality check mandatory requirement not verified by donor.',
    };
  }

  if (hoursToExpire <= 0 || hoursDiff >= 6 || hoursToExpire <= 0.5) {
    return {
      level: 'High',
      reason: 'Food prepared > 6 hrs ago or expiring in under 30 mins. Unsafe for distribution.',
    };
  }

  if (hoursDiff >= 3 || hoursToExpire <= 2.5) {
    return {
      level: 'Medium',
      reason: 'Prepared 3-6 hrs ago. Recommended for swift consumption upon pickup.',
    };
  }

  return {
    level: 'Low',
    reason: 'Freshly prepared within 3 hrs with quality verification.',
  };
};

const checkAndExpirePosts = async () => {
  const now = new Date();
  const expiredPosts = await FoodPost.find({
    status: 'Posted',
    expiresAt: { $lt: now },
  });

  for (const post of expiredPosts) {
    post.status = 'Expired';
    await post.save();

    await ActivityLog.create({
      user: post.donor,
      userName: 'System Monitor',
      userRole: 'system',
      action: 'Post Expired',
      details: `Food post "${post.title}" auto-expired past safe window.`,
    });
  }
};

// GET /api/posts/ngos - Fetch verified NGOs for donor selection
router.get('/ngos', async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo' })
      .select('name email phone orgType badge rating ratingCount trustScore fraudReportsCount address coordinates');
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching NGOs.' });
  }
});

// POST /api/posts - Create new post (DONOR ONLY)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only registered donors can post surplus food.' });
    }

    const {
      items,
      preparedAt,
      expiresAt,
      qualityChecked,
      storageTempNotes,
      imageUrl,
      dietaryType,
      estimatedMealsInput,
      ngoInvolvement,
      assignedNgo,
      ngoInvolvementReason,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please add at least one food item with quantity.' });
    }

    if (!preparedAt || !expiresAt) {
      return res.status(400).json({ message: 'Preparation timestamp and expiry timestamp are required.' });
    }

    const risk = computeRisk(preparedAt, expiresAt, qualityChecked);

    if (risk.level === 'High') {
      return res.status(400).json({
        message: `Food Safety Alert: Post rejected due to High Risk. ${risk.reason}`,
        riskLevel: 'High',
      });
    }

    // Calculate total weight and meal portions
    let totalKg = 0;
    let totalPortions = 0;
    items.forEach(item => {
      const q = Number(item.quantity) || 1;
      if (item.unit === 'kg' || item.unit === 'L') {
        totalKg += q;
        totalPortions += Math.round(q * 2.5);
      } else if (item.unit === 'portions') {
        totalPortions += q;
        totalKg += q * 0.35;
      } else {
        totalKg += q * 0.5;
        totalPortions += q * 2;
      }
    });

    const totalWeightKg = Math.max(1, Math.round(totalKg * 10) / 10);
    const estimatedMeals = Number(estimatedMealsInput) || Math.max(1, totalPortions);

    let targetNgoId = null;
    const isNgoInvolved = Boolean(ngoInvolvement);
    if (isNgoInvolved) {
      if (assignedNgo) {
        targetNgoId = assignedNgo;
      } else {
        const firstNgo = await User.findOne({ role: 'ngo' });
        if (firstNgo) targetNgoId = firstNgo._id;
      }
    }

    const newPost = new FoodPost({
      donor: req.user._id,
      items,
      totalWeightKg,
      estimatedMeals,
      preparedAt,
      expiresAt,
      qualityChecked: Boolean(qualityChecked),
      storageTempNotes: storageTempNotes || 'Kept insulated at recommended temp',
      imageUrl: imageUrl || '',
      dietaryType: dietaryType || 'Veg',
      riskLevel: risk.level,
      riskReason: risk.reason,
      status: 'Posted',
      pickupAddress: req.user.address || '123 Community Hub',
      ngoInvolvement: isNgoInvolved,
      assignedNgo: targetNgoId,
      ngoInvolvementReason: ngoInvolvementReason || (isNgoInvolved ? 'Logistics and quality oversight' : ''),
    });

    await newPost.save();
    await newPost.populate('donor', 'name email phone address orgType badge rating ratingCount');
    if (newPost.assignedNgo) {
      await newPost.populate('assignedNgo', 'name email phone orgType badge rating ratingCount trustScore fraudReportsCount');
    }

    // REQUIREMENT 6: Notifications go strictly to users with role "recipient"
    const recipients = await User.find({ role: 'recipient' });
    const notifDocs = recipients.map(r => ({
      recipient: r._id,
      donor: req.user._id,
      post: newPost._id,
      title: '🍎 New Surplus Food Available!',
      message: `${req.user.name} posted ${newPost.title} (${newPost.totalWeightKg} kg, ${newPost.estimatedMeals} meals)${isNgoInvolved ? ' [NGO Partner Supported]' : ' [Direct Pickup]'}. Claim now!`,
      type: 'new_post',
    }));

    if (isNgoInvolved && targetNgoId) {
      notifDocs.push({
        recipient: targetNgoId,
        donor: req.user._id,
        post: newPost._id,
        title: '🛡️ NGO Assistance Requested',
        message: `${req.user.name} posted ${newPost.title} and requested verified NGO logistics support.`,
        type: 'system',
      });
    }

    await Notification.insertMany(notifDocs);

    // Create Activity Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: 'donor',
      action: 'Posted Food Surplus',
      details: `Posted ${newPost.title} (${newPost.totalWeightKg} kg, ${newPost.estimatedMeals} meals).`,
    });

    res.status(201).json({
      message: 'Surplus food post published successfully!',
      post: newPost,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error creating food post.' });
  }
});

// GET /api/posts/available
router.get('/available', async (req, res) => {
  try {
    await checkAndExpirePosts();

    const posts = await FoodPost.find({ status: 'Posted' })
      .populate('donor', 'name email phone address orgType badge rating ratingCount coordinates')
      .populate('assignedNgo', 'name email phone orgType badge rating ratingCount trustScore fraudReportsCount')
      .sort({ createdAt: -1 });

    const updatedPosts = posts.map(p => {
      const obj = p.toObject();
      const risk = computeRisk(p.preparedAt, p.expiresAt, p.qualityChecked);
      obj.riskLevel = risk.level;
      obj.riskReason = risk.reason;
      return obj;
    });

    res.json(updatedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching available posts.' });
  }
});

// GET /api/posts/my-posts - Donor's posts
router.get('/my-posts', authenticateToken, async (req, res) => {
  try {
    await checkAndExpirePosts();

    const posts = await FoodPost.find({ donor: req.user._id })
      .populate('claimedBy', 'name email phone orgType address')
      .populate('assignedNgo', 'name email phone orgType badge rating ratingCount trustScore fraudReportsCount')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching donor posts.' });
  }
});

// GET /api/posts/my-claims - Recipient's claims
router.get('/my-claims', authenticateToken, async (req, res) => {
  try {
    const claims = await FoodPost.find({ claimedBy: req.user._id })
      .populate('donor', 'name email phone address orgType badge rating ratingCount coordinates')
      .populate('assignedNgo', 'name email phone orgType badge rating ratingCount trustScore fraudReportsCount')
      .sort({ updatedAt: -1 });

    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching recipient claims.' });
  }
});

// PUT /api/posts/:id/claim - Claim post
router.put('/:id/claim', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'recipient') {
      return res.status(403).json({ message: 'Only verified recipient organizations can claim food.' });
    }

    const post = await FoodPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Food post not found.' });
    }

    if (post.status !== 'Posted') {
      return res.status(400).json({ message: `Cannot claim: Post status is currently "${post.status}".` });
    }

    post.status = 'Claimed';
    post.claimedBy = req.user._id;
    post.claimedAt = new Date();
    await post.save();

    await post.populate('donor', 'name email phone address orgType badge rating ratingCount');
    await post.populate('claimedBy', 'name email phone orgType address');
    if (post.assignedNgo) {
      await post.populate('assignedNgo', 'name email phone orgType badge rating ratingCount trustScore fraudReportsCount');
    }

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: 'recipient',
      action: 'Claimed Food Post',
      details: `Claimed "${post.title}" from donor ${post.donor.name}.`,
    });

    res.json({
      message: `Successfully claimed "${post.title}"! Contact donor to arrange pickup.`,
      post,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error claiming food post.' });
  }
});

// PUT /api/posts/:id/collect - Mark collected
router.put('/:id/collect', authenticateToken, async (req, res) => {
  try {
    const { stars, comment, tags, ngoRating } = req.body;
    const post = await FoodPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Food post not found.' });
    }

    if (post.status !== 'Claimed') {
      return res.status(400).json({ message: `Cannot mark collected: Post is currently "${post.status}".` });
    }

    post.status = 'Collected';
    post.collectedAt = new Date();

    if (stars) {
      post.ratingFromRecipient = {
        stars: Number(stars) || 5,
        comment: comment || 'Food collected in great condition. Thank you!',
        tags: Array.isArray(tags) ? tags : ['Fresh & Hot', 'Punctual Pickup'],
        createdAt: new Date(),
      };
    }

    // Process recipient feedback on NGO if present
    if (ngoRating && post.assignedNgo) {
      const isFraud = Boolean(ngoRating.isFraudReported);
      post.ratingRecipientToNgo = {
        stars: Number(ngoRating.stars) || 5,
        comment: ngoRating.comment || '',
        tags: Array.isArray(ngoRating.tags) ? ngoRating.tags : [],
        isFraudReported: isFraud,
        createdAt: new Date(),
      };

      const ngoUser = await User.findById(post.assignedNgo);
      if (ngoUser) {
        const totalR = (ngoUser.ratingCount || 0) + 1;
        const newR = ((ngoUser.rating || 5) * (ngoUser.ratingCount || 0) + Number(ngoRating.stars || 5)) / totalR;
        ngoUser.rating = Math.round(newR * 10) / 10;
        ngoUser.ratingCount = totalR;

        if (isFraud) {
          ngoUser.fraudReportsCount = (ngoUser.fraudReportsCount || 0) + 1;
          ngoUser.trustScore = Math.max(0, (ngoUser.trustScore || 98) - 25);
          if (ngoUser.trustScore < 60) ngoUser.badge = 'Member';
        } else {
          ngoUser.trustScore = Math.min(100, (ngoUser.trustScore || 98) + 1);
        }
        await ngoUser.save();
      }
    }

    await post.save();
    await post.populate('donor', 'name email phone address orgType badge rating ratingCount');
    await post.populate('claimedBy', 'name email phone orgType address');
    if (post.assignedNgo) {
      await post.populate('assignedNgo', 'name email phone orgType badge rating ratingCount trustScore fraudReportsCount');
    }

    if (stars && post.donor) {
      const donorUser = await User.findById(post.donor._id);
      if (donorUser) {
        const totalRatings = donorUser.ratingCount + 1;
        const newRating = (donorUser.rating * donorUser.ratingCount + Number(stars)) / totalRatings;
        donorUser.rating = Math.round(newRating * 10) / 10;
        donorUser.ratingCount = totalRatings;

        const collectedCount = await FoodPost.countDocuments({ donor: donorUser._id, status: 'Collected' });
        if (collectedCount >= 10) donorUser.badge = 'Gold';
        else if (collectedCount >= 5) donorUser.badge = 'Silver';
        else donorUser.badge = 'Bronze';

        await donorUser.save();
      }
    }

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'Completed Pickup Collection',
      details: `Marked "${post.title}" as collected and rescued.${ngoRating?.isFraudReported ? ' [WARNING: Fraud Reported on NGO]' : ''}`,
    });

    res.json({
      message: 'Collection completed successfully!',
      post,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error marking post collected.' });
  }
});

// PUT /api/posts/:id/donor-rate-ngo - Donor reviews involved NGO
router.put('/:id/donor-rate-ngo', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can submit donor-to-NGO feedback.' });
    }

    const { stars, comment, tags, isFraudReported } = req.body;
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (post.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Not the owner of this post.' });
    }

    if (!post.assignedNgo) {
      return res.status(400).json({ message: 'No NGO was involved with this post.' });
    }

    const isFraud = Boolean(isFraudReported);
    post.ratingDonorToNgo = {
      stars: Number(stars) || 5,
      comment: comment || '',
      tags: Array.isArray(tags) ? tags : [],
      isFraudReported: isFraud,
      createdAt: new Date(),
    };
    await post.save();
    await post.populate('assignedNgo', 'name email phone orgType badge rating ratingCount trustScore fraudReportsCount');

    // Update NGO User Trust Score & Fraud Counter
    const ngoUser = await User.findById(post.assignedNgo._id || post.assignedNgo);
    if (ngoUser) {
      const totalRatings = (ngoUser.ratingCount || 0) + 1;
      const newRating = ((ngoUser.rating || 5) * (ngoUser.ratingCount || 0) + Number(stars)) / totalRatings;
      ngoUser.rating = Math.round(newRating * 10) / 10;
      ngoUser.ratingCount = totalRatings;

      if (isFraud) {
        ngoUser.fraudReportsCount = (ngoUser.fraudReportsCount || 0) + 1;
        ngoUser.trustScore = Math.max(0, (ngoUser.trustScore || 98) - 25);
        if (ngoUser.trustScore < 60) ngoUser.badge = 'Member';
      } else {
        ngoUser.trustScore = Math.min(100, (ngoUser.trustScore || 98) + 1);
      }
      await ngoUser.save();
    }

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: 'donor',
      action: isFraud ? 'Reported NGO Fraud' : 'Rated NGO Partner',
      details: `${req.user.name} reviewed NGO partner: ${stars} stars.${isFraud ? ' [FRAUD FLAGGED]' : ''}`,
    });

    res.json({
      message: isFraud ? 'NGO fraud report logged for safety review.' : 'Donor feedback on NGO submitted successfully!',
      post,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error saving donor NGO feedback.' });
  }
});

// PUT /api/posts/:id/recipient-rate-ngo - Recipient reviews involved NGO
router.put('/:id/recipient-rate-ngo', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'recipient') {
      return res.status(403).json({ message: 'Only recipient care homes can submit recipient-to-NGO feedback.' });
    }

    const { stars, comment, tags, isFraudReported } = req.body;
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (post.claimedBy && post.claimedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You did not claim this post.' });
    }

    if (!post.assignedNgo) {
      return res.status(400).json({ message: 'No NGO was involved with this post.' });
    }

    const isFraud = Boolean(isFraudReported);
    post.ratingRecipientToNgo = {
      stars: Number(stars) || 5,
      comment: comment || '',
      tags: Array.isArray(tags) ? tags : [],
      isFraudReported: isFraud,
      createdAt: new Date(),
    };
    await post.save();
    await post.populate('assignedNgo', 'name email phone orgType badge rating ratingCount trustScore fraudReportsCount');

    // Update NGO User Trust Score & Fraud Counter
    const ngoUser = await User.findById(post.assignedNgo._id || post.assignedNgo);
    if (ngoUser) {
      const totalRatings = (ngoUser.ratingCount || 0) + 1;
      const newRating = ((ngoUser.rating || 5) * (ngoUser.ratingCount || 0) + Number(stars)) / totalRatings;
      ngoUser.rating = Math.round(newRating * 10) / 10;
      ngoUser.ratingCount = totalRatings;

      if (isFraud) {
        ngoUser.fraudReportsCount = (ngoUser.fraudReportsCount || 0) + 1;
        ngoUser.trustScore = Math.max(0, (ngoUser.trustScore || 98) - 25);
        if (ngoUser.trustScore < 60) ngoUser.badge = 'Member';
      } else {
        ngoUser.trustScore = Math.min(100, (ngoUser.trustScore || 98) + 1);
      }
      await ngoUser.save();
    }

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: 'recipient',
      action: isFraud ? 'Reported NGO Fraud' : 'Rated NGO Delivery',
      details: `${req.user.name} reviewed NGO delivery: ${stars} stars.${isFraud ? ' [FRAUD FLAGGED]' : ''}`,
    });

    res.json({
      message: isFraud ? 'NGO fraud report logged for safety review.' : 'Recipient feedback on NGO submitted successfully!',
      post,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error saving recipient NGO feedback.' });
  }
});

// PUT /api/posts/:id/cancel
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (post.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the post owner can cancel this post.' });
    }

    post.status = 'Cancelled';
    await post.save();

    res.json({ message: 'Post cancelled successfully.', post });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error cancelling post.' });
  }
});

export default router;
