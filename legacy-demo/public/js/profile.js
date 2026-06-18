const id = window.location.pathname.split('/').filter(Boolean).pop();

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

async function loadProfile() {
  try {
    const res = await fetch(`/api/profiles/${id}`);
    if (!res.ok) throw new Error('not found');
    const p = await res.json();

    document.getElementById('pName').textContent = p.name;

    const badges = document.getElementById('pBadges');
    if (p.bloodGroup) {
      const b = document.createElement('span');
      b.className = 'pbadge blood';
      b.textContent = p.bloodGroup;
      badges.appendChild(b);
    }
    if (p.allergies) {
      const a = document.createElement('span');
      a.className = 'pbadge';
      a.textContent = `Allergic: ${p.allergies}`;
      badges.appendChild(a);
    }

    if (p.address) {
      document.getElementById('rowAddress').style.display = 'block';
      document.getElementById('pAddress').textContent = p.address;
    }
    if (p.medicalConditions) {
      document.getElementById('rowConditions').style.display = 'block';
      document.getElementById('pConditions').textContent = p.medicalConditions;
    }

    document.getElementById('pContact1Name').textContent = p.emergencyContactName || 'Primary contact';
    const c1 = document.getElementById('pContact1Phone');
    c1.href = `tel:${p.emergencyContactPhone}`;

    if (p.secondaryContactPhone) {
      document.getElementById('rowContact2').style.display = 'block';
      document.getElementById('pContact2Name').textContent = p.secondaryContactName || 'Secondary contact';
      document.getElementById('pContact2Phone').href = `tel:${p.secondaryContactPhone}`;
    }

    document.getElementById('pcard').style.display = 'block';
  } catch {
    document.getElementById('notFound').style.display = 'block';
  }
}

document.getElementById('briefBtn')?.addEventListener('click', async (e) => {
  const btn = e.target;
  const loading = document.getElementById('briefLoading');
  const textBox = document.getElementById('briefText');
  btn.disabled = true;
  loading.style.display = 'block';
  textBox.style.display = 'none';

  try {
    const res = await fetch(`/api/ai/brief/${id}`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not generate a brief.');
    textBox.textContent = data.brief;
    textBox.style.display = 'block';
  } catch (err) {
    textBox.textContent = err.message;
    textBox.style.display = 'block';
  } finally {
    loading.style.display = 'none';
    btn.disabled = false;
  }
});

// profile.html is served for any /profile/:id path; wire the click handler regardless
document.addEventListener('DOMContentLoaded', loadProfile);
