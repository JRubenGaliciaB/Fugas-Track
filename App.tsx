import React, { useState, useMemo } from 'react';
import { Droplet, Menu, BarChart3, Layers, Box, Flame, Plus, X } from 'lucide-react';
import LeakMap from './components/LeakMap';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeakDetail from './components/LeakDetail';
import ReportModal from './components/ReportModal';
import { MOCK_LEAKS } from './constants';
import { FilterState, Leak } from './types';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [filter, setFilter] = useState<FilterState>({ status: 'ALL' });
  const [selectedLeakId, setSelectedLeakId] = useState<string | null>(null);
  
  // New Feature States
  const [leaks, setLeaks] = useState<Leak[]>(MOCK_LEAKS);
  const [is3DMode, setIs3DMode] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportLocation, setReportLocation] = useState<{lat: number, lng: number} | null>(null);

  // Filter Logic
  const filteredLeaks = useMemo(() => {
    if (filter.status === 'ALL') return leaks;
    return leaks.filter(leak => leak.status === filter.status);
  }, [filter, leaks]);

  const selectedLeak = useMemo(() => {
    return leaks.find(l => l.id === selectedLeakId) || null;
  }, [selectedLeakId, leaks]);

  const handleLeakSelect = (leak: Leak) => {
    if (showHeatmap) return; // Disable selection in heatmap mode
    setSelectedLeakId(leak.id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleReportStart = () => {
    setIsReporting(true);
    setSidebarOpen(false);
    setSelectedLeakId(null);
    setShowHeatmap(false); // Turn off heatmap to see where to click
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isReporting) {
      setReportLocation({ lat, lng });
    }
  };

  const handleReportSubmit = (newLeakData: Omit<Leak, 'id' | 'reportedDate'>) => {
    const newLeak: Leak = {
      ...newLeakData,
      id: `LK-${1000 + leaks.length + 1}`,
      reportedDate: new Date().toISOString(),
    };
    setLeaks(prev => [newLeak, ...prev]);
    setReportLocation(null);
    setIsReporting(false);
    
    // Auto select the new leak
    setTimeout(() => setSelectedLeakId(newLeak.id), 300);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col bg-slate-50">
      
      {/* Navbar */}
      <header className="z-[60] bg-white shadow-md h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 text-blue-600">
             <div className="bg-blue-600 p-1.5 rounded-lg">
               <Droplet className="w-5 h-5 text-white" fill="currentColor" />
             </div>
             <h1 className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">Qro<span className="font-light text-slate-500">sinfugas</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {isReporting ? (
             <div className="flex items-center gap-4 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200 animate-pulse">
                <span className="text-sm font-bold text-blue-700">Select location on map</span>
                <button onClick={() => { setIsReporting(false); setReportLocation(null); }} className="p-1 hover:bg-blue-100 rounded-full">
                  <X className="w-4 h-4 text-blue-600" />
                </button>
             </div>
          ) : (
            <>
               {/* View Controls */}
               <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button 
                    onClick={() => { setShowHeatmap(false); setIs3DMode(!is3DMode); }}
                    className={`p-2 rounded-md transition-all ${!showHeatmap && is3DMode ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    title="3D Perspective"
                  >
                    <Box className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setShowHeatmap(!showHeatmap); setIs3DMode(false); }}
                    className={`p-2 rounded-md transition-all ${showHeatmap ? 'bg-white shadow-sm text-orange-500' : 'text-slate-500 hover:text-slate-700'}`}
                    title="Heatmap View"
                  >
                    <Flame className="w-4 h-4" />
                  </button>
               </div>

              <button 
                onClick={handleReportStart}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-md shadow-blue-200"
              >
                 <Plus className="w-4 h-4" />
                 <span className="hidden sm:inline">Report Leak</span>
              </button>

              <button 
                onClick={() => setDashboardOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-slate-200"
              >
                 <BarChart3 className="w-4 h-4" />
                 <span className="hidden md:inline">Stats</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        
        <Sidebar 
          isOpen={sidebarOpen} 
          activeFilter={filter} 
          onFilterChange={setFilter}
          filteredLeaks={filteredLeaks}
          onLeakSelect={handleLeakSelect}
        />

        {/* Map Container */}
        <div className="h-full w-full bg-slate-200">
           <LeakMap 
              leaks={filteredLeaks} 
              selectedLeakId={selectedLeakId}
              onLeakSelect={handleLeakSelect}
              is3DMode={is3DMode}
              showHeatmap={showHeatmap}
              isReporting={isReporting}
              onMapClick={handleMapClick}
              tempReportLocation={reportLocation}
           />
        </div>

        <LeakDetail 
          leak={selectedLeak} 
          onClose={() => setSelectedLeakId(null)} 
        />

        {/* Reporting Modal */}
        {reportLocation && (
           <ReportModal 
             lat={reportLocation.lat} 
             lng={reportLocation.lng} 
             onClose={() => { setReportLocation(null); setIsReporting(false); }} 
             onSubmit={handleReportSubmit}
           />
        )}

        {/* Dashboard Overlay */}
        {dashboardOpen && (
          <Dashboard 
            leaks={leaks} 
            onClose={() => setDashboardOpen(false)} 
          />
        )}

      </main>
    </div>
  );
};

export default App;