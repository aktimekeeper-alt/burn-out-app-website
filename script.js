/**
 * BURNOUT - Winter Snow Effect
 * Performant snowfall with cursor collection and text accumulation
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        snowflakeCount: 75,
        minSize: 3,
        maxSize: 8,
        minDuration: 8,
        maxDuration: 20,
        minDelay: 0,
        maxDelay: 15,
        cursorSnowMax: 25,
        cursorCollectRadius: 60,
        logoSnowMax: 40
    };

    /**
     * Cursor Snow Collection Effect
     */
    class CursorSnowCollector {
        constructor() {
            this.container = document.getElementById('cursorSnow');
            this.snowflakes = [];
            this.mouseX = 0;
            this.mouseY = 0;
            this.isActive = false;
            this.collectTimer = null;

            if (!this.container) return;
            this.init();
        }

        init() {
            // Track mouse movement
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                this.container.style.left = this.mouseX + 'px';
                this.container.style.top = this.mouseY + 'px';

                if (!this.isActive) {
                    this.isActive = true;
                    this.container.classList.add('active');
                }

                // Reset inactivity timer
                clearTimeout(this.collectTimer);
                this.collectTimer = setTimeout(() => {
                    this.releaseSnow();
                }, 3000);
            });

            document.addEventListener('mouseleave', () => {
                this.isActive = false;
                this.container.classList.remove('active');
                this.releaseSnow();
            });

            // Collect snow periodically when moving
            this.startCollecting();
        }

        startCollecting() {
            setInterval(() => {
                if (this.isActive && this.snowflakes.length < CONFIG.cursorSnowMax) {
                    this.addSnowflake();
                }
            }, 200);
        }

        addSnowflake() {
            const flake = document.createElement('div');
            flake.className = 'cursor-snowflake';

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 35 + 10;
            const x = Math.cos(angle) * distance + 50;
            const y = Math.sin(angle) * distance + 50;
            const size = Math.random() * 4 + 3;
            const delay = Math.random() * 2;

            flake.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                animation-delay: ${delay}s;
            `;

            this.container.appendChild(flake);
            this.snowflakes.push(flake);
        }

        releaseSnow() {
            // Animate snowflakes falling away
            this.snowflakes.forEach((flake, index) => {
                setTimeout(() => {
                    flake.style.transition = 'all 0.8s ease-out';
                    flake.style.transform = `translateY(${50 + Math.random() * 30}px)`;
                    flake.style.opacity = '0';

                    setTimeout(() => flake.remove(), 800);
                }, index * 50);
            });
            this.snowflakes = [];
        }
    }

    /**
     * Logo Snow Accumulation Effect
     */
    class LogoSnowAccumulation {
        constructor() {
            this.logo = document.getElementById('mainLogo');
            this.snowPile = document.getElementById('logoSnowPile');
            this.particles = [];

            if (!this.logo || !this.snowPile) return;
            this.init();
        }

        init() {
            // Start accumulating snow on the logo
            this.accumulateSnow();

            // Add interaction - shake off snow on hover
            this.logo.addEventListener('mouseenter', () => {
                this.shakeOffSome();
            });
        }

        accumulateSnow() {
            // Add initial snow particles
            for (let i = 0; i < 20; i++) {
                setTimeout(() => this.addParticle(), i * 100);
            }

            // Continue adding snow periodically
            setInterval(() => {
                if (this.particles.length < CONFIG.logoSnowMax) {
                    this.addParticle();
                }
            }, 800);
        }

        addParticle() {
            const particle = document.createElement('div');
            particle.className = 'snow-particle';

            const logoRect = this.logo.getBoundingClientRect();
            const pileRect = this.snowPile.getBoundingClientRect();

            // Position snow on top edge of letters
            const x = Math.random() * 100;
            const y = Math.random() * 15 - 5; // Near top of text
            const size = Math.random() * 6 + 3;

            particle.style.cssText = `
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
            `;

            this.snowPile.appendChild(particle);
            this.particles.push(particle);

            // Remove oldest particles if too many
            if (this.particles.length > CONFIG.logoSnowMax) {
                const old = this.particles.shift();
                old.classList.add('melting');
                setTimeout(() => old.remove(), 800);
            }
        }

        shakeOffSome() {
            // Remove some particles when hovering
            const toRemove = Math.min(5, this.particles.length);
            for (let i = 0; i < toRemove; i++) {
                const particle = this.particles.shift();
                if (particle) {
                    particle.style.transition = 'all 0.5s ease-out';
                    particle.style.transform = `translateY(20px) rotate(${Math.random() * 360}deg)`;
                    particle.style.opacity = '0';
                    setTimeout(() => particle.remove(), 500);
                }
            }
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
                color: rgba(255, 255, 255, 0.9);
                pointer-events: none;
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(255, 255, 255, 0.95) 0%,
                    rgba(255, 255, 255, 0.5) 40%,
                    transparent 70%);
                box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
                animation: fall linear infinite;
            }

            @keyframes fall {
                0% {
                    transform: translateY(-10vh) translateX(0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(105vh) translateX(var(--drift, 0px)) rotate(360deg);
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
        new CursorSnowCollector();
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
