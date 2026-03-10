/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Text Enhancement Layer v2
   Post-processing: grammar polish, linking words,
   sentence flow — WITHOUT modifying app.js
   
   CRITICAL: the humanizer uses invisible Unicode chars
   (zero-width spaces, look-alike Cyrillic letters, etc.)
   We must preserve those while enhancing grammar/flow.
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // LINKING WORDS & TRANSITIONS (natural, human-sounding)
    // ═══════════════════════════════════════════════════════════

    var TRANSITIONS = {
        addition: [
            'Also', 'Besides', 'Plus', 'On top of that', 'Along with this',
            'Not only that but', 'Another thing is'
        ],
        contrast: [
            'But', 'Still', 'Yet', 'Though', 'Even so',
            'That said', 'Then again', 'At the same time',
            'Having said that'
        ],
        cause: [
            'Because of this', 'Since', 'The reason is',
            'This happens because', 'One reason for this is',
            'Due to this'
        ],
        result: [
            'So', 'As a result', 'Because of that', 'This means',
            'This leads to', 'Which is why',
            'The outcome is', 'The effect is'
        ],
        example: [
            'For example', 'For instance', 'To illustrate',
            'Take this case', 'A good example is',
            'Say for example', 'You can see this when'
        ],
        emphasis: [
            'In fact', 'Actually', 'The truth is', 'Really',
            'What matters most is', 'The key thing here is',
            'The point is'
        ],
        summary: [
            'Overall', 'All in all', 'In short', 'To sum up',
            'The bottom line is', 'Putting it all together', 'In the end'
        ]
    };

    // Keywords that hint at what transition type to use
    var SENTENCE_HINTS = {
        addition: ['also', 'another', 'additional', 'more', 'further', 'other'],
        contrast: ['but', 'however', 'although', 'despite', 'unlike', 'different', 'challenge', 'struggle'],
        cause: ['because', 'since', 'due', 'reason', 'cause', 'factor'],
        result: ['result', 'effect', 'outcome', 'impact', 'lead', 'thus'],
        example: ['example', 'instance', 'case', 'such as', 'illustrate']
    };

    function classifySentence(sentence) {
        var lower = sentence.toLowerCase();
        for (var type in SENTENCE_HINTS) {
            var hints = SENTENCE_HINTS[type];
            for (var k = 0; k < hints.length; k++) {
                if (lower.indexOf(hints[k]) !== -1) return type;
            }
        }
        return null;
    }

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function pickTransition(type) {
        if (!type || !TRANSITIONS[type]) {
            return pickRandom(['Also', 'In addition', 'Besides this', 'On top of that', 'Plus']);
        }
        return pickRandom(TRANSITIONS[type]);
    }

    // ═══════════════════════════════════════════════════════════
    // GRAMMAR ENHANCEMENT
    // Works on the cleaned visible text only
    // ═══════════════════════════════════════════════════════════

    function fixGrammar(text) {
        // Double/triple spaces -> single space (but careful with Unicode)
        text = text.replace(/(\s){3,}/g, ' ');

        // Double periods
        text = text.replace(/\.\.(?!\.)/g, '.');

        // Space before punctuation
        text = text.replace(/ ([.,;:!?])/g, '$1');

        // Missing space after sentence-ending punctuation before uppercase
        text = text.replace(/([.!?])([A-Z])/g, '$1 $2');

        // Fix "a" before vowel sounds (only clear cases)
        text = text.replace(/\ba (a[bcdfghjklmnpqrstvwxyz])/gi, 'an $1');
        text = text.replace(/\ba (e[bcdfghjklmnpqrstvwxyz])/gi, 'an $1');
        text = text.replace(/\ba (i[bcdfghjklmnpqrstvwxyz])/gi, 'an $1');
        text = text.replace(/\ba (o[bcdfghjklmnpqrstvwxyz])/gi, 'an $1');
        text = text.replace(/\ba (u[bcdfghjklmnpqrstvwxyz])/gi, 'an $1');

        // Capitalize first letter of text
        if (text.length > 0 && /[a-z]/.test(text.charAt(0))) {
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }

        // Fix multiple commas
        text = text.replace(/,\s*,/g, ',');

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // LINKING WORD INJECTION
    // Only works on sentence boundaries — preserves everything else
    // ═══════════════════════════════════════════════════════════

    var ALREADY_HAS_TRANSITION = /^(however|but|yet|still|also|moreover|furthermore|in addition|besides|therefore|thus|consequently|for example|for instance|in fact|actually|though|meanwhile|nonetheless|nevertheless|on the other hand|similarly|likewise|as a result|in contrast|so|and|then|after|while|although|even though|that said|plus|on top of that|overall|all in all|to sum up|because|since|due to|the reason)/i;

    function addTransitions(text) {
        // Split on sentence-ending punctuation followed by space
        var parts = text.split(/(?<=[.!?])\s+/);
        if (parts.length < 3) return text;

        var result = [parts[0]];
        var added = 0;
        var maxAdd = Math.max(1, Math.floor(parts.length * 0.2)); // up to 20%

        for (var i = 1; i < parts.length; i++) {
            var s = parts[i];
            if (!s || s.length < 20) {
                result.push(s);
                continue;
            }

            // Don't add if already has a transition
            if (ALREADY_HAS_TRANSITION.test(s)) {
                result.push(s);
                continue;
            }

            // Probabilistic — ~30% chance, capped by maxAdd
            if (added < maxAdd && Math.random() < 0.30 && s.length > 30) {
                var type = classifySentence(s);
                var transition = pickTransition(type);

                // Lowercase the first char of the sentence
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
    // MAIN PIPELINE
    // ═══════════════════════════════════════════════════════════

    function enhance(text) {
        if (!text || text.length < 30) return text;
        var result = fixGrammar(text);
        result = addTransitions(result);
        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // MUTATION OBSERVER — Hook into app.js output
    // We read innerHTML, extract the text div, enhance text,
    // and write back preserving the HTML structure
    // ═══════════════════════════════════════════════════════════

    var outputEl = document.getElementById('text-output');
    if (!outputEl) return;

    var lastRawHTML = '';

    var observer = new MutationObserver(function () {
        // Don't process empty states
        if (outputEl.classList.contains('empty')) return;

        // Find the text content div
        var textDiv = outputEl.querySelector('div[style*="pre-wrap"]');
        if (!textDiv) return;

        var currentHTML = textDiv.innerHTML;

        // Avoid re-processing the same content
        if (!currentHTML || currentHTML === lastRawHTML || currentHTML.length < 30) return;

        lastRawHTML = currentHTML;

        // Disconnect to prevent loop
        observer.disconnect();

        // The innerHTML is the escaped text with invisible Unicode chars
        // We enhance it directly — the Unicode chars are part of the char stream
        // and our regex-based fixes work on them without issue
        var enhanced = enhance(currentHTML);

        if (enhanced !== currentHTML) {
            textDiv.innerHTML = enhanced;
        }

        lastRawHTML = textDiv.innerHTML;

        // Reconnect
        observer.observe(outputEl, { childList: true, subtree: true, characterData: true });
    });

    observer.observe(outputEl, { childList: true, subtree: true, characterData: true });

})();
