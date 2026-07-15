document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('log-list');

  fetch('/api/logs')
    .then(res => res.json())
    .then(logs => {

      // 1. Sort the logs array by date descending (Newest first)
      const sortedLogs = logs.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      container.innerHTML = sortedLogs.map(log => {
        // strip '.txt' from the filename
        const slug = log.filename.replace(/\.txt$/, '');
        
        return `
          <div class="log-item" onclick="window.location.href='/log/${slug}'">
            <div>
              <div class="log-title">${log.title}</div>
              <div class="log-date">By <strong>${log.author}</strong> on ${log.date}</div>
            </div>
            <div class="log-views">
              ${log.views} views
            </div>
          </div>
        `;
      }).join('');
    })
    .catch(err => {
      container.innerHTML = `<div style="padding:20px; color:var(--red)">Failed to load logs.</div>`;
      console.error(err);
    });
});