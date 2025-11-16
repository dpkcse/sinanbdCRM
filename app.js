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


const pageAuth             = require('./middleware/auth.js');
const authRouter           = require('./routes/auth');
const leadsRouter          = require('./routes/leads');
const usersRouter          = require('./routes/users');
const contactsRouter       = require('./routes/contacts');
const prospectStagesRouter = require('./routes/prospectStages');
const dashboardRouter      = require('./routes/dashboard');
const hrEmployeesApiRouter = require('./routes/hrEmployees');
const adminRolesRouter       = require('./routes/adminRoles');
const adminPermissionsRouter = require('./routes/adminPermissions');
const adminUsersRouter       = require('./routes/adminUsers');
const verifyEmailRouter = require('./routes/verifyEmail');
const profileRouter         = require('./routes/profile');


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
        "style-src": ["'self'", "https://webtoolsbd.com", "'unsafe-inline'"],
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

// Chart.js dist ফোল্ডারকে /vendor/chart.js এর নিচে serve করব
app.use(
  '/vendor/chart.js',
  express.static(path.join(__dirname, 'node_modules', 'chart.js', 'dist'))
);

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public'))); // favicon ইত্যাদি

app.use('/', verifyEmailRouter);
app.use('/', profileRouter);

/* ===================================================================
 * PAGE ROUTES (সবগুলো pageAuth দিয়ে প্রটেক্টেড)
 * =================================================================== */

// root → login / dashboard redirect
app.get('/', pageAuth.baseRedirect);

/* ---------- Auth pages ---------- */

// Login page
app.get('/login', pageAuth.redirectIfAuthed, (req, res) =>
  res.render('login', { title: 'Login — Interior CRM' })
);

/* ---------- Dashboard (global) ---------- */

app.get('/dashboard', pageAuth.requirePageAuth, (req, res) =>
  res.render('dashboard', {
    title: 'Dashboard — Interior CRM',
    active: 'dashboard',
  })
);

/* ---------- CRM MODULE ---------- */

// Leads list
app.get('/leads', pageAuth.requirePageAuth, (req, res) =>
  res.render('leads', {
    title: 'Leads — Interior CRM',
    active: 'leads',
  })
);

// ভবিষ্যতে যদি Contacts আলাদা ভাবে ব্যবহার করো
app.get('/contacts', pageAuth.requirePageAuth, (req, res) =>
  res.render('contacts', {
    title: 'Contacts — Interior CRM',
    active: 'contacts',
  })
);

/* ---------- HRM MODULE ---------- */

// Employees page
app.get('/hr/employees', pageAuth.requirePageAuth, (req, res) =>
  res.render('hr/employees', {
    title: 'Employees — Interior HRM',
    active: 'hr_employees',
  })
);

// Attendance page
app.get('/hr/attendance', pageAuth.requirePageAuth, (req, res) =>
  res.render('hr/attendance', {
    title: 'Attendance — Interior HRM',
    active: 'hr_attendance',
  })
);

/* ---------- ACCOUNTS MODULE ---------- */

// আপাতত শুধু placeholder; পরে সাবমেনু আসবে
app.get('/accounts', pageAuth.requirePageAuth, (req, res) =>
  res.render('accounts', {
    title: 'Accounts — Interior ERP',
    active: 'accounts',
  })
);

/* ---------- SETTINGS MODULE ---------- */

// Prospect Stage settings
app.get(
  '/prospect-stages/manage',
  pageAuth.requirePageAuth,
  (req, res) =>
    res.render('prospect_stages', {
      title: 'Prospect Stage Settings — Interior CRM',
      active: 'prospect_stages',
    })
);

// User Management page
app.get('/users', pageAuth.requirePageAuth, (req, res) =>
  res.render('users', {
    title: 'User Management — Interior CRM',
    active: 'users',
  })
);

/* ===================================================================
 * API ROUTES
 * =================================================================== */

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Leads API
app.use('/api/leads', leadsRouter);

// Users API
app.use('/api/users', usersRouter);

// Prospect stages API
app.use('/api/prospect-stages', prospectStagesRouter);

// Contacts API
app.use('/api/contacts', contactsRouter);

// Dashboard সংক্রান্ত API গুলো (এই রাউট ফাইলের ভিতরে /api/... থাকবে)
app.use('/', dashboardRouter);

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

// HR Employees API
app.use('/api/hr/employees', hrEmployeesApiRouter);

// Role / Permission / User admin APIs
app.use('/api/admin/roles', adminRolesRouter);
app.use('/api/admin/permissions', adminPermissionsRouter);
app.use('/api/admin/users', adminUsersRouter);


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
