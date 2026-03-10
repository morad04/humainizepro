/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Text Enhancement Layer v6
   
   Two modes: ACADEMIC and NORMAL
   - Academic: keeps meaning formal but uses NATURAL academic phrasing
     that doesn't trigger AI detectors (avoids robotic formal patterns)
   - Normal: casual tone, simple linking words
   
   Key: Academic mode does NOT restore exact AI-flagged phrases.
   Instead it uses natural-sounding academic alternatives.
   
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
    // UNICODE HELPERS
    // ═══════════════════════════════════════════════════════════

    var INVISIBLE_CHARS = '\u200B\u200C\u200D\uFEFF';

    function buildFuzzyRegex(phrase, flags) {
        var zwc = '[\u200B\u200C\u200D\uFEFF]*';
        var parts = [];
        for (var i = 0; i < phrase.length; i++) {
            var ch = phrase[i];
            if (ch === ' ') {
                parts.push('[\u0020\u2000-\u200A\u205F]' + zwc);
            } else {
                var alts = getHomoglyphAlts(ch);
                if (alts) {
                    parts.push('[' + esc(ch) + alts + ']' + zwc);
                } else {
                    parts.push(esc(ch) + zwc);
                }
            }
        }
        return new RegExp(parts.join(''), flags || 'gi');
    }

    function getHomoglyphAlts(ch) {
        var m = { 'a': '\u0430', 'e': '\u0435', 'o': '\u043E', 'c': '\u0441', 'p': '\u0440', 's': '\u0455', 'i': '\u0456', 'x': '\u0445', 'y': '\u0443' };
        var lower = ch.toLowerCase();
        if (m[lower]) {
            return (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) ? m[lower].toUpperCase() : m[lower];
        }
        return null;
    }

    function esc(ch) {
        return '\\^$.*+?()[]{}|'.indexOf(ch) !== -1 ? '\\' + ch : ch;
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
    // 2. ACADEMIC VOCABULARY — NATURAL STYLE
    // Uses alternatives that sound academic but NOT robotic/AI-like.
    // These preserve meaning without triggering AI detectors.
    // Key principle: avoid the EXACT phrases AI typically generates.
    // ═══════════════════════════════════════════════════════════

    var ACADEMIC_PHRASES = [
        // [casual from humanizer, natural academic alternative]
        // NOT restoring exact AI phrases — using human-sounding academic versions

        // Knowledge & learning
        ['swapping knowledge', 'exchanging ideas and knowledge'],
        ['sharing ideas', 'exchanging perspectives'],
        ['learning from each other', 'mutual learning'],

        // Challenges
        ['the biggest hurdle', 'the main challenge'],
        ['the main struggle', 'the central difficulty'],
        ['the hardest part', 'the most demanding aspect'],

        // English/Language
        ['university-level English', 'English at the university level'],
        ['the kind of English used in class', 'English used in academic settings'],

        // Skills & participation
        ['subject-specific words', 'vocabulary specific to the subject'],
        ['field jargon', 'specialized terms'],
        ['strong listening ability', 'well-developed listening skills'],
        ['the ability to follow complex speech', 'the capacity to follow detailed lectures'],
        ['speaking up on the spot', 'contributing to discussions spontaneously'],
        ['jumping into discussions', 'participating actively in discussions'],
        ['actually speaking up', 'contributing verbally in class'],
        ['talking in class', 'verbal participation in class'],
        ['joining the conversation', 'taking part in discussions'],
        ['not participating as much', 'participating less frequently'],
        ['staying quiet', 'remaining silent in discussions'],

        // Academic outcomes
        ['how well they do in school', 'how they perform academically'],

        // Anxiety
        ['stress about their English', 'anxiety related to English proficiency'],
        ['nerves around language', 'language-related nervousness'],
        ['worry about speaking', 'anxiety about verbal participation'],

        // Research
        ['is still needed', 'is still required'],
        ["what's already been written", 'what has already been published'],
        ['previous studies', 'earlier studies'],
        ['past research', 'earlier research'],

        // Formality upgrades (keep natural, avoid robotic)
        ['makes a difference', 'has an effect'],
        ['is a must', 'is necessary'],
        ['you really need', 'one needs to'],
        ['really matters', 'is quite important'],
        ['has a big impact', 'has a strong impact'],
        ['makes a real difference', 'has a real effect'],
        ['works as', 'serves as'],
        ['acts like', 'serves as'],
        ['is basically', 'is essentially'],
        ['at the end of the day', 'ultimately'],
        ['when you get down to it', 'in essence'],
        ['so you can', 'to'],
        ['if you want to', 'to'],
        ['seeing as', 'since'],
        ['when it comes to', 'regarding'],
        ['all kinds of', 'various types of'],
        ['lots of', 'many'],
        ['a bunch of', 'several'],
        ['flip side though', 'on the other hand'],
        ['quite a bit', 'considerably'],
        ['pretty heavily', 'considerably'],
        ["that's because", 'this is because'],
        ['it comes down to', 'it largely depends on'],
        ['because of that', 'as a result'],
        ['really affect', 'strongly affect'],
        ['really affects', 'strongly affects'],
        ['really shape', 'strongly shape'],
        ['have a real impact on', 'strongly affect'],
        ['has a real impact on', 'strongly affects'],
        ['means getting used to', 'requires adapting to'],
        ['is about learning', 'requires learning'],
        ['comes down to learning', 'involves learning'],
        ['means adjusting', 'requires adjusting'],
        ['is really about adjusting', 'involves adjusting to'],
        ['comes down to adjusting', 'involves adjusting'],
        ['global ways of looking at things', 'global perspectives'],
        ['ways of looking at things', 'broader viewpoints'],
    ];

    function restoreAcademicVocabulary(text) {
        for (var i = 0; i < ACADEMIC_PHRASES.length; i++) {
            var casual = ACADEMIC_PHRASES[i][0];
            var formal = ACADEMIC_PHRASES[i][1];
            var fuzzyRe = buildFuzzyRegex(casual, 'gi');
            text = text.replace(fuzzyRe, formal);
        }
        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 3. TRANSITIONS — Mode-specific
    // Academic transitions are formal but NOT the robotic ones AI uses
    // ═══════════════════════════════════════════════════════════

    var ACADEMIC_TRANSITIONS = {
        addition: ['On top of this', 'Along with this', 'Adding to this', 'Beyond that', 'Equally important'],
        contrast: ['Still', 'That said', 'Even so', 'At the same time', 'Despite this'],
        cause: ['Because of this', 'This stems from', 'Owing to this', 'Given this'],
        result: ['As a result', 'The outcome is', 'This leads to', 'Accordingly'],
        example: ['To illustrate', 'Consider how', 'A case in point is', 'This can be seen in'],
        emphasis: ['Notably', 'What stands out is', 'The key point here is', 'It is worth noting'],
        concession: ['While this is true', 'Granted', 'Admittedly', 'Even though']
    };

    var NORMAL_TRANSITIONS = {
        addition: ['Also', 'Besides', 'Plus', 'On top of that', 'Along with this'],
        contrast: ['But', 'Still', 'Yet', 'Though', 'Even so', 'That said', 'Then again'],
        cause: ['Because of this', 'Since', 'Due to this', 'This happens because'],
        result: ['So', 'As a result', 'Because of that', 'This means', 'Which is why'],
        example: ['For example', 'For instance', 'Take this case', 'A good example is'],
        emphasis: ['In fact', 'Actually', 'The truth is', 'Really', 'The point is'],
        concession: ['Though', 'Even so', 'Still', 'That said']
    };

    // ═══════════════════════════════════════════════════════════
    // 4. SMART PUNCTUATION
    // ═══════════════════════════════════════════════════════════

    function fixPunctuation(text) {
        var introductory = [
            'however', 'therefore', 'meanwhile', 'furthermore',
            'nonetheless', 'nevertheless', 'similarly', 'additionally',
            'consequently', 'subsequently', 'moreover', 'accordingly',
            'conversely', 'notably', 'significantly', 'indeed',
            'unfortunately', 'fortunately', 'interestingly', 'importantly',
            'clearly', 'naturally', 'crucially', 'granted', 'admittedly',
            'in fact', 'of course', 'for example', 'for instance',
            'on the other hand', 'as a result', 'in other words',
            'in addition', 'after all', 'above all', 'in particular',
            'to be fair', 'in general', 'at first', 'over time',
            'in the end', 'at the same time', 'on top of that',
            'because of this', 'due to this', 'in contrast',
            'on top of this', 'along with this', 'adding to this',
            'beyond that', 'that said', 'even so'
        ];

        for (var i = 0; i < introductory.length; i++) {
            var phrase = introductory[i];
            var regex = new RegExp('(^|[.!?]\\s+)(' + phrase + ')\\s+(?!,)', 'gi');
            text = text.replace(regex, function (m, before, word) {
                return before + word + ', ';
            });
        }

        text = text.replace(/([a-z\u0430-\u044F]{3,})\s+(but|yet)\s+([a-z\u0430-\u044F])/gi, function (m, before, conj, after) {
            return before + ', ' + conj + ' ' + after;
        });

        text = text.replace(/ ([.,;:!?])/g, '$1');
        text = text.replace(/([.,;:!?])([A-Z\u0410-\u042F])/g, '$1 $2');
        text = text.replace(/\.\.(?!\.)/g, '.');
        text = text.replace(/,\s*,/g, ',');
        text = text.replace(/,\./g, '.');
        text = text.replace(/([.!?]),/g, '$1');

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 5. GRAMMAR
    // ═══════════════════════════════════════════════════════════

    function fixGrammar(text) {
        if (text.length > 0 && /[a-z\u0430-\u044F]/.test(text.charAt(0))) {
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }
        text = text.replace(/([.!?])\s+([a-z\u0430-\u044F])/g, function (m, punct, letter) {
            return punct + ' ' + letter.toUpperCase();
        });
        text = text.replace(/\ba\s+(a(?:cademic|ctive|ctual|dult|ffect|gree|nother|pproach|rticle|ssess|ttempt|ware))/gi, 'an $1');
        text = text.replace(/\ba\s+(e(?:arly|ffect|ffort|lement|motion|nglish|nviron|ssential|stimate|vent|xample|xercise|xperi))/gi, 'an $1');
        text = text.replace(/\ba\s+(i(?:dea|mage|mpact|mport|ncrease|ndivid|nfluence|nstance|nterest|nterview|nvest|ssue|tem))/gi, 'an $1');
        text = text.replace(/\ba\s+(o(?:bject|bserv|bstacle|ccasion|ffer|lder|pen|pinion|pportun|ption|rder|rganiz|ther|utcome|utline|verview))/gi, 'an $1');
        text = text.replace(/\ba\s+(u(?:ltimate|nderstand|nfair|niqu|niversit|nusual|pdate|rban))/gi, 'an $1');
        text = text.replace(/\b(\w{2,})\s+\1\b/gi, '$1');
        text = text.replace(/^\s*[,;:]\s*/gm, '');
        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 6. NATURAL COMMAS
    // ═══════════════════════════════════════════════════════════

    function addNaturalCommas(text) {
        text = text.replace(/(\w)\s+which\s+/gi, function (m, before) {
            if (before === ',') return m;
            return before + ', which ';
        });
        text = text.replace(/(\w)\s+where\s+((?:the|a|an|this|that|these|those|their|its|our|my|your)\s)/gi, function (m, before, rest) {
            return before + ', where ' + rest;
        });
        text = text.replace(/((?:When|While|If|Although|Because|Since|Before|After|As|Unless|Until|Once)\s+[^,]{15,50}?)\s+(the|a|an|this|they|we|he|she|it|I|you)\s/gi,
            function (m, intro, subject) {
                if (intro.indexOf(',') !== -1) return m;
                return intro + ', ' + subject + ' ';
            }
        );
        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 7. TRANSITIONS
    // ═══════════════════════════════════════════════════════════

    var SENTENCE_HINTS = {
        addition: ['also', 'another', 'additional', 'more', 'further', 'other'],
        contrast: ['but', 'however', 'although', 'despite', 'unlike', 'different', 'challenge', 'struggle', 'difficult'],
        cause: ['because', 'since', 'due', 'reason', 'cause', 'factor'],
        result: ['result', 'effect', 'outcome', 'impact', 'lead', 'thus'],
        example: ['example', 'instance', 'case', 'such as', 'illustrate'],
        concession: ['although', 'while', 'despite', 'yet', 'even']
    };

    var HAS_TRANSITION = /^(however|but|yet|still|also|moreover|furthermore|in addition|besides|therefore|thus|consequently|for example|for instance|in fact|actually|though|meanwhile|nonetheless|nevertheless|on the other hand|similarly|likewise|as a result|in contrast|so|and|then|after|while|although|even though|that said|plus|on top of that|overall|all in all|because|since|due to|not only|along with|in other words|at the same time|the truth is|additionally|accordingly|conversely|notably|indeed|on top of this|beyond that|adding to this|granted|admittedly|even so|the key point)/i;

    function classifySentence(s) {
        var lower = s.toLowerCase();
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
        var transitions = currentMode === 'academic' ? ACADEMIC_TRANSITIONS : NORMAL_TRANSITIONS;
        var parts = text.split(/(?<=[.!?])\s+/);
        if (parts.length < 3) return text;

        var result = [parts[0]];
        var added = 0;
        var maxAdd = Math.max(1, Math.floor(parts.length * 0.2));

        for (var i = 1; i < parts.length; i++) {
            var s = parts[i];
            if (!s || s.length < 15) { result.push(s); continue; }
            if (HAS_TRANSITION.test(s)) { result.push(s); continue; }

            if (added < maxAdd && Math.random() < 0.25 && s.length > 30) {
                var type = classifySentence(s) || 'addition';
                var transition = pickRandom(transitions[type] || transitions.addition);
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
    // 8. SENTENCE VARIETY
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

            if (words < 8 && i + 1 < parts.length) {
                var next = parts[i + 1];
                var nextWords = next ? next.split(/\s+/).length : 0;

                if (nextWords > 0 && nextWords < 8 && Math.random() < 0.4) {
                    var connectors = currentMode === 'academic'
                        ? [', and ', '; ', ', which ']
                        : [', and ', ', which ', ' — ', '; '];
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

        // Step 1: Fix over-spacing
        var result = normalizeSpaces(text);

        // Step 2: Academic vocabulary (natural, non-robotic)
        if (currentMode === 'academic') {
            result = restoreAcademicVocabulary(result);
        }

        // Step 3: Punctuation
        result = fixPunctuation(result);

        // Step 4: Grammar
        result = fixGrammar(result);

        // Step 5: Commas
        result = addNaturalCommas(result);

        // Step 6: Sentence variety
        result = improveSentenceVariety(result);

        // Step 7: Transitions
        result = addTransitions(result);

        // Step 8: Cleanup
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
