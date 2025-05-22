        -- Ensure you are using the correct database (optional if already connected to it)
        -- USE mydatabase;

        -- Create the Users table
        CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL, -- Store hashed passwords, not plain text!
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create the Restaurants table
        CREATE TABLE IF NOT EXISTS restaurants (
            restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create the Reservations table
        CREATE TABLE IF NOT EXISTS reservations (
            reservation_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            restaurant_id INT NOT NULL,
            reservation_date DATE NOT NULL,
            reservation_time TIME NOT NULL,
            people_count INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
        );

        -- Optional: Add indexes for performance
        ALTER TABLE users ADD INDEX idx_email (email);
        ALTER TABLE restaurants ADD INDEX idx_name (name);
        ALTER TABLE restaurants ADD INDEX idx_location (location);
        ALTER TABLE reservations ADD INDEX idx_user_reservations (user_id, reservation_date);
        ALTER TABLE reservations ADD INDEX idx_restaurant_reservations (restaurant_id, reservation_date);