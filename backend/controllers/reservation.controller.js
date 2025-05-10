const db = require('../config/db');

// Create a new reservation
exports.createReservation = async (req, res) => {
  const userId = req.user.id; // Get user ID from the authenticated token payload
  const { restaurant_id, reservation_date, reservation_time, people_count } = req.body;

  // Basic validation
  if (!restaurant_id || !reservation_date || !reservation_time || !people_count) {
    return res.status(400).json({ message: 'Missing required reservation details.' });
  }

  // Validate date/time format if necessary (basic check here)
  // Consider using a library like moment.js or date-fns for robust date/time handling
  if (isNaN(Date.parse(reservation_date)) || !/^\d{2}:\d{2}(:\d{2})?$/.test(reservation_time)) {
     return res.status(400).json({ message: 'Invalid date or time format.' });
  }

  // Check if people_count is a positive number
  if (parseInt(people_count, 10) <= 0) {
    return res.status(400).json({ message: 'Number of people must be positive.' });
  }

  try {
    // Optional: Check if the restaurant exists
    const [restaurants] = await db.query('SELECT restaurant_id FROM restaurants WHERE restaurant_id = ?', [restaurant_id]);
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    // Optional: Check for conflicting reservations (e.g., same restaurant, overlapping time)
    // This logic can be complex depending on desired rules.

    // Insert the reservation
    const [result] = await db.query(
      'INSERT INTO reservations (user_id, restaurant_id, reservation_date, reservation_time, people_count) VALUES (?, ?, ?, ?, ?)',
      [userId, restaurant_id, reservation_date, reservation_time, people_count]
    );

    res.status(201).json({ message: 'Reservation created successfully.', reservationId: result.insertId });

  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Server error while creating reservation.' });
  }
};

// Get reservations for the logged-in user
exports.getUserReservations = async (req, res) => {
  const userId = req.user.id;

  try {
    // Join with restaurants table to get restaurant details
    const [reservations] = await db.query(
      `SELECT 
         r.reservation_id, 
         r.reservation_date, 
         r.reservation_time, 
         r.people_count, 
         r.created_at, 
         rest.restaurant_id, 
         rest.name AS restaurant_name, 
         rest.location AS restaurant_location 
       FROM reservations r 
       JOIN restaurants rest ON r.restaurant_id = rest.restaurant_id 
       WHERE r.user_id = ? 
       ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
      [userId]
    );

    res.json(reservations);

  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ message: 'Server error while fetching reservations.' });
  }
};

// Update a specific reservation
exports.updateReservation = async (req, res) => {
  const userId = req.user.id;
  const { id: reservationId } = req.params;
  const { reservation_date, reservation_time, people_count } = req.body;

  // Basic validation (ensure at least one field is being updated)
  if (!reservation_date && !reservation_time && !people_count) {
      return res.status(400).json({ message: 'No update information provided.' });
  }

  // TODO: Add validation for date, time, people_count formats/values if they are provided

  try {
    // Check if the reservation exists and belongs to the user
    const [reservations] = await db.query(
        'SELECT user_id FROM reservations WHERE reservation_id = ?', 
        [reservationId]
    );

    if (reservations.length === 0) {
        return res.status(404).json({ message: 'Reservation not found.' });
    }

    if (reservations[0].user_id !== userId) {
        return res.status(403).json({ message: 'User not authorized to update this reservation.' }); // 403 Forbidden
    }

    // Build the update query dynamically based on provided fields
    let updateFields = [];
    let queryParams = [];

    if (reservation_date) {
        updateFields.push('reservation_date = ?');
        queryParams.push(reservation_date);
    }
    if (reservation_time) {
        updateFields.push('reservation_time = ?');
        queryParams.push(reservation_time);
    }
    if (people_count) {
        updateFields.push('people_count = ?');
        queryParams.push(people_count);
    }

    if (updateFields.length === 0) {
        // Should have been caught by initial validation, but as a safeguard
        return res.status(400).json({ message: 'No valid fields to update.' });
    }

    queryParams.push(reservationId); // Add reservationId for the WHERE clause

    const sql = `UPDATE reservations SET ${updateFields.join(', ')} WHERE reservation_id = ?`;

    const [result] = await db.query(sql, queryParams);

    if (result.affectedRows === 0) {
        // Should not happen if the initial check passed, but good to handle
        return res.status(404).json({ message: 'Reservation not found or no changes made.' });
    }

    res.json({ message: 'Reservation updated successfully.' });

  } catch (error) {
    console.error('Error updating reservation:', error);
    // Add specific error handling for invalid date/time formats if needed
    res.status(500).json({ message: 'Server error while updating reservation.' });
  }
};

// Delete a specific reservation
exports.deleteReservation = async (req, res) => {
  const userId = req.user.id;
  const { id: reservationId } = req.params;

  try {
    // Check if the reservation exists and belongs to the user
    const [reservations] = await db.query(
        'SELECT user_id FROM reservations WHERE reservation_id = ?', 
        [reservationId]
    );

    if (reservations.length === 0) {
        return res.status(404).json({ message: 'Reservation not found.' });
    }

    if (reservations[0].user_id !== userId) {
        return res.status(403).json({ message: 'User not authorized to delete this reservation.' }); // 403 Forbidden
    }

    // Delete the reservation
    const [result] = await db.query('DELETE FROM reservations WHERE reservation_id = ?', [reservationId]);

    if (result.affectedRows === 0) {
      // Should not happen normally if previous checks passed
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    res.json({ message: 'Reservation deleted successfully.' });

  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Server error while deleting reservation.' });
  }
}; 