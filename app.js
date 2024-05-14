const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');



// Initialize Express app
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: '123xyz',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 10 * 60 * 1000 }
}));


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/loginapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const indexRoute = require('./routes/index');
app.use('/', indexRoute);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
