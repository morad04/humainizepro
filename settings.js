/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Settings Page Logic
   Handles: profile display, password change, subscription
   management, payment info, logout, delete account
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    function getUser() {
        try { return JSON.parse(localStorage.getItem('humainize_user')); }
        catch { return null; }
    }
    function setUser(u) { localStorage.setItem('humainize_user', JSON.stringify(u)); }
    function getUsers() { return JSON.parse(localStorage.getItem('humainize_users') || '{}'); }
    function setUsers(u) { localStorage.setItem('humainize_users', JSON.stringify(u)); }

    const user = getUser();

    // Auth guard
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const users = getUsers();
    const userData = users[user.email] || {};
    const isPro = user.plan === 'pro';

    // ─── Profile ───
    document.getElementById('settings-email').textContent = user.email;
    document.getElementById('settings-created').textContent = userData.createdAt
        ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    // ─── Subscription ───
    const planBadge = document.getElementById('settings-plan-badge');
    if (isPro) {
        planBadge.textContent = 'Pro';
        planBadge.className = 'plan-badge plan-badge-pro';
        document.getElementById('settings-words-used').textContent = 'Unlimited';
        document.getElementById('settings-daily-limit').textContent = 'Unlimited';
        document.getElementById('settings-upgrade-row').style.display = 'none';
        document.getElementById('settings-cancel-row').style.display = 'flex';
    } else {
        planBadge.textContent = 'Free';
        planBadge.className = 'plan-badge plan-badge-free';
        const wordsUsed = user.wordsUsed || 0;
        document.getElementById('settings-words-used').textContent = wordsUsed + ' / 500';
        document.getElementById('settings-daily-limit').textContent = '500 words';
    }

    // ─── Payment Info ───
    if (userData.payment) {
        document.getElementById('settings-payment-method').innerHTML =
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> •••• ' + userData.payment.last4;
        document.getElementById('settings-payment-name-row').style.display = 'flex';
        document.getElementById('settings-payment-name').textContent = userData.payment.name;
        document.getElementById('settings-payment-expiry-row').style.display = 'flex';
        document.getElementById('settings-payment-expiry').textContent = userData.payment.expiry;
        document.getElementById('settings-billing-actions').innerHTML =
            '<button class="btn-sm" id="btn-update-card">Update Card</button>';
        document.getElementById('btn-update-card').addEventListener('click', () => {
            window.location.href = 'pricing.html';
        });
    }

    // ─── Password Change ───
    const btnChangePassword = document.getElementById('btn-change-password');
    const passwordContainer = document.getElementById('password-form-container');
    const passwordForm = document.getElementById('password-form');
    const btnCancelPassword = document.getElementById('btn-cancel-password');

    btnChangePassword.addEventListener('click', () => {
        passwordContainer.style.display = 'block';
        btnChangePassword.style.display = 'none';
    });

    btnCancelPassword.addEventListener('click', () => {
        passwordContainer.style.display = 'none';
        btnChangePassword.style.display = '';
        passwordForm.reset();
    });

    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPw = document.getElementById('current-password').value;
        const newPw = document.getElementById('new-password').value;

        // Verify current password
        if (userData.password && atob(userData.password) !== currentPw) {
            showToast('Current password is incorrect.');
            return;
        }

        // Update password
        const allUsers = getUsers();
        if (allUsers[user.email]) {
            allUsers[user.email].password = btoa(newPw);
            setUsers(allUsers);
        }

        passwordContainer.style.display = 'none';
        btnChangePassword.style.display = '';
        passwordForm.reset();
        showToast('Password updated successfully!');
    });

    // ─── Cancel Subscription ───
    const btnCancelSub = document.getElementById('btn-cancel-sub');
    if (btnCancelSub) {
        btnCancelSub.addEventListener('click', () => {
            if (!confirm('Are you sure you want to cancel your Pro subscription? You will revert to the Free plan.')) return;

            user.plan = 'free';
            setUser(user);
            const allUsers = getUsers();
            if (allUsers[user.email]) {
                allUsers[user.email].plan = 'free';
                setUsers(allUsers);
            }
            showToast('Subscription cancelled. You are now on the Free plan.');
            setTimeout(() => window.location.reload(), 1500);
        });
    }

    // ─── Logout ───
    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('humainize_user');
        window.location.href = 'index.html';
    });

    // ─── Delete Account ───
    document.getElementById('btn-delete-account').addEventListener('click', () => {
        if (!confirm('Are you sure? This will permanently delete your account and all data. This action cannot be undone.')) return;

        const allUsers = getUsers();
        delete allUsers[user.email];
        setUsers(allUsers);
        localStorage.removeItem('humainize_user');
        showToast('Account deleted.');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    });

    // ─── Toast ───
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

})();
