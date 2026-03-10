/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Text Enhancement Layer
   Post-processing: grammar polish, linking words,
   sentence flow — WITHOUT modifying app.js
   Uses MutationObserver to intercept humanized output
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // LINKING WORDS & TRANSITIONS
    // Natural human transitions grouped by function
    // ═══════════════════════════════════════════════════════════

    const TRANSITIONS = {
        addition: [
            'also', 'besides', 'plus', 'on top of that', 'along with this',
            'not only that but', "what's more", "and then there's the fact that",
            'another thing is', "it's also worth adding that"
        ],
        contrast: [
            'but', 'still', 'yet', 'though', 'even so', 'all the same',
            'that said', 'on the other hand', 'then again', 'at the same time',
            'mind you', 'having said that', 'even though'
        ],
        cause: [
            'because of this', 'since', 'the reason is', 'this is mainly because',
            'this happens because', 'one reason for this is', 'due to this',
            'thanks to this', 'what causes this is'
        ],
        result: [
            'so', 'as a result', 'because of that', 'this means',
            'this leads to', 'which is why', "and that's why",
            'the outcome is', 'this ends up causing', 'the effect is'
        ],
        example: [
            'for example', 'for instance', 'to illustrate',
            'take this case', 'a good example is', 'to give you an idea',
            'say for example', 'one case of this is', 'you can see this when'
        ],
        emphasis: [
            'in fact', 'actually', 'the truth is', 'really',
            'what matters most is', 'the key thing here is',
            "it's important to realize", 'the point is'
        ],
        summary: [
            'overall', 'all in all', 'in short', 'to sum up',
            'the bottom line is', 'when you look at the big picture',
            'putting it all together', 'in the end'
        ]
    };

    // ═══════════════════════════════════════════════════════════
    // GRAMMAR FIXES
    // Common grammar issues that appear after humanization
    // ═══════════════════════════════════════════════════════════

    const GRAMMAR_FIXES = [
        // Double spaces
        { match: /  +/g, replace: ' ' },
        // Double periods
        { match: /\.\.(?!\.)/g, replace: '.' },
        // Space before punctuation
        { match: / ([.,;:!?])/g, replace: '$1' },
        // Missing space after punctuation
        { match: /([.!?])([A-Z])/g, replace: '$1 $2' },
        // Repeated words
        { match: /\b(\w+)\s+\1\b/gi, replace: '$1' },
        // Fix "a" before vowel sounds
        { match: /\ba\s+(a|e|i|o|u)/gi, replace: 'an $1' },
        // Fix "an" before consonant sounds
        { match: /\ban\s+(b|c|d|f|g|j|k|l|m|n|p|q|r|s|t|v|w|x|y|z)\w/gi, replace: function (m) { return 'a ' + m.slice(3); } },
        // Capitalize after period
        { match: /\.\s+([a-z])/g, replace: function (m, p1) { return '. ' + p1.toUpperCase(); } },
        // Capitalize first letter
        { match: /^([a-z])/, replace: function (m, p1) { return p1.toUpperCase(); } },
        // Fix " , "
        { match: /\s,\s/g, replace: ', ' },
        // Remove trailing whitespace before period
        { match: /\s+\./g, replace: '.' },
        // Fix multiple commas
        { match: /,\s*,/g, replace: ',' },
    ];

    // ═══════════════════════════════════════════════════════════
    // SENTENCE FLOW ENHANCERS
    // ═══════════════════════════════════════════════════════════

    const SENTENCE_KEYWORDS = {
        addition: ['also', 'another', 'additional', 'more', 'further', 'other', 'second', 'third'],
        contrast: ['but', 'however', 'although', 'despite', 'unlike', 'different', 'opposite', 'instead', 'whereas', 'challenge'],
        cause: ['because', 'since', 'due', 'reason', 'cause', 'factor', 'lead', 'stem'],
        result: ['result', 'therefore', 'consequently', 'effect', 'outcome', 'impact', 'lead to', 'thus'],
        example: ['example', 'instance', 'case', 'such as', 'like', 'illustrate', 'demonstrate'],
    };

    function classifySentence(sentence) {
        var lower = sentence.toLowerCase();
        for (var type in SENTENCE_KEYWORDS) {
            var keywords = SENTENCE_KEYWORDS[type];
            for (var k = 0; k < keywords.length; k++) {
                if (lower.indexOf(keywords[k]) !== -1) return type;
            }
        }
        return null;
    }

    function pickTransition(type) {
        if (!type || !TRANSITIONS[type]) {
            var neutral = ['also', 'in addition', 'besides this', 'on top of that', "what's more"];
            return neutral[Math.floor(Math.random() * neutral.length)];
        }
        var choices = TRANSITIONS[type];
        return choices[Math.floor(Math.random() * choices.length)];
    }

    // ═══════════════════════════════════════════════════════════
    // MAIN ENHANCEMENT PIPELINE
    // ═══════════════════════════════════════════════════════════

    function enhanceText(text) {
        if (!text || text.trim().length < 20) return text;

        var result = text;

        // 1. Apply grammar fixes
        for (var i = 0; i < GRAMMAR_FIXES.length; i++) {
            result = result.replace(GRAMMAR_FIXES[i].match, GRAMMAR_FIXES[i].replace);
        }

        // 2. Add natural linking words between sentences that lack transitions
        result = addLinkingWords(result);

        // 3. Final grammar cleanup
        result = result.replace(/  +/g, ' ');
        result = result.replace(/^\s+/gm, '');

        return result;
    }

    function addLinkingWords(text) {
        var sentences = text.split(/(?<=[.!?])\s+/);
        if (sentences.length < 3) return text;

        var enhanced = [sentences[0]];

        var startsWithTransition = /^(however|but|yet|still|also|moreover|furthermore|in addition|besides|therefore|thus|consequently|for example|for instance|in fact|actually|though|meanwhile|nonetheless|nevertheless|on the other hand|similarly|likewise|as a result|in contrast|so|and|then|next|after|before|while|although|even though|that said|the thing is|what's more|plus|on top of that)/i;

        var transitionsAdded = 0;
        var maxTransitions = Math.max(1, Math.floor(sentences.length * 0.15));

        for (var i = 1; i < sentences.length; i++) {
            var sentence = sentences[i].trim();
            if (!sentence) continue;

            // Skip if sentence already starts with a transition
            if (startsWithTransition.test(sentence)) {
                enhanced.push(sentence);
                continue;
            }

            // Only add transitions to ~25% of eligible sentences
            var shouldAdd = transitionsAdded < maxTransitions &&
                Math.random() < 0.25 &&
                sentence.length > 30;

            if (shouldAdd) {
                var type = classifySentence(sentence);
                var transition = pickTransition(type);
                var capitalizedTransition = transition.charAt(0).toUpperCase() + transition.slice(1);
                var lowerFirst = sentence.charAt(0).toLowerCase() + sentence.slice(1);
                enhanced.push(capitalizedTransition + ', ' + lowerFirst);
                transitionsAdded++;
            } else {
                enhanced.push(sentence);
            }
        }

        return enhanced.join(' ');
    }

    // ═══════════════════════════════════════════════════════════
    // MUTATION OBSERVER — Hook into app.js output
    // ═══════════════════════════════════════════════════════════

    var outputEl = document.getElementById('text-output');
    if (!outputEl) return;

    var lastProcessedText = '';

    var observer = new MutationObserver(function (mutations) {
        // Don't process empty states
        if (outputEl.classList.contains('empty')) return;

        // Find the text content div
        var textDiv = outputEl.querySelector('div[style*="pre-wrap"]');
        if (!textDiv) return;

        var rawText = textDiv.textContent;
        if (!rawText || rawText === lastProcessedText || rawText.length < 20) return;

        // Avoid infinite loop
        lastProcessedText = rawText;

        // Disconnect briefly to prevent re-triggering
        observer.disconnect();

        // Enhance the text
        var enhanced = enhanceText(rawText);

        // Only update if the text actually changed
        if (enhanced !== rawText) {
            textDiv.textContent = enhanced;
        }

        lastProcessedText = textDiv.textContent;

        // Reconnect observer
        observer.observe(outputEl, { childList: true, subtree: true, characterData: true });
    });

    // Start observing
    observer.observe(outputEl, { childList: true, subtree: true, characterData: true });

})();
