// interactive.js
// Adds entrance animations, option selection behavior, and smooth hint/answer toggles.

document.addEventListener('DOMContentLoaded', () => {
  // 1) stagger enter animation for question cards
  const cards = Array.from(document.querySelectorAll('.question-card'));
  cards.forEach((c, i) => {
    setTimeout(() => c.classList.add('enter'), 120 + i * 80);
  });

  // 2) animated reveal for simplified-section when it exists
  const simple = document.querySelector('.simplified-section');
  if (simple) {
    setTimeout(() => simple.classList.add('visible'), 220);
  }

  // 3) clickable .option to toggle selected (supports radio semantics visually)
  document.querySelectorAll('.options').forEach(optGroup => {
    optGroup.addEventListener('click', ev => {
      const target = ev.target.closest('.option');
      if (!target) return;
      // if radio input exists, set it
      const input = target.querySelector('input[type="radio"]');
      if (input) {
        // deselect siblings
        optGroup.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        target.classList.add('selected');
        input.checked = true;
      } else {
        // toggle for non-radio option
        target.classList.toggle('selected');
      }
    });
  });

  // 4) improved hint/answer toggles
  window.toggleHint = function(n){
    const el = document.getElementById(`hint${n}`);
    if (!el) return;
    el.classList.toggle('open');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  window.toggleAnswer = function(n){
    const el = document.getElementById(`answer${n}`);
    if (!el) return;
    el.classList.toggle('open');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // 5) optional: nice micro-interaction for buttons
  document.querySelectorAll('button').forEach(b => {
    b.addEventListener('mouseenter', () => b.style.transform = 'translateY(-3px)');
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });
});
