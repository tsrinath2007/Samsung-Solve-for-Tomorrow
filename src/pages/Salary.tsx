import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Globe, TrendingUp, Info } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

type CountryKey = 'US' | 'UK' | 'DE' | 'IN' | 'CA';

interface CountryConfig {
  label: string;
  currency: string;
  multiplier: number;
  symbol: string;
}

const countryConfigs: Record<CountryKey, CountryConfig> = {
  US: { label: "United States", currency: "USD", multiplier: 1.0, symbol: "$" },
  UK: { label: "United Kingdom", currency: "GBP", multiplier: 0.78, symbol: "£" },
  DE: { label: "Germany", currency: "EUR", multiplier: 0.92, symbol: "€" },
  IN: { label: "India", currency: "INR", multiplier: 7.2, symbol: "₹" }, // localized adjusted multiplier
  CA: { label: "Canada", currency: "CAD", multiplier: 1.35, symbol: "C$" }
};

export const Salary: React.FC = () => {
  const { roadmap } = useRoadmap();
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<CountryKey>('US');

  if (!roadmap) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <DollarSign className="w-16 h-16 text-slate-700 mb-4 animate-bounce" />
        <h2 className="font-heading font-bold text-xl text-white mb-2">No Salary Telemetry Active</h2>
        <p className="max-w-md text-xs text-slate-500 mb-6">
          Generate an AI-powered career roadmap first to automatically compile a custom list of salary projections and job growth insights.
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

  const parseVal = (str: string): number => {
    // Extract numbers from strings like "$95,000" or "98000"
    const cleaned = str.replace(/[^0-9]/g, '');
    return parseInt(cleaned) || 90000;
  };

  // Convert default USD values to selected country currency values
  const defaultEntry = parseVal(roadmap.expectedSalary.entry);
  const defaultMid = parseVal(roadmap.expectedSalary.mid);
  const defaultSenior = parseVal(roadmap.expectedSalary.senior);

  const country = countryConfigs[selectedCountry];
  
  // Format based on country properties
  const formatVal = (val: number) => {
    const converted = Math.round(val * country.multiplier);
    // For India, represent in Lakhs if appropriate, but keeping it standard currency formatting is cleaner
    return `${country.symbol}${converted.toLocaleString()}`;
  };

  const entryStr = formatVal(defaultEntry);
  const midStr = formatVal(defaultMid);
  const seniorStr = formatVal(defaultSenior);

  // Target Starting Salary: Typically entry to mid-level transition
  const targetStartingStr = formatVal(defaultEntry + (defaultMid - defaultEntry) * 0.35);

  const chartData = [
    { label: 'Entry Level', amount: defaultEntry, formatted: entryStr, pct: 40, color: 'from-blue-500 to-sky-400' },
    { label: 'Mid Level', amount: defaultMid, formatted: midStr, pct: 65, color: 'from-neonPurple to-neonBlue' },
    { label: 'Senior Level', amount: defaultSenior, formatted: seniorStr, pct: 100, color: 'from-violet-500 to-purple-600' }
  ];

  return (
    <div className="w-full max-w-5xl px-6 py-10 text-slate-100 pb-24 lg:pb-12">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white mb-1.5 flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-emerald-400" /> Salary Insights
          </h1>
          <p className="text-xs text-slate-500">
            Market telemetry statistics for: <span className="text-neonBlue font-mono">{roadmap.career}</span>
          </p>
        </div>

        {/* Country Selector Dropdown */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-900 text-xs">
          <Globe className="w-4 h-4 text-slate-500" />
          <span className="text-slate-400 font-medium">Select Country:</span>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value as CountryKey)}
            className="bg-transparent border-none outline-none focus:ring-0 text-white font-bold cursor-pointer"
          >
            {Object.entries(countryConfigs).map(([key, cfg]) => (
              <option key={key} value={key} className="bg-slate-950 text-white">
                {cfg.label} ({cfg.currency})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Graph display panel (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-heading font-bold text-base text-white mb-6">
              National Salary Demographics ({country.currency})
            </h3>
            
            {/* Visual Bars */}
            <div className="space-y-6">
              {chartData.map((bar) => (
                <div key={bar.label} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-300">{bar.label}</span>
                    <span className="font-mono font-bold text-white">{bar.formatted}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden relative">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${bar.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Target expected tag overlay */}
            <div className="mt-8 p-4 rounded-xl border border-neonPurple/20 bg-neonPurple/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neonPurple/10 border border-neonPurple/20 flex items-center justify-center text-lg">
                  🎯
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">
                    PathWise Graduate Target
                  </span>
                  <span className="text-xs text-slate-300">Expected starting scale after roadmap compilation</span>
                </div>
              </div>
              <span className="text-lg font-heading font-extrabold text-neonPurple">{targetStartingStr}</span>
            </div>
          </div>
        </div>

        {/* Details Panel (Right Column) */}
        <div className="space-y-6">
          {/* Trend stats */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-neonBlue" /> Growth & Trends
            </h3>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block mb-1">Expected Growth</span>
              <span className="text-2xl font-heading font-extrabold text-white block">
                {roadmap.jobGrowth || '+18%'}
              </span>
            </div>
            <div className="border-t border-slate-900/60 pt-4 text-xs text-slate-400 leading-relaxed">
              <strong>Industry Outlook:</strong> {roadmap.industryOutlook || 'High general demands for specialists in modern SaaS applications.'}
            </div>
          </div>

          {/* Info banner */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/20 text-[10px] text-slate-500 flex gap-2.5 leading-relaxed">
            <Info className="w-5 h-5 text-slate-600 flex-shrink-0" />
            <span>
              Salary metrics compile public census parameters, Glassdoor job listings, and hiring records. Actual payout metrics vary depending on candidate location and organization sizes.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Salary;
