import React, { useEffect, useState } from 'react';
import { GlassPane } from './GlassPane';
import { Fingerprint, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  const [visitorId, setVisitorId] = useState<string>('CALCULATING...');
  const [visitCount, setVisitCount] = useState<number>(0);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const calculateVisitorMetrics = () => {
      // 1. Generate unique device signature (Fingerprint)
      const n = window.navigator;
      const s = window.screen;
      
      // Combine stable device characteristics to form a signature
      const fingerPrintData = [
        n.userAgent,
        n.language,
        n.hardwareConcurrency,
        s.width,
        s.height,
        s.colorDepth,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      ].join('|');

      // Simple hash implementation to create a short unique ID
      let hash = 0;
      for (let i = 0; i < fingerPrintData.length; i++) {
        const char = fingerPrintData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      // Convert to cleaner hex string format like "DEV-X9A2"
      const uniqueId = 'DEV-' + Math.abs(hash).toString(16).toUpperCase().padStart(6, '0').slice(0, 6);

      // 2. Local Storage Logic for Persistence
      const storedId = localStorage.getItem('uh_vid');
      const storedVisits = localStorage.getItem('uh_v_count');
      const lastSeen = localStorage.getItem('uh_last_seen');
      
      const now = Date.now();
      const SESSION_TIMEOUT = 1000 * 60 * 30; // 30 minutes

      let currentVisits = storedVisits ? parseInt(storedVisits) : 0;

      if (storedId !== uniqueId) {
        // New Device detected (or browser data cleared)
        currentVisits = 1;
        localStorage.setItem('uh_vid', uniqueId);
      } else {
        // Known Device
        if (!lastSeen || (now - parseInt(lastSeen) > SESSION_TIMEOUT)) {
          // New Session (returned after timeout)
          currentVisits += 1;
        }
      }

      // Update storage
      localStorage.setItem('uh_v_count', currentVisits.toString());
      localStorage.setItem('uh_last_seen', now.toString());

      setVisitorId(uniqueId);
      setVisitCount(currentVisits);
    };

    calculateVisitorMetrics();

    // Pulse effect for the "Live" indicator
    const interval = setInterval(() => {
      setIsLive(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <GlassPane className="h-12 rounded-xl mt-4 mx-4 mb-2 flex items-center justify-between px-6">
      {/* Left: Advanced Visitor Counter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] group hover:bg-white/[0.05] transition-all duration-300 cursor-help" title="Unique Device Fingerprint">
           <div className={`w-1.5 h-1.5 rounded-full bg-green-500 ${isLive ? 'opacity-100 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'opacity-40'} transition-all duration-1000`}></div>
           <Fingerprint size={12} className="text-blue-400 opacity-80" />
           <span className="font-mono text-[10px] text-blue-200 tracking-wider">{visitorId}</span>
        </div>
        
        <div className="h-3 w-px bg-white/10"></div>
        
        <div className="flex items-center gap-1.5 text-[10px] text-glass-muted" title="Session Count">
            <Activity size={10} />
            <span>SESSION <span className="text-white/80 font-medium font-mono">{visitCount.toString().padStart(3, '0')}</span></span>
        </div>
      </div>

      {/* Right: Copyright */}
      <div className="text-[10px] text-glass-muted">
        © 2025 Handl • <a href="https://linkedin.com/in/sssairohit" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Sai Rohit</a>
      </div>
    </GlassPane>
  );
};