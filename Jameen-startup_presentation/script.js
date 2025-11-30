// --- Config ---
const CONFIG = {
    slideCount: 16,
    terrainSpeed: 0.002,
    gridColor: '#00ff9d'
};

// --- State ---
let state = {
    current: 1,
    isAnimating: false,
    theme: 'dark' // dark, light, honey
};

// --- DOM ---
const dom = {
    slides: document.querySelectorAll('.slide'),
    prev: document.getElementById('prev-btn'),
    next: document.getElementById('next-btn'),
    counter: document.getElementById('current'),
    progress: document.getElementById('progress'),
    canvas: document.getElementById('terrain-map'),
    themeBtn: document.getElementById('theme-btn')
};

// --- 3D Terrain Background (Canvas) ---
const ctx = dom.canvas.getContext('2d');
let width, height;
let points = [];

function initTerrain() {
    width = window.innerWidth;
    height = window.innerHeight;
    dom.canvas.width = width;
    dom.canvas.height = height;

    // Create grid points
    points = [];
    const gap = 40;
    for (let x = 0; x < width + gap; x += gap) {
        for (let y = 0; y < height + gap; y += gap) {
            points.push({
                x: x,
                y: y,
                originX: x,
                originY: y,
                noise: Math.random() * 20
            });
        }
    }
}

function animateTerrain() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = CONFIG.gridColor;

    // Update and draw points
    const time = Date.now() * CONFIG.terrainSpeed;

    points.forEach(p => {
        // Simple wave effect
        p.y = p.originY + Math.sin(p.originX * 0.01 + time) * 20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw connecting lines (simplified for performance)
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.1)';
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        // Connect to right neighbor
        // Note: This is a simplified grid drawing
        if (i + 1 < points.length && points[i + 1].x > p.x) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(points[i + 1].x, points[i + 1].y);
        }
    }
    ctx.stroke();

    requestAnimationFrame(animateTerrain);
}

// --- Navigation ---
function updateUI() {
    dom.counter.textContent = state.current.toString().padStart(2, '0');
    dom.progress.style.width = `${((state.current - 1) / (CONFIG.slideCount - 1)) * 100}%`;

    dom.slides.forEach(slide => {
        const idx = parseInt(slide.dataset.index);
        slide.classList.remove('active', 'prev');
        if (idx === state.current) slide.classList.add('active');
        else if (idx < state.current) slide.classList.add('prev');
    });
}

function next() {
    if (state.current < CONFIG.slideCount) {
        state.current++;
        updateUI();
    }
}

function prev() {
    if (state.current > 1) {
        state.current--;
        updateUI();
    }
}

// --- Events ---
dom.next.addEventListener('click', next);
dom.prev.addEventListener('click', prev);

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') next();
    if (e.key === 'ArrowLeft') prev();
});

window.addEventListener('resize', initTerrain);

// --- Tech Modal Logic ---
const modal = document.getElementById('tech-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalClose = document.getElementById('modal-close');
const hexItems = document.querySelectorAll('.hex-item');

hexItems.forEach(item => {
    item.addEventListener('click', () => {
        const title = item.dataset.title;
        const desc = item.dataset.desc;

        if (title && desc) {
            modalTitle.textContent = title;
            modalDesc.textContent = desc;
            modal.classList.add('active');
        }
    });
});

modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Close on outside click
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// --- Theme Management ---
const THEMES = {
    dark: { icon: '🌙', next: 'light' },
    light: { icon: '☀️', next: 'honey' },
    honey: { icon: '🍯', next: 'dark' }
};

function setTheme(themeName) {
    state.theme = themeName;
    document.body.setAttribute('data-theme', themeName === 'dark' ? '' : themeName);

    // Update button icon
    const themeIcon = dom.themeBtn.querySelector('.theme-icon');
    themeIcon.textContent = THEMES[themeName].icon;

    // Update canvas grid color based on theme
    if (themeName === 'light') {
        CONFIG.gridColor = '#00875a';
    } else if (themeName === 'honey') {
        CONFIG.gridColor = '#b8860b';
    } else {
        CONFIG.gridColor = '#00ff9d';
    }

    // Save to localStorage
    localStorage.setItem('jameen-theme', themeName);
}

function cycleTheme() {
    const nextTheme = THEMES[state.theme].next;
    setTheme(nextTheme);
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('jameen-theme') || 'dark';
    setTheme(savedTheme);
}

// Theme button event
dom.themeBtn.addEventListener('click', cycleTheme);

// --- Init ---
loadTheme();
initTerrain();
animateTerrain();
updateUI();
