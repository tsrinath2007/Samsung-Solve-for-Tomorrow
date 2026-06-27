import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { RoadmapProvider } from './context/RoadmapContext';
import { ParticleBackground } from './components/ParticleBackground';
import { Sidebar } from './components/Sidebar';
import { MobileNavbar } from './components/MobileNavbar';
import { AuthGate } from './components/AuthGate';
import { CommandPalette } from './components/CommandPalette';
import { RightChatPanel } from './components/RightChatPanel';

// Pages
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Roadmap } from './pages/Roadmap';
import { SkillsTree } from './pages/SkillsTree';
import { Planners } from './pages/Planners';
import { Projects } from './pages/Projects';
import { Certifications } from './pages/Certifications';
import { Analyzer } from './pages/Analyzer';
import { Interview } from './pages/Interview';
import { Salary } from './pages/Salary';
import { Profile } from './pages/Profile';

function App() {
  return (
    <RoadmapProvider>
      <Router>
        <AuthGate>
          <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans relative">
            
            {/* Parallax Background */}
            <ParticleBackground />

            {/* Global AI Command Palette */}
            <CommandPalette />

            {/* Navigation Structure */}
            <Sidebar />
            <MobileNavbar />

            {/* Main Flex Row containing Content Area & Collapsible AI Panel */}
            <div className="flex-1 flex flex-row relative min-h-screen">
              <main className="flex-1 lg:pl-64 min-h-screen flex flex-col items-center relative z-10 overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/roadmap" element={<Roadmap />} />
                  <Route path="/skills" element={<SkillsTree />} />
                  <Route path="/planners" element={<Planners />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/certifications" element={<Certifications />} />
                  <Route path="/analyzer" element={<Analyzer />} />
                  <Route path="/interview" element={<Interview />} />
                  <Route path="/salary" element={<Salary />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>

              {/* Docked Collapsible Right Chat Panel */}
              <RightChatPanel />
            </div>
            
          </div>
        </AuthGate>
      </Router>
    </RoadmapProvider>
  );
}

export default App;
