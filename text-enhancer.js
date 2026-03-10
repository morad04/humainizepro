/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — Text Enhancement Layer v4
   
   Two modes: ACADEMIC and NORMAL
   - Academic: formal vocabulary, scholarly transitions, preserves meaning
   - Normal: casual tone, simple linking words
   
   Both modes:
   1. Normalize Unicode over-spacing
   2. Smart punctuation
   3. Grammar polish
   4. Mode-specific transitions and vocabulary
   
   DOES NOT MODIFY app.js — hooks via MutationObserver
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // MODE MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    var currentMode = 'academic'; // default

    // Set up mode toggle buttons
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
        text = text.replace(/[\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u205F]/g, ' ');
        text = text.replace(/ {2,}/g, ' ');
        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 2. ACADEMIC VOCABULARY RESTORATION
    // The humanizer replaces formal words with casual alternatives.
    // In Academic mode, we reverse these to preserve original meaning.
    // ═══════════════════════════════════════════════════════════

    var ACADEMIC_RESTORE = [
        // Reverse of COLLOQUIAL_PHRASES from app.js
        // casual → formal academic
        { from: /\bmatters\b/gi, to: 'is significant' },
        { from: /\bcounts\b/gi, to: 'is of importance' },
        { from: /\bmakes a difference\b/gi, to: 'is significant' },
        { from: /\bis a must\b/gi, to: 'is essential' },
        { from: /\byou really need\b/gi, to: 'it is essential' },
        { from: /\breally matters\b/gi, to: 'plays a significant role' },
        { from: /\bhas a big impact\b/gi, to: 'has a considerable impact' },
        { from: /\bmakes a real difference\b/gi, to: 'has a significant effect' },
        { from: /\bworks as\b/gi, to: 'functions as' },
        { from: /\bacts like\b/gi, to: 'functions as' },
        { from: /\bis basically\b/gi, to: 'essentially serves as' },
        { from: /\bat the end of the day\b/gi, to: 'fundamentally' },
        { from: /\bwhen you get down to it\b/gi, to: 'at its core' },
        { from: /\bso you can\b/gi, to: 'in order to' },
        { from: /\bif you want to\b/gi, to: 'in order to' },
        { from: /\bseeing as\b/gi, to: 'given that' },
        { from: /\bwhen it comes to\b/gi, to: 'in the context of' },
        { from: /\ball kinds of\b/gi, to: 'a wide range of' },
        { from: /\blots of\b/gi, to: 'a considerable number of' },
        { from: /\ba bunch of\b/gi, to: 'a variety of' },
        { from: /\bthen again\b/gi, to: 'conversely' },
        { from: /\bflip side though\b/gi, to: 'on the other hand' },
        { from: /\bquite a bit\b/gi, to: 'substantially' },
        { from: /\bpretty heavily\b/gi, to: 'to a considerable extent' },
        { from: /\bthat's because\b/gi, to: 'this is attributable to' },
        { from: /\bthe reason is\b/gi, to: 'this can be attributed to' },
        { from: /\bit comes down to\b/gi, to: 'this is primarily due to' },
        { from: /\bbecause of that\b/gi, to: 'consequently' },
        { from: /\bwhich means\b/gi, to: 'consequently' },

        // Reverse of academic-specific replacements
        { from: /\bswapping knowledge\b/gi, to: 'intellectual exchange' },
        { from: /\bsharing ideas\b/gi, to: 'intellectual exchange' },
        { from: /\blearning from each other\b/gi, to: 'collaborative learning' },
        { from: /\bthe biggest hurdle\b/gi, to: 'the primary challenge' },
        { from: /\bthe main struggle\b/gi, to: 'the key challenge' },
        { from: /\bthe hardest part\b/gi, to: 'the most significant challenge' },
        { from: /\buniversity-level English\b/gi, to: 'academic English' },
        { from: /\bthe kind of English used in class\b/gi, to: 'academic English' },
        { from: /\bformal English\b/gi, to: 'academic English proficiency' },
        { from: /\bsubject-specific words\b/gi, to: 'discipline-specific vocabulary' },
        { from: /\bfield jargon\b/gi, to: 'specialized terminology' },
        { from: /\btechnical terms for their subject\b/gi, to: 'discipline-specific terminology' },
        { from: /\bstrong listening ability\b/gi, to: 'advanced listening competence' },
        { from: /\bthe ability to follow complex speech\b/gi, to: 'advanced listening skills' },
        { from: /\bgood ears for detail\b/gi, to: 'attentive listening skills' },
        { from: /\bspeaking up on the spot\b/gi, to: 'spontaneous verbal interaction' },
        { from: /\bunscripted conversation\b/gi, to: 'impromptu verbal exchange' },
        { from: /\bjumping into discussions\b/gi, to: 'active participation in discussions' },
        { from: /\bactually speaking up\b/gi, to: 'active verbal contribution' },
        { from: /\btalking in class\b/gi, to: 'classroom verbal participation' },
        { from: /\bjoining the conversation\b/gi, to: 'engaging in discourse' },
        { from: /\bthinking critically about what's being said\b/gi, to: 'critical engagement' },
        { from: /\breal engagement with the material\b/gi, to: 'substantive engagement' },
        { from: /\bpushing back on ideas\b/gi, to: 'critical analysis' },
        { from: /\bnot participating as much\b/gi, to: 'reduced participation' },
        { from: /\bstaying quiet\b/gi, to: 'limited verbal contribution' },
        { from: /\bpulling back\b/gi, to: 'withdrawal from participation' },
        { from: /\bgrades\b/gi, to: 'academic performance' },
        { from: /\bhow well they do in school\b/gi, to: 'academic outcomes' },
        { from: /\btheir results\b/gi, to: 'academic performance' },
        { from: /\bstress about their English\b/gi, to: 'language-related anxiety' },
        { from: /\bnerves around language\b/gi, to: 'linguistic apprehension' },
        { from: /\bworry about speaking\b/gi, to: 'communication anxiety' },
        { from: /\bis still needed\b/gi, to: 'remains necessary' },
        { from: /\bpast research\b/gi, to: 'existing literature' },
        { from: /\bwhat's already been written\b/gi, to: 'the existing body of research' },
        { from: /\bprevious studies\b/gi, to: 'prior research' },

        // Reverse VOCAB_SWAPS
        { from: /\breally affect\b/gi, to: 'significantly influence' },
        { from: /\breally affects\b/gi, to: 'significantly influences' },
        { from: /\breally shape\b/gi, to: 'fundamentally affect' },
        { from: /\bhave a real impact on\b/gi, to: 'directly influence' },
        { from: /\bhas a real impact on\b/gi, to: 'directly influences' },
        { from: /\bmeans getting used to\b/gi, to: 'involves adapting to' },
        { from: /\bis about learning\b/gi, to: 'involves acquiring proficiency in' },
        { from: /\bcomes down to learning\b/gi, to: 'centres on developing' },
        { from: /\bmeans adjusting\b/gi, to: 'involves adapting' },
        { from: /\bis really about adjusting\b/gi, to: 'fundamentally involves adapting' },
        { from: /\bcomes down to adjusting\b/gi, to: 'primarily involves adapting' },

        // Common informal → formal
        { from: /\bget\b/gi, to: 'obtain' },
        { from: /\bgot\b/gi, to: 'obtained' },
        { from: /\bbig\b/gi, to: 'significant' },
        { from: /\bkids\b/gi, to: 'children' },
        { from: /\bstuff\b/gi, to: 'material' },
        { from: /\bshow\b(?!\s+that)/gi, to: 'demonstrate' },
        { from: /\bhelp\b/gi, to: 'facilitate' },
        { from: /\bgood\b/gi, to: 'effective' },
        { from: /\bbad\b/gi, to: 'adverse' },
        { from: /\bhard\b/gi, to: 'challenging' },
        { from: /\beasy\b/gi, to: 'straightforward' },
        { from: /\blike\b(?=\s+\w)/gi, to: 'such as' },
        { from: /\ba lot\b/gi, to: 'considerably' },
    ];

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
        // Introductory phrase comma insertion
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

        // Comma before coordinating conjunctions
        text = text.replace(/([a-z\u0430-\u044F]{3,})\s+(but|yet)\s+([a-z\u0430-\u044F])/gi, function (m, before, conj, after) {
            return before + ', ' + conj + ' ' + after;
        });

        // Fix punctuation errors
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
        // Capitalize first letter
        if (text.length > 0 && /[a-z\u0430-\u044F]/.test(text.charAt(0))) {
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }

        // Capitalize after sentence endings
        text = text.replace(/([.!?])\s+([a-z\u0430-\u044F])/g, function (m, punct, letter) {
            return punct + ' ' + letter.toUpperCase();
        });

        // Fix "a" before vowel sounds
        text = text.replace(/\ba\s+(a(?:cademic|ctive|ctual|dult|ffect|gree|lter|mazin|nother|pproach|rticle|ssess|ttempt|ware))/gi, 'an $1');
        text = text.replace(/\ba\s+(e(?:arly|ffect|ffort|lement|motion|nglish|nviron|ssential|stimate|vent|vening|xample|xercise|xperi))/gi, 'an $1');
        text = text.replace(/\ba\s+(i(?:dea|mage|mpact|mport|ncrease|ndivid|nfluence|nstance|nterest|nterview|nvest|ssue|tem))/gi, 'an $1');
        text = text.replace(/\ba\s+(o(?:bject|bserv|bstacle|ccasion|ffer|lder|pen|pinion|pportun|ption|rder|rganiz|ther|utcome|utline|verview))/gi, 'an $1');
        text = text.replace(/\ba\s+(u(?:ltimate|nderstand|nfair|niqu|niversit|nusual|pdate|rban))/gi, 'an $1');

        // Doubled words
        text = text.replace(/\b(\w{2,})\s+\1\b/gi, '$1');

        // Orphaned punctuation at line start
        text = text.replace(/^\s*[,;:]\s*/gm, '');

        return text;
    }

    // ═══════════════════════════════════════════════════════════
    // 6. NATURAL COMMA INSERTION
    // ═══════════════════════════════════════════════════════════

    function addNaturalCommas(text) {
        // Before "which" (non-restrictive)
        text = text.replace(/(\w)\s+which\s+/gi, function (m, before) {
            if (before === ',') return m;
            return before + ', which ';
        });

        // Before "where" in relative clauses
        text = text.replace(/(\w)\s+where\s+((?:the|a|an|this|that|these|those|their|its|our|my|your)\s)/gi, function (m, before, rest) {
            return before + ', where ' + rest;
        });

        // After long introductory subordinate clauses
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

    var HAS_TRANSITION = /^(however|but|yet|still|also|moreover|furthermore|in addition|besides|therefore|thus|consequently|for example|for instance|in fact|actually|though|meanwhile|nonetheless|nevertheless|on the other hand|similarly|likewise|as a result|in contrast|so|and|then|after|while|although|even though|that said|plus|on top of that|overall|all in all|to sum up|because|since|due to|the reason|not only|along with|besides this|the point|which is why|as a matter|in other words|to be fair|at the same time|having said|the truth is|the key|additionally|accordingly|conversely|notably|significantly|indeed|crucially)/i;

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
    // 8. SENTENCE VARIETY (merge choppy sentences)
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

        // Step 2: Academic vocabulary restoration (only in academic mode)
        if (currentMode === 'academic') {
            for (var i = 0; i < ACADEMIC_RESTORE.length; i++) {
                result = result.replace(ACADEMIC_RESTORE[i].from, ACADEMIC_RESTORE[i].to);
            }
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
