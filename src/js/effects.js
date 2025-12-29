
// --- TARGET CURSOR LOGIC (Vanilla Adaptation) ---
const initCursor = () => {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;
    if (isMobile) return;

    const cursor = document.getElementById('target-cursor');
    if (!cursor) return;

    const corners = cursor.querySelectorAll('.target-cursor-corner');
    const dot = cursor.querySelector('.cursor-dot');
    const spinDuration = 2;
    const parallaxOn = true;
    const hoverDuration = 0.2;

    // Hide Default Cursor
    document.body.style.cursor = 'none';

    // Initial Styles
    gsap.set(cursor, { x: window.innerWidth / 2, y: window.innerHeight / 2 });

    // Spin Animation
    let spinTl = gsap.timeline({ repeat: -1 })
        .to(cursor, { rotation: 360, duration: spinDuration, ease: 'none' });

    // Mouse Move
    window.addEventListener('mousemove', e => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: 'power3.out'
        });
    });

    // Interaction State
    let activeTarget = null;
    const activeStrength = { value: 0 };
    let targetCornerPositions = null;
    const borderWidth = 3;
    const cornerSize = 12;

    const tickerFn = () => {
        if (!activeTarget) return;

        const strength = activeStrength.value;
        if (strength === 0) return;

        // Recalculate rect on every frame to handle scrolling
        const rect = activeTarget.getBoundingClientRect();

        // Calculate Current Target Positions
        const currentTargetPos = [
            { x: rect.left - borderWidth, y: rect.top - borderWidth },
            { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
            { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
            { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
        ];

        const cursorX = gsap.getProperty(cursor, 'x');
        const cursorY = gsap.getProperty(cursor, 'y');

        corners.forEach((corner, i) => {
            const currentX = gsap.getProperty(corner, 'x');
            const currentY = gsap.getProperty(corner, 'y');

            // Relative target position (where the corner SHOULD be relative to cursor center)
            // Note: The cursor typically follows mouse, but for target tracking we want corners to snap to the target.
            // However, the corner's transform is relative to the cursor container which is moving.
            // Actually, the cursor container moves with mouse. The corners move inside it.
            // So corner position = Absolute Target Pos - Absolute Cursor Pos

            const targetX = currentTargetPos[i].x - cursorX;
            const targetY = currentTargetPos[i].y - cursorY;

            const finalX = currentX + (targetX - currentX) * strength;
            const finalY = currentY + (targetY - currentY) * strength;

            const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;

            gsap.to(corner, {
                x: finalX,
                y: finalY,
                duration: duration,
                ease: duration === 0 ? 'none' : 'power1.out',
                overwrite: 'auto'
            });
        });
    };

    // Hover Detection
    const targetSelector = 'a, button, .cursor-target, .neo-card:not(.no-cursor-track), .scroll-float:not(.no-cursor-track)';

    const enterHandler = (e) => {
        const target = e.target.closest(targetSelector);
        if (!target || activeTarget === target) return;

        activeTarget = target;

        // Stop spinning & reset
        spinTl.pause();
        gsap.to(cursor, { rotation: 0, duration: 0.2 });

        gsap.ticker.add(tickerFn);
        gsap.to(activeStrength, { value: 1, duration: hoverDuration, ease: 'power2.out' });

        target.addEventListener('mouseleave', leaveHandler, { once: true });
    };

    const leaveHandler = () => {
        gsap.ticker.remove(tickerFn);
        activeTarget = null;
        targetCornerPositions = null;
        gsap.to(activeStrength, { value: 0, duration: 0.1 });

        // Reset corners
        const positions = [
            { x: -18, y: -18 },
            { x: 6, y: -18 },
            { x: 6, y: 6 },
            { x: -18, y: 6 }
        ];

        corners.forEach((corner, i) => {
            gsap.to(corner, {
                x: positions[i].x,
                y: positions[i].y,
                duration: 0.3,
                ease: 'power3.out'
            });
        });

        // Resume Spin
        spinTl.restart();
    };

    window.addEventListener('mouseover', enterHandler);

    // Click Effects
    window.addEventListener('mousedown', () => {
        gsap.to(dot, { scale: 0.5, duration: 0.2 });
        gsap.to(cursor, { scale: 0.9, duration: 0.2 });
    });
    window.addEventListener('mouseup', () => {
        gsap.to(dot, { scale: 1, duration: 0.2 });
        gsap.to(cursor, { scale: 1, duration: 0.2 });
    });
};

initCursor();

// --- GLARE EFFECT LOGIC ---
function addGlareTo(el) {
    if (el.querySelector('.glare-overlay')) return;

    if (getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
    }

    if (!el.classList.contains('overflow-hidden')) {
        el.classList.add('overflow-hidden');
    }

    const overlay = document.createElement('div');
    overlay.className = 'glare-overlay';
    el.appendChild(overlay);
    return overlay;
}

const hoverElements = document.querySelectorAll('.glare-hover');
hoverElements.forEach(el => {
    addGlareTo(el);
    el.addEventListener('mouseenter', () => el.classList.add('glare-active'));
    el.addEventListener('mouseleave', () => el.classList.remove('glare-active'));
});

const autoElements = document.querySelectorAll('.glare-auto');
autoElements.forEach(el => {
    const overlay = addGlareTo(el);
    const transitionDuration = 650;
    const delay = 3000;
    function animate() {
        el.classList.add('glare-active');
        setTimeout(() => {
            el.classList.remove('glare-active');
            setTimeout(animate, delay);
        }, transitionDuration + 100);
    }
    setTimeout(animate, Math.random() * 1000 + 500);
});

// --- SCROLL FLOAT ANIMATION LOGIC (GSAP) ---
// 1. Text Splitter for Character Animation
document.querySelectorAll('.scroll-float-text').forEach(el => {
    const text = el.textContent.trim();
    el.textContent = '';
    const chars = text.split('').map(char => {
        const span = document.createElement('span');
        span.style.display = 'inline-block';
        span.textContent = char === ' ' ? '\u00A0' : char;
        el.appendChild(span);
        return span;
    });

    // Initial State
    gsap.set(chars, { opacity: 0, y: 50, scaleY: 1.5 });

    ScrollTrigger.create({
        trigger: el,
        start: 'top 95%',
        end: 'bottom top',
        onEnter: () => gsap.to(chars, {
            opacity: 1, y: 0, scaleY: 1, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.03, overwrite: 'auto'
        }),
        onLeave: () => gsap.to(chars, {
            opacity: 0, y: -50, scaleY: 1.5, duration: 0.6, ease: 'power2.in', stagger: 0.03, overwrite: 'auto'
        }),
        onEnterBack: () => gsap.to(chars, {
            opacity: 1, y: 0, scaleY: 1, duration: 0.6, ease: 'back.out(1.7)', stagger: -0.03, overwrite: 'auto'
        }),
        onLeaveBack: () => gsap.to(chars, {
            opacity: 0, y: 50, scaleY: 1.5, duration: 0.6, ease: 'power2.in', stagger: -0.03, overwrite: 'auto'
        })
    });
});

// 2. Block/Element Float
document.querySelectorAll('.scroll-float, .scroll-text').forEach(el => {
    // Initial State
    gsap.set(el, { opacity: 0, y: 50 });

    ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        end: 'bottom top',
        onEnter: () => gsap.to(el, {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto'
        }),
        onLeave: () => gsap.to(el, {
            opacity: 0, y: -50, duration: 0.6, ease: 'power2.in', overwrite: 'auto'
        }),
        onEnterBack: () => gsap.to(el, {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto'
        }),
        onLeaveBack: () => gsap.to(el, {
            opacity: 0, y: 50, duration: 0.6, ease: 'power2.in', overwrite: 'auto'
        })
    });
});

// --- IDLE ANIMATIONS (INIT) ---
const initIdleAnimations = () => {
    // 1. Idle Float (Smoother, Slower, Optimized)
    gsap.utils.toArray('.idle-float').forEach(el => {
        gsap.to(el, {
            y: -15, // Pixel value is often smoother than percentage for text
            duration: "random(3, 5)", // Slower for smoothness
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 2,
            force3D: true, // Force GPU
            rotation: 0.01 // Hack for smoother anti-aliasing
        });
    });

    // 2. Idle Pulse (Subtler to prevent jitter)
    gsap.utils.toArray('.idle-pulse').forEach(el => {
        gsap.to(el, {
            scale: 1.03, // Reduced from 1.05 to reduce pixel shimmering
            duration: "random(1.5, 2.5)", // Slower
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut", // Sine is smoother than power1 for breathing
            delay: Math.random() * 2,
            force3D: true,
            rotation: 0.01
        });
    });
};

initIdleAnimations();
