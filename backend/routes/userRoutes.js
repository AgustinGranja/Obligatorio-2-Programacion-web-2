// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const session = require('express-session');

router.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambia a true en producción si usas HTTPS
}));

router.post('/register', async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();
    req.session.userId = newUser._id;
    res.json(newUser);
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username, password: req.body.password });
    if (user) {
        req.session.userId = user._id;
        res.json(user);
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});

module.exports = router;