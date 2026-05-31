const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, photoURL, provider: 'email' });
    res.status(201).json({ message: 'Registration successful! Please login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid email or password' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });
    const token = generateToken(user._id);
    setCookie(res, token);
    res.json({ user: { _id: user._id, name: user.name, email: user.email, photoURL: user.photoURL } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { name, email, photoURL } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, photoURL, provider: 'google' });
    }
    const token = generateToken(user._id);
    setCookie(res, token);
    res.json({ user: { _id: user._id, name: user.name, email: user.email, photoURL: user.photoURL } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
