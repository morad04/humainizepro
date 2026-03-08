/* ═══════════════════════════════════════════════════════
   HUMAINIZE Pro — AI Checker Logic
   Client-side heuristic AI pattern detection
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    const input = document.getElementById('checker-input');
    const wordcount = document.getElementById('checker-wordcount');
    const btnCheck = document.getElementById('btn-check');
    const btnClear = document.getElementById('btn-clear-checker');
    const results = document.getElementById('checker-results');

    // Word count
    input.addEventListener('input', () => {
        const words = input.value.trim().split(/\s+/).filter(w => w.length > 0).length;
        wordcount.textContent = words + ' words';
    });

    btnClear.addEventListener('click', () => {
        input.value = '';
        wordcount.textContent = '0 words';
        results.classList.remove('active');
    });

    // ─── AI Detection Heuristics ───
    function analyzeText(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const totalWords = words.length;

        if (totalWords < 10) return { score: 0, formality: 0, repetition: 0, vocabulary: 0 };

        // 1. Formality score — AI tends to be overly formal
        const formalPhrases = [
            'furthermore', 'moreover', 'consequently', 'nevertheless', 'notwithstanding',
            'in conclusion', 'it is important to note', 'it is worth noting',
            'in recent years', 'plays a crucial role', 'it should be noted',
            'in the context of', 'with respect to', 'in terms of',
            'a significant', 'a substantial', 'a comprehensive', 'a nuanced',
            'multifaceted', 'paradigm', 'leveraging', 'utilizing', 'facilitating',
            'demonstrates', 'encompasses', 'underscores', 'highlights',
            'in addition', 'on the other hand', 'as a result', 'for instance',
            'in particular', 'specifically', 'accordingly', 'thus'
        ];

        let formalCount = 0;
        const lowerText = text.toLowerCase();
        formalPhrases.forEach(phrase => {
            const count = (lowerText.match(new RegExp(phrase, 'g')) || []).length;
            formalCount += count;
        });

        const formalityRatio = Math.min(1, formalCount / (totalWords / 50));

        // 2. Repetition — AI tends to repeat sentence structures
        const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
        let lengthVariance = 0;
        if (sentenceLengths.length > 1) {
            const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
            lengthVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / sentenceLengths.length;
        }
        const repetitionScore = Math.max(0, 1 - (lengthVariance / 200));

        // 3. Vocabulary range — AI uses diverse but predictable vocabulary
        const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')).filter(w => w.length > 2));
        const vocabRatio = uniqueWords.size / totalWords;
        // AI typically has 0.55-0.70 ratio, human writing varies more
        const vocabScore = vocabRatio > 0.5 && vocabRatio < 0.75 ? 0.6 : 0.3;

        // 4. Transition words density
        const transitions = ['however', 'therefore', 'moreover', 'furthermore', 'additionally',
            'consequently', 'nevertheless', 'similarly', 'meanwhile', 'subsequently'];
        let transitionCount = 0;
        transitions.forEach(t => {
            transitionCount += (lowerText.match(new RegExp('\\b' + t + '\\b', 'g')) || []).length;
        });
        const transitionDensity = Math.min(1, transitionCount / (sentences.length * 0.3));

        // 5. Sentence starts — AI often starts with similar patterns
        const starters = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
        const starterSet = new Set(starters);
        const starterDiversity = starters.length > 0 ? starterSet.size / starters.length : 1;
        const starterScore = Math.max(0, 1 - starterDiversity);

        // Combined score
        let aiScore = (
            formalityRatio * 35 +
            repetitionScore * 20 +
            vocabScore * 15 +
            transitionDensity * 15 +
            starterScore * 15
        );

        aiScore = Math.min(100, Math.max(0, Math.round(aiScore)));

        return {
            score: aiScore,
            formality: Math.round(formalityRatio * 100),
            repetition: Math.round(repetitionScore * 100),
            vocabulary: Math.round(vocabRatio * 100)
        };
    }

    // ─── Run Check ───
    btnCheck.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text || text.split(/\s+/).length < 10) {
            showToast('Please paste at least 10 words to analyze.');
            return;
        }

        // Show results with animation
        results.classList.add('active');

        const verdict = document.getElementById('result-verdict');
        const detail = document.getElementById('result-detail');
        const scoreNum = document.getElementById('score-number');
        const ringFill = document.getElementById('ring-fill');
        const formality = document.getElementById('score-formality');
        const repetition = document.getElementById('score-repetition');
        const vocabulary = document.getElementById('score-vocabulary');

        // Reset
        verdict.textContent = 'Analyzing...';
        detail.textContent = '';
        scoreNum.textContent = '...';
        ringFill.style.strokeDashoffset = '283';
        formality.textContent = '...';
        repetition.textContent = '...';
        vocabulary.textContent = '...';

        results.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Simulate processing delay
        setTimeout(() => {
            const result = analyzeText(text);

            // Animate score ring
            const circumference = 283;
            const offset = circumference - (result.score / 100) * circumference;
            ringFill.style.strokeDashoffset = offset;

            // Color based on score
            let color;
            if (result.score <= 30) color = '#22C55E';
            else if (result.score <= 60) color = '#F59E0B';
            else color = '#EF4444';

            ringFill.style.stroke = color;
            scoreNum.textContent = result.score + '%';
            scoreNum.style.color = color;

            // Verdict
            if (result.score <= 20) {
                verdict.textContent = 'Likely Human Written';
                verdict.style.color = '#22C55E';
                detail.textContent = 'This text shows strong human writing patterns. Low formality scores and natural sentence variety indicate authentic writing.';
            } else if (result.score <= 40) {
                verdict.textContent = 'Mostly Human';
                verdict.style.color = '#22C55E';
                detail.textContent = 'Text appears mostly human-written with minor formal patterns. Consider varying sentence structure for stronger results.';
            } else if (result.score <= 60) {
                verdict.textContent = 'Mixed Signals';
                verdict.style.color = '#F59E0B';
                detail.textContent = 'Some AI-like patterns detected. The text has formal vocabulary and repetitive structures that could trigger AI detectors.';
            } else if (result.score <= 80) {
                verdict.textContent = 'Likely AI Generated';
                verdict.style.color = '#EF4444';
                detail.textContent = 'Strong AI patterns found. High formality, predictable transitions, and uniform sentence lengths indicate AI generation.';
            } else {
                verdict.textContent = 'AI Generated';
                verdict.style.color = '#EF4444';
                detail.textContent = 'This text shows very strong AI writing patterns. Use the Humanizer to make it undetectable before submitting.';
            }

            // Breakdown
            function colorClass(val) {
                if (val <= 30) return 'score-green';
                if (val <= 60) return 'score-yellow';
                return 'score-red';
            }

            formality.textContent = result.formality + '%';
            formality.className = 'breakdown-value ' + colorClass(result.formality);

            repetition.textContent = result.repetition + '%';
            repetition.className = 'breakdown-value ' + colorClass(result.repetition);

            vocabulary.textContent = result.vocabulary + '%';
            vocabulary.className = 'breakdown-value ' + colorClass(100 - result.vocabulary);

        }, 1200);
    });

    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

})();
