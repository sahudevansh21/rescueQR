document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.style.display = 'none';

  const payload = Object.fromEntries(new FormData(form).entries());
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Generating…';

  try {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not create your profile.');

    document.getElementById('formCard').style.display = 'none';
    const result = document.getElementById('result');
    result.style.display = 'block';
    document.getElementById('qrImg').src = data.qrDataUrl;
    document.getElementById('profileLink').textContent = data.profileUrl;
    document.getElementById('viewProfileBtn').href = data.profileUrl;
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Generate my QR tag';
  }
});
