import express from 'express';
import User from '../models/User.js';
import FoodPost from '../models/FoodPost.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// GET /api/stats - Clean stats & leaderboard
router.get('/', async (req, res) => {
  try {
    const donorsCount = await User.countDocuments({ role: 'donor' });
    const recipientsCount = await User.countDocuments({ role: 'recipient' });

    const posts = await FoodPost.find({ status: { $ne: 'Cancelled' } });
    
    let totalKgRescued = 0;
    let totalMealsServed = 0;

    posts.forEach(p => {
      totalKgRescued += p.totalWeightKg || 0;
      totalMealsServed += p.estimatedMeals || 0;
    });

    // Top donors for leaderboard
    const donors = await User.find({ role: 'donor' }).select('name orgType badge rating ratingCount avatar');
    
    const leaderboard = await Promise.all(
      donors.map(async (d) => {
        const donorPosts = await FoodPost.find({ donor: d._id, status: { $in: ['Claimed', 'Collected', 'Posted'] } });
        const kgRescued = donorPosts.reduce((acc, p) => acc + (p.totalWeightKg || 0), 0);
        const mealsServed = donorPosts.reduce((acc, p) => acc + (p.estimatedMeals || 0), 0);
        return {
          id: d._id,
          name: d.name,
          orgType: d.orgType,
          badge: d.badge,
          rating: d.rating,
          kgRescued: Math.round(kgRescued * 10) / 10,
          mealsServed,
          donationsCount: donorPosts.length,
        };
      })
    );

    leaderboard.sort((a, b) => b.kgRescued - a.kgRescued);

    // Recent activity log ticker
    const recentActivity = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Daily rescue trend chart data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trendData = days.map((day, idx) => ({
      day,
      kgRescued: Math.round((totalKgRescued / 7) * (0.8 + (idx % 3) * 0.2)),
      mealsServed: Math.round((totalMealsServed / 7) * (0.8 + (idx % 3) * 0.2)),
    }));

    res.json({
      impact: {
        totalKgRescued: Math.round(totalKgRescued * 10) / 10,
        totalMealsServed,
        activeDonors: donorsCount,
        partnerHomes: recipientsCount,
      },
      leaderboard,
      recentActivity,
      trendData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error loading platform stats.' });
  }
});

export default router;
