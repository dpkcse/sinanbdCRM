// public/javascripts/leads.js

// --------- API helper (তোমার আগের কোডই) ---------
const API = {
  async req(path, opts = {}) {
    const t = localStorage.getItem('accessToken');
    opts.headers = Object.assign(
      { 'Content-Type': 'application/json' },
      opts.headers || {},
      t ? { Authorization: 'Bearer ' + t } : {}
    );
    opts.credentials = 'include';
    const r = await fetch(path, opts);

    if (r.status === 401 && !opts.__retry) {
      const rr = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (rr.ok) {
        const { accessToken } = await rr.json();
        localStorage.setItem('accessToken', accessToken);
        opts.__retry = true;
        return API.req(path, opts);
      }
      location.href = '/login';
      return;
    }
    return r;
  },
};

let state = { q: '', page: 1, pageSize: 10, total: 0 };

// --------- ছোট helper ফাংশন ---------- //
function formatProspectId(id) {
  if (!id) return '';
  return 'PR' + String(id).padStart(5, '0');
}

function formatDateTime(str) {
  if (!str) return '';
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} ${time}`;
}

// ---------- টেবিল রো জেনারেটর (নতুন ডিজাইন) ---------- //
function rowsHtml(list) {
  return list
    .map((x) => {
      const created = formatDateTime(x.created_at);
      const prospectId = formatProspectId(x.id);
      const status = x.status || '—';
      const priority = x.priority || '';
      const district = x.district || x.area || '';
      const stageBadgeClass =
        status === 'Already Client'
          ? 'badge-success'
          : status === 'Junk Prospect'
          ? 'badge-danger'
          : 'badge-info';

      return `
      <tr data-id="${x.id}">
        <!-- Prospect ID -->
        <td>
          <div class="prospect-id">${prospectId}</div>
          <div class="prospect-meta">${created || ''}</div>
        </td>

        <!-- Prospect Details -->
        <td>
          <div class="prospect-name">${x.prospect_name || ''}</div>
          <div class="prospect-location">
            ${district ? '(' + district + ')' : ''}
          </div>
          ${
            x.project_type
              ? `<div class="prospect-meta">Project: ${x.project_type}</div>`
              : ''
          }
        </td>

        <!-- Primary contact -->
        <td>
          <div>${x.primary_mobile || ''}</div>
          ${
            x.primary_email
              ? `<div class="prospect-meta">${x.primary_email}</div>`
              : ''
          }
        </td>

        <!-- Followup Activity (dummy counts এখন, পরে ডাটা যোগ করলে আপডেট করবে) -->
        <td>
          <span class="followup-pill">
            <i class="fas fa-phone"></i> 0
          </span>
          <span class="followup-pill">
            <i class="fas fa-envelope"></i> 0
          </span>
          <span class="followup-pill">
            <i class="fas fa-shopping-cart"></i> 0
          </span>
          <span class="followup-pill">
            <i class="fas fa-map-marker-alt"></i> 0
          </span>
        </td>

        <!-- Stage -->
        <td>
          <span class="badge ${stageBadgeClass}">${status}</span>
          ${
            priority
              ? `<div class="prospect-meta">Priority: ${priority}</div>`
              : ''
          }
        </td>

        <!-- Assigns & Creator (simple version) -->
        <td>
          ${
            x.owner_id
              ? `<div class="prospect-meta">Owner ID: ${x.owner_id}</div>`
              : ''
          }
          ${
            x.created_by_name
              ? `<div class="prospect-meta">${x.created_by_name}</div>`
              : ''
          }
        </td>

        <!-- Last & Next Activity (placeholder) -->
        <td>
          <div class="prospect-meta">No Followup</div>
          <div class="prospect-meta">No Next Followup</div>
        </td>

        <!-- Action -->
        <td class="text-right">
          <button class="btn btn-xs btn-danger del">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    })
    .join('');
}

// ---------- লিস্ট লোড ---------- //
async function load() {
  const params = new URLSearchParams({
    q: state.q,
    page: state.page,
    pageSize: state.pageSize,
  });
  const r = await API.req('/api/leads?' + params.toString());
  const { data, total, page, pageSize } = await r.json();
  state.total = total;
  state.page = page;
  state.pageSize = pageSize;

  document.querySelector('#tbl tbody').innerHTML = rowsHtml(data);

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  document.getElementById('pageInfo').textContent = total
    ? `Showing ${start}-${end} of ${total}`
    : 'No results';

  document.getElementById('prev').disabled = page <= 1;
  document.getElementById('next').disabled = page * pageSize >= total;
}

// ---------- status funnel লোড ---------- //
async function loadStats() {
  const el = document.getElementById('statusPipeline');
  if (!el) return;

  try {
    const r = await API.req('/api/leads/stats');
    const { byStatus } = await r.json();
    if (!byStatus || !byStatus.length) {
      el.innerHTML = '<div class="text-muted">No data yet</div>';
      return;
    }

    let total = 0;
    const stagesHtml = byStatus
      .map((s) => {
        total += s.v;
        return `
        <div class="funnel-stage">
          <div class="funnel-count">${s.v}</div>
          <div class="funnel-label">${s.k}</div>
        </div>
      `;
      })
      .join('');

    const totalHtml = `
      <div class="funnel-stage">
        <div class="funnel-count">${total}</div>
        <div class="funnel-label">Total</div>
      </div>
    `;

    el.innerHTML = stagesHtml + totalHtml;
  } catch (err) {
    console.error(err);
    el.innerHTML = '<div class="text-danger">Failed to load status summary</div>';
  }
}

// ---------- users for assignments (Select2) ---------- //
async function loadUsers() {
  const r = await API.req('/api/users/options');
  const { data } = await r.json();
  const selAssign = $('#assign_user');
  const selAdditional = $('#additional_assign_user');

  selAssign.empty();
  selAdditional.empty();

  data.forEach((u) => {
    const opt = new Option(u.name, u.id, false, false);
    selAssign.append(opt.cloneNode(true));
    selAdditional.append(opt.cloneNode(true));
  });

  selAssign.select2({ width: 'resolve', placeholder: 'Select owner' });
  selAdditional.select2({ width: 'resolve', placeholder: 'Select additional users' });
}

// ---------- সার্চ / পেজিনেশন ইভেন্ট ---------- //
document.getElementById('btnSearch').addEventListener('click', () => {
  state.q = document.getElementById('q').value.trim();
  state.page = 1;
  load();
  loadStats();
});

document
  .getElementById('q')
  .addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      state.q = e.target.value.trim();
      state.page = 1;
      load();
      loadStats();
    }
  });

document.getElementById('prev').addEventListener('click', () => {
  if (state.page > 1) {
    state.page--;
    load();
  }
});

document.getElementById('next').addEventListener('click', () => {
  if (state.page * state.pageSize < state.total) {
    state.page++;
    load();
  }
});

// pageSize change
const pageSizeSel = document.getElementById('pageSize');
if (pageSizeSel) {
  pageSizeSel.addEventListener('change', () => {
    state.pageSize = parseInt(pageSizeSel.value, 10) || 10;
    state.page = 1;
    load();
  });
}

// Refresh button
document.getElementById('btnRefresh').addEventListener('click', () => {
  load();
  loadStats();
});

// open modal → refresh users
$('#leadModal').on('shown.bs.modal', loadUsers);

// ---------- Save lead (আগের মতই, শুধু একটু রিফর্ম্যাট) ---------- //
document.getElementById('fLead').addEventListener('submit', async (e) => {
  e.preventDefault();

  const base = {
    prospect_type:
      document.querySelector('input[name="prospect_type"]:checked')?.value ||
      'Individual',
    prospect_name: document.getElementById('prospect_name').value,
    primary_mobile: document.getElementById('primary_mobile').value,
    primary_email: document.getElementById('primary_email').value || null,
    project_type: document.getElementById('project_type').value || null,
    project_size: document.getElementById('project_size').value || null,
    project_details: document.getElementById('project_details').value || null,
    alternative_mobile:
      document.getElementById('alternative_mobile').value || null,
    priority: document.getElementById('priority').value,
    district: document.getElementById('district').value || null,
    thana: document.getElementById('thana').value || null,
    area: document.getElementById('area').value || null,
    street_details: document.getElementById('street_details').value || null,
    campaign: document.getElementById('campaign').value || null,
    info_source: document.getElementById('info_source').value || null,
  };

  const r = await API.req('/api/leads', {
    method: 'POST',
    body: JSON.stringify(base),
  });
  if (!r.ok) {
    const er = await r.json().catch(() => ({}));
    alert(er.error || 'Failed');
    return;
  }

  $('#leadModal').modal('hide');
  state.page = 1;
  state.q = '';
  document.getElementById('q').value = '';
  load();
  loadStats();
});

// ---------- delete ---------- //
document
  .querySelector('#tbl tbody')
  .addEventListener('click', async (e) => {
    const btn = e.target.closest('.del');
    if (!btn) return;
    const tr = btn.closest('tr');
    const id = tr.dataset.id;
    if (!confirm('Delete this lead?')) return;
    const r = await API.req('/api/leads/' + id, { method: 'DELETE' });
    if (r.status === 204) {
      load();
      loadStats();
    }
  });

// ---------- Bulk template & upload ---------- //
document
  .getElementById('btnTemplate')
  .addEventListener('click', () => {
    window.location = '/api/leads/template';
  });

document.getElementById('fBulk').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = document.getElementById('bulkFile');
  if (!f.files.length) return;
  const fd = new FormData();
  fd.append('file', f.files[0]);
  const r = await fetch('/api/leads/bulk', {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });
  const json = await r.json();
  document.getElementById('bulkResult').innerHTML =
    `<div class="alert alert-info mb-2">Inserted: ${json.inserted}</div>` +
    (json.errors?.length
      ? `<div class="alert alert-warning"><b>Errors:</b><br>${json.errors
          .slice(0, 10)
          .join('<br>')}</div>`
      : '');
  if (json.inserted) {
    load();
    loadStats();
  }
});

// প্রথম লোডে
load();
loadStats();
