const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
// const authMiddleware = require('../middleware/authMiddleware'); // TODO: Add auth middleware if needed

// GET /api/restaurants - Get all restaurants (publicly accessible for now)
// TODO: Add search/filtering capabilities later (e.g., /api/restaurants?location=...) 
router.get('/', restaurantController.getAllRestaurants);

// GET /api/restaurants/:id - Get a specific restaurant by ID (optional)
// router.get('/:id', restaurantController.getRestaurantById);

// POST /api/restaurants - Add a new restaurant (potentially admin-only)
// router.post('/', authMiddleware, restaurantController.createRestaurant); 

module.exports = router; 