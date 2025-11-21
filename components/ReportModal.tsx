import React, { useState } from 'react';
import { X, Upload, MapPin, Loader2 } from 'lucide-react';
import { Leak, LeakStatus } from '../types';

interface ReportModalProps {
  lat: number;
  lng: number;
  onClose: () => void;
  onSubmit: (newLeak: Omit<Leak, 'id' | 'reportedDate'>) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ lat, lng, onClose, onSubmit }) => {
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onSubmit({
        lat,
        lng,
        status: LeakStatus.ACTIVE,
        address: address || 'Address not provided',
        description: description || 'No description provided',
        zone: 'Reported Zone', // In a real app, we'd geocode this
        reporterName: 'Anonymous User',
        severity: 'Medium',
        imageUrl: `https://picsum.photos/300/200?random=${Math.random()}` // Random mock image
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden mx-4">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Report New Leak</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 border border-blue-100">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase">Selected Location</p>
              <p className="text-sm text-blue-600 font-mono">{lat.toFixed(6)}, {lng.toFixed(6)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address / Landmark</label>
            <input 
              required
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Corner of Main St & 5th Ave"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the leak intensity and location details..."
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Photo Evidence</label>
             <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer">
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-xs">Click to upload photo</span>
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Report'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ReportModal;