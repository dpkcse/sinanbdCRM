const API = {
    async req(path, opts = {}) {
      const t = localStorage.getItem('accessToken');
      opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}, t ? { Authorization: 'Bearer ' + t } : {});
      opts.credentials = 'include';
      const r = await fetch(path, opts);
      if (r.status === 401 && !opts.__retry) {
        const rr = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        if (rr.ok) {
          const { accessToken } = await rr.json();
          localStorage.setItem('accessToken', accessToken);
          opts.__retry = true; return API.req(path, opts);
        } else { location.href = '/login'; return; }
      }
      return r;
    }
  };
  
  async function load() {
    const r = await API.req('/api/contacts');
    const { data } = await r.json();
    const tb = document.querySelector('#tbl tbody');
    tb.innerHTML = data.map(c =>
      `<tr><td>${c.name||''}</td><td>${c.email||''}</td><td>${c.phone||''}</td><td>${c.company||''}</td><td class="text-right"></td></tr>`
    ).join('');
  }
  load();
  
  document.getElementById('fNew')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value || null,
      phone: document.getElementById('phone').value || null,
      company: document.getElementById('company').value || null,
      address: document.getElementById('address').value || null,
      notes: document.getElementById('notes').value || null
    };
    const r = await API.req('/api/contacts', { method: 'POST', body: JSON.stringify(payload) });
    if (r.ok) { $('#newModal').modal('hide'); load(); }
  });
  
  document.getElementById('logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('accessToken');
    location.href = '/login';
  });
  