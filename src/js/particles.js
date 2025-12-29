import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';

export const initParticles = () => {
    const container = document.getElementById('global-particles');
    if (!container) return;

    // Clear existing
    container.innerHTML = '';

    const renderer = new Renderer({
        alpha: true,
        depth: false,
        dpr: Math.min(window.devicePixelRatio, 2)
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 35 });
    camera.position.set(0, 0, 10);

    // Particle Config
    const count = 400; // Increased count
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
        positions.set([
            (Math.random() * 2 - 1) * 1.5, // X
            (Math.random() * 2 - 1) * 1.0, // Y  
            0
        ], i * 3);
        randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    }

    const geometry = new Geometry(gl, {
        position: { size: 3, data: positions },
        random: { size: 4, data: randoms }
    });

    const vertex = `
        attribute vec3 position;
        attribute vec4 random;
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uScale;
        
        varying vec4 vRandom;
        
        void main() {
            vRandom = random;
            vec3 pos = position;
            
            // Gentle floating movement
            pos.y += sin(uTime * 0.5 + random.y * 6.28) * 0.05;
            pos.x += cos(uTime * 0.3 + random.x * 6.28) * 0.05;
            
            vec4 glPos = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
            gl_Position = glPos;
            
            // Size attenuation
            gl_PointSize = (4.0 * uScale + (random.x * 3.0)) * (10.0 / glPos.w);
        }
    `;

    const fragment = `
        precision highp float;
        uniform vec3 uColor;
        varying vec4 vRandom;
        
        void main() {
            vec2 uv = gl_PointCoord.xy;
            float dist = length(uv - 0.5);
            if(dist > 0.5) discard;
            
            // Soft circle with color
            float alpha = smoothstep(0.5, 0.0, dist) * 0.5;
            gl_FragColor = vec4(uColor, alpha);
        }
    `;

    const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: [1, 1, 1] }, // Default White
            uScale: { value: 1 }
        },
        transparent: true
    });

    const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    // Resize
    const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        // Adjust spread based on aspect ratio roughly
        program.uniforms.uScale.value = window.innerWidth < 768 ? 0.7 : 1.0;
    };
    window.addEventListener('resize', resize, false);
    resize();

    // Intersection Observer for Theme Swapping
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const theme = entry.target.dataset.theme;
                // If section is dark (black bg), particles should be white.
                // If section is light (white bg), particles should be black.
                if (theme === 'light') {
                    // Target: Black particles
                    // We can lerp this in update loop or set directly. Setting directly for simplicity first.
                    targetColor = [0, 0, 0];
                } else {
                    // Target: White particles
                    targetColor = [1, 1, 1];
                }
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% visible

    sections.forEach(s => observer.observe(s));

    // Animation Loop
    let currentColor = [1, 1, 1];
    let targetColor = [1, 1, 1];

    requestAnimationFrame(update);
    function update(t) {
        requestAnimationFrame(update);
        program.uniforms.uTime.value = t * 0.001;

        // Smooth Color Transition
        const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
        currentColor[0] = lerp(currentColor[0], targetColor[0], 0.05);
        currentColor[1] = lerp(currentColor[1], targetColor[1], 0.05);
        currentColor[2] = lerp(currentColor[2], targetColor[2], 0.05);
        program.uniforms.uColor.value = currentColor;

        renderer.render({ scene: mesh, camera });
    }
};
