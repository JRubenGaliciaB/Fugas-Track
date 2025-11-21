import React from 'react';
import { FilterState, Leak, LeakStatus } from '../types';
import { Filter, Droplet, Check, Clock, AlertCircle } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeFilter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  filteredLeaks: Leak[];
  onLeakSelect: (leak: Leak) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeFilter, onFilterChange, filteredLeaks, onLeakSelect }) => {
  return (
    <div className={`
      absolute top-0 left-0 h-full bg-white shadow-2xl z-[40] transition-all duration-300 ease-in-out transform
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      w-80 flex flex-col border-r border-slate-200 pt-16
    `}>
      
      {/* Filters Section */}
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter className="w-3 h-3" />
          Filter Status
        </h3>
        <div className="space-y-2">
          <button 
            onClick={() => onFilterChange({ status: 'ALL' })}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all
              ${activeFilter.status === 'ALL' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-500 hover:bg-slate-50'}
            `}>
            <span>All Incidents</span>
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{filteredLeaks.length}</span>
          </button>
          
          <button 
            onClick={() => onFilterChange({ status: LeakStatus.ACTIVE })}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all
              ${activeFilter.status === LeakStatus.ACTIVE ? 'bg-red-50 text-red-700 shadow-inner ring-1 ring-red-200' : 'text-slate-500 hover:bg-slate-50'}
            `}>
            <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Active</div>
            {/* Since filteredLeaks is already filtered, we can't count total category easily unless passed. Simplified for MVP */}
          </button>

          <button 
            onClick={() => onFilterChange({ status: LeakStatus.REPAIRING })}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all
              ${activeFilter.status === LeakStatus.REPAIRING ? 'bg-yellow-50 text-yellow-700 shadow-inner ring-1 ring-yellow-200' : 'text-slate-500 hover:bg-slate-50'}
            `}>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4"/> Repairing</div>
          </button>

           <button 
            onClick={() => onFilterChange({ status: LeakStatus.REPAIRED })}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all
              ${activeFilter.status === LeakStatus.REPAIRED ? 'bg-green-50 text-green-700 shadow-inner ring-1 ring-green-200' : 'text-slate-500 hover:bg-slate-50'}
            `}>
            <div className="flex items-center gap-2"><Check className="w-4 h-4"/> Repaired</div>
          </button>
        </div>
      </div>

      {/* List View Section */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider m-6 mb-2">Results</h3>
        {filteredLeaks.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">No leaks found matching filters.</div>
        ) : (
            <div className="divide-y divide-slate-100">
            {filteredLeaks.map(leak => (
                <div 
                  key={leak.id} 
                  onClick={() => onLeakSelect(leak)}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between mb-1">
                     <span className={`text-xs font-bold px-2 py-0.5 rounded-full border
                        ${leak.status === LeakStatus.ACTIVE ? 'bg-red-50 border-red-100 text-red-600' :
                          leak.status === LeakStatus.REPAIRING ? 'bg-yellow-50 border-yellow-100 text-yellow-600' :
                          'bg-green-50 border-green-100 text-green-600'}
                     `}>{leak.status}</span>
                     <span className="text-xs text-slate-400">{new Date(leak.reportedDate).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{leak.address}</h4>
                  <p className="text-xs text-slate-500 mt-1 truncate">{leak.zone}</p>
                </div>
            ))}
            </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 text-center">
         <p className="text-[10px] text-slate-400">Qro sin fugas v1.0.0</p>
      </div>

    </div>
  );
};

export default Sidebar;
