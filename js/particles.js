/**
 * Binary Matrix Particles Background Effect
 * Renders slow-drifting, glowing binary digits (0 and 1) on an HTML5 canvas.
 */
class BinaryParticles {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.bind ? this.canvas : this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        this.initParticles();
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    initParticles() {
        const particleCount = Math.min(60, Math.floor((this.width * this.height) / 25000));
        this.particles = [];
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            val: Math.random() > 0.5 ? '1' : '0',
            fontSize: Math.floor(Math.random() * 8) + 9, // 9px to 17px
            speedY: Math.random() * 0.4 + 0.1, // Drifts down slowly
            speedX: (Math.random() - 0.5) * 0.1, // Drifts slightly left/right
            alpha: Math.random() * 0.4 + 0.05, // Subtle transparency
            maxAlpha: Math.random() * 0.5 + 0.15,
            blinkSpeed: Math.random() * 0.015 + 0.005
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Render and update particles
        this.particles.forEach(p => {
            // Blink alpha
            p.alpha += p.blinkSpeed;
            if (p.alpha > p.maxAlpha || p.alpha < 0.02) {
                p.blinkSpeed = -p.blinkSpeed;
            }
            // Bound safety
            p.alpha = Math.max(0.02, Math.min(p.alpha, p.maxAlpha));

            // Dynamically get current primary color RGB to support theme switching
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb') || '0, 245, 212';
            this.ctx.fillStyle = `rgba(${primaryColor.trim()}, ${p.alpha})`;
            this.ctx.font = `${p.fontSize}px 'IBM Plex Mono', monospace`;
            this.ctx.fillText(p.val, p.x, p.y);

            // Move
            p.y += p.speedY;
            p.x += p.speedX;

            // Recenter when drifting off screen
            if (p.y > this.height) {
                p.y = 0;
                p.x = Math.random() * this.width;
                p.val = Math.random() > 0.5 ? '1' : '0';
            }
            if (p.x < 0 || p.x > this.width) {
                p.speedX = -p.speedX;
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialise on load if element exists
document.addEventListener('DOMContentLoaded', () => {
    new BinaryParticles('particleCanvas');
});
