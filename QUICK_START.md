# ⚡ Quick Start - 5 Minutes Setup

## Prerequisites
- Node.js installed
- MySQL running
- Gemini API key from: https://aistudio.google.com/app/apikey

## 1. Backend Setup (2 minutes)

```cmd
cd adarsh_lib.2\backend
npm install
```

Create `backend\.env`:
```env
DB_PASSWORD=your_mysql_password
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=random-secret-123
```

```cmd
npm run init-db
npm run dev
```

## 2. Frontend Setup (2 minutes)

Open NEW terminal:
```cmd
cd adarsh_lib.2\frontend
npm install
npm start
```

## 3. Login (1 minute)

Open: http://localhost:3000

Login: `admin` / `admin123`

## 🎉 Done!

Try the AI Assistant with voice! 🎤

---

## Voice API Recommendation

**Best Option: Web Speech API (Built-in)**
- ✅ FREE - No API key needed
- ✅ Works in Chrome, Edge, Safari
- ✅ Already integrated in the app
- ✅ Speech-to-text + Text-to-speech

**Alternative: Google Cloud Speech-to-Text**
- Better accuracy for production
- Requires Google Cloud account
- $0.006 per 15 seconds
- Get key: https://console.cloud.google.com

**Our Recommendation:** Start with Web Speech API (it's already working!), upgrade to Google Cloud only if you need better accuracy.

---

## Gemini 2.5 Features

- 🆓 **FREE** with generous limits
- 🚀 Fast responses
- 🧠 Understands natural language
- 📊 Real-time database access
- 💬 Conversation memory

Get your key: https://aistudio.google.com/app/apikey
