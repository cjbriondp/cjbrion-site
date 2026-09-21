(() => {
  'use strict';

  // Preserve the approved webpage's slow rotation: about 14.6 seconds per turn.
  const HEAD_PLAYBACK_RATE = 0.65;
  const root = document.documentElement;
  const video = document.querySelector('.head-video');
  const rig = document.querySelector('.rig');
  const button = document.querySelector('.motion-toggle');
  const label = document.querySelector('.motion-label');
  const status = document.querySelector('#motion-status');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches;
  let failed = false;
  let request = 0;

  video.muted = true;
  video.defaultPlaybackRate = HEAD_PLAYBACK_RATE;
  video.playbackRate = HEAD_PLAYBACK_RATE;

  function syncPlayback() {
    const currentRequest = ++request;
    const playing = !paused && !document.hidden;
    root.dataset.motion = playing ? 'playing' : 'paused';
    root.dataset.paused = String(paused);
    label.textContent = paused ? 'Play motion' : 'Pause motion';
    button.setAttribute('aria-label', paused ? 'Play background motion' : 'Pause background motion');

    if (!playing) {
      video.pause();
      return;
    }
    if (failed) return;
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.playbackRate = HEAD_PLAYBACK_RATE;
    video.play().catch(() => {
      // An older play request can reject after a click or a hidden-tab pause.
      if (currentRequest !== request || paused || document.hidden || failed) return;
      paused = true;
      status.textContent = 'Background motion is paused. Use Play motion to start it.';
      syncPlayback();
    });
  }

  video.addEventListener('playing', () => rig.classList.add('video-ready'));
  video.addEventListener('error', () => {
    failed = true;
    rig.classList.remove('video-ready');
    status.textContent = 'The background animation could not load. The still artwork is displayed.';
  });
  button.addEventListener('click', () => {
    paused = !paused;
    if (!failed) status.textContent = '';
    syncPlayback();
  });
  preference.addEventListener('change', event => {
    paused = event.matches;
    syncPlayback();
  });
  // This background belongs to the entire page, so scrolling never pauses it.
  document.addEventListener('visibilitychange', syncPlayback);
  button.hidden = false;
  syncPlayback();
})();
