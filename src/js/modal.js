
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
        title: "Gaming Montage",
        category: "VIDEO",
        year: "2023",
        images: [
            "https://placehold.co/1920x1080/400/FFF?text=Editing+Timeline",
            "https://placehold.co/1920x1080/600/FFF?text=Color+Grading+Before/After",
            "https://placehold.co/1920x1080/800/FFF?text=VFX+Breakdown"
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

    data.images.forEach(imgSrc => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'w-full h-full p-4 md:p-12 flex-shrink-0 snap-center flex items-center justify-center select-none';

        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'max-w-full max-h-full object-contain border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] bg-white pointer-events-none';

        imgContainer.appendChild(img);
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
        const scrollWidth = gallery.scrollWidth;

        // Calculate current index (0-based)
        const index = Math.round(scrollLeft / width);
        const total = data.images.length;

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
    updateProgress();
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
