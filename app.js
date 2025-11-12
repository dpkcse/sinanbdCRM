// app.js
require('dotenv').config();
const createError  = require('http-errors');
const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const logger       = require('morgan');
const helmet       = require('helmet');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');

const pageAuth     = require('./middleware/pageAuth');
const authRouter   = require('./routes/auth');
const leadsRouter  = require('./routes/leads');
const usersRouter  = require('./routes/users');
const contactsRouter = require('./routes/contacts'); // থাকলে

const app = express();

/* ---------- View engine ---------- */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* ---------- Security headers (helmet first) ---------- */
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src":  ["'self'"],
      "style-src":   ["'self'"],
      "img-src":     ["'self'", "data:"],
      "font-src":    ["'self'", "data:"],
      "connect-src": ["'self'"]
    }
  }
}));

/* ---------- Common middleware ---------- */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));

/* ---------- STATIC (scoped vendor maps) ---------- */
app.use('/vendor/admin-lte',   express.static(path.join(__dirname, 'node_modules', 'admin-lte')));
app.use('/vendor/bootstrap',   express.static(path.join(__dirname, 'node_modules', 'bootstrap')));
app.use('/vendor/jquery',      express.static(path.join(__dirname, 'node_modules', 'jquery')));
app.use('/vendor/@fortawesome',express.static(path.join(__dirname, 'node_modules', '@fortawesome')));
app.use('/vendor/chart.js',    express.static(path.join(__dirname, 'node_modules', 'chart.js')));
app.use('/vendor/select2',     express.static(path.join(__dirname, 'node_modules', 'select2')));

app.use('/stylesheets', express.static(path.join(__dirname, 'public', 'stylesheets')));
app.use('/javascripts', express.static(path.join(__dirname, 'public', 'javascripts')));
app.use('/images',      express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public'))); // e.g., /favicon.ico

/* ---------- Pages (guarded) ---------- */
app.get('/', pageAuth.baseRedirect); // লগইন থাকলে /dashboard, নাহলে /login

app.get('/login', pageAuth.redirectIfAuthed, (req, res) =>
  res.render('login', { title: 'Login — Interior CRM' })
);

app.get('/dashboard', pageAuth.requirePageAuth, (req, res) =>
  res.render('dashboard', { title: 'Dashboard — Interior CRM' })
);

app.get('/leads', pageAuth.requirePageAuth, (req, res) =>
  res.render('leads', { title: 'Leads — Interior CRM' })
);

// যদি contacts এখনো লাগে, প্রোটেক্ট করে দাও:
app.get('/contacts', pageAuth.requirePageAuth, (req, res) =>
  res.render('contacts', { title: 'Contacts — Interior CRM' })
);
// না লাগলে:
// app.get('/contacts', (req, res) => res.redirect('/leads'));

/* ---------- APIs ---------- */
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/leads',  leadsRouter);
app.use('/api/users',  usersRouter);

// brute force থামাতে login রুটে rate limit
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
}));
app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);

/* ---------- 404 ---------- */
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
