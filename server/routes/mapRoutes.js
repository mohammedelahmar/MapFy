const express = require('express');
const router = express.Router();
// Fix the auth import to use the correct property
const { protect } = require('../middleware/authMiddleware');
const mapController = require('../controllers/mapController');

// Change 'auth' to 'protect' in all routes
router.get('/', protect, mapController.getMaps);
router.get('/:id', protect, mapController.getMapById);
router.post('/', protect, mapController.createMap);
router.put('/:id', protect, mapController.updateMap);
router.delete('/:id', protect, mapController.deleteMap);

module.exports = router;