import React from 'react';
import { GlassPane } from './GlassPane';
import { Check, Twitter, Instagram, Facebook, Linkedin, Youtube, Github, MessageCircle, Music } from 'lucide-react';
import { PlatformDef } from '../types';

interface PlatformSelectorProps {
  platforms: PlatformDef[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

const getIcon = (id: string, size: number = 16) => {
  switch (id.toLowerCase()) {
    case 'twitter': return <Twitter size={size} />;
    case 'instagram': return <Instagram size={size} />;
    case 'facebook': return <Facebook size={size} />;
    case 'linkedin': return <Linkedin size={size} />;
    case 'youtube': return <Youtube size={size} />;
    case 'github': return <Github size={size} />;
    case 'reddit': return <MessageCircle size={size} />;
    case 'tiktok': return <Music size={size} />;
    default: return <div className={`w-${size/4} h-${size/4} rounded-full bg-current`} />;
  }
};

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ 
  platforms, 
  selectedIds, 
  onToggle,
  onSelectAll,
  onClearAll
}) => {
  return (
    <GlassPane className="p-4 rounded-xl mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Target Platforms</h3>
        <div className="flex gap-2">
          <button 
            onClick={onSelectAll}
            className="text-[10px] text-glass-muted hover:text-blue-300 transition-colors px-2 py-1 hover:bg-white/5 rounded"
          >
            Select All
          </button>
          <div className="w-px h-4 bg-white/10 self-center"></div>
          <button 
            onClick={onClearAll}
            className="text-[10px] text-glass-muted hover:text-red-300 transition-colors px-2 py-1 hover:bg-white/5 rounded"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {platforms.map((platform) => {
          const isSelected = selectedIds.includes(platform.id);
          return (
            <button
              key={platform.id}
              onClick={() => onToggle(platform.id)}
              className={`relative flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 group ${
                isSelected 
                  ? 'bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'bg-white/[0.03] border-white/[0.05] text-glass-muted hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <div className={`transition-colors duration-200 ${isSelected ? platform.color : 'text-current opacity-50 group-hover:opacity-80'}`}>
                {getIcon(platform.id, 18)}
              </div>
              <span className="text-xs font-medium">{platform.name}</span>
              
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </GlassPane>
  );
};