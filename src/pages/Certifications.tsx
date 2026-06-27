import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, DollarSign, ExternalLink } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

interface CertType {
  name: string;
  provider: string;
  duration: string;
  difficulty: string;
  recognition: string;
  cost: string;
  badge: string;
  url: string;
}

export const Certifications: React.FC = () => {
  const { roadmap } = useRoadmap();
  const navigate = useNavigate();

  if (!roadmap) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Award className="w-16 h-16 text-slate-700 mb-4 animate-bounce" />
        <h2 className="font-heading font-bold text-xl text-white mb-2">No Certifications Found</h2>
        <p className="max-w-md text-xs text-slate-500 mb-6">
          Generate an AI-powered career roadmap first to automatically compile a custom list of recommended industry credentials.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-neonPurple to-neonBlue text-slate-950 font-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          Generate Roadmap
        </button>
      </div>
    );
  }

  // Extract from milestones
  const roadmapCerts: CertType[] = [];
  roadmap.milestones.forEach((m) => {
    if (m.certifications) {
      m.certifications.forEach((c) => {
        // Prevent duplicate lists
        if (!roadmapCerts.some((item) => item.name.toLowerCase() === c.name.toLowerCase())) {
          roadmapCerts.push(c);
        }
      });
    }
  });

  // Fallback default catalog based on keywords if roadmap has none
  const getFallbackCerts = (): CertType[] => {
    const careerLower = roadmap.career.toLowerCase();
    
    if (careerLower.includes('front') || careerLower.includes('web') || careerLower.includes('react')) {
      return [
        { name: "Meta Front-End Developer Professional Certificate", provider: "Coursera", duration: "7 Months", difficulty: "Beginner", recognition: "High", cost: "$49/month", badge: "⚛️", url: "https://www.coursera.org/professional-certificates/meta-frontend-developer" },
        { name: "AWS Certified Cloud Practitioner", provider: "AWS", duration: "1 Month", difficulty: "Beginner", recognition: "High", cost: "$100", badge: "☁️", url: "https://aws.amazon.com/certification/certified-cloud-practitioner/" },
        { name: "W3Schools Certified Front-End Developer", provider: "W3Schools", duration: "3 Weeks", difficulty: "Intermediate", recognition: "Medium", cost: "$95", badge: "🌐", url: "https://www.w3schools.com" }
      ];
    }
    if (careerLower.includes('ml') || careerLower.includes('machine') || careerLower.includes('ai')) {
      return [
        { name: "AWS Certified Machine Learning - Specialty", provider: "Amazon Web Services", duration: "4 Months", difficulty: "Advanced", recognition: "High", cost: "$300", badge: "🧠", url: "https://aws.amazon.com/certification/certified-machine-learning-specialty/" },
        { name: "TensorFlow Developer Certificate", provider: "Google / TensorFlow", duration: "2 Months", difficulty: "Intermediate", recognition: "High", cost: "$100", badge: "🤖", url: "https://www.tensorflow.org/certificate" },
        { name: "Deep Learning Specialization Certificate", provider: "DeepLearning.AI / Coursera", duration: "3 Months", difficulty: "Advanced", recognition: "High", cost: "$49/month", badge: "⚡", url: "https://www.coursera.org/" }
      ];
    }
    if (careerLower.includes('security') || careerLower.includes('cyber')) {
      return [
        { name: "CompTIA Security+", provider: "CompTIA", duration: "2 Months", difficulty: "Beginner", recognition: "High", cost: "$392", badge: "🛡️", url: "https://www.comptia.org/certifications/security" },
        { name: "Certified Ethical Hacker (CEH)", provider: "EC-Council", duration: "3 Months", difficulty: "Advanced", recognition: "High", cost: "$1,199", badge: "🔑", url: "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/" },
        { name: "Google Cybersecurity Professional", provider: "Coursera", duration: "6 Months", difficulty: "Beginner", recognition: "Medium", cost: "$49/month", badge: "🔒", url: "https://www.coursera.org/" }
      ];
    }

    // Catch-all
    return [
      { name: "Google IT Support Professional Certificate", provider: "Google / Coursera", duration: "6 Months", difficulty: "Beginner", recognition: "High", cost: "$49/month", badge: "💻", url: "https://www.coursera.org" },
      { name: "AWS Certified Cloud Practitioner", provider: "Amazon Web Services", duration: "2 Months", difficulty: "Beginner", recognition: "High", cost: "$100", badge: "☁️", url: "https://aws.amazon.com" }
    ];
  };

  const finalCerts = roadmapCerts.length > 0 ? roadmapCerts : getFallbackCerts();

  return (
    <div className="w-full max-w-5xl px-6 py-10 text-slate-100 pb-24 lg:pb-12">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-900">
        <h1 className="font-heading font-extrabold text-3xl text-white mb-1.5 flex items-center gap-2">
          <Award className="w-8 h-8 text-neonPurple" /> Recommended Certifications
        </h1>
        <p className="text-xs text-slate-500">
          Industry-recognized credentials matching: <span className="text-neonBlue font-mono">{roadmap.career}</span>
        </p>
      </div>

      {/* Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {finalCerts.map((cert, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all group">
            
            <div>
              {/* Badge/Title Area */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center text-2xl shadow-md group-hover:border-neonBlue group-hover:shadow-[0_0_10px_rgba(56,189,248,0.15)] transition-all flex-shrink-0">
                  {cert.badge || "🏅"}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
                    {cert.provider}
                  </span>
                  <h3 className="font-heading font-bold text-sm text-slate-200 mt-0.5 leading-snug">
                    {cert.name}
                  </h3>
                </div>
              </div>

              {/* Specs Rows */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-900/60 pt-4 mb-6">
                <div className="text-center p-2 bg-slate-950/40 border border-slate-900 rounded-lg">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono block mb-1">Cost</span>
                  <span className="text-[10px] font-bold text-white flex items-center justify-center gap-0.5">
                    <DollarSign className="w-3 h-3 text-emerald-400" /> {cert.cost}
                  </span>
                </div>
                <div className="text-center p-2 bg-slate-950/40 border border-slate-900 rounded-lg">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono block mb-1">Time</span>
                  <span className="text-[10px] font-bold text-white flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-neonBlue" /> {cert.duration}
                  </span>
                </div>
                <div className="text-center p-2 bg-slate-950/40 border border-slate-900 rounded-lg">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono block mb-1">Difficulty</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                    {cert.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900/40">
              <span className="text-[10px] text-slate-500">
                Recognition: <strong className="text-accentCyan uppercase font-mono">{cert.recognition || "High"}</strong>
              </span>
              <a
                href={cert.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white hover:bg-slate-800 hover:border-slate-700 transition-colors"
              >
                Launch Course <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
export default Certifications;
