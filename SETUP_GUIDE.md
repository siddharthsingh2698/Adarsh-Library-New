# 🚀 Complete Setup Guide - Adarsh Library v2.0

## Step-by-Step Installation

### 1️⃣ Get Your Gemini API Key (FREE)

1. Visit: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key (starts with `AIza...`)
5. Keep it safe - you'll need it in step 4

**Note:** Gemini API is FREE with generous limits (60 requests per minute)!

---

### 2️⃣ Install Node.js

**Windows:**
1. Download from: https://nodejs.org/
2. Install the LTS version (recommended)
3. Verify installation:
```cmd
node --version
npm --version
```

---

### 3️⃣ Setup MySQL Database

**Option A: Using existing database**
- You already have `adarsh_library` database from your Flask app
- Just note your MySQL credentials

**Option B: Fresh installation**
1. Install MySQL from: https://dev.mysql.com/downloads/installer/
2. During installation, set root password
3. MySQL will run on port 3306 by default

---

### 4️⃣ Backend Setup

```cmd
cd adarsh_lib.2\backend
npm install
```

Create `.env` file in `backend` folder:
```env
PORT=5000
NODE_ENV=development

# Your MySQL credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=adarsh_library

# Generate a random string for JWT
JWT_SECRET=my-super-secret-key-12345

# Your Gemini API key from step 1
GEMINI_API_KEY=AIzaSy...your_key_here
```

Initialize database:
```cmd
npm run init-db
```

Start backend server:
```cmd
npm run dev
```

✅ Backend should be running on: http://localhost:5000

---

### 5️⃣ Frontend Setup

Open a NEW terminal window:

```cmd
cd adarsh_lib.2\frontend
npm install
```

Create `.env` file in `frontend` folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```cmd
npm start
```

✅ Frontend should open automatically at: http://localhost:3000

---

### 6️⃣ Login & Test

1. Open: http://localhost:3000
2. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Explore the dashboard
4. Try the AI Assistant with voice!

---

## 🎤 Voice Features

### Web Speech API (Built-in, No API Key Needed)
- **Speech Recognition:** Click 🎤 microphone button
- **Text-to-Speech:** AI responses are automatically spoken
- **Supported Browsers:** Chrome, Edge, Safari
- **100% FREE** - No API key required!

### How to Use Voice:
1. Go to "AI Assistant" page
2. Click the 🎤 microphone button
3. Speak your question (e.g., "How many seats are available?")
4. AI will respond with text AND voice
5. Click 🔇 to stop speaking

---

## 🤖 AI Capabilities (Powered by Gemini 2.5)

Ask questions like:
- "How many students are registered?"
- "Show me available seats"
- "What are the subscription plans?"
- "Tell me about the morning shift"
- "Which seats are occupied?"

The AI has real-time access to your database!

---

## 📊 Features Overview

### Admin Dashboard
- Total students count
- Available seats
- Active subscriptions
- Revenue tracking
- Recent students list
- Shift distribution

### Student Management
- Add new students
- View all students
- Delete students
- Assign seats and shifts
- Track join dates

### AI Assistant
- Natural language queries
- Voice input (speech-to-text)
- Voice output (text-to-speech)
- Real-time database access
- Conversation history

---

## 🔧 Troubleshooting

### Backend won't start
```cmd
# Check if MySQL is running
# Check .env file has correct credentials
# Try: npm run init-db
```

### Frontend won't start
```cmd
# Delete node_modules and reinstall
rmdir /s /q node_modules
npm install
```

### Voice not working
- Use Chrome or Edge browser
- Allow microphone permissions
- Check browser console for errors

### Database connection error
- Verify MySQL is running
- Check DB_PASSWORD in .env
- Ensure database exists: `adarsh_library`

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Add student
- `DELETE /api/students/:id` - Delete student

### Dashboard
- `GET /api/dashboard/stats` - Get statistics

### AI
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/voice` - Voice input

### Seats & Plans
- `GET /api/seats` - Get all seats
- `GET /api/seats/available` - Get available seats
- `GET /api/plans` - Get subscription plans

---

## 🚀 Deployment

### Backend (Node.js)
**Recommended:** Railway, Render, or Heroku
1. Push code to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy!

### Frontend (React)
**Recommended:** Vercel or Netlify
1. Build: `npm run build`
2. Deploy `build` folder
3. Set `REACT_APP_API_URL` to production backend URL

---

## 📝 Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT:** Change the default password in production!

---

## 💡 Tips

1. **Gemini API is FREE** - No credit card required
2. **Voice works offline** - Uses browser's built-in speech API
3. **Mobile friendly** - Responsive design works on phones
4. **Real-time data** - AI always has latest database info
5. **Secure** - JWT authentication, password hashing

---

## 🆘 Need Help?

Common issues:
- **Port already in use:** Change PORT in backend/.env
- **CORS errors:** Check REACT_APP_API_URL in frontend/.env
- **AI not responding:** Verify GEMINI_API_KEY is correct
- **Voice not working:** Use Chrome/Edge, allow microphone

---

## 🎉 You're All Set!

Your modern library management system is ready with:
- ✅ Node.js + Express backend
- ✅ React frontend
- ✅ MySQL database
- ✅ Gemini 2.5 AI integration
- ✅ Voice chat capabilities
- ✅ Real-time dashboard
- ✅ Student management

Enjoy your new system! 🚀
