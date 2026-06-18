# 🌐 LinguaAI — AI Language Translator

A full-stack AI-powered language translation web app built with React, Node.js, MongoDB, and OpenAI GPT-4.

---

## Features

- 🔐 JWT-based authentication (register / login)
- 🌍 Translate between 28+ languages
- 🤖 Powered by OpenAI GPT-4 (with Gemini fallback)
- 📜 Translation history (last 10 per user)
- 📋 One-click copy of translations
- 🔄 Language swap button
- 🌑 Dark, modern UI

---

## Tech Stack

| Layer      | Technology                         |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Backend    | Node.js, Express                    |
| Database   | MongoDB + Mongoose                  |
| AI         | OpenAI GPT-4 (Gemini fallback)      |
| Auth       | JWT (JSON Web Tokens)               |

---

## Project Structure

```
project/
├── backend/
│   ├── middleware/auth.js       # JWT middleware
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Translation.js       # Translation schema
│   ├── routes/
│   │   ├── auth.js              # POST /api/auth/login|register
│   │   └── translate.js         # POST /api/translate, GET /api/history
│   ├── services/
│   │   └── aiService.js         # OpenAI + Gemini integration
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Auth page
│   │   │   └── Translate.jsx    # Main translation UI
│   │   ├── services/api.js      # API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — free tier works)
- OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)

---

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/linguaai.git
cd linguaai
```

### 2. Set up the backend
```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your MONGO_URI, OPENAI_API_KEY, JWT_SECRET
```

### 3. Set up the frontend
```bash
cd ../frontend
npm install
```

### 4. Run the app

**Terminal 1 — backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | /api/auth/register    | No   | Create a new account     |
| POST   | /api/auth/login       | No   | Login, returns JWT       |
| POST   | /api/translate        | Yes  | Translate text via AI    |
| GET    | /api/history          | Yes  | Get last 10 translations |

---

## Push to GitHub

```bash
# Inside the project root
git init
git add .
git commit -m "initial commit: LinguaAI full-stack app"

# Create a repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/linguaai.git
git branch -M main
git push -u origin main
```

> ⚠️ **Never push your `.env` file.** The `.gitignore` already excludes it.

---

## Environment Variables

Create `/backend/.env` using `.env.example` as a template:

```env
MONGO_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=          # optional fallback
JWT_SECRET=your-random-secret
PORT=5000
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## License

MIT
