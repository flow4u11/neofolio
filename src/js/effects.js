
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
const initScrollAnimations = () => {
    if (typeof ScrollTrigger === 'undefined') return;

    // 1. STANDARD ANIMATIONS (Hero, About, Works)
    // Use "once: true" to prevent bugs and disappearing content

    // 1.1 Text Splitter
    document.querySelectorAll('.scroll-float-text').forEach(el => {
        if (el.hasAttribute('data-anim-init')) return;
        el.setAttribute('data-anim-init', 'true');

        const text = el.textContent.trim();
        if (!text) return;

        el.textContent = '';
        const chars = text.split('').map(char => {
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.textContent = char === ' ' ? '\u00A0' : char;
            el.appendChild(span);
            return span;
        });

        // Simple Reveal (Replayable & Robust)
        // Set initial state via GSAP set to avoid "from" logic issues during refresh
        gsap.set(chars, { opacity: 0, y: 30 });

        gsap.to(chars, {
            scrollTrigger: {
                trigger: el,
                start: 'top 95%',
                end: 'bottom top',
                toggleActions: "play none play reverse" // Enter:Play, Leave:None, EnterBack:Play, LeaveBack:Reverse
            },
            opacity: 1,
            y: 0,
            duration: 1.0,
            stagger: 0.02,
            ease: 'power2.out',
            overwrite: 'auto'
        });
    });

    // 1.2 Generic Float
    document.querySelectorAll('.scroll-float, .scroll-text').forEach(el => {
        if (el.hasAttribute('data-anim-init')) return;
        el.setAttribute('data-anim-init', 'true');

        gsap.set(el, { autoAlpha: 0, y: 50 });

        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                end: 'bottom top',
                toggleActions: "play none play reverse"
            },
            autoAlpha: 1,
            y: 0,
            duration: 1.0,
            ease: 'power2.out',
            overwrite: 'auto'
        });
    });

    // 1.3 ABOUT SECTION (Bento Grid Stagger)
    const aboutCards = gsap.utils.toArray('#about .grid > div');
    if (aboutCards.length > 0) {
        // Initial state
        gsap.set(aboutCards, { autoAlpha: 0, y: 50 });

        // Use batch to handle group entering
        ScrollTrigger.batch(aboutCards, {
            start: "top 85%",
            onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.0, stagger: 0.1, ease: "power2.out", overwrite: true }),
            onLeaveBack: batch => gsap.to(batch, { autoAlpha: 0, y: 50, duration: 0.8, stagger: 0.05, ease: "power2.in", overwrite: true }),
            // Ensure state persists correctly
            onEnterBack: batch => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.0, stagger: 0.1, ease: "power2.out", overwrite: true })
        });
    }

    // 1.4 WORKS SECTION (Project Cards Stagger)
    const workItems = gsap.utils.toArray('#works .group');
    if (workItems.length > 0) {
        gsap.set(workItems, { autoAlpha: 0, y: 60 });

        ScrollTrigger.batch(workItems, {
            start: "top 80%",
            onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.0, stagger: 0.15, ease: "power2.out", overwrite: true }),
            onLeaveBack: batch => gsap.to(batch, { autoAlpha: 0, y: 60, duration: 0.8, stagger: 0.1, ease: "power2.in", overwrite: true }),
            onEnterBack: batch => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.0, stagger: 0.15, ease: "power2.out", overwrite: true })
        });
    }

    // Force refresh after short delay to catch any layout shifts
    setTimeout(() => ScrollTrigger.refresh(), 500);

    // 2. CONTACT SECTION STACKING
    // We pin the Contact section so the Footer/ThankYou section slides over it.
    const contact = document.querySelector('#contact') || document.querySelector('#section-contact');

    if (contact) {
        ScrollTrigger.create({
            trigger: contact,
            start: "top top",
            pin: true,
            pinSpacing: false, // Allows the next element (Credits) to slide UP over it without pushing it down
            end: "bottom top", // Pin for the duration of its height (effectively until next one covers it)
            anticipatePin: 1,
            id: 'contact-stack'
        });
    }

    ScrollTrigger.refresh();
};

document.addEventListener('DOMContentLoaded', initScrollAnimations);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initScrollAnimations();
}

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

// --- SCROLL-DRIVEN SHAPE SPIN ---
const initShapeSpin = () => {
    const shapes = document.querySelectorAll('.neo-shape');
    const shapeTweens = [];

    // 1. Convert CSS Animations to GSAP
    shapes.forEach(shape => {
        // Read class for speed/direction
        let duration = 20;
        let direction = 1;

        if (shape.classList.contains('spin-fast')) duration = 6;
        if (shape.classList.contains('spin-medium')) duration = 12;
        if (shape.classList.contains('spin-slow')) duration = 20;

        if (shape.classList.contains('spin-rev-fast')) { duration = 8; direction = -1; }
        if (shape.classList.contains('spin-rev-medium')) { duration = 15; direction = -1; }
        if (shape.classList.contains('spin-rev-slow')) { duration = 25; direction = -1; }

        // STOP CSS Animation
        shape.style.animation = 'none';

        // Create GSAP Tween
        // We use a proxy object or just a standard infinite tween
        // We will modulate timeScale
        const tween = gsap.to(shape, {
            rotation: 360 * direction,
            duration: duration,
            repeat: -1,
            ease: "linear"
        });

        shapeTweens.push(tween);
    });

    // 2. React to Scroll Velocity
    let currentScale = 1;
    let targetScale = 1;

    // Use a lightweight ScrollTrigger to monitor velocity
    ScrollTrigger.create({
        onUpdate: (self) => {
            const v = Math.abs(self.getVelocity());
            // Map velocity (0 - 4000+) to a multiplier (1 - 10)
            // Example: at 2000px/s, we want ~5x speed
            targetScale = 1 + (v / 300);
        }
    });

    // 3. Smoothly Decay scale back to 1
    gsap.ticker.add(() => {
        // Lerp towards target (smooth acceleration & deceleration)
        // If user stops scrolling, getVelocity beocmes 0, targetScale becomes 1.
        // We lerp currentScale down to 1 slowly.

        // Adjust lerp factor (0.1 = responsive, 0.05 = heavy inertia)
        const lerpFactor = 0.05;

        currentScale += (targetScale - currentScale) * lerpFactor;

        // Optimization: clamp near 1 to avoid infinite micro-calculations
        if (Math.abs(currentScale - 1) < 0.01) currentScale = 1;

        // Apply to all tweens
        shapeTweens.forEach(t => t.timeScale(currentScale));

        // Reset target scale frame-by-frame if scroll stops? 
        // No, ScrollTrigger update only fires on scroll. 
        // We need to continuously decay targetScale if not scrolling?
        // Actually, getVelocity() relies on scroll events. If scroll stops, onUpdate doesn't fire?
        // Wait, ScrollTrigger SHOULD update. But if it doesn't, targetScale sticks at high value.
        // Correct approach: We use the `scroll` listener or verify velocity in ticker?
        // GSAP ScrollTrigger tracks velocity internally.

        // Hack: Decay targetScale manually? 
        // If we don't get an update, we assume velocity is dropping?
        // Let's rely on GSAP's velocity dumping.
        // Actually, a safer way is to let the targetScale decay on its own if not refreshed.
        targetScale += (1 - targetScale) * 0.1;
    });
};

document.addEventListener('DOMContentLoaded', initShapeSpin);
// Fallback if DOMContentLoaded already fired (e.g. injected script)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initShapeSpin();
}
