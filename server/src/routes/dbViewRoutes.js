import express from 'express';
import User from '../models/User.js';
import FoodPost from '../models/FoodPost.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { runSeedScript } from '../seed.js';

const router = express.Router();

// GET /api/db-view - Raw database state for showcase page
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const postsRaw = await FoodPost.find()
      .populate('donor', 'name email phone orgType')
      .populate('claimedBy', 'name email phone orgType')
      .sort({ createdAt: -1 });

    const formattedPosts = postsRaw.map(p => ({
      _id: p._id,
      donorName: p.donor ? p.donor.name : 'Unknown Donor',
      itemsFormatted: p.items.map(i => `${i.name} - ${i.quantity} ${i.unit}`).join(', '),
      totalWeightKg: p.totalWeightKg,
      estimatedMeals: p.estimatedMeals,
      preparedAt: p.preparedAt,
      expiresAt: p.expiresAt,
      riskLevel: p.riskLevel,
      status: p.status,
      claimedBy: p.claimedBy ? p.claimedBy.name : 'Unclaimed',
      createdAt: p.createdAt,
    }));

    const notifications = await Notification.find()
      .populate('donor', 'name')
      .populate('recipient', 'name')
      .sort({ createdAt: -1 })
      .limit(25);

    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      summary: {
        usersCount: users.length,
        postsCount: formattedPosts.length,
        notificationsCount: notifications.length,
        logsCount: logs.length,
      },
      users,
      foodPosts: formattedPosts,
      notifications,
      activityLogs: logs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error loading database view.' });
  }
});

// POST /api/db-view/seed - 1-Click Re-seed DB for Evaluators
router.post('/seed', async (req, res) => {
  try {
    await runSeedScript();
    res.json({ message: 'Database reset & re-seeded with fresh sample data successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error seeding database.' });
  }
});

// POST /api/db-view/simulate-post - Simulated live donor post for evaluators
router.post('/simulate-post', async (req, res) => {
  try {
    const donor = await User.findOne({ role: 'donor' });
    if (!donor) return res.status(400).json({ message: 'No donor user found to post.' });

    const sampleFoods = [
      { name: 'Paneer Butter Masala', quantity: 8, unit: 'L', category: 'Cooked Meal' },
      { name: 'Jeera Rice', quantity: 12, unit: 'kg', category: 'Cooked Meal' },
      { name: 'Fresh Fruit Custard', quantity: 15, unit: 'portions', category: 'Bakery' },
      { name: 'Whole Wheat Roti', quantity: 40, unit: 'portions', category: 'Cooked Meal' },
    ];

    const randomItem = sampleFoods[Math.floor(Math.random() * sampleFoods.length)];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hrs expiry

    const newPost = new FoodPost({
      donor: donor._id,
      items: [randomItem],
      totalWeightKg: 8.5,
      estimatedMeals: 20,
      co2SavedKg: 21.25,
      preparedAt: now,
      expiresAt,
      qualityChecked: true,
      storageTempNotes: 'Kept hot in thermal container at 65°C',
      dietaryType: 'Veg',
      riskLevel: 'Low',
      riskReason: 'Freshly prepared within 30 minutes',
      status: 'Posted',
      pickupAddress: donor.address,
    });

    await newPost.save();

    // Broadcast notification
    const recipients = await User.find({ role: 'recipient' });
    await Notification.insertMany(
      recipients.map(r => ({
        recipient: r._id,
        donor: donor._id,
        post: newPost._id,
        title: '⚡ LIVE DEMO: New Food Posted!',
        message: `${donor.name} posted ${newPost.title} (${newPost.totalWeightKg} kg). Evaluator simulation.`,
        type: 'new_post',
      }))
    );

    await ActivityLog.create({
      user: donor._id,
      userName: donor.name,
      userRole: 'donor',
      action: 'Simulated Demo Post',
      details: `Live evaluation test: Posted ${newPost.title}`,
    });

    res.status(201).json({
      message: 'Simulated donor post created live!',
      post: newPost,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error simulating post.' });
  }
});

// POST /api/db-view/simulate-claim - Simulated claim for evaluators
router.post('/simulate-claim', async (req, res) => {
  try {
    const post = await FoodPost.findOne({ status: 'Posted' });
    const recipient = await User.findOne({ role: 'recipient' });

    if (!post || !recipient) {
      return res.status(400).json({ message: 'Need at least one uncollected post and recipient user.' });
    }

    post.status = 'Claimed';
    post.claimedBy = recipient._id;
    post.claimedAt = new Date();
    await post.save();

    await Notification.create({
      recipient: post.donor,
      donor: recipient._id,
      post: post._id,
      title: '⚡ LIVE DEMO: Food Claimed!',
      message: `${recipient.name} claimed "${post.title}". Evaluator simulation test.`,
      type: 'claim_update',
    });

    await ActivityLog.create({
      user: recipient._id,
      userName: recipient.name,
      userRole: 'recipient',
      action: 'Simulated Demo Claim',
      details: `Live evaluation test: Claimed "${post.title}"`,
    });

    res.json({ message: `Simulated claim on "${post.title}" by ${recipient.name}!`, post });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error simulating claim.' });
  }
});

export default router;
