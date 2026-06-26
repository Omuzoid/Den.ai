/**
 * DEN.AI Javascript Controller
 * Features: High-Performance Scroll-driven Crossfade with Vertical Parallax, Custom Cursor, Spotlight Cards, HUD Monitor
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Loader Dismissal ---
    const loader = document.getElementById('loader');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 800);
            }
        }, 1200); // 1.2s sync delay
    });

    // Fallback loader dismiss
    setTimeout(() => {
        if (loader && loader.style.opacity !== '0') {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800);
        }
    }, 4000);

    // --- Custom Cursor & Interactive Hovers ---
    const cursor = document.getElementById('customCursor');
    let hasMouse = false;

    window.addEventListener('mousemove', (e) => {
        if (!hasMouse) {
            hasMouse = true;
            if (cursor) cursor.style.display = 'block';
        }
        if (cursor) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        }
    });

    // Add hover states to cursor
    const updateHoverElements = () => {
        const hoverables = document.querySelectorAll('a, button, .market-card, .cta-button, .btn, .back-to-top');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (cursor) cursor.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                if (cursor) cursor.classList.remove('hovering');
            });
        });
    };
    updateHoverElements();

    // --- Spotlight Card Mouse Effect ---
    const cards = document.querySelectorAll('.market-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });

    // --- Image Sequence Cross-Fade & Parallax Animation Engine ---
    const frames = document.querySelectorAll('.sequence-frame');
    const totalFrames = frames.length;
    const progressBar = document.getElementById('progressBar');
    const imageSequence = document.getElementById('imageSequence');
    
    // HUD HUD elements
    const hudFrameVal = document.getElementById('hud-frame-val');
    const hudPortalName = document.getElementById('hud-portal-name');

    function updateScrollAnimations(scrollTop) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        
        const scrollFraction = scrollTop / docHeight;

        // 1. Progress Bar Update
        if (progressBar) {
            progressBar.style.width = `${scrollFraction * 100}%`;
        }

        // 2. Parallax vertical translation of the image sequence
        if (imageSequence) {
            const parallaxLimit = window.innerHeight * 0.3; // matches the 130vh css excess
            const translateVal = -scrollFraction * parallaxLimit;
            imageSequence.style.transform = `translate3d(0, ${translateVal}px, 0)`;
        }

        // 3. Image Frame Crossfade calculation
        const activeVal = scrollFraction * (totalFrames - 1);
        const lower = Math.floor(activeVal);
        const upper = Math.min(totalFrames - 1, Math.ceil(activeVal));
        const ratio = activeVal - lower;

        frames.forEach((frame, idx) => {
            if (idx === lower) {
                // If lower and upper are equal, opacity is 1
                frame.style.opacity = lower === upper ? 1 : 1 - ratio;
                frame.classList.add('active');
            } else if (idx === upper) {
                frame.style.opacity = ratio;
                frame.classList.add('active');
            } else {
                frame.style.opacity = 0;
                frame.classList.remove('active');
            }
        });

        // 4. Update HUD frame counter
        if (hudFrameVal) {
            const currentFrameNum = Math.floor(activeVal) + 1;
            hudFrameVal.innerText = `${currentFrameNum} / ${totalFrames}`;
        }
    }

    // --- High-Performance Scroll Listener Loop ---
    let lastKnownScrollPosition = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        lastKnownScrollPosition = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateScrollAnimations(lastKnownScrollPosition);
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initialize animation values on page load
    updateScrollAnimations(window.scrollY);

    // --- Intersection Observer for Fade In / Out Content & Nav Spy ---
    const sections = document.querySelectorAll('.scroll-section');
    const navItems = document.querySelectorAll('.nav-item');

    const observerOptions = {
        root: null,
        // Trigger entrance when 15% of section is visible
        threshold: [0.15, 0.45]
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const targetId = entry.target.getAttribute('id');
            const navLink = document.querySelector(`.nav-item[href="#${targetId}"]`);

            if (entry.isIntersecting) {
                // Add active class to section to trigger CSS entrance animations
                entry.target.classList.add('active');
                
                // Nav link highlighting
                if (navLink) {
                    navItems.forEach(item => item.classList.remove('active'));
                    navLink.classList.add('active');
                }

                // Update HUD portal text based on active section
                if (hudPortalName) {
                    let sectionCleanName = targetId.toUpperCase();
                    if (sectionCleanName === 'HERO') sectionCleanName = 'INTRO';
                    if (sectionCleanName === 'IMAGE-GEN') sectionCleanName = 'IMAGES';
                    if (sectionCleanName === 'VIDEO-GEN') sectionCleanName = 'VIDEO';
                    if (sectionCleanName === 'WEB-GEN') sectionCleanName = 'WEB LAYOUTS';
                    if (sectionCleanName === 'APP-DEV') sectionCleanName = 'VIBE CODING';
                    hudPortalName.innerText = sectionCleanName;
                }
            } else {
                // If completely out of view, remove active class so it can re-animate later
                const rect = entry.target.getBoundingClientRect();
                if (rect.top > window.innerHeight || rect.bottom < 0) {
                    entry.target.classList.remove('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- Smooth Scroll Navigation Helper ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerOffset = 70; // adjusted header height
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Back to top helper
    const backToTopBtn = document.getElementById('btn-back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Hero Explore button smooth scroll
    const exploreBtn = document.getElementById('explore-btn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const chatSection = document.getElementById('chatbots');
            if (chatSection) {
                const headerOffset = 70;
                const offsetPosition = chatSection.getBoundingClientRect().top + window.scrollY - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // --- Mobile Hamburger Navigation ---
    const hamburger = document.getElementById('navHamburger');
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    const mobileBackdrop = document.getElementById('mobileNavBackdrop');
    const mobileNavLinks = document.querySelectorAll('[data-mobile-nav]');

    function openMobileNav() {
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        mobileDrawer.classList.add('open');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            if (mobileDrawer.classList.contains('open')) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });
    }

    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', closeMobileNav);
    }

    // Mobile nav links: smooth scroll + close drawer
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                closeMobileNav();
                if (targetSection) {
                    setTimeout(() => {
                        const headerOffset = 70;
                        const offsetPosition = targetSection.getBoundingClientRect().top + window.scrollY - headerOffset;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }, 50);
                }
            }
        });
    });

    // Close drawer on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
            closeMobileNav();
        }
    });

    // Re-register hover elements whenever needed (e.g., after dynamic content)
    // Also re-run for mobile nav links
    updateHoverElements();
});
