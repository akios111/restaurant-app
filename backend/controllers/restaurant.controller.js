const db = require('../config/db');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  // TODO: Implement search by name or location based on query parameters (req.query)
  // const { location, name } = req.query;

  try {
    const [restaurants] = await db.query('SELECT restaurant_id, name, location, description FROM restaurants ORDER BY name');
    
    res.json(restaurants);

  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ message: 'Server error while fetching restaurants.' });
  }
};

// TODO: Implement getRestaurantById if needed
/*
exports.getRestaurantById = async (req, res) => {
  const { id } = req.params;
  try {
    const [restaurants] = await db.query('SELECT restaurant_id, name, location, description FROM restaurants WHERE restaurant_id = ?', [id]);
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }
    res.json(restaurants[0]);
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    res.status(500).json({ message: 'Server error while fetching restaurant.' });
  }
};
*/

// TODO: Implement createRestaurant if needed (likely requires admin privileges)
/*
exports.createRestaurant = async (req, res) => {
  // ... implementation ...
};
*/ 