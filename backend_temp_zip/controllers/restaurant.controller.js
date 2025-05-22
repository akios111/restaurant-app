const db = require('../config/db');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  const { name, location } = req.query; // Get search parameters from query

  try {
    let sqlQuery = 'SELECT restaurant_id, name, location, description FROM restaurants';
    const queryParams = [];
    const conditions = [];

    if (name) {
      conditions.push('name LIKE ?');
      queryParams.push(`%${name}%`);
    }

    if (location) {
      conditions.push('location LIKE ?');
      queryParams.push(`%${location}%`);
    }

    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }

    sqlQuery += ' ORDER BY name'; // Keep existing order by

    const [restaurants] = await db.query(sqlQuery, queryParams);
    
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