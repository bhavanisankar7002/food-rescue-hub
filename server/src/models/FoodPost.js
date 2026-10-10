import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' }, // kg, L, portions, boxes
  category: { type: String, default: 'Cooked Meal' }, // Cooked Meal, Bakery, Raw/Groceries, Dairy, Beverages
});

const foodPostSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [foodItemSchema],
    title: {
      type: String,
      default: function () {
        if (this.items && this.items.length > 0) {
          return this.items.map(i => `${i.name} - ${i.quantity} ${i.unit}`).join(', ');
        }
        return 'Surplus Food Donation';
      },
    },
    totalWeightKg: {
      type: Number,
      default: 5,
    },
    estimatedMeals: {
      type: Number,
      default: 12,
    },
    preparedAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    qualityChecked: {
      type: Boolean,
      default: true,
    },
    storageTempNotes: {
      type: String,
      default: 'Kept insulated at > 60°C hot hold',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    dietaryType: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Vegan'],
      default: 'Veg',
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    riskReason: {
      type: String,
      default: 'Freshly prepared within 2 hours',
    },
    status: {
      type: String,
      enum: ['Posted', 'Claimed', 'Collected', 'Expired', 'Cancelled'],
      default: 'Posted',
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    collectedAt: {
      type: Date,
      default: null,
    },
    pickupAddress: {
      type: String,
      default: '',
    },
    ratingFromRecipient: {
      stars: { type: Number, default: 0 },
      comment: { type: String, default: '' },
      tags: [{ type: String }],
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.model('FoodPost', foodPostSchema);
