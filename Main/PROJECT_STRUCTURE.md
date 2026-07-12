# SolveSphere Backend Project Structure

This document outlines the architecture and flow of the SolveSphere backend. It is designed to be beginner-friendly to help you quickly understand the project.

## 📂 Folder Structure

- **`/config`**: Contains database and external service connection files (MongoDB, Redis).
- **`/controllers`**: Contains the core business logic. Controllers receive requests from routes, interact with models, and send back responses.
- **`/middleware`**: Functions that run before the controller. Used for authentication, authorization, and logging.
- **`/models`**: Mongoose schemas that define the structure of MongoDB collections (e.g., Users, Problems).
- **`/routes`**: Defines the API endpoints (URLs) and maps them to their respective controllers.
- **`/utils`**: Helper functions and shared logic (e.g., data validation).

## 🔄 Request Flow

1. **Client Request**: A user makes an API request (e.g., POST `/user/login`).
2. **Router (`/routes`)**: Express router catches the URL and passes it to the registered middleware.
3. **Middleware (`/middleware`)**: Optional. Checks if the user is authenticated (valid JWT token) and authorized. If it fails, it rejects the request early.
4. **Controller (`/controllers`)**: The main logic runs here. It talks to the database, computes results, and formats the response.
5. **Model (`/models`)**: If database interaction is needed, the controller asks the model to fetch or update data in MongoDB.
6. **Response**: The controller sends a JSON response back to the client.

## 🔐 Authentication Flow

1. **Register**: User sends details. We validate the data, hash the password using `bcrypt`, save the user to the database, generate a JWT token, and send it back as an HTTP-only cookie.
2. **Login**: User sends email and password. We find the user by email, compare the hashed password, and if correct, issue a new JWT token via cookie.
3. **Accessing Protected Routes**: The client makes a request with the cookie. Our `authMiddleware` verifies the JWT token using our `JWT_KEY`. If valid, it attaches the user object to `req.user` and allows the request to continue.
4. **Logout**: We decode the user's token and add it to a Redis "blocklist" until it expires. Then we clear the client's cookie. The `authMiddleware` always checks this Redis blocklist before allowing a request.

## 🧑‍💻 Flows

### User Flow
- Users can register and login.
- Once logged in, their token allows them to access protected features (like solving problems).
- Users can safely log out, which invalidates their session globally using Redis.

### Admin Flow
- Admins have special privileges.
- We have an `/admin/register` route protected by our `authMiddleware(['admin'])`.
- When an admin route is accessed, the middleware checks if the decoded JWT token contains `role: 'admin'`.

## 🏗️ Components

### Controllers
- **`auth.controller.js`**: Handles user and admin registration, login, and logout. Returns standard JSON responses.
- **`problem.controller.js`**: Contains logic for creating, fetching, updating, and deleting problems (currently placeholders).

### Routes
- **`auth.routes.js`**: Maps `/user/...` endpoints to the auth controller.
- **`problem.routes.js`**: Maps `/problem/...` endpoints to the problem controller.

### Models
- **`user.js`**: Defines the user schema (name, email, password, role). Contains methods for password hashing and JWT generation.
- **`problem.js`**: Defines the problem schema (title, difficulty, tags, test cases). Has indexes for faster querying.

### Middleware
- **`auth.middleware.js`**: A unified authentication and authorization layer. Checks for a valid token, ensures it's not blacklisted in Redis, and enforces role-based access control.

### Utilities
- **`validator.js`**: Validates request body structures, email formats, and password strength.

### Config
- **`db.js`**: Establishes connection with MongoDB using Mongoose.
- **`redis.js`**: Establishes connection with Redis Cloud.

## 💾 Databases

- **MongoDB**: The primary database. Stores persistent data like users, problems, and test cases.
- **Redis**: An in-memory key-value store. Used primarily for our token blocklist (logout feature) due to its high speed and built-in expiration (`expireAt`).

## 🌍 Environment Variables

Environment variables keep our sensitive data (like passwords and API keys) out of the source code.

- **`PORT`**: The port number the server runs on (e.g., 3000).
- **`DB_CONNECT_STRING`**: The connection URI for MongoDB Atlas.
- **`JWT_KEY`**: A secret string used to sign and verify JWT tokens. Keep this very secure.
- **`REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`**: Credentials to connect to your Redis instance.

Check the `.env.example` file to see the required keys.

## 📡 API Structure (Example)

- `POST /user/register`: Register a new user
- `POST /user/login`: Login an existing user
- `POST /user/logout`: Logout the user (Protected)
- `POST /user/admin/register`: Register an admin (Protected, Admin only)
- `GET /problem`: Fetch all problems
- `POST /problem/create`: Create a new problem
