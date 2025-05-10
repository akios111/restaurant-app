const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const authMiddleware = require('../middleware/auth.middleware');

// --- Protected Routes (require authentication) ---

// POST /api/reservations - Create a new reservation
router.post('/', authMiddleware, reservationController.createReservation);

// GET /api/reservations/my - Get reservations for the logged-in user
// Note: Using a specific path like /my avoids conflict with potential /:id route
router.get('/my', authMiddleware, reservationController.getUserReservations);

// PUT /api/reservations/:id - Update a specific reservation
router.put('/:id', authMiddleware, reservationController.updateReservation);

// DELETE /api/reservations/:id - Delete a specific reservation
router.delete('/:id', authMiddleware, reservationController.deleteReservation);


// --- Potentially Public/Admin Routes (Example) ---
// GET /api/reservations - Get all reservations (maybe admin only?)
// router.get('/', authMiddleware, /* checkAdminRoleMiddleware, */ reservationController.getAllReservations); 

// GET /api/reservations/:id - Get specific reservation details (maybe admin/owner only?)
// router.get('/:id', authMiddleware, reservationController.getReservationById);


module.exports = router; 