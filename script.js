/**
 * BURNOUT - Winter Snow Effect
 * Performant snowfall animation with CSS-based movement
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        snowflakeCount: 75,  // Keep between 50-100 for performance
        minSize: 3,
        maxSize: 8,
        minDuration: 8,
        maxDuration: 20,
        minDelay: 0,
        maxDelay: 15,
        symbols: ['•', '●', '◦', '○', '◌']
    };

    /**
     * Snow Effect Class
     */
    class SnowEffect {
        constructor() {
            this.container = document.getElementById('snowContainer');
            if (!this.container) return;

            this.init();
        }

        init() {
            // Check for reduced motion preference
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

            // Random properties
            const size = this.random(CONFIG.minSize, CONFIG.maxSize);
            const duration = this.random(CONFIG.minDuration, CONFIG.maxDuration);
            const delay = this.random(CONFIG.minDelay, CONFIG.maxDelay);
            const startX = this.random(0, 100);
            const opacity = this.random(0.3, 1);
            const drift = this.random(-30, 30);

            // Apply styles
            snowflake.style.cssText = `
                left: ${startX}%;
                width: ${size}px;
                height: ${size}px;
                opacity: ${opacity};
                animation-duration: ${duration}s;
                animation-delay: -${delay}s;
                --drift: ${drift}px;
            `;

            // Use different snowflake representations for variety
            snowflake.innerHTML = CONFIG.symbols[Math.floor(Math.random() * CONFIG.symbols.length)];

            return snowflake;
        }

        random(min, max) {
            return Math.random() * (max - min) + min;
        }

        handleVisibility() {
            // Pause animation when page is not visible
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

            // Show loading state
            button.classList.add('loading');
            button.disabled = true;

            // Simulate API call
            setTimeout(() => {
                button.classList.remove('loading');
                button.disabled = false;
                input.value = '';

                // Show success message
                this.successMessage.classList.add('show');

                // Create a burst of snowflakes as celebration
                this.celebrateBurst();

                // Hide success message after 5 seconds
                setTimeout(() => {
                    this.successMessage.classList.remove('show');
                }, 5000);
            }, 1500);
        }

        celebrateBurst() {
            const container = document.getElementById('snowContainer');
            if (!container) return;

            // Create temporary extra snowflakes
            for (let i = 0; i < 20; i++) {
                const flake = document.createElement('div');
                flake.className = 'snowflake celebration';
                flake.innerHTML = '•';

                const size = Math.random() * 6 + 4;
                const startX = 40 + Math.random() * 20;
                const duration = Math.random() * 3 + 2;
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

                // Remove after animation
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
            // Fade in elements on scroll
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

            // Observe feature cards
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
                    rgba(255, 255, 255, 0.9) 0%,
                    rgba(255, 255, 255, 0.4) 50%,
                    transparent 70%);
                text-indent: -9999px;
                box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
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
                    transform: translateY(30vh) translateX(var(--drift, 0px)) scale(0.5);
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
        new WaitlistForm();
        new ScrollAnimations();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
