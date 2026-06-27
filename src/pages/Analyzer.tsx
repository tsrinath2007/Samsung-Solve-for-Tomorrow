import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck2, 
  GitFork, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck,
  FileText,
  UserCheck
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export const Analyzer: React.FC = () => {
  const { roadmap } = useRoadmap();
  
  const [activeSubTab, setActiveSubTab] = useState<'resume' | 'github'>('resume');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  
  // Resume States
  const [resumeText, setResumeText] = useState('');
  const [resumeResult, setResumeResult] = useState<any | null>(null);
  
  // GitHub States
  const [ghUser, setGhUser] = useState('');
  const [ghResult, setGhResult] = useState<any | null>(null);

  // Resume scanning simulator
  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setIsScanning(true);
    setScanMessage('Extracting text modules...');
    await new Promise(r => setTimeout(r, 1000));
    
    setScanMessage('Comparing keywords against career target...');
    await new Promise(r => setTimeout(r, 1200));
    
    setScanMessage('Calculating ATS parsing structures...');
    await new Promise(r => setTimeout(r, 1000));

    // Yield results based on active roadmap (or default if none)
    const activeSkills = roadmap ? roadmap.keywords : ['React', 'TypeScript', 'Node.js', 'Git'];
    const matched = activeSkills.slice(0, Math.ceil(activeSkills.length / 2));
    const missing = activeSkills.slice(Math.ceil(activeSkills.length / 2));

    setResumeResult({
      atsScore: 78,
      matchPct: 62,
      matchedSkills: matched,
      missingSkills: missing,
      suggestions: [
        "Include metrics on project descriptions: e.g., 'Reduced paint times by 40% using code splitting'.",
        "Add a dedicated 'Technical Skills' section categorizing languages, libraries, and hosting clouds.",
        "Your resume is missing standard developer keyword terms (e.g. 'Server Actions', 'Responsive Layouts')."
      ]
    });
    setIsScanning(false);
  };

  // GitHub scanning simulator
  const handleAnalyzeGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ghUser.trim()) return;

    setIsScanning(true);
    setScanMessage('Connecting to GitHub API...');
    await new Promise(r => setTimeout(r, 1000));
    
    setScanMessage('Analyzing repository README files...');
    await new Promise(r => setTimeout(r, 1200));
    
    setScanMessage('Calculating languages density & stars stats...');
    await new Promise(r => setTimeout(r, 1000));

    setGhResult({
      score: 'B+',
      repos: 12,
      stars: 18,
      commits: 'Active',
      languages: ['TypeScript (52%)', 'JavaScript (28%)', 'HTML/CSS (20%)'],
      recommendations: [
        "Increase README readability on portfolio repos: add visual screenshots and step-by-step setup guides.",
        "Remove boilerplate files (e.g. standard Vite icons) from your public repositories to keep code pristine.",
        "Set up automated build checking actions (like GitHub Actions workflows) to show testing capabilities."
      ]
    });
    setIsScanning(false);
  };

  return (
    <div className="w-full max-w-5xl px-6 py-10 text-slate-100 pb-24 lg:pb-12">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white mb-1.5 flex items-center gap-2">
            <FileCheck2 className="w-8 h-8 text-neonBlue animate-pulse" /> AI Portfolio Analyzers
          </h1>
          <p className="text-xs text-slate-500">
            Compare your profile specifications against active industry parameters
          </p>
        </div>

        {/* Sub-tab Toggle */}
        <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-900 rounded-xl">
          <button
            onClick={() => { setActiveSubTab('resume'); setResumeResult(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'resume' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-500'
            }`}
          >
            Resume Scorer
          </button>
          <button
            onClick={() => { setActiveSubTab('github'); setGhResult(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'github' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-500'
            }`}
          >
            GitHub Auditor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Forms Column (Left) */}
        <div className="lg:col-span-1 space-y-6">
          {activeSubTab === 'resume' ? (
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="font-heading font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-neonBlue" /> Resume Matcher
              </h3>
              <p className="text-[10px] text-slate-500 leading-normal">
                Paste your resume text below to scan keywords and generate compatibility ratings with your {roadmap ? roadmap.career : 'career goal'} roadmap.
              </p>
              
              <form onSubmit={handleAnalyzeResume} className="space-y-4">
                <textarea
                  placeholder="Paste resume text (skills, work history, summaries)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={8}
                  className="w-full glass-input p-3 rounded-xl text-xs"
                  required
                />
                <button
                  type="submit"
                  disabled={!resumeText.trim() || isScanning}
                  className="w-full py-2.5 rounded-xl bg-neonBlue text-slate-950 text-xs font-heading font-bold uppercase tracking-wider hover:bg-neonBlue/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Analyze Resume
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="font-heading font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <GitFork className="w-4 h-4 text-neonPurple" /> GitHub Portfolio Auditor
              </h3>
              <p className="text-[10px] text-slate-500 leading-normal">
                Enter your GitHub username to connect repository schemas, check README quality, commits history, and stars density.
              </p>
              
              <form onSubmit={handleAnalyzeGithub} className="space-y-4">
                <input
                  type="text"
                  placeholder="GitHub Username (e.g. torvalds)"
                  value={ghUser}
                  onChange={(e) => setGhUser(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                  required
                />
                <button
                  type="submit"
                  disabled={!ghUser.trim() || isScanning}
                  className="w-full py-2.5 rounded-xl bg-neonPurple text-white text-xs font-heading font-bold uppercase tracking-wider hover:bg-neonPurple/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Audit Username
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Results Screen Column (Right) */}
        <div className="lg:col-span-2">
          
          {/* Scan Loader */}
          {isScanning && (
            <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center h-[340px]">
              <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-neonBlue animate-spin mb-4" />
              <p className="text-xs text-neonBlue font-mono uppercase tracking-wider animate-pulse">{scanMessage}</p>
            </div>
          )}

          {/* Empty State */}
          {!isScanning && !resumeResult && !ghResult && (
            <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center h-[340px] border border-dashed border-slate-900">
              <Upload className="w-12 h-12 text-slate-800 mb-3 animate-bounce" />
              <h3 className="text-sm font-bold text-slate-400">Scan Awaiting Input</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xs">
                Fill in the analyzer form details on the left to trigger the parser engine.
              </p>
            </div>
          )}

          {/* Resume Results view */}
          {!isScanning && resumeResult && activeSubTab === 'resume' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Gauges rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ATS Score */}
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full border-4 border-neonBlue/40 flex items-center justify-center text-lg font-heading font-bold text-neonBlue shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                    {resumeResult.atsScore}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">ATS Scorer Rating</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                      Resume parsing parameters match standard compliance checkers.
                    </p>
                  </div>
                </div>

                {/* Match Percentage */}
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full border-4 border-neonPurple/40 flex items-center justify-center text-lg font-heading font-bold text-neonPurple shadow-[0_0_15px_rgba(124,58,237,0.15)]">
                    {resumeResult.matchPct}%
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">Roadmap Match</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                      Keyword overlap with target career roadmap modules.
                    </p>
                  </div>
                </div>

              </div>

              {/* Skills Overlaps */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Matched Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeResult.matchedSkills.map((sk: string) => (
                      <span key={sk} className="text-[10px] font-mono px-2 py-1 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900/60">
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Missing Core Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeResult.missingSkills.map((sk: string) => (
                      <span key={sk} className="text-[10px] font-mono px-2 py-1 bg-orange-500/5 border border-orange-500/20 text-orange-400 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Improvements */}
              <div className="glass-panel p-6 rounded-2xl space-y-3">
                <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-neonBlue" /> Resume Improvements
                </h4>
                <ul className="list-disc pl-4 space-y-2 text-xs text-slate-400 leading-relaxed">
                  {resumeResult.suggestions.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

            </motion.div>
          )}

          {/* GitHub Results view */}
          {!isScanning && ghResult && activeSubTab === 'github' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-5 rounded-2xl text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block mb-1">Portfolio Score</span>
                  <span className="text-3xl font-heading font-extrabold text-neonPurple block">{ghResult.score}</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block mb-1">Public Repos</span>
                  <span className="text-3xl font-heading font-extrabold text-white block">{ghResult.repos}</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block mb-1">Total Stars</span>
                  <span className="text-3xl font-heading font-extrabold text-neonBlue block">{ghResult.stars}</span>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Repository Languages Density</h4>
                <div className="space-y-2">
                  {ghResult.languages.map((l: string, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-mono">{l}</span>
                      <div className="w-1/2 h-1.5 rounded-full bg-slate-900 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-neonPurple to-neonBlue" 
                          style={{ width: l.includes('52%') ? '52%' : l.includes('28%') ? '28%' : '20%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl space-y-3">
                <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-neonBlue" /> Repository recommendations
                </h4>
                <ul className="list-disc pl-4 space-y-2 text-xs text-slate-400 leading-relaxed">
                  {ghResult.recommendations.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
export default Analyzer;
