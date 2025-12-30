
// --- PROJECT MODAL LOGIC ---
const projectData = {
    1: {
        title: "Website Redesign",
        category: "UI/UX",
        year: "2024",
        images: [
            "https://placehold.co/1920x1080/111/FFF?text=UX+Research+&+Wireframes",
            "https://placehold.co/1920x1080/222/FFF?text=Design+System+%26+Typography",
            "https://placehold.co/1920x1080/000/FFF?text=Final+Mockups"
        ]
    },
    2: {
        title: "Mobile App",
        category: "PROTOTYPE",
        year: "2024",
        images: [
            "https://placehold.co/1080x1920/111/FFF?text=Login+Flow",
            "https://placehold.co/1080x1920/222/FFF?text=Dashboard+View",
            "https://placehold.co/1080x1920/333/FFF?text=Interactive+Elements"
        ]
    },
    3: {
        title: "GAMING MONTAGE",
        category: "VIDEO EDITING",
        year: "2024-2025",
        media: [
            { type: 'youtube', src: 'https://www.youtube.com/watch?v=XlTbpsSaBZw', caption: 'Ocean Eyes' },
            { type: 'youtube', src: 'https://www.youtube.com/watch?v=dMK628nOoWg', caption: 'Good for u' }
        ]
    }
};

window.openProjectModal = (id) => {
    const modal = document.getElementById('project-modal');
    const data = projectData[id];
    if (!data) return;

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-category').textContent = data.category;
    document.getElementById('modal-year').textContent = data.year;

    const gallery = document.getElementById('modal-gallery');
    gallery.innerHTML = '';

    const items = data.media || data.images;

    // Intersection Observer for Auto-Pause (Videos only)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                const video = entry.target;
                if (video.tagName === 'VIDEO' && !video.paused) video.pause();
                // Note: We can't auto-pause YouTube iframes easily without the API, 
                // but standard iframes stop playing when removed from DOM.
            }
        });
    }, { threshold: 0.5 });

    items.forEach(item => {
        const imgContainer = document.createElement('div');
        // Changed to flex-col for title support
        imgContainer.className = 'w-full h-full p-4 md:p-12 flex-shrink-0 snap-center flex flex-col items-center justify-center select-none gap-4';

        if (typeof item === 'string') {
            // Standard Image
            const img = document.createElement('img');
            img.src = item;
            img.className = 'max-w-full max-h-full object-contain border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] bg-white pointer-events-none';
            imgContainer.appendChild(img);
        } else if (item.type === 'youtube') {
            // Caption
            if (item.caption) {
                const title = document.createElement('h3');
                title.className = "text-xl md:text-2xl font-black text-black bg-white px-4 py-1 border-2 border-black shadow-[4px_4px_0px_0px_#000]";
                title.textContent = item.caption;
                imgContainer.appendChild(title);
            }

            // Extract Video ID
            let videoId = '';
            const url = item.src;
            if (url.includes('v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1];
            }

            // YouTube Iframe
            // Using youtube-nocookie for privacy and standard embed
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
            iframe.title = "YouTube video player";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowFullscreen = true;
            iframe.className = 'w-full max-w-4xl aspect-video border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] bg-black';

            imgContainer.appendChild(iframe);

        } else if (item.type === 'video') {
            // Caption
            if (item.caption) {
                const title = document.createElement('h3');
                title.className = "text-xl md:text-2xl font-black text-black bg-white px-4 py-1 border-2 border-black shadow-[4px_4px_0px_0px_#000]";
                title.textContent = item.caption;
                imgContainer.appendChild(title);
            }

            // Video Element
            const video = document.createElement('video');
            video.src = item.src;
            video.controls = true;
            // Removed max-h-full to allow space for title and slider
            video.className = 'max-w-full max-h-[60%] object-contain border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] bg-black';

            video.onmousedown = (e) => e.stopPropagation();
            observer.observe(video);
            imgContainer.appendChild(video);

            // Elastic Volume Slider (Custom Component)
            const slider = createElasticSlider(video);
            imgContainer.appendChild(slider);

            // --- MINIMAL UI LOGIC ---
            // --- MINIMAL UI LOGIC ---
            // When video plays, hide/shrink UI elements & Scale UP Video
            video.addEventListener('play', () => {
                if (video.closest('.snap-center').querySelector('h3')) {
                    gsap.to(video.closest('.snap-center').querySelector('h3'), { scale: 0.8, opacity: 0, y: -20, duration: 0.5 });
                }
                gsap.to(slider, { scale: 0.8, opacity: 0, y: 20, pointerEvents: 'none', duration: 0.5 });
                gsap.to(video, { scale: 1.3, duration: 0.5, ease: "power2.out" });
            });

            // When video pauses, show UI & Scale DOWN Video
            video.addEventListener('pause', () => {
                if (video.closest('.snap-center').querySelector('h3')) {
                    gsap.to(video.closest('.snap-center').querySelector('h3'), { scale: 1, opacity: 1, y: 0, duration: 0.5 });
                }
                gsap.to(slider, { scale: 1, opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.5 });
                gsap.to(video, { scale: 1, duration: 0.5, ease: "power2.out" });
            });
        }

        gallery.appendChild(imgContainer);
    });

    modal.classList.remove('hidden');

    // Animation
    gsap.fromTo(modal.querySelector('.relative'),
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' }
    );

    document.body.style.overflow = 'hidden';

    // --- DRAG TO SCROLL LOGIC ---
    let isDown = false;
    let startX;
    let scrollLeft;

    gallery.addEventListener('mousedown', (e) => {
        isDown = true;
        gallery.classList.add('cursor-grabbing');
        gallery.classList.remove('cursor-grab');
        gallery.style.scrollBehavior = 'auto'; // Disable smooth snap during drag
        startX = e.pageX - gallery.offsetLeft;
        scrollLeft = gallery.scrollLeft;
    });

    gallery.addEventListener('mouseleave', () => {
        isDown = false;
        gallery.classList.remove('cursor-grabbing');
        gallery.style.scrollBehavior = 'smooth';
    });

    gallery.addEventListener('mouseup', () => {
        isDown = false;
        gallery.classList.remove('cursor-grabbing');
        gallery.style.scrollBehavior = 'smooth';
    });

    gallery.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - gallery.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        gallery.scrollLeft = scrollLeft - walk;
    });

    // --- WHEEL TO SCROLL LOGIC ---
    gallery.addEventListener('wheel', (evt) => {
        // Only hijack vertical scroll if it's dominant
        if (Math.abs(evt.deltaY) > Math.abs(evt.deltaX)) {
            evt.preventDefault();
            gallery.scrollLeft += evt.deltaY;
        }
    });

    // --- PAGINATION & PROGRESS LOGIC ---
    const updateProgress = () => {
        const scrollLeft = gallery.scrollLeft;
        const width = gallery.offsetWidth;

        // Calculate current index (0-based)
        const index = Math.round(scrollLeft / width);
        const items = data.media || data.images;
        const total = items.length;

        // Update Counter
        document.getElementById('modal-counter').textContent = `0${index + 1} / 0${total}`;

        // Update Progress Bar Width
        const progress = ((index + 1) / total) * 100;
        document.getElementById('modal-progress').style.width = `${progress}%`;

        // Update Arrows State
        const prevBtn = document.getElementById('modal-prev');
        const nextBtn = document.getElementById('modal-next');

        if (prevBtn && nextBtn) {
            prevBtn.disabled = index === 0;
            nextBtn.disabled = index === total - 1;
        }
    };

    // Listen to scroll
    gallery.addEventListener('scroll', updateProgress);

    // Initial call
    // Small timeout to allow layout to settle
    setTimeout(updateProgress, 10);
};

window.scrollModal = (direction) => {
    const gallery = document.getElementById('modal-gallery');
    const width = gallery.offsetWidth;
    gallery.scrollBy({
        left: direction * width,
        behavior: 'smooth'
    });
};

window.closeProjectModal = () => {
    const modal = document.getElementById('project-modal');

    // Stop all videos immediately
    const videos = modal.querySelectorAll('video');
    videos.forEach(v => v.pause());

    gsap.to(modal.querySelector('.relative'), {
        scale: 0.95,
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });
};

// --- ELASTIC SLIDER COMPONENT (Vanilla JS Port) ---
function createElasticSlider(video) {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center gap-2 w-64 mt-2 select-none touch-none transition-all duration-500'; // Removed bg/border for minimalism

    // Label
    const label = document.createElement('div');
    label.className = "text-xs font-mono font-bold uppercase tracking-widest mb-1 text-black/50"; // Minimal color
    label.textContent = "VOLUME";
    container.appendChild(label);

    const inputsWrapper = document.createElement('div');
    inputsWrapper.className = "flex w-full items-center justify-center gap-4 relative";

    // Icons
    const leftIcon = document.createElement('div');
    leftIcon.innerHTML = '-';
    leftIcon.className = "font-black text-2xl cursor-pointer hover:scale-125 transition-transform w-8 text-center text-black";

    const rightIcon = document.createElement('div');
    rightIcon.innerHTML = '+';
    rightIcon.className = "font-black text-2xl cursor-pointer hover:scale-125 transition-transform w-8 text-center text-black";

    // TrackWrapper
    const trackContainer = document.createElement('div');
    trackContainer.className = "relative flex-grow h-10 flex items-center cursor-grab active:cursor-grabbing";

    // Track (Background)
    const track = document.createElement('div');
    track.className = "relative w-full h-3 bg-gray-300 rounded-full overflow-hidden border border-black";

    // Fill
    const fill = document.createElement('div');
    fill.className = "absolute top-0 left-0 h-full bg-black w-1/2";

    track.appendChild(fill);
    trackContainer.appendChild(track);

    inputsWrapper.appendChild(leftIcon);
    inputsWrapper.appendChild(trackContainer);
    inputsWrapper.appendChild(rightIcon);
    container.appendChild(inputsWrapper);

    // Value Text
    const valueText = document.createElement('div');
    valueText.className = "text-xs font-mono font-bold text-gray-500 mt-1";
    valueText.textContent = "50%";
    container.appendChild(valueText);

    // --- LOGIC ---
    let isDragging = false;
    const MAX_OVERFLOW = 50;

    // init volume
    video.volume = 0.5;

    const updateVolume = (clientX) => {
        const rect = track.getBoundingClientRect();
        let rawPct = (clientX - rect.left) / rect.width;

        // Elastic Overflow Calculations
        let overflow = 0;
        let region = 'middle';

        if (rawPct < 0) {
            overflow = (rect.left - clientX); // Pixels dragged left past 0
            region = 'left';
            rawPct = 0;
        } else if (rawPct > 1) {
            overflow = (clientX - rect.right); // Pixels dragged right past 100
            region = 'right';
            rawPct = 1;
        }

        // Apply Volume
        video.volume = rawPct;
        fill.style.width = `${rawPct * 100}%`;
        valueText.textContent = `${Math.round(rawPct * 100)}%`;

        // Apply Elastic Visuals using GSAP (requires external GSAP, which is loaded)
        if (overflow > 0) {
            const dampened = Math.min(overflow, MAX_OVERFLOW); // Cap it

            // Stretch Track
            gsap.to(track, { scaleX: 1 + (dampened / rect.width), duration: 0.1 });

            // Move Icons
            if (region === 'left') {
                gsap.to(leftIcon, { x: -dampened, scale: 1.2, duration: 0.1 });
            } else {
                gsap.to(rightIcon, { x: dampened, scale: 1.2, duration: 0.1 });
            }
        } else {
            // Reset Elasticity
            gsap.to(track, { scaleX: 1, duration: 0.2 });
            gsap.to([leftIcon, rightIcon], { x: 0, scale: 1, duration: 0.2 });
        }
    };

    // Listeners
    trackContainer.addEventListener('pointerdown', (e) => {
        isDragging = true;
        trackContainer.setPointerCapture(e.pointerId);
        updateVolume(e.clientX);
        // Container Scale Effect
        gsap.to(container, { scale: 1.05, duration: 0.2 });
    });

    trackContainer.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        updateVolume(e.clientX);
    });

    trackContainer.addEventListener('pointerup', () => {
        isDragging = false;
        // Spring back
        gsap.to(container, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
        gsap.to(track, { scaleX: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        gsap.to([leftIcon, rightIcon], { x: 0, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    });

    // Icon Clicks - Stepped
    leftIcon.addEventListener('click', () => {
        video.volume = Math.max(0, video.volume - 0.1);
        fill.style.width = `${video.volume * 100}%`;
        valueText.textContent = `${Math.round(video.volume * 100)}%`;
        gsap.fromTo(leftIcon, { scale: 1.4 }, { scale: 1, duration: 0.3 });
    });

    rightIcon.addEventListener('click', () => {
        video.volume = Math.min(1, video.volume + 0.1);
        fill.style.width = `${video.volume * 100}%`;
        valueText.textContent = `${Math.round(video.volume * 100)}%`;
        gsap.fromTo(rightIcon, { scale: 1.4 }, { scale: 1, duration: 0.3 });
    });

    // Prevent modal close on drag or click inside slider
    container.onmousedown = (e) => e.stopPropagation();

    return container;
}
