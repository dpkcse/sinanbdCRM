// public/javascripts/prospect_stages.js

const API_BASE = '/api/prospect-stages';   // app.js-এ এই base অনুযায়ী মাউন্ট করা আছে ধরে নিচ্ছি

// ------------ Common helpers ------------- //
function getToken() {
  return (
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    ''
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

  if (!res.ok) {
    let msg = 'API ' + res.status;
    try {
      const j = await res.json();
      if (j && j.error) msg = j.error;
    } catch (e) {}
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ------------ DOM refs ------------- //
const tbody       = document.querySelector('#tblStages tbody');
const btnAddStage = document.getElementById('btnAddStage');
const modal       = document.getElementById('stageModal');
const form        = document.getElementById('fStage');

const inputId     = document.getElementById('stage_id');
const inputName   = document.getElementById('stage_name');
const inputColor  = document.getElementById('stage_color');
const inputOrder  = document.getElementById('stage_order');
const inputActive = document.getElementById('stage_active');

// ------------ Load & render list ------------- //
async function loadStages() {
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

  try {
    const { data } = await api(API_BASE);

    if (!data || !data.length) {
      tbody.innerHTML = '<tr><td colspan="4">No stages found</td></tr>';
      return;
    }

    tbody.innerHTML = '';

    data.forEach((s) => {
      const tr = document.createElement('tr');
      tr.dataset.id = s.id;

      tr.innerHTML = `
        <td>${escapeHtml(s.name || '')}</td>
        <td>
          <span class="d-inline-block rounded"
                style="width:36px;height:18px;border:1px solid #ccc;background:${s.color ||
                  '#000000'};"></span>
          <span class="text-muted ml-2">${escapeHtml(s.color || '')}</span>
        </td>
        <td>${Number(s.display_order || 0)}</td>
        <td class="text-right">
          <button type="button"
                  class="btn btn-sm btn-outline-primary btn-edit"
                  data-id="${s.id}">
            <i class="fas fa-pen"></i>
          </button>
          <button type="button"
                  class="btn btn-sm btn-outline-danger btn-delete"
                  data-id="${s.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-danger">
          Failed to load stages: ${escapeHtml(err.message)}
        </td>
      </tr>
    `;
  }
}

// ------------ Modal helpers ------------- //
function resetForm() {
  inputId.value = '';
  inputName.value = '';
  inputColor.value = '#000000';
  inputOrder.value = '0';
  if (inputActive) inputActive.checked = true;
}

function fillForm(stage) {
  inputId.value = stage.id;
  inputName.value = stage.name || '';
  inputColor.value = stage.color || '#000000';
  inputOrder.value = stage.display_order || 0;
  if (inputActive) inputActive.checked = stage.is_active === 1;
}

function openCreateModal() {
  resetForm();
  $('#stageModal').modal('show');
}

function openEditModal(stage) {
  resetForm();
  fillForm(stage);
  $('#stageModal').modal('show');
}

// ------------ Save (create/update) ------------- //
async function handleSave(e) {
  e.preventDefault();

  const id = inputId.value.trim();
  const payload = {
    name: inputName.value.trim(),
    color: inputColor.value || '#000000',
    display_order: Number(inputOrder.value || 0),
  };
  if (inputActive) payload.is_active = inputActive.checked ? 1 : 0;

  if (!payload.name) {
    alert('Stage name is required');
    return;
  }

  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/${encodeURIComponent(id)}` : API_BASE;

    await api(url, {
      method,
      body: JSON.stringify(payload),
    });

    $('#stageModal').modal('hide');
    await loadStages();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Failed to save stage');
  }
}

// ------------ Delete ------------- //
async function handleDelete(id) {
  if (!id) return;

  // এখানে যদি Cancel করো -> সরাসরি return, আর কিছু হবে না
  if (!confirm('Are you sure you want to delete this stage?')) {
    return;
  }

  try {
    await api(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await loadStages();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Failed to delete stage');
  }
}

// ------------ Events ------------- //
document.addEventListener('DOMContentLoaded', () => {
  loadStages();

  if (btnAddStage) {
    btnAddStage.addEventListener('click', openCreateModal);
  }

  if (form) {
    form.addEventListener('submit', handleSave);
  }

  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.btn-edit');
      const delBtn  = e.target.closest('.btn-delete');

      if (editBtn) {
        const id = editBtn.dataset.id;
        try {
          const { data } = await api(`${API_BASE}/${encodeURIComponent(id)}`);
          openEditModal(data);
        } catch (err) {
          console.error(err);
          alert(err.message || 'Failed to load stage');
        }
      }

      if (delBtn) {
        const id = delBtn.dataset.id;
        handleDelete(id);
      }
    });
  }
});
