// Decorative QR in the hero mockup card
document.addEventListener('DOMContentLoaded', () => {
  const heroQr = document.getElementById('heroQr');
  if (heroQr && window.QRCode) {
    new QRCode(heroQr, {
      text: 'https://pulsetagqr.example/profile/demo',
      width: 220, height: 220,
      colorDark: '#11332D', colorLight: '#ffffff'
    });
  }
});

// ---------- AI chat widget ----------
(function () {
  const launcher = document.getElementById('chatLauncher');
  const panel = document.getElementById('chatPanel');
  const body = document.getElementById('chatBody');
  const input = document.getElementById('chatInput');
  const send = document.getElementById('chatSend');
  if (!launcher) return;

  const history = [];

  launcher.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input.focus();
  });

  function addMsg(text, who) {
    const div = document.createElement('div');
    div.className = `msg ${who}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMsg(text, 'user');
    history.push({ role: 'user', text });
    const thinking = addMsg('…', 'bot');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });
      const data = await res.json();
      thinking.remove();
      if (!res.ok) {
        addMsg(data.error || 'Something went wrong. Please try again.', 'bot');
        return;
      }
      addMsg(data.reply, 'bot');
      history.push({ role: 'assistant', text: data.reply });
    } catch {
      thinking.remove();
      addMsg('Network error — please try again.', 'bot');
    }
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
})();
