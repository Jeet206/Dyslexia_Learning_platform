// pages/index.js
import Head from 'next/head';
import Script from 'next/script';
import { useState, useEffect } from 'react';

export default function Home() {
  const [lessonText, setLessonText] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [demoMode, setDemoMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [simplified, setSimplified] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Add sample lesson on page load
    setLessonText(`The Water Cycle
The water cycle is the continuous movement of water on, above, and below the surface of the Earth. Solar energy drives the cycle by heating water in the oceans, which evaporates into water vapor. This water vapor rises into the atmosphere, where it cools and condenses around particles to form clouds. When the water droplets in clouds become too heavy, they fall to Earth as precipitation in the form of rain, snow, sleet, or hail. The fallen water then flows over the ground as surface runoff, eventually returning to the oceans, or it seeps into the ground to become groundwater. Some groundwater is stored in aquifers, while some flows back to the surface through springs or is drawn up by plants and returned to the atmosphere through transpiration. The water cycle is essential for all life on Earth, as it distributes fresh water around the planet and helps regulate temperature and climate patterns.`);
  }, []);

  async function handleGenerate() {
    if (!lessonText.trim()) {
      setError('Please paste some lesson content first!');
      return;
    }
    setError('');
    setLoading(true);
    setSimplified('');
    setQuestions([]);

    try {
      if (demoMode) {
        // small simulated delay
        await new Promise(r => setTimeout(r, 800));
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: lessonText, num_questions: numQuestions })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();

      // set simplified and questions
      setSimplified(data.simplified || '');
      setQuestions(data.questions || []);

      // smooth scroll to results after small delay
      setTimeout(() => {
        const el = document.getElementById('results');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);

      // stagger-in the question cards after they're mounted
      setTimeout(() => {
        const cards = Array.from(document.querySelectorAll('.question-card'));
        cards.forEach((c, i) => {
          setTimeout(() => c.classList.add('enter'), i * 80);
        });
      }, 180);
    } catch (err) {
      console.error(err);
      setError('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function createQuestionElement(q, idx) {
    if (q.type === 'mcq') {
      return (
        <div key={idx} className="question-card" role="group" aria-labelledby={`q-${idx}-label`}>
          <div className="question-header">
            <h3 id={`q-${idx}-label`}>Question {idx}</h3>
            <span className="question-type">Multiple Choice</span>
          </div>
          <p className="question-text">{q.question}</p>
          <div className="options" role="radiogroup" aria-labelledby={`q-${idx}-label`}>
            {q.options.map((opt, i) => (
              <label key={i} className="option" tabIndex={0}>
                <input type="radio" name={`q${idx}`} value={i} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          <div className="question-actions">
            <button className="hint-btn" onClick={() => toggleHint(idx)}>💡 Need a hint?</button>
            <button className="answer-btn" onClick={() => toggleAnswer(idx)}>👁️ Show answer</button>
          </div>
          <div className="hint" id={`hint${idx}`}>
            <strong>Hint:</strong> {q.hint}
          </div>
          <div className="answer" id={`answer${idx}`}>
            <strong>Answer:</strong> {q.answer}
          </div>
        </div>
      );
    } else if (q.type === 'true_false') {
      return (
        <div key={idx} className="question-card" role="group" aria-labelledby={`q-${idx}-label`}>
          <div className="question-header">
            <h3 id={`q-${idx}-label`}>Question {idx}</h3>
            <span className="question-type">True/False</span>
          </div>
          <p className="question-text">{q.question}</p>
          <div className="options" role="radiogroup" aria-labelledby={`q-${idx}-label`}>
            <label className="option" tabIndex={0}>
              <input type="radio" name={`q${idx}`} value="true" />
              <span>True</span>
            </label>
            <label className="option" tabIndex={0}>
              <input type="radio" name={`q${idx}`} value="false" />
              <span>False</span>
            </label>
          </div>
          <div className="question-actions">
            <button className="hint-btn" onClick={() => toggleHint(idx)}>💡 Need a hint?</button>
            <button className="answer-btn" onClick={() => toggleAnswer(idx)}>👁️ Show answer</button>
          </div>
          <div className="hint" id={`hint${idx}`}>
            <strong>Hint:</strong> {q.hint}
          </div>
          <div className="answer" id={`answer${idx}`}>
            <strong>Answer:</strong> {q.answer}
          </div>
        </div>
      );
    } else {
      return (
        <div key={idx} className="question-card" role="group" aria-labelledby={`q-${idx}-label`}>
          <div className="question-header">
            <h3 id={`q-${idx}-label`}>Question {idx}</h3>
            <span className="question-type">Short Answer</span>
          </div>
          <p className="question-text">{q.question}</p>
          <div className="short-answer">
            <textarea placeholder="Type your answer here..." rows="3" />
          </div>
          <div className="question-actions">
            <button className="hint-btn" onClick={() => toggleHint(idx)}>💡 Need a hint?</button>
            <button className="answer-btn" onClick={() => toggleAnswer(idx)}>👁️ Show answer</button>
          </div>
          <div className="hint" id={`hint${idx}`}>
            <strong>Hint:</strong> {q.hint}
          </div>
          <div className="answer" id={`answer${idx}`}>
            <strong>Answer:</strong> {q.answer}
          </div>
        </div>
      );
    }
  }

  // Toggle by adding/removing the 'open' class (works with CSS animation)
  function toggleHint(n) {
    const el = document.getElementById(`hint${n}`);
    if (!el) return;
    el.classList.toggle('open');
    // keep the opened hint in view
    if (el.classList.contains('open')) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function toggleAnswer(n) {
    const el = document.getElementById(`answer${n}`);
    if (!el) return;
    el.classList.toggle('open');
    if (el.classList.contains('open')) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  return (
    <>
      <Head>
        <title>Dyslexia Helper - Interactive Q&A</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>

      <div className="container">
        <header className="header">
          <h1>🎓 Let's Learn </h1>
          <p> Making learning fun and easy! </p>
        </header>

        <div className="input-section">
          <div className="form-group">
            <label htmlFor="lessonText">📝 Paste your lesson here:</label>
            <textarea
              id="lessonText"
              rows="6"
              value={lessonText}
              onChange={(e) => setLessonText(e.target.value)}
            />
          </div>

          <div className="controls">
            <div className="form-group">
              <label htmlFor="numQuestions">🔢 Number of questions:</label>
              <select id="numQuestions" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))}>
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={8}>8 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} />
                <span className="checkmark" style={{ color: demoMode ? 'white' : 'transparent' }}>✓</span>
                Use Demo Mode (faster testing)
              </label>
            </div>
          </div>

          <button id="generateBtn" className="generate-btn" onClick={handleGenerate} disabled={loading}>
            <span id="btnText" style={{ display: loading ? 'none' : 'inline' }}>🚀 Generate Questions</span>
            <span id="loader" className="loader" style={{ display: loading ? 'inline' : 'none' }}>⏳ Generating...</span>
          </button>
        </div>

        {error && (
          <div id="errorSection" className="error-section">
            <h3>❌ Oops! Something went wrong</h3>
            <p id="errorMessage">{error}</p>
          </div>
        )}

        <div id="results" className="results" style={{ display: simplified ? 'block' : 'none' }}>
          <div className={`simplified-section ${simplified ? 'visible' : ''}`}>
            <h2>📖 Simplified Lesson</h2>
            <div id="simplifiedText" className="simplified-text" dangerouslySetInnerHTML={{ __html: simplified }} />
          </div>

          <div className="questions-section">
            <h2>🤔 Practice Questions</h2>
            <div id="questionsList" className="questions-list">
              {questions.map((q, idx) => createQuestionElement(q, idx + 1))}
            </div>
          </div>
        </div>
      </div>

      {/* interactive JS for animations & toggles */}
      <Script src="/interactive.js" strategy="afterInteractive" />
    </>
  );
}
