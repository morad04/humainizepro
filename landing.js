/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Landing Page Logic
   Auth (localStorage MVP), FAQ accordion, nav interactions
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── Auth State ───
    function getUser() {
        try {
            return JSON.parse(localStorage.getItem('humainize_user'));
        } catch { return null; }
    }

    function setUser(user) {
        localStorage.setItem('humainize_user', JSON.stringify(user));
    }

    function logout() {
        localStorage.removeItem('humainize_user');
        window.location.reload();
    }

    // ─── Seed built-in accounts (always enforce correct plans) ───
    (function seedAccounts() {
        const users = JSON.parse(localStorage.getItem('humainize_users') || '{}');
        // Always enforce plans for built-in accounts
        users['pro@humainize.com'] = { password: btoa('pro12345'), plan: 'pro', createdAt: users['pro@humainize.com']?.createdAt || Date.now() };
        users['free@humainize.com'] = { password: btoa('free12345'), plan: 'free', createdAt: users['free@humainize.com']?.createdAt || Date.now() };
        localStorage.setItem('humainize_users', JSON.stringify(users));
    })();

    // ─── If user is already logged in, redirect to app ───
    const currentUser = getUser();
    if (currentUser && window.location.pathname.endsWith('index.html') === false) {
        // Don't auto-redirect on landing page
    }

    // ─── Navbar Scroll ───
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });

    // ─── Hamburger Menu ───
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
        });
    }

    // ─── FAQ Accordion ───
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));

            // Toggle current
            if (!isOpen) item.classList.add('open');
        });
    });

    // ─── Auth Modal ───
    const authModal = document.getElementById('auth-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const authForm = document.getElementById('auth-form');
    const btnAuthSubmit = document.getElementById('btn-auth-submit');
    const btnAuthSwitch = document.getElementById('btn-auth-switch');
    const authSwitchText = document.getElementById('auth-switch-text');
    const modalClose = document.getElementById('modal-close');

    let isSignup = true;

    function openAuthModal(signup = true) {
        isSignup = signup;
        if (signup) {
            modalTitle.textContent = 'Create Your Account';
            modalSubtitle.textContent = 'Start humanizing your text for free';
            btnAuthSubmit.textContent = 'Create Account';
            authSwitchText.textContent = 'Already have an account?';
            btnAuthSwitch.textContent = 'Log In';
        } else {
            modalTitle.textContent = 'Welcome Back';
            modalSubtitle.textContent = 'Log in to continue humanizing';
            btnAuthSubmit.textContent = 'Log In';
            authSwitchText.textContent = "Don't have an account?";
            btnAuthSwitch.textContent = 'Sign Up';
        }
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeAuthModal() {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close on overlay click
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    modalClose.addEventListener('click', closeAuthModal);

    // Switch between login/signup
    btnAuthSwitch.addEventListener('click', () => {
        openAuthModal(!isSignup);
    });

    // Auth form submit (localStorage MVP)
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;

        if (!email || !password) return;

        if (isSignup) {
            // Check if user already exists
            const existingUsers = JSON.parse(localStorage.getItem('humainize_users') || '{}');
            if (existingUsers[email]) {
                alert('Account already exists. Please log in.');
                openAuthModal(false);
                return;
            }
            // Create user
            existingUsers[email] = { password: btoa(password), plan: 'free', createdAt: Date.now() };
            localStorage.setItem('humainize_users', JSON.stringify(existingUsers));
            setUser({ email, plan: 'free', wordsUsed: 0, lastReset: new Date().toDateString() });
        } else {
            // Login
            const existingUsers = JSON.parse(localStorage.getItem('humainize_users') || '{}');
            const user = existingUsers[email];
            if (!user || atob(user.password) !== password) {
                alert('Invalid email or password.');
                return;
            }
            setUser({ email, plan: user.plan || 'free', wordsUsed: 0, lastReset: new Date().toDateString() });
        }

        closeAuthModal();
        // Redirect to app
        window.location.href = 'app-page.html';
    });

    // Google sign-in (simulated for MVP)
    document.getElementById('btn-google').addEventListener('click', () => {
        const email = 'user@gmail.com';
        const existingUsers = JSON.parse(localStorage.getItem('humainize_users') || '{}');
        if (!existingUsers[email]) {
            existingUsers[email] = { password: '', plan: 'free', createdAt: Date.now() };
            localStorage.setItem('humainize_users', JSON.stringify(existingUsers));
        }
        setUser({ email, plan: existingUsers[email].plan || 'free', wordsUsed: 0, lastReset: new Date().toDateString() });
        window.location.href = 'app-page.html';
    });

    // ─── Button Click Handlers ───
    // All "get started" / "sign up" buttons open the auth modal
    const signupButtons = [
        'btn-get-started', 'btn-signup-free', 'btn-signup-pro', 'btn-cta-final'
    ];

    signupButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentUser) {
                    window.location.href = 'app-page.html';
                } else {
                    openAuthModal(true);
                }
            });
        }
    });

    // Login button
    const btnLoginNav = document.getElementById('btn-login-nav');
    if (btnLoginNav) {
        if (currentUser) {
            btnLoginNav.textContent = 'Go to App';
            btnLoginNav.addEventListener('click', () => {
                window.location.href = 'app-page.html';
            });
        } else {
            btnLoginNav.addEventListener('click', () => openAuthModal(false));
        }
    }

    // ─── Smooth scroll for nav links ───
    document.querySelectorAll('.nav-links a, .footer-links a').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    navLinks.classList.remove('mobile-open');
                }
            }
        });
    });

    // ─── Intersection Observer for animations ───
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.step-card, .feature-card, .pricing-card').forEach(el => {
        observer.observe(el);
    });

})();
