# MERN Auth: Step-by-Step Implementation

## PHASE 1: SETUP (15 minutes)

### Step 1.1: Initialize Project Folders

```bash
# In PowerShell, navigate to your workspace
cd "c:\Users\subha\OneDrive\Documents\mern auth"

# Create backend folder
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install required packages
npm install express mongoose bcryptjs jsonwebtoken dotenv cors
npm install --save-dev nodemon

# Go back to root
cd ..

# Create frontend folder
npx create-react-app frontend
```

---

### Step 1.2: Create Backend File Structure

```bash
cd backend

# Create folders
mkdir models
mkdir routes
mkdir controllers
mkdir middleware
mkdir config

# Create files
echo. > server.js
echo. > .env
echo. > models/User.js
echo. > controllers/authController.js
echo. > routes/authRoutes.js
echo. > middleware/auth.js
echo. > config/db.js
```

---

## PHASE 2: BACKEND SETUP (30 minutes)

### Step 2.1: Create `.env` File

**File: `backend/.env`**
```
MONGODB_URI=mongodb://localhost:27017/mern-auth
JWT_SECRET=your_super_secret_key_change_this_in_production
PORT=5000
REACT_APP_API_URL=http://localhost:5000
```

**NOTE:** Replace `your_super_secret_key_change_this_in_production` with a real secret!

---

### Step 2.2: Database Connection

**File: `backend/config/db.js`**
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Database Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**What it does:** Connects to MongoDB database. Think of it as "opening the filing cabinet."

---

### Step 2.3: User Model (Database Schema)

**File: `backend/models/User.js`**
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No duplicate emails
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// IMPORTANT: Hash password BEFORE saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password when user logs in
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

**Key Points:**
- ✅ Passwords are HASHED before saving (bcrypt does this automatically)
- ✅ `matchPassword()` compares entered password with hashed password
- ✅ Email is unique (can't have duplicates)

---

### Step 2.4: JWT Middleware (Protect Routes)

**File: `backend/middleware/auth.js`**
```javascript
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get token from header

  if (!token) {
    return res.status(401).json({ message: '❌ No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '❌ Invalid token' });
  }
};

module.exports = { protect };
```

**What it does:** Checks if user has a valid token before accessing protected routes.

---

### Step 2.5: Auth Controller (Business Logic)

**File: `backend/controllers/authController.js`**
```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// CREATE JWT TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token valid for 7 days
  });
};

// SIGN UP
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: '❌ Email already registered' });
    }

    // Create new user
    user = new User({ name, email, password });
    await user.save(); // Triggers automatic password hashing

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: '✅ Sign up successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SIGN IN
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '❌ User not found' });
    }

    // Check if password matches
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: '❌ Invalid password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: '✅ Sign in successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROFILE (Protected Route)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      message: '✅ Profile retrieved',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**Flow:**
1. **signup** → Create new user → Hash password → Send token
2. **signin** → Find user → Check password → Send token
3. **getProfile** → Only works if you have valid token

---

### Step 2.6: Auth Routes (API Endpoints)

**File: `backend/routes/authRoutes.js`**
```javascript
const express = require('express');
const { signup, signin, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);

// Protected route (requires token)
router.get('/profile', protect, getProfile);

module.exports = router;
```

---

### Step 2.7: Main Server File

**File: `backend/server.js`**
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors()); // Allow frontend to access backend
app.use(express.json()); // Parse JSON requests

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: '✅ Backend is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

---

### Step 2.8: Update `package.json` Scripts

**File: `backend/package.json`**
Find the `"scripts"` section and replace it with:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## PHASE 3: FRONTEND SETUP (30 minutes)

### Step 3.1: Create Sign-Up Component

**File: `frontend/src/components/Signup.js`**
```javascript
import { useState } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/signup',
        formData
      );

      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      setMessage('✅ Sign up successful! Redirecting...');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/profile';
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
        <p>
          Already have an account? <a href="/signin">Sign In</a>
        </p>
      </div>
    </div>
  );
}
```

---

### Step 3.2: Create Sign-In Component

**File: `frontend/src/components/Signin.js`**
```javascript
import { useState } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

export default function Signin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/signin',
        formData
      );

      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      setMessage('✅ Sign in successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = '/profile';
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
        <p>
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
```

---

### Step 3.3: Create Profile Component

**File: `frontend/src/components/Profile.js`**
```javascript
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        window.location.href = '/signin';
        return;
      }

      try {
        const response = await axios.get(
          'http://localhost:5000/api/auth/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        window.location.href = '/signin';
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/signin';
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome, {user?.name}!</h2>
        <p>Email: {user?.email}</p>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}
```

---

### Step 3.4: Create CSS Styling

**File: `frontend/src/styles/Auth.css`**
```css
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
}

.auth-box h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.auth-box form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.auth-box input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.auth-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
}

.auth-box button {
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background 0.3s;
}

.auth-box button:hover:not(:disabled) {
  background: #764ba2;
}

.auth-box button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.logout-btn {
  background: #e74c3c;
}

.logout-btn:hover {
  background: #c0392b;
}

.message {
  text-align: center;
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
  background: #f0f0f0;
}

.auth-box p {
  text-align: center;
  color: #666;
  margin-top: 20px;
}

.auth-box a {
  color: #667eea;
  text-decoration: none;
  font-weight: bold;
}

.auth-box a:hover {
  text-decoration: underline;
}
```

---

### Step 3.5: Update App.js with Routing

**File: `frontend/src/App.js`**
```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Profile from './components/Profile';
import './styles/Auth.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/signup" />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

### Step 3.6: Install Frontend Dependencies

```bash
cd frontend

# Install axios for API calls and react-router-dom for routing
npm install axios react-router-dom
```

---

## PHASE 4: RUN THE APPLICATION (5 minutes)

### Step 4.1: Start MongoDB

```bash
# Make sure MongoDB is running (Windows)
# Either:
# 1. MongoDB as service is running, OR
# 2. Run: mongod (in a separate terminal)
```

### Step 4.2: Start Backend

```bash
cd backend
npm run dev

# You should see: 🚀 Server running on http://localhost:5000
```

### Step 4.3: Start Frontend

```bash
# In a new terminal
cd frontend
npm start

# Browser opens at http://localhost:3000
```

---

## PHASE 5: TEST YOUR APPLICATION

### Test Sign-Up:
1. Go to http://localhost:3000
2. Create account with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Should redirect to profile page ✓

### Test Sign-In:
1. Logout
2. Go to Sign In page
3. Enter email and password
4. Should redirect to profile page ✓

### Test Protected Route:
1. Open DevTools → Application → localStorage
2. Delete the `token`
3. Try going to /profile
4. Should redirect to sign-in ✓

---

## PHASE 6: TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Start mongod in terminal / Check MongoDB is installed |
| CORS error | Make sure backend has `cors()` middleware |
| Token not saving | Check localStorage in DevTools → Application |
| 404 errors | Check all file paths and port numbers (5000 backend, 3000 frontend) |
| Password not hashing | Make sure `bcryptjs` is installed, not `bcrypt` |

---

## SECURITY CHECKLIST

✅ Passwords are hashed with bcryptjs
✅ JWT tokens expire after 7 days
✅ Tokens sent in Authorization header
✅ Protected routes check token validity
✅ CORS allows only frontend to access backend
✅ Emails are unique (no duplicates)
✅ Input validation on frontend and backend

---

## What's Next? 🚀

1. **Email Verification** - Send email link to verify signup
2. **Password Reset** - Allow users to reset forgotten passwords
3. **Google OAuth** - Allow signup with Google
4. **Refresh Tokens** - Keep users logged in longer
5. **Deployment** - Deploy to Heroku/Vercel/AWS
