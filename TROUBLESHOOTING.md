# 🔧 Troubleshooting Guide - AI Not Responding

## Issue: "Sorry, I encountered an error. Please try again."

This error means the AI backend is having trouble connecting to Gemini API. Let's fix it!

---

## ✅ Step-by-Step Fix

### Step 1: Check Backend is Running

Open your backend terminal and verify you see:
```
🚀 Server running on port 5000
📍 API URL: http://localhost:5000/api
```

**If not running:**
```cmd
cd adarsh_lib.2\backend
npm run dev
```

---

### Step 2: Test Gemini API Connection

Open your browser and visit:
```
http://localhost:5000/api/ai/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Gemini AI is working!",
  "testResponse": "Hello! ..."
}
```

**If you see error:**
- Check your API key is correct
- Verify internet connection
- See Step 3 below

---

### Step 3: Verify Gemini API Key

1. **Check your .env file** (`backend/.env`):
   ```env
   GEMINI_API_KEY=AIzaSy...your_key_here
   ```

2. **Verify the key is valid:**
   - Go to: https://aistudio.google.com/app/apikey
   - Check if your key is listed
   - If not, create a new one

3. **Test the key manually:**
   - Visit: https://aistudio.google.com/app/prompts/new_chat
   - Try sending a message
   - If it works there, your key is valid

---

### Step 4: Check Backend Logs

Look at your backend terminal for errors:

**Common Errors:**

**Error: "API key not valid"**
```
Solution: Get a new API key from https://aistudio.google.com/app/apikey
```

**Error: "ECONNREFUSED" or "Network error"**
```
Solution: Check your internet connection
```

**Error: "Model not found"**
```
Solution: Already fixed! Restart backend server
```

**Error: "Database connection failed"**
```
Solution: Check MySQL is running and credentials in .env
```

---

### Step 5: Restart Backend Server

1. **Stop the backend** (Ctrl+C in terminal)

2. **Clear any cache:**
   ```cmd
   cd adarsh_lib.2\backend
   rmdir /s /q node_modules
   npm install
   ```

3. **Restart:**
   ```cmd
   npm run dev
   ```

---

### Step 6: Check Frontend Connection

1. **Open browser console** (F12)

2. **Go to AI Assistant page**

3. **Send a message**

4. **Check Network tab:**
   - Look for request to `/api/ai/chat`
   - Check if it's reaching the backend
   - Look at response

**Common Issues:**

**404 Not Found:**
```
Solution: Backend not running or wrong URL
Check: REACT_APP_API_URL in frontend/.env
Should be: http://localhost:5000/api
```

**CORS Error:**
```
Solution: Backend CORS not configured
Already fixed in code, restart backend
```

---

## 🔍 Quick Diagnostics

### Test 1: Backend Health
```
Visit: http://localhost:5000/api/health
Expected: {"status":"ok","message":"Adarsh Library API is running"}
```

### Test 2: Gemini API
```
Visit: http://localhost:5000/api/ai/test
Expected: {"success":true,"message":"Gemini AI is working!"}
```

### Test 3: Database Connection
```
Visit: http://localhost:5000/api/dashboard/stats
Expected: Statistics data
```

---

## 🛠️ Common Solutions

### Solution 1: Get New API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the new key
4. Update `backend/.env`:
   ```env
   GEMINI_API_KEY=your_new_key_here
   ```
5. Restart backend

### Solution 2: Use Alternative Model

If `gemini-pro` doesn't work, try:

Edit `backend/routes/aiRoutes.js`:
```javascript
// Try this model instead
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

### Solution 3: Check Firewall

Your firewall might be blocking the API:
- Temporarily disable firewall
- Try again
- If it works, add exception for Node.js

### Solution 4: Use VPN

Sometimes ISP blocks Google APIs:
- Connect to VPN
- Try again

---

## 📋 Checklist

Before asking for help, verify:

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] MySQL is running
- [ ] Database initialized (`npm run init-db`)
- [ ] `.env` file exists in backend folder
- [ ] `GEMINI_API_KEY` is set in `.env`
- [ ] API key is valid (test at aistudio.google.com)
- [ ] Internet connection is working
- [ ] No firewall blocking
- [ ] Browser console shows no errors

---

## 🔬 Advanced Debugging

### Check Backend Logs

Your backend terminal should show:
```
POST /api/ai/chat 200 1234ms
```

If you see:
```
POST /api/ai/chat 500 100ms
AI chat error: [error details]
```

This tells you the exact error!

### Test with cURL

```cmd
curl -X POST http://localhost:5000/api/ai/chat ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer your_jwt_token" ^
  -d "{\"message\":\"Hello\"}"
```

### Check Database

```sql
-- Connect to MySQL
mysql -u root -p

-- Use database
USE adarsh_library;

-- Check tables exist
SHOW TABLES;

-- Check data
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM seats;
```

---

## 🆘 Still Not Working?

### Option 1: Use Fallback AI

Edit `backend/routes/aiRoutes.js` and add a simple fallback:

```javascript
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Simple fallback responses
    const responses = {
      'seats': 'We have 60 total seats in the library.',
      'students': 'Check the dashboard for student count.',
      'plans': 'We offer Daily, Weekly, Monthly, and Yearly plans.',
      'default': 'I can help with seats, students, and plans information.'
    };
    
    const keyword = Object.keys(responses).find(k => 
      message.toLowerCase().includes(k)
    );
    
    res.json({
      success: true,
      response: responses[keyword] || responses.default
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### Option 2: Disable AI Temporarily

Comment out AI routes in `backend/server.js`:
```javascript
// app.use('/api/ai', aiRoutes);
```

Focus on CRUD operations first, fix AI later.

---

## 📞 Get Help

If still stuck, provide these details:

1. **Backend terminal output** (last 20 lines)
2. **Browser console errors** (F12 → Console tab)
3. **Network tab** (F12 → Network → ai/chat request)
4. **Your .env file** (hide the actual API key!)
5. **Node.js version** (`node --version`)
6. **Operating system**

---

## ✅ Success Indicators

When working correctly, you should see:

**Backend Terminal:**
```
🚀 Server running on port 5000
POST /api/ai/chat 200 1234ms
```

**Browser Console:**
```
No errors
```

**AI Response:**
```
"There are currently 60 seats available in the library."
```

---

## 🎯 Quick Fix Commands

```cmd
# Stop everything
Ctrl+C (in both terminals)

# Backend
cd adarsh_lib.2\backend
npm install
npm run dev

# Frontend (new terminal)
cd adarsh_lib.2\frontend
npm install
npm start

# Test
Visit: http://localhost:5000/api/ai/test
```

---

**Most Common Fix:** Just restart the backend server! 🔄

Good luck! 🚀
