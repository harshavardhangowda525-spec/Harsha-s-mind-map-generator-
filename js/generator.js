/* =========================================================
   generator.js — the "AI" content analysis engine
   Transforms raw text / topics into a structured mind-map tree.
   Runs entirely client-side (no keys, fully offline-capable).
   ========================================================= */
(function (global) {
  'use strict';

  const STOP = new Set(('a an the and or but if then else of to in on at for with without ' +
    'is are was were be been being am do does did have has had having this that these those ' +
    'it its it\'s as by from into about over under again further once here there all any both ' +
    'each few more most other some such no nor not only own same so than too very can will just ' +
    'should now also which who whom what when where why how i you he she they we me my your our ' +
    'their his her them us out up down off above below between through during before after ' +
    'because while would could may might must shall upon among within across per via etc ' +
    'one two three many much like get got make made use used using also however therefore thus ' +
    'moreover furthermore additionally often sometimes always never really quite rather ' +
    'their they\'re there\'s let\'s we\'re i\'m').split(/\s+/));

  const EXAMPLE_CUES = /\b(for example|for instance|e\.g\.|such as|including|like when|imagine|consider)\b/i;
  const DEFINITION_CUES = /\b(is|are|refers to|means|defined as|describes|represents|is called)\b/i;

  /* ---- text utilities ---- */
  function sentences(text) {
    return text
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
      .map(s => s.trim())
      .filter(s => s.length > 12);
  }

  function words(text) {
    return (text.toLowerCase().match(/[a-z][a-z'-]{1,}/g) || []);
  }

  function titleCase(s) {
    return s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1));
  }

  function clean(s) {
    return s.replace(/\s+/g, ' ').trim();
  }

  /* ---- keyword scoring (frequency + position + capitalization) ---- */
  function keywordScores(text) {
    const w = words(text);
    const freq = {};
    w.forEach((word, i) => {
      if (STOP.has(word) || word.length < 3) return;
      const positionBoost = 1 + (1 - i / Math.max(w.length, 1)) * 0.4;
      freq[word] = (freq[word] || 0) + positionBoost;
    });
    // Boost capitalized (proper noun) phrases in original text
    const proper = text.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2})\b/g) || [];
    proper.forEach(p => {
      const key = p.toLowerCase();
      const first = key.split(' ')[0];
      if (!STOP.has(first)) freq[first] = (freq[first] || 0) + 1.6;
    });
    return freq;
  }

  /* ---- bigram / phrase detection for nicer branch labels ---- */
  function topPhrases(text, scores, limit) {
    const raw = text.replace(/\s+/g, ' ');
    const tokens = raw.split(' ');
    const phraseFreq = {};
    for (let i = 0; i < tokens.length - 1; i++) {
      const a = tokens[i].toLowerCase().replace(/[^a-z'-]/g, '');
      const b = tokens[i + 1].toLowerCase().replace(/[^a-z'-]/g, '');
      if (STOP.has(a) || STOP.has(b) || a.length < 3 || b.length < 3) continue;
      const phrase = a + ' ' + b;
      phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
    }
    const bigrams = Object.entries(phraseFreq)
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([p]) => p);

    const singles = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([w]) => w);

    // Merge: prefer bigrams, fill with singles not already covered
    const out = [];
    const seen = new Set();
    bigrams.forEach(p => { out.push(p); p.split(' ').forEach(x => seen.add(x)); });
    for (const s of singles) {
      if (out.length >= limit) break;
      if (seen.has(s)) continue;
      out.push(s); seen.add(s);
    }
    return out.slice(0, limit);
  }

  /* ---- detect explicit headings (markdown, numbered, ALLCAPS, colon lines) ---- */
  function detectHeadings(text) {
    const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const heads = [];
    lines.forEach(l => {
      let m;
      if ((m = l.match(/^#{1,4}\s+(.+)/))) heads.push(clean(m[1]));
      else if ((m = l.match(/^\d+[.)]\s+([A-Z].{2,50})$/))) heads.push(clean(m[1]));
      else if (/^[A-Z][A-Za-z ]{2,44}:$/.test(l)) heads.push(clean(l.replace(/:$/, '')));
      else if (/^[A-Z0-9 ]{4,44}$/.test(l) && l.split(' ').length <= 6) heads.push(titleCase(l.toLowerCase()));
    });
    return [...new Set(heads)].slice(0, 8);
  }

  function inferCentralTopic(text, phrases) {
    // First heading? First strong proper phrase? Fallback to top phrase.
    const firstLine = text.split(/\n/).map(l => l.trim()).filter(Boolean)[0] || '';
    if (firstLine && firstLine.length <= 60 && firstLine.length > 3 && !/[.!?]$/.test(firstLine)) {
      return titleCase(clean(firstLine).replace(/^#+\s*/, ''));
    }
    const proper = text.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\b/);
    if (proper) return proper[1];
    return phrases[0] ? titleCase(phrases[0]) : 'Your Topic';
  }

  /* ---- attach supporting sentences to a branch keyword ---- */
  function sentencesFor(keyword, sents, used) {
    const parts = keyword.toLowerCase().split(' ');
    return sents.filter(s => {
      if (used.has(s)) return false;
      const low = s.toLowerCase();
      return parts.some(p => low.includes(p));
    });
  }

  function shorten(s, n) {
    s = clean(s.replace(/^[\d.)\-\s]+/, ''));
    if (s.length <= n) return s;
    const cut = s.slice(0, n);
    return cut.slice(0, cut.lastIndexOf(' ')) + '…';
  }

  let uid = 0;
  const nid = () => 'n' + (++uid);

  /* =========================================================
     Build a mind map from raw text
     ========================================================= */
  function fromText(text, opts) {
    opts = opts || {};
    text = clean(text) === '' ? '' : text;
    const sents = sentences(text);
    const scores = keywordScores(text);
    const phrases = topPhrases(text, scores, 7);
    const headings = detectHeadings(text);
    const central = opts.title || inferCentralTopic(text, phrases);

    // Branch labels: prefer explicit headings, else top phrases
    let branchLabels = headings.length >= 3 ? headings : phrases;
    branchLabels = branchLabels.slice(0, Math.min(6, Math.max(3, branchLabels.length)));
    if (branchLabels.length === 0) branchLabels = phrases.slice(0, 4);

    const used = new Set();
    const root = {
      id: nid(), label: titleCase(central), kind: 'root',
      note: 'The central idea of your resource — everything else radiates from here.',
      children: []
    };

    branchLabels.forEach((label) => {
      const supporting = sentencesFor(label, sents, used).slice(0, 4);
      supporting.forEach(s => used.add(s));

      const branch = {
        id: nid(), label: titleCase(label), kind: 'branch',
        note: supporting[0] ? shorten(supporting[0], 160) : 'A major theme extracted from your resource.',
        children: []
      };

      supporting.forEach(s => {
        const isExample = EXAMPLE_CUES.test(s);
        const child = {
          id: nid(),
          label: shorten(s, 46),
          kind: isExample ? 'example' : (DEFINITION_CUES.test(s) ? 'point' : 'point'),
          note: shorten(s, 220),
          children: []
        };
        // occasionally add a keyword sub-point
        const kw = (words(s).find(x => !STOP.has(x) && x.length > 5 && scores[x] > 1.5));
        if (kw && Math.random() > 0.4) {
          child.children.push({
            id: nid(), label: titleCase(kw), kind: 'key',
            note: 'A key term worth remembering.', children: []
          });
        }
        branch.children.push(child);
      });

      if (branch.children.length === 0) {
        branch.children.push({
          id: nid(), label: 'Key point', kind: 'point',
          note: 'Add more detail to this branch by expanding your resource.', children: []
        });
      }
      root.children.push(branch);
    });

    return { root, meta: buildMeta(root, text, sents) };
  }

  /* =========================================================
     Build a mind map from a bare topic (curated skeleton)
     ========================================================= */
  const TOPIC_TEMPLATES = {
    'the solar system': {
      branches: [
        ['The Sun', ['A G-type main-sequence star', 'Contains 99.8% of the system\'s mass', 'Nuclear fusion of hydrogen']],
        ['Terrestrial Planets', ['Mercury — closest to the Sun', 'Venus — thick toxic atmosphere', 'Earth — the only known life', 'Mars — the red planet']],
        ['Gas Giants', ['Jupiter — largest planet', 'Saturn — iconic rings', 'Uranus & Neptune — ice giants']],
        ['Small Bodies', ['Asteroid belt', 'Comets — icy visitors', 'Dwarf planets like Pluto']],
        ['Formation', ['Born from a molecular cloud', 'Accretion over 4.6 billion years']]
      ]
    },
    'machine learning': {
      branches: [
        ['Supervised Learning', ['Learns from labeled data', 'Regression predicts values', 'Classification predicts categories']],
        ['Unsupervised Learning', ['Finds hidden structure', 'Clustering groups data', 'Dimensionality reduction']],
        ['Neural Networks', ['Inspired by the brain', 'Layers of weighted neurons', 'Deep learning stacks many layers']],
        ['Training', ['Loss functions measure error', 'Gradient descent optimises', 'Overfitting vs generalisation']],
        ['Applications', ['Vision and speech', 'Recommendation systems', 'Language models']]
      ]
    },
    'ancient greece': {
      branches: [
        ['City-States', ['Athens — birthplace of democracy', 'Sparta — a military society', 'Independent poleis']],
        ['Philosophy', ['Socrates and the dialectic', 'Plato\'s Academy', 'Aristotle\'s logic']],
        ['Mythology', ['The Olympian gods', 'Epic heroes and monsters', 'Homer\'s Iliad & Odyssey']],
        ['Culture', ['Theatre and tragedy', 'The Olympic Games', 'Classical architecture']],
        ['Legacy', ['Foundations of Western thought', 'Mathematics and science']]
      ]
    },
    'climate change': {
      branches: [
        ['Causes', ['Greenhouse gas emissions', 'Burning fossil fuels', 'Deforestation']],
        ['Effects', ['Rising global temperatures', 'Melting ice and sea-level rise', 'Extreme weather events']],
        ['The Science', ['The greenhouse effect', 'Carbon cycle disruption', 'Climate feedback loops']],
        ['Solutions', ['Renewable energy', 'Carbon capture', 'Policy and cooperation']],
        ['Impact', ['Ecosystems and biodiversity', 'Human health and migration']]
      ]
    }
  };

  function fromTopic(topic) {
    const key = clean(topic).toLowerCase();
    const tpl = TOPIC_TEMPLATES[key];
    const root = { id: nid(), label: titleCase(topic), kind: 'root',
      note: 'The central subject of this mind map.', children: [] };

    if (tpl) {
      tpl.branches.forEach(([label, points]) => {
        const branch = { id: nid(), label, kind: 'branch',
          note: 'A major dimension of ' + titleCase(topic) + '.', children: [] };
        points.forEach(p => branch.children.push({
          id: nid(), label: p, kind: EXAMPLE_CUES.test(p) ? 'example' : 'point',
          note: p, children: []
        }));
        root.children.push(branch);
      });
    } else {
      // Generic scaffold for unknown topics
      const scaffolds = [
        ['Definition', ['What it is', 'Why it matters', 'Core principles']],
        ['Key Concepts', ['Foundational ideas', 'Important terms', 'Common patterns']],
        ['Examples', ['Real-world cases', 'Notable instances']],
        ['Applications', ['Where it is used', 'Practical impact']],
        ['Going Deeper', ['Open questions', 'Related topics']]
      ];
      scaffolds.forEach(([label, points]) => {
        const branch = { id: nid(), label, kind: 'branch',
          note: 'Explore the ' + label.toLowerCase() + ' of ' + titleCase(topic) + '.', children: [] };
        points.forEach(p => branch.children.push({
          id: nid(), label: p, kind: 'point', note: p, children: []
        }));
        root.children.push(branch);
      });
    }
    return { root, meta: buildMeta(root, topic, []) };
  }

  /* ---- meta / stats ---- */
  function countNodes(node) {
    let c = 1;
    (node.children || []).forEach(ch => c += countNodes(ch));
    return c;
  }
  function buildMeta(root, text, sents) {
    const concepts = countNodes(root) - 1;
    return {
      concepts,
      branches: root.children.length,
      words: words(text).length,
      summary: makeSummary(root, sents)
    };
  }
  function makeSummary(root, sents) {
    const branchNames = root.children.map(b => b.label);
    if (sents && sents.length) {
      return clean(sents.slice(0, 2).join(' ')).slice(0, 220);
    }
    return 'A map of ' + root.label + ' spanning ' + branchNames.slice(0, 3).join(', ') +
      (branchNames.length > 3 ? ' and more.' : '.');
  }

  /* =========================================================
     Storybook: merge a new resource into an existing map
     ========================================================= */
  function overlapScore(labelA, labelB) {
    const a = new Set(words(labelA).filter(w => !STOP.has(w)));
    const b = words(labelB).filter(w => !STOP.has(w));
    let hits = 0;
    b.forEach(w => { if (a.has(w)) hits++; });
    return hits;
  }

  function mergeIntoStory(existingRoot, newMap, day) {
    // Find the best existing branch to attach today's themes to; else add new branch.
    const additions = [];
    newMap.root.children.forEach(newBranch => {
      let best = null, bestScore = 0;
      existingRoot.children.forEach(exBranch => {
        const sc = overlapScore(exBranch.label, newBranch.label) +
          exBranch.children.reduce((a, c) => a + overlapScore(c.label, newBranch.label), 0) * 0.5;
        if (sc > bestScore) { bestScore = sc; best = exBranch; }
      });

      newBranch.children.forEach(c => { c.isNew = true; c.day = day; });

      if (best && bestScore >= 1) {
        // merge: attach today's points under the related existing branch
        newBranch.children.forEach(c => best.children.push(c));
        additions.push({ type: 'merged', into: best.label, label: newBranch.label });
      } else {
        // brand-new branch
        newBranch.isNew = true; newBranch.day = day;
        existingRoot.children.push(newBranch);
        additions.push({ type: 'branch', label: newBranch.label });
      }
    });
    return additions;
  }

  global.MindGen = {
    fromText, fromTopic, mergeIntoStory, sentences, clean, titleCase,
    // sample resource text used by "Load a sample"
    SAMPLE: `The Art of Memory

Memory is not a single faculty but a set of connected systems. Understanding how it works can transform the way we learn.

Encoding: Information first enters through our senses and is transformed into a form the brain can store. For example, when you read a new word, your brain encodes both its sound and its meaning. Deep encoding, connecting new ideas to what you already know, produces far stronger memories than shallow repetition.

Storage: Once encoded, memories are held across different stores. Short-term memory holds only a handful of items for seconds. Long-term memory, by contrast, has an effectively unlimited capacity and can last a lifetime. Sleep plays a crucial role, as the brain consolidates the day's experiences overnight.

Retrieval: A memory is only useful if we can find it again. Retrieval cues, such as a smell or a place, can unlock memories we thought were lost. The act of retrieving a memory actually strengthens it, which is why testing yourself is more effective than re-reading.

Techniques: The method of loci, used by ancient Greek orators, places ideas along an imagined journey through a familiar building. Spaced repetition schedules reviews at increasing intervals to fight forgetting. Chunking groups small pieces of information into larger meaningful units, like remembering a phone number in blocks.`
  };

})(typeof window !== 'undefined' ? window : this);
