document.addEventListener('DOMContentLoaded', () => {
  // 1. Define your themes and a representative color for the dot
  const themes = [
    { id: 'tokyo-night-storm', name: 'Tokyo Night', color: '#7aa2f7' },
    { id: 'warm-coffee', name: 'Warm Coffee', color: '#756a5c' },
    { id: 'monokai-pro', name: 'Monokai Pro', color: '#fabd2f' },
    { id: 'onedark', name: 'One Dark', color: '#282c34' },
    { id: 'catppuccin-latte', name: 'Catppuccin Latte', color: '#eff1f5' },
    { id: 'paraiso-dark', name: 'Paraiso Dark', color: '#41323f' }
  ];

  const menu = document.getElementById('theme-menu');
  const toggleBtn = document.getElementById('theme-toggle');

  // 2. Build the dropdown menu
  themes.forEach(theme => {
    const btn = document.createElement('button');
    btn.className = 'theme-option';
    btn.innerHTML = `
      <span class="theme-dot" style="background-color: ${theme.color}"></span>
      ${theme.name}
    `;
    
    btn.addEventListener('click', () => {
      setTheme(theme.id);
      menu.classList.add('hidden'); // close menu after selection
    });
    
    menu.appendChild(btn);
  });

  // 3. Toggle menu visibility
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent document click from immediately closing it
    menu.classList.toggle('hidden');
  });

  // 4. Close menu if clicking anywhere else on the page
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('hidden') && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });

  // 5. Function to apply and save the theme
  function setTheme(themeId) {
    document.body.className = `theme-${themeId}`;
    localStorage.setItem('mume-theme', themeId);
  }

  // 6. Load saved theme on boot (default to Tokyo Night if none saved)
  const savedTheme = localStorage.getItem('mume-theme') || 'tokyo-night-storm';
  setTheme(savedTheme);
});