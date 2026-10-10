import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import FoodPost from './models/FoodPost.js';
import Notification from './models/Notification.js';
import ActivityLog from './models/ActivityLog.js';
import { connectDB } from './config/db.js';

dotenv.config();

export const runSeedScript = async () => {
  console.log('[Seed] Clearing existing database collections...');
  await User.deleteMany({});
  await FoodPost.deleteMany({});
  await Notification.deleteMany({});
  await ActivityLog.deleteMany({});

  console.log('[Seed] Creating demo users (Donor, Recipient, NGO)...');

  const donor1 = await User.create({
    name: 'GreenBite Eatery',
    email: 'donor@zerowaste.org',
    password: 'password123',
    role: 'donor',
    orgType: 'Restaurant',
    phone: '+91 98765 11111',
    address: '45 Food Street, Koramangala, Bengaluru',
    badge: 'Gold',
    rating: 4.9,
    ratingCount: 34,
    coordinates: { lat: 12.9352, lng: 77.6245 },
  });

  const donor2 = await User.create({
    name: 'Sunrise Hostels & Mess',
    email: 'donor2@zerowaste.org',
    password: 'password123',
    role: 'donor',
    orgType: 'Hostel/PG',
    phone: '+91 98765 22222',
    address: '12 Campus Enclave, Indiranagar, Bengaluru',
    badge: 'Silver',
    rating: 4.7,
    ratingCount: 18,
    coordinates: { lat: 12.9784, lng: 77.6408 },
  });

  const recipient1 = await User.create({
    name: 'Hope Haven Shelter',
    email: 'recipient@zerowaste.org',
    password: 'password123',
    role: 'recipient',
    orgType: 'Shelter',
    phone: '+91 98765 33333',
    address: '88 Care Lane, MG Road, Bengaluru',
    coordinates: { lat: 12.9716, lng: 77.5946 },
  });

  const recipient2 = await User.create({
    name: 'Grace Old Age Care Home',
    email: 'recipient2@zerowaste.org',
    password: 'password123',
    role: 'recipient',
    orgType: 'Old Age Home',
    phone: '+91 98765 44444',
    address: '101 Peace Avenue, Whitefield, Bengaluru',
    coordinates: { lat: 12.9698, lng: 77.7500 },
  });

  const ngoUser = await User.create({
    name: 'City Food Rescue NGO',
    email: 'ngo@zerowaste.org',
    password: 'password123',
    role: 'ngo',
    orgType: 'NGO',
    phone: '+91 98765 55555',
    address: '50 NGO Tower, Central District, Bengaluru',
    coordinates: { lat: 12.9750, lng: 77.6000 },
  });

  console.log('[Seed] Creating sample food posts...');

  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  // Post 1: Low Risk (Fresh Basmati Rice & Dal)
  const post1 = await FoodPost.create({
    donor: donor1._id,
    items: [
      { name: 'Steamed Basmati Rice', quantity: 15, unit: 'kg', category: 'Cooked Meal' },
      { name: 'Yellow Dal Tadka', quantity: 10, unit: 'L', category: 'Cooked Meal' },
    ],
    totalWeightKg: 25,
    estimatedMeals: 60,
    preparedAt: new Date(now - 1.5 * ONE_HOUR),
    expiresAt: new Date(now + 4.5 * ONE_HOUR),
    qualityChecked: true,
    storageTempNotes: 'Maintained at 65°C hot-hold condition',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop',
    dietaryType: 'Veg',
    riskLevel: 'Low',
    riskReason: 'Freshly prepared 1.5 hrs ago with thermal preservation',
    status: 'Posted',
    pickupAddress: donor1.address,
  });

  // Post 2: Medium Risk (Veg Biryani & Salads)
  const post2 = await FoodPost.create({
    donor: donor2._id,
    items: [
      { name: 'Hyderabadi Veg Biryani', quantity: 12, unit: 'kg', category: 'Cooked Meal' },
      { name: 'Cucumber Raita', quantity: 5, unit: 'L', category: 'Cooked Meal' },
    ],
    totalWeightKg: 17,
    estimatedMeals: 40,
    preparedAt: new Date(now - 3.5 * ONE_HOUR),
    expiresAt: new Date(now + 2 * ONE_HOUR),
    qualityChecked: true,
    storageTempNotes: 'Packed in food-grade foil trays',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop',
    dietaryType: 'Veg',
    riskLevel: 'Medium',
    riskReason: 'Prepared 3.5 hrs ago. Recommended for prompt distribution within 2 hours.',
    status: 'Posted',
    pickupAddress: donor2.address,
  });

  // Post 3: Claimed Post
  const post3 = await FoodPost.create({
    donor: donor1._id,
    items: [
      { name: 'Artisanal Bakery Breads & Muffins', quantity: 30, unit: 'portions', category: 'Bakery' },
    ],
    totalWeightKg: 10.5,
    estimatedMeals: 30,
    preparedAt: new Date(now - 2 * ONE_HOUR),
    expiresAt: new Date(now + 6 * ONE_HOUR),
    qualityChecked: true,
    storageTempNotes: 'Stored in clean bakery display crates',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
    dietaryType: 'Veg',
    riskLevel: 'Low',
    riskReason: 'Baked earlier today',
    status: 'Claimed',
    claimedBy: recipient1._id,
    claimedAt: new Date(now - 30 * 60 * 1000),
    pickupAddress: donor1.address,
  });

  // Post 4: Collected & Rated Post
  const post4 = await FoodPost.create({
    donor: donor2._id,
    items: [
      { name: 'Mixed Vegetable Curry & Chapati', quantity: 20, unit: 'portions', category: 'Cooked Meal' },
    ],
    totalWeightKg: 14,
    estimatedMeals: 20,
    preparedAt: new Date(now - 24 * ONE_HOUR),
    expiresAt: new Date(now - 18 * ONE_HOUR),
    qualityChecked: true,
    storageTempNotes: 'Hygiene check passed',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop',
    dietaryType: 'Veg',
    riskLevel: 'Low',
    riskReason: 'Freshly served yesterday',
    status: 'Collected',
    claimedBy: recipient2._id,
    claimedAt: new Date(now - 22 * ONE_HOUR),
    collectedAt: new Date(now - 20 * ONE_HOUR),
    pickupAddress: donor2.address,
    ratingFromRecipient: {
      stars: 5,
      comment: 'Excellent food quality and very polite staff at donor location. Beneficiaries loved it!',
      tags: ['Fresh & Hot', 'Punctual Pickup', 'Hygienic Packaging'],
      createdAt: new Date(now - 20 * ONE_HOUR),
    },
  });

  console.log('[Seed] Creating notifications for recipients only...');

  // Notifications target recipient users ONLY
  await Notification.create({
    recipient: recipient1._id,
    donor: donor1._id,
    post: post1._id,
    title: '🍎 New Surplus Food Available!',
    message: 'GreenBite Eatery posted Steamed Basmati Rice & Yellow Dal Tadka (25 kg, 60 meals). Claim now!',
    type: 'new_post',
    isRead: false,
  });

  await Notification.create({
    recipient: recipient2._id,
    donor: donor2._id,
    post: post2._id,
    title: '🍎 New Surplus Food Available!',
    message: 'Sunrise Hostels posted Hyderabadi Veg Biryani (17 kg, 40 meals). Claim now!',
    type: 'new_post',
    isRead: false,
  });

  await ActivityLog.create({
    user: donor1._id,
    userName: donor1.name,
    userRole: 'donor',
    action: 'Posted Food Surplus',
    details: `Posted Steamed Basmati Rice & Dal (25 kg, 60 meals).`,
  });

  await ActivityLog.create({
    user: recipient1._id,
    userName: recipient1.name,
    userRole: 'recipient',
    action: 'Claimed Food Donation',
    details: `Claimed Artisanal Bakery Breads (10.5 kg) from GreenBite Eatery.`,
  });

  console.log('[Seed] Database successfully populated with fresh demo data!');
};

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  (async () => {
    await connectDB();
    await runSeedScript();
    process.exit(0);
  })();
}
