/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Text Enhancement Layer v3
   
   Smart post-processing that runs AFTER app.js humanizer:
   1. Normalizes over-wide Unicode spaces back to regular spaces
   2. Smart punctuation: commas, periods, semicolons
   3. Grammar polish: a/an, capitalization, repeated words
   4. Natural linking words between sentences
   5. Sentence variety: merge short choppy sentences
   6. Final cleanup pass
   
   DOES NOT MODIFY app.js — hooks via MutationObserver
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // 1. UNICODE SPACE NORMALIZER
    // The humanizer replaces regular spaces with various-width
    // Unicode spaces (en space, em space, etc.) which look over-spaced.
    // We normalize them back to regular spaces for clean output.
    // We keep zero-width chars (200B-200D, FEFF) and homoglyphs untouched.
    // ═══════════════════════════════════════════════════════════

    function normalizeSpaces(text) {
        // Replace all Unicode space variants with regular space
        // \u2000 = en quad, \u2001 = em quad, \u2002 = en space,
        // \u2003 = em space, \u2004 = 3-per-em, \u2005 = 4-per-em,
        // \u2006 = 6-per-em, \u2007 = figure space, \u2008 = punctuation space,
        // \u2009 = thin space, \u200A = hair space, \u205F = medium math space
        text = text.replace(/[\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u205F]/g, ' ');

        // Collapse multiple regular spaces into one (but not zero-width chars)
        text = text.replace(/ {2,}/g, ' ');

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 2. SMART PUNCTUATION ENGINE
    // Knows when to use commas, periods, semicolons naturally
    // ═══════════════════════════════════════════════════════════

    function fixPunctuation(text) {
        // --- Comma rules ---

        // Add comma after introductory phrases (common in human writing)
        var introductoryPhrases = [
            'however', 'therefore', 'meanwhile', 'furthermore',
            'nonetheless', 'nevertheless', 'similarly', 'additionally',
            'consequently', 'subsequently', 'unfortunately', 'fortunately',
            'interestingly', 'surprisingly', 'importantly', 'obviously',
            'clearly', 'naturally', 'personally', 'honestly',
            'in fact', 'of course', 'for example', 'for instance',
            'on the other hand', 'as a result', 'in other words',
            'in addition', 'after all', 'above all', 'in particular',
            'to be fair', 'in general', 'at first', 'over time',
            'in the end', 'at the same time', 'on top of that',
            'because of this', 'due to this'
        ];

        for (var i = 0; i < introductoryPhrases.length; i++) {
            var phrase = introductoryPhrases[i];
            // Match phrase at start of sentence (after period+space or start of text)
            // Only add comma if not already followed by one
            var regex = new RegExp('(^|[.!?]\\s+)(' + phrase + ')\\s+(?!,)', 'gi');
            text = text.replace(regex, function (m, before, word) {
                return before + word + ', ';
            });
        }

        // Add comma before coordinating conjunctions joining independent clauses
        // (but, and, so, yet, or, nor — when connecting two complete thoughts)
        text = text.replace(/([a-z\u0430-\u044F]{3,})\s+(but|yet)\s+([a-z\u0430-\u044F])/gi, function (m, before, conj, after) {
            return before + ', ' + conj + ' ' + after;
        });

        // --- Fix common punctuation errors ---

        // Space before punctuation (remove it)
        text = text.replace(/ ([.,;:!?])/g, '$1');

        // Missing space after punctuation
        text = text.replace(/([.,;:!?])([A-Z\u0410-\u042F])/g, '$1 $2');
        text = text.replace(/([.,;:!?])([a-z\u0430-\u044F])/g, function (m, punct, letter) {
            // Don't add space inside abbreviations like "e.g." or numbers like "3.5"
            if (punct === '.' && /\d/.test(m.charAt(m.length - 2))) return m;
            return punct + ' ' + letter;
        });

        // Double periods
        text = text.replace(/\.\.(?!\.)/g, '.');

        // Multiple commas
        text = text.replace(/,\s*,/g, ',');

        // Comma before period
        text = text.replace(/,\./g, '.');

        // Fix ".,", ",," etc.
        text = text.replace(/([.!?]),/g, '$1');

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 3. GRAMMAR ENGINE
    // Handles articles, capitalization, subject-verb patterns
    // ═══════════════════════════════════════════════════════════

    function fixGrammar(text) {
        // Capitalize first letter of text
        if (text.length > 0 && /[a-z\u0430-\u044F]/.test(text.charAt(0))) {
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }

        // Capitalize after sentence endings
        text = text.replace(/([.!?])\s+([a-z\u0430-\u044F])/g, function (m, punct, letter) {
            return punct + ' ' + letter.toUpperCase();
        });

        // Fix "a" before vowel sounds -> "an" (only clear simple cases)
        text = text.replace(/\ba\s+(a(?:cademic|ctive|ctual|dult|ffect|gree|lter|mazin|nother|pproach|rticle|ssess|ttempt|ware))/gi, 'an $1');
        text = text.replace(/\ba\s+(e(?:arly|ffect|ffort|lement|motion|nglish|nviron|ssential|stimate|vent|vening|xample|xercise|xperi))/gi, 'an $1');
        text = text.replace(/\ba\s+(i(?:dea|mage|mpact|mport|ncrease|ndivid|nfluence|nstance|nterest|nterview|nvest|ssue|tem))/gi, 'an $1');
        text = text.replace(/\ba\s+(o(?:bject|bserv|bstacle|ccasion|ffer|lder|pen|pinion|pportun|ption|rder|rganiz|ther|utcome|utline|verview))/gi, 'an $1');
        text = text.replace(/\ba\s+(u(?:ltimate|nderstand|nfair|niqu|niversit|nusual|pdate|rban))/gi, 'an $1');

        // Fix doubled words (the the, is is, etc.)
        text = text.replace(/\b(\w{2,})\s+\1\b/gi, '$1');

        // Fix orphaned punctuation
        text = text.replace(/^\s*[,;:]\s*/gm, '');

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 4. LINKING WORDS & TRANSITIONS
    // Adds natural human transitions between sentences
    // ═══════════════════════════════════════════════════════════

    var TRANSITIONS = {
        addition: ['Also', 'Besides', 'Plus', 'On top of that', 'Along with this', 'Not only that but', 'Another thing is'],
        contrast: ['But', 'Still', 'Yet', 'Though', 'Even so', 'That said', 'Then again', 'At the same time', 'Having said that'],
        cause: ['Because of this', 'Since', 'The reason is', 'This happens because', 'One reason for this is', 'Due to this'],
        result: ['So', 'As a result', 'Because of that', 'This means', 'This leads to', 'Which is why', 'The effect is'],
        example: ['For example', 'For instance', 'To illustrate', 'Take this case', 'A good example is', 'You can see this when'],
        emphasis: ['In fact', 'Actually', 'The truth is', 'Really', 'What matters most is', 'The key thing here is', 'The point is'],
        summary: ['Overall', 'All in all', 'In short', 'To sum up', 'The bottom line is', 'In the end']
    };

    var SENTENCE_HINTS = {
        addition: ['also', 'another', 'additional', 'more', 'further', 'other'],
        contrast: ['but', 'however', 'although', 'despite', 'unlike', 'different', 'challenge', 'struggle', 'difficult', 'hard'],
        cause: ['because', 'since', 'due', 'reason', 'cause', 'factor', 'stem'],
        result: ['result', 'effect', 'outcome', 'impact', 'lead', 'thus', 'mean'],
        example: ['example', 'instance', 'case', 'such as', 'illustrate', 'show']
    };

    var HAS_TRANSITION = /^(however|but|yet|still|also|moreover|furthermore|in addition|besides|therefore|thus|consequently|for example|for instance|in fact|actually|though|meanwhile|nonetheless|nevertheless|on the other hand|similarly|likewise|as a result|in contrast|so|and|then|after|while|although|even though|that said|plus|on top of that|overall|all in all|to sum up|because|since|due to|the reason|not only|along with|besides this|the point|which is why|as a matter|in other words|to be fair|at the same time|having said|the truth is|the key)/i;

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

    function addTransitions(text) {
        var parts = text.split(/(?<=[.!?])\s+/);
        if (parts.length < 3) return text;

        var result = [parts[0]];
        var added = 0;
        var maxAdd = Math.max(1, Math.floor(parts.length * 0.2));

        for (var i = 1; i < parts.length; i++) {
            var s = parts[i];
            if (!s || s.length < 15) { result.push(s); continue; }
            if (HAS_TRANSITION.test(s)) { result.push(s); continue; }

            // ~25% chance, only substantial sentences
            if (added < maxAdd && Math.random() < 0.25 && s.length > 30) {
                var type = classifySentence(s);
                var transType = type || 'addition';
                var transition = pickRandom(TRANSITIONS[transType]);
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
    // 5. SENTENCE VARIETY
    // Merge short choppy sentences, vary rhythm
    // ═══════════════════════════════════════════════════════════

    function improveSentenceVariety(text) {
        var parts = text.split(/(?<=[.!?])\s+/);
        if (parts.length < 3) return text;

        var result = [];
        var i = 0;

        while (i < parts.length) {
            var current = parts[i];
            if (!current) { i++; continue; }

            var words = current.split(/\s+/).length;

            // If this sentence and the next are both short (< 8 words), merge them
            if (words < 8 && i + 1 < parts.length) {
                var next = parts[i + 1];
                var nextWords = next ? next.split(/\s+/).length : 0;

                if (nextWords > 0 && nextWords < 8 && Math.random() < 0.4) {
                    // Pick a connector based on content
                    var connectors = [', and ', ', which ', ' — ', '; '];
                    var connector = pickRandom(connectors);

                    // Remove trailing period from current
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
    // 6. NATURAL COMMA INSERTION
    // Add commas where natural speech pauses occur
    // ═══════════════════════════════════════════════════════════

    function addNaturalCommas(text) {
        // Before "which" (non-restrictive clauses)
        text = text.replace(/(\w)\s+which\s+/gi, function (m, before) {
            if (before === ',') return m;
            return before + ', which ';
        });

        // Before "where" when used as a relative clause
        text = text.replace(/(\w)\s+where\s+((?:the|a|an|this|that|these|those|their|its|our|my|your)\s)/gi, function (m, before, rest) {
            return before + ', where ' + rest;
        });

        // After long introductory phrases (5+ words before main clause)
        // This is tricky — just catch common patterns
        text = text.replace(/((?:When|While|If|Although|Because|Since|Before|After|As|Unless|Until|Once)\s+[^,]{15,50}?)\s+(the|a|an|this|they|we|he|she|it|I|you)\s/gi,
            function (m, intro, subject) {
                if (intro.indexOf(',') !== -1) return m; // Already has comma
                return intro + ', ' + subject + ' ';
            }
        );

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // MAIN PIPELINE
    // ═══════════════════════════════════════════════════════════

    function enhance(text) {
        if (!text || text.length < 30) return text;

        // Step 1: Fix the over-spacing FIRST
        var result = normalizeSpaces(text);

        // Step 2: Smart punctuation
        result = fixPunctuation(result);

        // Step 3: Grammar
        result = fixGrammar(result);

        // Step 4: Add natural commas
        result = addNaturalCommas(result);

        // Step 5: Sentence variety (merge choppy sentences)
        result = improveSentenceVariety(result);

        // Step 6: Linking words/transitions
        result = addTransitions(result);

        // Step 7: Final cleanup
        result = result.replace(/ {2,}/g, ' ');
        result = result.replace(/^\s+/gm, '');
        result = result.trim();

        return result;
    }

    // ═══════════════════════════════════════════════════════════
    // MUTATION OBSERVER — Hook into app.js output
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
