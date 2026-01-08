/**
 * BURNOUT - Winter Snow Effect
 * Performant snowfall with cursor collection and text accumulation
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        logoSnowMax: 5000
    };

    // Seasonal color schemes for text particles
    const SEASON_COLORS = {
        winter: { main: '#ffffff', accents: ['#a5f3fc', '#e0f2fe'], glow: '#fff' },
        spring: { main: '#fbcfe8', accents: ['#f9a8d4', '#86efac'], glow: '#f9a8d4' },
        summer: { main: '#fef08a', accents: ['#fde047', '#bef264'], glow: '#fde047' },
        fall: { main: '#fb923c', accents: ['#f97316', '#dc2626'], glow: '#f97316' }
    };

    // Get current season (checks URL param first, then date)
    function getCurrentSeason() {
        const urlParams = new URLSearchParams(window.location.search);
        const override = urlParams.get('season');
        if (override && ['winter', 'spring', 'summer', 'fall'].includes(override)) {
            return override;
        }
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    let currentSeason = getCurrentSeason();

    // Store references to update particles when season changes
    let logoAccumulation = null;
    let taglineAccumulation = null;

    // Function to change season (called by the button)
    window.setTextSeason = function(newSeason) {
        if (!['winter', 'spring', 'summer', 'fall'].includes(newSeason)) return;
        currentSeason = newSeason;
        // Clear and restart text particles with new colors
        if (logoAccumulation) {
            logoAccumulation.particles.forEach(p => p.remove());
            logoAccumulation.particles = [];
            logoAccumulation.accumulateSnow();
        }
        if (taglineAccumulation) {
            taglineAccumulation.particles.forEach(p => p.remove());
            taglineAccumulation.particles = [];
            taglineAccumulation.accumulateSnow();
        }
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

            // Wait for fonts to load before initializing
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => this.init());
            } else {
                setTimeout(() => this.init(), 500);
            }
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

            // Brush off particles when mouse moves over them
            this.logoText.addEventListener('mousemove', (e) => this.brushOff(e));

            // Re-extract on resize
            window.addEventListener('resize', () => {
                this.outlinePoints = [];
                this.extractOutlinePoints();
            });
        }

        brushOff(e) {
            const containerRect = this.container.getBoundingClientRect();
            const mouseX = e.clientX - containerRect.left;
            const mouseY = e.clientY - containerRect.top;
            const brushRadius = 25;

            this.particles = this.particles.filter(p => {
                const px = parseFloat(p.style.left);
                const py = parseFloat(p.style.top);
                const dist = Math.sqrt((px - mouseX) ** 2 + (py - mouseY) ** 2);

                if (dist < brushRadius) {
                    // Float down gently
                    const driftX = (Math.random() - 0.5) * 30;
                    const fallY = 80 + Math.random() * 40;

                    p.style.transition = 'all 1s ease-out';
                    p.style.transform = `translate(${driftX}px, ${fallY}px)`;
                    p.style.opacity = '0';
                    setTimeout(() => p.remove(), 1000);
                    return false;
                }
                return true;
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

                // Create canvas with extra space for font metrics
                const canvas = document.createElement('canvas');
                const scale = 1;
                canvas.width = Math.ceil(width * scale) + 10;
                canvas.height = Math.ceil(height * scale) + 10;
                const ctx = canvas.getContext('2d');

                // Match font exactly
                const style = window.getComputedStyle(letter);
                const fontSize = parseFloat(style.fontSize);
                ctx.font = `700 ${fontSize}px Rajdhani, sans-serif`;
                ctx.fillStyle = 'white';

                // Measure text to get proper positioning
                const metrics = ctx.measureText(char);
                const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;

                // Draw text aligned to match DOM element positioning
                ctx.fillText(char, 0, ascent);

                // Get pixel data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Find edge pixels for outline effect
                // Offset to align canvas text with DOM text
                const yOffset = height - ascent;

                for (let py = 0; py < canvas.height; py++) {
                    for (let px = 0; px < canvas.width; px++) {
                        const i = (py * canvas.width + px) * 4;
                        if (data[i + 3] > 100) {
                            const isEdge = this.isEdgePixel(data, px, py, canvas.width, canvas.height);
                            if (isEdge) {
                                this.outlinePoints.push({
                                    x: relX + px,
                                    y: relY + py + yOffset,
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
                // Add initial particles to fill letters quickly
                for (let i = 0; i < 3000; i++) {
                    setTimeout(() => this.addParticle(), i * 0.5);
                }

                // Continue adding particles slowly until full
                setInterval(() => this.addParticle(), 20);
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

            // Seasonal colors
            const colors = SEASON_COLORS[currentSeason];
            const colorRoll = Math.random();
            let color = colors.main;
            let glow = '';
            if (colorRoll < 0.15) {
                color = colors.accents[0];
                glow = `box-shadow: 0 0 6px ${colors.accents[0]};`;
            } else if (colorRoll < 0.25) {
                color = colors.accents[1];
                glow = `box-shadow: 0 0 6px ${colors.accents[1]};`;
            } else if (colorRoll < 0.35) {
                glow = `box-shadow: 0 0 4px ${colors.glow};`;
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
            this.maxParticles = 1500;
            this.outlinePoints = [];

            if (!this.tagline || !this.letters.length) return;

            // Wait for fonts to load before initializing
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => this.init());
            } else {
                setTimeout(() => this.init(), 500);
            }
        }

        init() {
            this.taglineText = this.tagline.querySelector('.tagline-text');
            this.container = document.createElement('div');
            this.container.className = 'tagline-snow-container';
            this.taglineText.style.position = 'relative';
            this.taglineText.appendChild(this.container);

            this.extractOutlinePoints();
            this.accumulateSnow();

            // Brush off particles when mouse moves over them
            this.taglineText.addEventListener('mousemove', (e) => this.brushOff(e));

            window.addEventListener('resize', () => {
                this.outlinePoints = [];
                this.extractOutlinePoints();
            });
        }

        brushOff(e) {
            const containerRect = this.container.getBoundingClientRect();
            const mouseX = e.clientX - containerRect.left;
            const mouseY = e.clientY - containerRect.top;
            const brushRadius = 15;

            this.particles = this.particles.filter(p => {
                const px = parseFloat(p.style.left);
                const py = parseFloat(p.style.top);
                const dist = Math.sqrt((px - mouseX) ** 2 + (py - mouseY) ** 2);

                if (dist < brushRadius) {
                    // Float down gently
                    const driftX = (Math.random() - 0.5) * 20;
                    const fallY = 50 + Math.random() * 30;

                    p.style.transition = 'all 0.8s ease-out';
                    p.style.transform = `translate(${driftX}px, ${fallY}px)`;
                    p.style.opacity = '0';
                    setTimeout(() => p.remove(), 800);
                    return false;
                }
                return true;
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

                // Create canvas with extra space
                const canvas = document.createElement('canvas');
                canvas.width = Math.ceil(width) + 10;
                canvas.height = Math.ceil(height) + 10;
                const ctx = canvas.getContext('2d');

                const style = window.getComputedStyle(letter);
                const fontSize = parseFloat(style.fontSize);
                ctx.font = `300 ${fontSize}px "Exo 2", sans-serif`;
                ctx.fillStyle = 'white';

                // Measure text to get proper positioning
                const metrics = ctx.measureText(char.toUpperCase());
                const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;

                // Draw text aligned to match DOM positioning
                ctx.fillText(char.toUpperCase(), 0, ascent);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Offset to align canvas text with DOM text
                const yOffset = height - ascent;

                for (let py = 0; py < canvas.height; py++) {
                    for (let px = 0; px < canvas.width; px++) {
                        const i = (py * canvas.width + px) * 4;
                        if (data[i + 3] > 100) {
                            const isEdge = this.isEdgePixel(data, px, py, canvas.width, canvas.height);
                            if (isEdge) {
                                this.outlinePoints.push({
                                    x: relX + px,
                                    y: relY + py + yOffset,
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
                for (let i = 0; i < 1000; i++) {
                    setTimeout(() => this.addParticle(), i * 0.8);
                }
                setInterval(() => this.addParticle(), 30);
            }, 50);
        }

        addParticle() {
            if (this.outlinePoints.length === 0) return;
            if (this.particles.length >= this.maxParticles) return;

            const point = this.outlinePoints[Math.floor(Math.random() * this.outlinePoints.length)];

            const x = point.x + (Math.random() - 0.5) * 2;
            const y = point.y + (Math.random() - 0.5) * 2;
            const size = 1 + Math.random() * 1.5;

            // Seasonal colors
            const colors = SEASON_COLORS[currentSeason];
            const colorRoll = Math.random();
            let color = colors.main;
            let glow = '';
            if (colorRoll < 0.15) {
                color = colors.accents[0];
                glow = `box-shadow: 0 0 4px ${colors.accents[0]};`;
            } else if (colorRoll < 0.25) {
                color = colors.accents[1];
                glow = `box-shadow: 0 0 4px ${colors.accents[1]};`;
            } else if (colorRoll < 0.35) {
                glow = `box-shadow: 0 0 3px ${colors.glow};`;
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
        logoAccumulation = new LogoSnowAccumulation();
        taglineAccumulation = new TaglineSnowAccumulation();
        new WaitlistForm();
        new ScrollAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
