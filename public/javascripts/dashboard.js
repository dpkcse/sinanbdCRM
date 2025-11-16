// public/javascripts/dashboard.js

// ছোট API helper – আগের leads.js এর মতই structure
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
      location.href = '/login';
    }
    return res;
  },
};

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

let last14Chart = null;

async function loadDashboard() {
  try {
    const res = await API.request('/api/dashboard/summary');
    if (!res.ok) {
      console.error('Dashboard load failed', res.status);
      return;
    }
    const json = await res.json();

    const totals = json.totals || {};
    document.getElementById('totalLeads').textContent =
      totals.totalLeads || 0;
    document.getElementById('newToday').textContent =
      totals.newToday || 0;
    document.getElementById('last7Days').textContent =
      totals.last7Days || 0;

    renderStageFunnel(json.byStage || []);
    renderLast14Chart(json.last14 || []);
    renderRecentLeads(json.recent || []);
  } catch (err) {
    console.error(err);
  }
}

function renderStageFunnel(items) {
  const inner = document.getElementById('stageFunnelInner');
  if (!inner) return;

  if (!items.length) {
    inner.innerHTML =
      '<div class="text-muted small">No data yet</div>';
    return;
  }

  let total = 0;
  const stagesHtml = items
    .map((s) => {
      total += s.count;
      return `
        <div class="funnel-stage">
          <div class="funnel-count">${s.count}</div>
          <div class="funnel-label">${escapeHtml(s.stage)}</div>
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

  inner.innerHTML = stagesHtml + totalHtml;
}

function renderLast14Chart(items) {
  const ctx = document.getElementById('chartLast14');
  if (!ctx) return;

  // last 14 দিন নিশ্চিতভাবে ফিক্সড অর্ডারে বানাই
  const labels = [];
  const dataMap = new Map();
  items.forEach((it) => {
    dataMap.set(
      new Date(it.d).toISOString().slice(0, 10),
      it.c
    );
  });

  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    labels.push(
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    );
    if (!dataMap.has(key)) dataMap.set(key, 0);
  }

  const data = Array.from(dataMap.values());

  if (last14Chart) {
    last14Chart.destroy();
  }

  last14Chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Leads',
          data,
          fill: false,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          precision: 0,
        },
      },
    },
  });
}

function renderRecentLeads(list) {
  const tbody = document.getElementById('recentLeadsBody');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center text-muted py-3">No recent prospects</td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map(
      (l) => `
      <tr>
        <td>${escapeHtml(l.prospect_name)}</td>
        <td>${escapeHtml(l.primary_mobile || '')}</td>
        <td>${escapeHtml(l.priority || 'Normal')}</td>
        <td>${escapeHtml(formatDateTime(l.created_at))}</td>
      </tr>
    `
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', loadDashboard);
