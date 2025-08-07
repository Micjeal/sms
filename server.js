require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Import models
const User = require('./models/User');
const News = require('./models/News');
const Event = require('./models/Event');
const Setting = require('./models/Setting');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'brightminds_secret_key';

// Connect to MongoDB
connectDB();

// Initialize settings with default values if not exists
const initializeSettings = async () => {
  try {
    // This will create default settings if they don't exist
    await Setting.initializeSettings(null);
    console.log('Settings initialized');
  } catch (err) {
    console.error('Error initializing settings:', err);
  }
};

// Call the initialization function
initializeSettings();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// News routes
app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .populate('author', 'name');
    res.json(news);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/news', verifyToken, async (req, res) => {
  try {
    const { title, content, category = 'general', tags = [], imageUrl = '' } = req.body;
    
    // Check if user has permission to create news
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Not authorized to create news' });
    }

    const newArticle = new News({
      title,
      content,
      category,
      tags,
      imageUrl,
      author: req.user.id,
      isPublished: req.user.role === 'admin' // Only admins can publish directly
    });

    const article = await newArticle.save();
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update news article
app.put('/api/news/:id', verifyToken, async (req, res) => {
  try {
    const { title, content, category, tags, imageUrl, isPublished } = req.body;
    
    // Find the article
    let article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this article' });
    }

    // Update fields
    article.title = title || article.title;
    article.content = content || article.content;
    article.category = category || article.category;
    article.tags = tags || article.tags;
    article.imageUrl = imageUrl || article.imageUrl;
    
    // Only admins can change published status
    if (req.user.role === 'admin') {
      article.isPublished = isPublished !== undefined ? isPublished : article.isPublished;
    }

    await article.save();
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete news article
app.delete('/api/news/:id', verifyToken, async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this article' });
    }

    await article.remove();
    res.json({ message: 'Article removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new event
app.post('/api/events', verifyToken, async (req, res) => {
  try {
    // Only admins and teachers can create events
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Not authorized to create events' });
    }

    const { title, description, date, time, location } = req.body;
    
    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      createdBy: req.user.id
    });

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update event
app.put('/api/events/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, date, time, location } = req.body;
    
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    // Update fields
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete event
app.delete('/api/events/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await event.remove();
    res.json({ message: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Users routes
// Get all users (admin only)
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    // Only admins can see all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new user (admin only)
app.post('/api/users', verifyToken, async (req, res) => {
  try {
    // Only admins can create users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, email, role = 'student', department } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user with default password
    user = new User({
      name,
      email,
      password: 'password123', // Will be hashed by the pre-save hook
      role,
      department
    });

    await user.save();
    
    // Don't send back the password
    const { password, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', verifyToken, async (req, res) => {
  try {
    // Only admins can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Prevent deleting self
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting other admins unless you're the super admin
    if (user.role === 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Cannot delete another admin' });
    }

    await user.remove();
    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Settings routes
app.get('/api/settings', verifyToken, async (req, res) => {
  try {
    const settings = await Setting.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/settings', verifyToken, async (req, res) => {
  try {
    // Only admins can update settings
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const {
      schoolName,
      email,
      phone,
      address,
      website
    } = req.body;

    // Update settings
    const settings = await Setting.findOneAndUpdate(
      {},
      {
        schoolName,
        email,
        phone,
        address,
        website,
        updatedBy: req.user.id
      },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', verifyToken, async (req, res) => {
  try {
    const [
      totalStudents,
      facultyMembers,
      newsArticles,
      upcomingEvents
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      News.countDocuments({ isPublished: true }),
      Event.countDocuments({ date: { $gte: new Date() } })
    ]);

    res.json({
      totalStudents,
      facultyMembers,
      newsArticles,
      upcomingEvents
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});