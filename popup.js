const soundSelect = document.getElementById('sound-select');
const assignBtn = document.getElementById('assign-sound');
const stopBtn = document.getElementById('stop-sound');
const customUpload = document.getElementById('custom-sound');
const volumeSlider = document.getElementById('volume-control');

const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer');
const pauseTimerBtn = document.getElementById('pause-timer');
const stopTimerBtn = document.getElementById('stop-timer');
const focusSummary = document.getElementById('focus-summary');

const focusInput = document.getElementById('focus-duration');
const breakInput = document.getElementById('break-duration');
const darkModeToggle = document.getElementById('dark-mode-toggle');

let isPaused = false;

// Assign sound
assignBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
    alert("❌ Cannot assign sound to internal browser pages.");
    return;
  }

  const url = new URL(tab.url);
  const hostname = url.hostname.replace('www.', '');
  const selectedSound = soundSelect.value;
  const volume = parseFloat(volumeSlider.value);

  chrome.storage.sync.get(['soundMappings'], async (data) => {
    const mappings = data.soundMappings || {};
    mappings[hostname] = selectedSound;
    await chrome.storage.sync.set({ soundMappings: mappings });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    chrome.tabs.sendMessage(tab.id, { action: 'playSound', sound: selectedSound, volume });
    alert(`✅ Assigned and played "${selectedSound}" on ${hostname}`);
  });
});

// Stop sound
stopBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
    alert("❌ Cannot stop sound on internal browser pages.");
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });

  chrome.tabs.sendMessage(tab.id, { action: 'stopSound' });
});

// Upload custom sound
customUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const blobUrl = URL.createObjectURL(file);
  const option = document.createElement('option');
  option.value = blobUrl;
  option.textContent = `🎵 ${file.name}`;
  soundSelect.appendChild(option);
  soundSelect.value = blobUrl;
});

// Pomodoro timer buttons
startTimerBtn.addEventListener('click', () => {
  const focusMinutes = parseInt(focusInput.value) || 25;
  chrome.runtime.sendMessage({ action: 'startTimer', duration: focusMinutes });
});

pauseTimerBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'pauseTimer' }, (res) => {
    isPaused = res.isPaused;
    pauseTimerBtn.textContent = isPaused ? 'Resume' : 'Pause';
  });
});

stopTimerBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'stopTimer' });
  timerDisplay.textContent = '00:00';
});

// Sync on open
function syncTimerFromBackground() {
  chrome.runtime.sendMessage({ action: 'getTimerState' }, (res) => {
    if (!res) return;
    updateTimerDisplay(res.remainingSeconds || 0);
    pauseTimerBtn.textContent = res.isPaused ? 'Resume' : 'Pause';
    isPaused = res.isPaused;
  });
}

function updateTimerDisplay(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  timerDisplay.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

syncTimerFromBackground();

// Volume control
volumeSlider.addEventListener('input', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'setVolume',
        volume: parseFloat(volumeSlider.value)
      });
    }
  });
});

// Focus summary
function updateFocusSummary() {
  const today = new Date().toISOString().split('T')[0];
  chrome.storage.local.get(['focusHistory'], (data) => {
    const history = data.focusHistory || {};
    const mins = history[today] || 0;
    focusSummary.textContent = `Focused for ${mins} minute(s) today.`;
  });
}

updateFocusSummary();

// Dark mode
darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkModeToggle.checked);
});
