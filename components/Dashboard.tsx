import React, { useState, useMemo } from 'react';
import { Leak, LeakStatus, DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BrainCircuit, Loader2, X, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { generateDashboardReport } from '../services/geminiService';

interface DashboardProps {
  leaks: Leak[];
  onClose: () => void;
}

const COLORS = {
  [LeakStatus.ACTIVE]: '#ef4444', // Red 500
  [LeakStatus.REPAIRING]: '#eab308', // Yellow 500
  [LeakStatus.REPAIRED]: '#22c55e', // Green 500
};

const Dashboard: React.FC<DashboardProps> = ({ leaks, onClose }) => {
  const [aiReport, setAiReport] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const stats: DashboardStats = useMemo(() => {
    const total = leaks.length;
    const active = leaks.filter(l => l.status === LeakStatus.ACTIVE).length;
    const repairing = leaks.filter(l => l.status === LeakStatus.REPAIRING).length;
    const repaired = leaks.filter(l => l.status === LeakStatus.REPAIRED).length;

    // Calculate simple avg repair time based on available dates
    const repairedLeaks = leaks.filter(l => l.status === LeakStatus.REPAIRED && l.repairedDate);
    let totalHours = 0;
    repairedLeaks.forEach(l => {
      const start = new Date(l.reportedDate).getTime();
      const end = new Date(l.repairedDate!).getTime();
      totalHours += (end - start) / (1000 * 60 * 60);
    });

    return {
      total,
      active,
      repairing,
      repaired,
      avgRepairTimeHours: repairedLeaks.length ? totalHours / repairedLeaks.length : 0
    };
  }, [leaks]);

  const statusData = [
    { name: 'Active', value: stats.active, color: COLORS[LeakStatus.ACTIVE] },
    { name: 'Repairing', value: stats.repairing, color: COLORS[LeakStatus.REPAIRING] },
    { name: 'Repaired', value: stats.repaired, color: COLORS[LeakStatus.REPAIRED] },
  ];

  // Group by Zone
  const zoneData = useMemo(() => {
    const map: Record<string, number> = {};
    leaks.forEach(l => {
      map[l.zone] = (map[l.zone] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [leaks]);

  // Mock trend data (last 7 days)
  const trendData = useMemo(() => {
    const days = 7;
    const data = [];
    const now = new Date();
    for(let i=days; i>=0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        data.push({
            date: d.toLocaleDateString('es-MX', { weekday: 'short' }),
            count: Math.floor(Math.random() * 10) + 2 // Mock random daily counts
        });
    }
    return data;
  }, []);

  const handleGenerateReport = async () => {
    setLoadingAi(true);
    setAiReport('');
    const report = await generateDashboardReport(stats, leaks.filter(l => l.status === LeakStatus.ACTIVE));
    setAiReport(report);
    setLoadingAi(false);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-50/95 backdrop-blur-sm flex flex-col overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Operational Dashboard</h2>
          <p className="text-slate-500 text-sm">Real-time analytics for Qro sin fugas</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI Cards */}
        <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Activity className="w-6 h-6"/></div>
             <div>
               <p className="text-sm text-slate-500">Total Incidents</p>
               <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
             </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-red-100 text-red-600 rounded-lg"><AlertCircle className="w-6 h-6"/></div>
             <div>
               <p className="text-sm text-slate-500">Active Leaks</p>
               <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
             </div>
          </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle className="w-6 h-6"/></div>
             <div>
               <p className="text-sm text-slate-500">Repaired</p>
               <p className="text-2xl font-bold text-slate-900">{stats.repaired}</p>
             </div>
          </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><BrainCircuit className="w-6 h-6"/></div>
             <div>
               <p className="text-sm text-slate-500">Avg Repair Time</p>
               <p className="text-2xl font-bold text-slate-900">{stats.avgRepairTimeHours.toFixed(1)}h</p>
             </div>
          </div>
        </div>

        {/* Charts */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
           {/* Trend Line */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Trend</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Zone Bar Chart */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Zones by Incidents</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneData} layout="vertical" margin={{left: 20}}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} style={{fontSize: '12px', fontWeight: 500}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Bar dataKey="count" fill="#64748b" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Status Pie & AI Report */}
        <div className="col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-semibold text-slate-800 mb-2 w-full text-left">Status Distribution</h3>
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex gap-4 text-xs font-medium mt-4">
                 {statusData.map(d => (
                   <div key={d.name} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                      {d.name}
                   </div>
                 ))}
              </div>
            </div>

            {/* AI Insight Section */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <BrainCircuit className="w-32 h-32" />
               </div>
               <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                 <BrainCircuit className="w-5 h-5 text-indigo-400" />
                 Gemini AI Analysis
               </h3>
               <div className="min-h-[120px] text-sm text-slate-300 leading-relaxed">
                  {loadingAi ? (
                    <div className="flex items-center gap-2 mt-4 text-indigo-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing city infrastructure data...
                    </div>
                  ) : aiReport ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                       {/* Simple rendering of markdown-like text */}
                       {aiReport.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                    </div>
                  ) : (
                    <p>Generate an executive summary of the current water leak situation using the Google Gemini 2.5 Flash model.</p>
                  )}
               </div>
               {!aiReport && !loadingAi && (
                 <button 
                   onClick={handleGenerateReport}
                   className="mt-4 w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2">
                   Generate Report
                 </button>
               )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;