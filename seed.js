require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcryptjs');


(async () => {
try {
const pass = await bcrypt.hash('admin123', 10);
await pool.query(
'INSERT INTO users (email, name, password_hash, role) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE email=email',
['admin@example.com', 'Admin', pass, 'ADMIN']
);
console.log('Seeded admin@example.com / admin123');
process.exit(0);
} catch (e) {
console.error(e);
process.exit(1);
}
})();