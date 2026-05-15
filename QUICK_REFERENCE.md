# Quick Reference & Command Cheatsheet

## 🚀 Quick Start Commands

### Initialize Everything (Copy & Paste)

```bash
# 1. Navigate to project
cd "c:\Users\subha\OneDrive\Documents\mern auth"

# 2. Create backend
mkdir backend
cd backend
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv cors
npm install --save-dev nodemon
cd ..

# 3. Create frontend
npx create-react-app frontend
cd frontend
npm install axios react-router-dom
cd ..
```

---

## 📁 File Checklist

### Backend Files (Create in `backend/` folder)

- [ ] `server.js` - Main server file
- [ ] `.env` - Environment variables
- [ ] `package.json` - Should auto-generate (edit scripts)
- [ ] `config/db.js` - Database connection
- [ ] `models/User.js` - User schema
- [ ] `controllers/authController.js` - Business logic
- [ ] `routes/authRoutes.js` - API endpoints
- [ ] `middleware/auth.js` - JWT verification

### Frontend Files (Create in `frontend/src/` folder)

- [ ] `components/Signup.js` - Sign-up form
- [ ] `components/Signin.js` - Sign-in form
- [ ] `components/Profile.js` - Profile page
- [ ] `styles/Auth.css` - Styling
- [ ] `App.js` - Routing (update existing file)

---

## 🔗 API Endpoints Reference

```
POST /api/auth/signup
├─ Request: { name, email, password }
└─ Response: { token, user }

POST /api/auth/signin
├─ Request: { email, password }
└─ Response: { token, user }

GET /api/auth/profile
├─ Headers: Authorization: Bearer {token}
└─ Response: { user }
```

---

## 💾 Environment Variables (`.env` file)

```env
MONGODB_URI=mongodb://localhost:27017/mern-auth
JWT_SECRET=my_super_secret_key_12345_change_in_production
PORT=5000
```

**Where to find the file:** `backend/.env`

---

## 🔐 Key Security Points

| Feature | Location | How It Works |
|---------|----------|------------|
| Password Hashing | `models/User.js` | bcryptjs auto-hashes before saving |
| JWT Token | `controllers/authController.js` | Creates token with 7-day expiry |
| Token Verification | `middleware/auth.js` | Checks token on protected routes |
| Password Comparison | `models/User.js` | `matchPassword()` method |
| CORS | `server.js` | Allows frontend to access backend |

---

## 🐛 Debugging Checklist

### Backend Issues

```bash
# Test if backend is running
curl http://localhost:5000

# Check MongoDB connection
# Look for ✅ MongoDB Connected in console

# Test signup endpoint
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'
```

### Frontend Issues

```bash
# Check localStorage
# Open DevTools → Application → localStorage
# Should have "token" key after login

# Check Network tab
# See if requests go to http://localhost:5000

# Check Console
# Look for CORS or connection errors
```

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   USER SIGNUP FLOW                      │
└─────────────────────────────────────────────────────────┘

1. User fills form (React Component)
        ↓
2. Frontend sends POST to /api/auth/signup
        ↓
3. Backend receives request (Express Route)
        ↓
4. Check if email exists (MongoDB Query)
        ↓
5. Hash password (bcryptjs)
        ↓
6. Save user to database (MongoDB)
        ↓
7. Create JWT token (jsonwebtoken)
        ↓
8. Send back token + user info (JSON Response)
        ↓
9. Frontend stores token in localStorage
        ↓
10. Redirect to /profile page
        ↓
✅ USER LOGGED IN


┌─────────────────────────────────────────────────────────┐
│                   USER SIGNIN FLOW                      │
└─────────────────────────────────────────────────────────┘

1. User fills login form
        ↓
2. Frontend sends POST to /api/auth/signin
        ↓
3. Backend finds user by email (MongoDB)
        ↓
4. Compare entered password with hashed password (bcryptjs)
        ↓
5. If match: Create JWT token
        ↓
6. Send token back to frontend
        ↓
7. Frontend stores in localStorage
        ↓
✅ USER LOGGED IN


┌─────────────────────────────────────────────────────────┐
│              PROTECTED ROUTE FLOW                       │
└─────────────────────────────────────────────────────────┘

1. User requests /profile
        ↓
2. Frontend sends GET with Authorization header
        ├─ Header: "Authorization: Bearer {token}"
        ↓
3. Backend middleware (auth.js) checks token
        ↓
4. If valid: Extract user ID from token
        ↓
5. Query user from database
        ↓
6. Return user data
        ↓
✅ PROFILE LOADED

```

---

## 🎯 Testing Scenarios

### Scenario 1: New User Signup
```
1. Go to http://localhost:3000/signup
2. Enter:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
3. Click "Sign Up"
4. Should see: ✅ Sign up successful
5. Redirects to /profile
6. See: "Welcome, John Doe!" with email
```

### Scenario 2: User Signin
```
1. Go to http://localhost:3000/signin
2. Enter:
   - Email: john@example.com
   - Password: password123
3. Click "Sign In"
4. Should see: ✅ Sign in successful
5. Redirects to /profile
```

### Scenario 3: Duplicate Email
```
1. Try to signup with same email twice
2. Should see: ❌ Email already registered
```

### Scenario 4: Wrong Password
```
1. Signin with correct email, wrong password
2. Should see: ❌ Invalid password
```

### Scenario 5: Protected Route
```
1. Open DevTools → Application → localStorage
2. Delete "token" entry
3. Go to /profile
4. Should redirect to /signin
```

---

## 📋 Token Structure

When you create a token, it looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6IjY0MjMxYWFiODlhY2QxMjM0NTY3ODkwYSIsImlhdCI6MTY3Nzc5NjI1MCwiZXhwIjoxNjc4NDAxMDUwfQ.
eW9vdF9jb2RpbmdfdGVzdA
```

It has 3 parts separated by dots:
1. **Header** - Algorithm type (HS256)
2. **Payload** - User ID + timestamps
3. **Signature** - Secret validation

JWT Secret acts like a "stamp" - only the backend can verify it's real!

---

## 🔄 Common Modifications

### Increase Token Expiry to 30 Days

**File:** `backend/controllers/authController.js`
```javascript
// Change this line:
expiresIn: '7d',  // Old: 7 days
// To:
expiresIn: '30d',  // New: 30 days
```

### Add Username in Response

**File:** `backend/models/User.js`
```javascript
// Add to schema:
username: {
  type: String,
  unique: true,
}
```

### Change Database Name

**File:** `backend/.env`
```bash
# Change this:
MONGODB_URI=mongodb://localhost:27017/mern-auth
# To:
MONGODB_URI=mongodb://localhost:27017/my-app-name
```

---

## 📞 Error Messages Reference

| Error | Meaning | Fix |
|-------|---------|-----|
| ECONNREFUSED | Backend not running | Run `npm run dev` in backend folder |
| ❌ Email already registered | User exists | Use different email |
| ❌ Invalid password | Password incorrect | Check password |
| ❌ No token provided | Not logged in | Login first |
| CORS error | Frontend/backend mismatch | Check ports (3000 & 5000) |
| MongoServerSelectionError | MongoDB not running | Start MongoDB |
| Cannot read property 'startsWith' | Authorization header missing | Frontend not sending token |

---

## 🎓 Learning Outcomes

After completing this project, you'll understand:

✅ How authentication works from end-to-end
✅ What JWT tokens are and why they're secure
✅ Password hashing and bcryptjs
✅ How to structure a MERN backend
✅ Frontend-backend communication
✅ Protected routes and middleware
✅ MongoDB schemas and models
✅ Express routing
✅ React state management
✅ LocalStorage usage

---

## 🚀 Deployment Next Steps

Once everything works locally:

1. **Deploy Backend**
   - Use Heroku, Railway, or Render
   - Set environment variables in production
   - Update `MONGODB_URI` to cloud database (MongoDB Atlas)

2. **Deploy Frontend**
   - Use Vercel or Netlify
   - Update `REACT_APP_API_URL` to your backend URL
   - Run `npm run build`

3. **Update CORS**
   - Change `cors()` to `cors({ origin: 'your-frontend-url' })`

---

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [JWT Intro](https://jwt.io/introduction)
- [bcryptjs Docs](https://github.com/dcodeIO/bcrypt.js)
- [React Router Docs](https://reactrouter.com)

---

**Good luck! 🎉 You got this!**
