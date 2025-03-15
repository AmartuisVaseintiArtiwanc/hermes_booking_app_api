# Booking App API

This is a Node.js and Express-based API for a booking application. It allows users to book facilities, participate in events, manage notifications, and provide ratings.

## Features
- **User Authentication** (JWT-based login/register)
- **Facility Management** (Admin only)
- **Event Management** (Admins & Experts)
- **Booking System** (Users can join/cancel events)
- ~~**Notifications** (In-app & Push notifications)~~
- ~~**Ratings & Reviews** (For Expert-created events)~~
- ~~**Admin Controls** (User management, event overrides, etc.)~~

## Technologies Used
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Token)
- **ORM/Query Builder:** MySQL2

## Installation
### 1. Clone the Repository
```sh
git clone https://github.com/AmartuisVaseintiArtiwanc/hermes_booking_app_api.git
cd your-repo
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root with the following:
```env
PORT=4000
DB_HOST=your-db-host
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-database-name
JWT_SECRET=your-jwt-secret
```

### 4. Run the Server
```sh
npm start
```
The server will start on `http://localhost:4000`

## Database Schema
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    profile_picture VARCHAR(255) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'expert', 'regular_participant') NOT NULL,
    role_level int NOT NULL DEFAULT '1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('available', 'unavailable') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    facility_id INT,
    expert_id INT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    quota INT NOT NULL,
    status ENUM('scheduled','cancelled','completed') NOT NULL DEFAULT 'scheduled',
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (expert_id) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_id INT,
    status ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT NOT NULL,
    notification_type ENUM('event_confirmation','event_reminder','event_cancellation','event_modification','session_full') DEFAULT NULL,
    is_read TINYINT DEFAULT '0'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT,
    event_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);
```

## API Endpoints

### **Authentication**
| Method | Endpoint            | Description         | Access |
|--------|---------------------|---------------------|--------|
| POST   | /api/users/register | Register a new user | Public |
| POST   | /api/users/login    | Login and get JWT   | Public |
| GET    | /api/users/profile  | Get profile data    | Public |

### **Facilities**
| Method | Endpoint            | Description          | Access |
|--------|---------------------|----------------------|--------|
| GET    | /api/facilities     | List all facilities  | Public |
| POST   | /api/facilities     | Create a facility    | Admin  |
| PUT    | /api/facilities/:id | Update a facility    | Admin  |
| DELETE | /api/facilities/:id | Delete a facility    | Admin  |

### **Events**
| Method | Endpoint          | Description                       | Access        |
|--------|-------------------|-----------------------------------|---------------|
| GET    | /api/events       | List available events             | Public        |
| GET    | /api/events/:id   | Get event detail & participant(s) | Public        |
| POST   | /api/events       | Create an event                   | Admin, Expert |
| PUT    | /api/events/:id   | Modify an event                   | Admin, Expert |
| DELETE | /api/events/:id   | Delete an event                   | Admin, Expert |

### **Bookings**
| Method | Endpoint                 | Description                         | Access |
|--------|--------------------------|-------------------------------------|--------|
| POST   | /api/bookings            | Book an event                       | User   |
| PUT    | /api/bookings/cancel/:id | Cancel a booking                    | User   |
| GET    | /api/bookings/user/      | Get User Booking History            | User   |
| GET    | /api/bookings/event/:id  | Get an event Booking Participant    | User   |


## License
MIT License

