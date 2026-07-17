import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { problemAPI, submissionAPI, aiAPI, draftAPI } from '../services/api';
import {
  Play, Send, Lightbulb, Clock, ChevronDown,
  CheckCircle2, XCircle, Loader2, Terminal, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { id: 63, name: 'JavaScript', monaco: 'javascript', default: '// Write your solution here\nfunction solve(input) {\n  \n}\n' },
  { id: 71, name: 'Python', monaco: 'python', default: '# Write your solution here\ndef solve(input):\n    pass\n' },
  { id: 54, name: 'C++', monaco: 'cpp', default: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n' },
  { id: 62, name: 'Java', monaco: 'java', default: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n' },
];

export default function SolveProblem() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [langOpen, setLangOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hint, setHint] = useState('');
  const [output, setOutput] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const timerRef = useRef(null);
  const saveTimeout = useRef(null);

  // Fetch problem
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await problemAPI.getById(id);
        setProblem(res.data.data || res.data);
        // Try to load draft
        try {
          const draftRes = await draftAPI.get(id);
          if (draftRes.data?.data?.code) {
            setCode(draftRes.data.data.code);
            const savedLang = LANGUAGES.find(l => l.name.toLowerCase() === draftRes.data.data.language?.toLowerCase());
            if (savedLang) setLang(savedLang);
            return;
          }
        } catch {}
        setCode(LANGUAGES[0].default);
      } catch (err) {
        toast.error('Problem not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Timer
  useEffect(() => {
    if (!started) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          toast.error('Time is up!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started]);

  // Auto-save draft (debounced)
  const handleCodeChange = useCallback((value) => {
    setCode(value);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await draftAPI.save(id, { code: value, language: lang.name.toLowerCase() });
      } catch {}
    }, 3000);
  }, [id, lang]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const res = await submissionAPI.run(id, {
        code,
        language: lang.name.toLowerCase()
      });
      
      const backendData = res.data.data;
      const formattedOutput = {
        executionTime: backendData.runtime,
        memory: backendData.memory,
        results: backendData.rawResults?.map(r => ({
          passed: r.status?.id === 3,
          stdout: (r.stdout || '') + (r.compile_output ? '\\n' + r.compile_output : '') + (r.stderr ? '\\n' + r.stderr : '') || r.status?.description,
          expected: r.expected_output // Judge0 might not return this unless requested, but we'll map it just in case
        }))
      };

      if (backendData.errorMessage) {
        formattedOutput.error = backendData.errorMessage;
      }

      setOutput(formattedOutput);
      setActiveTab('output');
    } catch (err) {
      const msg = err.response?.data?.message || 'Execution failed';
      toast.error(msg);
      setOutput({ error: msg });
      setActiveTab('output');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setOutput(null);
    try {
      const res = await submissionAPI.submit(id, {
        code,
        language: lang.name.toLowerCase()
      });
      
      const doc = res.data.data;
      const formattedOutput = {
        executionTime: doc.runtime,
        memory: doc.memory,
        results: [] // Hidden test cases don't return raw outputs
      };
      
      if (doc.status !== 'accepted') {
        formattedOutput.error = doc.errorMessage || `Failed at hidden test cases (${doc.testCasesPassed}/${doc.testCasesTotal} passed)`;
      } else {
        formattedOutput.stdout = `🎉 Successfully passed all ${doc.testCasesTotal} hidden test cases!`;
      }

      setOutput(formattedOutput);
      setActiveTab('output');
      
      if (doc.status === 'accepted') {
        toast.success('🎉 All test cases passed!');
      } else {
        toast.error('Some test cases failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed';
      toast.error(msg);
      setOutput({ error: msg });
      setActiveTab('output');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHint = async () => {
    setHintLoading(true);
    try {
      const res = await aiAPI.getHint(id, code, lang.name.toLowerCase());
      setHint(res.data.hint || res.data.data?.hint || 'Think about the data structures you can use.');
      setActiveTab('hint');
      toast.success('Hint generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get hint');
    } finally {
      setHintLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <Loader2 className="animate-spin text-green-accent" size={32} />
      </div>
    );
  }

  if (!problem) return null;

  if (!started) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-950">
        <div className="glass rounded-3xl text-center max-w-md w-full mx-4" style={{ padding: '48px' }}>
          <div className="w-16 h-16 bg-green-accent/10 text-green-accent rounded-full flex items-center justify-center mx-auto" style={{ marginBottom: '24px' }}>
            <Clock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white" style={{ marginBottom: '8px' }}>{problem.title}</h2>
          <p className="text-white/40" style={{ marginBottom: '32px' }}>You have 45 minutes to solve this problem. The timer will begin as soon as you start.</p>
          <button 
            onClick={() => setStarted(true)} 
            className="btn-glow w-full text-base font-semibold"
            style={{ padding: '14px 24px' }}
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  const diffClass = `badge-${problem.difficulty}`;

  return (
    <div className="h-screen flex flex-col bg-dark-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-dark-950 shrink-0 relative z-50" style={{ height: '60px', padding: '0 24px' }}>
        <div className="flex items-center" style={{ gap: '16px' }}>
          <h2 className="font-bold text-white truncate max-w-[200px] md:max-w-none" style={{ fontSize: '18px', letterSpacing: '0.2px' }}>
            {problem.title}
          </h2>
          <span className={`rounded-full font-bold ${diffClass}`} style={{ padding: '4px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center" style={{ gap: '20px' }}>
          {/* Timer */}
          <div className={`flex items-center font-mono ${timeLeft < 300 ? 'text-red-400' : 'text-white/50'}`} style={{ gap: '6px', fontSize: '14px' }}>
            <Clock size={14} />
            {formatTime(timeLeft)}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center rounded-lg glass-light hover:text-white transition-colors"
              style={{ padding: '6px 12px', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}
            >
              {lang.name}
              <ChevronDown size={14} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-10 glass rounded-xl shadow-2xl" style={{ zIndex: 9999, padding: '8px 0', width: '160px', backgroundColor: '#111814', border: '1px solid rgba(255,255,255,0.1)' }}>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setLang(l);
                      if (!code || LANGUAGES.some(la => la.default === code)) setCode(l.default);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left transition-colors hover:bg-white/10 ${
                      lang.id === l.id ? 'text-green-accent font-semibold' : 'text-white/70'
                    }`}
                    style={{ padding: '10px 16px', fontSize: '14px', display: 'block' }}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden" style={{ padding: '16px', gap: '16px', background: '#050706' }}>
        {/* Left Panel: Problem Description */}
        <div className="w-full md:w-[420px] lg:w-[480px] bg-[#0a0f0d] rounded-xl border border-white/10 flex flex-col shrink-0 overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-white/5 shrink-0 bg-[#162019]" style={{ gap: '4px', padding: '0 12px' }}>
            {[
              { key: 'description', label: 'Description' },
              { key: 'output', label: 'Output', icon: <Terminal size={13} /> },
              { key: 'hint', label: 'Hint', icon: <Lightbulb size={13} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'text-green-accent border-green-accent'
                    : 'text-white/40 border-transparent hover:text-white/60'
                }`}
                style={{ padding: '12px 16px', gap: '6px', fontSize: '13px', fontWeight: 500 }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto text-sm" style={{ padding: '28px' }}>
            {activeTab === 'description' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight" style={{ marginBottom: '16px' }}>{problem.title}</h3>
                  <p className="text-white/70 leading-relaxed whitespace-pre-wrap" style={{ fontSize: '15px' }}>
                    {problem.description}
                  </p>
                </div>

                {problem.visibleTestCases?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/80" style={{ marginBottom: '16px' }}>Examples</h4>
                    {problem.visibleTestCases.map((tc, i) => (
                      <div key={i} className="glass-light rounded-xl" style={{ padding: '16px 20px', marginBottom: '16px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <span className="text-xs text-white/40 block font-semibold uppercase tracking-wider" style={{ marginBottom: '6px' }}>Input</span>
                          <pre className="text-green-accent font-mono text-sm">{tc.input}</pre>
                        </div>
                        <div style={{ marginBottom: tc.explanation ? '12px' : '0' }}>
                          <span className="text-xs text-white/40 block font-semibold uppercase tracking-wider" style={{ marginBottom: '6px' }}>Output</span>
                          <pre className="text-white font-mono text-sm">{tc.output}</pre>
                        </div>
                        {tc.explanation && (
                          <div>
                            <span className="text-xs text-white/40 block font-semibold uppercase tracking-wider" style={{ marginBottom: '6px' }}>Explanation</span>
                            <p className="text-white/60 text-sm leading-relaxed">{tc.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {problem.tags?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/80" style={{ marginBottom: '12px' }}>Tags</h4>
                    <div className="flex flex-wrap" style={{ gap: '8px' }}>
                      {problem.tags.map((tag) => (
                        <span key={tag} className="rounded-lg glass-light text-xs text-white/60 font-medium" style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'output' && (
              <div>
                {output ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {output.error && (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" style={{ padding: '16px' }}>
                        {output.error}
                      </div>
                    )}
                    {output.results?.map((r, i) => (
                      <div key={i} className="glass-light rounded-xl" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          {r.passed ? (
                            <CheckCircle2 size={16} className="text-green-accent" />
                          ) : (
                            <XCircle size={16} className="text-red-400" />
                          )}
                          <span className={`text-sm font-medium ${r.passed ? 'text-green-accent' : 'text-red-400'}`}>
                            Test Case {i + 1}
                          </span>
                        </div>
                        {r.stdout && (
                          <pre className="text-xs text-white/50 font-mono" style={{ marginTop: '8px' }}>stdout: {r.stdout}</pre>
                        )}
                        {!r.passed && r.expected && (
                          <pre className="text-xs text-white/40 font-mono" style={{ marginTop: '8px' }}>Expected: {r.expected}</pre>
                        )}
                      </div>
                    ))}
                    {output.stdout && !output.results && (
                      <pre className="glass-light rounded-xl text-xs text-white/60 font-mono whitespace-pre-wrap" style={{ padding: '16px' }}>
                        {output.stdout}
                      </pre>
                    )}
                    {output.executionTime && (
                      <p className="text-xs text-white/30" style={{ marginTop: '16px' }}>
                        Execution Time: {output.executionTime}s | Memory: {output.memory || 'N/A'} KB
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '48px 0', textAlign: 'center' }}>
                    <p className="text-white/30">
                      Run or submit your code to see results here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hint' && (
              <div>
                {hint ? (
                  <div className="glass-light rounded-xl" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <Lightbulb size={20} className="text-yellow-400" />
                      <span className="text-base font-semibold text-white">AI Hint</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{hint}</p>
                  </div>
                ) : (
                  <div style={{ padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Lightbulb size={48} className="text-white/10" style={{ marginBottom: '24px' }} />
                    <p className="text-white/40 text-base" style={{ marginBottom: '32px' }}>Stuck? Ask the AI for a contextual hint.</p>
                    <button
                      onClick={handleHint}
                      disabled={hintLoading}
                      className="btn-glow inline-flex items-center font-semibold"
                      style={{ padding: '12px 28px', gap: '8px' }}
                    >
                      {hintLoading ? <Loader2 className="animate-spin" size={18} /> : <Lightbulb size={18} />}
                      Get Hint
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="flex-1 flex flex-col relative bg-[#0a0f0d] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex-1" style={{ minHeight: 0 }}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={lang.monaco}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
              }}
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="border-t border-white/10 flex items-center justify-between shrink-0" style={{ height: '72px', padding: '0 24px', backgroundColor: '#0a0f0d' }}>
            <button
              onClick={() => setActiveTab('hint')}
              className="text-white/40 hover:text-white/80 transition-colors flex items-center text-sm font-medium"
              style={{ gap: '8px' }}
            >
              <Lightbulb size={16} /> Hint
            </button>
            <div className="flex" style={{ gap: '16px' }}>
              <button
                onClick={handleRun}
                disabled={running || submitting}
                className="btn-glass text-sm flex items-center transition-all hover:bg-white/5"
                style={{ padding: '10px 24px', gap: '8px', borderRadius: '8px' }}
              >
                {running ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={running || submitting}
                className="btn-glow text-sm flex items-center font-bold"
                style={{ padding: '10px 28px', gap: '8px', borderRadius: '8px' }}
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
