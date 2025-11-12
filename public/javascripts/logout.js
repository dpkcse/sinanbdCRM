document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnLogout');
    if (!btn) return;
  
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        // server-side logout: refresh cookie revoke + clear
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } catch (err) {
        // নেটওয়ার্ক ইস্যু হলে তবুও লোকাল টোকেন ক্লিয়ার করে দেই
        console.warn('Logout request failed, clearing local tokens anyway.', err);
      }
      // client-side tokens clear + redirect
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    });
  });
  