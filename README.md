# 🎧 Tab Atmosphere Sound Manager

A Chrome extension that brings personalized ambient soundscapes to your browser tabs, combined with a fully functional Pomodoro timer and focus tracker.

---

## 🌟 Features

### 🗂 Tab-Based Sound Assignment
- Assign ambient background sounds (rain, nature, focus, ambient) to specific websites.
- Custom sound upload supported (`.mp3`, `.ogg`, `.wav`).
- Supports external URLs like YouTube or Spotify via embedded playback.
- Volume control per tab.
- Optional sound playback confirmation on tab load.

### ⏱ Pomodoro Timer
- Start, pause, and stop Pomodoro sessions.
- Customizable focus and break durations.
- Runs persistently in the background (even if popup is closed).
- Countdown badge shown in the extension icon.
- Notification alerts when sessions complete.

### 🎯 Focus Tracking
- Daily summary of time spent in focused sessions.
- Local history saved automatically.

### 🌓 Dark Mode
- Toggle between light and dark UI themes in the popup.

---


## 🚀 Installation

### From Source
1. Clone or download this repository.
2. Go to `chrome://extensions` in your browser.
3. Enable **Developer Mode**.
4. Click **Load unpacked**.
5. Select the project folder (`tab-atmosphere-extension/`).

---

## 🗃 Project Structure 
```
│ tab-atmosphere-extension/
├── manifest.json # Chrome extension manifest (v3)
├── background.js # Handles sound mapping & persistent timer logic
├── content.js # Runs in tabs, plays/stops audio
├── popup.html # Main UI for the popup
├── popup.js # UI logic and communication with background
├── popup.css # Light/dark theme styling
├── icons/ # Extension icon(s)
└── sounds/ # Default ambient sound files
 ```

---

## 🙌 Collaborators

Made by:
- [Ridhi Gupta](https://github.com/dev-ridhi)
- [Krutika Gaur](https://github.com/gaurkrutika)


---


