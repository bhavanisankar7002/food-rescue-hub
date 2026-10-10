import express from 'express';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications - Fetch user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Find notifications specifically for this user OR general broadcast (recipient is null)
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipient: null }],
    })
      .populate('donor', 'name orgType phone')
      .populate('post', 'title totalWeightKg riskLevel')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching notifications.' });
  }
});

// PUT /api/notifications/mark-read - Mark all or specific notification as read
router.put('/mark-read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    } else {
      await Notification.updateMany(
        { $or: [{ recipient: req.user._id }, { recipient: null }] },
        { isRead: true }
      );
    }
    res.json({ message: 'Notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error updating notifications.' });
  }
});

export default router;
