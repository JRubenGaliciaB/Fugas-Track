import React from 'react';
import { Leak, LeakStatus } from '../types';
import { X, Calendar, MapPin, User, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface LeakDetailProps {
  leak: Leak | null;
  onClose: () => void;
}

const LeakDetail: React.FC<LeakDetailProps> = ({ leak, onClose }) => {
  if (!leak) return null;

  const StatusIcon = leak.status === LeakStatus.ACTIVE ? AlertTriangle : 
                     leak.status === LeakStatus.REPAIRING ? Clock : CheckCircle;

  const statusColor = leak.status === LeakStatus.ACTIVE ? 'text-red-600' : 
                      leak.status === LeakStatus.REPAIRING ? 'text-yellow-600' : 'text-green-600';

  const bgStatusColor = leak.status === LeakStatus.ACTIVE ? 'bg-red-50' : 
                      leak.status === LeakStatus.REPAIRING ? 'bg-yellow-50' : 'bg-green-50';

  return (
    <div className="absolute top-16 right-4 w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 z-[45] animate-slide-in-right flex flex-col max-h-[calc(100vh-5rem)] overflow-hidden">
      
      <div className="relative h-48 bg-slate-200 flex-shrink-0">
        <img src={leak.imageUrl} className="w-full h-full object-cover" alt="Leak evidence" />
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white shadow-sm transition-all"
        >
          <X className="w-5 h-5 text-slate-800" />
        </button>
        <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full ${bgStatusColor} ${statusColor} text-sm font-bold flex items-center gap-2 shadow-sm border border-white/50`}>
           <StatusIcon className="w-4 h-4" />
           {leak.status}
        </div>
      </div>

      <div className="p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-1">{leak.address}</h2>
        <p className="text-slate-500 text-sm mb-6">{leak.zone}</p>

        <div className="space-y-6">
          
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {leak.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 p-3 rounded-lg">
               <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                 <Calendar className="w-3 h-3" /> Reported
               </div>
               <p className="text-sm font-medium text-slate-800">{new Date(leak.reportedDate).toLocaleDateString()}</p>
            </div>
            
            {leak.repairedDate && (
              <div className="bg-white border border-slate-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <CheckCircle className="w-3 h-3" /> Repaired
                </div>
                <p className="text-sm font-medium text-slate-800">{new Date(leak.repairedDate).toLocaleDateString()}</p>
              </div>
            )}

             <div className="bg-white border border-slate-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <AlertTriangle className="w-3 h-3" /> Severity
                </div>
                <p className={`text-sm font-medium ${leak.severity === 'High' ? 'text-red-600' : 'text-slate-800'}`}>{leak.severity}</p>
              </div>

               <div className="bg-white border border-slate-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <User className="w-3 h-3" /> Reporter
                </div>
                <p className="text-sm font-medium text-slate-800">{leak.reporterName}</p>
              </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</h3>
            <div className="text-xs text-slate-500 font-mono bg-slate-100 p-2 rounded truncate">
              {leak.lat.toFixed(6)}, {leak.lng.toFixed(6)}
            </div>
          </div>

          {leak.status === LeakStatus.ACTIVE && (
             <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-200 transition-all active:scale-95">
               Dispatch Repair Crew
             </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default LeakDetail;