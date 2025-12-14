// Snow Effect Animation
class Snowfall {
    constructor() {
        this.canvas = document.getElementById('snowCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.snowflakes = [];
        this.maxSnowflakes = 150;
        this.mouse = { x: null, y: null };

        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Create initial snowflakes
        for (let i = 0; i < this.maxSnowflakes; i++) {
            this.snowflakes.push(this.createSnowflake());
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createSnowflake() {
        const size = Math.random() * 4 + 1;
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height - this.canvas.height,
            radius: size,
            speed: size * 0.5 + 0.5,
            wind: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.6 + 0.4,
            swing: Math.random() * Math.PI * 2,
            swingSpeed: Math.random() * 0.02 + 0.01,
            swingRadius: Math.random() * 1.5 + 0.5
        };
    }

    setupEventListeners() {
        // Mouse movement affects snowflakes
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Form submission
        const form = document.getElementById('signupForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        }
    }

    handleFormSubmit(form) {
        const input = form.querySelector('input[type="email"]');
        const button = form.querySelector('button');

        // Simulate submission
        button.textContent = 'Sending...';
        button.disabled = true;

        setTimeout(() => {
            // Create success message
            let successMsg = document.querySelector('.success-message');
            if (!successMsg) {
                successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                successMsg.textContent = '🎉 Thanks! We\'ll notify you when we launch.';
                form.parentNode.appendChild(successMsg);
            }
            successMsg.style.display = 'block';

            // Reset form
            input.value = '';
            button.textContent = 'Notify Me';
            button.disabled = false;

            // Create celebration effect
            this.celebrationBurst();

            // Hide message after 5 seconds
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 5000);
        }, 1000);
    }

    celebrationBurst() {
        // Add extra snowflakes as celebration
        for (let i = 0; i < 50; i++) {
            const flake = this.createSnowflake();
            flake.x = this.canvas.width / 2 + (Math.random() - 0.5) * 200;
            flake.y = this.canvas.height / 2;
            flake.speed = Math.random() * 3 + 2;
            flake.wind = (Math.random() - 0.5) * 4;
            this.snowflakes.push(flake);
        }
    }

    updateSnowflakes() {
        this.snowflakes.forEach((flake, index) => {
            // Swing motion
            flake.swing += flake.swingSpeed;
            const swingOffset = Math.sin(flake.swing) * flake.swingRadius;

            // Mouse interaction
            let mouseForceX = 0;
            let mouseForceY = 0;

            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = flake.x - this.mouse.x;
                const dy = flake.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 100;

                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance;
                    mouseForceX = (dx / distance) * force * 2;
                    mouseForceY = (dy / distance) * force * 1;
                }
            }

            // Update position
            flake.x += flake.wind + swingOffset + mouseForceX;
            flake.y += flake.speed + mouseForceY;

            // Reset snowflake when it goes off screen
            if (flake.y > this.canvas.height + 10 ||
                flake.x > this.canvas.width + 50 ||
                flake.x < -50) {

                // Remove excess snowflakes
                if (this.snowflakes.length > this.maxSnowflakes) {
                    this.snowflakes.splice(index, 1);
                } else {
                    flake.x = Math.random() * this.canvas.width;
                    flake.y = -10;
                    flake.speed = flake.radius * 0.5 + 0.5;
                    flake.wind = Math.random() * 0.5 - 0.25;
                }
            }
        });
    }

    drawSnowflakes() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.snowflakes.forEach(flake => {
            this.ctx.beginPath();
            this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            this.ctx.fill();

            // Add subtle glow effect to larger snowflakes
            if (flake.radius > 2.5) {
                this.ctx.beginPath();
                this.ctx.arc(flake.x, flake.y, flake.radius * 2, 0, Math.PI * 2);
                const gradient = this.ctx.createRadialGradient(
                    flake.x, flake.y, 0,
                    flake.x, flake.y, flake.radius * 2
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${flake.opacity * 0.3})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }
        });
    }

    animate() {
        this.updateSnowflakes();
        this.drawSnowflakes();
        requestAnimationFrame(() => this.animate());
    }
}

// Additional interactive effects
class InteractiveEffects {
    constructor() {
        this.setupHoverEffects();
        this.setupParallax();
    }

    setupHoverEffects() {
        const features = document.querySelectorAll('.feature');

        features.forEach(feature => {
            feature.addEventListener('mouseenter', () => {
                feature.style.transform = 'translateY(-10px) scale(1.02)';
            });

            feature.addEventListener('mouseleave', () => {
                feature.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupParallax() {
        const content = document.querySelector('.content');

        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX - window.innerWidth / 2) / 50;
            const y = (e.clientY - window.innerHeight / 2) / 50;

            if (content) {
                content.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
    }
}

// Typing effect for tagline (optional enhancement)
class TypeWriter {
    constructor(element, text, speed = 50) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.index = 0;
    }

    type() {
        if (this.index < this.text.length) {
            this.element.textContent += this.text.charAt(this.index);
            this.index++;
            setTimeout(() => this.type(), this.speed);
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize snow effect
    new Snowfall();

    // Initialize interactive effects
    new InteractiveEffects();

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Add loading animation
    document.body.classList.add('loaded');
});

// Prevent flash of unstyled content
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});
