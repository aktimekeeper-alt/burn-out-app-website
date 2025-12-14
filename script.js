/**
 * BURNOUT - Winter Snow Effect
 * Performant snowfall with cursor collection and text accumulation
 */

(function() {
    'use strict';

    // Configuration - Dense snow like reference
    const CONFIG = {
        snowflakeCount: 250,
        minSize: 1,
        maxSize: 3,
        minDuration: 3,
        maxDuration: 10,
        minDelay: 0,
        maxDelay: 8,
        logoSnowMax: 10000
    };

    /**
     * Logo Snow Accumulation Effect - Snow particles on letter outlines
     * Uses canvas to detect actual letter shapes
     */
    class LogoSnowAccumulation {
        constructor() {
            this.logo = document.getElementById('mainLogo');
            this.letters = document.querySelectorAll('.letter');
            this.particles = [];
            this.maxParticles = CONFIG.logoSnowMax;
            this.outlinePoints = []; // Store all outline points

            if (!this.logo || !this.letters.length) return;
            this.init();
        }

        init() {
            // Create container for all snow particles on the logo-text span
            this.logoText = this.logo.querySelector('.logo-text');
            this.container = document.createElement('div');
            this.container.className = 'logo-snow-container';
            this.logoText.style.position = 'relative';
            this.logoText.appendChild(this.container);

            // Extract outline points from each letter
            this.extractOutlinePoints();

            // Start accumulating snow
            this.accumulateSnow();

            // Shake animation on hover (particles stay)
            this.letters.forEach(letter => {
                letter.addEventListener('mouseenter', () => {
                    letter.classList.add('shake');
                    setTimeout(() => letter.classList.remove('shake'), 300);
                });
            });

            // Re-extract on resize
            window.addEventListener('resize', () => {
                this.outlinePoints = [];
                this.extractOutlinePoints();
            });
        }

        extractOutlinePoints() {
            const containerRect = this.logoText.getBoundingClientRect();

            this.letters.forEach(letter => {
                const char = letter.textContent;
                const letterRect = letter.getBoundingClientRect();
                const relX = letterRect.left - containerRect.left;
                const relY = letterRect.top - containerRect.top;
                const width = letterRect.width;
                const height = letterRect.height;

                // Create canvas matching letter size
                const canvas = document.createElement('canvas');
                canvas.width = Math.ceil(width);
                canvas.height = Math.ceil(height);
                const ctx = canvas.getContext('2d');

                // Match font exactly
                const style = window.getComputedStyle(letter);
                const fontSize = parseFloat(style.fontSize);
                ctx.font = `700 ${fontSize}px Rajdhani, sans-serif`;
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'alphabetic';
                ctx.textAlign = 'left';

                // Draw at baseline position
                ctx.fillText(char, 0, fontSize * 0.85);

                // Get pixel data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Find edge pixels for outline effect
                for (let py = 0; py < canvas.height; py++) {
                    for (let px = 0; px < canvas.width; px++) {
                        const i = (py * canvas.width + px) * 4;
                        if (data[i + 3] > 100) {
                            const isEdge = this.isEdgePixel(data, px, py, canvas.width, canvas.height);
                            if (isEdge) {
                                this.outlinePoints.push({
                                    x: relX + px,
                                    y: relY + py,
                                    letter: letter
                                });
                            }
                        }
                    }
                }
            });
        }

        isEdgePixel(data, x, y, width, height, scale = 1) {
            const step = scale;
            const neighbors = [[-step, 0], [step, 0], [0, -step], [0, step]];
            for (const [dx, dy] of neighbors) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) return true;
                const ni = (ny * width + nx) * 4;
                if (data[ni + 3] < 100) return true;
            }
            return false;
        }

        accumulateSnow() {
            // Wait a bit for outline extraction, then add particles
            setTimeout(() => {
                // Add initial particles very rapidly to fill letters
                for (let i = 0; i < 7500; i++) {
                    setTimeout(() => this.addParticle(), i);
                }

                // Continue adding particles until full
                setInterval(() => this.addParticle(), 5);
            }, 50);
        }

        addParticle() {
            if (this.outlinePoints.length === 0) return;

            // Stop adding once we have enough particles (but don't remove old ones)
            if (this.particles.length >= this.maxParticles) return;

            // Pick a random outline point
            const point = this.outlinePoints[Math.floor(Math.random() * this.outlinePoints.length)];

            // Add slight randomness for natural look
            const x = point.x + (Math.random() - 0.5) * 3;
            const y = point.y + (Math.random() - 0.5) * 3;
            const size = 1.5 + Math.random() * 2;

            // Festive colors - mostly white with red and green twinkles
            const colorRoll = Math.random();
            let color = '#ffffff';
            let glow = '';
            if (colorRoll < 0.10) {
                color = '#ef4444'; // Red
                glow = 'box-shadow: 0 0 6px #ef4444;';
            } else if (colorRoll < 0.20) {
                color = '#22c55e'; // Green
                glow = 'box-shadow: 0 0 6px #22c55e;';
            } else if (colorRoll < 0.28) {
                glow = 'box-shadow: 0 0 4px #fff;'; // White sparkle
            }

            const particle = document.createElement('div');
            particle.className = 'snow-particle';
            particle.dataset.letter = point.letter.dataset.letter;
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                ${glow}
            `;

            this.container.appendChild(particle);
            this.particles.push(particle);
        }

        shakeOff(letter) {
            letter.classList.add('shake');
            setTimeout(() => letter.classList.remove('shake'), 300);

            const letterId = letter.dataset.letter;

            this.particles = this.particles.filter(p => {
                if (p.dataset.letter === letterId) {
                    p.style.transition = 'all 0.3s ease-out';
                    p.style.transform = 'translateY(40px)';
                    p.style.opacity = '0';
                    setTimeout(() => p.remove(), 300);
                    return false;
                }
                return true;
            });
        }
    }

    /**
     * Tagline Snow Accumulation Effect - Snow particles on tagline letter outlines
     */
    class TaglineSnowAccumulation {
        constructor() {
            this.tagline = document.getElementById('tagline');
            this.letters = document.querySelectorAll('.tagline-letter:not(.space)');
            this.particles = [];
            this.maxParticles = 3000;
            this.outlinePoints = [];

            if (!this.tagline || !this.letters.length) return;
            this.init();
        }

        init() {
            this.taglineText = this.tagline.querySelector('.tagline-text');
            this.container = document.createElement('div');
            this.container.className = 'tagline-snow-container';
            this.taglineText.style.position = 'relative';
            this.taglineText.appendChild(this.container);

            this.extractOutlinePoints();
            this.accumulateSnow();

            window.addEventListener('resize', () => {
                this.outlinePoints = [];
                this.extractOutlinePoints();
            });
        }

        extractOutlinePoints() {
            const containerRect = this.taglineText.getBoundingClientRect();

            this.letters.forEach(letter => {
                const char = letter.textContent;
                if (!char.trim()) return;

                const letterRect = letter.getBoundingClientRect();
                const relX = letterRect.left - containerRect.left;
                const relY = letterRect.top - containerRect.top;
                const width = letterRect.width;
                const height = letterRect.height;

                // Create canvas matching letter size
                const canvas = document.createElement('canvas');
                canvas.width = Math.ceil(width);
                canvas.height = Math.ceil(height);
                const ctx = canvas.getContext('2d');

                const style = window.getComputedStyle(letter);
                const fontSize = parseFloat(style.fontSize);
                ctx.font = `300 ${fontSize}px "Exo 2", sans-serif`;
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'alphabetic';
                ctx.textAlign = 'left';

                // Draw at baseline position
                ctx.fillText(char.toUpperCase(), 0, fontSize * 0.85);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let py = 0; py < canvas.height; py++) {
                    for (let px = 0; px < canvas.width; px++) {
                        const i = (py * canvas.width + px) * 4;
                        if (data[i + 3] > 100) {
                            const isEdge = this.isEdgePixel(data, px, py, canvas.width, canvas.height);
                            if (isEdge) {
                                this.outlinePoints.push({
                                    x: relX + px,
                                    y: relY + py,
                                    letter: letter
                                });
                            }
                        }
                    }
                }
            });
        }

        isEdgePixel(data, x, y, width, height, scale = 1) {
            const step = scale;
            const neighbors = [[-step, 0], [step, 0], [0, -step], [0, step]];
            for (const [dx, dy] of neighbors) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) return true;
                const ni = (ny * width + nx) * 4;
                if (data[ni + 3] < 100) return true;
            }
            return false;
        }

        accumulateSnow() {
            setTimeout(() => {
                for (let i = 0; i < 2000; i++) {
                    setTimeout(() => this.addParticle(), i);
                }
                setInterval(() => this.addParticle(), 10);
            }, 100);
        }

        addParticle() {
            if (this.outlinePoints.length === 0) return;
            if (this.particles.length >= this.maxParticles) return;

            const point = this.outlinePoints[Math.floor(Math.random() * this.outlinePoints.length)];

            const x = point.x + (Math.random() - 0.5) * 2;
            const y = point.y + (Math.random() - 0.5) * 2;
            const size = 1 + Math.random() * 1.5;

            const colorRoll = Math.random();
            let color = '#ffffff';
            let glow = '';
            if (colorRoll < 0.10) {
                color = '#ef4444';
                glow = 'box-shadow: 0 0 4px #ef4444;';
            } else if (colorRoll < 0.20) {
                color = '#22c55e';
                glow = 'box-shadow: 0 0 4px #22c55e;';
            } else if (colorRoll < 0.28) {
                glow = 'box-shadow: 0 0 3px #fff;';
            }

            const particle = document.createElement('div');
            particle.className = 'snow-particle';
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                ${glow}
            `;

            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }

    /**
     * Snow Effect Class - Main falling snow
     */
    class SnowEffect {
        constructor() {
            this.container = document.getElementById('snowContainer');
            if (!this.container) return;

            this.init();
        }

        init() {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return;
            }

            this.createSnowflakes();
            this.handleVisibility();
        }

        createSnowflakes() {
            const fragment = document.createDocumentFragment();

            for (let i = 0; i < CONFIG.snowflakeCount; i++) {
                const snowflake = this.createSnowflake();
                fragment.appendChild(snowflake);
            }

            this.container.appendChild(fragment);
        }

        createSnowflake() {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';

            const size = this.random(CONFIG.minSize, CONFIG.maxSize);
            const duration = this.random(CONFIG.minDuration, CONFIG.maxDuration);
            const delay = this.random(CONFIG.minDelay, CONFIG.maxDelay);
            const startX = this.random(0, 100);
            const opacity = this.random(0.3, 1);
            const drift = this.random(-30, 30);

            snowflake.style.cssText = `
                left: ${startX}%;
                width: ${size}px;
                height: ${size}px;
                opacity: ${opacity};
                animation-duration: ${duration}s;
                animation-delay: -${delay}s;
                --drift: ${drift}px;
            `;

            return snowflake;
        }

        random(min, max) {
            return Math.random() * (max - min) + min;
        }

        handleVisibility() {
            document.addEventListener('visibilitychange', () => {
                const snowflakes = this.container.querySelectorAll('.snowflake');
                snowflakes.forEach(flake => {
                    flake.style.animationPlayState = document.hidden ? 'paused' : 'running';
                });
            });
        }
    }

    /**
     * Waitlist Form Handler
     */
    class WaitlistForm {
        constructor() {
            this.form = document.getElementById('waitlistForm');
            this.successMessage = document.getElementById('successMessage');

            if (this.form) {
                this.init();
            }
        }

        init() {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        handleSubmit(e) {
            e.preventDefault();

            const button = this.form.querySelector('button');
            const input = this.form.querySelector('input');

            button.classList.add('loading');
            button.disabled = true;

            setTimeout(() => {
                button.classList.remove('loading');
                button.disabled = false;
                input.value = '';

                this.successMessage.classList.add('show');
                this.celebrateBurst();

                setTimeout(() => {
                    this.successMessage.classList.remove('show');
                }, 5000);
            }, 1500);
        }

        celebrateBurst() {
            const container = document.getElementById('snowContainer');
            if (!container) return;

            for (let i = 0; i < 30; i++) {
                const flake = document.createElement('div');
                flake.className = 'snowflake celebration';

                const size = Math.random() * 8 + 4;
                const startX = 40 + Math.random() * 20;
                const duration = Math.random() * 2 + 1;
                const drift = (Math.random() - 0.5) * 200;

                flake.style.cssText = `
                    left: ${startX}%;
                    top: 50%;
                    width: ${size}px;
                    height: ${size}px;
                    opacity: 1;
                    animation: celebrationFall ${duration}s ease-out forwards;
                    --drift: ${drift}px;
                `;

                container.appendChild(flake);
                setTimeout(() => flake.remove(), duration * 1000);
            }
        }
    }

    /**
     * Scroll Animations
     */
    class ScrollAnimations {
        constructor() {
            this.init();
        }

        init() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.feature-card, .car-tag').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        }
    }

    /**
     * Add dynamic styles for animations
     */
    function addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .snowflake {
                position: absolute;
                pointer-events: none;
                border-radius: 50%;
                background: #fff;
                animation: fall linear infinite;
            }

            @keyframes fall {
                0% {
                    transform: translateY(-2vh) translateX(0);
                    opacity: 0;
                }
                5% {
                    opacity: 1;
                }
                95% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(102vh) translateX(var(--drift, 0px));
                    opacity: 0;
                }
            }

            @keyframes celebrationFall {
                0% {
                    transform: translateY(0) translateX(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateY(40vh) translateX(var(--drift, 0px)) scale(0.3);
                    opacity: 0;
                }
            }

            .visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }

            .feature-card:nth-child(1) { transition-delay: 0s; }
            .feature-card:nth-child(2) { transition-delay: 0.1s; }
            .feature-card:nth-child(3) { transition-delay: 0.2s; }
            .feature-card:nth-child(4) { transition-delay: 0.3s; }
            .feature-card:nth-child(5) { transition-delay: 0.4s; }
            .feature-card:nth-child(6) { transition-delay: 0.5s; }

            .car-tag:nth-child(1) { transition-delay: 0s; }
            .car-tag:nth-child(2) { transition-delay: 0.05s; }
            .car-tag:nth-child(3) { transition-delay: 0.1s; }
            .car-tag:nth-child(4) { transition-delay: 0.15s; }
            .car-tag:nth-child(5) { transition-delay: 0.2s; }
            .car-tag:nth-child(6) { transition-delay: 0.25s; }
            .car-tag:nth-child(7) { transition-delay: 0.3s; }
            .car-tag:nth-child(8) { transition-delay: 0.35s; }
        `;
        document.head.appendChild(style);
    }

    /**
     * Initialize everything when DOM is ready
     */
    function init() {
        addDynamicStyles();
        new SnowEffect();
        new LogoSnowAccumulation();
        new TaglineSnowAccumulation();
        new WaitlistForm();
        new ScrollAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
