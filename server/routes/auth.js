const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { createProfile, getMyProfile } = require('../controllers/authController')

router.post('/profile', protect, createProfile)
router.get('/me', protect, getMyProfile)

module.exports = router