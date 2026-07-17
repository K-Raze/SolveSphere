<div align="center">
  <h1>🌐 SolveSphere</h1>
  <p><b>Read the interview. Solve the problem.</b></p>
  <p><i>An AI-Powered Interview Preparation Platform</i></p>
</div>

---


## 🌟 Vision

SolveSphere is not just another LeetCode clone. Every day, thousands of engineers share their real-world interview experiences on forums, but readers can only *read* about them. SolveSphere bridges the gap by using Artificial Intelligence to transform raw interview stories into fully playable, structured coding problems.

**If you can read about a coding interview problem, you should also be able to solve it.**

---

## ✨ Key Features

- **🧠 AI-Powered Problem Generation**: Users submit raw interview experiences. Our Gemini AI pipeline automatically extracts constraints, edge cases, and requirements to generate structured coding problems.
- **🛡️ Dynamic Confidence System**: We don't make false claims about "official" questions. Problems are rated via a transparent confidence metric (`Community Reported`, `Multiple Reports`, `Admin Reviewed`, `High Confidence`).
- **💡 Context-Aware AI Hints**: Get hints specifically tailored to *your* current code in the editor, simulating a real interviewer giving you a nudge in the right direction.
- **🔍 Hybrid Duplicate Detection**: Prevents database bloat using MongoDB `$text` search combined with LLM semantic comparison. Duplicates are automatically merged to consolidate metadata.
- **⏱️ 45-Minute Interview Mode**: Replicates the pressure of a real technical interview with a strict 45-minute timer to solve the problem.
- **🏆 Gamification & Reputation**: Users earn a Reputation Score (+10 for solving a problem, +50 for contributing an approved interview experience) and compete on a Global Leaderboard.
- **💾 Auto-Save (Drafts)**: Redis-backed real-time code saving prevents candidates from losing their hard work mid-interview.
- **💬 Community Discussions**: A built-in threaded forum for every problem to discuss space/time complexities and alternative approaches.
- **🚀 Sandboxed Code Execution**: Integrates with the **Judge0 API** to securely execute and evaluate untrusted user code against hidden test cases, supporting C++, Java, Python, and JavaScript.

---

## 🛠️ Tech Stack

**Frontend (React)**
- **React.js & Vite**: Lightning-fast modern Single Page Application.
- **Tailwind CSS / Vanilla CSS**: For a stunning, modern dark-mode glassmorphism aesthetic.
- **Monaco Editor**: VS-Code powered rich text code editing experience in the browser.
<img width="1440" height="807" alt="Screenshot 2026-07-18 at 4 11 54 AM" src="https://github.com/user-attachments/assets/8d51bd71-c1ef-4b39-bf37-0b515b29a12a" />
<img width="1439" height="811" alt="Screenshot 2026-07-18 at 4 11 44 AM" src="https://github.com/user-attachments/assets/f4e38ec9-c746-40ba-975c-eff24ebde62c" />
<img width="933" height="621" alt="Screenshot 2026-07-18 at 4 11 37 AM" src="https://github.com/user-attachments/assets/2e3b779a-0cb5-4ff0-b77e-c1a0ea73139d" />
<img width="1419" height="794" alt="Screenshot 2026-07-18 at 4 11 29 AM" src="https://github.com/user-attachments/assets/2a09e1dc-49f1-4cd0-b94c-6027ff416ff4" />
<img width="1438" height="812" alt="Screenshot 2026-07-18 at 4 11 24 AM" src="https://github.com/user-attachments/assets/7a2533ad-91c8-4e39-bd00-f493997d31f7" />
<img width="1440" height="815" alt="Screenshot 2026-07-18 at 4 11 13 AM" src="https://github.com/user-attachments/assets/15351eb6-2a22-472c-b319-564b45ca1087" />

**Backend System**
- **Node.js & Express.js**: Fast, unopinionated web framework driving the RESTful APIs.
- **MongoDB**: NoSQL database for flexible schema design handling Experiences, Problems, Users, Drafts, and Discussions.
- **Redis**: In-memory data store for high-performance caching and the auto-save drafts feature.
- **Google Gemini API**: LLM powering the AI Clarification, Generation, and Context-Aware Hint pipelines.
- **Judge0 API**: Robust, isolated Docker-based sandboxed code execution engine.
- **JWT & bcrypt**: Stateless secure authentication and password hashing.

---

## 🏗️ Architecture Highlight: The Verification Pipeline

The crown jewel of SolveSphere is its automated data pipeline:
1. **Submit**: A user submits a raw interview experience. The `/experience/analyze` endpoint intercepts it to ensure enough detail (constraints, edge cases) is present before accepting it.
2. **Detect Duplicates**: MongoDB `$text` search grabs the top 5 potential matches instantly. The Gemini API then evaluates if they share the exact core algorithm.
3. **Merge or Generate**: If a duplicate is found, the system links them and upgrades the Confidence Score. If unique, Gemini generates a structured `Problem` marked as `pending`.
4. **Publish**: An admin reviews the pending problem and approves it, making it live for the world to solve!

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
   cd SolveSphere
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=3000
   DB_CONNECT_STRING=mongodb://localhost:27017/solvesphere
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key
   JUDGE0_API_URL=your_judge0_url
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Seed the Database**
   Run the seeding script to populate the database with an initial batch of AI-generated algorithmic interview problems:
   ```bash
   cd backend && node seed.js
   ```

5. **Start the Servers**
   ```bash
   # Start the backend server (Terminal 1)
   cd backend && npm start
   
   # Start the frontend dev server (Terminal 2)
   cd frontend && npm run dev
   ```

---
<div align="center">
  <i>Designed for the next generation of software engineers.</i>
</div>
