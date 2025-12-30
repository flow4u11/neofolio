
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

// --- NEO-BRUTALIST SCROLL ANIMATIONS (SMOOTH & REVERSIBLE) ---
let scrollAnimsInitialized = false;
const initScrollAnimations = () => {
    if (typeof ScrollTrigger === 'undefined') return;

    // Prevent duplicate initialization
    if (scrollAnimsInitialized) return;
    scrollAnimsInitialized = true;

    // ========================================
    // SHARED CONFIG: Smooth easing for all
    // ========================================
    const smoothEase = 'power2.inOut';
    const smoothDuration = 0.8;

    // ========================================
    // 1. SMOOTH TEXT REVEAL (Hero Headlines)
    // Characters cascade in smoothly with wave effect
    // ========================================
    document.querySelectorAll('.scroll-float-text').forEach(el => {
        if (el.hasAttribute('data-anim-init')) return;
        el.setAttribute('data-anim-init', 'true');

        const text = el.textContent.trim();
        if (!text) return;

        el.textContent = '';
        el.style.overflow = 'visible';

        const chars = text.split('').map((char, i) => {
            const span = document.createElement('span');
            span.className = 'neo-char';
            span.style.cssText = `
                display: inline-block;
                transform-origin: center center;
                will-change: transform, opacity;
            `;
            span.textContent = char === ' ' ? '\u00A0' : char;
            el.appendChild(span);
            return span;
        });

        // Initial state: below with slight blur
        gsap.set(chars, {
            opacity: 0,
            y: 40,
            rotationX: -45,
            scale: 0.9
        });

        // Instant reveal on enter - reversible on scroll up
        gsap.to(chars, {
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play reverse play reverse',
            },
            opacity: 1,
            y: 0,
            rotationX: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.02,
            ease: 'power2.out'
        });
    });

    // ========================================
    // 2. SMOOTH FLOAT-IN (Generic Elements)
    // Elements glide in from below with parallax feel
    // ========================================
    document.querySelectorAll('.scroll-float:not(.no-stamp)').forEach(el => {
        if (el.hasAttribute('data-anim-init')) return;
        el.setAttribute('data-anim-init', 'true');

        // Consistent smooth entry from below
        gsap.set(el, {
            autoAlpha: 0,
            y: 40,
            scale: 0.98,
            transformOrigin: 'center center'
        });

        // Instant animation on enter
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 92%',
                toggleActions: 'play reverse play reverse',
            },
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out'
        });
    });

    // ========================================
    // 3. ALTERNATING SLIDE (Bento Grid Cards)
    // Cards slide in from alternating sides smoothly
    // ========================================
    const aboutCards = gsap.utils.toArray('#about .grid > div');
    if (aboutCards.length > 0) {
        aboutCards.forEach((card, i) => {
            // Alternating directions: odd from left, even from right
            const fromLeft = i % 2 === 0;
            const offsetX = fromLeft ? -50 : 50;

            gsap.set(card, {
                autoAlpha: 0,
                x: offsetX,
                y: 20,
                rotation: fromLeft ? -2 : 2,
                scale: 0.98
            });

            // Instant animation with slight stagger delay
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 95%',
                    toggleActions: 'play reverse play reverse',
                },
                autoAlpha: 1,
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                duration: 0.5,
                delay: i * 0.05,
                ease: 'power2.out'
            });
        });
    }

    // ========================================
    // 4. SMOOTH RISE (Works/Showcase Cards)
    // Project cards rise up with slight depth effect
    // ========================================
    const workItems = gsap.utils.toArray('#works .group');
    if (workItems.length > 0) {
        workItems.forEach((item, i) => {
            gsap.set(item, {
                autoAlpha: 0,
                y: 50,
                scale: 0.95
            });

            // Instant animation on enter
            gsap.to(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 95%',
                    toggleActions: 'play reverse play reverse',
                },
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay: i * 0.08,
                ease: 'power2.out'
            });
        });
    }

    // ========================================
    // 5. MARQUEE EXPAND (About Marquee)
    // The marquee expands from center smoothly
    // ========================================
    const marquee = document.querySelector('#about .animate-marquee')?.closest('.scroll-float');
    if (marquee && !marquee.hasAttribute('data-marquee-anim')) {
        marquee.setAttribute('data-marquee-anim', 'true');

        gsap.set(marquee, {
            autoAlpha: 0,
            scaleX: 0.5,
            transformOrigin: 'center center'
        });

        gsap.to(marquee, {
            scrollTrigger: {
                trigger: marquee,
                start: 'top 95%',
                toggleActions: 'play reverse play reverse',
            },
            autoAlpha: 1,
            scaleX: 1,
            duration: 0.6,
            ease: 'power2.out'
        });
    }

    // ========================================
    // 6. CONTACT SECTION STACKING (Stack Scroll)
    // Pin effect with content moving up as Credits slides over
    // ========================================
    const contact = document.querySelector('#contact') || document.querySelector('#section-contact');

    if (contact) {
        const contactContent = contact.querySelector('.scroll-float');
        const contactTitle = contact.querySelector('h2');

        // Pin the contact section
        ScrollTrigger.create({
            trigger: contact,
            start: "top top",
            pin: true,
            pinSpacing: false,
            end: "bottom top",
            anticipatePin: 1,
            id: 'contact-stack',
            onUpdate: (self) => {
                // Move content up as user scrolls to credits
                const progress = self.progress;
                if (contactContent) {
                    gsap.set(contactContent, {
                        y: -progress * 150, // Move up by 150px as scroll progresses
                        opacity: 1 - (progress * 0.5) // Fade slightly
                    });
                }
                if (contactTitle) {
                    gsap.set(contactTitle, {
                        y: -progress * 100, // Title moves up faster
                        scale: 1 - (progress * 0.2), // Shrink slightly
                        opacity: 1 - (progress * 0.6)
                    });
                }
            },
            onLeaveBack: () => {
                // Reset when scrolling back up
                if (contactContent) {
                    gsap.to(contactContent, { y: 0, opacity: 1, duration: 0.3 });
                }
                if (contactTitle) {
                    gsap.to(contactTitle, { y: 0, scale: 1, opacity: 1, duration: 0.3 });
                }
            }
        });
    }

    // ========================================
    // 7. CREDITS SECTION REVEAL (Smooth)
    // Grand reveal with smooth scale + fade
    // ========================================
    const credits = document.querySelector('#credits');
    if (credits) {
        const creditsCards = credits.querySelectorAll('.neo-card');
        const creditsTitle = credits.querySelector('h2');

        // Title animation: Instant scale down
        if (creditsTitle) {
            gsap.set(creditsTitle, {
                autoAlpha: 0,
                scale: 1.3,
                y: 30
            });

            gsap.to(creditsTitle, {
                scrollTrigger: {
                    trigger: credits,
                    start: 'top 90%',
                    toggleActions: 'play reverse play reverse',
                },
                autoAlpha: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out'
            });
        }

        // Cards: Instant slide in from sides
        if (creditsCards.length > 0) {
            creditsCards.forEach((card, i) => {
                const fromLeft = i % 2 === 0;

                gsap.set(card, {
                    autoAlpha: 0,
                    x: fromLeft ? -40 : 40,
                    y: 20,
                    rotation: fromLeft ? -3 : 3,
                    scale: 0.95
                });

                gsap.to(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 95%',
                        toggleActions: 'play reverse play reverse',
                    },
                    autoAlpha: 1,
                    x: 0,
                    y: 0,
                    rotation: 0,
                    scale: 1,
                    duration: 0.5,
                    delay: i * 0.1,
                    ease: 'power2.out'
                });
            });
        }
    }

    // ========================================
    // 8. SIDE NAV INDICATOR (Auto-highlight)
    // ========================================
    const sideLinks = document.querySelectorAll('.side-link');
    const sections = ['hero', 'about', 'works', 'contact', 'credits'];

    sections.forEach((id, i) => {
        const section = document.getElementById(id);
        if (!section || !sideLinks[i]) return;

        ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => {
                sideLinks.forEach(l => l.classList.remove('bg-white'));
                sideLinks[i]?.classList.add('bg-white');
            },
            onEnterBack: () => {
                sideLinks.forEach(l => l.classList.remove('bg-white'));
                sideLinks[i]?.classList.add('bg-white');
            }
        });
    });

    // Force refresh after layout settles
    requestAnimationFrame(() => {
        ScrollTrigger.refresh();
    });
};

// Single initialization point to prevent duplicates
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations, { once: true });
} else {
    initScrollAnimations();
}

// --- IDLE ANIMATIONS (INIT) ---
let idleAnimsInitialized = false;
const initIdleAnimations = () => {
    if (idleAnimsInitialized) return;
    idleAnimsInitialized = true;

    // 1. Idle Float (Smoother, Slower, Optimized)
    gsap.utils.toArray('.idle-float').forEach(el => {
        if (el.hasAttribute('data-idle-init')) return;
        el.setAttribute('data-idle-init', 'true');

        gsap.to(el, {
            y: -12,
            duration: gsap.utils.random(3, 5),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: gsap.utils.random(0, 2),
            force3D: true
        });
    });

    // 2. Idle Pulse (Subtler to prevent jitter)
    gsap.utils.toArray('.idle-pulse').forEach(el => {
        if (el.hasAttribute('data-pulse-init')) return;
        el.setAttribute('data-pulse-init', 'true');

        gsap.to(el, {
            scale: 1.02,
            duration: gsap.utils.random(2, 3),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: gsap.utils.random(0, 2),
            force3D: true
        });
    });
};

initIdleAnimations();

// --- SCROLL-DRIVEN SHAPE SPIN ---
let shapeSpinInitialized = false;
const initShapeSpin = () => {
    if (shapeSpinInitialized) return;
    shapeSpinInitialized = true;

    const shapes = document.querySelectorAll('.neo-shape');
    if (shapes.length === 0) return;

    const shapeTweens = [];

    // 1. Convert CSS Animations to GSAP
    shapes.forEach(shape => {
        let duration = 20;
        let direction = 1;

        if (shape.classList.contains('spin-fast')) duration = 6;
        else if (shape.classList.contains('spin-medium')) duration = 12;
        else if (shape.classList.contains('spin-slow')) duration = 20;

        if (shape.classList.contains('spin-rev-fast')) { duration = 8; direction = -1; }
        else if (shape.classList.contains('spin-rev-medium')) { duration = 15; direction = -1; }
        else if (shape.classList.contains('spin-rev-slow')) { duration = 25; direction = -1; }

        // STOP CSS Animation
        shape.style.animation = 'none';

        const tween = gsap.to(shape, {
            rotation: 360 * direction,
            duration: duration,
            repeat: -1,
            ease: "linear"
        });

        shapeTweens.push(tween);
    });

    // 2. React to Scroll Velocity (optimized)
    let currentScale = 1;
    let targetScale = 1;
    let tickerActive = false;

    const tickerFn = () => {
        const lerpFactor = 0.08;
        currentScale += (targetScale - currentScale) * lerpFactor;

        // Stop ticker when stable
        if (Math.abs(currentScale - 1) < 0.005 && Math.abs(targetScale - 1) < 0.005) {
            currentScale = 1;
            shapeTweens.forEach(t => t.timeScale(1));
            gsap.ticker.remove(tickerFn);
            tickerActive = false;
            return;
        }

        shapeTweens.forEach(t => t.timeScale(currentScale));
        targetScale += (1 - targetScale) * 0.15;
    };

    ScrollTrigger.create({
        onUpdate: (self) => {
            const v = Math.abs(self.getVelocity());
            targetScale = 1 + Math.min(v / 400, 8); // Cap at 9x speed

            if (!tickerActive) {
                tickerActive = true;
                gsap.ticker.add(tickerFn);
            }
        }
    });
};

// Single initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShapeSpin, { once: true });
} else {
    initShapeSpin();
}
