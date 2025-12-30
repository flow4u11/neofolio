
// --- HERO DESCRIPTION TOGGLE ---
window.toggleHeroDescription = (btn) => {
    const content = document.getElementById('hero-desc-content');
    // Check if currently expanded by checking max-height
    // We set inline style initially to 0px, so checking against '0px' works
    const isExpanded = content.style.maxHeight !== '0px';

    if (isExpanded) {
        // Collapse
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        content.style.paddingTop = '0';
        content.style.paddingBottom = '0';
        content.style.marginTop = '0';

        // Update Button
        const textSpan = btn.querySelector('span:last-child');
        const dotSpan = btn.querySelector('span:first-child');
        if (textSpan) textSpan.textContent = '+ EXPAND';
        if (dotSpan) {
            dotSpan.classList.remove('bg-red-500');
            dotSpan.classList.add('bg-green-500');
        }
    } else {
        // Expand
        // We use scrollHeight to animate to the exact height needed
        content.style.maxHeight = content.scrollHeight + 40 + 'px'; // +40 for buffer/padding
        content.style.opacity = '1';
        content.style.paddingTop = '1rem'; // pl-4 is padding-left, here we add vertical padding
        content.style.paddingBottom = '1rem';
        content.style.marginTop = '1.5rem'; // mt-6 equivalent

        // Update Button
        const textSpan = btn.querySelector('span:last-child');
        const dotSpan = btn.querySelector('span:first-child');
        if (textSpan) textSpan.textContent = '- COLLAPSE';
        if (dotSpan) {
            dotSpan.classList.remove('bg-green-500');
            dotSpan.classList.add('bg-red-500');
        }
    }
};

// --- CONTACT FORM TOGGLE ---
window.toggleContactForm = (show) => {
    const options = document.getElementById('contact-options');
    const form = document.getElementById('contact-form');
    const contactTitle = document.querySelector('#contact h2');
    const contactCard = document.querySelector('#contact .scroll-float');
    const contactSection = document.getElementById('contact');

    if (show) {
        // Hide options, show form
        options.classList.add('hidden');
        form.classList.remove('hidden');

        // Animate: Shrink title and center content
        if (typeof gsap !== 'undefined') {
            gsap.to(contactTitle, {
                scale: 0.5,
                opacity: 0.3,
                duration: 0.4,
                ease: 'power2.out'
            });

            // Add centered class to section
            contactSection.classList.add('justify-center');
            contactSection.classList.remove('justify-start');
        } else {
            // Fallback without GSAP
            contactTitle.style.transform = 'scale(0.5)';
            contactTitle.style.opacity = '0.3';
        }
    } else {
        // Hide form, show options
        form.classList.add('hidden');
        options.classList.remove('hidden');

        // Restore title
        if (typeof gsap !== 'undefined') {
            gsap.to(contactTitle, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out'
            });

            // Remove centered class
            contactSection.classList.remove('justify-center');
            contactSection.classList.add('justify-start');
        } else {
            contactTitle.style.transform = 'scale(1)';
            contactTitle.style.opacity = '1';
        }
    }
};

// --- TOAST LOGIC ---
let toastTimeout;
window.showToast = (title, message, isError = true) => {
    const toast = document.getElementById('neo-toast');
    const titleEl = toast.querySelector('h4');
    const msgEl = toast.querySelector('p');
    const iconEl = toast.querySelector('.text-red-500');

    // Update Content
    titleEl.textContent = title;
    msgEl.textContent = message;

    // Update Style based on type
    if (isError) {
        iconEl.textContent = '!';
        iconEl.className = 'text-red-500 font-bold text-2xl leading-none';
        titleEl.classList.add('text-red-500');
        titleEl.classList.remove('text-green-500');
    } else {
        iconEl.textContent = '✓';
        iconEl.className = 'text-green-500 font-bold text-2xl leading-none';
        titleEl.classList.add('text-green-500');
        titleEl.classList.remove('text-red-500');
    }

    // Show
    toast.classList.remove('translate-x-[200%]');

    // Auto Hide
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(window.hideToast, 3000);
};

window.hideToast = () => {
    const toast = document.getElementById('neo-toast');
    toast.classList.add('translate-x-[200%]');
};

// --- MOCK FORM SUBMISSION ---
window.submitMessage = (form) => {
    // Custom Validation
    const name = form.querySelector('input[name="name"]');
    const email = form.querySelector('input[name="email"]');
    const message = form.querySelector('textarea[name="message"]');

    let isValid = true;

    // Reset borders
    [name, email, message].forEach(el => el.classList.remove('!border-red-500'));

    if (!name.value.trim()) {
        name.classList.add('!border-red-500');
        isValid = false;
    }
    if (!email.value.trim() || !email.value.includes('@')) {
        email.classList.add('!border-red-500');
        isValid = false;
    }
    if (!message.value.trim()) {
        message.classList.add('!border-red-500');
        isValid = false;
    }

    if (!isValid) {
        window.showToast('MISSING INFO', 'Please fill in all fields correctly.');
        return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    // 1. Sending State
    btn.textContent = "SENDING...";
    btn.disabled = true;

    // 2. Simulate Network Request
    setTimeout(() => {
        // Success State
        btn.textContent = "SENT!";
        btn.classList.add('bg-green-500', 'text-white', 'border-green-500');
        window.showToast('SUCCESS', 'Your message has been sent!', false);

        // Reset and Return
        setTimeout(() => {
            form.reset();
            // Clear red borders if any remaining
            [name, email, message].forEach(el => el.classList.remove('!border-red-500'));

            btn.textContent = originalText;
            btn.disabled = false;
            btn.classList.remove('bg-green-500', 'text-white', 'border-green-500');

            // Go back to options
            window.toggleContactForm(false);
        }, 1500);
    }, 1500);
};
