/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Text Enhancement Layer v7
   
   Two modes: ACADEMIC and NORMAL
   Philosophy: NEVER restore vocabulary that the humanizer changed.
   The humanizer's casual replacements are what give us 0% AI detection.
   
   Academic mode = grammar polish + clean punctuation + minimal natural transitions
   Normal mode  = grammar polish + casual transitions
   
   Both modes preserve the humanizer's AI-evasion vocabulary intact.
   
   DOES NOT MODIFY app.js — hooks via MutationObserver
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // MODE MANAGEMENT
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
    // 1. UNICODE SPACE NORMALIZER
    // ═══════════════════════════════════════════════════════════

    function normalizeSpaces(text) {
        text = text.replace(/[\u2000-\u200A\u205F]/g, ' ');
        text = text.replace(/ {2,}/g, ' ');
        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 2. SMART PUNCTUATION
    // ═══════════════════════════════════════════════════════════

    function fixPunctuation(text) {
        // Comma after introductory words/phrases
        var introductory = [
            'however', 'therefore', 'meanwhile', 'furthermore',
            'nonetheless', 'nevertheless', 'similarly', 'additionally',
            'consequently', 'subsequently', 'moreover', 'accordingly',
            'conversely', 'notably', 'indeed',
            'unfortunately', 'fortunately', 'importantly',
            'clearly', 'naturally',
            'in fact', 'of course', 'for example', 'for instance',
            'on the other hand', 'as a result', 'in other words',
            'in addition', 'after all', 'in particular',
            'to be fair', 'in general', 'at first', 'over time',
            'at the same time', 'on top of that',
            'because of this', 'in contrast',
            'that said', 'even so', 'still', 'granted',
            'along with this', 'beyond that'
        ];

        for (var i = 0; i < introductory.length; i++) {
            var phrase = introductory[i];
            var regex = new RegExp('(^|[.!?]\\s+)(' + phrase + ')\\s+(?!,)', 'gi');
            text = text.replace(regex, function (m, before, word) {
                return before + word + ', ';
            });
        }

        // Comma before "but/yet" between clauses
        text = text.replace(/([a-z\u0430-\u044F]{3,})\s+(but|yet)\s+([a-z\u0430-\u044F])/gi, function (m, before, conj, after) {
            return before + ', ' + conj + ' ' + after;
        });

        // Clean up punctuation errors
        text = text.replace(/ ([.,;:!?])/g, '$1');
        text = text.replace(/([.,;:!?])([A-Z\u0410-\u042F])/g, '$1 $2');
        text = text.replace(/\.\.(?!\.)/g, '.');
        text = text.replace(/,\s*,/g, ',');
        text = text.replace(/,\./g, '.');
        text = text.replace(/([.!?]),/g, '$1');

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 3. GRAMMAR
    // ═══════════════════════════════════════════════════════════

    function fixGrammar(text) {
        // Capitalize first letter
        if (text.length > 0 && /[a-z\u0430-\u044F]/.test(text.charAt(0))) {
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }

        // Capitalize after sentence endings
        text = text.replace(/([.!?])\s+([a-z\u0430-\u044F])/g, function (m, punct, letter) {
            return punct + ' ' + letter.toUpperCase();
        });

        // a/an corrections
        text = text.replace(/\ba\s+(a(?:cademic|ctive|ctual|dult|ffect|gree|nother|pproach|rticle|ssess|ttempt|ware))/gi, 'an $1');
        text = text.replace(/\ba\s+(e(?:arly|ffect|ffort|lement|motion|nglish|nviron|ssential|stimate|vent|xample|xercise|xperi))/gi, 'an $1');
        text = text.replace(/\ba\s+(i(?:dea|mage|mpact|mport|ncrease|ndivid|nfluence|nstance|nterest|nterview|nvest|ssue|tem))/gi, 'an $1');
        text = text.replace(/\ba\s+(o(?:bject|bserv|bstacle|ccasion|ffer|lder|pen|pinion|pportun|ption|rder|rganiz|ther|utcome|utline|verview))/gi, 'an $1');
        text = text.replace(/\ba\s+(u(?:ltimate|nderstand|nfair|niqu|niversit|nusual|pdate|rban))/gi, 'an $1');

        // Remove doubled words
        text = text.replace(/\b(\w{2,})\s+\1\b/gi, '$1');

        // Clean orphaned punctuation at start of lines
        text = text.replace(/^\s*[,;:]\s*/gm, '');

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 4. NATURAL COMMAS
    // ═══════════════════════════════════════════════════════════

    function addNaturalCommas(text) {
        // Comma before "which" (non-restrictive)
        text = text.replace(/(\w)\s+which\s+/gi, function (m, before) {
            if (before === ',') return m;
            return before + ', which ';
        });

        // Comma before "where" in relative clauses
        text = text.replace(/(\w)\s+where\s+((?:the|a|an|this|that|these|those|their|its|our|my|your)\s)/gi, function (m, before, rest) {
            return before + ', where ' + rest;
        });

        // Comma after long introductory subordinate clauses
        text = text.replace(/((?:When|While|If|Although|Because|Since|Before|After|As|Unless|Until|Once)\s+[^,]{15,50}?)\s+(the|a|an|this|they|we|he|she|it|I|you)\s/gi,
            function (m, intro, subject) {
                if (intro.indexOf(',') !== -1) return m;
                return intro + ', ' + subject + ' ';
            }
        );

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 5. MINIMAL TRANSITIONS
    // Very low injection rate. Only human-sounding ones.
    // Academic uses slightly more formal connectors.
    // ═══════════════════════════════════════════════════════════

    // Transitions that sound natural and human — NOT robotic AI patterns
    var ACADEMIC_TRANSITIONS = [
        'That said', 'Still', 'Even so', 'At the same time',
        'Beyond that', 'Along with this', 'On top of that'
    ];

    var NORMAL_TRANSITIONS = [
        'Plus', 'Also', 'Besides', 'Still',
        'That said', 'Even so', 'On top of that'
    ];

    var HAS_TRANSITION = /^(however|but|yet|still|also|moreover|furthermore|in addition|besides|therefore|thus|consequently|for example|for instance|in fact|actually|though|meanwhile|nonetheless|nevertheless|on the other hand|similarly|likewise|as a result|in contrast|so|and|then|after|while|although|even though|that said|plus|on top of that|overall|because|since|due to|along with|in other words|at the same time|the truth is|additionally|even so|beyond that|granted|besides this)/i;

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function addTransitions(text) {
        var transitions = currentMode === 'academic' ? ACADEMIC_TRANSITIONS : NORMAL_TRANSITIONS;
        var parts = text.split(/(?<=[.!?])\s+/);
        if (parts.length < 4) return text;

        var result = [parts[0]];
        var added = 0;
        // Very conservative: max 1 transition per ~6 sentences
        var maxAdd = Math.max(1, Math.floor(parts.length / 6));

        for (var i = 1; i < parts.length; i++) {
            var s = parts[i];
            if (!s || s.length < 20) { result.push(s); continue; }
            if (HAS_TRANSITION.test(s)) { result.push(s); continue; }

            // Only ~15% chance, and only for longer sentences
            if (added < maxAdd && Math.random() < 0.15 && s.length > 40) {
                var transition = pickRandom(transitions);
                var lowered = s.charAt(0).toLowerCase() + s.slice(1);
                result.push(transition + ', ' + lowered);
                added++;
            } else {
                result.push(s);
            }
        }

        return result.join(' ');
    }

    // ═══════════════════════════════════════════════════════════
    // 6. SENTENCE VARIETY (merge choppy sentences)
    // ═══════════════════════════════════════════════════════════

    function improveSentenceVariety(text) {
        var parts = text.split(/(?<=[.!?])\s+/);
        if (parts.length < 4) return text;

        var result = [];
        var i = 0;

        while (i < parts.length) {
            var current = parts[i];
            if (!current) { i++; continue; }

            var words = current.split(/\s+/).length;

            // Only merge very short sentences
            if (words < 6 && i + 1 < parts.length) {
                var next = parts[i + 1];
                var nextWords = next ? next.split(/\s+/).length : 0;

                if (nextWords > 0 && nextWords < 6 && Math.random() < 0.35) {
                    var connectors = [', and ', '; '];
                    var connector = pickRandom(connectors);
                    var merged = current.replace(/[.]\s*$/, '') + connector + next.charAt(0).toLowerCase() + next.slice(1);
                    result.push(merged);
                    i += 2;
                    continue;
                }
            }

            result.push(current);
            i++;
        }

        return result.join(' ');
    }

    // ═══════════════════════════════════════════════════════════
    // MAIN PIPELINE
    // ═══════════════════════════════════════════════════════════

    function enhance(text) {
        if (!text || text.length < 30) return text;

        // Step 1: Fix over-spacing (critical)
        var result = normalizeSpaces(text);

        // Step 2: Punctuation cleanup
        result = fixPunctuation(result);

        // Step 3: Grammar fixes
        result = fixGrammar(result);

        // Step 4: Natural commas
        result = addNaturalCommas(result);

        // Step 5: Sentence variety (merge choppy)
        result = improveSentenceVariety(result);

        // Step 6: Minimal transitions
        result = addTransitions(result);

        // Step 7: Final cleanup
        result = result.replace(/ {2,}/g, ' ');
        result = result.replace(/^\s+/gm, '');
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
        if (!currentHTML || currentHTML === lastRawHTML || currentHTML.length < 30) return;

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
