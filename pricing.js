/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Pricing Page Logic
   Handles: plan selection, payment form, upgrade flow
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    function getUser() {
        try { return JSON.parse(localStorage.getItem('humainize_user')); }
        catch { return null; }
    }
    function setUser(u) { localStorage.setItem('humainize_user', JSON.stringify(u)); }

    const user = getUser();

    // Update nav if logged in
    const btnLogin = document.getElementById('btn-login-nav');
    const btnGetStarted = document.getElementById('btn-get-started');
    if (user && btnLogin) {
        btnLogin.textContent = 'Dashboard';
        btnLogin.addEventListener('click', () => window.location.href = 'app-page.html');
    }

    // Plan buttons
    const btnFree = document.getElementById('btn-plan-free');
    const btnPro = document.getElementById('btn-plan-pro');
    const paymentSection = document.getElementById('payment-section');
    const paymentForm = document.getElementById('payment-form');

    btnFree.addEventListener('click', () => {
        if (user) {
            window.location.href = 'app-page.html';
        } else {
            // Open auth modal
            if (typeof openAuthModal === 'function') openAuthModal(true);
            const modal = document.getElementById('auth-modal');
            if (modal) modal.classList.add('active');
        }
    });

    btnPro.addEventListener('click', () => {
        if (!user) {
            // Must sign up first
            const modal = document.getElementById('auth-modal');
            if (modal) modal.classList.add('active');
            return;
        }
        // Show payment form
        paymentSection.classList.add('active');
        paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Card number formatting
    const cardInput = document.getElementById('card-number');
    cardInput.addEventListener('input', () => {
        let v = cardInput.value.replace(/\D/g, '').substring(0, 16);
        cardInput.value = v.replace(/(.{4})/g, '$1 ').trim();
    });

    // Expiry formatting
    const expiryInput = document.getElementById('card-expiry');
    expiryInput.addEventListener('input', () => {
        let v = expiryInput.value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
        expiryInput.value = v;
    });

    // CVC
    const cvcInput = document.getElementById('card-cvc');
    cvcInput.addEventListener('input', () => {
        cvcInput.value = cvcInput.value.replace(/\D/g, '').substring(0, 4);
    });

    // Payment form submit
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('card-name').value.trim();
        const card = cardInput.value.replace(/\s/g, '');
        const expiry = expiryInput.value;
        const cvc = cvcInput.value;

        if (!name || card.length < 16 || expiry.length < 5 || cvc.length < 3) {
            alert('Please fill in all payment fields correctly.');
            return;
        }

        // Simulate payment processing
        const btn = document.getElementById('btn-pay');
        btn.disabled = true;
        btn.innerHTML = '<span class="processing-spinner" style="width:18px;height:18px;border:2px solid rgba(0,0,0,0.2);border-top-color:#000;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block;"></span> Processing...';

        setTimeout(() => {
            // Upgrade user to pro
            const currentUser = getUser();
            if (currentUser) {
                currentUser.plan = 'pro';
                setUser(currentUser);
                // Update users table
                const users = JSON.parse(localStorage.getItem('humainize_users') || '{}');
                if (users[currentUser.email]) {
                    users[currentUser.email].plan = 'pro';
                    // Save payment info
                    users[currentUser.email].payment = {
                        last4: card.slice(-4),
                        expiry: expiry,
                        name: name,
                        subscribedAt: Date.now()
                    };
                    localStorage.setItem('humainize_users', JSON.stringify(users));
                }
            }

            // Success — redirect to app
            btn.innerHTML = '✓ Payment Successful!';
            btn.style.background = '#22C55E';
            setTimeout(() => {
                window.location.href = 'app-page.html';
            }, 1500);
        }, 2000);
    });

    // Get Started button
    if (btnGetStarted) {
        btnGetStarted.addEventListener('click', (e) => {
            e.preventDefault();
            if (user) {
                window.location.href = 'app-page.html';
            } else {
                const modal = document.getElementById('auth-modal');
                if (modal) modal.classList.add('active');
            }
        });
    }

})();
