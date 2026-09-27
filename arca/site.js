(() => {
  'use strict';

  // Shuffle the Trusted By wall so every visit shows a random order.
  const grid = document.querySelector('.logo-grid');
  if (grid) {
    const items = Array.from(grid.children);
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    items.forEach(el => grid.appendChild(el));
  }

  // Contact form: compose a pre-filled email (no backend needed).
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const subject = 'Project inquiry — ' + d.get('name');
      const body =
        'Name: ' + d.get('name') + '\n' +
        'Email: ' + d.get('email') + '\n' +
        'Company: ' + (d.get('company') || '—') + '\n' +
        'Project type: ' + d.get('type') + '\n\n' +
        d.get('message');
      window.location.href = 'mailto:Travis@arcacerebrum.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
    });
  }
})();
