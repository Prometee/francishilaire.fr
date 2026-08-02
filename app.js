const button = document.querySelector('[data-theme-toggle]');
const stored = localStorage.getItem('theme');
const currentYear = new Date().getFullYear();
document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = currentYear;
});
if (stored) document.documentElement.dataset.theme = stored;
button?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
  button.setAttribute('aria-label', next === 'light' ? 'Activer le thème sombre' : 'Activer le thème clair');
});

const timelineWebsites = document.documentElement.lang === 'fr'
  ? [
    { label: 'flux.audio', url: 'https://www.flux.audio/' },
    { label: 'Société radiée en 2024' },
    { label: 'ads-com.fr', url: 'https://www.ads-com.fr/' },
    { label: 'supinfo.com', url: 'https://www.supinfo.com/' },
  ]
  : [
    { label: 'flux.audio', url: 'https://www.flux.audio/' },
    { label: 'Company deregistered in 2024' },
    { label: 'ads-com.fr', url: 'https://www.ads-com.fr/' },
    { label: 'supinfo.com', url: 'https://www.supinfo.com/' },
  ];

document.querySelectorAll('.timeline article').forEach((entry, index) => {
  const website = timelineWebsites[index];
  if (!website) return;
  const container = document.createElement('div');
  container.className = 'company-link';
  if (website.url) {
    const link = document.createElement('a');
    link.href = website.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = `${website.label} ↗`;
    container.append(link);
  } else {
    container.textContent = website.label;
  }
  entry.append(container);
});

const languageNavigation = [
  ['Français', 'index.html', 'fr'],
  ['English', 'en.html', 'en'],
  ['Română', 'ro.html', 'ro'],
  ['Polski', 'pl.html', 'pl'],
  ['Español', 'es.html', 'es'],
  ['Deutsch', 'de.html', 'de'],
];
document.querySelectorAll('.tools').forEach((navigation) => {
  navigation.querySelectorAll('a[lang]').forEach((link) => link.remove());
  const toggle = navigation.querySelector('[data-theme-toggle]');
  const picker = document.createElement('select');
  picker.className = 'language-picker';
  picker.setAttribute('aria-label', 'Choisir la langue');
  languageNavigation.forEach(([label, href, language]) => {
    const option = new Option(label, href, false, language === document.documentElement.lang);
    option.lang = language;
    picker.add(option);
  });
  picker.addEventListener('change', () => window.location.assign(picker.value));
  navigation.insertBefore(picker, toggle);
});

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const artwork = document.querySelector('.art');
  artwork?.addEventListener('pointermove', (event) => {
    const bounds = artwork.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    artwork.style.setProperty('--tilt-x', `${-y * 8}deg`);
    artwork.style.setProperty('--tilt-y', `${x * 10}deg`);
  });
  artwork?.addEventListener('pointerleave', () => {
    artwork.style.setProperty('--tilt-x', '0deg');
    artwork.style.setProperty('--tilt-y', '0deg');
  });

  const tokens = artwork ? [...artwork.querySelectorAll('.tech-token')] : [];
  if (artwork && tokens.length > 1) {
    const isFrench = document.documentElement.lang === 'fr';
    const tokenLabels = isFrench
      ? ['Cygne · inspiration Sylius™', 'Symfony', 'PHP', 'FLUX::']
      : ['Swan · Sylius™-inspired', 'Symfony', 'PHP', 'FLUX::'];
    artwork.removeAttribute('aria-hidden');
    artwork.setAttribute('role', 'group');
    artwork.setAttribute('aria-label', isFrench ? 'Technologies et environnements associés' : 'Associated technologies and environments');
    artwork.querySelector('.credit-card')?.setAttribute('aria-hidden', 'true');
    tokens.forEach((token, index) => {
      token.setAttribute('role', 'img');
      token.setAttribute('aria-label', tokenLabels[index]);
      token.setAttribute('title', tokenLabels[index]);
      token.dataset.label = tokenLabels[index];
    });

    const initialPositions = [
      [0.66, 0.08, 22, 18],
      [0.58, 0.52, -20, 21],
      [0.15, 0.67, 24, -19],
      [0.76, 0.72, -23, -17],
    ];
    let particles = [];
    let lastFrame = performance.now();

    const resetParticles = () => {
      const bounds = artwork.getBoundingClientRect();
      particles = tokens.map((element, index) => {
        const [x, y, vx, vy] = initialPositions[index];
        return {
          element,
          width: element.offsetWidth,
          height: element.offsetHeight,
          x: x * Math.max(0, bounds.width - element.offsetWidth),
          y: y * Math.max(0, bounds.height - element.offsetHeight),
          vx,
          vy,
        };
      });
    };

    const render = () => particles.forEach((particle) => {
      particle.element.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0)`;
    });

    const animateTokens = (time) => {
      const elapsed = Math.min((time - lastFrame) / 1000, 0.05);
      lastFrame = time;
      const bounds = artwork.getBoundingClientRect();

      particles.forEach((particle) => {
        particle.x += particle.vx * elapsed;
        particle.y += particle.vy * elapsed;
        if (particle.x <= 0 || particle.x >= bounds.width - particle.width) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(particle.x, bounds.width - particle.width));
        }
        if (particle.y <= 0 || particle.y >= bounds.height - particle.height) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(particle.y, bounds.height - particle.height));
        }
      });

      for (let first = 0; first < particles.length; first += 1) {
        for (let second = first + 1; second < particles.length; second += 1) {
          const a = particles[first];
          const b = particles[second];
          const ax = a.x + a.width / 2;
          const ay = a.y + a.height / 2;
          const bx = b.x + b.width / 2;
          const by = b.y + b.height / 2;
          const dx = bx - ax;
          const dy = by - ay;
          const distance = Math.hypot(dx, dy) || 1;
          const minimumDistance = (Math.min(a.width, a.height) + Math.min(b.width, b.height)) / 2;

          if (distance < minimumDistance) {
            const nx = dx / distance;
            const ny = dy / distance;
            const relativeVelocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (relativeVelocity < 0) {
              a.vx += relativeVelocity * nx;
              a.vy += relativeVelocity * ny;
              b.vx -= relativeVelocity * nx;
              b.vy -= relativeVelocity * ny;
            }
            const overlap = (minimumDistance - distance) / 2;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
          }
        }
      }

      render();
      requestAnimationFrame(animateTokens);
    };

    artwork.classList.add('is-collision-simulation');
    resetParticles();
    render();
    window.addEventListener('resize', resetParticles);
    requestAnimationFrame(animateTokens);
  }
}
