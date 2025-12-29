
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.id = 'neo-grid';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '1'; // Below content but above background color
canvas.style.mixBlendMode = 'difference'; // Visible on both black and white
canvas.style.opacity = '0.1'; // Lower opacity to 10%

document.body.appendChild(canvas);

let width, height;
let crosses = [];
const spacing = 60; // Grid spacing

// Mouse State
const mouse = { x: -1000, y: -1000 };

class Cross {
    constructor(x, y) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.size = 4; // Slightly smaller for dots
        this.angle = 0;
    }

    update() {
        // Calculate distance to mouse
        const dx = mouse.x - this.baseX;
        const dy = mouse.y - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;

        if (distance < maxDist) {
            // Interaction: Scale based on proximity
            const percent = (maxDist - distance) / maxDist; // 0 to 1
            this.size = 4 + (percent * 6); // Scale up
        } else {
            // Return to base
            if (this.size > 4) this.size -= 0.5;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.baseX, this.baseY);
        // ctx.rotate(this.angle); // Dots don't need rotation

        ctx.fillStyle = '#FFFFFF'; // White dots
        ctx.beginPath();
        // Draw Dot
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}



const init = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    crosses = [];
    // Create Grid
    for (let y = 0; y < height + spacing; y += spacing) {
        for (let x = 0; x < width + spacing; x += spacing) {
            crosses.push(new Cross(x, y));
        }
    }
};

const animate = () => {
    ctx.clearRect(0, 0, width, height);

    crosses.forEach(cross => {
        cross.update();
        cross.draw();
    });

    requestAnimationFrame(animate);
};

// Event Listeners
window.addEventListener('resize', init);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Start
init();
animate();
