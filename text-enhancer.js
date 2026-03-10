/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Text Enhancement Layer v5
   
   Two modes: ACADEMIC and NORMAL
   - Academic: formal vocabulary, scholarly transitions, preserves meaning
   - Normal: casual tone, simple linking words
   
   Key innovation: Unicode-tolerant matching that handles invisible
   characters and homoglyphs injected by the humanizer.
   
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
    // The humanizer injects:
    // - Zero-width chars: \u200B, \u200C, \u200D, \uFEFF
    // - Homoglyphs: Cyrillic а(0430), е(0435), о(043E), с(0441),
    //   р(0440), ѕ(0455), і(0456), х(0445), у(0443)
    // - Various-width spaces: \u2000-\u200A, \u205F
    // ═══════════════════════════════════════════════════════════

    var INVISIBLE_CHARS = '\u200B\u200C\u200D\uFEFF';
    var INVISIBLE_RE = /[\u200B\u200C\u200D\uFEFF]/g;

    // Map of Latin chars to their Cyrillic homoglyphs
    var HOMOGLYPH_MAP = {
        '\u0430': 'a', '\u0435': 'e', '\u043E': 'o', '\u0441': 'c',
        '\u0440': 'p', '\u0455': 's', '\u0456': 'i', '\u0445': 'x', '\u0443': 'y',
        // Uppercase Cyrillic
        '\u0410': 'A', '\u0415': 'E', '\u041E': 'O', '\u0421': 'C',
        '\u0420': 'P', '\u0405': 'S', '\u0406': 'I', '\u0425': 'X', '\u0423': 'Y'
    };

    // Strip ALL invisible chars and normalize homoglyphs to Latin
    function toPlainText(str) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            var ch = str[i];
            if (INVISIBLE_CHARS.indexOf(ch) !== -1) continue;
            if (HOMOGLYPH_MAP[ch]) {
                result += HOMOGLYPH_MAP[ch];
            } else {
                result += ch;
            }
        }
        // Normalize Unicode spaces to regular spaces
        result = result.replace(/[\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u205F]/g, ' ');
        return result;
    }

    // Build a regex that matches a phrase even with invisible chars
    // between characters and homoglyphs replacing Latin chars.
    // "swapping knowledge" -> s[invisible]*w[invisible]*a[invisible]*p...
    function buildFuzzyRegex(phrase, flags) {
        var zwc = '[\u200B\u200C\u200D\uFEFF]*';
        var parts = [];

        for (var i = 0; i < phrase.length; i++) {
            var ch = phrase[i];
            if (ch === ' ') {
                // Space can be any Unicode space variant + optional zero-width chars
                parts.push('[\u0020\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u205F]' + zwc);
            } else {
                // For each Latin char, also match its Cyrillic homoglyph
                var alts = getHomoglyphAlts(ch);
                if (alts) {
                    parts.push('[' + escapeRegexChar(ch) + alts + ']' + zwc);
                } else {
                    parts.push(escapeRegexChar(ch) + zwc);
                }
            }
        }

        return new RegExp(parts.join(''), flags || 'gi');
    }

    function getHomoglyphAlts(ch) {
        var lower = ch.toLowerCase();
        var map = { 'a': '\u0430', 'e': '\u0435', 'o': '\u043E', 'c': '\u0441', 'p': '\u0440', 's': '\u0455', 'i': '\u0456', 'x': '\u0445', 'y': '\u0443' };
        if (map[lower]) {
            if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) {
                return map[lower].toUpperCase();
            }
            return map[lower];
        }
        return null;
    }

    function escapeRegexChar(ch) {
        if ('\\^$.*+?()[]{}|'.indexOf(ch) !== -1) return '\\' + ch;
        return ch;
    }

    // ═══════════════════════════════════════════════════════════
    // 1. UNICODE SPACE NORMALIZER
    // ═══════════════════════════════════════════════════════════

    function normalizeSpaces(text) {
        text = text.replace(/[\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u205F]/g, ' ');
        text = text.replace(/ {2,}/g, ' ');
        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 2. ACADEMIC VOCABULARY RESTORATION
    // Uses fuzzy matching to handle invisible chars + homoglyphs
    // ═══════════════════════════════════════════════════════════

    var ACADEMIC_PHRASES = [
        // [casual phrase from humanizer, formal academic replacement]
        // These reverse the COLLOQUIAL_PHRASES from app.js
        ['swapping knowledge', 'intellectual exchange'],
        ['sharing ideas', 'intellectual exchange'],
        ['learning from each other', 'collaborative learning'],
        ['the biggest hurdle', 'the primary challenge'],
        ['the main struggle', 'the key challenge'],
        ['the hardest part', 'the most significant challenge'],
        ['university-level English', 'academic English'],
        ['the kind of English used in class', 'academic English'],
        ['subject-specific words', 'discipline-specific vocabulary'],
        ['field jargon', 'specialized terminology'],
        ['technical terms for their subject', 'discipline-specific terminology'],
        ['strong listening ability', 'advanced listening competence'],
        ['the ability to follow complex speech', 'advanced listening skills'],
        ['good ears for detail', 'attentive listening skills'],
        ['speaking up on the spot', 'spontaneous verbal interaction'],
        ['unscripted conversation', 'impromptu verbal exchange'],
        ['jumping into discussions', 'active participation in discussions'],
        ['actually speaking up', 'active verbal contribution'],
        ['talking in class', 'classroom verbal participation'],
        ['joining the conversation', 'engaging in discourse'],
        ["thinking critically about what's being said", 'critical engagement'],
        ['real engagement with the material', 'substantive engagement'],
        ['pushing back on ideas', 'critical analysis'],
        ['not participating as much', 'reduced participation'],
        ['staying quiet', 'limited verbal contribution'],
        ['pulling back', 'withdrawal from participation'],
        ['how well they do in school', 'academic outcomes'],
        ['stress about their English', 'language-related anxiety'],
        ['nerves around language', 'linguistic apprehension'],
        ['worry about speaking', 'communication anxiety'],
        ['is still needed', 'remains necessary'],
        ["what's already been written", 'the existing body of research'],
        ['previous studies', 'prior research'],
        ['past research', 'existing literature'],

        // Reverse of standard COLLOQUIAL_PHRASES
        ['makes a difference', 'is significant'],
        ['is a must', 'is essential'],
        ['you really need', 'it is essential'],
        ['really matters', 'plays a significant role'],
        ['has a big impact', 'has a considerable impact'],
        ['makes a real difference', 'has a significant effect'],
        ['works as', 'functions as'],
        ['acts like', 'functions as'],
        ['is basically', 'essentially serves as'],
        ['at the end of the day', 'fundamentally'],
        ['when you get down to it', 'at its core'],
        ['so you can', 'in order to'],
        ['if you want to', 'in order to'],
        ['seeing as', 'given that'],
        ['when it comes to', 'in the context of'],
        ['all kinds of', 'a wide range of'],
        ['lots of', 'a considerable number of'],
        ['a bunch of', 'a variety of'],
        ['flip side though', 'on the other hand'],
        ['quite a bit', 'substantially'],
        ['pretty heavily', 'to a considerable extent'],
        ["that's because", 'this is attributable to'],
        ['it comes down to', 'this is primarily due to'],
        ['because of that', 'consequently'],
        ['really affect', 'significantly influence'],
        ['really affects', 'significantly influences'],
        ['really shape', 'fundamentally affect'],
        ['have a real impact on', 'directly influence'],
        ['has a real impact on', 'directly influences'],
        ['means getting used to', 'involves adapting to'],
        ['is about learning', 'involves acquiring proficiency in'],
        ['comes down to learning', 'centres on developing'],
        ['means adjusting', 'involves adapting'],
        ['is really about adjusting', 'fundamentally involves adapting'],
        ['comes down to adjusting', 'primarily involves adapting'],

        // Passive voice & formal alternatives
        ['play right into', 'directly affect'],
        ['hit', 'impact'],
        ["can't skip", 'is essential'],
        ['global ways of looking at things', 'global perspectives'],
        ['ways of looking at things', 'perspectives'],
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
    // ═══════════════════════════════════════════════════════════

    var ACADEMIC_TRANSITIONS = {
        addition: ['Furthermore', 'Moreover', 'In addition', 'Additionally', 'Equally important'],
        contrast: ['However', 'Nevertheless', 'Conversely', 'In contrast', 'On the contrary', 'Nonetheless'],
        cause: ['Consequently', 'As a result', 'Therefore', 'Accordingly', 'Hence'],
        result: ['Thus', 'Therefore', 'Consequently', 'As a result', 'It follows that'],
        example: ['For instance', 'To illustrate', 'As evidenced by', 'Specifically', 'In particular'],
        emphasis: ['Indeed', 'Notably', 'Significantly', 'It is important to note that', 'Crucially'],
        concession: ['Although', 'While it is true that', 'Notwithstanding', 'Despite this', 'Admittedly']
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
    // 4. SMART PUNCTUATION ENGINE
    // ═══════════════════════════════════════════════════════════

    function fixPunctuation(text) {
        var introductory = [
            'however', 'therefore', 'meanwhile', 'furthermore',
            'nonetheless', 'nevertheless', 'similarly', 'additionally',
            'consequently', 'subsequently', 'moreover', 'accordingly',
            'conversely', 'notably', 'significantly', 'indeed',
            'unfortunately', 'fortunately', 'interestingly', 'importantly',
            'clearly', 'naturally', 'crucially',
            'in fact', 'of course', 'for example', 'for instance',
            'on the other hand', 'as a result', 'in other words',
            'in addition', 'after all', 'above all', 'in particular',
            'to be fair', 'in general', 'at first', 'over time',
            'in the end', 'at the same time', 'on top of that',
            'because of this', 'due to this', 'in contrast',
            'to this end', 'to that effect', 'in this regard'
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
    // 5. GRAMMAR ENGINE
    // ═══════════════════════════════════════════════════════════

    function fixGrammar(text) {
        if (text.length > 0 && /[a-z\u0430-\u044F]/.test(text.charAt(0))) {
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }

        text = text.replace(/([.!?])\s+([a-z\u0430-\u044F])/g, function (m, punct, letter) {
            return punct + ' ' + letter.toUpperCase();
        });

        // a/an before vowel sounds
        text = text.replace(/\ba\s+(a(?:cademic|ctive|ctual|dult|ffect|gree|lter|mazin|nother|pproach|rticle|ssess|ttempt|ware))/gi, 'an $1');
        text = text.replace(/\ba\s+(e(?:arly|ffect|ffort|lement|motion|nglish|nviron|ssential|stimate|vent|vening|xample|xercise|xperi))/gi, 'an $1');
        text = text.replace(/\ba\s+(i(?:dea|mage|mpact|mport|ncrease|ndivid|nfluence|nstance|nterest|nterview|nvest|ssue|tem))/gi, 'an $1');
        text = text.replace(/\ba\s+(o(?:bject|bserv|bstacle|ccasion|ffer|lder|pen|pinion|pportun|ption|rder|rganiz|ther|utcome|utline|verview))/gi, 'an $1');
        text = text.replace(/\ba\s+(u(?:ltimate|nderstand|nfair|niqu|niversit|nusual|pdate|rban))/gi, 'an $1');

        text = text.replace(/\b(\w{2,})\s+\1\b/gi, '$1');
        text = text.replace(/^\s*[,;:]\s*/gm, '');

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 6. NATURAL COMMA INSERTION
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
    // 7. LINKING WORD / TRANSITION INJECTION
    // ═══════════════════════════════════════════════════════════

    var SENTENCE_HINTS = {
        addition: ['also', 'another', 'additional', 'more', 'further', 'other'],
        contrast: ['but', 'however', 'although', 'despite', 'unlike', 'different', 'challenge', 'struggle', 'difficult'],
        cause: ['because', 'since', 'due', 'reason', 'cause', 'factor', 'stem'],
        result: ['result', 'effect', 'outcome', 'impact', 'lead', 'thus', 'mean'],
        example: ['example', 'instance', 'case', 'such as', 'illustrate', 'demonstrate'],
        concession: ['although', 'while', 'despite', 'yet', 'even', 'admit']
    };

    var HAS_TRANSITION = /^(however|but|yet|still|also|moreover|furthermore|in addition|besides|therefore|thus|consequently|for example|for instance|in fact|actually|though|meanwhile|nonetheless|nevertheless|on the other hand|similarly|likewise|as a result|in contrast|so|and|then|after|while|although|even though|that said|plus|on top of that|overall|all in all|to sum up|because|since|due to|the reason|not only|along with|besides this|the point|which is why|in other words|to be fair|at the same time|having said|the truth is|the key|additionally|accordingly|conversely|notably|significantly|indeed|crucially)/i;

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
        var maxAdd = Math.max(1, Math.floor(parts.length * 0.25));

        for (var i = 1; i < parts.length; i++) {
            var s = parts[i];
            if (!s || s.length < 15) { result.push(s); continue; }
            if (HAS_TRANSITION.test(s)) { result.push(s); continue; }

            if (added < maxAdd && Math.random() < 0.3 && s.length > 25) {
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
                        ? [', and ', '; ', ', which ', ', thus ']
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

        // Step 2: Academic vocabulary restoration (fuzzy Unicode-aware)
        if (currentMode === 'academic') {
            result = restoreAcademicVocabulary(result);
        }

        // Step 3: Smart punctuation
        result = fixPunctuation(result);

        // Step 4: Grammar
        result = fixGrammar(result);

        // Step 5: Natural commas
        result = addNaturalCommas(result);

        // Step 6: Sentence variety
        result = improveSentenceVariety(result);

        // Step 7: Linking words
        result = addTransitions(result);

        // Step 8: Final cleanup
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
