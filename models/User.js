
const bcrypt = require('bcrypt');
const { boolean } = require('joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const user = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      unique: true,
      required: true
    },

    password: {
      type: String,
      required: true
    },

    language: {
      type: String,
      default: 'en'
    },

    resetPasswordOtp: {
      type: String
    },

    isSuspend: {
      type: Boolean,
      default: false
    },

    referralCode: {
      type: String
    },

    availReferralCode: {
      type: String
    },

    referralBenefits: {
      type: Boolean,
      default: null
    },

    referralBenefitsEndDate: {
      type: Date,
      default: null
    },

    subscriptionId: {
      type: String
    },

    planId: {
      type: String,
      default: null
    },

    subscriptionStatus: {
      type: String
    },

    subscriptionCreatedAt: {
      type: Date,
      default: null
    },

    subscriptionPlatform: {
      type: String,
      default: null
    },

    availFreeSubscription: {
      type: Boolean,
      defaut: null
    },
    profilepic: {
      type: String
    },

    accessToken: {
      type: String
    },

    refreshToken: {
      type: String
    },

    googleId: {
      type: String
    },

    usedStorage: {
      type: Number,
      default: 0
    },

    storageLimit: {
      type: Number,
      default: 0
    },

    researcher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'reserchers',
      default: null
    },

    notifications: {
      all: [{ type: mongoose.Schema.Types.ObjectId, ref: 'notifications' }],
      read: [{ type: mongoose.Schema.Types.ObjectId, ref: 'notifications' }],
      unread: [{ type: mongoose.Schema.Types.ObjectId, ref: 'notifications' }]
    },

    storageNotificationThresholds: {
      type: [Number],
      default: []
    },

    trialExpiryNotification: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving user (pre middleware)
user.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password with hashed version
user.methods.comparePassword = function (password) {
  console.log(password, this.password);
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('users', user);
