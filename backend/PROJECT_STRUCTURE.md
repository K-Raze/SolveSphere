# SolveSphere Backend Project Structure

This document outlines the architecture and flow of the SolveSphere backend. It is designed to be beginner-friendly to help you quickly understand the project.

## 📂 Folder Structure

- **`/config`**: Contains database and external service connection files (MongoDB, Redis).
- **`/controllers`**: Contains the core business logic. Controllers receive requests from routes, interact with models, and send back responses.
- **`/middleware`**: Functions that run before the controller. Used for authentication, authorization, and logging.
- **`/models`**: Mongoose schemas that define the structure of MongoDB collections (e.g., Users, Problems, Submissions).
- **`/routes`**: Defines the API endpoints (URLs) and maps them to their respective controllers.
- **`/utils`**: Helper functions and shared logic (e.g., data validation, Judge0 integration).

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
- Once logged in, their token allows them to access protected features (like viewing and solving problems).
- Users can safely log out, which invalidates their session globally using Redis.

### Admin Flow
- Admins have special privileges.
- We have an `/admin/register` route protected by our `authMiddleware(['admin'])`.
- When an admin route is accessed, the middleware checks if the decoded JWT token contains `role: 'admin'`.
- Admins can create, update, and delete problems.

### Problem Flow
- **Create**: An admin submits a new problem with reference solutions. The server validates the reference solutions against test cases using Judge0 before saving.
- **Update**: An admin updates a problem. If reference solutions are changed, they are re-validated via Judge0.
- **Delete**: An admin deletes a problem by its ID.
- **Fetch**: Authenticated users can fetch a single problem by ID, list all problems, view their solved problems, or view submission history.

### Submission Flow
- **Run Code**: A user writes code and runs it against the problem's visible test cases. This doesn't save anything to the database, it just returns execution results (pass/fail, logs, errors).
- **Submit Code**: A user submits code against hidden test cases. The backend safely saves a pending Submission, polls Judge0 for execution results, updates the Submission with runtime/memory metrics, and atomically updates the user's `problemSolved` array if all test cases passed.

### Community Pipeline Flow
- **Submit Experience**: A user submits a raw interview description (company, role, round, description text).
- **AI Generation**: An admin triggers AI generation. Google Gemini converts the description into a structured problem (title, test cases, difficulty, tags, editorial). The problem is saved as a draft.
- **Admin Review**: The admin reviews the generated problem. They can approve it (makes it public) or reject it (deletes the draft, adds notes).
- **Nothing is published automatically**. Every community-generated problem requires admin approval.

### AI Interview Features Flow
- **Code-Aware Hints**: When a user is stuck, they can request a hint. The AI reads their *current code* and provides a subtle nudge without giving the answer. Evaluated on-demand to save resources.
- **Mock Interview Simulator**: A stateless chat interface where Gemini acts as a Senior Engineer to discuss the problem, time/space complexity, and algorithm approach. The frontend maintains chat history and sends it per request.
- **Smart POTD**: A personalized Problem of the Day system. It queries the DB for the most frequently asked problem the user hasn't solved yet. Uses pure DB logic (no AI) to save compute.

## 🏗️ Components

### Controllers
- **`auth.controller.js`**: Handles user/admin auth, public profiles, and leaderboards.
- **`problem.controller.js`**: Full CRUD for problems, search/filter/pagination, bookmarks, solved problems, submission history, and Smart POTD.
- **`submission.controller.js`**: Manages code execution, DB updates, and code drafts.
- **`experience.controller.js`**: Community pipeline — submit experiences, admin queue, AI generation trigger, approve/reject.
- **`ai.controller.js`**: AI interview features — code-aware hints and mock interview simulator.
- **`discussion.controller.js`**: Problem discussion comments.

### Routes
- **`auth.routes.js`**: Maps `/user/...` endpoints.
- **`problem.routes.js`**: Maps `/problem/...` endpoints.
- **`submission.routes.js`**: Maps `/submission/...` endpoints.
- **`experience.routes.js`**: Maps `/experience/...` endpoints.
- **`ai.routes.js`**: Maps `/ai/...` endpoints.
- **`discussion.routes.js`**: Maps `/discussion/...` endpoints.

### Models
- **`user.js`**: User schema with `reputation`.
- **`problem.js`**: Problem schema with interview metadata.
- **`submission.js`**: Code submission schema.
- **`interviewExperience.js`**: User-submitted interview descriptions.
- **`codeDraft.js`**: Auto-saved user code drafts.
- **`discussion.js`**: Problem discussion comments.

### Middleware
- **`auth.middleware.js`**: A unified authentication and authorization layer. Checks for a valid token, ensures it's not blacklisted in Redis, and enforces role-based access control.

### Utilities
- **`validator.js`**: Validates request body structures, email formats, and password strength.
- **`judge0.js`**: Handles communication with the Judge0 CE API — language mapping, batch submission, result polling, and reference solution validation.
- **`aiGenerator.js`**: Converts raw interview text into structured coding problems using Google Gemini API.

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
- **`JUDGE0_API_KEY`**: RapidAPI key for the Judge0 CE code execution engine.
- **`GEMINI_API_KEY`**: Google Gemini API key for AI problem generation.

Check the `.env.example` file to see the required keys.

## 📡 API Structure

### Auth
- `POST /user/register`: Register a new user
- `POST /user/login`: Login an existing user
- `POST /user/logout`: Logout the user (Protected)
- `DELETE /user/delete`: Delete the user's profile and submissions (Protected)
- `POST /user/admin/register`: Register an admin (Protected, Admin only)
- `GET /user/profile/:username`: Fetch a user's public profile
- `GET /user/leaderboard`: Fetch top 50 users by reputation

### Problems
- `POST /problem/create`: Create a new problem with interview metadata (Admin only)
- `PATCH /problem/:id`: Update a problem (Admin only)
- `DELETE /problem/:id`: Delete a problem (Admin only)
- `GET /problem/:id`: Fetch a single problem — excludes hidden tests & solutions for non-admins (Authenticated)
- `GET /problem/`: Fetch all problems with search, filter, sort & pagination (Authenticated)
- `GET /problem/user/solved`: Fetch a user's solved problems (Authenticated)
- `GET /problem/user/bookmarks`: Fetch bookmarked problems (Authenticated)
- `GET /problem/user/submissions/:id`: Fetch user's submissions for a problem (Authenticated)
- `POST /problem/bookmark/:id`: Toggle bookmark on a problem (Authenticated)
- `GET /problem/smart-potd`: Fetch personalized daily problem (Authenticated)

#### Query Parameters for `GET /problem/`
| Param | Example | Description |
|---|---|---|
| `difficulty` | `medium` | Filter by difficulty |
| `company` | `google,meta` | Filter by company (comma-separated) |
| `tags` | `array,dp` | Filter by tags (comma-separated) |
| `interviewRound` | `onsite` | Filter by interview round |
| `yearAsked` | `2024` | Filter by year |
| `search` | `two sum` | Full-text search on title & description |
| `sort` | `frequency` | Sort: `frequency`, `oldest`, `difficulty` (default: newest) |
| `page` | `1` | Page number (default: 1) |
| `limit` | `20` | Results per page (default: 20, max: 100) |

### Submissions & Drafts
- `POST /submission/run/:id`: Execute code against visible test cases (Authenticated)
- `POST /submission/submit/:id`: Execute code against hidden test cases & save (Authenticated)
- `POST /submission/draft/:id`: Auto-save a code draft (Authenticated)
- `GET /submission/draft/:id`: Fetch user's saved code draft (Authenticated)

### Experiences (Community Pipeline)
- `POST /experience/submit`: Submit a new interview experience (Authenticated)
- `GET /experience/my-submissions`: View your submitted experiences (Authenticated)
- `GET /experience/admin/queue`: View pending/generated experiences (Admin only)
- `POST /experience/admin/:id/generate`: Trigger AI problem generation (Admin only)
- `PATCH /experience/admin/:id/approve`: Approve and publish generated problem (Admin only)
- `PATCH /experience/admin/:id/reject`: Reject with notes (Admin only)

### AI Interview Features
- `POST /ai/hint`: Request a code-aware hint based on current code (Authenticated)
- `POST /ai/chat`: Chat with the virtual mock interviewer (Authenticated)

### Discussions
- `POST /discussion/:problemId`: Add a comment to a problem (Authenticated)
- `GET /discussion/:problemId`: List all comments for a problem
