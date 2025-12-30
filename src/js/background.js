
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.id = 'neo-grid';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '1';
canvas.style.mixBlendMode = 'difference';
canvas.style.opacity = '0.1';

document.body.appendChild(canvas);

let width, height;
let crosses = [];
const spacing = 60;

// Mouse State
const mouse = { x: -1000, y: -1000, active: false };
let animationId = null;
let lastMouseMove = 0;

class Cross {
    constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.size = 4;
        this.targetSize = 4;
    }

    update() {
        const dx = mouse.x - this.baseX;
        const dy = mouse.y - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;

        if (distance < maxDist && mouse.active) {
            const percent = (maxDist - distance) / maxDist;
            this.targetSize = 4 + (percent * 6);
        } else {
            this.targetSize = 4;
        }

        // Smooth lerp for size (smoother transitions)
        this.size += (this.targetSize - this.size) * 0.15;
    }

    draw() {
        ctx.save();
        ctx.translate(this.baseX, this.baseY);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const init = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    crosses = [];
    for (let y = 0; y < height + spacing; y += spacing) {
        for (let x = 0; x < width + spacing; x += spacing) {
            crosses.push(new Cross(x, y));
        }
    }

    // Initial draw
    drawFrame();
};

const drawFrame = () => {
    ctx.clearRect(0, 0, width, height);
    crosses.forEach(cross => {
        cross.update();
        cross.draw();
    });
};

const animate = () => {
    drawFrame();

    // Check if we should continue animating
    const now = Date.now();
    if (now - lastMouseMove > 500 && !mouse.active) {
        // Mouse hasn't moved in 500ms and all dots are static
        let allStable = true;
        for (const cross of crosses) {
            if (Math.abs(cross.size - cross.targetSize) > 0.1) {
                allStable = false;
                break;
            }
        }
        if (allStable) {
            animationId = null;
            return; // Stop animation loop
        }
    }

    animationId = requestAnimationFrame(animate);
};

const startAnimation = () => {
    if (animationId === null) {
        animationId = requestAnimationFrame(animate);
    }
};

// Event Listeners
window.addEventListener('resize', init);

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    lastMouseMove = Date.now();
    startAnimation();
});

window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
});

// Pause when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    } else {
        drawFrame(); // Redraw when visible again
    }
});

// Start
init();
