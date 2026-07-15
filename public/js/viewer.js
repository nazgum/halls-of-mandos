import { parseLog } from './parser.js';
import { state } from './playback.js';

// extract the filename and setup
const pathParts = window.location.pathname.split('/');
const logIndex = pathParts.indexOf('log');
const filename = logIndex !== -1 ? `${pathParts[logIndex + 1]}.txt` : null;

const humanizeTitle = (name) => name.replace(/\.[^/.]+$/, "").split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

document.getElementById('log-title').style.display = 'none';

if (!filename) {
  document.getElementById('log-title').innerText = "No File Selected";
  document.getElementById('logContainer').innerHTML = "Please select a log from the <a href='/'>index page</a>.";
} else {
  document.getElementById('log-title').innerText = humanizeTitle(filename);
  document.title = `${humanizeTitle(filename)} - MUME Log Viewer`;
  document.getElementById('logContainer').innerHTML = '<div class="loading">Loading log...</div>';

  // update view count
  fetch(`/api/view/${filename}`, { method: 'POST' }).catch(err => console.error("View count update failed", err));

  // log the log
  fetch(`/logs/${filename}`)
    .then(response => {
      if (!response.ok) throw new Error('Log file not found');
      
      // Set date meta
      const modified = response.headers.get('last-modified');
      const d = modified ? new Date(modified) : new Date();
      document.getElementById('metaDate').innerText = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      return response.text();
    })
    .then(rawLog => {
      // log loaded, parse it
      const parsedData = parseLog(rawLog); 
      document.getElementById('logContainer').innerHTML = parsedData.html;

      const userMeta = document.getElementById('user-meta');
      if (userMeta) {
          userMeta.style.display = 'block'; // Or 'flex', depending on your layout
      }

      const logTitle = document.getElementById('log-title');
      if (logTitle) {
          logTitle.style.display = 'flex';
      }

      // sync state for playback.js
      // count the lines based on the html output
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = parsedData.html;
      state.totalLines = tempDiv.querySelectorAll('.log-line').length;
      
      // build map for the playback module to know which lines have timeline events
      state.timelineMap = {};
      parsedData.timeline.forEach(t => state.timelineMap[t.lineIndex] = true);

      // render timeline sidebar
      const timelineHtml = parsedData.timeline.map(event => `
        <div class="timeline-item" id="tl-${event.lineIndex}" onclick="scrollToLine(${event.lineIndex})">
          <span class="timeline-icon">${event.icon}</span>
          <span class="timeline-desc" title="${event.text}">${event.text}</span>
        </div>
      `).join('');
      
      document.getElementById('timelineContainer').innerHTML = timelineHtml || 
        `<div style="color: var(--dim); font-style: italic; padding: 10px;">No incidents captured.</div>`;
    })
    .catch(err => {
      document.getElementById('logContainer').innerHTML = `<span style="color: var(--red);">Error loading log: ${err.message}.</span>`;
    });
}