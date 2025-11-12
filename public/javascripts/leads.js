const API = {
    async req(path, opts = {}) {
      const t = localStorage.getItem('accessToken');
      opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}, t ? { Authorization: 'Bearer ' + t } : {});
      opts.credentials = 'include';
      const r = await fetch(path, opts);
      if (r.status === 401 && !opts.__retry) {
        const rr = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        if (rr.ok) { const { accessToken } = await rr.json(); localStorage.setItem('accessToken', accessToken); opts.__retry = true; return API.req(path, opts); }
        location.href='/login'; return;
      }
      return r;
    }
  };
  
  let state = { q:'', page:1, pageSize:10, total:0 };
  
  function rowsHtml(list) {
    return list.map(x => `
      <tr data-id="${x.id}">
        <td>${x.prospect_name||''}</td>
        <td>${x.primary_mobile||''}</td>
        <td>${x.primary_email||''}</td>
        <td>${x.project_name||''}</td>
        <td><span class="badge badge-secondary">${x.status||''}</span></td>
        <td class="text-right"><button class="btn btn-xs btn-danger del"><i class="fas fa-trash"></i></button></td>
      </tr>
    `).join('');
  }
  
  async function load() {
    const params = new URLSearchParams({ q: state.q, page: state.page, pageSize: state.pageSize });
    const r = await API.req('/api/leads?' + params.toString());
    const { data, total, page, pageSize } = await r.json();
    state.total = total; state.page = page; state.pageSize = pageSize;
    document.querySelector('#tbl tbody').innerHTML = rowsHtml(data);
    const start = (page-1)*pageSize+1, end = Math.min(total, page*pageSize);
    document.getElementById('pageInfo').textContent = total ? `Showing ${start}-${end} of ${total}` : 'No results';
    document.getElementById('prev').disabled = (page<=1);
    document.getElementById('next').disabled = (page*pageSize>=total);
  }
  
  // users for assignments (Select2)
  async function loadUsers() {
    const r = await API.req('/api/users/options'); const { data } = await r.json();
    const sel = $('#assigned_to'); sel.empty();
    data.forEach(u => sel.append(new Option(u.name, u.id, false, false)));
    sel.select2({ width:'resolve' });
  }
  
  document.getElementById('btnSearch').addEventListener('click', ()=>{ state.q=document.getElementById('q').value.trim(); state.page=1; load(); });
  document.getElementById('q').addEventListener('keyup', e=>{ if(e.key==='Enter'){ state.q=e.target.value.trim(); state.page=1; load(); }});
  document.getElementById('prev').addEventListener('click', ()=>{ if(state.page>1){ state.page--; load(); }});
  document.getElementById('next').addEventListener('click', ()=>{ if(state.page*state.pageSize<state.total){ state.page++; load(); }});
  
  // open modal → refresh users
  $('#leadModal').on('shown.bs.modal', loadUsers);
  
  // Save lead (create + sub-sections + assignments)
  document.getElementById('fLead').addEventListener('submit', async (e)=>{
    e.preventDefault();
  
    const base = {
      prospect_type: document.querySelector('input[name="prospect_type"]:checked')?.value || 'Individual',
      prospect_name: document.getElementById('prospect_name').value,
      primary_mobile: document.getElementById('primary_mobile').value,
      primary_email: document.getElementById('primary_email').value || null,
      project_name: document.getElementById('project_name').value || null,
      already_client: document.getElementById('already_client').checked,
      priority: document.getElementById('priority').value,
      interested_item: document.getElementById('interested_item').value || null,
      zone: document.getElementById('zone').value || null,
      status: document.getElementById('status').value,
      campaign: document.getElementById('campaign').value || null,
      contacted_by: document.getElementById('contacted_by').value || null,
      info_source: document.getElementById('info_source').value || null,
      important_note: document.getElementById('important_note').value || null
    };
  
    const r = await API.req('/api/leads', { method:'POST', body: JSON.stringify(base) });
    if (!r.ok) { const er = await r.json(); alert(er.error||'Failed'); return; }
    const { data } = await r.json(); const id = data.id;
  
    // personal
    const personal = {
      dob: document.getElementById('dob').value || null,
      gender: document.getElementById('gender').value || null,
      nid: document.getElementById('nid').value || null,
      address_line1: document.getElementById('address_line1').value || null,
      address_line2: document.getElementById('address_line2').value || null,
      city: document.getElementById('city').value || null,
      postal_code: document.getElementById('postal_code').value || null
    };
    await API.req(`/api/leads/${id}/personal`, { method:'PUT', body: JSON.stringify(personal) });
  
    // communication
    const comm = {
      preferred_channel: document.getElementById('preferred_channel').value || null,
      whatsapp: document.getElementById('whatsapp').value || null,
      facebook: document.getElementById('facebook').value || null,
      last_contact_at: document.getElementById('last_contact_at').value || null,
      notes: document.getElementById('comm_notes').value || null
    };
    await API.req(`/api/leads/${id}/communication`, { method:'PUT', body: JSON.stringify(comm) });
  
    // job
    const job = {
      profession: document.getElementById('profession').value || null,
      organization: document.getElementById('organization').value || null,
      designation: document.getElementById('designation').value || null,
      income: document.getElementById('income').value || null
    };
    await API.req(`/api/leads/${id}/job`, { method:'PUT', body: JSON.stringify(job) });
  
    // influencer
    const infl = {
      is_influenced: document.getElementById('is_influenced').checked,
      influencer_name: document.getElementById('influencer_name').value || null,
      influencer_contact: document.getElementById('influencer_contact').value || null,
      relation: document.getElementById('relation').value || null,
      notes: document.getElementById('infl_notes').value || null
    };
    await API.req(`/api/leads/${id}/influencer`, { method:'PUT', body: JSON.stringify(infl) });
  
    // assignments
    const user_ids = ($('#assigned_to').val() || []).map(Number);
    const primary_id = user_ids.length ? user_ids[0] : null;
    await API.req(`/api/leads/${id}/assignments`, { method:'PUT', body: JSON.stringify({ user_ids, primary_id }) });
  
    $('#leadModal').modal('hide');
    state.page = 1; state.q=''; document.getElementById('q').value='';
    load();
  });
  
  // delete
  document.querySelector('#tbl tbody').addEventListener('click', async (e)=>{
    const btn = e.target.closest('.del'); if(!btn) return;
    const tr = btn.closest('tr'); const id = tr.dataset.id;
    if(!confirm('Delete this lead?')) return;
    const r = await API.req('/api/leads/'+id, { method:'DELETE' });
    if (r.status===204) load();
  });
  
  // Bulk template & upload
  document.getElementById('btnTemplate').addEventListener('click', ()=>{ window.location = '/api/leads/template'; });
  
  document.getElementById('fBulk').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const f = document.getElementById('bulkFile');
    if (!f.files.length) return;
    const fd = new FormData(); fd.append('file', f.files[0]);
    const r = await fetch('/api/leads/bulk', { method:'POST', body: fd, credentials:'include' });
    const json = await r.json();
    document.getElementById('bulkResult').innerHTML =
      `<div class="alert alert-info mb-2">Inserted: ${json.inserted}</div>` +
      (json.errors?.length ? `<div class="alert alert-warning"><b>Errors:</b><br>${json.errors.slice(0,10).join('<br>')}</div>` : '');
    if (json.inserted) load();
  });
  
  load();
  