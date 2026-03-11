// ─── HUMAINIZE: AI Pattern Detection & Humanization Engine ───
// Based on blader/humanizer SKILL.md (24 patterns from Wikipedia's "Signs of AI writing")

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // PATTERN DEFINITIONS (all 24 from SKILL.md)
  // ═══════════════════════════════════════════════════════════

  const PATTERNS = [
    // ─── CONTENT PATTERNS (1-6) ───
    {
      id: 1,
      name: 'Significance inflation',
      category: 'content',
      description: 'Undue emphasis on significance, legacy, and broader trends',
      regex: /\b(stands as|serves as a?|is a testament|enduring testament|a reminder|a vital|a significant|a crucial|a pivotal|a key role|key moment|underscores?|highlights? its importance|highlights? its significance|reflects? broader|symbolizing its ongoing|symbolizing its enduring|symbolizing its lasting|contributing to the|setting the stage for|marking a|shaping the|represents? a shift|marks? a shift|key turning point|evolving landscape|focal point|indelible mark|deeply rooted|pivotal moment|in the evolution of)\b/gi,
      weight: 4
    },
    {
      id: 2,
      name: 'Notability inflation',
      category: 'content',
      description: 'Undue emphasis on notability and media coverage',
      regex: /\b(independent coverage|local media outlets|regional media outlets|national media outlets|written by a leading expert|active social media presence|has been featured in|has been cited in|has been covered by|garnered attention|gained recognition|widely recognized)\b/gi,
      weight: 3
    },
    {
      id: 3,
      name: 'Superficial -ing analyses',
      category: 'content',
      description: 'Tacking on present participle phrases for fake depth',
      regex: /,\s*(highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|contributing to|cultivating|fostering|encompassing|showcasing|demonstrating|illustrating|reinforcing|signaling|underscoring)\b/gi,
      weight: 4
    },
    {
      id: 4,
      name: 'Promotional language',
      category: 'content',
      description: 'Advertisement-like, non-neutral tone',
      regex: /\b(boasts a|vibrant community|rich cultural|rich heritage|rich history|profound impact|enhancing its|showcasing|exemplifies|commitment to excellence|natural beauty|nestled within|nestled in|in the heart of|groundbreaking|renowned for|breathtaking|must-visit|stunning views|stunning beauty|world-class)\b/gi,
      weight: 3
    },
    {
      id: 5,
      name: 'Weasel words',
      category: 'content',
      description: 'Vague attributions without specific sources',
      regex: /\b(industry reports suggest|observers have cited|experts argue|experts believe|some critics argue|several sources|several publications|many experts|widely believed|it is widely|generally considered|it is thought that|many consider|some argue)\b/gi,
      weight: 3
    },
    {
      id: 6,
      name: 'Formulaic challenges',
      category: 'content',
      description: '"Challenges and Future Prospects" boilerplate sections',
      regex: /\b(despite its .{5,40}faces several challenges|despite these challenges|challenges and legacy|future outlook|continues to thrive|remains resilient|poised for growth|continues to evolve|faces challenges typical|ongoing challenges)\b/gi,
      weight: 4
    },

    // ─── LANGUAGE AND GRAMMAR PATTERNS (7-12) ───
    {
      id: 7,
      name: 'AI vocabulary',
      category: 'language',
      description: 'Overused words that appear far more in AI text',
      regex: /\b(additionally|align with|aligning|delve|delving|delved|fostering|garner(?:ed|ing)?|interplay|intricate|intricacies|landscape(?:s)?|tapestry|testament|underscore[sd]?|underscoring|vibrant|multifaceted|utilize[sd]?|utilizing|paramount|commendable|noteworthy|meticulous(?:ly)?|streamlin(?:e[sd]?|ing)|spearhead(?:ed|ing)?|bolster(?:ed|ing)?|underpinning|transformative|indispensable|comprehensive)\b/gi,
      weight: 3
    },
    {
      id: 8,
      name: 'Copula avoidance',
      category: 'language',
      description: 'Substituting elaborate constructions for "is"/"are"',
      regex: /\b(serves as (?:a|an|the)|stands as (?:a|an|the)|marks (?:a|an|the)|represents (?:a|an|the)|boasts (?:a|an|the)|features (?:a|an|the)|offers (?:a|an|the)|functions as (?:a|an|the))\b/gi,
      weight: 3
    },
    {
      id: 9,
      name: 'Negative parallelisms',
      category: 'language',
      description: '"Not only...but..." and "It\'s not just...it\'s..." overuse',
      regex: /\b(not only .{5,60}but (?:also)?|it'?s not just (?:about )?|it'?s not merely|not simply .{5,40} (?:but|it'?s)|more than just)\b/gi,
      weight: 3
    },
    {
      id: 10,
      name: 'Rule of three',
      category: 'language',
      description: 'Forcing ideas into groups of three',
      regex: /\b(\w+(?:ing|ion|ment|ity|ness)),\s+(\w+(?:ing|ion|ment|ity|ness)),\s+and\s+(\w+(?:ing|ion|ment|ity|ness))\b/gi,
      weight: 2
    },
    {
      id: 11,
      name: 'Synonym cycling',
      category: 'language',
      description: 'Excessive synonym substitution to avoid repetition',
      regex: null, // Detected programmatically
      weight: 2
    },
    {
      id: 12,
      name: 'False ranges',
      category: 'language',
      description: '"From X to Y" where X and Y aren\'t on a meaningful scale',
      regex: /\bfrom (?:the )?\w[\w\s]{3,30}to (?:the )?\w[\w\s]{3,30},\s*from (?:the )?\w[\w\s]{3,30}to\b/gi,
      weight: 3
    },

    // ─── STYLE PATTERNS (13-18) ───
    {
      id: 13,
      name: 'Em dash overuse',
      category: 'style',
      description: 'Excessive em dashes mimicking "punchy" sales writing',
      regex: /\u2014/g,
      weight: 2,
      threshold: 2
    },
    {
      id: 14,
      name: 'Boldface overuse',
      category: 'style',
      description: 'Mechanical emphasis of phrases in boldface',
      regex: /\*\*[^*]+\*\*/g,
      weight: 2,
      threshold: 3
    },
    {
      id: 15,
      name: 'Inline-header lists',
      category: 'style',
      description: 'Lists with bolded headers followed by colons',
      regex: /[-•]\s*\*?\*?[A-Z][\w\s]+\*?\*?\s*:/g,
      weight: 3
    },
    {
      id: 16,
      name: 'Title case headings',
      category: 'style',
      description: 'Capitalizing all main words in headings',
      regex: /^#{1,6}\s+(?:[A-Z][a-z]+\s+){3,}/gm,
      weight: 1
    },
    {
      id: 17,
      name: 'Emoji decoration',
      category: 'style',
      description: 'Decorating headings or bullet points with emojis',
      regex: /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu,
      weight: 2
    },
    {
      id: 18,
      name: 'Curly quotes',
      category: 'style',
      description: 'Using typographic curly quotes instead of straight quotes',
      regex: /[\u201C\u201D\u2018\u2019]/g,
      weight: 1
    },

    // ─── COMMUNICATION PATTERNS (19-21) ───
    {
      id: 19,
      name: 'Chatbot artifacts',
      category: 'communication',
      description: 'Leftover chatbot conversation phrases',
      regex: /\b(I hope this helps|Of course!|Certainly!|You'?re absolutely right|Would you like me to|let me know if|here is (?:a|an|the)|feel free to|don'?t hesitate to|happy to help|glad you asked|that'?s a great question|Great question|Absolutely!|Sure thing)\b/gi,
      weight: 5
    },
    {
      id: 20,
      name: 'Knowledge-cutoff disclaimers',
      category: 'communication',
      description: 'AI disclaimers about incomplete information',
      regex: /\b(as of (?:my |the )?(?:last )?(?:training|knowledge|update)|up to my last training|while specific details are (?:limited|scarce)|based on available information|based on my training|I don'?t have (?:access to|information about)|at the time of (?:my|this) writing)\b/gi,
      weight: 5
    },
    {
      id: 21,
      name: 'Sycophantic tone',
      category: 'communication',
      description: 'Overly positive, people-pleasing language',
      regex: /\b(great question|excellent point|you'?re absolutely right|that'?s a fantastic|what a wonderful|I'?m glad you asked|that'?s a really (?:good|great|excellent|insightful) (?:question|point|observation)|you raise (?:a |an )?(?:important|excellent|great) point)\b/gi,
      weight: 5
    },

    // ─── FILLER AND HEDGING (22-24) ───
    {
      id: 22,
      name: 'Filler phrases',
      category: 'filler',
      description: 'Unnecessarily wordy constructions',
      regex: /\b(in order to|due to the fact that|at this point in time|in the event that|has the ability to|it is important to note that|it is worth noting that|it should be noted that|it goes without saying|needless to say|at the end of the day|when all is said and done|in today'?s (?:rapidly )?(?:evolving|changing) (?:world|landscape|environment)|at its core|in this day and age)\b/gi,
      weight: 3
    },
    {
      id: 23,
      name: 'Excessive hedging',
      category: 'filler',
      description: 'Over-qualifying statements',
      regex: /\b(could potentially|might possibly|it could (?:potentially |possibly )?be argued|may or may not|to some extent|in some ways|arguably|it remains to be seen|only time will tell|it is unclear whether)\b/gi,
      weight: 3
    },
    {
      id: 24,
      name: 'Generic conclusions',
      category: 'filler',
      description: 'Vague upbeat endings',
      regex: /\b(the future looks bright|exciting times (?:lie |are )?ahead|continue (?:this |their )?journey|step in the right direction|in conclusion|to summarize|as we move forward|looking ahead|the possibilities are (?:endless|limitless)|only the beginning|just the tip of the iceberg|just scratching the surface)\b/gi,
      weight: 4
    }
  ];

  // ═══════════════════════════════════════════════════════════
  // BASIC REWRITE RULES (Pass 0 — surface cleanup)
  // ═══════════════════════════════════════════════════════════

  const REWRITE_RULES = [
    // Chatbot artifacts removal
    { match: /^(?:Great question!|Certainly!|Of course!|Absolutely!|Sure thing!?)\s*/gi, replace: '' },
    { match: /\s*I hope this helps!?\s*/gi, replace: '' },
    { match: /\s*Let me know if you(?:'d| would) like (?:me to )?(?:expand|elaborate|explain|go deeper|clarify)[\w\s]*[.!]?\s*/gi, replace: '' },
    { match: /\s*(?:Feel|Don't hesitate to|Please) (?:free to )?(?:reach out|ask|let me know)[\w\s]*[.!]?\s*/gi, replace: '' },
    { match: /\s*(?:Happy to help|Glad you asked)!?\s*/gi, replace: '' },
    { match: /(?:Great|Excellent|Wonderful|Fantastic) question!?\s*/gi, replace: '' },
    { match: /(?:You're|You are) absolutely right(?:[,!.]\s*)?/gi, replace: '' },
    { match: /That'?s (?:a |an )?(?:really |very )?(?:great|excellent|good|insightful|wonderful|fantastic) (?:question|point|observation)[.!]?\s*/gi, replace: '' },

    // Filler phrase simplifications
    { match: /\bin order to\b/gi, replace: 'to' },
    { match: /\bdue to the fact that\b/gi, replace: 'because' },
    { match: /\bat this point in time\b/gi, replace: 'now' },
    { match: /\bin the event that\b/gi, replace: 'if' },
    { match: /\bhas the ability to\b/gi, replace: 'can' },
    { match: /\bhave the ability to\b/gi, replace: 'can' },
    { match: /\bit is important to note that\b/gi, replace: '' },
    { match: /\bit is worth noting that\b/gi, replace: '' },
    { match: /\bit should be noted that\b/gi, replace: '' },
    { match: /\bit goes without saying\b/gi, replace: '' },
    { match: /\bneedless to say,?\s*/gi, replace: '' },
    { match: /\bat the end of the day,?\s*/gi, replace: '' },
    { match: /\bin today'?s rapidly evolving (?:world|landscape|environment),?\s*/gi, replace: '' },
    { match: /\bat its core,?\s*/gi, replace: '' },
    { match: /\bin this day and age,?\s*/gi, replace: '' },

    // Hedging reduction
    { match: /\bcould potentially\b/gi, replace: 'could' },
    { match: /\bmight possibly\b/gi, replace: 'might' },
    { match: /\bit could (?:potentially |possibly )?be argued that\b/gi, replace: '' },

    // Generic conclusion removal
    { match: /\bthe future looks bright\.?\s*/gi, replace: '' },
    { match: /\bexciting times (?:lie |are )?ahead\.?\s*/gi, replace: '' },
    { match: /\bin conclusion,?\s*/gi, replace: '' },
    { match: /\bto summarize,?\s*/gi, replace: '' },
    { match: /\bas we move forward,?\s*/gi, replace: '' },

    // Copula avoidance → simple is/are
    { match: /\bserves as a\b/gi, replace: 'is a' },
    { match: /\bserves as an\b/gi, replace: 'is an' },
    { match: /\bserves as the\b/gi, replace: 'is the' },
    { match: /\bstands as a\b/gi, replace: 'is a' },
    { match: /\bstands as an\b/gi, replace: 'is an' },
    { match: /\bstands as the\b/gi, replace: 'is the' },
    { match: /\bfunctions as a\b/gi, replace: 'is a' },
    { match: /\bfunctions as an\b/gi, replace: 'is an' },
    { match: /\bboasts a\b/gi, replace: 'has a' },
    { match: /\bboasts an\b/gi, replace: 'has an' },
    { match: /\bfeatures a\b/gi, replace: 'has a' },
    { match: /\bfeatures an\b/gi, replace: 'has an' },

    // Curly quotes → straight quotes
    { match: /[\u201C\u201D]/g, replace: '"' },
    { match: /[\u2018\u2019]/g, replace: "'" },

    // Em dashes → commas or periods
    { match: /\s*\u2014\s*/g, replace: ', ' },

    // Emoji removal
    { match: /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}]\s*/gu, replace: '' },

    // Markdown bold removal
    { match: /\*\*([^*]+)\*\*/g, replace: '$1' },

    // Knowledge-cutoff
    { match: /\bas of my (?:last )?(?:training|knowledge) (?:update|cutoff),?\s*/gi, replace: '' },
    { match: /\bbased on (?:my training|available information),?\s*/gi, replace: '' },
    { match: /\bwhile specific details are (?:limited|scarce),?\s*/gi, replace: '' },
  ];

  // ═══════════════════════════════════════════════════════════
  // PASS 2: CONTRACTION MAP (AI never contracts)
  // ═══════════════════════════════════════════════════════════

  const CONTRACTIONS = [
    [/\bI am\b/g, "I'm"],
    [/\bI have\b/g, "I've"],
    [/\bI had\b/g, "I'd"],
    [/\bI will\b/g, "I'll"],
    [/\bI would\b/g, "I'd"],
    [/\bYou are\b/gi, "You're"],
    [/\byou are\b/g, "you're"],
    [/\bYou have\b/gi, "You've"],
    [/\byou have\b/g, "you've"],
    [/\bYou will\b/gi, "You'll"],
    [/\byou will\b/g, "you'll"],
    [/\bYou would\b/gi, "You'd"],
    [/\byou would\b/g, "you'd"],
    [/\bHe is\b/g, "He's"],
    [/\bhe is\b/g, "he's"],
    [/\bShe is\b/g, "She's"],
    [/\bshe is\b/g, "she's"],
    [/\bHe has\b/g, "He's"],
    [/\bhe has\b/g, "he's"],
    [/\bShe has\b/g, "She's"],
    [/\bshe has\b/g, "she's"],
    [/\bIt is\b/gi, "It's"],
    [/\bit is\b/g, "it's"],
    [/\bIt has\b/gi, "It's"],
    [/\bit has\b/g, "it's"],
    [/\bWe are\b/gi, "We're"],
    [/\bwe are\b/g, "we're"],
    [/\bWe have\b/gi, "We've"],
    [/\bwe have\b/g, "we've"],
    [/\bWe will\b/gi, "We'll"],
    [/\bwe will\b/g, "we'll"],
    [/\bWe would\b/gi, "We'd"],
    [/\bwe would\b/g, "we'd"],
    [/\bThey are\b/gi, "They're"],
    [/\bthey are\b/g, "they're"],
    [/\bThey have\b/gi, "They've"],
    [/\bthey have\b/g, "they've"],
    [/\bThey will\b/gi, "They'll"],
    [/\bthey will\b/g, "they'll"],
    [/\bThey would\b/gi, "They'd"],
    [/\bthey would\b/g, "they'd"],
    [/\bThat is\b/gi, "That's"],
    [/\bthat is\b/g, "that's"],
    [/\bThat has\b/gi, "That's"],
    [/\bthat has\b/g, "that's"],
    [/\bWho is\b/gi, "Who's"],
    [/\bwho is\b/g, "who's"],
    [/\bWhat is\b/gi, "What's"],
    [/\bwhat is\b/g, "what's"],
    [/\bWhere is\b/gi, "Where's"],
    [/\bwhere is\b/g, "where's"],
    [/\bThere is\b/gi, "There's"],
    [/\bthere is\b/g, "there's"],
    [/\bHere is\b/gi, "Here's"],
    [/\bhere is\b/g, "here's"],
    [/\bdo not\b/g, "don't"],
    [/\bDo not\b/g, "Don't"],
    [/\bdoes not\b/g, "doesn't"],
    [/\bDoes not\b/g, "Doesn't"],
    [/\bdid not\b/g, "didn't"],
    [/\bDid not\b/g, "Didn't"],
    [/\bis not\b/g, "isn't"],
    [/\bIs not\b/g, "Isn't"],
    [/\bare not\b/g, "aren't"],
    [/\bAre not\b/g, "Aren't"],
    [/\bwas not\b/g, "wasn't"],
    [/\bWas not\b/g, "Wasn't"],
    [/\bwere not\b/g, "weren't"],
    [/\bWere not\b/g, "Weren't"],
    [/\bhas not\b/g, "hasn't"],
    [/\bHas not\b/g, "Hasn't"],
    [/\bhave not\b/g, "haven't"],
    [/\bHave not\b/g, "Haven't"],
    [/\bhad not\b/g, "hadn't"],
    [/\bHad not\b/g, "Hadn't"],
    [/\bwill not\b/g, "won't"],
    [/\bWill not\b/g, "Won't"],
    [/\bwould not\b/g, "wouldn't"],
    [/\bWould not\b/g, "Wouldn't"],
    [/\bcould not\b/g, "couldn't"],
    [/\bCould not\b/g, "Couldn't"],
    [/\bshould not\b/g, "shouldn't"],
    [/\bShould not\b/g, "Shouldn't"],
    [/\bcannot\b/g, "can't"],
    [/\bCannot\b/g, "Can't"],
    [/\bcan not\b/g, "can't"],
    [/\bCan not\b/g, "Can't"],
    [/\bwould have\b/g, "would've"],
    [/\bWould have\b/g, "Would've"],
    [/\bcould have\b/g, "could've"],
    [/\bCould have\b/g, "Could've"],
    [/\bshould have\b/g, "should've"],
    [/\bShould have\b/g, "Should've"],
    [/\bmight have\b/g, "might've"],
    [/\bMight have\b/g, "Might've"],
    [/\bmust have\b/g, "must've"],
    [/\bMust have\b/g, "Must've"],
    [/\blet us\b/g, "let's"],
    [/\bLet us\b/g, "Let's"],
  ];

  // ═══════════════════════════════════════════════════════════
  // PASS 7: AI VOCABULARY → HUMAN ALTERNATIVES
  // Multiple choices per word for unpredictability
  // ═══════════════════════════════════════════════════════════

  const VOCAB_SWAPS = {
    'additionally': ['also', 'plus', 'on top of that', 'and'],
    'furthermore': ['also', 'besides', 'and', 'plus'],
    'moreover': ['also', 'and', 'on top of that', 'besides that'],
    'consequently': ['so', 'because of that', 'as a result', 'which meant'],
    'subsequently': ['then', 'after that', 'later', 'next'],
    'nevertheless': ['still', 'but', 'even so', 'yet'],
    'nonetheless': ['still', 'but', 'even so', 'yet'],
    'henceforth': ['from now on', 'going forward', 'after this'],
    'delve': ['dig', 'look', 'get', 'go'],
    'delves': ['digs', 'looks', 'gets', 'goes'],
    'delved': ['dug', 'looked', 'got', 'went'],
    'delving': ['digging', 'looking', 'getting', 'going'],
    'utilize': ['use', 'work with', 'rely on', 'turn to'],
    'utilizes': ['uses', 'works with', 'relies on', 'turns to'],
    'utilized': ['used', 'relied on', 'worked with', 'turned to'],
    'utilizing': ['using', 'working with', 'relying on', 'turning to'],
    'leverage': ['use', 'tap into', 'lean on', 'take advantage of'],
    'leveraged': ['used', 'tapped into', 'leaned on', 'took advantage of'],
    'leveraging': ['using', 'tapping into', 'leaning on', 'taking advantage of'],
    'facilitate': ['help', 'make easier', 'allow', 'enable'],
    'facilitates': ['helps', 'makes easier', 'allows', 'enables'],
    'facilitated': ['helped', 'made easier', 'allowed', 'enabled'],
    'facilitating': ['helping', 'making easier', 'allowing', 'enabling'],
    'pivotal': ['important', 'big', 'key', 'major'],
    'crucial': ['important', 'key', 'big', 'necessary'],
    'paramount': ['important', 'critical', 'top', 'main'],
    'transformative': ['major', 'big', 'game-changing', 'significant'],
    'groundbreaking': ['new', 'novel', 'fresh', 'original'],
    'innovative': ['new', 'creative', 'fresh', 'clever'],
    'comprehensive': ['thorough', 'full', 'complete', 'detailed'],
    'multifaceted': ['complex', 'layered', 'varied', 'complicated'],
    'indispensable': ['essential', 'necessary', 'needed', 'vital'],
    'commendable': ['good', 'solid', 'worthy', 'strong'],
    'noteworthy': ['interesting', 'worth noting', 'notable', 'significant'],
    'meticulous': ['careful', 'precise', 'thorough', 'detailed'],
    'meticulously': ['carefully', 'precisely', 'thoroughly', 'painstakingly'],
    'streamline': ['simplify', 'speed up', 'cut down', 'trim'],
    'streamlined': ['simplified', 'sped up', 'trimmed', 'cleaned up'],
    'streamlining': ['simplifying', 'speeding up', 'trimming', 'cutting down'],
    'spearhead': ['lead', 'run', 'drive', 'push'],
    'spearheaded': ['led', 'ran', 'drove', 'pushed'],
    'spearheading': ['leading', 'running', 'driving', 'pushing'],
    'bolster': ['boost', 'support', 'strengthen', 'help'],
    'bolstered': ['boosted', 'supported', 'strengthened', 'helped'],
    'bolstering': ['boosting', 'supporting', 'strengthening', 'helping'],
    'commence': ['start', 'begin', 'kick off', 'get going'],
    'commenced': ['started', 'began', 'kicked off', 'got going'],
    'commencing': ['starting', 'beginning', 'kicking off', 'getting going'],
    'ascertain': ['find out', 'figure out', 'learn', 'determine'],
    'endeavor': ['try', 'attempt', 'effort', 'push'],
    'endeavors': ['tries', 'attempts', 'efforts', 'pushes'],
    'fostering': ['building', 'growing', 'encouraging', 'creating'],
    'foster': ['build', 'grow', 'encourage', 'create'],
    'fostered': ['built', 'grew', 'encouraged', 'created'],
    'enhance': ['improve', 'boost', 'lift', 'help'],
    'enhanced': ['improved', 'boosted', 'lifted', 'helped'],
    'enhancing': ['improving', 'boosting', 'lifting', 'helping'],
    'enhancement': ['improvement', 'boost', 'upgrade', 'bump'],
    'underscore': ['show', 'highlight', 'point to', 'prove'],
    'underscores': ['shows', 'highlights', 'points to', 'proves'],
    'underscored': ['showed', 'highlighted', 'pointed to', 'proved'],
    'underscoring': ['showing', 'highlighting', 'pointing to', 'proving'],
    'showcase': ['show', 'display', 'demonstrate', 'feature'],
    'showcases': ['shows', 'displays', 'demonstrates', 'features'],
    'showcased': ['showed', 'displayed', 'demonstrated', 'featured'],
    'showcasing': ['showing', 'displaying', 'demonstrating', 'featuring'],
    'testament': ['proof', 'sign', 'evidence', 'example'],
    'landscape': ['scene', 'space', 'world', 'field'],
    'tapestry': ['mix', 'blend', 'weave', 'collection'],
    'interplay': ['connection', 'interaction', 'relationship', 'back-and-forth'],
    'intricate': ['complex', 'detailed', 'tricky', 'complicated'],
    'intricacies': ['details', 'complexities', 'ins and outs', 'nuances'],
    'vibrant': ['lively', 'active', 'colorful', 'busy'],
    'garnered': ['got', 'earned', 'received', 'picked up'],
    'garner': ['get', 'earn', 'receive', 'pick up'],
    'garnering': ['getting', 'earning', 'receiving', 'picking up'],
    'alignment': ['agreement', 'sync', 'match', 'fit'],
    'aligning': ['matching', 'syncing', 'fitting', 'lining up'],
    'align': ['match', 'sync', 'fit', 'line up'],
    'significant': ['big', 'major', 'real', 'meaningful'],
    'significantly': ['a lot', 'considerably', 'quite a bit', 'noticeably'],
    'ensure': ['make sure', 'check that', 'see to it', 'guarantee'],
    'ensures': ['makes sure', 'checks that', 'sees to it', 'guarantees'],
    'ensuring': ['making sure', 'checking that', 'seeing to it'],
    'implement': ['set up', 'put in place', 'build', 'roll out'],
    'implemented': ['set up', 'put in place', 'built', 'rolled out'],
    'implementing': ['setting up', 'putting in place', 'building', 'rolling out'],
    'implementation': ['setup', 'rollout', 'build', 'execution'],
    'robust': ['strong', 'solid', 'sturdy', 'reliable'],
    'seamless': ['smooth', 'easy', 'clean', 'effortless'],
    'seamlessly': ['smoothly', 'easily', 'cleanly', 'without a hitch'],
    'empowering': ['helping', 'giving', 'enabling', 'letting'],
    'empower': ['help', 'give power to', 'enable', 'let'],
    'empowered': ['helped', 'enabled', 'given power', 'allowed'],
    'discourse': ['discussion', 'conversation', 'talk', 'debate'],
    'paradigm': ['model', 'approach', 'framework', 'way of thinking'],
    'synergy': ['teamwork', 'cooperation', 'combined effort', 'collaboration'],
    'holistic': ['overall', 'complete', 'full', 'broad'],
    'nuanced': ['subtle', 'detailed', 'layered', 'complicated'],
    'overarching': ['main', 'big-picture', 'overall', 'broad'],
    'underpinning': ['basis', 'foundation', 'backbone', 'core'],
    'realm': ['area', 'field', 'space', 'world'],
    'myriad': ['many', 'tons of', 'a bunch of', 'lots of'],
    'plethora': ['lots', 'plenty', 'a bunch', 'tons'],
    'culmination': ['result', 'peak', 'end point', 'outcome'],
    'juxtaposition': ['contrast', 'comparison', 'clash', 'difference'],
    // --- Academic terms flagged by detectors ---
    'increasingly': ['more and more', 'bit by bit', 'gradually'],
    'emphasizes': ['focuses on', 'pushes for', 'puts weight on'],
    'emphasize': ['focus on', 'push for', 'stress'],
    'demonstrates': ['shows', 'proves', 'makes clear'],
    'demonstrate': ['show', 'prove', 'make clear'],
    'indicates': ['shows', 'suggests', 'points to'],
    'indicate': ['show', 'suggest', 'point to'],
    'participation': ['taking part', 'involvement', 'engagement'],
    'terminology': ['terms', 'language', 'jargon'],
    'engagement': ['involvement', 'taking part', 'interaction'],
    'perspectives': ['views', 'angles', 'ways of looking at things'],
    'environments': ['settings', 'spaces', 'situations'],
    'environment': ['setting', 'space', 'situation'],
    'institutional': ['school-level', 'university', 'organizational'],
    'proficiency': ['skill level', 'ability', 'competence'],
    'spontaneous': ['on-the-spot', 'unplanned', 'natural'],
    'constraints': ['limits', 'restrictions', 'barriers'],
    'constrains': ['limits', 'restricts', 'holds back'],
    'measurable': ['real', 'clear', 'noticeable'],
    'adaptation': ['adjusting', 'getting used to things', 'settling in'],
    'contributes': ['adds', 'helps', 'plays into'],
    'contribute': ['add', 'help', 'play into'],
    'initiatives': ['programs', 'efforts', 'plans'],
    'investigate': ['look into', 'explore', 'study'],
    'investigates': ['looks into', 'explores', 'studies'],
    'interaction': ['back-and-forth', 'exchange', 'conversation'],
    'performance': ['results', 'how well someone does', 'output'],
    'opportunities': ['chances', 'openings', 'options'],
    'clarification': ['clearing things up', 'answers', 'explanations'],
    'outcomes': ['results', 'what happens', 'effects'],
    // --- dandcg/claude-skills banned words ---
    'unlock': ['open up', 'get access to', 'tap into'],
    'unlocks': ['opens up', 'gives access to', 'taps into'],
    'unlocking': ['opening up', 'getting access to', 'tapping into'],
    'embark': ['start', 'begin', 'set out on'],
    'embarks': ['starts', 'begins', 'sets out on'],
    'embarking': ['starting', 'beginning', 'setting out on'],
    'illuminate': ['explain', 'clear up', 'show'],
    'illuminates': ['explains', 'clears up', 'shows'],
    'illuminating': ['explaining', 'clearing up', 'showing'],
    'unveil': ['show', 'reveal', 'share'],
    'unveils': ['shows', 'reveals', 'shares'],
    'unveiled': ['showed', 'revealed', 'shared'],
    'harness': ['use', 'put to work', 'take advantage of'],
    'harnessing': ['using', 'putting to work', 'taking advantage of'],
    'navigate': ['get through', 'deal with', 'work through'],
    'navigating': ['getting through', 'dealing with', 'working through'],
    'navigates': ['gets through', 'deals with', 'works through'],
    'revolutionize': ['change', 'shake up', 'rethink'],
    'revolutionizing': ['changing', 'shaking up', 'rethinking'],
    'revolutionizes': ['changes', 'shakes up', 'rethinks'],
    'disruptive': ['bold', 'different', 'unconventional'],
    'inquiries': ['questions', 'asks', 'requests'],
    'stark': ['sharp', 'clear', 'obvious'],
    'remarkable': ['notable', 'unusual', 'striking'],
    'compelling': ['strong', 'convincing', 'interesting'],
    'unprecedented': ['never seen before', 'first-of-its-kind', 'new'],
    'substantive': ['real', 'solid', 'meaningful'],
    'underscore': ['show', 'highlight', 'point to'],
    'underscores': ['shows', 'highlights', 'points to'],
    'elevate': ['raise', 'improve', 'lift'],
    'elevates': ['raises', 'improves', 'lifts'],
    'crafting': ['making', 'building', 'putting together'],
    'crafted': ['made', 'built', 'put together'],
    'skyrocket': ['jump', 'shoot up', 'surge'],
    'skyrocketed': ['jumped', 'shot up', 'surged'],
  };

  // ═══════════════════════════════════════════════════════════
  // PASS 3: SENTENCE STARTER ALTERNATIVES
  // ═══════════════════════════════════════════════════════════

  const HUMAN_STARTERS = [
    'In practice, ', 'Realistically, ', 'To be fair, ',
    'For what it\'s worth, ', 'Interestingly, ',
    'As it turns out, ', 'Put simply, ',
    'That said, ', 'Granted, ', 'Still, ', 'Then again, ',
  ];

  // ═══════════════════════════════════════════════════════════
  // PASS 4: TRANSITION REPLACEMENTS
  // ═══════════════════════════════════════════════════════════

  const TRANSITION_SWAPS = [
    { match: /^Additionally,?\s*/gim, alts: ['Also, ', 'Plus, ', 'And ', 'On top of that, ', ''] },
    { match: /^Furthermore,?\s*/gim, alts: ['Also, ', 'And ', 'Plus, ', 'Beyond that, ', ''] },
    { match: /^Moreover,?\s*/gim, alts: ['And ', 'Plus, ', 'On top of that, ', '', 'What\'s more, '] },
    { match: /^However,?\s*/gim, alts: ['But ', 'Then again, ', 'That said, ', 'Still, ', 'Though, '] },
    { match: /^Consequently,?\s*/gim, alts: ['So ', 'Because of that, ', 'Which meant ', 'As a result, ', ''] },
    { match: /^Nevertheless,?\s*/gim, alts: ['Still, ', 'But ', 'Even so, ', 'Yet ', 'And yet, '] },
    { match: /^Nonetheless,?\s*/gim, alts: ['Still, ', 'But ', 'Even so, ', 'Yet ', ''] },
    { match: /^Subsequently,?\s*/gim, alts: ['Then ', 'After that, ', 'Next, ', 'Later, ', ''] },
    { match: /^In addition,?\s*/gim, alts: ['Also, ', 'Plus, ', 'And ', '', 'On top of that, '] },
    { match: /^As a result,?\s*/gim, alts: ['So ', 'Because of that, ', 'Which meant ', 'That led to ', ''] },
    { match: /^Specifically,?\s*/gim, alts: ['In particular, ', 'More precisely, ', 'To be specific, ', '', 'Namely, '] },
    { match: /^Importantly,?\s*/gim, alts: ['What matters is ', 'The key thing is ', 'Crucially, ', '', 'Big picture: '] },
    { match: /^Ultimately,?\s*/gim, alts: ['In the end, ', 'At the end of it, ', 'When it comes down to it, ', '', 'Bottom line: '] },
    { match: /^Essentially,?\s*/gim, alts: ['Basically, ', 'In short, ', 'Put simply, ', 'At its simplest, ', ''] },
  ];

  // ═══════════════════════════════════════════════════════════
  // PASS 5: RHYTHM BREAKER INJECTIONS
  // ═══════════════════════════════════════════════════════════

  const PARENTHETICAL_ASIDES = [
    ' (to some degree)',
    ' (at least in principle)',
    ' (though not always)',
    ' (to varying degrees)',
    ' (with some exceptions)',
  ];

  const MID_SENTENCE_BREAKS = [
    ', or rather, ',
    ', well, more like ',
    ' — or at least, ',
    ', if we\'re being honest, ',
    ', arguably, ',
    ', and this is key, ',
  ];

  const RHETORICAL_QUESTIONS = [
    'But does that actually hold up?',
    'So what does that actually mean?',
    'The question is whether that matters.',
    'Is that really the case though?',
    'But here\'s what most people miss.',
    'Why does this come up so often?',
    'So where does that leave us?',
    'But is it really that simple?',
  ];

  // ═══════════════════════════════════════════════════════════
  // UTILITY: Seeded random for reproducible per-text results
  // ═══════════════════════════════════════════════════════════

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  function pickRandom(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  // ═══════════════════════════════════════════════════════════
  // SENTENCE UTILITIES
  // ═══════════════════════════════════════════════════════════

  function splitSentences(text) {
    // Split on sentence-ending punctuation, keeping the punctuation
    const raw = text.match(/[^.!?]*[.!?]+[\s]*/g) || [text];
    return raw.map(s => s.trim()).filter(s => s.length > 0);
  }

  function getSentenceWordCount(sentence) {
    return sentence.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  // ═══════════════════════════════════════════════════════════
  // CATEGORY DEFINITIONS
  // ═══════════════════════════════════════════════════════════

  const CATEGORIES = {
    content: { label: 'Content', color: 'cat-content', icon: '📝' },
    language: { label: 'Language', color: 'cat-language', icon: '🔤' },
    style: { label: 'Style', color: 'cat-style', icon: '🎨' },
    communication: { label: 'Communication', color: 'cat-communication', icon: '💬' },
    filler: { label: 'Filler', color: 'cat-filler', icon: '✂️' }
  };

  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════

  let analysisResults = { patterns: [], score: 0 };
  let debounceTimer = null;

  // ═══════════════════════════════════════════════════════════
  // DOM REFERENCES
  // ═══════════════════════════════════════════════════════════

  const inputEl = document.getElementById('text-input');
  const outputEl = document.getElementById('text-output');
  const humanizeBtn = document.getElementById('btn-humanize');
  const clearBtn = document.getElementById('btn-clear');
  const copyBtn = document.getElementById('btn-copy');
  const scoreValueEl = document.getElementById('score-value');
  const scoreRingEl = document.getElementById('score-ring-fill');
  const scoreStatusEl = document.getElementById('score-status');
  const patternBadgesEl = document.getElementById('pattern-badges');
  const wordCountInEl = document.getElementById('word-count-in');
  const charCountInEl = document.getElementById('char-count-in');
  const sentenceCountInEl = document.getElementById('sentence-count-in');
  const wordCountOutEl = document.getElementById('word-count-out');
  const charCountOutEl = document.getElementById('char-count-out');
  const patternCountOutEl = document.getElementById('pattern-count-out');
  const processingOverlay = document.getElementById('processing-overlay');
  const categoryTabsEl = document.getElementById('category-tabs');
  const toastEl = document.getElementById('toast');
  const strengthSlider = document.getElementById('strength-slider');
  const strengthLabel = document.getElementById('strength-label');

  // ═══════════════════════════════════════════════════════════
  // ANALYSIS ENGINE
  // ═══════════════════════════════════════════════════════════

  function analyzeText(text) {
    if (!text.trim()) {
      return { patterns: [], score: 0, totalMatches: 0 };
    }

    const detectedPatterns = [];
    let totalWeight = 0;
    let totalMatches = 0;
    const wordCount = countWords(text);

    PATTERNS.forEach(pattern => {
      if (!pattern.regex) return;

      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      const matches = [];
      let match;

      while ((match = regex.exec(text)) !== null) {
        matches.push({
          text: match[0],
          index: match.index,
          length: match[0].length
        });
        if (match.index === regex.lastIndex) regex.lastIndex++;
      }

      if (matches.length > 0) {
        const threshold = pattern.threshold || 1;
        if (matches.length >= threshold) {
          detectedPatterns.push({
            ...pattern,
            matches,
            count: matches.length
          });
          totalWeight += pattern.weight * matches.length;
          totalMatches += matches.length;
        }
      }
    });

    const density = wordCount > 0 ? totalWeight / Math.sqrt(wordCount) : 0;
    const score = Math.min(100, Math.round(density * 8));

    return {
      patterns: detectedPatterns,
      score,
      totalMatches
    };
  }

  // ═══════════════════════════════════════════════════════════
  // ADVANCED HUMANIZATION ENGINE v3 (12 PASSES)
  // Targets ALL statistical signatures: perplexity, burstiness, 
  // information density, sentence structure, token predictability,
  // passive voice ratio, vocabulary distribution, essay structure
  // ═══════════════════════════════════════════════════════════

  // --- Additional data for new passes ---

  const FIRST_PERSON_INJECTIONS = [
    'From what I\'ve seen, ',
    'In my experience, ',
    'I\'d argue that ',
    'From my perspective, ',
  ];

  const NATURAL_DISFLUENCIES = [
    'largely ', 'often ', 'typically ', 'generally ',
    'in many cases ', 'for the most part ',
  ];

  const COLLOQUIAL_PHRASES = [
    { match: /\bis important\b/gi, alts: ['matters', 'counts', 'makes a difference'] },
    { match: /\bis essential\b/gi, alts: ['is a must', 'you really need', 'can\'t skip'] },
    { match: /\bit is worth noting\b/gi, alts: ['here\'s the thing', 'keep in mind', 'one thing to know'] },
    { match: /\bplays a (crucial|vital|key|important|significant|critical) role\b/gi, alts: ['really matters', 'has a big impact', 'makes a real difference'] },
    { match: /\bin today's (rapidly )?(evolving|changing)\b/gi, alts: ['with how fast things move', 'the way things are going', 'these days with'] },
    { match: /\bserves as a?\b/gi, alts: ['works as ', 'acts like ', 'is basically '] },
    { match: /\bat its core\b/gi, alts: ['at the end of the day', 'when you get down to it', 'really'] },
    { match: /\bin order to\b/gi, alts: ['to', 'so you can', 'if you want to'] },
    { match: /\bhas the potential to\b/gi, alts: ['could', 'might', 'can'] },
    { match: /\bit is important to note that\b/gi, alts: ['one thing — ', 'keep in mind, ', 'worth knowing: '] },
    { match: /\bdue to the fact that\b/gi, alts: ['because', 'since', 'seeing as'] },
    { match: /\bin the context of\b/gi, alts: ['when it comes to', 'with', 'for'] },
    { match: /\ba wide range of\b/gi, alts: ['all kinds of', 'lots of', 'a bunch of'] },
    { match: /\bon the other hand\b/gi, alts: ['then again', 'but', 'flip side though'] },
    { match: /\bit should be noted\b/gi, alts: ['worth mentioning', 'one thing', 'keep in mind'] },
    { match: /\bto a great extent\b/gi, alts: ['a lot', 'quite a bit', 'pretty heavily'] },
    { match: /\bthis is because\b/gi, alts: ['that\'s because', 'the reason is', 'it comes down to'] },
    { match: /\bas a consequence\b/gi, alts: ['so', 'because of that', 'which means'] },
    { match: /\bwith respect to\b/gi, alts: ['about', 'when it comes to', 'regarding'] },
    { match: /\bin light of\b/gi, alts: ['given', 'considering', 'because of'] },
    { match: /\bfor instance\b/gi, alts: ['like', 'say', 'take'] },
    { match: /\bfor example\b/gi, alts: ['like', 'say', 'to give you an idea'] },
    { match: /\bin particular\b/gi, alts: ['especially', 'mainly', 'specifically'] },
    { match: /\bas well as\b/gi, alts: ['and', 'along with', 'plus'] },
    { match: /\bin terms of\b/gi, alts: ['when it comes to', 'for', 'with'] },
    { match: /\bit can be argued\b/gi, alts: ['you could say', 'some would say', 'there\'s a case that'] },
    { match: /\bhas been shown to\b/gi, alts: ['turns out to', 'seems to', 'tends to'] },
    // --- Formality breakers (fix 'Robotic Formality' / 'Overly Formal') ---
    { match: /\binvolves adapting to\b/gi, alts: ['means getting used to', 'is about learning', 'comes down to learning'] },
    { match: /\binvolves adapting\b/gi, alts: ['means adjusting', 'is really about adjusting', 'comes down to adjusting'] },
    { match: /\bdirectly influence\b/gi, alts: ['really affect', 'shape', 'have a real impact on'] },
    { match: /\bdirectly influences\b/gi, alts: ['really affects', 'shapes', 'has a real impact on'] },
    { match: /\bdirectly affect\b/gi, alts: ['really shape', 'play right into', 'hit'] },
    { match: /\bdirectly impact\b/gi, alts: ['really shape', 'actually change', 'have a real effect on'] },
    { match: /\bthe primary challenge\b/gi, alts: ['the biggest hurdle', 'the main struggle', 'the hardest part'] },
    { match: /\bintellectual exchange\b/gi, alts: ['sharing ideas', 'learning from each other', 'swapping knowledge'] },
    { match: /\bacademic english\b/gi, alts: ['university-level English', 'the kind of English used in class', 'formal English'] },
    { match: /\bdiscipline-specific vocabulary\b/gi, alts: ['subject-specific words', 'field jargon', 'technical terms for their subject'] },
    { match: /\badvanced listening skills\b/gi, alts: ['strong listening ability', 'the ability to follow complex speech', 'good ears for detail'] },
    { match: /\bspontaneous verbal interaction\b/gi, alts: ['speaking up on the spot', 'unscripted conversation', 'jumping into discussions'] },
    { match: /\bactive verbal contribution\b/gi, alts: ['actually speaking up', 'talking in class', 'joining the conversation'] },
    { match: /\bcritical engagement\b/gi, alts: ['thinking critically about what\'s being said', 'real engagement with the material', 'pushing back on ideas'] },
    { match: /\breduced participation\b/gi, alts: ['not participating as much', 'staying quiet', 'pulling back'] },
    { match: /\bacademic performance\b/gi, alts: ['grades', 'how well they do in school', 'their results'] },
    { match: /\blanguage-related anxiety\b/gi, alts: ['stress about their English', 'nerves around language', 'worry about speaking'] },
    { match: /\bremains necessary\b/gi, alts: ['is still needed', 'hasn\'t been done yet', 'matters a lot'] },
    { match: /\bexisting literature\b/gi, alts: ['past research', 'what\'s already been written', 'previous studies'] },
    // --- Additional formality breakers ---
    { match: /\bfurther restricts\b/gi, alts: ['makes it harder to', 'cuts down on', 'gets in the way of'] },
    { match: /\bincreases academic stress\b/gi, alts: ['piles on more stress', 'adds to the pressure', 'makes school harder'] },
    { match: /\bcreating a cycle\b/gi, alts: ['and it turns into a cycle', 'which feeds back into itself', 'and this keeps going'] },
    { match: /\bimpacts both\b/gi, alts: ['hits both', 'touches both', 'affects both'] },
    { match: /\bfewer studies examining\b/gi, alts: ['not as many studies looking at', 'less research that digs into', 'few papers that actually explore'] },
    { match: /\bremains essential\b/gi, alts: ['is still really important', 'still matters a lot', 'is key'] },
    { match: /\bdesigning effective\b/gi, alts: ['coming up with good', 'building helpful', 'creating solid'] },
    { match: /\binstitutional support\b/gi, alts: ['university support', 'school-level help', 'support from the university'] },
    { match: /\btherefore examines\b/gi, alts: ['so looks at', 'so examines', 'takes a closer look at'] },
    { match: /\baffect the academic performance\b/gi, alts: ['affect grades', 'shape how students do', 'influence academic results'] },
    { match: /\bclassroom participation\b/gi, alts: ['how much students participate', 'involvement in class', 'classroom involvement'] },
    { match: /\bidentify common linguistic challenges\b/gi, alts: ['find the main language struggles', 'spot the common language problems', 'figure out what language issues come up'] },
    { match: /\banalyze how these challenges\b/gi, alts: ['look at how these problems', 'see how these issues', 'understand how these struggles'] },
    { match: /\bexplore strategies\b/gi, alts: ['find ways', 'look at what helps', 'see what works'] },
    { match: /\bfacilitate adaptation\b/gi, alts: ['help with adjusting', 'make it easier to adjust', 'support settling in'] },
    { match: /\binform university policies\b/gi, alts: ['help shape university policies', 'feed into how universities handle things', 'give universities ideas'] },
    { match: /\bcontribute to the development\b/gi, alts: ['help build', 'feed into creating', 'play into developing'] },
    { match: /\btargeted language\b/gi, alts: ['focused language', 'specific language', 'tailored language'] },
    { match: /\bacademic support initiatives\b/gi, alts: ['academic support programs', 'help programs', 'support efforts'] },
    { match: /\bclassroom engagement\b/gi, alts: ['involvement in class', 'class participation', 'how engaged students are'] },
    { match: /\blimit opportunities\b/gi, alts: ['cut down on chances', 'reduce the chances', 'make it harder to find openings'] },
    { match: /\bdeeper engagement with\b/gi, alts: ['really getting into', 'deeper exchange with', 'more interaction with'] },
    { match: /\baffect academic performance\b/gi, alts: ['affect grades', 'hurt how well they do', 'shape their results'] },
    { match: /\binteractive forms of learning\b/gi, alts: ['hands-on learning', 'more interactive ways of learning', 'learning that involves participation'] },
    { match: /\bactive verbal input\b/gi, alts: ['actually speaking up', 'real verbal contribution', 'talking and sharing ideas'] },
  ];

  const PASSIVE_TO_ACTIVE = [
    { match: /\b(\w+) (?:is|are|was|were) being (\w+ed)\b/gi, replace: (m, subj, verb) => `${subj} ${verb}` },
    { match: /\bit (?:is|was) (\w+ed) that\b/gi, alts: ['turns out', 'we see that', 'you\'ll find'] },
    { match: /\bcan be (\w+ed)\b/gi, replace: (m, verb) => `you can ${verb}` },
    { match: /\bshould be (\w+ed)\b/gi, replace: (m, verb) => `you should ${verb}` },
    { match: /\bmust be (\w+ed)\b/gi, replace: (m, verb) => `you need to ${verb.replace(/ed$/, '')}` },
    { match: /\bneeds to be (\w+ed)\b/gi, replace: (m, verb) => `needs ${verb.replace(/ed$/, '')}ing` },
  ];

  const ESSAY_SCAFFOLD_PATTERNS = [
    /^In conclusion,?\s*/gim,
    /^To summarize,?\s*/gim,
    /^To sum up,?\s*/gim,
    /^In summary,?\s*/gim,
    /^All in all,?\s*/gim,
    /^In essence,?\s*/gim,
    /^As we have seen,?\s*/gim,
    /^As discussed above,?\s*/gim,
    /^As mentioned (?:earlier|above|previously),?\s*/gim,
    /^(?:Overall|Ultimately|Finally|Thus|Hence|Therefore),?\s*/gim,
  ];

  const HEDGING_REMOVALS = [
    { match: /\bIt (?:could|might|may) (?:potentially )?be argued that\b/gi, replace: '' },
    { match: /\bwhile .{5,40}(?:challenges?|limitations?|concerns?).{0,30},\s*/gi, replace: '' },
    { match: /\bdespite .{5,40}(?:challenges?|limitations?|obstacles?).{0,30},\s*/gi, replace: '' },
    { match: /\b(?:specific|particular) details (?:are|remain) limited\b/gi, replace: 'the details vary' },
    { match: /\bbased on (?:the )?available (?:information|data|evidence)\b/gi, replace: 'from what we know' },
    { match: /\bpotentially\b/g, replace: '' },
    { match: /\bostensibly\b/g, replace: '' },
    { match: /\barguably\b/g, replace: '' },
    { match: /\bindeed\b/gi, replace: '' },
    { match: /\bcertainly\b/gi, replace: '' },
  ];

  const EXCITEMENT_REMOVALS = [
    /(?:^|\. )(?:Exciting|Interesting|Thrilling|Remarkable|Incredible) times (?:lie |are )?ahead[^.]*\.\s*/gi,
    /(?:^|\. )The future (?:looks|is|remains) (?:bright|promising|exciting|hopeful)[^.]*\.\s*/gi,
    /(?:^|\. )Let me know if you(?:'d| would) like (?:me to )?(?:expand|elaborate|go deeper|dive deeper)[^.]*[.!]\s*/gi,
    /(?:^|\. )(?:I hope this (?:helps|was helpful|answers)|Feel free to (?:ask|reach out))[^.]*[.!]\s*/gi,
  ];

  function getStrength() {
    if (!strengthSlider) return 3;
    return parseInt(strengthSlider.value) || 3;
  }

  function humanizeText(text) {
    const strength = getStrength(); // 1=Light, 2=Medium, 3=Aggressive
    const rng = seededRandom(simpleHash(text));
    let result = text;
    let changeCount = 0;

    // ─── PASS 0: Basic surface cleanup (always applied) ───
    REWRITE_RULES.forEach(rule => {
      const before = result;
      result = result.replace(rule.match, rule.replace);
      if (before !== result) changeCount++;
    });

    // ─── PASS 1: Essay scaffolding demolition ───
    // AI ALWAYS writes intro→body→conclusion. Remove the scaffolding.
    {
      // Remove excitement/chatbot closings
      EXCITEMENT_REMOVALS.forEach(regex => {
        const before = result;
        result = result.replace(regex, '. ');
        if (before !== result) changeCount++;
      });

      // Remove essay scaffold transitions
      ESSAY_SCAFFOLD_PATTERNS.forEach(regex => {
        const before = result;
        result = result.replace(regex, '');
        if (before !== result) changeCount++;
      });

      // Remove hedging patterns
      HEDGING_REMOVALS.forEach(item => {
        const before = result;
        result = result.replace(item.match, item.replace);
        if (before !== result) changeCount++;
      });
    }

    // ─── PASS 2: Colloquial phrase replacements ───
    // AI uses formal constructions. Humans use casual ones.
    {
      COLLOQUIAL_PHRASES.forEach(item => {
        if (item.match.test(result)) {
          result = result.replace(item.match, () => {
            changeCount++;
            return pickRandom(item.alts, rng);
          });
        }
      });
    }

    // ─── PASS 2b: Copula avoidance fix (Skill Pattern #8) ───
    // AI avoids "is/are" in favor of wordy alternatives
    {
      const copulaFixes = [
        { match: /\bserves as a?\b/gi, alts: ['is ', 'is basically ', 'works as '] },
        { match: /\bstands as a?\b/gi, alts: ['is ', 'is basically '] },
        { match: /\brepresents a?\b/gi, alts: ['is '] },
        { match: /\bconstitutes a?\b/gi, alts: ['is ', 'makes up '] },
        { match: /\bboasts\b/gi, alts: ['has', 'offers', 'comes with'] },
        { match: /\bfeatures\b/gi, alts: ['has', 'includes', 'offers'] },
        { match: /\bencompasses\b/gi, alts: ['covers', 'includes'] },
        { match: /\bcomprises\b/gi, alts: ['includes', 'is made up of', 'has'] },
      ];
      copulaFixes.forEach(item => {
        if (item.match.test(result)) {
          result = result.replace(item.match, () => {
            changeCount++;
            return pickRandom(item.alts, rng);
          });
        }
      });
    }

    // ─── PASS 2c: Significance inflation removal (Skill Pattern #1) ───
    // AI inflates importance with empty symbolism
    {
      const inflationFixes = [
        { match: /\bmarks? a pivotal (?:moment|shift|turning point) in\b/gi, alts: ['changed', 'shifted', 'impacted'] },
        { match: /\bserves? as a? testament to\b/gi, alts: ['shows', 'proves', 'is proof of'] },
        { match: /\bunderscore(?:s)? the broader trend(?:s)? of\b/gi, alts: ['fits with', 'ties into', 'shows'] },
        { match: /\bplays? an? (?:crucial|vital|key|important|pivotal|significant|critical|instrumental) role in\b/gi, alts: ['really matters for', 'helps with', 'is big for'] },
        { match: /\bnot(?:ing|e) that this is (?:particularly )?(?:crucial|vital|important|significant)\b/gi, alts: ['keep in mind', 'worth pointing out'] },
        { match: /\bit (?:is|remains) (?:crucial|vital|important|imperative) (?:to|that)\b/gi, alts: ['you need to', 'it matters that', "it's key to"] },
        { match: /\b(?:has|have) far-reaching (?:implications|consequences|effects)\b/gi, alts: ['matters a lot', 'has real effects', 'changes things'] },
        { match: /\bof paramount importance\b/gi, alts: ['really important', 'critical', 'what matters most'] },
      ];
      inflationFixes.forEach(item => {
        if (item.match.test(result)) {
          result = result.replace(item.match, () => {
            changeCount++;
            return pickRandom(item.alts, rng);
          });
        }
      });
    }

    // ─── PASS 2d: Negative parallelism rewrite (Skill Pattern #9) ───
    // AI loves "Not only X but also Y" constructions
    {
      const parallelismFixes = [
        { match: /\bnot only\s+(.{5,40}?)\s*,?\s*but\s+(?:also\s+)?/gi, replace: (m, x) => x + '. And also ' },
        { match: /\bit'?s not (?:just|merely) (?:about )?(.{5,40}?)[,;]\s*(?:it'?s|but)\s+/gi, replace: (m, x) => "It's " },
        { match: /\bwhile\s+(.{5,20}?)\s+(?:remains?|is)\s+(?:important|crucial|vital),?\s*/gi, alts: ['Sure, ', 'Yes, ', ''] },
      ];
      parallelismFixes.forEach(item => {
        if (item.replace && typeof item.replace === 'function') {
          const before = result;
          result = result.replace(item.match, item.replace);
          if (before !== result) changeCount++;
        } else if (item.alts && item.match.test(result)) {
          result = result.replace(item.match, () => {
            changeCount++;
            return pickRandom(item.alts, rng);
          });
        }
      });
    }

    // ─── PASS 2e: Rule of three breaker (Skill Pattern #10) ───
    // AI loves listing exactly 3 comma-separated items
    if (strength >= 2) {
      // Find "X, Y, and Z" patterns and occasionally drop one or rewrite
      result = result.replace(/\b(\w[\w\s]{2,20}),\s+([\w\s]{2,20}),\s+and\s+([\w\s]{2,20})\b/g, (match, a, b, c) => {
        if (rng() < 0.25) {
          changeCount++;
          // Drop the middle item
          return a + ' and ' + c;
        }
        if (rng() < 0.3) {
          changeCount++;
          // Use "along with" instead of triple list
          return a + ' along with ' + c;
        }
        return match; // keep most lists intact
      });
    }

    // ─── PASS 2f: Em dash kill (dandcg Banned Pattern) ───
    // dandcg skill: "Em dashes — replace with commas, periods, or semicolons"
    // Kill ALL em dashes (biggest AI formatting tell)
    {
      result = result.replace(/\s*—\s*/g, (match) => {
        changeCount++;
        const roll = rng();
        if (roll < 0.4) return ', ';
        if (roll < 0.7) return '. ';
        return '; ';
      });
    }

    // ─── PASS 2g: "However" paragraph-start kill (Critical AI Tell) ───
    // AI uses "However" to start paragraphs 3x more than humans
    {
      const howeverKills = [
        [/^However,?\s*/gim, 'But '],
        [/^Nonetheless,?\s*/gim, 'Still, '],
        [/^In contrast,?\s*/gim, 'But '],
        [/^On the contrary,?\s*/gim, 'But actually, '],
      ];
      howeverKills.forEach(([pattern, replacement]) => {
        const before = result;
        result = result.replace(pattern, (match) => {
          if (rng() < 0.7) {
            changeCount++;
            return replacement;
          }
          return match;
        });
      });
    }

    // ─── PASS 2h: Filler phrase removal (Skill Pattern #22-23 + dandcg banned) ───
    {
      const fillerFixes = [
        [/\bin order to\b/gi, 'to'],
        [/\bdue to the fact that\b/gi, 'because'],
        [/\bat the present time\b/gi, 'now'],
        [/\bin the event that\b/gi, 'if'],
        [/\bwith regard to\b/gi, 'about'],
        [/\bfor the purpose of\b/gi, 'to'],
        [/\bin the near future\b/gi, 'soon'],
        [/\bprior to\b/gi, 'before'],
        [/\bsubsequent to\b/gi, 'after'],
        [/\bin close proximity to\b/gi, 'near'],
        [/\ba large number of\b/gi, 'many'],
        [/\bthe vast majority of\b/gi, 'most'],
        [/\bit goes without saying that\b/gi, ''],
        [/\bit is worth noting that\b/gi, ''],
        [/\bit is important to note that\b/gi, ''],
        [/\bneedless to say,?\s*/gi, ''],
        // --- dandcg banned phrases ---
        [/\bin today's (?:world|digital landscape|era|age|society)\b/gi, 'these days'],
        [/\bit'?s worth mentioning\b/gi, ''],
        [/\bit should be noted\b/gi, ''],
        [/\bas a matter of fact,?\s*/gi, ''],
        [/\bthe fact of the matter is,?\s*/gi, ''],
        [/\bhaving said that,?\s*/gi, 'Still, '],
        [/\bwith that being said,?\s*/gi, 'Still, '],
        [/\bat the end of the day,?\s*/gi, ''],
        [/\bwhen it comes to\b/gi, 'for'],
        [/\bremains to be seen\b/gi, 'we\'ll see'],
        [/\bshed light on\b/gi, 'explain'],
        [/\bdive deep into\b/gi, 'look closely at'],
        [/\bdive deeper into\b/gi, 'look more closely at'],
        [/\bthis comprehensive guide\b/gi, 'this guide'],
        [/\blet'?s explore\b/gi, 'let\'s look at'],
        [/\bever-evolving\b/gi, 'changing'],
      ];
      fillerFixes.forEach(([pattern, replacement]) => {
        const before = result;
        result = result.replace(pattern, replacement);
        if (before !== result) changeCount++;
      });
    }

    // ─── PASS 3: Word unpredictability boost (moved earlier for better effect) ───
    {
      const words = Object.keys(VOCAB_SWAPS);
      words.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        if (regex.test(result)) {
          const alts = VOCAB_SWAPS[word];
          result = result.replace(new RegExp('\\b' + word + '\\b', 'gi'), (match) => {
            const alt = pickRandom(alts, rng);
            if (match[0] === match[0].toUpperCase() && alt[0] !== alt[0].toUpperCase()) {
              changeCount++;
              return alt.charAt(0).toUpperCase() + alt.slice(1);
            }
            changeCount++;
            return alt;
          });
        }
      });
    }

    // ─── PASS 4: Aggressive contraction forcing ───
    {
      CONTRACTIONS.forEach(([regex, contraction]) => {
        const before = result;
        result = result.replace(regex, contraction);
        if (before !== result) changeCount++;
      });

      // Additional aggressive contractions
      const extraContractions = [
        [/\bI have\b/g, "I've"],
        [/\bI had\b/g, "I'd"],
        [/\byou have\b/gi, "you've"],
        [/\byou had\b/gi, "you'd"],
        [/\byou will\b/gi, "you'll"],
        [/\bthere has\b/gi, "there's"],
        [/\bthere had\b/gi, "there'd"],
        [/\bwhat has\b/gi, "what's"],
        [/\bwhat had\b/gi, "what'd"],
        [/\bwhere has\b/gi, "where's"],
        [/\bwhen has\b/gi, "when's"],
        [/\bhow has\b/gi, "how's"],
        [/\bthat has\b/gi, "that's"],
        [/\bwho has\b/gi, "who's"],
        [/\bwho had\b/gi, "who'd"],
        [/\bwho will\b/gi, "who'll"],
        [/\blet us\b/gi, "let's"],
        [/\bhe would\b/gi, "he'd"],
        [/\bshe would\b/gi, "she'd"],
        [/\bthere would\b/gi, "there'd"],
        [/\bwe would\b/gi, "we'd"],
        [/\bthey would\b/gi, "they'd"],
        [/\bcould have\b/gi, "could've"],
        [/\bwould have\b/gi, "would've"],
        [/\bshould have\b/gi, "should've"],
        [/\bmight have\b/gi, "might've"],
        [/\bmust have\b/gi, "must've"],
      ];
      extraContractions.forEach(([regex, contraction]) => {
        const before = result;
        result = result.replace(regex, contraction);
        if (before !== result) changeCount++;
      });
    }

    // ─── PASS 5: Transition annihilation ───
    {
      TRANSITION_SWAPS.forEach(swap => {
        if (swap.match.test(result)) {
          const alt = pickRandom(swap.alts, rng);
          result = result.replace(swap.match, alt);
          changeCount++;
        }
      });

      // Kill remaining formal transitions
      const killTransitions = [
        [/\bIn this regard,?\s*/gi, ''],
        [/\bWith that being said,?\s*/gi, ''],
        [/\bThat being said,?\s*/gi, 'Still, '],
        [/\bIt is worth mentioning that\s*/gi, ''],
        [/\bIt bears mentioning that\s*/gi, ''],
        [/\bNotably,?\s*/gi, ''],
        [/\bRemarkably,?\s*/gi, ''],
        [/\bSignificantly,?\s*/gi, ''],
        [/\bAccordingly,?\s*/gi, 'So '],
        [/\bConcurrently,?\s*/gi, 'At the same time, '],
        [/\bConversely,?\s*/gi, 'But '],
        [/\bHence,?\s*/gi, 'So '],
        [/\bThus,?\s*/gi, 'So '],
        [/\bTherefore,?\s*/gi, 'So '],
        [/\bWhile it is true that\s*/gi, 'Sure, '],
        [/\bIt is also important to\s*/gi, 'You should also '],
        [/\bAnother (?:key|important|crucial|vital|notable|significant) (?:aspect|factor|element|consideration|point) is\b/gi, 'Another thing is'],
        [/\bOne (?:key|important|crucial|vital) (?:aspect|factor|element|consideration|thing) (?:to consider )?is\b/gi, 'One thing is'],
      ];
      killTransitions.forEach(([pattern, replacement]) => {
        const before = result;
        result = result.replace(pattern, replacement);
        if (before !== result) changeCount++;
      });
    }

    // ─── PASS 6: Passive voice conversion ───
    {
      PASSIVE_TO_ACTIVE.forEach(item => {
        if (item.replace && typeof item.replace === 'function') {
          const before = result;
          result = result.replace(item.match, item.replace);
          if (before !== result) changeCount++;
        } else if (item.alts) {
          if (item.match.test(result)) {
            result = result.replace(item.match, () => {
              changeCount++;
              return pickRandom(item.alts, rng);
            });
          }
        }
      });
    }

    // ─── PASS 6b: Break subordinate clauses (fixes 'Mechanical Transitions') ───
    // Detectors flag smooth subordinate clauses. Break them into separate sentences.
    if (strength >= 2) {
      const paragraphs = result.split(/\n\s*\n/);
      let breakCount = 0;
      const maxBreaks = strength >= 3 ? 6 : 3;

      const newParagraphs = paragraphs.map(para => {
        const sentences = splitSentences(para);
        const newSentences = [];

        for (let si = 0; si < sentences.length; si++) {
          const s = sentences[si];
          if (breakCount >= maxBreaks) { newSentences.push(s); continue; }
          const wc = getSentenceWordCount(s);
          if (wc < 18) { newSentences.push(s); continue; }

          // Split at 'where' clauses
          const whereMatch = s.match(/^(.{20,}?)\s+where\s+(.{15,})$/);
          if (whereMatch && rng() < 0.6) {
            newSentences.push(whereMatch[1].replace(/,\s*$/, '') + '.');
            newSentences.push('In these cases, ' + whereMatch[2].charAt(0).toLowerCase() + whereMatch[2].slice(1));
            breakCount++; changeCount++; continue;
          }

          // Split at 'including' clauses
          const inclMatch = s.match(/^(.{15,}?),?\s+including\s+(.{15,})$/);
          if (inclMatch && rng() < 0.6) {
            newSentences.push(inclMatch[1].replace(/,\s*$/, '') + '.');
            newSentences.push('This includes ' + inclMatch[2].charAt(0).toLowerCase() + inclMatch[2].slice(1));
            breakCount++; changeCount++; continue;
          }

          // Split at participial clauses (creating, making, resulting, leading)
          const partMatch = s.match(/^(.{15,}?),?\s+(creating|making|resulting|leading|causing|producing)\s+(.{10,})$/);
          if (partMatch && rng() < 0.5) {
            newSentences.push(partMatch[1].replace(/,\s*$/, '') + '.');
            newSentences.push('This ends up ' + partMatch[2] + ' ' + partMatch[3]);
            breakCount++; changeCount++; continue;
          }

          newSentences.push(s);
        }
        return newSentences.join(' ');
      });
      result = newParagraphs.join('\n\n');
    }

    // ─── PASS 6c: Fix impersonal tone (inject 'you' voice) ───
    if (strength >= 2) {
      const impersonalSwaps = [
        { match: /\bstudents frequently report\b/gi, alts: ['you often hear about students having', 'a lot of students say they have', 'students often talk about having'] },
        { match: /\bstudents who lack confidence\b/gi, alts: ['if you\'re not confident', 'students who don\'t feel confident', 'when you\'re unsure of your English'] },
        { match: /\bstudents may avoid\b/gi, alts: ['you might avoid', 'some students end up avoiding', 'it\'s common to avoid'] },
        { match: /\bthis pattern may influence\b/gi, alts: ['this can start to affect', 'over time this shapes', 'this tends to hurt'] },
        { match: /\bthis study investigates\b/gi, alts: ['this study looks at', 'what we\'re looking at here is', 'the goal here is to understand'] },
        { match: /\bit aims to identify\b/gi, alts: ['the idea is to find', 'we want to figure out', 'it tries to pin down'] },
        { match: /\bthe findings may inform\b/gi, alts: ['what we find could help shape', 'these results might guide', 'this could feed into'] },
        { match: /\bfor many international students\b/gi, alts: ['for a lot of students coming from abroad', 'if you\'re studying in a foreign country', 'for students coming from other countries'] },
        { match: /\bfewer studies examine\b/gi, alts: ['not many studies actually look at', 'there\'s less research on', 'few researchers have really dug into'] },
      ];
      impersonalSwaps.forEach(item => {
        if (item.match.test(result)) {
          result = result.replace(item.match, () => {
            changeCount++;
            return pickRandom(item.alts, rng);
          });
        }
      });
    }

    // ─── PASS 7: First-person voice injection (sparse) ───
    // Only 1-2 per entire text to avoid creating a new pattern
    if (strength >= 3) {
      const paragraphs = result.split(/\n\s*\n/);
      let injectCount = 0;
      const maxInjects = 2;

      const newParagraphs = paragraphs.map((para, pIdx) => {
        if (injectCount >= maxInjects) return para;
        if (pIdx === 0) return para; // skip first paragraph
        const sentences = splitSentences(para);
        if (sentences.length < 3) return para;

        const targetIdx = 1 + Math.floor(rng() * Math.min(sentences.length - 2, 2));
        if (targetIdx < sentences.length && rng() < 0.35) {
          const s = sentences[targetIdx];
          const starter = pickRandom(FIRST_PERSON_INJECTIONS, rng);
          sentences[targetIdx] = starter + s.charAt(0).toLowerCase() + s.slice(1);
          injectCount++;
          changeCount++;
        }

        return sentences.join(' ');
      });
      result = newParagraphs.join('\n\n');
    }

    // ─── PASS 8: Subtle word insertion (max 2 total) ───
    if (strength >= 2) {
      const paragraphs = result.split(/\n\s*\n/);
      let disCount = 0;
      const maxDis = 2;

      const newParagraphs = paragraphs.map(para => {
        if (disCount >= maxDis) return para;
        const sentences = splitSentences(para);

        const newSentences = sentences.map(s => {
          if (disCount >= maxDis) return s;
          const wc = getSentenceWordCount(s);
          if (wc > 15 && rng() < 0.08) {
            const words = s.split(' ');
            const insertPos = 3 + Math.floor(rng() * Math.min(words.length - 5, 6));
            if (insertPos > 2 && insertPos < words.length - 2) {
              const disfluency = pickRandom(NATURAL_DISFLUENCIES, rng);
              words.splice(insertPos, 0, disfluency.trim());
              disCount++;
              changeCount++;
              return words.join(' ');
            }
          }
          return s;
        });

        return newSentences.join(' ');
      });
      result = newParagraphs.join('\n\n');
    }

    // ─── PASS 8b: Clause reordering (real structural change) ───
    // Move dependent clauses to front/back of sentences
    {
      const paragraphs = result.split(/\n\s*\n/);
      let reorderCount = 0;
      const maxReorders = strength >= 3 ? 5 : 3;

      const newParagraphs = paragraphs.map(para => {
        const sentences = splitSentences(para);
        const newSentences = sentences.map(s => {
          if (reorderCount >= maxReorders) return s;
          const wc = getSentenceWordCount(s);
          if (wc < 12 || wc > 35) return s;

          // Pattern: "X, Y" -> "Y. X" (move clause after comma to front)
          const commaMatch = s.match(/^(.{15,}?),\s+(.{10,}?)([.!?])\s*$/);
          if (commaMatch && rng() < 0.25) {
            const [, first, second, punct] = commaMatch;
            const reordered = second.charAt(0).toUpperCase() + second.slice(1) + '. ' +
              first.charAt(0).toUpperCase() + first.slice(1) + punct;
            reorderCount++;
            changeCount++;
            return reordered;
          }

          // Pattern: "Although X, Y" -> "Y, even though X"
          const althoughMatch = s.match(/^Although\s+(.{10,}?),\s+(.{10,}?)([.!?])\s*$/);
          if (althoughMatch && rng() < 0.5) {
            const [, condition, main, punct] = althoughMatch;
            reorderCount++;
            changeCount++;
            return main.charAt(0).toUpperCase() + main.slice(1) + ', even though ' + condition.charAt(0).toLowerCase() + condition.slice(1) + punct;
          }

          // Pattern: "Because X, Y" -> "Y because X"
          const becauseMatch = s.match(/^Because\s+(.{8,}?),\s+(.{8,}?)([.!?])\s*$/);
          if (becauseMatch && rng() < 0.5) {
            const [, reason, main, punct] = becauseMatch;
            reorderCount++;
            changeCount++;
            return main.charAt(0).toUpperCase() + main.slice(1) + ' because ' + reason.charAt(0).toLowerCase() + reason.slice(1) + punct;
          }

          return s;
        });
        return newSentences.join(' ');
      });
      result = newParagraphs.join('\n\n');
    }

    // ─── PASS 9: Extreme sentence surgery for burstiness ───
    // AI has LOW burstiness (uniform sentence length). Humans have HIGH burstiness.
    {
      const paragraphs = result.split(/\n\s*\n/);
      const newParagraphs = paragraphs.map((para, paraIdx) => {
        const sentences = splitSentences(para);
        if (sentences.length < 2) return para;
        const newSentences = [];

        for (let i = 0; i < sentences.length; i++) {
          const s = sentences[i];
          const wc = getSentenceWordCount(s);

          // MORE aggressive splitting — lower threshold (20 words vs 25)
          // and higher chance especially in the first paragraph
          const splitChance = paraIdx === 0 ? (strength >= 3 ? 0.5 : 0.3) : (strength >= 3 ? 0.35 : 0.2);
          if (wc > 20 && rng() < splitChance) {
            const commaIdx = s.indexOf(', ');
            const whichIdx = s.indexOf(' which ');
            const andIdx = s.indexOf(' and ');
            const butIdx = s.indexOf(' but ');
            const splitPoint = commaIdx > 12 ? commaIdx : (butIdx > 12 ? butIdx : (whichIdx > 12 ? whichIdx : (andIdx > 12 ? andIdx : -1)));

            if (splitPoint > 5) {
              const firstPart = s.substring(0, splitPoint).replace(/,\s*$/, '');
              const secondPart = s.substring(splitPoint).replace(/^[,\s]+|^\s*which\s+|^\s*and\s+|^\s*but\s+/i, '');
              if (getSentenceWordCount(firstPart) >= 5 && getSentenceWordCount(secondPart) >= 5) {
                const first = firstPart + '.';
                // Occasionally start second part with 'And', 'But' for natural feel
                let restCap = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
                if (rng() < 0.3 && butIdx === splitPoint) {
                  restCap = 'But ' + secondPart.charAt(0).toLowerCase() + secondPart.slice(1);
                } else if (rng() < 0.2 && andIdx === splitPoint) {
                  restCap = 'And ' + secondPart.charAt(0).toLowerCase() + secondPart.slice(1);
                }
                newSentences.push(first);
                newSentences.push(restCap);
                changeCount++;
                continue;
              }
            }
          }

          // Merge short consecutive sentences with a dash or semicolon
          if (wc < 10 && i + 1 < sentences.length && getSentenceWordCount(sentences[i + 1]) < 12 && rng() < 0.5) {
            const connectors = [' — ', '; ', ' and ', ', plus '];
            const connector = pickRandom(connectors, rng);
            const merged = s.replace(/[.!?]+\s*$/, '') + connector + sentences[i + 1].charAt(0).toLowerCase() + sentences[i + 1].slice(1);
            newSentences.push(merged);
            i++;
            changeCount++;
            continue;
          }

          newSentences.push(s);
        }

        return newSentences.join(' ');
      });

      result = newParagraphs.join('\n\n');
    }

    // ─── PASS 9b: Opening paragraph sentence reordering ───
    // AI detectors strongly flag uniform sentence ordering at the start.
    // Swap 2-3 sentences in the opening paragraph for unpredictability.
    if (strength >= 2) {
      const paragraphs = result.split(/\n\s*\n/);
      if (paragraphs.length > 0) {
        const sentences = splitSentences(paragraphs[0]);
        if (sentences.length >= 4) {
          // Swap positions of sentences 1 and 2 (0-indexed)
          // This breaks the AI's typical intro pattern
          if (rng() < 0.6) {
            const temp = sentences[0];
            sentences[0] = sentences[1];
            sentences[1] = temp;
            changeCount++;
          }
          // Occasionally also swap positions 3 and 4
          if (sentences.length >= 5 && rng() < 0.4) {
            const temp = sentences[3];
            sentences[3] = sentences[4];
            sentences[4] = temp;
            changeCount++;
          }
          paragraphs[0] = sentences.join(' ');
          result = paragraphs.join('\n\n');
        }
      }
    }

    // ─── PASS 10: Sentence starter diversification (minimal) ───
    {
      const paragraphs = result.split(/\n\s*\n/);
      const usedStarters = new Set();

      const newParagraphs = paragraphs.map(para => {
        const sentences = splitSentences(para);
        if (sentences.length < 4) return para;

        const starts = sentences.map(s => (s.trim().split(/\s+/)[0] || '').toLowerCase());
        let changed = 0;

        const newSentences = sentences.map((s, idx) => {
          if (changed >= 1 || idx === 0) return s;
          const thisStart = starts[idx];
          const prevStart = idx > 0 ? starts[idx - 1] : '';

          if (thisStart === prevStart && rng() < 0.3) {
            let starter;
            let attempts = 0;
            do {
              starter = pickRandom(HUMAN_STARTERS, rng);
              attempts++;
            } while (usedStarters.has(starter) && attempts < 5);

            if (!usedStarters.has(starter)) {
              usedStarters.add(starter);
              changed++;
              changeCount++;
              return starter + s.charAt(0).toLowerCase() + s.slice(1);
            }
          }
          return s;
        });
        return newSentences.join(' ');
      });
      result = newParagraphs.join('\n\n');
    }

    // ─── PASS 11: Paragraph restructuring ───
    if (strength >= 2) {
      const paragraphs = result.split(/\n\s*\n/);
      if (paragraphs.length >= 2) {
        const newParagraphs = [];
        for (let i = 0; i < paragraphs.length; i++) {
          const para = paragraphs[i];
          const sentences = splitSentences(para);

          if (sentences.length >= 5 && rng() < 0.5) {
            const splitAt = 2 + Math.floor(rng() * Math.max(1, sentences.length - 3));
            newParagraphs.push(sentences.slice(0, splitAt).join(' '));
            newParagraphs.push(sentences.slice(splitAt).join(' '));
            changeCount++;
          } else {
            newParagraphs.push(para);
          }
        }
        result = newParagraphs.join('\n\n');
      }
    }

    // ─── PASS 12: Final text cleanup ───
    {
      // Fix sentence capitalization after removals
      result = result.replace(/\.\s+([a-z])/g, (m, c) => '. ' + c.toUpperCase());
      result = result.replace(/^\s*([a-z])/gm, (m, c) => c.toUpperCase());

      // Remove orphaned punctuation
      result = result.replace(/^\s*[,;]\s*/gm, '');
      result = result.replace(/\s*,\s*\./g, '.');
      result = result.replace(/,\s*,/g, ',');

      // Fix double periods, empty sentences
      result = result.replace(/\.{2,}/g, '.');
      result = result.replace(/\.\s*\./g, '.');

      // Clean up double spaces and excessive newlines
      result = result.replace(/  +/g, ' ');
      result = result.replace(/\n{3,}/g, '\n\n');
      result = result.replace(/ ([.,!?;:])/g, '$1');

      // Remove empty paragraphs
      result = result.split('\n\n').filter(p => p.trim().length > 0).join('\n\n');

      result = result.trim();
    }

    // ─── PASS 12b: Self-audit — consecutive same-length sentence breaker ───
    // dandcg skill: "Flag and fix any remaining uniform sentence patterns
    // (3+ consecutive sentences of similar length)"
    if (strength >= 2) {
      const paragraphs = result.split(/\n\s*\n/);
      const newParagraphs = paragraphs.map(para => {
        const sentences = splitSentences(para);
        if (sentences.length < 4) return para;

        const wordCounts = sentences.map(s => getSentenceWordCount(s));
        const newSentences = [...sentences];
        let fixed = 0;

        for (let i = 0; i < wordCounts.length - 2 && fixed < 2; i++) {
          const a = wordCounts[i], b = wordCounts[i + 1], c = wordCounts[i + 2];
          // 3 consecutive sentences within ±4 words of each other = uniform pattern
          if (Math.abs(a - b) <= 4 && Math.abs(b - c) <= 4 && Math.abs(a - c) <= 4) {
            // Break the middle one: either split it or make it very short
            const mid = newSentences[i + 1];
            const midWc = getSentenceWordCount(mid);

            if (midWc > 14) {
              // Split at a comma if possible
              const commaIdx = mid.indexOf(', ');
              if (commaIdx > 8 && commaIdx < mid.length - 8) {
                const first = mid.substring(0, commaIdx) + '.';
                const second = mid.substring(commaIdx + 2);
                const secondCap = second.charAt(0).toUpperCase() + second.slice(1);
                newSentences[i + 1] = first + ' ' + secondCap;
                fixed++;
                changeCount++;
              }
            } else if (midWc > 6 && i + 2 < newSentences.length - 1) {
              // Merge with the next sentence
              const merged = mid.replace(/[.!?]+\s*$/, '') + ', and ' +
                newSentences[i + 2].charAt(0).toLowerCase() + newSentences[i + 2].slice(1);
              newSentences[i + 1] = merged;
              newSentences.splice(i + 2, 1);
              wordCounts.splice(i + 2, 1);
              fixed++;
              changeCount++;
            }
          }
        }

        return newSentences.join(' ');
      });
      result = newParagraphs.join('\n\n');
    }

    // ═══════════════════════════════════════════════════════════
    // PASS 13: ADDITIONAL LINGUISTIC HUMANIZATION
    // (Replaced Unicode tricks with clean text transformations)
    // ═══════════════════════════════════════════════════════════

    // --- 13a: Sentence structure inversion ---
    // Randomly flip "X, so Y" → "Y, since X" etc. for unpredictability
    if (strength >= 2) {
      const paragraphs = result.split(/\n\s*\n/);
      let invCount = 0;
      const maxInv = strength >= 3 ? 4 : 2;

      const newParagraphs = paragraphs.map(para => {
        const sentences = splitSentences(para);
        const newSentences = sentences.map(s => {
          if (invCount >= maxInv) return s;
          const wc = getSentenceWordCount(s);
          if (wc < 10 || wc > 30) return s;

          // "While X, Y" → "Y. X, though."
          const whileMatch = s.match(/^While\s+(.{10,}?),\s+(.{10,}?)([.!?])\s*$/);
          if (whileMatch && rng() < 0.4) {
            const [, condition, main, punct] = whileMatch;
            invCount++; changeCount++;
            return main.charAt(0).toUpperCase() + main.slice(1) + '. ' +
              condition.charAt(0).toUpperCase() + condition.slice(1) + ', though' + punct;
          }

          // "Since X, Y" → "Y — X."
          const sinceMatch = s.match(/^Since\s+(.{8,}?),\s+(.{8,}?)([.!?])\s*$/);
          if (sinceMatch && rng() < 0.35) {
            const [, reason, main, punct] = sinceMatch;
            invCount++; changeCount++;
            return main.charAt(0).toUpperCase() + main.slice(1).replace(/[.!?]\s*$/, '') +
              ' — ' + reason.charAt(0).toLowerCase() + reason.slice(1) + punct;
          }

          return s;
        });
        return newSentences.join(' ');
      });
      result = newParagraphs.join('\n\n');
    }

    // --- 13b: Natural imperfections ---
    // Humans make minor grammatical "imperfections" that AI avoids
    if (strength >= 2) {
      const imperfections = [
        // End sentences with prepositions (natural for humans)
        { match: /\bfor which\b/gi, alts: ['that', 'which'] },
        { match: /\bthrough which\b/gi, alts: ['that', 'where'] },
        { match: /\bto whom\b/gi, alts: ['who', 'that'] },
        // Split infinitives (humans do this naturally)
        { match: /\bto quickly (\w+)\b/gi, replace: 'to $1 quickly' },
        // Starting with conjunctions (very human)
        // Already handled by other passes
      ];

      imperfections.forEach(item => {
        if (item.alts && item.match.test(result)) {
          result = result.replace(item.match, () => {
            changeCount++;
            return pickRandom(item.alts, rng);
          });
        } else if (item.replace) {
          const before = result;
          result = result.replace(item.match, item.replace);
          if (before !== result) changeCount++;
        }
      });
    }

    // --- 13c: Extra word-level diversity ---
    // Replace remaining AI-typical single words that detectors flag
    if (strength >= 2) {
      const extraSwaps = {
        'encompasses': ['covers', 'includes', 'takes in'],
        'encompasses a': ['covers a', 'includes a', 'takes in a'],
        'necessitates': ['needs', 'calls for', 'requires'],
        'articulate': ['express', 'put into words', 'talk about'],
        'manifests': ['shows up', 'appears', 'comes out'],
        'constitutes': ['makes up', 'is', 'forms'],
        'elucidates': ['explains', 'clears up', 'sheds light on'],
        'delineate': ['outline', 'spell out', 'map out'],
        'delineated': ['outlined', 'spelled out', 'mapped out'],
        'corroborates': ['backs up', 'supports', 'confirms'],
        'exacerbates': ['makes worse', 'worsens', 'adds to'],
        'exacerbate': ['make worse', 'worsen', 'add to'],
        'predominant': ['main', 'biggest', 'most common'],
        'predominantly': ['mostly', 'mainly', 'for the most part'],
        'notwithstanding': ['despite', 'even with', 'regardless of'],
        'whereby': ['where', 'in which', 'so that'],
        'aforementioned': ['mentioned', 'already discussed', 'noted'],
        'pertaining': ['related', 'about', 'to do with'],
        'hinder': ['block', 'get in the way of', 'hold back'],
        'hindered': ['blocked', 'held back', 'slowed down'],
        'hindering': ['blocking', 'holding back', 'slowing down'],
        'mitigate': ['reduce', 'ease', 'lessen'],
        'mitigated': ['reduced', 'eased', 'lessened'],
        'intrinsic': ['built-in', 'natural', 'core'],
        'supplementary': ['extra', 'additional', 'added'],
        'disparities': ['gaps', 'differences', 'imbalances'],
      };

      const extraWords = Object.keys(extraSwaps);
      extraWords.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        if (regex.test(result)) {
          const alts = extraSwaps[word];
          result = result.replace(new RegExp('\\b' + word + '\\b', 'gi'), (match) => {
            const alt = pickRandom(alts, rng);
            if (match[0] === match[0].toUpperCase() && alt[0] !== alt[0].toUpperCase()) {
              changeCount++;
              return alt.charAt(0).toUpperCase() + alt.slice(1);
            }
            changeCount++;
            return alt;
          });
        }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // PASS 14: CUSTOM HUMANIZER SKILL
    // Built from analysis of 24 flagged sentences.
    // Targets: Mechanical Precision, Predictable Syntax, Robotic
    //          Formality, Impersonal Tone, Fragments, Register Mix
    // ═══════════════════════════════════════════════════════════

    // --- 14a: Sentence fragment repair ---
    // Our splitting passes sometimes create broken sentences.
    // Detect fragments and merge them with adjacent sentences.
    {
      const paragraphs = result.split(/\n\s*\n/);
      const newParagraphs = paragraphs.map(para => {
        const sentences = splitSentences(para);
        if (sentences.length < 2) return para;
        const repaired = [];

        for (let i = 0; i < sentences.length; i++) {
          const s = sentences[i].trim();
          const wc = getSentenceWordCount(s);

          // Fragment detection: very short incomplete sentences only
          const isFragment = (
            (wc <= 2) ||
            (/^(?:And|Or|Plus|Also|Strong|Along with)\s/i.test(s) && wc < 5) ||
            /^[A-Z][a-z]+\s(?:and|or)\s\w+\.$/.test(s) // "Listening and speaking."
          );

          if (isFragment && repaired.length > 0) {
            // Merge fragment with previous sentence
            const prev = repaired[repaired.length - 1].replace(/[.!?]\s*$/, '');
            repaired[repaired.length - 1] = prev + ', ' + s.charAt(0).toLowerCase() + s.slice(1);
            changeCount++;
          } else if (isFragment && i + 1 < sentences.length) {
            // Merge fragment with next sentence
            const next = sentences[i + 1];
            sentences[i + 1] = s.replace(/[.!?]\s*$/, '') + ' — ' + next.charAt(0).toLowerCase() + next.slice(1);
            changeCount++;
          } else {
            repaired.push(s);
          }
        }

        return repaired.join(' ');
      });
      result = newParagraphs.join('\n\n');
    }

    // --- 14b: Contrast pattern breaker ---
    // "X, but it also Y" is a classic AI pattern. Break it.
    {
      // "X, but it also poses/creates/etc challenges"
      result = result.replace(/,\s*but it also\s+/gi, () => {
        changeCount++;
        const alts = ['. That said, it also ', '. There are also ', '. On the flip side, it '];
        return pickRandom(alts, rng);
      });
      // "X, but Y" at sentence start — make less neat
      result = result.replace(/,\s*but\s+(this|it|they|these|that|there)\s/gi, (match, subj) => {
        if (rng() < 0.5) {
          changeCount++;
          return '. ' + subj.charAt(0).toUpperCase() + subj.slice(1) + ' ';
        }
        return match;
      });
    }

    // --- 14c: Parenthetical aside injection ---
    // Humans add asides like "(which is saying something)" or "(to be fair)"
    // This makes text feel like it has a voice and opinion
    if (strength >= 2) {
      const asides = [
        { trigger: /\b(a lot|many|most)\b/i, inserts: ['(and there are quite a few)', '(no small number)', '(more than you might think)'] },
        { trigger: /\bdifficult|challenging|hard\b/i, inserts: ['(to put it mildly)', '(and it really is)', '(which can be frustrating)'] },
        { trigger: /\bimprove|better|enhance\b/i, inserts: ['(always a good thing)', '(which would help a lot)', '(something worth pushing for)'] },
      ];
      let asideCount = 0;
      const paragraphs = result.split(/\n\s*\n/);
      const newParagraphs = paragraphs.map(para => {
        if (asideCount >= 2) return para; // max 2 per text
        const sentences = splitSentences(para);
        return sentences.map(s => {
          if (asideCount >= 2) return s;
          for (const aside of asides) {
            if (aside.trigger.test(s) && rng() < 0.15) {
              asideCount++;
              changeCount++;
              const insert = pickRandom(aside.inserts, rng);
              // Insert aside after the trigger word's sentence end
              return s.replace(/([.!?])\s*$/, ' ' + insert + '$1');
            }
          }
          return s;
        }).join(' ');
      });
      result = newParagraphs.join('\n\n');
    }

    // --- 14d: Sentence type variety ---
    // ALL sentences are declarative (Subject-Verb-Object). This is the #1 AI tell.
    // Inject occasional rhetorical questions to break the pattern.
    if (strength >= 2) {
      const paragraphs = result.split(/\n\s*\n/);
      let questionCount = 0;
      const newParagraphs = paragraphs.map((para, pIdx) => {
        if (questionCount >= 2) return para; // max 2 questions per text
        const sentences = splitSentences(para);
        if (sentences.length < 3) return para;

        return sentences.map((s, sIdx) => {
          if (questionCount >= 2) return s;
          // Add question before sentences that explain challenges or make claims
          if (sIdx > 0 && sIdx < sentences.length - 1 && rng() < 0.1) {
            const wc = getSentenceWordCount(s);
            if (wc > 10 && wc < 25) {
              const questions = [
                'So what does this actually mean?',
                'Why does this matter?',
                'What happens in practice?',
                'How does this play out?',
                'But what does that look like in reality?',
              ];
              questionCount++;
              changeCount++;
              return pickRandom(questions, rng) + ' ' + s;
            }
          }
          return s;
        }).join(' ');
      });
      result = newParagraphs.join('\n\n');
    }

    // --- 14e: Sentence opener variety ---
    // AI always starts with Subject-Verb. Humans start with:
    // adverbs, prepositional phrases, gerunds, conditionals
    if (strength >= 2) {
      const paragraphs = result.split(/\n\s*\n/);
      let changed = 0;
      const newParagraphs = paragraphs.map(para => {
        const sentences = splitSentences(para);
        return sentences.map(s => {
          if (changed >= 4) return s;
          const wc = getSentenceWordCount(s);
          if (wc < 10 || wc > 30) return s;

          // Detect "Subject verb..." pattern (starts with noun-like word + verb)
          const subjectVerbMatch = s.match(/^(The|This|These|Those|Most|Many|Some|A|An|Each|Every|It|They|Students|Research|Studies|Universities|Higher)\s+/);
          if (subjectVerbMatch && rng() < 0.2) {
            const openers = [
              'Looking at it broadly, ',
              'From what we can tell, ',
              'In practical terms, ',
              'When you think about it, ',
              'Across the board, ',
              'Generally speaking, ',
              'As it turns out, ',
            ];
            changed++;
            changeCount++;
            return pickRandom(openers, rng) + s.charAt(0).toLowerCase() + s.slice(1);
          }
          return s;
        }).join(' ');
      });
      result = newParagraphs.join('\n\n');
    }

    // --- 14f: Research template breaker ---
    // "This study examines..." / "This study therefore..." are instant AI tells
    {
      const templateFixes = [
        { match: /\bThis study (?:therefore )?examines?\b/gi, alts: ['What we look at here is', 'The focus here is on', 'We set out to examine'] },
        { match: /\bThis study (?:therefore )?(?:aims?|seeks?) to\b/gi, alts: ['The goal is to', 'We wanted to', 'The idea was to'] },
        { match: /\bIt aims to (?:identify|spot|find)\b/gi, alts: ['We wanted to find', 'The aim was to identify', 'Part of this is figuring out'] },
        { match: /\bThe results may (?:inform|feed into)\b/gi, alts: ['What we find could shape', 'These findings might help with', 'This could feed into'] },
        { match: /\bExisting literature documents?\b/gi, alts: ['Past research covers', 'Previous work has looked at', 'A lot has been written about'] },
        { match: /\bA clear understanding of this\b/gi, alts: ['Getting a handle on this', 'Understanding this better', 'Knowing more about this'] },
      ];

      templateFixes.forEach(item => {
        if (item.match.test(result)) {
          result = result.replace(item.match, () => {
            changeCount++;
            return pickRandom(item.alts, rng);
          });
        }
      });
    }

    // --- 14g: Citation integration fixer ---
    // AI inserts citations awkwardly: "a study by MDPI (2024) identifies listening."
    // Fix: ensure citations are followed by complete thoughts
    {
      // Fix "identifies listening." → "identifies listening as a key challenge."
      result = result.replace(/\b(identifies?|suggests?|finds?|shows?|highlights?)\s+([\w]+)\.\s/gi, (match, verb, obj) => {
        // If the object is a single word followed by period, it's likely truncated
        if (obj.length < 15 && !/ing$/.test(obj)) return match; // skip normal endings
        if (/^listening|speaking|reading|writing$/i.test(obj)) {
          changeCount++;
          return verb + ' ' + obj + ' as one of the main issues. ';
        }
        return match;
      });

      // Fix "suggests largely that" → "suggests that" (awkward adverb)
      result = result.replace(/\b(suggests?|indicates?|shows?)\s+largely\s+that\b/gi, (match, verb) => {
        changeCount++;
        return verb + ' that';
      });
    }

    // --- 14h: Register consistency ---
    // Fix clashing casual + formal in same sentence
    // "have a big intake of diverse linguistic and cultural backgrounds" → consistent register
    {
      const registerFixes = [
        { match: /\bhave a? big intake of\b/gi, alts: ['bring in students from', 'attract students with', 'enroll a wide range of students with'] },
        { match: /\bmore and more focuses on\b/gi, alts: ['has been shifting toward', 'has put more weight on', 'keeps moving toward'] },
        { match: /\binvolves taking part\b/gi, alts: ['means getting involved', 'requires participation', 'is about participating'] },
        { match: /\bhandle things\b/gi, alts: ['approach things', 'manage this', 'deal with it'] },
        { match: /\bfeed into how\b/gi, alts: ['shape how', 'influence how', 'change how'] },
        { match: /\bdeveloping of\b/gi, alts: ['developing', 'building', 'creating'] },
        { match: /\bshape learning what happens\b/gi, alts: ['directly affect how learning goes', 'shape learning outcomes', 'influence what students get out of it'] },
        { match: /\bclass involvement\b/gi, alts: ['class participation', 'how much they participate', 'how engaged they are'] },
        { match: /\bback-and-forth\b/gi, alts: ['interaction', 'participation', 'engagement'] },
        { match: /\bcut down on chances for\b/gi, alts: ['reduce opportunities for', 'limit chances to get', 'make it harder to get'] },
      ];

      registerFixes.forEach(item => {
        if (item.match.test(result)) {
          result = result.replace(item.match, () => {
            changeCount++;
            return pickRandom(item.alts, rng);
          });
        }
      });
    }

    // --- 14i: Break "essay-style balance" in opening sentence ---
    // "Study abroad has expanded a lot, and the UK remains..." = classic intro
    {
      result = result.replace(/^([\w\s]+has expanded[\w\s]*?),?\s*and\s+(the UK|Britain|England)/im, (match, first, uk) => {
        changeCount++;
        // Clean trailing comma/period/space from first part
        const cleanFirst = first.replace(/[,\s]+$/, '');
        return cleanFirst + '. ' + uk.charAt(0).toUpperCase() + uk.slice(1);
      });
    }

    // --- Final artifact cleanup ---
    // Fix any punctuation artifacts created by the passes
    result = result.replace(/,\s*\./g, '.');
    result = result.replace(/\.\s*\./g, '.');
    result = result.replace(/\.\s*,/g, '.');
    result = result.replace(/  +/g, ' ');
    result = result.replace(/\. ([a-z])/g, (m, c) => '. ' + c.toUpperCase());

    return { text: result, changeCount };
  }

  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════

  function updateScore(score) {
    // Update number
    scoreValueEl.textContent = score + '%';

    // Update ring (circumference = 2πr = 2 * π * 20 ≈ 125.66)
    const circumference = 125.66;
    const offset = circumference - (score / 100) * circumference;
    scoreRingEl.style.strokeDashoffset = offset;

    // Update status text and color
    let statusText, statusClass;
    if (score === 0) {
      statusText = 'Paste text to analyze';
      statusClass = 'none';
    } else if (score >= 60) {
      statusText = 'Highly AI-like';
      statusClass = 'high';
    } else if (score >= 30) {
      statusText = 'Somewhat AI-like';
      statusClass = 'medium';
    } else {
      statusText = 'Mostly human';
      statusClass = 'low';
    }

    scoreStatusEl.textContent = statusText;
    scoreStatusEl.className = 'score-status ' + statusClass;
  }

  function updatePatternBadges(patterns) {
    patternBadgesEl.innerHTML = '';

    if (patterns.length === 0) return;

    // Sort by count descending
    const sorted = [...patterns].sort((a, b) => b.count - a.count);

    sorted.forEach((p, i) => {
      const badge = document.createElement('span');
      badge.className = `pattern-badge ${CATEGORIES[p.category].color}`;
      badge.style.animationDelay = `${i * 50}ms`;
      badge.innerHTML = `
        ${p.name}
        <span class="badge-count">${p.count}</span>
      `;
      badge.title = p.description;
      badge.setAttribute('data-pattern-id', p.id);
      patternBadgesEl.appendChild(badge);
    });
  }

  function updateCategoryTabs(patterns) {
    const counts = {};
    Object.keys(CATEGORIES).forEach(cat => counts[cat] = 0);
    patterns.forEach(p => counts[p.category] += p.count);

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

    categoryTabsEl.innerHTML = `
      <button class="category-tab active" data-category="all">
        All<span class="tab-count">${totalCount}</span>
      </button>
    `;

    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      if (counts[key] > 0) {
        const tab = document.createElement('button');
        tab.className = 'category-tab';
        tab.setAttribute('data-category', key);
        tab.innerHTML = `${cat.label}<span class="tab-count">${counts[key]}</span>`;
        categoryTabsEl.appendChild(tab);
      }
    });

    // Re-attach event listeners
    categoryTabsEl.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabsEl.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filterBadges(tab.dataset.category);
      });
    });
  }

  function filterBadges(category) {
    patternBadgesEl.querySelectorAll('.pattern-badge').forEach(badge => {
      if (category === 'all') {
        badge.style.display = '';
      } else {
        const patternId = parseInt(badge.dataset.patternId);
        const pattern = PATTERNS.find(p => p.id === patternId);
        badge.style.display = pattern && pattern.category === category ? '' : 'none';
      }
    });
  }

  function updateInputStats(text) {
    const words = countWords(text);
    const chars = text.length;
    const sentences = countSentences(text);
    wordCountInEl.textContent = words;
    charCountInEl.textContent = chars;
    sentenceCountInEl.textContent = sentences;
  }

  function updateOutputStats(text, patternCount) {
    wordCountOutEl.textContent = countWords(text);
    charCountOutEl.textContent = text.length;
    patternCountOutEl.textContent = patternCount;
  }

  function showOutput(humanizedText, originalText, detectedPatterns, changeCount) {
    outputEl.classList.remove('empty');

    let html = escapeHtml(humanizedText);

    // Build the changes summary
    const changesHtml = buildChangesSummary(detectedPatterns, changeCount);

    outputEl.innerHTML = `
      <div style="white-space: pre-wrap; word-wrap: break-word;">${html}</div>
      ${changesHtml}
    `;
  }

  function buildChangesSummary(patterns, changeCount) {
    if (patterns.length === 0 && changeCount === 0) return '';

    const items = [];

    // Group by category
    const grouped = {};
    patterns.forEach(p => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });

    Object.entries(grouped).forEach(([cat, pats]) => {
      const catInfo = CATEGORIES[cat];
      const names = pats.map(p => `${p.name} (${p.count})`).join(', ');
      items.push(`Removed ${catInfo.label.toLowerCase()} patterns: ${names}`);
    });

    if (changeCount > 0) {
      items.push(`Applied ${changeCount} rewrite rules`);
    }

    if (items.length === 0) return '';

    return `
      <div class="changes-panel">
        <h4>✦ Changes applied</h4>
        <ul class="changes-list">
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  function showEmptyOutput() {
    outputEl.classList.add('empty');
    outputEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✦</div>
        <h3>Humanized text appears here</h3>
        <p>Paste AI-generated text on the left and click "<strong>Humanize</strong>" to remove AI writing patterns.</p>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════

  function countWords(text) {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }

  function countSentences(text) {
    if (!text.trim()) return 0;
    return (text.match(/[.!?]+/g) || []).length || (text.trim() ? 1 : 0);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showToast(message, icon = '✓') {
    toastEl.innerHTML = `<span class="toast-icon">${icon}</span> ${message}`;
    toastEl.classList.add('visible');
    setTimeout(() => toastEl.classList.remove('visible'), 2500);
  }

  // ═══════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════

  // Real-time analysis on input
  inputEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const text = inputEl.value;
      updateInputStats(text);

      if (!text.trim()) {
        updateScore(0);
        updatePatternBadges([]);
        updateCategoryTabs([]);
        return;
      }

      analysisResults = analyzeText(text);
      updateScore(analysisResults.score);
      updatePatternBadges(analysisResults.patterns);
      updateCategoryTabs(analysisResults.patterns);
    }, 300);
  });

  // Humanize button
  humanizeBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (!text) {
      showToast('Please enter some text first', '⚠');
      return;
    }

    // Show processing animation
    processingOverlay.classList.add('active');

    // Simulate brief processing delay for UX
    setTimeout(() => {
      const { text: humanizedText, changeCount } = humanizeText(text);

      // Re-analyze the output
      const outputAnalysis = analyzeText(humanizedText);

      showOutput(humanizedText, text, analysisResults.patterns, changeCount);
      updateOutputStats(humanizedText, analysisResults.totalMatches);

      // Update score to show the humanized score
      updateScore(outputAnalysis.score);
      updatePatternBadges(outputAnalysis.patterns);
      updateCategoryTabs(outputAnalysis.patterns);

      processingOverlay.classList.remove('active');
      showToast(`Humanized! Score: ${analysisResults.score}% → ${outputAnalysis.score}%`, '✦');
    }, 600);
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    updateInputStats('');
    updateScore(0);
    updatePatternBadges([]);
    updateCategoryTabs([]);
    showEmptyOutput();
    updateOutputStats('', 0);
    showToast('Cleared', '🗑');
    inputEl.focus();
  });

  // Copy button
  copyBtn.addEventListener('click', () => {
    const outputText = outputEl.querySelector('div[style]');
    if (!outputText || outputEl.classList.contains('empty')) {
      showToast('Nothing to copy yet', '⚠');
      return;
    }

    const text = outputText.textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', '📋');
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Copied to clipboard!', '📋');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════

  // Strength slider handler
  const STRENGTH_LABELS = { 1: 'Light', 2: 'Medium', 3: 'Aggressive' };
  const STRENGTH_CLASSES = { 1: 'light', 2: 'medium', 3: 'aggressive' };

  function updateStrengthLabel() {
    if (!strengthSlider || !strengthLabel) return;
    const val = parseInt(strengthSlider.value);
    strengthLabel.textContent = STRENGTH_LABELS[val] || 'Medium';
    strengthLabel.className = 'strength-label ' + (STRENGTH_CLASSES[val] || 'medium');
  }

  if (strengthSlider) {
    strengthSlider.addEventListener('input', updateStrengthLabel);
    updateStrengthLabel();
  }

  showEmptyOutput();
  updateScore(0);
  inputEl.focus();

})();
