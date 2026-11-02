const steps = [
  { label: 'satu hal dulu...', text: 'Haloooo 👋' },
  { label: 'eee...', text: 'eee aku cuma mau bilang' },
  { label: 'hehehe', text: 'kamu coba liat ini deh' }
];

const gate = document.querySelector('#gate');
const popup = document.querySelector('#popup');
const popupLabel = document.querySelector('#popupLabel');
const popupText = document.querySelector('#popupText');
const popupCountdown = document.querySelector('#popupCountdown');
const nextButton = document.querySelector('#nextButton');
const birthdayPage = document.querySelector('#birthdayPage');
const mainCard = document.querySelector('#mainCard');
const reasonCard = document.querySelector('#reasonCard');
const reasonTitle = document.querySelector('#reasonTitle');
const whyButton = document.querySelector('#whyButton');
const backButton = document.querySelector('#backButton');
const audio = document.querySelector('#birthdaySong');
const musicToggle = document.querySelector('#musicToggle');
const songSeek = document.querySelector('#songSeek');
const songTime = document.querySelector('#songTime');
const fxLayer = document.querySelector('#fxLayer');
const photoGuard = document.querySelector('.photo-guard');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dots = Array.from(document.querySelectorAll('.dot'));

let stepIndex = 0;
let countdownTimer = null;
let songPrimed = false;
let songPrimePromise = null;

audio.volume = 0.62;

if (photoGuard) {
  ['contextmenu', 'dragstart', 'selectstart'].forEach((eventName) => {
    photoGuard.addEventListener(eventName, (event) => event.preventDefault());
  });
}

function showStep(index) {
  if (countdownTimer) window.clearInterval(countdownTimer);
  stepIndex = index;
  const step = steps[index];

  popup.classList.remove('pop-in');
  void popup.offsetWidth;
  popupLabel.textContent = step.label;
  popupText.textContent = step.text;
  dots.forEach((dot, dotIndex) => dot.classList.toggle('on', dotIndex === index));
  popup.classList.add('pop-in');

  nextButton.hidden = index === 1;
  if (index === 0) {
    nextButton.disabled = false;
    nextButton.textContent = 'tunggu yaa';
  } else if (index === 2) {
    nextButton.disabled = true;
    nextButton.textContent = 'open';
  }

  startCountdown();
}

function startCountdown() {
  let seconds = 5;
  updateCountdownText(seconds);
  countdownTimer = window.setInterval(() => {
    seconds -= 1;
    if (seconds > 0) {
      updateCountdownText(seconds);
      return;
    }

    window.clearInterval(countdownTimer);
    countdownTimer = null;
    if (stepIndex < 2) {
      if (stepIndex === 0) startSongAfterPopupOne();
      showStep(stepIndex + 1);
    } else {
      popupCountdown.textContent = 'siap dibuka ✨';
      nextButton.disabled = false;
    }
  }, 1000);
}

function updateCountdownText(seconds) {
  if (stepIndex === 0) {
    popupCountdown.textContent = 'klik “tunggu yaa” buat siapin lagu · lanjut dalam ' + seconds + ' detik';
  } else if (stepIndex === 2) {
    popupCountdown.textContent = 'open dalam ' + seconds + ' detik';
  } else {
    popupCountdown.textContent = 'halaman selanjutnya dalam ' + seconds + ' detik';
  }
}

function prepareSong() {
  if (songPrimed || songPrimePromise) return;
  audio.currentTime = 0;
  audio.muted = true;
  const playPromise = audio.play();
  if (playPromise && typeof playPromise.then === 'function') {
    songPrimePromise = playPromise.then(() => {
      songPrimed = true;
    }).catch(() => {
      audio.muted = false;
    }).finally(() => {
      songPrimePromise = null;
    });
  }
}

async function startSongAfterPopupOne() {
  if (songPrimePromise) await songPrimePromise;
  if (songPrimed && !audio.paused) {
    audio.currentTime = 0;
    audio.muted = false;
    songPrimed = false;
    return;
  }
  await startSong();
}

async function startSong() {
  audio.muted = false;
  if (!audio.paused) return;
  try {
    await audio.play();
  } catch {
    musicToggle.textContent = '▶';
    musicToggle.setAttribute('aria-label', 'Putar musik');
  }
}

nextButton.addEventListener('click', () => {
  if (stepIndex === 0) {
    prepareSong();
    nextButton.disabled = true;
    return;
  }

  if (stepIndex === 2 && !nextButton.disabled) {
    if (audio.paused || audio.muted) startSong();
    gate.classList.add('closing');
    birthdayPage.classList.add('active');
    window.setTimeout(() => gate.remove(), 500);
  }
});

musicToggle.addEventListener('click', () => {
  if (audio.paused) {
    startSong();
  } else {
    audio.pause();
  }
});

audio.addEventListener('play', () => {
  musicToggle.textContent = 'Ⅱ';
  musicToggle.setAttribute('aria-label', 'Jeda musik');
});
audio.addEventListener('pause', () => {
  musicToggle.textContent = '▶';
  musicToggle.setAttribute('aria-label', 'Putar musik');
});
audio.addEventListener('timeupdate', () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  songSeek.value = String((audio.currentTime / audio.duration) * 100);
  const totalSeconds = Math.floor(audio.currentTime);
  songTime.textContent = Math.floor(totalSeconds / 60) + ':' + String(totalSeconds % 60).padStart(2, '0');
});
songSeek.addEventListener('input', () => {
  if (Number.isFinite(audio.duration)) {
    audio.currentTime = (Number(songSeek.value) / 100) * audio.duration;
  }
});

whyButton.addEventListener('click', () => {
  mainCard.hidden = true;
  reasonCard.hidden = false;
  whyButton.setAttribute('aria-expanded', 'true');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  reasonTitle.focus({ preventScroll: true });
});

backButton.addEventListener('click', () => {
  reasonCard.hidden = true;
  mainCard.hidden = false;
  whyButton.setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  whyButton.focus({ preventScroll: true });
});

function startAmbientAnimation() {
  if (reduceMotion) return;
  const motifs = ['✿', '❀', '✧', '❁', '✦', '♡', '✿', '·'];
  const symbols = Array.from({ length: 36 }, (_, index) => motifs[index % motifs.length]);
  symbols.forEach((symbol, index) => {
    const item = document.createElement('span');
    const isStar = ['✧', '✦', '·'].includes(symbol);
    item.className = isStar ? 'fx star' : 'fx';
    item.textContent = symbol;
    item.style.left = ((index * 37 + 8) % 100) + '%';
    item.style.setProperty('--duration', (14 + (index % 6) * 2) + 's');
    item.style.setProperty('--delay', (-index * .8) + 's');
    item.style.setProperty('--drift', ((index % 2 ? 1 : -1) * (20 + (index % 4) * 11)) + 'px');
    item.style.fontSize = (10 + (index % 4) * 3) + 'px';
    fxLayer.appendChild(item);
  });
}

window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector('#progress').style.transform = 'scaleX(' + (scrollable > 0 ? window.scrollY / scrollable : 0) + ')';
}, { passive: true });

prepareSong();
startAmbientAnimation();
showStep(0);

