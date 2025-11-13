// app.js
require('dotenv').config();
const createError    = require('http-errors');
const express        = require('express');
const path           = require('path');
const cookieParser   = require('cookie-parser');
const logger         = require('morgan');
const helmet         = require('helmet');
const cors           = require('cors');
const rateLimit      = require('express-rate-limit');

const pageAuth       = require('./middleware/pageAuth');
const authRouter     = require('./routes/auth');
const leadsRouter    = require('./routes/leads');
const usersRouter    = require('./routes/users');
const contactsRouter = require('./routes/contacts');
const prospectStagesRouter = require('./routes/prospectStages');

const app = express();

/* ---------- View engine ---------- */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* ---------- Security headers ---------- */
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'"],
        "img-src": ["'self'", "data:"],
        "font-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
      },
    },
  })
);

/* ---------- Common middleware ---------- */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);

/* ---------- STATIC (vendor + public) ---------- */
app.use(
  '/vendor/admin-lte',
  express.static(path.join(__dirname, 'node_modules', 'admin-lte'))
);
app.use(
  '/vendor/bootstrap',
  express.static(path.join(__dirname, 'node_modules', 'bootstrap'))
);
app.use(
  '/vendor/jquery',
  express.static(path.join(__dirname, 'node_modules', 'jquery'))
);
app.use(
  '/vendor/@fortawesome',
  express.static(path.join(__dirname, 'node_modules', '@fortawesome'))
);
app.use(
  '/vendor/chart.js',
  express.static(path.join(__dirname, 'node_modules', 'chart.js'))
);
app.use(
  '/vendor/select2',
  express.static(path.join(__dirname, 'node_modules', 'select2'))
);

app.use(
  '/stylesheets',
  express.static(path.join(__dirname, 'public', 'stylesheets'))
);
app.use(
  '/javascripts',
  express.static(path.join(__dirname, 'public', 'javascripts'))
);
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public'))); // e.g. favicon

/* ---------- PAGE ROUTES (guarded with pageAuth) ---------- */

// লগইন থাকলে /dashboard, নাহলে /login
app.get('/', pageAuth.baseRedirect);

// Login page
app.get('/login', pageAuth.redirectIfAuthed, (req, res) =>
  res.render('login', { title: 'Login — Interior CRM' })
);

// Dashboard
app.get('/dashboard', pageAuth.requirePageAuth, (req, res) =>
  res.render('dashboard', { title: 'Dashboard — Interior CRM' })
);

// Leads page
app.get('/leads', pageAuth.requirePageAuth, (req, res) =>
  res.render('leads', { title: 'Leads — Interior CRM', active: 'leads' })
);

// Contacts (যদি ব্যবহার করো)
app.get('/contacts', pageAuth.requirePageAuth, (req, res) =>
  res.render('contacts', { title: 'Contacts — Interior CRM' })
);

// Prospect Stage settings page (sidebar থেকে /prospect-stages/manage)
app.get(
  '/prospect-stages/manage',
  pageAuth.requirePageAuth,
  (req, res) =>
    res.render('prospect_stages', {
      title: 'Prospect Stage Settings — Interior CRM',
      active: 'prospect_stages',
    })
);

/* ---------- API ROUTES ---------- */

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Leads API
app.use('/api/leads', leadsRouter);

// Users API
app.use('/api/users', usersRouter);

// Prospect stages API (list / create / update / delete)
app.use('/api/prospect-stages', prospectStagesRouter);

// Contacts API
app.use('/api/contacts', contactsRouter);

// Login API (rate limited)
app.use(
  '/api/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use('/api/auth', authRouter);

/* ---------- 404 handler ---------- */
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  next(createError(404));
});

/* ---------- Error handler ---------- */
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ error: err.message || 'Server error' });
  }
  res.status(status).type('text').send(`${status} ${err.message || 'Error'}`);
});

module.exports = app;
