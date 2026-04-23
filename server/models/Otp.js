const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index — auto-deletes expired docs
  },
  bookingId: {
    type: String,
    default: null,
    index: true,
  },
  purpose: {
    type: String,
    enum: ['login', 'worker_verification'],
    default: 'login',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Otp', otpSchema)
