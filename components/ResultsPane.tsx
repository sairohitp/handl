import React from 'react';
import { GlassPane, GlassButton } from './GlassPane';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Instagram, Twitter, Facebook, Linkedin, ShieldCheck, ExternalLink, Youtube, Github, MessageCircle, Music, RefreshCw } from 'lucide-react';
import { SocialPlatform } from '../types';

interface ResultsPaneProps {
  className?: string;
  results: SocialPlatform[];
  isSearching: boolean;
  onRefresh?: () => void;
}

const BRAND_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  twitter: { bg: 'bg-sky-500/10', text: 'text-sky-400', icon: Twitter },
  instagram: { bg: 'bg-pink-500/10', text: 'text-pink-500', icon: Instagram },
  facebook: { bg: 'bg-blue-600/10', text: 'text-blue-500', icon: Facebook },
  linkedin: { bg: 'bg-blue-700/10', text: 'text-blue-400', icon: Linkedin },
  youtube: { bg: 'bg-red-500/10', text: 'text-red-500', icon: Youtube },
  github: { bg: 'bg-zinc-500/10', text: 'text-zinc-200', icon: Github },
  reddit: { bg: 'bg-orange-500/10', text: 'text-orange-500', icon: MessageCircle },
  tiktok: { bg: 'bg-pink-500/10', text: 'text-pink-400', icon: Music },
};

const PlatformIcon: React.FC<{ id: string; size?: number }> = ({ id, size = 16 }) => {
  const config = BRAND_STYLES[id.toLowerCase()];
  const Icon = config?.icon || ArrowRight;
  return <Icon size={size} />;
};

export const ResultsPane: React.FC<ResultsPaneProps> = ({ className, results, isSearching, onRefresh }) => {
  const availableCount = results.filter(r => r.status === 'available').length;
  const ownedCount = results.filter(r => r.status === 'owned').length;
  const totalCount = results.length;
  
  // Calculate score based on available + owned
  const scorePercentage = totalCount > 0 
    ? Math.round(((availableCount + ownedCount) / totalCount) * 100) 
    : 0;

  return (
    <GlassPane className={`flex flex-col rounded-2xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] uppercase tracking-wider text-glass-muted font-bold">Availability Status</h2>
        <div className="flex items-center gap-3">
             <button 
                onClick={onRefresh}
                disabled={isSearching || results.length === 0}
                className={`text-glass-muted hover:text-white transition-all ${isSearching ? 'animate-spin opacity-50' : 'hover:rotate-180'}`}
                title="Refresh Results"
             >
                <RefreshCw size={12} />
             </button>
            <span className="text-[10px] text-glass-muted">{results.length > 0 ? results.length : 0} Platforms</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {results.length === 0 && !isSearching && (
          <div className="h-full flex flex-col items-center justify-center text-center text-glass-muted p-4">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-3">
              <ArrowRight size={24} className="opacity-20" />
            </div>
            <p>Enter a handle to check availability across platforms.</p>
          </div>
        )}

        {results.map((platform) => {
          const brandStyle = BRAND_STYLES[platform.id.toLowerCase()] || { bg: 'bg-white/5', text: 'text-white/40', icon: ArrowRight };
          
          return (
            <div 
              key={platform.id}
              className={`group flex flex-col p-3 rounded-xl border transition-all duration-200 ${
                  platform.status === 'owned' 
                  ? 'bg-blue-500/[0.05] border-blue-500/20' 
                  : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {/* Brand Icon Container - Always shows brand identity */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${brandStyle.bg} ${brandStyle.text}`}>
                        <PlatformIcon id={platform.id} size={16} />
                    </div>
                    
                    <div>
                        <div className="font-medium text-white text-[13px]">{platform.name}</div>
                        <div className="flex items-center gap-2">
                             <span className={`text-[11px] capitalize font-medium ${
                                 platform.status === 'available' ? 'text-green-400' :
                                 platform.status === 'taken' ? 'text-red-400' :
                                 platform.status === 'owned' ? 'text-blue-400' :
                                 'text-glass-muted'
                             }`}>
                                 {platform.details?.message || platform.status}
                             </span>
                        </div>
                    </div>
                  </div>

                  {/* Status Icon - Shows availability state */}
                  <div>
                    {platform.status === 'available' && <CheckCircle2 size={18} className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />}
                    {platform.status === 'taken' && <XCircle size={18} className="text-red-400 opacity-80" />}
                    {platform.status === 'checking' && <Loader2 size={16} className="text-blue-400 animate-spin" />}
                    {platform.status === 'owned' && <ShieldCheck size={18} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />}
                  </div>
              </div>

              {/* Detailed Metadata Row */}
              {(platform.details?.meta || platform.details?.actionUrl) && platform.status !== 'checking' && (
                  <div className="mt-2 pl-[44px] flex items-center justify-between border-t border-white/[0.05] pt-2">
                      {platform.details.meta && (
                          <span className="text-[10px] text-glass-muted font-mono bg-white/[0.05] px-1.5 py-0.5 rounded">
                              {platform.details.meta}
                          </span>
                      )}
                      
                      {platform.status === 'taken' && platform.details.actionUrl && (
                          <a 
                              href={platform.details.actionUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] text-glass-muted hover:text-white flex items-center gap-1 transition-colors group/link"
                          >
                              View <ExternalLink size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                          </a>
                      )}
                       {platform.status === 'available' && platform.price > 0 && (
                          <span className="text-[10px] text-green-300 font-medium tracking-wide">
                              ${platform.price.toFixed(2)}
                          </span>
                      )}
                  </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center mb-3">
            <span className="text-glass-muted">Total Score</span>
            <span className="text-white font-bold text-lg">
                {scorePercentage}%
            </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                    scorePercentage === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-purple-400'
                }`}
                style={{ width: `${scorePercentage}%` }}
            ></div>
        </div>
        
        {availableCount > 0 && (
            <GlassButton variant="primary" className="w-full mt-4 justify-center opacity-50 cursor-not-allowed text-xs">
                Select via Auto-Claim
            </GlassButton>
        )}
         {ownedCount === totalCount && totalCount > 0 && (
            <div className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-green-400 bg-green-500/10 rounded-lg text-xs font-medium border border-green-500/20">
                <ShieldCheck size={14} />
                All Assets Secured
            </div>
        )}
      </div>
    </GlassPane>
  );
};