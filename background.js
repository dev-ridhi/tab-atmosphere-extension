// Ambient sound mapping on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['soundMappings'], (data) => {
    if (!data.soundMappings) {
      const defaultMappings = {
        'docs.google.com': 'sounds/rain.mp3',
        'youtube.com': 'sounds/ambient.mp3',
        'github.com': 'sounds/focus.mp3',
        'wikipedia.org': 'sounds/nature.mp3'
      };
      chrome.storage.sync.set({ soundMappings: defaultMappings });
    }
  });
});

// Play assigned sound on tab load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    tab.url &&
    !tab.url.startsWith('chrome://') &&
    !tab.url.startsWith('edge://')
  ) {
    chrome.storage.sync.get(['soundMappings'], (data) => {
      const mappings = data.soundMappings || {};
      const hostname = new URL(tab.url).hostname.replace('www.', '');
      const sound = mappings[hostname];

      if (sound) {
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js']
        }).then(() => {
          chrome.tabs.sendMessage(tabId, {
            action: 'promptPlaySound',
            sound
          });
        });
      }
    });
  }
});

// ✅ Pomodoro Timer Logic
let timer = null;
let isPaused = false;
let isOnBreak = false;
let remainingSeconds = 0;
let originalFocusSeconds = 0;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'startTimer') {
    isPaused = false;
    isOnBreak = false;
    originalFocusSeconds = msg.duration * 60;
    remainingSeconds = originalFocusSeconds;
    startTimer();
  } else if (msg.action === 'pauseTimer') {
    isPaused = !isPaused;
    sendResponse({ isPaused });
  } else if (msg.action === 'stopTimer') {
    clearInterval(timer);
    timer = null;
    remainingSeconds = 0;
    chrome.action.setBadgeText({ text: '' });
  } else if (msg.action === 'getTimerState') {
    sendResponse({ remainingSeconds, isPaused, isOnBreak });
  }
});

function startTimer() {
  clearInterval(timer);
  updateBadge(remainingSeconds);

  timer = setInterval(() => {
    if (!isPaused) {
      remainingSeconds--;
      updateBadge(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(timer);
        chrome.action.setBadgeText({ text: '' });

        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: isOnBreak ? '⏰ Break Over!' : '✅ Focus Complete!',
          message: isOnBreak ? 'Time to get back to work!' : 'Take a short break!',
        });

        if (!isOnBreak) {
          isOnBreak = true;
          remainingSeconds = 5 * 60; // default break
          startTimer();
        }
      }
    }
  }, 1000);
}

function updateBadge(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const label = `${min}:${sec.toString().padStart(2, '0')}`;
  chrome.action.setBadgeText({ text: label });
  chrome.action.setBadgeBackgroundColor({ color: '#4caf50' });
}
