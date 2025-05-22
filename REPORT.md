# Αναφορά Υλοποίησης Εφαρμογής Κρατήσεων Εστιατορίων

## 1. Εισαγωγή

Η παρούσα εργασία αφορά την ανάπτυξη μιας ολοκληρωμένης εφαρμογής για κινητά τηλέφωνα που επιτρέπει στους χρήστες να πραγματοποιούν κρατήσεις τραπεζιών σε εστιατόρια. Στόχος είναι η δημιουργία ενός κατανεμημένου συστήματος που συνδυάζει τεχνολογίες frontend (React Native), backend (Node.js/Express) και βάσης δεδομένων (MariaDB).

Η εφαρμογή επιτρέπει στους χρήστες να εγγραφούν, να συνδεθούν, να περιηγηθούν σε διαθέσιμα εστιατόρια, να πραγματοποιήσουν κρατήσεις και να διαχειριστούν το ιστορικό των κρατήσεών τους.

**Κατάσταση Υλοποίησης (Frontend):**
*   **Επιτυχής αρχικοποίηση project με React Native v0.79.2.**
*   **Οθόνες:**
    *   `LoginScreen.tsx`: Πλήρως λειτουργική (UI, κλήση API, αποθήκευση token).
    *   `RegisterScreen.tsx`: Πλήρως λειτουργική (UI, κλήση API).
    *   `HomeScreen.tsx`: Βασική δομή με πλοήγηση στις κύριες ενότητες.
    *   `RestaurantListScreen.tsx`: Εμφανίζει λίστα εστιατορίων από το backend, περιλαμβάνει αναζήτηση και pull-to-refresh.
    *   `ProfileScreen.tsx`: Βασική δομή (placeholder).
*   **Navigation:** Υλοποιημένη βασική πλοήγηση μεταξύ των παραπάνω οθονών με React Navigation (Native Stack).

## 2. Αρχιτεκτονική Συστήματος

Η αρχιτεκτονική της εφαρμογής ακολουθεί ένα τυπικό μοντέλο Client-Server:

*   **Frontend (Client):** Μια εφαρμογή React Native για κινητά (Android/iOS) που παρέχει το περιβάλλον χρήστη (UI/UX) και αλληλεπιδρά με το backend μέσω HTTP αιτημάτων (REST API).
*   **Backend (Server):** Ένας Node.js server που χρησιμοποιεί το Express framework για τη δημιουργία ενός REST API. Είναι υπεύθυνος για την επιχειρηματική λογική, την αυθεντικοποίηση χρηστών και την επικοινωνία με τη βάση δεδομένων.
*   **Database:** Μια σχεσιακή βάση δεδομένων MariaDB που αποθηκεύει τα δεδομένα της εφαρμογής (χρήστες, εστιατόρια, κρατήσεις).

```mermaid
graph TD
    A[React Native Frontend] -- HTTP Requests --> B(Node.js/Express Backend API);
    B -- SQL Queries --> C[(MariaDB Database)];
    C -- Results --> B;
    B -- JSON Responses --> A;
```

## 3. Backend (Node.js & Express)

Το backend υλοποιήθηκε με Node.js και το framework Express. Ακολουθείται μια δομή διαχωρισμού αρμοδιοτήτων (separation of concerns) με φακέλους για:
*   `config`: Ρυθμίσεις (π.χ., σύνδεση βάσης δεδομένων `db.js`).
*   `routes`: Ορισμός των διαδρομών του API (`auth.routes.js`, `restaurant.routes.js`, `reservation.routes.js`).
*   `controllers`: Η λογική επεξεργασίας των αιτημάτων για κάθε διαδρομή (`auth.controller.js`, `restaurant.controller.js`, `reservation.controller.js`).
*   `middleware`: Ενδιάμεση λογική, όπως ο έλεγχος αυθεντικοποίησης (`auth.middleware.js`).

### 3.1 Middleware

*   **JWT Authentication (`middleware/auth.middleware.js`):**
    *   Αυτό το middleware χρησιμοποιείται για την προστασία συγκεκριμένων διαδρομών του API.
    *   Ελέγχει την ύπαρξη και την εγκυρότητα ενός JSON Web Token (JWT) στην κεφαλίδα `Authorization` του αιτήματος (με μορφή `Bearer <token>`).
    *   Χρησιμοποιεί το `JWT_SECRET` από το αρχείο `.env` για την επαλήθευση της υπογραφής του token.
    *   Αν το token είναι έγκυρο, αποκωδικοποιεί το payload (που περιέχει πληροφορίες χρήστη, π.χ., `user_id`) και το επισυνάπτει στο αντικείμενο `req` (`req.user`), επιτρέποντας την πρόσβαση στην προστατευμένη διαδρομή.
    *   Σε περίπτωση μη έγκυρου ή ανύπαρκτου token, επιστρέφει σφάλμα `401 Unauthorized`.

### 3.2 REST API Endpoints

Παρακάτω περιγράφονται τα βασικά endpoints του API που υλοποιήθηκαν:

**Α. Authentication Routes (`routes/auth.routes.js`)**

1.  **Εγγραφή Χρήστη**
    *   **Method:** `POST`
    *   **Path:** `/api/auth/register`
    *   **Purpose:** Δημιουργία νέου λογαριασμού χρήστη.
    *   **Authentication:** Όχι
    *   **Request Body (JSON):**
        ```json
        {
          "name": "string",
          "email": "string (valid email format)",
          "password": "string (min length recommended)"
        }
        ```
    *   **Success Response (201 Created):**
        ```json
        {
          "message": "User registered successfully.",
          "userId": number 
        }
        ```
    *   **Error Responses:**
        *   `400 Bad Request`: Missing fields, invalid email/password format.
        *   `409 Conflict`: Email already exists.
        *   `500 Internal Server Error`: Database or other server error.

2.  **Σύνδεση Χρήστη**
    *   **Method:** `POST`
    *   **Path:** `/api/auth/login`
    *   **Purpose:** Αυθεντικοποίηση χρήστη και επιστροφή JWT token.
    *   **Authentication:** Όχι
    *   **Request Body (JSON):**
        ```json
        {
          "email": "string",
          "password": "string"
        }
        ```
    *   **Success Response (200 OK):**
        ```json
        {
          "token": "string (JWT token)"
        }
        ```
    *   **Error Responses:**
        *   `400 Bad Request`: Missing fields.
        *   `401 Unauthorized`: Invalid credentials.
        *   `500 Internal Server Error`: Server error during login/token generation.

**Β. Restaurant Routes (`routes/restaurant.routes.js`)**

1.  **Λήψη Λίστας Εστιατορίων**
    *   **Method:** `GET`
    *   **Path:** `/api/restaurants`
    *   **Purpose:** Επιστροφή λίστας όλων των διαθέσιμων εστιατορίων.
    *   **Authentication:** Όχι (προς το παρόν)
    *   **Request Body:** N/A
    *   **Query Parameters (Future):** `?name=...`, `?location=...` για αναζήτηση.
    *   **Success Response (200 OK):**
        ```json
        [
          {
            "restaurant_id": number,
            "name": "string",
            "location": "string",
            "description": "string or null"
          },
          // ... more restaurants
        ]
        ```
    *   **Error Responses:**
        *   `500 Internal Server Error`: Database error.

**Γ. Reservation Routes (`routes/reservation.routes.js`)**

1.  **Δημιουργία Κράτησης**
    *   **Method:** `POST`
    *   **Path:** `/api/reservations`
    *   **Purpose:** Καταχώρηση νέας κράτησης για τον συνδεδεμένο χρήστη.
    *   **Authentication:** Ναι (JWT required)
    *   **Request Body (JSON):**
        ```json
        {
          "restaurant_id": number,
          "reservation_date": "string (YYYY-MM-DD)",
          "reservation_time": "string (HH:MM or HH:MM:SS)",
          "people_count": number (positive integer)
        }
        ```
    *   **Success Response (201 Created):**
        ```json
        {
          "message": "Reservation created successfully.",
          "reservationId": number
        }
        ```
    *   **Error Responses:**
        *   `400 Bad Request`: Missing fields, invalid data format.
        *   `401 Unauthorized`: Missing or invalid JWT.
        *   `404 Not Found`: Restaurant not found.
        *   `500 Internal Server Error`: Database error.

2.  **Λήψη Κρατήσεων Χρήστη**
    *   **Method:** `GET`
    *   **Path:** `/api/reservations/my`
    *   **Purpose:** Επιστροφή λίστας κρατήσεων για τον τρέχοντα συνδεδεμένο χρήστη.
    *   **Authentication:** Ναι (JWT required)
    *   **Request Body:** N/A
    *   **Success Response (200 OK):**
        ```json
        [
          {
            "reservation_id": number,
            "reservation_date": "string (YYYY-MM-DD)",
            "reservation_time": "string (HH:MM:SS)",
            "people_count": number,
            "created_at": "string (timestamp)",
            "restaurant_id": number,
            "restaurant_name": "string",
            "restaurant_location": "string"
          },
          // ... more reservations
        ]
        ```
    *   **Error Responses:**
        *   `401 Unauthorized`: Missing or invalid JWT.
        *   `500 Internal Server Error`: Database error.

3.  **Ενημέρωση Κράτησης**
    *   **Method:** `PUT`
    *   **Path:** `/api/reservations/:id` (όπου `:id` το ID της κράτησης)
    *   **Purpose:** Τροποποίηση μιας υπάρχουσας κράτησης από τον χρήστη που την έκανε.
    *   **Authentication:** Ναι (JWT required)
    *   **Request Body (JSON):** (Πρέπει να περιέχει τουλάχιστον ένα από τα παρακάτω πεδία)
        ```json
        {
          "reservation_date": "string (YYYY-MM-DD)",
          "reservation_time": "string (HH:MM or HH:MM:SS)",
          "people_count": number (positive integer)
        }
        ```
    *   **Success Response (200 OK):**
        ```json
        {
          "message": "Reservation updated successfully."
        }
        ```
    *   **Error Responses:**
        *   `400 Bad Request`: Missing fields, invalid data format.
        *   `401 Unauthorized`: Missing or invalid JWT.
        *   `403 Forbidden`: User does not own the reservation.
        *   `404 Not Found`: Reservation not found.
        *   `500 Internal Server Error`: Database error.

4.  **Διαγραφή Κράτησης**
    *   **Method:** `DELETE`
    *   **Path:** `/api/reservations/:id` (όπου `:id` το ID της κράτησης)
    *   **Purpose:** Διαγραφή μιας υπάρχουσας κράτησης από τον χρήστη που την έκανε.
    *   **Authentication:** Ναι (JWT required)
    *   **Request Body:** N/A
    *   **Success Response (200 OK):**
        ```json
        {
          "message": "Reservation deleted successfully."
        }
        ```
    *   **Error Responses:**
        *   `401 Unauthorized`: Missing or invalid JWT.
        *   `403 Forbidden`: User does not own the reservation.
        *   `404 Not Found`: Reservation not found.
        *   `500 Internal Server Error`: Database error.

## 4. Database (MariaDB)

Η βάση δεδομένων υλοποιήθηκε σε MariaDB. Η αρχική δομή (schema) δημιουργήθηκε με το παρακάτω SQL script:

```sql
-- Σημείωση: Το αρχικό script περιείχε εντολές CREATE DATABASE/USE.
-- Αυτές παραλείπονται εδώ καθώς η βάση (`mydatabase`) και ο χρήστης (`myuser`)
-- δημιουργήθηκαν μέσω παραμέτρων κατά την εκκίνηση του Docker container.

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
    -- Optional: Add a unique constraint to prevent double booking for the same user/time/restaurant
    -- UNIQUE KEY unique_reservation (user_id, restaurant_id, reservation_date, reservation_time)
);

-- Optional: Add indexes for performance
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE restaurants ADD INDEX idx_name (name);
ALTER TABLE restaurants ADD INDEX idx_location (location);
ALTER TABLE reservations ADD INDEX idx_user_reservations (user_id, reservation_date);
ALTER TABLE reservations ADD INDEX idx_restaurant_reservations (restaurant_id, reservation_date);
```

**Περιγραφή Πινάκων:**

*   **`users`**: Αποθηκεύει πληροφορίες για τους χρήστες της εφαρμογής.
    *   `user_id`: Μοναδικό αναγνωριστικό χρήστη (Primary Key).
    *   `name`: Όνομα χρήστη.
    *   `email`: Διεύθυνση email (μοναδική), χρησιμοποιείται για τη σύνδεση.
    *   `password`: Κρυπτογραφημένος κωδικός πρόσβασης (χρησιμοποιείται bcrypt).
    *   `created_at`: Χρονοσφραγίδα δημιουργίας.
*   **`restaurants`**: Αποθηκεύει πληροφορίες για τα διαθέσιμα εστιατόρια.
    *   `restaurant_id`: Μοναδικό αναγνωριστικό εστιατορίου (Primary Key).
    *   `name`: Όνομα εστιατορίου.
    *   `location`: Τοποθεσία εστιατορίου.
    *   `description`: Περιγραφή του εστιατορίου.
    *   `created_at`: Χρονοσφραγίδα δημιουργίας.
*   **`reservations`**: Αποθηκεύει τις κρατήσεις που έχουν γίνει από τους χρήστες.
    *   `reservation_id`: Μοναδικό αναγνωριστικό κράτησης (Primary Key).
    *   `user_id`: Αναγνωριστικό του χρήστη που έκανε την κράτηση (Foreign Key που συνδέεται με `users.user_id`).
    *   `restaurant_id`: Αναγνωριστικό του εστιατορίου για το οποίο έγινε η κράτηση (Foreign Key που συνδέεται με `restaurants.restaurant_id`).
    *   `reservation_date`: Ημερομηνία κράτησης.
    *   `reservation_time`: Ώρα κράτησης.
    *   `people_count`: Αριθμός ατόμων για την κράτηση.
    *   `created_at`: Χρονοσφραγίδα δημιουργίας της κράτησης.
    *   `updated_at`: Χρονοσφραγίδα τελευταίας ενημέρωσης της κράτησης.

**Σχέσεις:**

*   Ένας χρήστης (`users`) μπορεί να έχει πολλές κρατήσεις (`reservations`).
*   Ένα εστιατόριο (`restaurants`) μπορεί να έχει πολλές κρατήσεις (`reservations`).
*   Η διαγραφή ενός χρήστη ή εστιατορίου (`ON DELETE CASCADE`) οδηγεί αυτόματα στη διαγραφή των σχετικών κρατήσεων.

## 5. Frontend (React Native)

Το frontend της εφαρμογής υλοποιείται με React Native (τρέχουσα έκδοση **0.79.2**), παρέχοντας μια cross-platform εμπειρία χρήστη για Android και iOS.

**Βασικές Τεχνολογίες & Βιβλιοθήκες:**

*   **React Native (v0.79.2):** Το βασικό framework για την ανάπτυξη.
*   **React Navigation (v7.x native-stack, v6.x native):** Χρησιμοποιείται για τη διαχείριση της πλοήγησης μεταξύ των οθονών της εφαρμογής.
*   **AsyncStorage (`@react-native-async-storage/async-storage`):** Χρησιμοποιείται για την ασφαλή αποθήκευση του JWT token τοπικά στη συσκευή.
*   **Axios:** Για την πραγματοποίηση HTTP αιτημάτων προς το backend API.
*   **TypeScript:** Για την ανάπτυξη των components.

**Δομή Κώδικα:**

*   `App.tsx`: Το κύριο component της εφαρμογής που αρχικοποιεί το `NavigationContainer` και τον `StackNavigator`.
*   `src/screens/`: Φάκελος που περιέχει τα components για κάθε οθόνη της εφαρμογής.

**Υλοποιημένες/Εν Μέρει Υλοποιημένες Οθόνες:**

*   **`LoginScreen.tsx`:**
    *   Πεδία εισαγωγής για email και password.
    *   Κλήση του endpoint `/api/auth/login`.
    *   Αποθήκευση JWT token με `AsyncStorage`.
    *   Πλοήγηση στην `HomeScreen` μετά από επιτυχή σύνδεση.
    *   Εμφάνιση μηνυμάτων σφάλματος.
*   **`RegisterScreen.tsx`:**
    *   Πεδία εισαγωγής για name, email, password.
    *   Κλήση του `/api/auth/register`.
    *   Εμφάνιση μηνυμάτων επιτυχίας/σφάλματος.
    *   Πλοήγηση στην `LoginScreen` μετά από επιτυχή εγγραφή.
*   **`HomeScreen.tsx`:**
    *   Η οθόνη στην οποία μεταφέρεται ο χρήστης μετά την επιτυχή σύνδεση.
    *   Κουμπιά πλοήγησης για "View Restaurants" και "My Profile / Bookings".
    *   Κουμπί "Logout".
*   **`RestaurantListScreen.tsx`:**
    *   Καλεί το `GET /api/restaurants` για τη λήψη και εμφάνιση λίστας εστιατορίων.
    *   Υποστηρίζει αναζήτηση με βάση το όνομα και την τοποθεσία (client-side filtering προς το παρόν).
    *   Διαθέτει λειτουργία pull-to-refresh.
    *   **TODO:** Ενεργοποίηση πλοήγησης στην `RestaurantDetailScreen` με τα στοιχεία του εστιατορίου.
*   **`ProfileScreen.tsx`:** (Placeholder)
    *   Βασική δομή.
    *   **TODO:** Κλήση του `GET /api/reservations/my` για εμφάνιση ιστορικού κρατήσεων.
    *   **TODO:** Υλοποίηση δυνατότητας τροποποίησης/διαγραφής κρατήσεων.

**TODO - Μελλοντικές Υλοποιήσεις (Frontend):**

*   **`RestaurantDetailScreen.tsx`:**
    *   **TODO:** Δημιουργία και υλοποίηση της οθόνης για εμφάνιση λεπτομερειών ενός εστιατορίου.
    *   **TODO:** Κουμπί πλοήγησης προς `BookingFormScreen`.
*   **`BookingFormScreen.tsx`:**
    *   **TODO:** Δημιουργία και υλοποίηση της φόρμας κράτησης (επιλογή ημερομηνίας, ώρας, ατόμων).
    *   **TODO:** Κλήση του `POST /api/reservations`.
*   **Authentication Flow:**
    *   **TODO:** Διαχείριση κατάστασης αυθεντικοποίησης στο `App.tsx` (έλεγχος ύπαρξης token κατά την εκκίνηση για αυτόματη πλοήγηση στην `HomeScreen` αν ο χρήστης είναι ήδη συνδεδεμένος).
    *   **TODO:** Καθαρισμός token από `AsyncStorage` κατά το Logout στην `HomeScreen`.
*   **Βελτιώσεις UI/UX:**
    *   **TODO:** Γενική βελτίωση της εμφάνισης και της εμπειρίας χρήστη σε όλες τις οθόνες.
    *   **TODO:** Προσθήκη πιο όμορφων loading indicators ή skeleton screens.
*   **Error Handling & Feedback:**
    *   **TODO:** Πιο ολοκληρωμένη διαχείριση σφαλμάτων δικτύου και API.
*   **Testing:**
    *   **TODO:** Προσθήκη unit/integration tests.

## 6. Οδηγίες Εγκατάστασης & Εκτέλεσης

Ακολουθούν τα βήματα για την εγκατάσταση και εκτέλεση της εφαρμογής τοπικά.

**Απαιτούμενα Εργαλεία:**

*   **Git:** Για τη λήψη του κώδικα.
*   **Node.js & npm:** (Προτείνεται Node 18 LTS ή νεότερη) Για την εκτέλεση του backend και τη διαχείριση πακέτων frontend.
*   **Docker Desktop:** Για την εκτέλεση της βάσης δεδομένων MariaDB σε container.
*   **Android Studio (τελευταία σταθερή έκδοση):** Με εγκατεστημένο το Android SDK Platform 34 (ή την έκδοση που χρησιμοποιεί το project) και Android SDK Build-Tools.
*   **Java Development Kit (JDK):** **JDK 17** (π.χ., Eclipse Temurin ή Microsoft OpenJDK). Η μεταβλητή περιβάλλοντος `JAVA_HOME` πρέπει να είναι ρυθμισμένη σε αυτό το JDK.
*   Ένα εργαλείο διαχείρισης βάσεων δεδομένων (π.χ., DBeaver, HeidiSQL) για την εκτέλεση του αρχικού SQL script.

**Βήματα:**

1.  **Λήψη Κώδικα:**
    ```bash
    git clone <URL_ΑΠΟΘΕΤΗΡΙΟΥ> # Αντικαταστήστε με το URL του Git repository
    cd <ΟΝΟΜΑ_ΦΑΚΕΛΟΥ_PROJECT>
    ```

2.  **Backend Setup:**
    *   Μεταβείτε στον φάκελο του backend:
        ```bash
        cd backend
        ```
    *   Δημιουργήστε ένα αρχείο `.env` στον φάκελο `backend` και αντιγράψτε το παρακάτω περιεχόμενο, αντικαθιστώντας τις placeholder τιμές:
        ```dotenv
        # Server Port
        PORT=3000

        # Database Configuration (Using Docker container credentials)
        DB_HOST=localhost
        DB_USER=myuser # Ο χρήστης που ορίστηκε στο docker run
        DB_PASSWORD=mypassword # Ο κωδικός που ορίστηκε στο docker run
        DB_NAME=mydatabase # Η βάση που ορίστηκε στο docker run
        DB_PORT=3306

        # JWT Configuration
        JWT_SECRET=your_very_strong_and_secret_jwt_key # <<< ΑΝΤΙΚΑΤΑΣΤΗΣΤΕ ΜΕ ΕΝΑ ΙΣΧΥΡΟ ΜΥΣΤΙΚΟ!
        JWT_EXPIRES_IN=1h
        ```
    *   Εγκαταστήστε τις εξαρτήσεις:
        ```bash
        npm install
        ```
    *   Εκκινήστε το MariaDB container (αν δεν τρέχει ήδη):
        ```bash
        docker run -d --name mariadb \
          -e MYSQL_ROOT_PASSWORD=my-secret-pw \
          -e MYSQL_DATABASE=mydatabase \
          -e MYSQL_USER=myuser \
          -e MYSQL_PASSWORD=mypassword \
          -p 3306:3306 \
          -v restaurant-db-data:/var/lib/mysql \
          mariadb:latest
        ```
        *(Σημείωση: Το volume `restaurant-db-data` διατηρεί τα δεδομένα της βάσης)*
    *   Δημιουργήστε τους πίνακες: Συνδεθείτε στη βάση δεδομένων `mydatabase` (host: `localhost`, port: `3306`, user: `myuser`, password: `mypassword`) χρησιμοποιώντας ένα εργαλείο GUI και εκτελέστε τις εντολές `CREATE TABLE` και `ALTER TABLE` που βρίσκονται στο αρχείο `database_setup.sql` (ή στην ενότητα 4 της παρούσας αναφοράς).
    *   Εκκινήστε τον backend server:
        ```bash
        npm run dev
        ```
        Ο server θα πρέπει να τρέχει στη διεύθυνση `http://localhost:3000` και να συνδεθεί επιτυχώς στη βάση.

3.  **Frontend Setup:**
    *   Ανοίξτε ένα **νέο** τερματικό/κονσόλα.
    *   Μεταβείτε στον φάκελο του frontend: `cd frontend`
    *   Ρυθμίστε το Android Studio Gradle JDK:
        *   Ανοίξτε το project `frontend/android` στο Android Studio.
        *   Πηγαίνετε **File > Settings > Build, Execution, Deployment > Build Tools > Gradle**.
        *   Στο **Gradle JDK**, επιλέξτε την εγκατάσταση του **JDK 17**.
        *   Πατήστε Apply/OK και περιμένετε να ολοκληρωθεί το Gradle Sync.
    *   Εγκαταστήστε τις εξαρτήσεις (αν δεν το έχετε κάνει ήδη μετά την αρχικοποίηση):
        ```bash
        npm install
        ```
    *   Βεβαιωθείτε ότι έχετε έναν Android emulator να τρέχει (εκκίνηση από το Device Manager του Android Studio) ή μια συσκευή συνδεδεμένη.
    *   Εκκινήστε τον Metro bundler (σε ένα terminal):
        ```bash
        npx react-native start --reset-cache
        ```
    *   Εκκινήστε την εφαρμογή React Native (σε **άλλο** terminal):
        ```bash
        npx react-native run-android
        ```
        Η εφαρμογή θα πρέπει να γίνει build και να ανοίξει στον emulator/συσκευή.

4.  **Προσθήκη του JAVA_HOME στις μεταβλητές περιβάλλοντος:**
    *   Ενεργοποίηση του JAVA_HOME για JDK 17:
        ```bash
        export JAVA_HOME=/path/to/jdk-17
        ```
    *   Επιβεβαίωση της ρύθμισης:
        ```bash
        java -version
        ```
        Η έκδοση που πρέπει να εμφανίζεται είναι 17.0.x ή νεότερη.

5.  **Εκτέλεση του αρχικού SQL script:**
    *   Χρησιμοποιήστε ένα εργαλείο διαχείρισης βάσεων δεδομένων (π.χ., DBeaver, HeidiSQL) για την εκτέλεση του αρχικού SQL script που βρίσκεται στο αρχείο `database_setup.sql` (ή στην ενότητα 4 της παρούσας αναφοράς).

6.  **Εκτέλεση του backend server:**
    *   Μεταβείτε στον φάκελο του backend και εκτελέστε τον server:
        ```bash
        npm run dev
        ```
        Ο server θα πρέπει να τρέχει στη διεύθυνση `http://localhost:3000` και να συνδεθεί επιτυχώς στη βάση.

7. **Εκτέλεση της εφαρμογής:**
    *   Εκκινήστε την εφαρμογή React Native από το τερματικό/κονσόλα που έχετε ανοίξει για το frontend.
    *   Η εφαρμογή θα πρέπει να γίνει build και να ανοίξει στον emulator/συσκευή.

Το παραπάνω οδηγίες θα πρέπει να εκτελεστούν για κάθε νέο υπολογιστή ή νέα περιβάλλον που χρησιμοποιείτε για την ανάπτυξη ή την εκτέλεση της εφαρμογής.

Παρακαλώ διαβάστε προσεκτικά και ακολουθήστε πλήρως τις οδηγίες για να εξασφαλίσετε την επιτυχή εγκατάσταση και εκτέλεση της εφαρμογής.

Εάν διαπιστώσετε οποιαδήποτε πρόβλημα κατά την εκτέλεση των βημάτων, παρακαλώ επικοινωνήστε μαζί μας για βοήθεια ή περισσότερες λεπτομέρειες.

Χρόνια πολλά και καλή εκτέλεση της εργασίας! 