# Adarsh Library Management System v2.0

Modern library management system built with Node.js, React, MySQL, and Gemini 2.5 AI.

## 🚀 Features

### Admin Panel
- Admin authentication with JWT
- Student CRUD operations
- Seat management
- Subscription management
- Real-time dashboard statistics

### AI Assistant (Gemini 2.5)
- Natural language database queries
- Voice chat (speech-to-text + text-to-speech)
- Intelligent responses about library data
- Context-aware conversations

### Voice Features
- Browser-based Web Speech API (no API key needed)
- Google Cloud Speech-to-Text (optional, for better accuracy)
- Text-to-speech responses

## 📋 Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Google AI Studio account (for Gemini API key)

## 🔧 Setup Instructions

### 1. Get API Keys

#### Gemini 2.5 API Key (Required)
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key

#### Google Cloud Speech API (Optional - for better voice accuracy)
1. Visit: https://console.cloud.google.com
2. Enable Speech-to-Text API
3. Create credentials

### 2. Backend Setup

```bash
cd adarsh_lib.2/backend
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=adarsh_library

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud Speech (Optional)
GOOGLE_CLOUD_SPEECH_KEY=your_google_cloud_key
```

Run migrations and start server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd adarsh_lib.2/frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

Start development server:
```bash
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Login**: 
  - Username: `admin`
  - Password: `admin123`

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Add new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### AI Chat
- `POST /api/ai/chat` - Send message to Gemini AI
- `POST /api/ai/voice` - Process voice input

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🗣️ Voice Feature Usage

The app uses **Web Speech API** by default (no API key needed):
- Click microphone button
- Speak your question
- AI responds with text and voice

For better accuracy, you can enable Google Cloud Speech-to-Text in settings.

## 🤖 AI Capabilities

Ask Gemini AI about:
- "How many seats are available?"
- "Show me all students"
- "What are the subscription plans?"
- "Which seats are in the morning shift?"
- "Tell me about student with phone number 1234567890"

## 🛠️ Technology Stack

### Backend
- Node.js + Express
- MySQL2 (with connection pooling)
- JWT authentication
- Gemini 2.5 AI SDK
- bcrypt for password hashing

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Tailwind CSS
- Web Speech API
- Context API for state management

## 📦 Project Structure

```
adarsh_lib.2/
├── backend/
│   ├── config/          # Database & app config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & validation
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (AI, etc.)
│   └── server.js        # Entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # State management
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention
- CORS configuration
- Environment variable protection
- Input validation

## 🚀 Deployment

### Backend (Node.js)
- Deploy to: Heroku, Railway, Render, or DigitalOcean
- Set environment variables
- Configure MySQL database

### Frontend (React)
- Deploy to: Vercel, Netlify, or Cloudflare Pages
- Build: `npm run build`
- Set REACT_APP_API_URL to production backend URL

## 📝 License

MIT License - Feel free to use for learning and commercial projects!
