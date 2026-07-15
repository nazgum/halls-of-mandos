export const state = {
  isPlaying: false,
  playInterval: null,
  currentReadIndex: 0,
  totalLines: 0,
  timelineMap: {},
  currentSpeed: 300
};

export function setSpeed(btnElement, speed) {
  document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');
  state.currentSpeed = speed;
  
  if (state.isPlaying) {
    clearInterval(state.playInterval);
    state.playInterval = setInterval(readNextLine, state.currentSpeed);
  }
}

export function togglePlay() {
  state.isPlaying = !state.isPlaying;
  const btn = document.getElementById('playBtn');
  
  if (state.isPlaying) {
    btn.classList.add('active');
    state.playInterval = setInterval(readNextLine, state.currentSpeed);
  } else {
    btn.classList.remove('active');
    clearInterval(state.playInterval);
  }
}

// attach to window so buttons work
window.setSpeed = setSpeed;
window.togglePlay = togglePlay;
window.scrollToLine = scrollToLine; 

export function scrollToLine(index) {
  state.currentReadIndex = index;
  const lineElement = document.getElementById(`line-${index}`);
  if (lineElement) {
    lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.querySelectorAll('.log-line').forEach(el => {
      el.classList.remove('flash-highlight', 'reader-highlight');
    });
    lineElement.classList.add('flash-highlight', 'reader-highlight');
  }
}

function readNextLine() {
  if (state.currentReadIndex >= state.totalLines) {
    togglePlay(); 
    return;
  }
  
  const lineElement = document.getElementById(`line-${state.currentReadIndex}`);
  
  if (lineElement) {
    lineElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.querySelectorAll('.log-line').forEach(el => el.classList.remove('reader-highlight'));
    lineElement.classList.add('reader-highlight');

    if (state.timelineMap[state.currentReadIndex]) {
      lineElement.classList.add('flash-highlight');
      setTimeout(() => lineElement.classList.remove('flash-highlight'), 1500);
      
      const tlItem = document.getElementById(`tl-${state.currentReadIndex}`);
      if (tlItem) {
        tlItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        tlItem.style.backgroundColor = 'rgba(122, 162, 247, 0.3)';
        setTimeout(() => tlItem.style.backgroundColor = '', 1000);
      }
    }
  }
  state.currentReadIndex++;
}