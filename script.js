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
        logoSnowMax: 800
    };

    /**
     * Logo Snow Accumulation Effect - Snow particles on letters
     */
    class LogoSnowAccumulation {
        constructor() {
            this.logo = document.getElementById('mainLogo');
            this.letters = document.querySelectorAll('.letter');
            this.particles = [];
            this.maxParticles = CONFIG.logoSnowMax;

            if (!this.logo || !this.letters.length) return;
            this.init();
        }

        init() {
            // Create container for all snow particles
            this.container = document.createElement('div');
            this.container.className = 'logo-snow-container';
            this.logo.style.position = 'relative';
            this.logo.appendChild(this.container);

            // Start accumulating snow
            this.accumulateSnow();

            // Add shake interaction
            this.letters.forEach(letter => {
                letter.addEventListener('mouseenter', () => this.shakeOff(letter));
            });
        }

        accumulateSnow() {
            // Add initial particles very rapidly to fill outline
            for (let i = 0; i < 500; i++) {
                setTimeout(() => this.addParticle(), i * 5);
            }

            // Continue adding particles to maintain density
            setInterval(() => this.addParticle(), 20);
        }

        addParticle() {
            if (this.particles.length >= this.maxParticles) {
                const old = this.particles.shift();
                old.remove();
            }

            // Pick random letter
            const letter = this.letters[Math.floor(Math.random() * this.letters.length)];
            const letterRect = letter.getBoundingClientRect();
            const logoRect = this.logo.getBoundingClientRect();

            // Position relative to logo container
            const relX = letterRect.left - logoRect.left;
            const relY = letterRect.top - logoRect.top;

            // Place particles along the OUTLINE/EDGES of the letter
            const edgeThickness = 6; // How thick the outline area is
            let x, y;

            // Pick a random edge: 0=top, 1=right, 2=bottom, 3=left
            const edge = Math.floor(Math.random() * 4);

            switch(edge) {
                case 0: // Top edge
                    x = relX + Math.random() * letterRect.width;
                    y = relY + Math.random() * edgeThickness;
                    break;
                case 1: // Right edge
                    x = relX + letterRect.width - Math.random() * edgeThickness;
                    y = relY + Math.random() * letterRect.height;
                    break;
                case 2: // Bottom edge
                    x = relX + Math.random() * letterRect.width;
                    y = relY + letterRect.height - Math.random() * edgeThickness;
                    break;
                case 3: // Left edge
                    x = relX + Math.random() * edgeThickness;
                    y = relY + Math.random() * letterRect.height;
                    break;
            }

            const size = 1.5 + Math.random() * 2; // Particles 1.5-3.5px

            const particle = document.createElement('div');
            particle.className = 'snow-particle';
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
            `;

            this.container.appendChild(particle);
            this.particles.push(particle);
        }

        shakeOff(letter) {
            letter.classList.add('shake');
            setTimeout(() => letter.classList.remove('shake'), 300);

            // Remove nearby particles
            const letterRect = letter.getBoundingClientRect();
            const logoRect = this.logo.getBoundingClientRect();
            const relX = letterRect.left - logoRect.left;

            this.particles = this.particles.filter(p => {
                const px = parseFloat(p.style.left);
                if (px >= relX && px <= relX + letterRect.width) {
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
        new WaitlistForm();
        new ScrollAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
