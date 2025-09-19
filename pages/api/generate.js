// pages/api/generate.js
import fs from 'fs';
import path from 'path';

/**
 * Simple text utilities
 */
function splitSentences(text) {
  // naive sentence splitter
  return text
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function makeHeadingFromText(text) {
  const firstLine = text.split('\n')[0].trim();
  if (firstLine.length > 0 && firstLine.length < 80 && firstLine.split(' ').length <= 8) {
    return firstLine;
  }
  return null;
}

function simplifyText(content) {
  // Very lightweight summarizer: pick the most informative sentences:
  const sentences = splitSentences(content);
  if (sentences.length === 0) return '<p>No content provided.</p>';

  // If the first line looks like a title, use as heading
  const heading = makeHeadingFromText(content);

  // Choose up to 6 sentences: first sentence + some largest sentences
  const first = sentences[0];
  const rest = sentences.slice(1);
  rest.sort((a, b) => b.length - a.length); // choose longer sentences as "more informative"
  const chosen = [first, ...rest.slice(0, 5)].slice(0, 6);

  // Build simple HTML
  let html = '';
  if (heading) html += `<h3>${escapeHtml(heading)}</h3>`;
  chosen.forEach(s => {
    html += `<p>${escapeHtml(s)}</p>`;
  });

  html += `<p><strong>Summary:</strong> This is a simplified version to help learning. Try the practice questions below!</p>`;
  return html;
}

/**
 * Very simple question generator:
 * - rotates between MCQ, true/false, short answer
 * - picks words from the content as answer targets
 */
function generateQuestions(content, numQuestions = 5) {
  const sentences = splitSentences(content);
  const words = content
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(Boolean)
    .filter(w => w.length > 3) // avoid tiny words
    .map(w => w.toLowerCase());

  // build a frequency map and array of candidate targets (not stopwords)
  const stop = new Set([
    'about','which','between','their','there','where','when','have','with','that','this','what','from',
    'your','they','these','those','would','could','should','while','about','other','every','again','through'
  ]);
  const freq = {};
  for (const w of words) {
    if (stop.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  // candidate targets sorted by freq
  const candidates = Object.keys(freq).sort((a,b) => freq[b] - freq[a]);

  // helper to get distractors
  function getDistractors(correct, count = 3) {
    const pool = Array.from(new Set(words)).filter(w => w !== correct);
    // try other candidates first
    const fromCandidates = pool.filter(w => candidates.includes(w));
    const picks = [];
    while (picks.length < count && fromCandidates.length) {
      picks.push(...fromCandidates.splice(0, count - picks.length));
    }
    // fill remaining randomly
    let i = 0;
    while (picks.length < count && pool.length && i < pool.length) {
      const p = pool[(i + Math.floor(Math.random()*pool.length)) % pool.length];
      if (!picks.includes(p) && p !== correct) picks.push(p);
      i++;
    }
    // if still not enough, generate variants
    while (picks.length < count) picks.push(correct + String.fromCharCode(97 + picks.length));
    return picks.slice(0, count);
  }

  const types = ['mcq', 'true_false', 'short_answer'];
  const questions = [];

  for (let i = 0; i < numQuestions; i++) {
    const type = types[i % types.length];

    // choose base sentence or phrase
    const base = sentences[i % sentences.length] || sentences[0] || content;
    if (type === 'mcq') {
      // pick a likely answer word
      const correct = candidates[i % candidates.length] || (words[i % words.length] || 'answer');
      const distractors = getDistractors(correct, 3);
      const options = shuffleArray([correct, ...distractors]).map(capitalizeFirst);
      const correctIndex = options.findIndex(o => normalize(o) === normalize(correct));
      const q = {
        type: 'mcq',
        question: `In the lesson above, which of the following best answers: "${truncate(base, 80)}"?`,
        options: options,
        correct: correctIndex,
        hint: `Look around the part where "${correct}" is mentioned in the lesson.`,
        answer: `${capitalizeFirst(correct)} — (extracted from the lesson content).`
      };
      questions.push(q);
    } else if (type === 'true_false') {
      // create a true/false by slightly negating the sentence or keeping
      const truth = Math.random() > 0.3; // mostly true
      const statement = truncate(base.replace(/\s+/g, ' '), 120);
      const q = {
        type: 'true_false',
        question: truth ? `${statement}` : `${negateSentence(statement)}`,
        correct: truth,
        hint: 'Try to remember what the lesson said about this part.',
        answer: truth ? 'True — this matches the lesson.' : 'False — this was changed slightly from the lesson.'
      };
      questions.push(q);
    } else {
      // short answer: ask to name something from sentence
      const word = candidates[(i + 1) % candidates.length] || words[(i+1) % words.length] || 'answer';
      const q = {
        type: 'short_answer',
        question: `Briefly explain or name: "${truncate(base, 70)}"`,
        hint: `A short answer referring to "${word}" would help.`,
        answer: `One good short answer: ${capitalizeFirst(word)} (from the lesson).`
      };
      questions.push(q);
    }
  }

  return questions;
}

/* Helper small utilities */
function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1).trim() + '...' : s;
}
function escapeHtml(s) {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g,'');
}
function capitalizeFirst(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function negateSentence(sent) {
  // naive negation: insert "not" after first verb-like word
  const words = sent.split(' ');
  for (let i = 0; i < words.length; i++) {
    const w = words[i].toLowerCase().replace(/[^a-z]/g,'');
    // crude verb detection
    if (['is','are','was','were','has','have','do','does','can','will','may','should','could'].includes(w)) {
      words.splice(i+1, 0, 'not');
      return words.join(' ');
    }
  }
  // fallback: prefix "It is not true that"
  return 'It is not true that ' + sent;
}

/* API handler */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { content, num_questions } = req.body || {};
  const numQ = parseInt(num_questions || 5, 10);

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    res.status(400).json({ error: 'Please provide content in the "content" field.' });
    return;
  }

  try {
    const simplified = simplifyText(content);
    const questions = generateQuestions(content, Math.max(1, Math.min(20, isNaN(numQ) ? 5 : numQ)));

    // Save to local JSON DB (demo). For production, replace with real DB.
    const dbPath = path.join(process.cwd(), 'data', 'submissions.json');
    let existing = [];
    try {
      const raw = fs.readFileSync(dbPath, 'utf8');
      existing = JSON.parse(raw || '[]');
      if (!Array.isArray(existing)) existing = [];
    } catch (err) {
      existing = [];
    }

    const entry = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      content: content.slice(0, 5000),
      simplified,
      questions
    };
    existing.push(entry);

    // Write back (synchronous for simplicity). On Vercel this file is ephemeral — use a DB for persistence.
    try {
      fs.writeFileSync(dbPath, JSON.stringify(existing, null, 2), 'utf8');
    } catch (err) {
      // ignore write errors on platforms that disallow writing; still return response
      console.warn('Could not write submissions.json:', err.message || err);
    }

    res.status(200).json({ simplified, questions });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
