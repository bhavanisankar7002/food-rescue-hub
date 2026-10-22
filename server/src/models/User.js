import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization or User Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['donor', 'recipient', 'ngo'],
      required: true,
    },
    orgType: {
      type: String,
      default: 'Restaurant', // Restaurant, Hostel/PG, Bakery, Banquet, Old Age Home, Shelter, NGO
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    address: {
      type: String,
      default: '123 Community Hub, Metro Area',
    },
    coordinates: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
    },
    avatar: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      enum: ['Gold', 'Silver', 'Bronze', 'Member', 'Verified NGO', 'Trusted Partner'],
      default: 'Bronze',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    ratingCount: {
      type: Number,
      default: 12,
    },
    trustScore: {
      type: Number,
      default: 98,
    },
    fraudReportsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Password hash middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
