// --- LOADING SCREEN LOGIC ---
const loadingScreen = document.getElementById('loading-screen');
const loaderSvg = document.getElementById('loader-svg');
const loadingStatus = document.getElementById('loading-status');
const app = document.getElementById('app');

// Prevent scrolling during load
document.body.style.overflow = 'hidden';

// --- ANIMATION 1: Infinite Spin ---
let spinAnim = gsap.to(loaderSvg, {
    rotation: 360,
    duration: 3, // Slower spin for heavier shapes
    repeat: -1,
    ease: 'linear' // Linear spin for constant motion
});

// --- ANIMATION 2: Shape Cycling (Neo-Brutalist Glitch) ---
const shapes = [
    document.getElementById('shape-1'),
    document.getElementById('shape-2'),
    document.getElementById('shape-3'),
    document.getElementById('shape-4')
];
let currentShape = 0;

// Function to switch shapes
const cycleShapes = () => {
    // Hide current
    shapes[currentShape].style.display = 'none';
    // Stick to next
    currentShape = (currentShape + 1) % shapes.length;
    // Show next
    shapes[currentShape].style.display = 'block';
};

// Cycle every 250ms (frantic frame-by-frame feel)
let shapeInterval = setInterval(cycleShapes, 200);


// --- STATUS TEXT ---
const statuses = [
    "INITIALIZING SYSTEM...",
    "LOADING ASSETS...",
    "COMPILING SHADERS...",
    "BUILDING LAYOUT...",
    "READY_TO_LAUNCH"
];

let statusIndex = 0;
let statusInterval = setInterval(() => {
    statusIndex = (statusIndex + 1) % statuses.length;
    if (loadingStatus) loadingStatus.textContent = statuses[statusIndex];
}, 800);

// --- LOAD DETECTION ---
let imagesLoaded = false;

// Wait for full window load
window.addEventListener('load', () => {
    imagesLoaded = true;
});

// Check load loop
const checkLoad = setInterval(() => {
    if (imagesLoaded) {
        clearInterval(checkLoad);
        // Ensure "READY" shows briefly
        if (loadingStatus) loadingStatus.textContent = "SYSTEM_READY";
        setTimeout(finishLoading, 800);
    }
}, 500);

// --- FINISH SEQUENCE ---
function finishLoading() {
    clearInterval(statusInterval);
    clearInterval(shapeInterval);

    // Ensure last shape is visible for zoom
    shapes.forEach(s => s.style.display = 'none');
    shapes[0].style.display = 'block'; // Default to Star for exit

    const tl = gsap.timeline();

    // 1. Text fades out first
    tl.to('.absolute.bottom-8', {
        opacity: 0,
        duration: 0.3
    });

    // 2. SVG Zooms "IN" (Shrinks to nothing) - IMPLOSION
    tl.to(loaderSvg, {
        scale: 0,
        opacity: 0,
        rotation: 720, // Extra spin on exit
        duration: 0.8,
        ease: 'power4.inOut' // Sharp vacuum effect
    }, "<")
        // 3. Fade out the black screen
        .to(loadingScreen, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onStart: () => {
                // Kill infinite loops
                spinAnim.kill();

                // Reveal App immediately
                if (app) {
                    app.classList.remove('opacity-0');
                    app.style.opacity = '1';
                }
            },
            onComplete: () => {
                // Hard remove to prevent any blocking
                if (loadingScreen) loadingScreen.style.display = 'none';
                document.body.style.overflow = '';
                document.body.style.pointerEvents = 'auto';

                ScrollTrigger.refresh();
            }
        })
        // 4. HERO ANIMATIONS
        .addLabel("startHero", "-=0.5");

    // Select all hero elements we want to animate
    const heroElements = [
        '#hero h2',                    // Hi I'm Kim (inside the box)
        '#hero .transform.-rotate-2',  // The box itself
        '#hero h1:first-of-type',      // UI/UX
        '#hero .flex.items-center.gap-4', // AND divider
        '#hero h1:last-of-type',       // VIDEO EDITOR
        '#hero .relative.max-w-xl',    // Description Area
        '#hero .mt-8',                 // Hire Button Container
        '#hero a[href="#about"]'       // Scroll Indicator
    ];

    // Force reset their state first to ensure visibility logic works
    // We use a stagger fromTo for a unified "Context" feel
    tl.fromTo(heroElements,
        {
            y: 30,
            opacity: 0
        },
        {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            clearProps: 'all' // Clean up after animation so hover effects work perfectly
        },
        "startHero"
    );
}
