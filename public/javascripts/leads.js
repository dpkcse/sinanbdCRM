// public/javascripts/leads.js

let editingLeadId = null;          // null = add, number = edit
let currentFollowupLeadId = null;  // followup modal এর জন্য

// ---------- API helper ---------- //
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

    // 401 হলে টোকেন রিফ্রেশ চেষ্টা করি
    if (res.status === 401 && !opts.__retry) {
      const rr = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (rr.ok) {
        const j = await rr.json();
        if (j.accessToken) localStorage.setItem('accessToken', j.accessToken);
        opts.__retry = true;
        return API.request(path, opts);
      }
      // রিফ্রেশও না পারলে লগইনে পাঠিয়ে দেই
      location.href = '/login';
    }

    return res;
  },
};

const state = { q: '', page: 1, pageSize: 10, total: 0 };

// ---------- helpers ---------- //
function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

// ---------- table row renderer ---------- //
function rowsHtml(list) {
  return list
    .map((l) => {
      const prospectId =
        l.prospect_code || 'PR' + String(l.id || '').padStart(5, '0');
      const createdAt = formatDateTime(l.created_at);
      const stageLabel = l.stage_name || 'New';
      const ownerName = l.owner_name || '—';
      const priority = l.priority || 'Normal';

      const additional =
        l.additional_assignees && l.additional_assignees.length
          ? `<div class="prospect-meta">With: ${escapeHtml(
              l.additional_assignees
            )}</div>`
          : '';

      const lastText = l.last_followup_at
        ? `${formatDateTime(l.last_followup_at)}${
            l.last_followup_type ? ' (' + l.last_followup_type + ')' : ''
          }`
        : 'No Followup';

      const nextText = l.next_followup_at
        ? `${formatDateTime(l.next_followup_at)}${
            l.last_followup_type ? ' (' + l.next_followup_type + ')' : ''
          }`
        : 'No Followup';

      return `
      <tr data-id="${l.id}">
        <!-- Prospect ID -->
        <td>
          <div class="font-weight-semibold">${escapeHtml(prospectId)}</div>
          <div class="prospect-meta">${escapeHtml(createdAt)}</div>
        </td>

        <!-- Prospect Details -->
        <td>
          <div class="font-weight-semibold">${escapeHtml(
            l.prospect_name || ''
          )}</div>
          <div class="prospect-meta">${
            l.project_name ? 'Project: ' + escapeHtml(l.project_name) : ''
          }</div>
        </td>

        <!-- Primary Contact -->
        <td>
          <div>${escapeHtml(l.primary_mobile || '')}</div>
          <div class="prospect-meta">${escapeHtml(l.primary_email || '')}</div>
        </td>

        <!-- Followup Activity (ফলোআপ লগ করার shortcut আইকন) -->
        <td>
          <div class="d-flex align-items-center">
            <span class="followup-pill mr-1">
              <i class="fas fa-phone"></i><span class="ml-1">0</span>
            </span>
            <span class="followup-pill mr-1">
              <i class="fas fa-envelope"></i><span class="ml-1">0</span>
            </span>
            <span class="followup-pill mr-1">
              <i class="fas fa-shopping-cart"></i><span class="ml-1">0</span>
            </span>
            <span class="followup-pill">
              <i class="fas fa-map-marker-alt"></i><span class="ml-1">0</span>
            </span>
          </div>
        </td>

        <!-- Stage / Priority -->
        <td>
          <div>
            <span class="badge badge-pill badge-info">${escapeHtml(
              stageLabel
            )}</span>
          </div>
          <div class="prospect-meta">Priority: ${escapeHtml(priority)}</div>
        </td>

        <!-- Assigns & Creator -->
        <td>
          <div class="font-weight-semibold">${escapeHtml(ownerName)}</div>
          <div class="prospect-meta">${
            createdAt ? 'Created ' + escapeHtml(createdAt) : ''
          }</div>
          ${additional}
        </td>

        <!-- Last & Next Activity -->
        <td class="activity-history">
          <div class="prospect-meta">${escapeHtml(lastText)}</div>
          <div class="prospect-meta">${escapeHtml(nextText)}</div>
        </td>

        <!-- Actions -->
        <td class="text-right">
          <button class="btn btn-xs btn-outline-primary edit">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-xs btn-danger del">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
      `;
    })
    .join('');
}

// ---------- list load ---------- //
async function loadLeads() {
  const params = new URLSearchParams({
    q: state.q,
    page: state.page,
    pageSize: state.pageSize,
  });

  try {
    const res = await API.request('/api/leads?' + params.toString());
    if (!res.ok) {
      console.error('Failed to load leads', res.status);
      document.querySelector('#tbl tbody').innerHTML =
        '<tr><td colspan="8" class="text-center text-muted">Failed to load prospects</td></tr>';
      return;
    }

    const { data, total, page, pageSize } = await res.json();
    state.total = total || 0;
    state.page = page || 1;
    state.pageSize = pageSize || state.pageSize;

    const tbody = document.querySelector('#tbl tbody');
    tbody.innerHTML =
      data && data.length
        ? rowsHtml(data)
        : `<tr><td colspan="8" class="text-center text-muted">No prospects found</td></tr>`;

    const start = total ? (state.page - 1) * state.pageSize + 1 : 0;
    const end = Math.min(total, state.page * state.pageSize);
    document.getElementById('pageInfo').textContent = total
      ? `Showing ${start}-${end} of ${total}`
      : 'No results';

    document.getElementById('prev').disabled = state.page <= 1;
    document.getElementById('next').disabled =
      state.page * state.pageSize >= total;
  } catch (err) {
    console.error('Error loading leads', err);
    document.querySelector('#tbl tbody').innerHTML =
      '<tr><td colspan="8" class="text-center text-muted">Failed to load prospects</td></tr>';
  }
}

// ---------- stats (funnel) ---------- //
async function loadStats() {
  const el = document.getElementById('statusPipeline');
  if (!el) return;

  try {
    const res = await API.request('/api/leads/stats');
    if (!res.ok) {
      el.innerHTML = '<div class="text-danger">Failed to load summary</div>';
      return;
    }

    const { byStatus } = await res.json();
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
            <div class="funnel-label">${escapeHtml(s.k)}</div>
          </div>
        `;
      })
      .join('');

    const totalHtml = `
      <div class="funnel-stage funnel-stage--total">
        <div class="funnel-count">${total}</div>
        <div class="funnel-label">Total</div>
      </div>
    `;

    el.innerHTML = stagesHtml + totalHtml;
  } catch (err) {
    console.error(err);
    el.innerHTML = '<div class="text-danger">Failed to load summary</div>';
  }
}

// ---------- stage dropdown ---------- //
async function loadStageOptions() {
  const sel = document.getElementById('prospect_stage_id');
  if (!sel) return;

  sel.innerHTML = '<option value="">Loading...</option>';

  try {
    const res = await API.request('/api/prospect-stages/options');

    if (!res.ok) {
      sel.innerHTML = '<option value="">Failed to load stages</option>';
      return;
    }

    const json = await res.json().catch(() => ({}));
    const stages = json.data || [];

    if (!stages.length) {
      sel.innerHTML = '<option value="">No stages found</option>';
      return;
    }

    sel.innerHTML = '<option value="">Select a stage</option>';
    stages.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    sel.innerHTML = '<option value="">Failed to load stages</option>';
  }
}

// ---------- user dropdowns (assignments) ---------- //
async function loadUserOptions() {
  const primarySel = document.getElementById('assign_user_id');
  const extraSel = document.getElementById('additional_assign_user_ids');
  if (!primarySel || !extraSel) return;

  primarySel.innerHTML = '<option value="">Me (default)</option>';
  extraSel.innerHTML = '';

  try {
    const res = await API.request('/api/users/options');

    if (!res.ok) {
      primarySel.innerHTML = '<option value="">Failed to load users</option>';
      return;
    }

    const json = await res.json().catch(() => ({}));
    const users = json.data || [];

    users.forEach((u) => {
      const label = u.label || u.name || u.email || 'User #' + u.id;

      const opt1 = document.createElement('option');
      opt1.value = u.id;
      opt1.textContent = label;
      primarySel.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = u.id;
      opt2.textContent = label;
      extraSel.appendChild(opt2);
    });
  } catch (err) {
    console.error(err);
    primarySel.innerHTML = '<option value="">Failed to load users</option>';
  }
}

// ---------- search / paging events ---------- //
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

// ---------- delete / edit click ---------- //
document.querySelector('#tbl tbody').addEventListener('click', async (e) => {
  const tr = e.target.closest('tr');
  if (!tr) return;
  const id = tr.dataset.id;
  if (!id) return;

  const delBtn = e.target.closest('.del');
  const editBtn = e.target.closest('.edit');

  // delete
  if (delBtn) {
    if (!confirm('Delete this lead?')) return;

    const res = await API.request('/api/leads/' + encodeURIComponent(id), {
      method: 'DELETE',
    });

    if (res.status === 204) {
      loadLeads();
      loadStats();
    } else {
      const json = await res.json().catch(() => ({}));
      alert(json.error || 'Delete failed');
    }
    return;
  }

  // edit
  if (editBtn) {
    openLeadModalForEdit(id);
  }
});

// ---------- template download ---------- //
document.getElementById('btnTemplate').addEventListener('click', () => {
  window.location = '/api/leads/template';
});

// ---------- bulk upload ---------- //
document.getElementById('fBulk').addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = document.getElementById('bulkFile').files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append('file', file);

  const res = await fetch('/api/leads/bulk', {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });

  const json = await res.json().catch(() => ({}));
  document.getElementById('bulkResult').innerHTML =
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

// ---------- modal show: load dropdowns ---------- //
$('#leadModal').on('shown.bs.modal', () => {
  loadStageOptions();
  loadUserOptions();
});

// ---------- add / edit lead submit ---------- //
document.getElementById('fLead').addEventListener('submit', async (e) => {
  e.preventDefault();

  const prospect_name = document
    .getElementById('prospect_name')
    .value.trim();
  const primary_mobile = document
    .getElementById('primary_mobile')
    .value.trim();

  if (!prospect_name || !primary_mobile) {
    alert('Prospect name and primary mobile are required.');
    return;
  }

  const payload = {
    prospect_type:
      document.querySelector('input[name="prospect_type"]:checked')?.value ||
      'Individual',
    prospect_name,
    primary_mobile,
    alternative_mobile:
      document.getElementById('alternative_mobile').value.trim() || null,
    primary_email:
      document.getElementById('primary_email').value.trim() || null,
    project_type:
      document.getElementById('project_type').value.trim() || null,
    project_size:
      document.getElementById('project_size').value.trim() || null,
    project_details:
      document.getElementById('project_details').value.trim() || null,
    prospect_stage_id:
      document.getElementById('prospect_stage_id').value || null,
    priority: document.getElementById('priority').value || 'Normal',
    district: document.getElementById('district')?.value.trim() || null,
    thana: document.getElementById('thana')?.value.trim() || null,
    area: document.getElementById('area')?.value.trim() || null,
    street_details:
      document.getElementById('street_details')?.value.trim() || null,
    campaign: document.getElementById('campaign')?.value.trim() || null,
    info_source:
      document.getElementById('info_source')?.value.trim() || null,
  };

  // assignments
  const primaryAssign =
    document.getElementById('assign_user_id').value || null;
  const extraSel = document.getElementById('additional_assign_user_ids');
  const extraIds = extraSel
    ? Array.from(extraSel.selectedOptions).map((o) => o.value)
    : [];

  try {
    const isEdit = !!editingLeadId;
    const url = isEdit ? `/api/leads/${editingLeadId}` : '/api/leads';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await API.request(url, {
      method,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Failed to save lead');
      return;
    }

    const { data } = await res.json();
    const leadId = data.id || editingLeadId;

    // assignments আপডেট
    if (primaryAssign || extraIds.length) {
      const user_ids = primaryAssign
        ? [
            primaryAssign,
            ...extraIds.filter((id) => id !== primaryAssign),
          ]
        : extraIds;

      await API.request(`/api/leads/${leadId}/assignments`, {
        method: 'PUT',
        body: JSON.stringify({
          user_ids,
          primary_id: primaryAssign || null,
        }),
      });
    } else if (isEdit) {
      // edit মোডে আর কোনও assignee না থাকলে সব assignment ক্লিয়ার করি
      await API.request(`/api/leads/${leadId}/assignments`, {
        method: 'PUT',
        body: JSON.stringify({ user_ids: [], primary_id: null }),
      });
    }

    $('#leadModal').modal('hide');
    editingLeadId = null;
    e.target.reset();
    loadLeads();
    loadStats();
  } catch (err) {
    console.error(err);
    alert('Unexpected error while saving lead');
  }
});

// ---------- Add new button ---------- //
document.getElementById('btnAddNew').addEventListener('click', async () => {
  editingLeadId = null;
  document.getElementById('leadModalTitle').textContent = 'Add New Prospect';
  document.getElementById('fLead').reset();
  await Promise.all([loadStageOptions(), loadUserOptions()]);
});

// ---------- Edit modal ওপেন ---------- //
async function openLeadModalForEdit(id) {
  try {
    editingLeadId = id;
    document.getElementById('leadModalTitle').textContent = 'Edit Prospect';
    document.getElementById('fLead').reset();

    // আগে dropdown গুলো লোড করি
    await Promise.all([loadStageOptions(), loadUserOptions()]);

    const res = await API.request('/api/leads/' + encodeURIComponent(id));
    if (!res.ok) {
      alert('Failed to load lead details');
      editingLeadId = null;
      return;
    }

    const json = await res.json();
    const lead = json.data;
    const assignments = json.assignments || [];

    // ফর্ম ফিল্ডগুলো ভরো
    const type = lead.prospect_type || 'Individual';
    const typeRadio = document.querySelector(
      `input[name="prospect_type"][value="${type}"]`
    );
    if (typeRadio) typeRadio.checked = true;

    document.getElementById('prospect_name').value =
      lead.prospect_name || '';
    document.getElementById('primary_mobile').value =
      lead.primary_mobile || '';
    document.getElementById('alternative_mobile').value =
      lead.alternative_mobile || '';
    document.getElementById('primary_email').value =
      lead.primary_email || '';
    document.getElementById('project_type').value =
      lead.project_type || '';
    document.getElementById('project_size').value =
      lead.project_size || '';
    document.getElementById('project_details').value =
      lead.project_details || '';
    document.getElementById('prospect_stage_id').value =
      lead.prospect_stage_id || '';
    document.getElementById('priority').value =
      lead.priority || 'Normal';

    if (document.getElementById('district'))
      document.getElementById('district').value = lead.district || '';
    if (document.getElementById('thana'))
      document.getElementById('thana').value = lead.thana || '';
    if (document.getElementById('area'))
      document.getElementById('area').value = lead.area || '';
    if (document.getElementById('street_details'))
      document.getElementById('street_details').value =
        lead.street_details || '';
    if (document.getElementById('campaign'))
      document.getElementById('campaign').value = lead.campaign || '';
    if (document.getElementById('info_source'))
      document.getElementById('info_source').value =
        lead.info_source || '';

    // assignments → primary + additional select এ সেট করো
    const primarySel = document.getElementById('assign_user_id');
    const extraSel = document.getElementById('additional_assign_user_ids');

    const primaryAssign = assignments.find(
      (a) => a.is_primary === 1 || a.is_primary === true || a.is_primary === '1'
    );
    const extraIds = assignments
      .filter((a) => !a.is_primary)
      .map((a) => String(a.user_id));

    if (primarySel) {
      primarySel.value = primaryAssign ? String(primaryAssign.user_id) : '';
    }
    if (extraSel) {
      Array.from(extraSel.options).forEach((opt) => {
        opt.selected = extraIds.includes(opt.value);
      });
    }

    $('#leadModal').modal('show');
  } catch (err) {
    console.error(err);
    alert('Failed to open edit modal');
    editingLeadId = null;
  }
}

// modal hide হলে state reset
$('#leadModal').on('hidden.bs.modal', () => {
  editingLeadId = null;
  document.getElementById('fLead').reset();
  document.getElementById('leadModalTitle').textContent = 'Add New Prospect';
});

// ---------- follow-up আইকন ক্লিক → modal ---------- //
document.querySelector('#tbl tbody').addEventListener('click', (e) => {
  const pill = e.target.closest('.followup-pill');
  if (!pill) return;

  const tr = pill.closest('tr');
  if (!tr) return;

  currentFollowupLeadId = tr.dataset.id;
  document.getElementById('fu_lead_id').value = currentFollowupLeadId;

  // কোন আইকন ক্লিক করেছ তার উপর type preselect
  if (pill.querySelector('.fa-phone'))
    document.getElementById('fu_type').value = 'call';
  if (pill.querySelector('.fa-envelope'))
    document.getElementById('fu_type').value = 'email';
  if (pill.querySelector('.fa-shopping-cart'))
    document.getElementById('fu_type').value = 'other';
  if (pill.querySelector('.fa-map-marker-alt'))
    document.getElementById('fu_type').value = 'visit';

  document.getElementById('fu_note').value = '';
  document.getElementById('fu_next_at').value = '';

  $('#followupModal').modal('show');
});

// ---------- follow-up submit ---------- //
document.getElementById('fFollowup').addEventListener('submit', async (e) => {
  e.preventDefault();
  const leadId = document.getElementById('fu_lead_id').value;
  if (!leadId) return;

  const payload = {
    activity_type: document.getElementById('fu_type').value,
    activity_note: document.getElementById('fu_note').value.trim() || null,
    next_followup_at: document.getElementById('fu_next_at').value || null,
  };

  try {
    const res = await API.request(`/api/leads/${leadId}/followups`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || 'Failed to save follow-up');
      return;
    }

    $('#followupModal').modal('hide');
    currentFollowupLeadId = null;

    // লিস্ট/স্ট্যাটাস আপডেট
    loadLeads();
    loadStats();
  } catch (err) {
    console.error(err);
    alert('Unexpected error while saving follow-up');
  }
});

async function openFollowupTimeline(leadId, leadLabel) {
  try {
    const res = await API.request(`/api/leads/${encodeURIComponent(leadId)}/followups`);
    if (!res.ok) {
      console.error('Failed to load followup history', res.status);
      alert('Failed to load follow-up history');
      return;
    }

    const json = await res.json();
    const items = json.data || [];

    const title = document.getElementById('activityTimelineTitle');
    title.textContent = `Follow-up history – ${leadLabel || ('Prospect #' + leadId)}`;

    const body = document.getElementById('activityTimelineBody');

    if (!items.length) {
      body.innerHTML = '<div class="text-muted small">No follow-ups yet.</div>';
    } else {
      body.innerHTML = items
        .map((f) => {
          const type = f.activity_type || 'activity';
          const at = formatDateTime(f.activity_at);
          const next = f.next_followup_at ? formatDateTime(f.next_followup_at) : '';
          const who = f.created_by_name || 'Unknown';

          return `
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="badge badge-pill badge-primary text-capitalize">${escapeHtml(type)}</span>
                  <span class="text-muted small ml-2">${escapeHtml(at)}</span>
                  <span class="text-muted small ml-2">by ${escapeHtml(who)}</span>
                </div>
                ${
                  f.activity_note
                    ? `<div class="timeline-note mt-1">${escapeHtml(f.activity_note)}</div>`
                    : ''
                }
                ${
                  next
                    ? `<div class="timeline-next text-muted small mt-1">Next follow-up: ${escapeHtml(next)}</div>`
                    : ''
                }
              </div>
            </div>
          `;
        })
        .join('');
    }

    $('#activityTimelineModal').modal('show');
  } catch (err) {
    console.error(err);
    alert('Unexpected error while loading follow-up history');
  }
}
// Last & Next Activity cell এ ক্লিক করলে timeline modal
document.addEventListener('click', (e) => {
  const cell = e.target.closest('td.activity-history');
  if (!cell) return;

  const tr = cell.closest('tr');
  if (!tr || !tr.dataset.id) return;

  const leadId = tr.dataset.id;

  // Prospect নামটা row থেকে বের করে modal এর টাইটেলে দেখাবো
  const nameEl = tr.querySelector('td:nth-child(2) .font-weight-semibold');
  const leadLabel = nameEl ? nameEl.textContent.trim() : '';

  openFollowupTimeline(leadId, leadLabel);
});


// ---------- initial load ---------- //
loadLeads();
loadStats();
