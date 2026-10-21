import React from 'react';
import { MapPin, Layers, Server } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm text-center">
        <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-5">
          <MapPin className="w-10 h-10 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          PajakPeta Frontend Ready
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Scaffolding Vite React + Tailwind CSS berhasil diinisialisasi.
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-700/50 text-slate-300">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Leaflet & UI Ready</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-700/50 text-slate-300">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Express Backend</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
