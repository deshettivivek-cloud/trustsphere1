const express = require('express')
const router = express.Router()
const { sendOtp, verifyOtp, sendWorkerVerificationOtp, verifyWorkerOtp } = require('../controllers/otpController')

// POST /api/otp/send — send OTP to phone number
router.post('/send', sendOtp)

// POST /api/otp/verify — verify OTP and get auth token
router.post('/verify', verifyOtp)

// POST /api/otp/worker-verify/send — send OTP to worker for on-site verification
router.post('/worker-verify/send', sendWorkerVerificationOtp)

// POST /api/otp/worker-verify/confirm — verify worker OTP and mark booking verified
router.post('/worker-verify/confirm', verifyWorkerOtp)

module.exports = router
