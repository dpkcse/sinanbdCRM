const err = document.getElementById('err');
document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (err) { err.classList.add('d-none'); }
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    location.href = '/dashboard';
  } catch (e) {
    if (err) { err.textContent = e.message; err.classList.remove('d-none'); }
    else { alert(e.message); }
  }
});
