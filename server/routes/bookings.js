const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { createBooking, getMyBookings, updateBookingStatus } = require('../controllers/bookingController')

router.post('/', protect, createBooking)
router.get('/', protect, getMyBookings)
router.patch('/:id/status', protect, updateBookingStatus)

module.exports = router