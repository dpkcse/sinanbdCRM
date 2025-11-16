// middleware/requirePermission.js
module.exports = function requirePermission(permissionCode) {
    return (req, res, next) => {
      // ধরে নিচ্ছি auth middleware আগে req.user সেট করে
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthenticated' });
      }
  
      // req.user.permissions = ['employees.view','employees.manage', ...]
      const perms = user.permissions || [];
      if (!perms.includes(permissionCode) && !perms.includes('*')) {
        return res.status(403).json({ error: 'Forbidden' });
      }
  
      next();
    };
  };
  