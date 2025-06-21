if (!window.__tabAtmosphereInitialized) {
  window.__tabAtmosphereInitialized = true;
  window.currentAudio = null;

  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'playSound') {
      playAmbientSound(request.sound, request.volume || 0.4);
    } else if (request.action === 'stopSound') {
      stopCurrentSound();
    } else if (request.action === 'setVolume') {
      if (window.currentAudio) window.currentAudio.volume = request.volume;
    } else if (request.action === 'promptPlaySound') {
      const confirmed = confirm(`Play ambient sound for this tab?`);
      if (confirmed) {
        playAmbientSound(request.sound, 0.4);
      }
    }
  });

  const playAmbientSound = (soundFile, volume) => {
    stopCurrentSound();

    const isBlob = soundFile.startsWith('blob:');
    const audioUrl = isBlob ? soundFile : chrome.runtime.getURL(soundFile);

    try {
      window.currentAudio = new Audio(audioUrl);
      window.currentAudio.loop = true;
      window.currentAudio.volume = volume;

      const canPlay =
        window.currentAudio.canPlayType('audio/mpeg') ||
        window.currentAudio.canPlayType('audio/ogg');

      if (!canPlay) {
        alert("⚠️ Unsupported audio format.");
        return;
      }

      window.currentAudio.play().catch(() => {
        document.addEventListener(
          'click',
          () => window.currentAudio.play().catch(() => {}),
          { once: true }
        );
      });
    } catch (err) {
      console.error('Audio load error:', err.message);
    }
  };

  const stopCurrentSound = () => {
    if (window.currentAudio) {
      window.currentAudio.pause();
      window.currentAudio = null;
    }
  };

  window.addEventListener('beforeunload', stopCurrentSound);
}
