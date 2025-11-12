const API = {
  async req(path, opts = {}) {
    const t = localStorage.getItem('accessToken');
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}, t ? { Authorization: 'Bearer ' + t } : {});
    opts.credentials = 'include';
    const r = await fetch(path, opts);
    if (r.status === 401 && !opts.__retry) {
      const rr = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      if (rr.ok) { const { accessToken } = await rr.json(); localStorage.setItem('accessToken', accessToken); opts.__retry = true; return API.req(path, opts); }
      location.href = '/login'; return;
    }
    return r;
  }
};

function setNum(id, v){ document.getElementById(id).textContent = v; }

async function loadMetrics(){
  const r = await API.req('/api/leads/metrics'); const m = await r.json();
  setNum('mTotal', m.total); setNum('mToday', m.today); setNum('mLast7', m.last7);
}

let chStatus, chTrend;

function pieStatus(ctx, stats){
  const labels = stats.map(x=>x.k || '(Unknown)');
  const values = stats.map(x=>x.v);
  if (chStatus) chStatus.destroy();
  chStatus = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data: values }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
}

function lineTrend(ctx, trend){
  const labels = trend.map(x=>x.d);
  const values = trend.map(x=>x.v);
  if (chTrend) chTrend.destroy();
  chTrend = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Leads', data: values, fill: false }] },
    options: { responsive: true, scales: { y: { beginAtZero: true, precision: 0 } } }
  });
}

function renderRecent(list){
  const tbody = document.getElementById('recentBody');
  tbody.innerHTML = list.map(r=>`
    <tr>
      <td>${r.prospect_name||''}</td>
      <td>${r.primary_mobile||''}</td>
      <td><span class="badge badge-secondary">${r.status||''}</span></td>
      <td>${new Date(r.created_at).toLocaleString()}</td>
    </tr>
  `).join('');
}

async function loadStats(){
  const r = await API.req('/api/leads/stats'); const s = await r.json();
  pieStatus(document.getElementById('chStatus').getContext('2d'), s.byStatus || []);
  lineTrend(document.getElementById('chTrend').getContext('2d'), s.trend14 || []);
  renderRecent(s.recent || []);
}

(async function init(){
  await loadMetrics();
  await loadStats();
})();
