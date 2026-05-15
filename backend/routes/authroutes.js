const express = require('express');
const { signup, signin, getProfile } = require('../controllers/authcontroller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', protect, getProfile);

module.exports = router;