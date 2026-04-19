const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getAllWorkers,
  getWorkerById,
  updateWorkerProfile,
  toggleAvailability
} = require('../controllers/workerController')

router.get('/', getAllWorkers)
router.get('/:id', getWorkerById)
router.put('/profile', protect, updateWorkerProfile)
router.patch('/availability', protect, toggleAvailability)

module.exports = router