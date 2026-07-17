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
  }, []);

  // Auto-save draft (debounced)
  const handleCodeChange = useCallback((value) => {
    setCode(value);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await draftAPI.save(id, { code: value, languageId: lang.id });
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
      const res = await submissionAPI.run({
        problemId: id,
        sourceCode: code,
        languageId: lang.id,
      });
      setOutput(res.data);
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
      const res = await submissionAPI.submit({
        problemId: id,
        sourceCode: code,
        languageId: lang.id,
      });
      setOutput(res.data);
      setActiveTab('output');
      if (res.data.allTestsPassed) {
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
      const res = await aiAPI.getHint(id, code);
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

  const diffClass = `badge-${problem.difficulty}`;

  return (
    <div className="h-screen flex flex-col bg-dark-950 pt-16">
      {/* Toolbar */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-white/5 glass shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-white truncate max-w-[200px] md:max-w-none">
            {problem.title}
          </h2>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${diffClass}`}>
            {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 text-sm font-mono ${timeLeft < 300 ? 'text-red-400' : 'text-white/50'}`}>
            <Clock size={14} />
            {formatTime(timeLeft)}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-light text-xs text-white/70 hover:text-white"
            >
              {lang.name}
              <ChevronDown size={14} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-10 glass rounded-xl py-2 w-36 z-50 shadow-lg">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setLang(l);
                      if (!code || LANGUAGES.some(la => la.default === code)) setCode(l.default);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${
                      lang.id === l.id ? 'text-green-accent' : 'text-white/60'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Problem Description */}
        <div className="w-full md:w-[420px] lg:w-[480px] border-r border-white/5 flex flex-col shrink-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/5 shrink-0">
            {[
              { key: 'description', label: 'Description' },
              { key: 'output', label: 'Output', icon: <Terminal size={13} /> },
              { key: 'hint', label: 'Hint', icon: <Lightbulb size={13} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'text-green-accent border-green-accent'
                    : 'text-white/40 border-transparent hover:text-white/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 text-sm">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">{problem.title}</h3>
                  <p className="text-white/60 leading-relaxed whitespace-pre-wrap">
                    {problem.description}
                  </p>
                </div>

                {problem.visibleTestCases?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/80 mb-3">Examples</h4>
                    {problem.visibleTestCases.map((tc, i) => (
                      <div key={i} className="glass-light rounded-xl p-4 mb-3">
                        <div className="mb-2">
                          <span className="text-xs text-white/40">Input:</span>
                          <pre className="text-green-accent font-mono text-xs mt-1">{tc.input}</pre>
                        </div>
                        <div className="mb-2">
                          <span className="text-xs text-white/40">Output:</span>
                          <pre className="text-white font-mono text-xs mt-1">{tc.output}</pre>
                        </div>
                        {tc.explanation && (
                          <div>
                            <span className="text-xs text-white/40">Explanation:</span>
                            <p className="text-white/50 text-xs mt-1">{tc.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {problem.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg glass-light text-xs text-white/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'output' && (
              <div>
                {output ? (
                  <div className="space-y-3">
                    {output.error && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {output.error}
                      </div>
                    )}
                    {output.results?.map((r, i) => (
                      <div key={i} className="glass-light rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
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
                          <pre className="text-xs text-white/50 font-mono mt-1">stdout: {r.stdout}</pre>
                        )}
                        {!r.passed && r.expected && (
                          <pre className="text-xs text-white/40 font-mono mt-1">Expected: {r.expected}</pre>
                        )}
                      </div>
                    ))}
                    {output.stdout && !output.results && (
                      <pre className="glass-light rounded-xl p-4 text-xs text-white/60 font-mono whitespace-pre-wrap">
                        {output.stdout}
                      </pre>
                    )}
                    {output.executionTime && (
                      <p className="text-xs text-white/30 mt-2">
                        Execution Time: {output.executionTime}s | Memory: {output.memory || 'N/A'} KB
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-white/30 text-center py-12">
                    Run or submit your code to see results here.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'hint' && (
              <div>
                {hint ? (
                  <div className="glass-light rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={16} className="text-yellow-400" />
                      <span className="text-sm font-semibold text-white">AI Hint</span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{hint}</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb size={32} className="mx-auto text-white/10 mb-3" />
                    <p className="text-white/30 text-sm mb-4">Stuck? Ask the AI for a contextual hint.</p>
                    <button
                      onClick={handleHint}
                      disabled={hintLoading}
                      className="btn-glow px-6 py-2.5 text-sm inline-flex items-center gap-2"
                    >
                      {hintLoading ? <Loader2 className="animate-spin" size={16} /> : <Lightbulb size={16} />}
                      Get Hint
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1">
            <Editor
              height="100%"
              language={lang.monaco}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 16 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="h-14 flex items-center justify-between px-4 border-t border-white/5 glass shrink-0">
            <button
              onClick={handleHint}
              disabled={hintLoading}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-yellow-400 transition-colors"
            >
              {hintLoading ? <Loader2 className="animate-spin" size={14} /> : <Lightbulb size={14} />}
              Hint
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRun}
                disabled={running || submitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg glass-light text-sm text-white/70 hover:text-white font-medium transition-all"
              >
                {running ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={running || submitting}
                className="btn-glow flex items-center gap-1.5 px-6 py-2 text-sm"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
