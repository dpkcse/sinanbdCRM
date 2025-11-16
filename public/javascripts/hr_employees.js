// public/javascripts/hr_employees.js

// ----- COMMON API HELPER (leads.js এর মত cookie/session ভিত্তিক) -----
async function api(path, options = {}) {
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    options.headers || {}
  );

  const res = await fetch(path, {
    credentials: 'same-origin', // session cookie যাবে
    ...options,
    headers,
  });

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

// ----- HR EMPLOYEE MODULE -----
(() => {
  const API_BASE = '/api/hr/employees';

  const $tbody = document.getElementById('empTableBody');
  const $search = document.getElementById('empSearch');
  const $addBtn = document.getElementById('btnAddEmployee');
  const $form = document.getElementById('employeeForm');
  const $loginForm = document.getElementById('createLoginForm');

  let employees = [];

  function escapeHtml(str) {
    return (str || '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------- টেবিল রেন্ডার ----------
  function renderTable() {
    if (!$tbody) return;

    if (!employees.length) {
      $tbody.innerHTML =
        '<tr><td colspan="6" class="text-center text-muted">No employees found.</td></tr>';
      return;
    }

    $tbody.innerHTML = employees
      .map((e) => {
        const loginInfo = e.user_id
          ? `<span class="badge badge-success">User: ${escapeHtml(
              e.login_email || ''
            )}</span>`
          : `<button class="btn btn-xs btn-outline-primary btn-create-login" data-id="${e.id}">
               Create login
             </button>`;

        return `
          <tr data-id="${e.id}">
            <td>
              <div class="font-weight-semibold">${escapeHtml(
                e.employee_code || ''
              )}</div>
              <div class="text-muted small">${escapeHtml(
                e.status || 'active'
              )}</div>
            </td>
            <td>
              <div class="font-weight-semibold">${escapeHtml(
                e.full_name || ''
              )}</div>
              <div class="text-muted small">${escapeHtml(e.email || '')}</div>
              <div class="text-muted small">${escapeHtml(e.mobile || '')}</div>
            </td>
            <td>
              <div>${escapeHtml(e.designation || '')}</div>
              <div class="text-muted small">${escapeHtml(
                e.department || ''
              )}</div>
            </td>
            <td>
              <span class="badge badge-light">${escapeHtml(
                e.status || ''
              )}</span>
            </td>
            <td>${loginInfo}</td>
            <td>
              <button class="btn btn-xs btn-outline-secondary btn-edit" data-id="${e.id}">
                <i class="fas fa-edit"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // ---------- লিস্ট লোড ----------
  async function loadList() {
    const q = $search ? $search.value.trim() : '';
    const data = await api(`${API_BASE}?q=${encodeURIComponent(q)}`);
    if (!data) return; // 401 হলে api() already handle করেছে

    // API design: { data }
    employees = Array.isArray(data) ? data : data.data || [];
    renderTable();
  }

  // ---------- সার্চ ----------
  if ($search) {
    $search.addEventListener('input', () => {
      clearTimeout($search._timer);
      $search._timer = setTimeout(loadList, 300);
    });
  }

  // ---------- Add বাটন ----------
  if ($addBtn) {
    $addBtn.addEventListener('click', () => {
      document.getElementById('employeeModalTitle').textContent =
        'Add Employee';
      document.getElementById('empId').value = '';
      if ($form) $form.reset();
      $('#employeeModal').modal('show');
    });
  }

  // ---------- Edit / Create login বাটন হ্যান্ডলার ----------
  document.addEventListener('click', (ev) => {
    const btnEdit = ev.target.closest('.btn-edit');
    if (btnEdit) {
      const id = btnEdit.dataset.id;
      const emp = employees.find((x) => String(x.id) === String(id));
      if (!emp) return;

      document.getElementById('employeeModalTitle').textContent =
        'Edit Employee';
      document.getElementById('empId').value = emp.id;
      document.getElementById('empFullName').value = emp.full_name || '';
      document.getElementById('empEmail').value = emp.email || '';
      document.getElementById('empMobile').value = emp.mobile || '';
      document.getElementById('empAltMobile').value = emp.alt_mobile || '';
      document.getElementById('empDesignation').value =
        emp.designation || '';
      document.getElementById('empDepartment').value =
        emp.department || '';
      document.getElementById('empJoinDate').value = emp.join_date
        ? emp.join_date.substring(0, 10)
        : '';
      document.getElementById('empStatus').value = emp.status || 'active';

      $('#employeeModal').modal('show');
      return;
    }

    const btnLogin = ev.target.closest('.btn-create-login');
    if (btnLogin) {
      const id = btnLogin.dataset.id;
      document.getElementById('loginEmpId').value = id;
      $('#createLoginModal').modal('show');
    }
  });

  // ---------- Save employee (create / update) ----------
  if ($form) {
    $form.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      const id = document.getElementById('empId').value || null;

      const payload = {
        full_name: document
          .getElementById('empFullName')
          .value.trim(),
        email: document.getElementById('empEmail').value.trim(),
        mobile: document.getElementById('empMobile').value.trim(),
        alt_mobile: document
          .getElementById('empAltMobile')
          .value.trim(),
        designation: document
          .getElementById('empDesignation')
          .value.trim(),
        department: document
          .getElementById('empDepartment')
          .value.trim(),
        join_date: document.getElementById('empJoinDate').value || null,
        status: document.getElementById('empStatus').value,
      };

      try {
        if (id) {
          await api(`${API_BASE}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } else {
          await api(API_BASE, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }

        $('#employeeModal').modal('hide');
        await loadList();
      } catch (err) {
        console.error(err);
        alert('Employee save করতে সমস্যা হয়েছে।');
      }
    });
  }

  // ---------- Create Login ----------
  if ($loginForm) {
    $loginForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const id = document.getElementById('loginEmpId').value;
      const role = document.getElementById('loginRole').value;

      try {
        await api(`${API_BASE}/${id}/create-user`, {
          method: 'POST',
          body: JSON.stringify({ role_slug: role }),
        });
        $('#createLoginModal').modal('hide');
        await loadList();
        alert('Login তৈরি হয়েছে। ইমেইল চেক করুন।');
      } catch (err) {
        console.error(err);
        alert('Login তৈরি করতে সমস্যা হয়েছে।');
      }
    });
  }

  // Initial load
  document.addEventListener('DOMContentLoaded', loadList);
})();
