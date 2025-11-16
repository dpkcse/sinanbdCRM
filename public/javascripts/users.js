// public/javascripts/users.js

function getToken() {
    return (
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    );
  }
  
  async function api(path, options = {}) {
    const token = getToken();
  
    const headers = Object.assign(
      { 'Content-Type': 'application/json' },
      options.headers || {}
    );
    if (token) headers['Authorization'] = 'Bearer ' + token;
  
    const res = await fetch(path, { ...options, headers });
  
    if (res.status === 401) {
      alert('আপনার সেশন শেষ হয়ে গেছে বা অনুমতি নেই। আবার লগইন করুন।');
      window.location.href = '/login';
      return null;
    }
  
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error('API ' + res.status + ' ' + txt);
    }
  
    if (res.status === 204) return null;
    return res.json();
  }
  
  // ---------- STATE ----------
  let users       = [];
  let roles       = [];
  let permissions = [];
  
  function escapeHtml(str) {
    return (str || '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  
  // ---------- LOADERS ----------
  async function loadUsers() {
    const q = document.getElementById('userSearch').value.trim();
    const data = await api('/api/admin/users?q=' + encodeURIComponent(q));
    if (!data) return;
    users = data.data || [];
    renderUsers();
  }
  
  async function loadRoles() {
    const data = await api('/api/admin/roles');
    if (!data) return;
    roles = data.data || [];
    renderRoles();
  }
  
  async function loadPermissions() {
    const data = await api('/api/admin/permissions');
    if (!data) return;
    permissions = data.data || [];
    renderPermissions();
  }
  
  // ---------- RENDERERS ----------
  function renderUsers() {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;
  
    if (!users.length) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center text-muted">No users found.</td></tr>';
      return;
    }
  
    tbody.innerHTML = users
      .map((u) => {
        const statusLabel = u.is_active ? 'Active' : 'Inactive';
        return `
          <tr data-id="${u.id}">
            <td>
              <div class="font-weight-semibold">${escapeHtml(u.name || '')}</div>
              <div class="text-muted small">${escapeHtml(u.email || '')}</div>
            </td>
            <td>
              <span class="badge badge-light">${escapeHtml(statusLabel)}</span>
            </td>
            <td>
              ${
                u.role_names
                  ? escapeHtml(u.role_names)
                  : '<span class="text-muted">No roles</span>'
              }
            </td>
            <td>
              <button class="btn btn-xs btn-outline-secondary btn-user-roles" data-id="${u.id}">
                Roles
              </button>
              <button class="btn btn-xs btn-outline-danger btn-reset-password ml-1" data-id="${u.id}">
                Reset
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }
  
  function renderRoles() {
    const tbody = document.getElementById('roleTableBody');
    if (!tbody) return;
  
    if (!roles.length) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center text-muted">No roles defined.</td></tr>';
      return;
    }
  
    tbody.innerHTML = roles
      .map((r) => {
        return `
          <tr data-id="${r.id}">
            <td>${escapeHtml(r.name)}</td>
            <td><code>${escapeHtml(r.slug)}</code></td>
            <td>${escapeHtml(r.permission_slugs || '')}</td>
            <td>
              <button class="btn btn-xs btn-outline-secondary btn-edit-role" data-id="${r.id}">
                Edit
              </button>
              <button class="btn btn-xs btn-outline-danger btn-del-role" data-id="${r.id}">
                Del
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }
  
  function renderPermissions() {
    const tbody = document.getElementById('permTableBody');
    if (!tbody) return;
  
    if (!permissions.length) {
      tbody.innerHTML =
        '<tr><td colspan="3" class="text-center text-muted">No permissions defined.</td></tr>';
      return;
    }
  
    tbody.innerHTML = permissions
      .map((p) => {
        return `
          <tr data-id="${p.id}">
            <td>${escapeHtml(p.name)}</td>
            <td><code>${escapeHtml(p.slug)}</code></td>
            <td>
              <button class="btn btn-xs btn-outline-secondary btn-edit-perm" data-id="${p.id}">
                Edit
              </button>
              <button class="btn btn-xs btn-outline-danger btn-del-perm" data-id="${p.id}">
                Del
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }
  
  function renderRolePermissionCheckboxes(selectedSlugs = []) {
    const container = document.getElementById('rolePermList');
    if (!container) return;
  
    const set = new Set(selectedSlugs);
    container.innerHTML = permissions
      .map(
        (p) => `
        <div class="form-check">
          <input class="form-check-input role-perm-checkbox"
                 type="checkbox"
                 value="${p.id}"
                 id="perm_${p.id}"
                 ${set.has(p.slug) ? 'checked' : ''}>
          <label class="form-check-label" for="perm_${p.id}">
            <code>${escapeHtml(p.slug)}</code> – ${escapeHtml(p.name)}
          </label>
        </div>
      `
      )
      .join('');
  }
  
  function renderUserRoleCheckboxes(userRoleIds = []) {
    const container = document.getElementById('userRoleList');
    if (!container) return;
  
    const set = new Set(userRoleIds.map(String));
    container.innerHTML = roles
      .map(
        (r) => `
        <div class="form-check">
          <input class="form-check-input user-role-checkbox"
                 type="checkbox"
                 value="${r.id}"
                 id="role_${r.id}"
                 ${set.has(String(r.id)) ? 'checked' : ''}>
          <label class="form-check-label" for="role_${r.id}">
            ${escapeHtml(r.name)} <code class="text-muted">${escapeHtml(r.slug)}</code>
          </label>
        </div>
      `
      )
      .join('');
  }
  
  // ---------- EVENTS ----------
  document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadPermissions().then(loadRoles); // perms আগে, পরে roles
  
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchInput._timer);
        searchInput._timer = setTimeout(loadUsers, 300);
      });
    }
  
    document.getElementById('btnAddRole').addEventListener('click', () => {
      document.getElementById('roleModalTitle').textContent = 'Add Role';
      document.getElementById('roleId').value = '';
      document.getElementById('roleName').value = '';
      document.getElementById('roleSlug').value = '';
      document.getElementById('roleDescription').value = '';
      renderRolePermissionCheckboxes([]);
      $('#roleModal').modal('show');
    });
  
    document.getElementById('btnAddPermission').addEventListener('click', () => {
      document.getElementById('permModalTitle').textContent = 'Add Permission';
      document.getElementById('permId').value = '';
      document.getElementById('permName').value = '';
      document.getElementById('permSlug').value = '';
      document.getElementById('permDescription').value = '';
      $('#permModal').modal('show');
    });
  
    document.addEventListener('click', async (ev) => {
      const editRoleBtn = ev.target.closest('.btn-edit-role');
      if (editRoleBtn) {
        const id   = editRoleBtn.dataset.id;
        const role = roles.find((r) => String(r.id) === String(id));
        if (!role) return;
  
        document.getElementById('roleModalTitle').textContent = 'Edit Role';
        document.getElementById('roleId').value = role.id;
        document.getElementById('roleName').value = role.name || '';
        document.getElementById('roleSlug').value = role.slug || '';
        document.getElementById('roleDescription').value =
          role.description || '';
  
        const selectedSlugs = (role.permission_slugs || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
  
        renderRolePermissionCheckboxes(selectedSlugs);
        $('#roleModal').modal('show');
        return;
      }
  
      const delRoleBtn = ev.target.closest('.btn-del-role');
      if (delRoleBtn) {
        const id = delRoleBtn.dataset.id;
        if (!confirm('Role delete করতে চান?')) return;
        try {
          await api('/api/admin/roles/' + id, { method: 'DELETE' });
          await loadRoles();
        } catch (err) {
          console.error(err);
          alert('Role delete করতে সমস্যা হয়েছে।');
        }
        return;
      }
  
      const editPermBtn = ev.target.closest('.btn-edit-perm');
      if (editPermBtn) {
        const id  = editPermBtn.dataset.id;
        const per = permissions.find((p) => String(p.id) === String(id));
        if (!per) return;
  
        document.getElementById('permModalTitle').textContent = 'Edit Permission';
        document.getElementById('permId').value = per.id;
        document.getElementById('permName').value = per.name || '';
        document.getElementById('permSlug').value = per.slug || '';
        document.getElementById('permDescription').value =
          per.description || '';
  
        $('#permModal').modal('show');
        return;
      }
  
      const delPermBtn = ev.target.closest('.btn-del-perm');
      if (delPermBtn) {
        const id = delPermBtn.dataset.id;
        if (!confirm('Permission delete করতে চান?')) return;
        try {
          await api('/api/admin/permissions/' + id, { method: 'DELETE' });
          await loadPermissions();
          await loadRoles();
        } catch (err) {
          console.error(err);
          alert('Permission delete করতে সমস্যা হয়েছে।');
        }
        return;
      }
  
      const userRoleBtn = ev.target.closest('.btn-user-roles');
      if (userRoleBtn) {
        const id  = userRoleBtn.dataset.id;
        const usr = users.find((u) => String(u.id) === String(id));
        if (!usr) return;
  
        document.getElementById('userRoleUserId').value = usr.id;
        document.getElementById('userRoleModalTitle').textContent =
          'Assign Roles — ' + (usr.name || usr.email);
  
        const roleIds = (usr.role_ids || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean);
  
        renderUserRoleCheckboxes(roleIds);
        $('#userRoleModal').modal('show');
        return;
      }
  
      const resetBtn = ev.target.closest('.btn-reset-password');
      if (resetBtn) {
        const id  = resetBtn.dataset.id;
        const usr = users.find((u) => String(u.id) === String(id));
        if (!usr) return;
  
        if (
          !confirm(
            `User "${usr.name || usr.email}" এর পাসওয়ার্ড রিসেট করতে চান?`
          )
        ) {
          return;
        }
  
        try {
          const res = await api('/api/admin/users/' + id + '/reset-password', {
            method: 'POST',
          });
          if (!res) return;
          alert(
            'নতুন অস্থায়ী পাসওয়ার্ড: ' +
              res.temp_password +
              '\n\nলগইন করার পর ইউজারকে নিজের পাসওয়ার্ড পরিবর্তন করতে বলুন।'
          );
        } catch (err) {
          console.error(err);
          alert('Password reset করতে সমস্যা হয়েছে।');
        }
        return;
      }
    });
  
    document.getElementById('roleForm').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const id   = document.getElementById('roleId').value;
      const body = {
        name:        document.getElementById('roleName').value.trim(),
        slug:        document.getElementById('roleSlug').value.trim(),
        description: document.getElementById('roleDescription').value.trim(),
      };
  
      const permIds = Array.from(
        document.querySelectorAll('.role-perm-checkbox:checked')
      ).map((el) => parseInt(el.value, 10));
  
      try {
        let roleId = id;
  
        if (id) {
          await api('/api/admin/roles/' + id, {
            method: 'PUT',
            body: JSON.stringify(body),
          });
        } else {
          const res = await api('/api/admin/roles', {
            method: 'POST',
            body: JSON.stringify(body),
          });
          if (res && res.id) roleId = res.id;
        }
  
        await api('/api/admin/roles/' + roleId + '/permissions', {
          method: 'POST',
          body: JSON.stringify({ permission_ids: permIds }),
        });
  
        $('#roleModal').modal('hide');
        await loadRoles();
      } catch (err) {
        console.error(err);
        alert('Role save করতে সমস্যা হয়েছে।');
      }
    });
  
    document.getElementById('permForm').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const id   = document.getElementById('permId').value;
      const body = {
        name:        document.getElementById('permName').value.trim(),
        slug:        document.getElementById('permSlug').value.trim(),
        description: document.getElementById('permDescription').value.trim(),
      };
  
      try {
        if (id) {
          await api('/api/admin/permissions/' + id, {
            method: 'PUT',
            body: JSON.stringify(body),
          });
        } else {
          await api('/api/admin/permissions', {
            method: 'POST',
            body: JSON.stringify(body),
          });
        }
  
        $('#permModal').modal('hide');
        await loadPermissions();
        await loadRoles();
      } catch (err) {
        console.error(err);
        alert('Permission save করতে সমস্যা হয়েছে।');
      }
    });
  
    document
      .getElementById('userRoleForm')
      .addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const userId = document.getElementById('userRoleUserId').value;
  
        const roleIds = Array.from(
          document.querySelectorAll('.user-role-checkbox:checked')
        ).map((el) => parseInt(el.value, 10));
  
        try {
          await api('/api/admin/users/' + userId + '/roles', {
            method: 'POST',
            body: JSON.stringify({ role_ids: roleIds }),
          });
  
          $('#userRoleModal').modal('hide');
          await loadUsers();
        } catch (err) {
          console.error(err);
          alert('User roles save করতে সমস্যা হয়েছে।');
        }
      });
  });
  