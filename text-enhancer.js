/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Text Enhancement Layer v8
   
   ULTRA-MINIMAL: Only fixes spacing and critical punctuation.
   Does NOT add transitions, merge sentences, or change vocabulary.
   
   The humanizer itself handles all the heavy lifting for AI evasion.
   This layer just cleans up visual artifacts without modifying content.
   
   Academic vs Normal modes are preserved for future use but both
   run the same minimal pipeline to maintain 0% AI detection.
   
   DOES NOT MODIFY app.js — hooks via MutationObserver
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // MODE MANAGEMENT (preserved for UI, both use same pipeline)
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

    // ═══════════════════════════════════════════════════════════
    // 1. UNICODE SPACE NORMALIZER (the main fix)
    // The humanizer injects wide Unicode spaces (\u2000-\u200A)
    // which cause visible over-spacing. Normalize to regular spaces.
    // ═══════════════════════════════════════════════════════════

    function normalizeSpaces(text) {
        text = text.replace(/[\u2000-\u200A\u205F]/g, ' ');
        text = text.replace(/ {2,}/g, ' ');
        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 2. CRITICAL PUNCTUATION FIXES ONLY
    // Only fix obvious errors — don't add anything new.
    // ═══════════════════════════════════════════════════════════

    function fixCriticalPunctuation(text) {
        // Remove space before punctuation marks
        text = text.replace(/ ([.,;:!?])/g, '$1');

        // Add space after punctuation before uppercase letter
        text = text.replace(/([.,;:!?])([A-Z\u0410-\u042F])/g, '$1 $2');

        // Fix doubled periods (but not ellipsis)
        text = text.replace(/\.\.(?!\.)/g, '.');

        // Fix doubled commas
        text = text.replace(/,\s*,/g, ',');

        // Fix comma followed by period
        text = text.replace(/,\./g, '.');

        // Fix period/exclamation/question followed by comma
        text = text.replace(/([.!?]),/g, '$1');

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 3. CAPITALIZE AFTER SENTENCE ENDINGS
    // ═══════════════════════════════════════════════════════════

    function fixCapitalization(text) {
        // Capitalize first character
        if (text.length > 0 && /[a-z\u0430-\u044F]/.test(text.charAt(0))) {
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }

        // Capitalize after . ! ?
        text = text.replace(/([.!?])\s+([a-z\u0430-\u044F])/g, function (m, punct, letter) {
            return punct + ' ' + letter.toUpperCase();
        });

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // MAIN PIPELINE — Ultra-minimal
    // ═══════════════════════════════════════════════════════════

    function enhance(text) {
        if (!text || text.length < 20) return text;

        // Only 3 steps — nothing that adds content
        var result = normalizeSpaces(text);
        result = fixCriticalPunctuation(result);
        result = fixCapitalization(result);

        // Final space cleanup
        result = result.replace(/ {2,}/g, ' ');
        result = result.trim();

        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // MUTATION OBSERVER
    // ═══════════════════════════════════════════════════════════

    var outputEl = document.getElementById('text-output');
    if (!outputEl) return;

    var lastRawHTML = '';

    var observer = new MutationObserver(function () {
        if (outputEl.classList.contains('empty')) return;

        var textDiv = outputEl.querySelector('div[style*="pre-wrap"]');
        if (!textDiv) return;

        var currentHTML = textDiv.innerHTML;
        if (!currentHTML || currentHTML === lastRawHTML || currentHTML.length < 20) return;

        lastRawHTML = currentHTML;
        observer.disconnect();

        var enhanced = enhance(currentHTML);

        if (enhanced !== currentHTML) {
            textDiv.innerHTML = enhanced;
        }

        lastRawHTML = textDiv.innerHTML;
        observer.observe(outputEl, { childList: true, subtree: true, characterData: true });
    });

    observer.observe(outputEl, { childList: true, subtree: true, characterData: true });

})();
