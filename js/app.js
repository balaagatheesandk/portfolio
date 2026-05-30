/**
 * Main Application Controller
 * Handles custom cursor, scroll reveal, theme toggle, and form overlays.
 */
document.addEventListener('cms-ready', () => {
    // 1. Premium Double-Layer Custom Cursor (Desktops only)
    const dot = document.getElementById('dot');
    const ring = document.getElementById('ring');
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    if (dot && ring) {
        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Central dot moves instantly
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        // Outer ring moves with easing (requestAnimationFrame for ultra-smoothness)
        const animateCursorRing = () => {
            const ease = 0.15; // smooth lag coefficient
            ringX += (mouseX - ringX) * ease;
            ringY += (mouseY - ringY) * ease;

            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';

            requestAnimationFrame(animateCursorRing);
        };
        requestAnimationFrame(animateCursorRing);

        // Scale up ring on interactive elements hover
        const interactiveSelectors = 'a, button, input, select, textarea, .btn, .skill-cell, .project-card, .term-suggest-tag, .stat-cell';
        document.querySelectorAll(interactiveSelectors).forEach(el => {
            el.addEventListener('mouseenter', () => {
                ring.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                ring.classList.remove('hovered');
            });
        });
    }

    // Theme Toggle (Light / Dark Mode)
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;

    // Check local storage or user preference
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'light' ? '☀️' : '🌙';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('portfolio-theme', newTheme);

            if (themeIcon) {
                themeIcon.textContent = newTheme === 'light' ? '☀️' : '🌙';
            }

            // Print system telemetry feedback directly to the interactive terminal emulator
            if (window.terminalInstance) {
                window.terminalInstance.printLine(
                    `[TELEMETRY] Environmental illumination calibrated to [${newTheme.toUpperCase()}].`,
                    'success'
                );
            }
        });
    }

    // 2. Mobile Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            hamburger.classList.toggle('active');
        });

        // Close menu when links are clicked
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburger.classList.remove('active');
            });
        });
    }

    // 3. Scroll Reveal Intersection Observer
    const revealElements = document.querySelectorAll('.reveal, .stat-cell, .skill-cell, .project-card, .sb-mitre-card');

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger reveal animations slightly
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, i * 50);
                    // Stop observing once visible to maintain animation state
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -50px 0px' // triggers slightly before entering screen completely
        });

        revealElements.forEach(el => {
            el.classList.add('reveal');
            revealObserver.observe(el);
        });
    }

    // 4. Contact Form Encryption Overlay & Fake Send
    const contactForm = document.getElementById('contactForm');
    const secureOverlay = document.getElementById('secureOverlay');
    const secureLog = document.getElementById('secureLog');

    if (contactForm && secureOverlay && secureLog) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameVal = document.getElementById('formName').value.trim();
            const emailVal = document.getElementById('formEmail').value.trim();
            const msgVal = document.getElementById('formMessage').value.trim();

            if (!nameVal || !emailVal || !msgVal) return;

            // Activate terminal screen overlay
            secureOverlay.classList.add('active');
            secureLog.innerHTML = '';

            const secureSteps = window.cmsData.contact.form.secureOverlaySteps;
            const logMessages = [
                secureSteps[0],
                secureSteps[1],
                secureSteps[2] + emailVal,
                secureSteps[3],
                secureSteps[4],
                secureSteps[5]
            ];

            let index = 0;
            const printLog = () => {
                if (index < logMessages.length) {
                    const line = document.createElement('div');
                    line.className = index === logMessages.length - 1 ? 'success' : 'dim';
                    line.textContent = `> ${logMessages[index]}`;
                    secureLog.appendChild(line);
                    index++;
                    setTimeout(printLog, 600);
                } else {
                    // Close button
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-gold';
                    btn.style.marginTop = '1.5rem';
                    btn.innerHTML = `<span>${window.cmsData.contact.form.closeBtnText}</span>`;
                    btn.addEventListener('click', () => {
                        secureOverlay.classList.remove('active');
                        contactForm.reset();
                    });
                    secureLog.appendChild(btn);
                }
            };
            printLog();
        });
    }

    // 5. Smooth anchor scrolling for in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);

            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
