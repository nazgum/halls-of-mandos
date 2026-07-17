document.addEventListener('DOMContentLoaded', () => {
  const themes = [
    { id: 'tokyo-night-storm', name: 'Tokyo Night', color: '#7aa2f7' },
    { id: 'catppuccin-frappe', name: 'Catppuccin Frappe', color: '#c6d0f5' },
    { id: 'catppuccin-latte', name: 'Catppuccin Latte', color: '#eff1f5' },
    { id: 'solarized-light', name: 'Solarized Light', color: '#fdf6e3' },
    { id: 'warm-coffee', name: 'Warm Coffee', color: '#756a5c' },
    { id: 'monokai-pro', name: 'Monokai Pro', color: '#fabd2f' },
    { id: 'paraiso-dark', name: 'Paraiso Dark', color: '#41323f' },
    { id: 'onedark', name: 'One Dark', color: '#282c34' }
  ];

  const menu = document.getElementById('theme-menu');
  const toggleBtn = document.getElementById('theme-toggle');

  // create dropdown menu
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

  // toggle menu visibility
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent from immediately closing it
    menu.classList.toggle('hidden');
  });

  // close menu if clicking anywhere else on the page
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('hidden') && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });

  // apply and save the theme
  function setTheme(themeId) {
    document.body.className = `theme-${themeId}`;
    localStorage.setItem('mume-theme', themeId);
  }

  // load saved theme on start
  const savedTheme = localStorage.getItem('mume-theme') || 'tokyo-night-storm';
  setTheme(savedTheme);
});