// get filename from the url
const pathParts = window.location.pathname.split('/');
const logIndex = pathParts.indexOf('log');
const filename = logIndex !== -1 ? `${pathParts[logIndex + 1]}.txt` : null;

if (filename) {
  fetch('/api/logs') 
    .then(response => {
        if (!response.ok) throw new Error('API request failed');
        return response.json();
    })
    .then(logs => {
      // find the matching entry
      const logData = logs.find(log => log.filename === filename);

      if (logData) {
        document.title = `${logData.title} - MUME Log Viewer`;
        
        const titleElement = document.getElementById('log-title');
        if (titleElement) {
          titleElement.textContent = logData.title;
          titleElement.style.display = 'inline';
        }

        const homeSep = document.getElementById('home-seperator');
        if (homeSep) {
            homeSep.style.display = 'inline';
        }

        if (logData.discord_url) {
          const discordSep = document.getElementById('discord-seperator');
          if (discordSep) {
            discordSep.style.display = 'inline';
          }

          const discordBtn = document.getElementById('discord-link');
          if (discordBtn) {
            discordBtn.href = logData.discord_url;
            discordBtn.style.display = 'inline';
          }
        }
      }
    })
    .catch(err => console.error("Could not load log metadata for Discord link:", err));
}