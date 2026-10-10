import express from 'express';
import FoodPost from '../models/FoodPost.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { runSeedScript } from '../seed.js';

const router = express.Router();

// POST /api/monitoring/seed - Re-seed database with all 3 role accounts
router.post('/seed', async (req, res) => {
  try {
    await runSeedScript();
    res.json({ message: 'Database reset & re-seeded with donor, recipient, and NGO users!' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error seeding database.' });
  }
});

// GET /api/monitoring - Clean analytics & monitoring data for NGO
router.get('/', async (req, res) => {
  try {
    const postsRaw = await FoodPost.find()
      .populate('donor', 'name email phone orgType rating badge')
      .populate('claimedBy', 'name email phone orgType')
      .sort({ createdAt: -1 });

    const donations = postsRaw.map(p => ({
      _id: p._id,
      donorName: p.donor ? p.donor.name : 'Unknown Donor',
      donorCategory: p.donor ? p.donor.orgType : 'Restaurant',
      itemsFormatted: p.items.map(i => `${i.name} - ${i.quantity} ${i.unit}`).join(', '),
      totalWeightKg: p.totalWeightKg,
      estimatedMeals: p.estimatedMeals,
      preparedAt: p.preparedAt,
      expiresAt: p.expiresAt,
      riskLevel: p.riskLevel,
      status: p.status,
      claimedBy: p.claimedBy ? p.claimedBy.name : 'Unclaimed',
      claimedAt: p.claimedAt,
      collectedAt: p.collectedAt,
      createdAt: p.createdAt,
      rating: p.ratingFromRecipient || null,
    }));

    const ratedPosts = postsRaw.filter(p => p.ratingFromRecipient && p.ratingFromRecipient.stars > 0);
    const totalStars = ratedPosts.reduce((acc, p) => acc + p.ratingFromRecipient.stars, 0);
    const avgRating = ratedPosts.length > 0 ? Math.round((totalStars / ratedPosts.length) * 10) / 10 : 4.8;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratedPosts.forEach(p => {
      const s = p.ratingFromRecipient.stars;
      if (distribution[s] !== undefined) distribution[s]++;
    });

    const latestFeedback = ratedPosts.map(p => ({
      postId: p._id,
      postTitle: p.title,
      donorName: p.donor ? p.donor.name : 'Donor',
      recipientName: p.claimedBy ? p.claimedBy.name : 'Recipient',
      stars: p.ratingFromRecipient.stars,
      comment: p.ratingFromRecipient.comment,
      tags: p.ratingFromRecipient.tags || [],
      date: p.ratingFromRecipient.createdAt || p.updatedAt,
    }));

    const totalDonations = postsRaw.length;
    const activePostsCount = postsRaw.filter(p => p.status === 'Posted').length;
    const claimedCount = postsRaw.filter(p => p.status === 'Claimed').length;
    const collectedCount = postsRaw.filter(p => p.status === 'Collected').length;
    
    const donorCount = await User.countDocuments({ role: 'donor' });
    const recipientCount = await User.countDocuments({ role: 'recipient' });

    const totalKgRescued = postsRaw.reduce((acc, p) => acc + (p.totalWeightKg || 0), 0);
    const totalMealsServed = postsRaw.reduce((acc, p) => acc + (p.estimatedMeals || 0), 0);

    const recentLogs = await ActivityLog.find().sort({ createdAt: -1 }).limit(15);

    res.json({
      overview: {
        totalDonations,
        activePostsCount,
        claimedCount,
        collectedCount,
        donorCount,
        recipientCount,
        totalKgRescued: Math.round(totalKgRescued * 10) / 10,
        totalMealsServed,
        avgRating,
      },
      donations,
      satisfaction: {
        avgRating,
        totalReviews: ratedPosts.length,
        distribution,
        latestFeedback,
      },
      recentLogs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching monitoring analytics.' });
  }
});

export default router;
