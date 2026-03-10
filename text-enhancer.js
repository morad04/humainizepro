/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Text Enhancement Layer v9
   
   PASS-THROUGH: Does NOT modify humanizer output at all.
   The humanizer's Unicode spaces, zero-width chars, and homoglyphs
   are ALL part of its AI evasion strategy — do not touch them.
   
   This layer only manages the Academic/Normal mode toggle UI.
   
   DOES NOT MODIFY app.js — hooks via MutationObserver
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // MODE MANAGEMENT (UI toggle only)
    // ═══════════════════════════════════════════════════════════

    var currentMode = 'academic';

    var academicBtn = document.getElementById('mode-academic');
    var normalBtn = document.getElementById('mode-normal');

    if (academicBtn && normalBtn) {
        academicBtn.addEventListener('click', function () {
            currentMode = 'academic';
            academicBtn.classList.add('active');
            normalBtn.classList.remove('active');
        });
        normalBtn.addEventListener('click', function () {
            currentMode = 'normal';
            normalBtn.classList.add('active');
            academicBtn.classList.remove('active');
        });
    }

    // Mode is stored globally so app.js can read it if needed
    window.__humainizeMode = function () {
        return currentMode;
    };

})();
