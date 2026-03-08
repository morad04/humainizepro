/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — App Auth & Word Limit Logic
   Handles: auth guard, word limit enforcement, UI updates
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    const FREE_WORD_LIMIT = 500;

    // ─── Auth Guard ───
    function getUser() {
        try {
            return JSON.parse(localStorage.getItem('humainize_user'));
        } catch { return null; }
    }

    function setUser(user) {
        localStorage.setItem('humainize_user', JSON.stringify(user));
    }

    const user = getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // ─── Daily Reset Check ───
    const today = new Date().toDateString();
    if (user.lastReset !== today) {
        user.wordsUsed = 0;
        user.lastReset = today;
        setUser(user);
    }

    const isPro = user.plan === 'pro';

    // ─── Update UI ───
    function updateUsageUI() {
        const wordsRemaining = Math.max(0, FREE_WORD_LIMIT - user.wordsUsed);
        const usagePct = Math.min(100, (user.wordsUsed / FREE_WORD_LIMIT) * 100);

        // Usage badge
        const badge = document.getElementById('usage-badge');
        const barContainer = document.getElementById('usage-bar-container');

        if (isPro) {
            badge.textContent = '∞ Unlimited';
            badge.className = 'usage-badge pro';
            barContainer.classList.add('hidden');
        } else {
            document.getElementById('words-remaining').textContent = wordsRemaining;
            if (wordsRemaining <= 0) {
                badge.className = 'usage-badge empty';
            } else if (wordsRemaining <= 100) {
                badge.className = 'usage-badge low';
            } else {
                badge.className = 'usage-badge';
            }

            // Usage bar
            const fill = document.getElementById('usage-bar-fill');
            fill.style.width = usagePct + '%';
            fill.className = 'usage-bar-fill';
            if (usagePct >= 90) fill.classList.add('danger');
            else if (usagePct >= 70) fill.classList.add('warning');

            document.getElementById('usage-bar-text').textContent =
                `${user.wordsUsed} / ${FREE_WORD_LIMIT} words used today`;
        }

        // User avatar / dropdown
        const initial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
        document.getElementById('user-initial').textContent = initial;
        document.getElementById('dropdown-email').textContent = user.email || 'Guest';
        document.getElementById('dropdown-plan').textContent = isPro ? 'Pro Plan' : 'Free Plan';

        // Hide upgrade button for pro users
        const upgradeBtn = document.getElementById('btn-upgrade-dropdown');
        if (isPro && upgradeBtn) upgradeBtn.style.display = 'none';
    }

    updateUsageUI();

    // ─── User Menu Toggle ───
    const avatar = document.getElementById('user-avatar');
    const dropdown = document.getElementById('user-dropdown');

    avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('open');
    });

    // ─── Logout ───
    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('humainize_user');
        window.location.href = 'index.html';
    });

    // ─── Upgrade Modal ───
    const upgradeModal = document.getElementById('upgrade-modal');
    const upgradeClose = document.getElementById('upgrade-close');

    function showUpgradeModal() {
        upgradeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function hideUpgradeModal() {
        upgradeModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    upgradeClose.addEventListener('click', hideUpgradeModal);
    upgradeModal.addEventListener('click', (e) => {
        if (e.target === upgradeModal) hideUpgradeModal();
    });

    // Upgrade buttons — redirect to pricing page (must pay)
    const upgradeNow = document.getElementById('btn-upgrade-now');
    const upgradeDropdown = document.getElementById('btn-upgrade-dropdown');

    function handleUpgrade() {
        // Redirect to pricing page — user must pay to upgrade
        window.location.href = 'index.html#pricing';
    }

    upgradeNow.addEventListener('click', handleUpgrade);
    if (upgradeDropdown) upgradeDropdown.addEventListener('click', handleUpgrade);

    // ─── Word Limit Check — Hook into Humanize Button ───
    const humanizeBtn = document.getElementById('btn-humanize');
    const textInput = document.getElementById('text-input');
    const originalClick = humanizeBtn.onclick;

    // Intercept the humanize click
    humanizeBtn.addEventListener('click', function interceptor(e) {
        if (isPro) return; // Pro users bypass

        const text = textInput.value.trim();
        if (!text) return;

        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

        if (user.wordsUsed + wordCount > FREE_WORD_LIMIT) {
            e.stopImmediatePropagation();
            e.preventDefault();
            showUpgradeModal();
            return false;
        }

        // Track usage after successful humanization
        user.wordsUsed += wordCount;
        setUser(user);
        updateUsageUI();
    }, true); // Capture phase = runs BEFORE app.js handler

    // ─── Toast ───
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

})();
