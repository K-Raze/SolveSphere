# SolveSphere 🌐

> **Read the interview. Solve the problem.**

SolveSphere is not just another LeetCode clone. It is an AI-powered interview preparation platform focused on **real software engineering interview questions**. Every day, thousands of engineers share their interview experiences on forums. SolveSphere bridges the gap by letting you actually *solve* the questions you read about in those experiences.

---

## 🌟 Vision

The online judge is only the foundation. The primary goal of SolveSphere is to recreate and improve the real interview experience. 
**If you can read about a coding interview problem, you should also be able to solve it.**

## ✨ Key Features

- **🧠 AI-Powered Generation**: Users submit raw interview experiences. Our Gemini AI pipeline automatically extracts constraints, edge cases, and requirements to generate structured, playable coding problems.
- **🛡️ Confidence System**: We don't make false claims about "official" questions. Problems are rated via a transparent confidence metric (`Community Reported`, `Multiple Reports`, `Admin Reviewed`, `High Confidence`).
- **🔍 AI Duplicate Detection**: Prevents database bloat by semantically matching new submissions against the database. If a duplicate is found, the reports are merged and the problem's confidence score increases!
- **🏆 Gamification & Reputation**: Users earn a Reputation Score (+10 for solving a problem, +50 for contributing an approved interview experience) and compete on a Global Leaderboard.
- **💾 Auto-Save (Drafts)**: Real-time code saving prevents candidates from losing their hard work mid-interview.
- **💬 Community Discussions**: A built-in forum for every problem to discuss space/time complexities and alternative approaches.
- **🚀 Scalable Execution**: Integrates with the **Judge0 API** to securely execute and evaluate untrusted user code against hidden test cases.

---

## 🛠️ Tech Stack

**Backend System:**
- **Node.js & Express.js**: Fast, unopinionated web framework.
- **MongoDB**: NoSQL database for flexible schema design (Experiences, Problems, Users, Drafts, Discussions).
- **Redis**: Caching layer for optimized performance and rate-limiting.
- **Google Gemini API**: Powers the AI Clarification and Generation pipelines.
- **Judge0 API**: Robust, sandboxed code execution engine.
- **JWT & bcrypt**: Secure authentication and password hashing.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Redis server running locally
- Google Gemini API Key
- Judge0 API endpoint

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/K-Raze/SolveSphere.git
   cd SolveSphere/Main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the `Main` directory:
   ```env
   PORT=3000
   DB_CONNECT_STRING=mongodb://localhost:27017/solvesphere
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key
   JUDGE0_API_URL=your_judge0_url
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Seed the Database (Optional)**
   Run the seeding script to populate the database with initial AI-generated interview problems:
   ```bash
   node seed.js
   ```

5. **Start the Server**
   ```bash
   npm start
   ```

---

## 🏗️ Architecture Highlight: The Verification Pipeline

1. **Submit**: A user submits a raw interview experience. The `/experience/analyze` endpoint intercepts it to ensure enough detail (constraints, edge cases) is present.
2. **Detect Duplicates**: MongoDB `$text` search grabs the top 5 potential matches. Gemini evaluates if they share the exact core algorithm.
3. **Merge or Generate**: If a duplicate is found, the system links them and upgrades the Confidence Score. If unique, Gemini generates a structured `Problem` marked as `pending`.
4. **Publish**: An admin reviews the pending problem and approves it, making it live for the world to solve!

---

*Designed for the next generation of software engineers.*
