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
     * Logo Snow Accumulation Effect - Snow on each letter
     */
    class LogoSnowAccumulation {
        constructor() {
            this.logo = document.getElementById('mainLogo');
            this.letters = document.querySelectorAll('.letter');
            this.letterSnow = new Map(); // Track snow per letter

            if (!this.logo || !this.letters.length) return;
            this.init();
        }

        init() {
            // Add snow containers to each letter
            this.letters.forEach(letter => {
                const snowContainer = document.createElement('div');
                snowContainer.className = 'snow-on-letter';
                letter.appendChild(snowContainer);
                this.letterSnow.set(letter, { container: snowContainer, particles: [] });
            });

            // Start accumulating snow
            this.accumulateSnow();

            // Add interaction - shake off snow on hover per letter
            this.letters.forEach(letter => {
                letter.addEventListener('mouseenter', () => {
                    this.shakeOffLetter(letter);
                });
            });
        }

        accumulateSnow() {
            // Add initial snow particles
            for (let i = 0; i < 35; i++) {
                setTimeout(() => this.addParticleToRandomLetter(), i * 80);
            }

            // Continue adding snow periodically
            setInterval(() => {
                this.addParticleToRandomLetter();
            }, 600);
        }

        addParticleToRandomLetter() {
            const letterArray = Array.from(this.letters);
            const randomLetter = letterArray[Math.floor(Math.random() * letterArray.length)];
            this.addParticle(randomLetter);
        }

        addParticle(letter) {
            const data = this.letterSnow.get(letter);
            if (!data) return;

            // Limit particles per letter
            if (data.particles.length >= 6) {
                const old = data.particles.shift();
                old.classList.add('melting');
                setTimeout(() => old.remove(), 600);
            }

            const particle = document.createElement('div');
            particle.className = 'snow-particle';

            // Position snow at bottom of container (which aligns with letter top)
            const x = 5 + Math.random() * 90; // Spread across letter
            const y = 50 + Math.random() * 50; // Bottom half of container = on letter top
            const size = Math.random() * 5 + 4;

            particle.style.cssText = `
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
            `;

            data.container.appendChild(particle);
            data.particles.push(particle);
        }

        shakeOffLetter(letter) {
            const data = this.letterSnow.get(letter);
            if (!data) return;

            // Add shake animation to letter
            letter.classList.add('shake');
            setTimeout(() => letter.classList.remove('shake'), 300);

            // Remove some particles from this letter
            const toRemove = Math.min(3, data.particles.length);
            for (let i = 0; i < toRemove; i++) {
                const particle = data.particles.shift();
                if (particle) {
                    particle.style.transition = 'all 0.4s ease-out';
                    particle.style.transform = `translateY(30px) rotate(${Math.random() * 360}deg)`;
                    particle.style.opacity = '0';
                    setTimeout(() => particle.remove(), 400);
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
