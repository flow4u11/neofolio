
// --- MOBILE MENU TOGGLE ---
window.toggleMobileMenu = () => {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('hamburger-btn');
    const spans = btn.querySelectorAll('span');

    // Toggle Menu Visibility
    menu.classList.toggle('translate-x-full');

    // Check if open (we just toggled, so check current state)
    // If it DOES NOT have translate-x-full, it is OPEN.
    const isOpen = !menu.classList.contains('translate-x-full');

    if (isOpen) {
        // Open State: Lock Scroll & Animate Icon
        document.body.style.overflow = 'hidden';

        // Transform to X
        spans[0].style.transform = 'translateY(9px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-9px) rotate(-45deg)';

    } else {
        // Closed State: Unlock Scroll & Reset Icon
        document.body.style.overflow = '';

        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
};

// --- THEME SWITCHER DROPDOWN LOGIC ---
window.toggleThemeDropdown = () => {
    const menu = document.getElementById('theme-dropdown-menu');
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
};

window.setTheme = (themeName) => {
    const defaultIcon = document.getElementById('theme-icon-default');
    const neoIcon = document.getElementById('theme-icon-neo');
    const themeText = document.getElementById('theme-text');
    const indicatorDefault = document.getElementById('indicator-default');
    const indicatorNeo = document.getElementById('indicator-neo');
    const dropdown = document.getElementById('theme-dropdown-menu');

    // Clear all theme classes first
    document.body.classList.remove('real-neo-theme');

    // Hide all icons first
    if (defaultIcon) defaultIcon.classList.add('hidden');
    if (neoIcon) neoIcon.classList.add('hidden');

    // Reset all indicators
    if (indicatorDefault) {
        indicatorDefault.classList.remove('bg-black');
        indicatorDefault.classList.add('bg-transparent');
    }
    if (indicatorNeo) {
        indicatorNeo.classList.remove('bg-black');
        indicatorNeo.classList.add('bg-transparent');
    }

    if (themeName === 'neo') {
        // Activate Neo
        document.body.classList.add('real-neo-theme');
        localStorage.setItem('theme', 'neo');

        // Update UI
        if (neoIcon) neoIcon.classList.remove('hidden');
        if (themeText) themeText.textContent = "REAL NEO";

        // Indicator
        if (indicatorNeo) {
            indicatorNeo.classList.remove('bg-transparent');
            indicatorNeo.classList.add('bg-black');
        }

    } else {
        // Activate Default (Monochrome)
        localStorage.setItem('theme', 'default');

        // Update UI
        if (defaultIcon) defaultIcon.classList.remove('hidden');
        if (themeText) themeText.textContent = "MONOCHROME";

        // Indicator
        if (indicatorDefault) {
            indicatorDefault.classList.remove('bg-transparent');
            indicatorDefault.classList.add('bg-black');
        }
    }

    // Close Dropdown
    if (dropdown) {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('flex');
    }
};

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    const dropdown = document.getElementById('theme-dropdown-menu');
    const btn = document.getElementById('theme-dropdown-btn');
    if (!dropdown.classList.contains('hidden') && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('flex');
    }
});

// --- SMOOTH SCROLLING FOR ANCHOR LINKS (GSAP) ---
// Global Event Delegation handles all current and future links
document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');

    if (anchor) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');

        // Handle "Top" links or empty hashes
        const targetElement = targetId === '#' ? document.body : document.querySelector(targetId);

        if (targetElement) {
            // Smooth scroll to target
            gsap.to(window, {
                duration: 1.0,
                scrollTo: {
                    y: targetElement,
                    autoKill: false
                },
                ease: "power2.inOut",
                onStart: () => {
                    // Force complete animations for elements in/before target section
                    if (typeof ScrollTrigger !== 'undefined') {
                        try {
                            const targetRect = targetElement.getBoundingClientRect();
                            const targetY = targetRect.top + window.scrollY;

                            ScrollTrigger.getAll().forEach(st => {
                                if (st.trigger) {
                                    const triggerRect = st.trigger.getBoundingClientRect();
                                    const triggerY = triggerRect.top + window.scrollY;

                                    // Complete animations for elements above or at target
                                    if (triggerY <= targetY + window.innerHeight) {
                                        if (st.animation) {
                                            st.animation.progress(1);
                                        }
                                    }
                                }
                            });
                        } catch (err) {
                            // Silently fail - scrolling still works
                            console.log('Animation skip failed, continuing scroll');
                        }
                    }
                },
                onComplete: () => {
                    // Refresh after scroll
                    if (typeof ScrollTrigger !== 'undefined') {
                        ScrollTrigger.refresh();
                    }
                }
            });
        }

        // Mobile Menu Logic: If inside mobile menu, close it
        if (anchor.closest('#mobile-menu')) {
            window.toggleMobileMenu();
        }
    }
});

// --- ACTIVE NAV LINK LOGIC (SCROLL SPY) ---
const initActiveNav = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sideLinks = document.querySelectorAll('.side-link'); // Select Side Dots
    const sections = document.querySelectorAll('section');

    // State to prevent interference during click-scroll
    let isManualScroll = false;
    let scrollTimeout;

    // TOP NAV CLASSES
    const activeClasses = ['border-black', 'bg-white', 'shadow-[4px_4px_0px_0px_#000]', 'scale-110'];
    const inactiveClasses = ['border-transparent'];

    // SIDE NAV CLASSES
    // Active: Tall Dash, Filled White
    const sideActiveClasses = ['h-12', 'bg-white'];
    // Inactive: Small Square, Filled Black (removed 'h-4' here because we remove classes, base class has w-4 h-4)
    // Actually, we remove 'h-4' when active, add it back when inactive

    const setTopActive = (link) => {
        navLinks.forEach(l => {
            l.classList.remove(...activeClasses);
            l.classList.add(...inactiveClasses);
        });
        if (link) {
            link.classList.remove(...inactiveClasses);
            link.classList.add(...activeClasses);
        }
    };

    const setSideActive = (id) => {
        sideLinks.forEach(l => {
            // Reset to default state (only height, not background - effects.js handles bg-white)
            l.classList.remove('h-12');
            l.classList.add('h-4');
        });

        if (id) {
            const activeSide = document.querySelector(`.side-link[href="#${id}"]`);
            if (activeSide) {
                // Apply Active Transform (only height)
                activeSide.classList.remove('h-4');
                activeSide.classList.add('h-12');
            }
        }
    };

    // 1. Click Handler (Immediate Feedback + Lock)
    // We attach this to both top nav and side links
    [...navLinks, ...sideLinks].forEach(link => {
        link.addEventListener('click', () => {
            isManualScroll = true;
            clearTimeout(scrollTimeout);

            // Extract ID
            const id = link.getAttribute('href').substring(1);
            const topLink = document.querySelector(`.nav-link[href="#${id}"]`);

            // Set Visuals immediately
            setTopActive(topLink);
            setSideActive(id);

            // Unlock after presumed scroll duration
            scrollTimeout = setTimeout(() => {
                isManualScroll = false;
            }, 1200); // slightly longer due to smoother scroll
        });
    });

    // 2. Scroll Handler (Robust Viewport Checking)
    window.addEventListener('scroll', () => {
        if (isManualScroll) return;

        let current = '';
        const viewportHeight = window.innerHeight;
        const centerPoint = viewportHeight / 2;

        // Iterate sections to find which one is "in focus"
        // We prioritizing section whose CENTER is closest to viewport CENTER
        // OR simply checking overlaps.

        // Strategy: Check if section covers the middle of the screen.
        // OR for stacking: The last one that covers the activation line wins.

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();

            // Allow a section to be active if it overlaps the middle band of the screen
            // Top of section is above the bottom-third
            // Bottom of section is below the top-third
            // This handles tall sections, pinned sections, and stacked sections better.

            // Specifically for Contact (Pinned): 
            // When Pinned, its rect stays in viewport. 
            // When Credits (Footer) comes up, it overlaps Contact. 
            // Credits is later in the loop (DOM order).
            // So if Credits covers the activation area, it will overwrite 'current'.

            const triggerLine = viewportHeight * 0.4; // Slightly above center

            if (rect.top <= triggerLine && rect.bottom >= triggerLine) {
                current = section.getAttribute('id');
            }
        });

        // Loop override: If we are at the very top, force Hero
        if (window.scrollY < 100) current = 'hero';

        // If we are at the very bottom, force Credits (or last section)
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            // Find last section ID
            if (sections.length > 0) current = sections[sections.length - 1].getAttribute('id');
        }

        // Apply active class if we found a section
        if (current) {
            const topLink = document.querySelector(`.nav-link[href="#${current}"]`);
            setTopActive(topLink); // Pass undefined if not found (e.g. credits), handles gracefully
            setSideActive(current);
        }
    });

    // Initial check
    setTimeout(() => window.dispatchEvent(new Event('scroll')), 100);
};

initActiveNav();

// --- DYNAMIC HEADER RESIZING ---
const initDynamicHeader = () => {
    const header = document.querySelector('header');
    let isHovered = false;

    // Scroll Listener
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50 && !isHovered) {
            header.classList.add('py-2');
            header.classList.remove('py-4');
        } else {
            header.classList.add('py-4');
            header.classList.remove('py-2');
        }
    });

    // Hover Listeners
    header.addEventListener('mouseenter', () => {
        isHovered = true;
        // Restore Size
        header.classList.add('py-4');
        header.classList.remove('py-2');
    });

    header.addEventListener('mouseleave', () => {
        isHovered = false;
        // Re-shrink if scrolled
        if (window.scrollY > 50) {
            header.classList.add('py-2');
            header.classList.remove('py-4');
        }
    });
};

initDynamicHeader();
