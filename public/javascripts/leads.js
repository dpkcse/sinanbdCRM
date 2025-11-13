// public/javascripts/leads.js

// ---------- API helper (access token + refresh) ---------- //
const API = {
  async request(path, opts = {}) {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken') ||
      '';

    opts.headers = Object.assign(
      { 'Content-Type': 'application/json' },
      opts.headers || {},
      token ? { Authorization: 'Bearer ' + token } : {}
    );

    opts.credentials = 'include';

    const res = await fetch(path, opts);

    // token expire হলে refresh-এর চেষ্টা
    if (res.status === 401 && !opts.__retry) {
      const rr = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (rr.ok) {
        const data = await rr.json();
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        opts.__retry = true;
        return API.request(path, opts);
      }
      location.href = '/login';
      return res;
    }

    return res;
  },
};

const state = {
  q: '',
  page: 1,
  pageSize: 10,
  total: 0,
};

// ---------- ছোট helper ---------- //
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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------- টেবিল রো জেনারেট ---------- //
function rowHtml(lead) {
  const created = formatDateTime(lead.created_at);
  const prospectId = formatProspectId(lead.id);
  const status = lead.status || 'New';
  const priority = lead.priority || 'Normal';
  const district = lead.district || lead.area || '';
  const ownerName = lead.created_by_name || '';
  const stageBadgeClass =
    status === 'Already Client'
      ? 'badge-success'
      : status === 'Junk Prospect'
      ? 'badge-danger'
      : 'badge-info';

  return `
    <tr data-id="${lead.id}">
      <td>
        <div class="prospect-id">${prospectId}</div>
        <div class="prospect-meta">${escapeHtml(created)}</div>
      </td>
      <td>
        <div class="prospect-name">${escapeHtml(lead.prospect_name || '')}</div>
        <div class="prospect-location">
          ${district ? '(' + escapeHtml(district) + ')' : ''}
        </div>
        ${
          lead.project_type
            ? `<div class="prospect-meta">Project: ${escapeHtml(
                lead.project_type
              )}</div>`
            : ''
        }
      </td>
      <td>
        <div>${escapeHtml(lead.primary_mobile || '')}</div>
        ${
          lead.primary_email
            ? `<div class="prospect-meta">${escapeHtml(
                lead.primary_email
              )}</div>`
            : ''
        }
      </td>
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
      <td>
        <span class="badge ${stageBadgeClass}">${escapeHtml(status)}</span>
        <div class="prospect-meta">Priority: ${escapeHtml(priority)}</div>
      </td>
      <td>
        ${
          ownerName
            ? `<div class="prospect-meta">${escapeHtml(ownerName)}</div>`
            : ''
        }
        ${
          lead.owner_id
            ? `<div class="prospect-meta">Owner ID: ${lead.owner_id}</div>`
            : ''
        }
      </td>
      <td>
        <div class="prospect-meta">No Followup</div>
        <div class="prospect-meta">No Next Followup</div>
      </td>
      <td class="text-right">
        <button class="btn btn-xs btn-danger del">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `;
}

// ---------- লিস্ট লোড ---------- //
async function loadLeads() {
  const params = new URLSearchParams({
    q: state.q,
    page: state.page,
    pageSize: state.pageSize,
  });

  const res = await API.request('/api/leads?' + params.toString());
  const json = await res.json();

  const list = json.data || [];
  state.total = json.total || 0;
  state.page = json.page || 1;
  state.pageSize = json.pageSize || state.pageSize;

  const tbody = document.querySelector('#tbl tbody');
  tbody.innerHTML = list.map(rowHtml).join('') || `
    <tr><td colspan="8" class="text-center text-muted">No prospects found</td></tr>
  `;

  const start = state.total ? (state.page - 1) * state.pageSize + 1 : 0;
  const end = Math.min(state.total, state.page * state.pageSize);
  document.getElementById('pageInfo').textContent = state.total
    ? `Showing ${start}-${end} of ${state.total}`
    : 'No results';

  document.getElementById('prev').disabled = state.page <= 1;
  document.getElementById('next').disabled =
    state.page * state.pageSize >= state.total;
}

// ---------- status funnel লোড ---------- //
const STAGE_ORDER = [
  'New prospect',
  'Initial Contact',
  'Low Potential',
  'On Followup',
  'Visit Scheduled',
  'Visit Done',
  'Lead Created',
  'Already Client',
  'Junk Prospect',
];

async function loadStats() {
  const el = document.getElementById('statusPipeline');
  if (!el) return;

  try {
    const res = await API.request('/api/leads/stats');
    const json = await res.json();
    const byStatus = json.byStatus || [];

    if (!byStatus.length) {
      el.innerHTML = `<div class="text-muted">No data yet</div>`;
      return;
    }

    const map = {};
    let total = 0;
    byStatus.forEach((s) => {
      map[s.k] = s.v;
      total += s.v;
    });

    const stages = [];

    STAGE_ORDER.forEach((name) => {
      if (map[name]) {
        stages.push({ k: name, v: map[name] });
        delete map[name];
      }
    });

    // বাকি অচেনা স্টেজ থাকলে শেষে
    Object.keys(map).forEach((k) => stages.push({ k, v: map[k] }));

    const html =
      stages
        .map(
          (s) => `
        <div class="funnel-stage">
          <div class="funnel-count">${s.v}</div>
          <div class="funnel-label">${escapeHtml(s.k)}</div>
        </div>`
        )
        .join('') +
      `
        <div class="funnel-stage total">
          <div class="funnel-count">${total}</div>
          <div class="funnel-label">Total</div>
        </div>
      `;

    el.innerHTML = html;
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div class="text-danger">Failed to load summary</div>`;
  }
}

// ---------- Assign user select2 ---------- //
async function loadUsers() {
  const res = await API.request('/api/users/options');
  const json = await res.json();
  const data = json.data || [];

  const $assign = $('#assign_user');
  const $additional = $('#additional_assign_user');

  $assign.empty();
  $additional.empty();

  data.forEach((u) => {
    const opt = new Option(u.name, u.id, false, false);
    $assign.append(opt.cloneNode(true));
    $additional.append(opt.cloneNode(true));
  });

  $assign.select2({ width: 'resolve', placeholder: 'Select owner' });
  $additional.select2({
    width: 'resolve',
    placeholder: 'Select additional users',
  });
}

// ---------- Search / pagination events ---------- //
document.getElementById('btnSearch').addEventListener('click', () => {
  state.q = document.getElementById('q').value.trim();
  state.page = 1;
  loadLeads();
  loadStats();
});

document.getElementById('q').addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    state.q = e.target.value.trim();
    state.page = 1;
    loadLeads();
    loadStats();
  }
});

document.getElementById('btnRefresh').addEventListener('click', () => {
  loadLeads();
  loadStats();
});

document.getElementById('prev').addEventListener('click', () => {
  if (state.page > 1) {
    state.page--;
    loadLeads();
  }
});

document.getElementById('next').addEventListener('click', () => {
  if (state.page * state.pageSize < state.total) {
    state.page++;
    loadLeads();
  }
});

document.getElementById('pageSize').addEventListener('change', (e) => {
  state.pageSize = parseInt(e.target.value, 10) || 10;
  state.page = 1;
  loadLeads();
});

// ---------- Add lead submit ---------- //
document.getElementById('fLead').addEventListener('submit', async (e) => {
  e.preventDefault();

  const prospectType =
    document.querySelector('input[name="prospect_type"]:checked')?.value ||
    'Individual';

  const body = {
    prospect_type: prospectType,
    prospect_name: document.getElementById('prospect_name').value.trim(),
    primary_mobile: document.getElementById('primary_mobile').value.trim(),
    alternative_mobile:
      document.getElementById('alternative_mobile').value.trim() || null,
    primary_email:
      document.getElementById('primary_email').value.trim() || null,
    project_type: document.getElementById('project_type').value.trim() || null,
    project_size: document.getElementById('project_size').value.trim() || null,
    project_details:
      document.getElementById('project_details').value.trim() || null,
    priority: document.getElementById('priority').value,
    district: document.getElementById('district').value.trim() || null,
    thana: document.getElementById('thana').value.trim() || null,
    area: document.getElementById('area').value.trim() || null,
    street_details:
      document.getElementById('street_details').value.trim() || null,
    campaign: document.getElementById('campaign').value.trim() || null,
    info_source: document.getElementById('info_source').value.trim() || null,
  };

  if (!body.prospect_name || !body.primary_mobile) {
    alert('Prospect name এবং primary mobile দরকার');
    return;
  }

  const res = await API.request('/api/leads', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const er = (await res.json().catch(() => ({}))) || {};
    alert(er.error || 'Failed to create lead');
    return;
  }

  $('#leadModal').modal('hide');
  state.page = 1;
  document.getElementById('q').value = '';
  state.q = '';
  loadLeads();
  loadStats();
});

// modal open হলে user list লোড
$('#leadModal').on('shown.bs.modal', () => {
  loadUsers();
});

// ---------- Delete lead ---------- //
document.querySelector('#tbl tbody').addEventListener('click', async (e) => {
  const btn = e.target.closest('.del');
  if (!btn) return;
  const tr = btn.closest('tr');
  const id = tr.dataset.id;
  if (!id) return;

  if (!confirm('Delete this lead?')) return;

  const res = await API.request('/api/leads/' + encodeURIComponent(id), {
    method: 'DELETE',
  });

  if (res.status === 204) {
    loadLeads();
    loadStats();
  } else {
    const er = (await res.json().catch(() => ({}))) || {};
    alert(er.error || 'Delete failed');
  }
});

// ---------- Template download ---------- //
document.getElementById('btnTemplate').addEventListener('click', () => {
  window.location = '/api/leads/template';
});

// ---------- Bulk upload ---------- //
document.getElementById('fBulk').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('bulkFile');
  if (!fileInput.files.length) return;

  const fd = new FormData();
  fd.append('file', fileInput.files[0]);

  const res = await fetch('/api/leads/bulk', {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });

  const json = await res.json().catch(() => ({}));
  const resultEl = document.getElementById('bulkResult');

  resultEl.innerHTML =
    `<div class="alert alert-info mb-2">Inserted: ${
      json.inserted || 0
    }</div>` +
    (json.errors && json.errors.length
      ? `<div class="alert alert-warning"><b>Errors:</b><br>${json.errors
          .slice(0, 10)
          .map(escapeHtml)
          .join('<br>')}</div>`
      : '');

  if (json.inserted) {
    loadLeads();
    loadStats();
  }
});

// ---------- প্রথম লোড ---------- //
loadLeads();
loadStats();
