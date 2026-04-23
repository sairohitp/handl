import React, { useState, useEffect } from 'react';
import { GlassPane } from './GlassPane';
import { 
  Search, Sparkles, Globe, AtSign, Wand2, Loader2, ArrowRight, ShieldCheck, 
  CreditCard, ChevronLeft, SlidersHorizontal, XCircle, Bookmark, Plus, 
  Briefcase, Rocket, Check, FolderOpen, History as HistoryIcon, Download, 
  Trash2, RotateCcw, Settings, Lock, Database, Info, Folder, Hash, 
  LayoutGrid, MoreHorizontal, Copy, ExternalLink, FolderKanban, Crown, Zap, UserCheck
} from 'lucide-react';
import { generateHandleSuggestions } from '../services/geminiService';
import { SocialPlatform, PlatformDef, Folder as FolderType, HistoryItem, SavedItem } from '../types';
import { PlatformSelector } from './PlatformSelector';

interface MainContentProps {
  className?: string;
  activeFolderId?: string;
  onSearch: (query: string) => void;
  query: string;
  results?: SocialPlatform[];
  onClaim?: (platformIds: string[]) => void;
  allPlatforms?: PlatformDef[];
  enabledPlatformIds?: string[];
  onTogglePlatform?: (id: string) => void;
  onSelectAllPlatforms?: () => void;
  onClearAllPlatforms?: () => void;
  folders?: FolderType[];
  onSaveToFolder?: (handle: string, folderId: string, type: 'business' | 'project') => void;
  onCreateFolder?: (name: string) => string;
  history?: HistoryItem[];
  onClearHistory?: () => void;
  onExportHistory?: () => void;
  onDeleteHistoryItem?: (id: string) => void;
  onHistoryRestore?: (query: string) => void;
  onResetApp?: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({ 
    className, 
    activeFolderId,
    onSearch, 
    query, 
    results = [], 
    onClaim,
    allPlatforms = [],
    enabledPlatformIds = [],
    onTogglePlatform = (_id: string) => {},
    onSelectAllPlatforms = () => {},
    onClearAllPlatforms = () => {},
    folders = [],
    onSaveToFolder = (_handle: string, _folderId: string, _type: 'business' | 'project') => {},
    onCreateFolder = (_name: string) => 'default',
    history = [],
    onClearHistory = () => {},
    onExportHistory = () => {},
    onDeleteHistoryItem = (_id: string) => {},
    onHistoryRestore = (_query: string) => {},
    onResetApp = () => {}
}) => {
  const [localQuery, setLocalQuery] = useState(query);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);
  
  // Claim Flow State
  const [viewMode, setViewMode] = useState<'search' | 'claim_summary' | 'processing' | 'success'>('search');
  const [selectedForClaim, setSelectedForClaim] = useState<string[]>([]);

  // Management/Bookmark Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveStep, setSaveStep] = useState<'type' | 'folder' | 'success'>('type');
  const [entityType, setEntityType] = useState<'business' | 'project'>('project');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  useEffect(() => {
    if (query !== localQuery && !isTyping) {
        setLocalQuery(query);
    }
  }, [query]);

  // Debounce search handled here mostly for typing effects
  useEffect(() => {
    const timer = setTimeout(() => {
        if (localQuery !== query) {
            if (localQuery.trim() === '') {
                 onSearch('');
            }
        }
        setIsTyping(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [localQuery, onSearch, query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalQuery(e.target.value);
      setIsTyping(true);
      if (viewMode !== 'search') setViewMode('search');
  };

  const handleClear = () => {
    setLocalQuery('');
    onSearch('');
    setShowPlatformSelector(false);
    setSuggestions([]);
    setIsTyping(false);
  };

  const handleGenerateClick = async () => {
    if (!localQuery.trim()) return;
    
    setIsGenerating(true);
    setSuggestions([]);
    
    const results = await generateHandleSuggestions(localQuery);
    setSuggestions(results);
    setIsGenerating(false);
  };

  const applySuggestion = (suggestion: string) => {
    setLocalQuery(suggestion);
    onSearch(suggestion);
  };

  const startClaimFlow = () => {
      const available = results.filter(r => r.status === 'available');
      if (available.length === 0) return;
      setSelectedForClaim(available.map(r => r.id));
      setViewMode('claim_summary');
  };

  const confirmClaim = () => {
      setViewMode('processing');
      // Simulate processing
      setTimeout(() => {
          if (onClaim) onClaim(selectedForClaim);
          setViewMode('success');
      }, 2500);
  };

  const resetFlow = () => {
      setViewMode('search');
      setSuggestions([]);
  };

  // Management Suite Handlers
  const openSaveModal = () => {
    if (!localQuery.trim()) return;
    setShowSaveModal(true);
    setSaveStep('type');
    setSelectedFolderId(null);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleTypeSelect = (type: 'new_business' | 'existing_business' | 'project') => {
    // Map UI selection to core types
    if (type === 'new_business' || type === 'existing_business') {
        setEntityType('business');
    } else {
        setEntityType('project');
    }
    setSaveStep('folder');
  };

  const handleFinalSave = () => {
      let finalFolderId = selectedFolderId;
      if (isCreatingFolder && newFolderName.trim()) {
          finalFolderId = onCreateFolder(newFolderName.trim());
      }
      
      if (finalFolderId) {
          onSaveToFolder(localQuery, finalFolderId, entityType);
          setSaveStep('success');
          setTimeout(() => {
              setShowSaveModal(false);
          }, 1500);
      }
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(timestamp));
  };

  // --- VIEW RENDERERS ---

  const renderPremium = () => (
    <div className="w-full h-full flex flex-col animate-slide-up">
        <div className="text-center mb-10 mt-4">
            <h2 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h2>
            <p className="text-glass-muted max-w-lg mx-auto">
                Unlock the full potential of your brand identity with our advanced tools and dedicated support services.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
            {/* Starter Plan */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-2">Starter</h3>
                <div className="text-3xl font-bold text-white mb-6">Free</div>
                <p className="text-xs text-glass-muted mb-6">Essential tools for individuals and hobbyists.</p>
                
                <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-sm text-glass-muted">
                        <Check size={16} className="text-white" /> Basic Availability Search
                    </div>
                    <div className="flex items-center gap-3 text-sm text-glass-muted">
                        <Check size={16} className="text-white" /> 10 Platform Checks
                    </div>
                    <div className="flex items-center gap-3 text-sm text-glass-muted">
                        <Check size={16} className="text-white" /> Local History
                    </div>
                </div>

                <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white text-sm font-medium transition-colors">
                    Current Plan
                </button>
            </div>

            {/* Pro Plan */}
            <div className="relative group">
                {/* Badge placed outside to avoid overflow clipping */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-20 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                    Most Popular
                </div>
                
                <div 
                    className="h-full rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-transparent p-6 flex flex-col transition-all duration-300 overflow-hidden relative"
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        e.currentTarget.style.setProperty('--x', `${x}px`);
                        e.currentTarget.style.setProperty('--y', `${y}px`);
                    }}
                >
                    {/* Spotlight Effect */}
                    <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                            background: 'radial-gradient(600px circle at var(--x) var(--y), rgba(6,182,212,0.15), transparent 40%)'
                        }}
                    />

                    <h3 className="text-lg font-semibold text-cyan-200 mb-2 flex items-center gap-2 relative z-10 mt-2">
                        <Crown size={18} fill="currentColor" /> Pro
                    </h3>
                    <div className="text-3xl font-bold text-white mb-1 relative z-10">₹199<span className="text-sm font-normal text-glass-muted">/mo</span></div>
                    <p className="text-xs text-glass-muted mb-6 relative z-10">Advanced power for serious brand builders.</p>
                    
                    <div className="space-y-4 mb-8 flex-1 relative z-10">
                        <div className="flex items-center gap-3 text-sm text-white">
                            <Check size={16} className="text-cyan-400" /> Unlimited Searches
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white">
                            <Check size={16} className="text-cyan-400" /> 50+ Platform Checks
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white">
                            <Check size={16} className="text-cyan-400" /> AI Suggestions & Analysis
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white">
                            <Check size={16} className="text-cyan-400" /> 1-Click Auto-Claim
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white">
                            <Check size={16} className="text-cyan-400" /> Export Data & Reports
                        </div>
                    </div>

                    <button className="relative z-10 w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold transition-colors shadow-lg shadow-cyan-500/20">
                        Upgrade to Pro
                    </button>
                </div>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-white mb-1">Custom</div>
                <p className="text-xs text-glass-muted mb-6">Complete brand management for organizations.</p>
                
                <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-sm text-glass-muted">
                        <Check size={16} className="text-blue-400" /> Everything in Pro
                    </div>
                    <div className="flex items-center gap-3 text-sm text-glass-muted">
                        <UserCheck size={16} className="text-blue-400" /> Dedicated Name Handler
                    </div>
                    <div className="flex items-center gap-3 text-sm text-glass-muted">
                        <Zap size={16} className="text-blue-400" /> Priority SEO Setup
                    </div>
                    <div className="flex items-center gap-3 text-sm text-glass-muted">
                        <Check size={16} className="text-blue-400" /> Domain & Legal Assistance
                    </div>
                    <div className="flex items-center gap-3 text-sm text-glass-muted">
                        <Check size={16} className="text-blue-400" /> 24/7 Priority Support
                    </div>
                </div>

                <button className="w-full py-3 rounded-xl border border-blue-500/30 hover:bg-blue-500/10 text-blue-300 text-sm font-medium transition-colors">
                    Contact Sales
                </button>
            </div>
        </div>
    </div>
  );

  const renderHistory = () => (
      <div className="w-full h-full flex flex-col animate-slide-up">
          <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Search History</h2>
                <p className="text-glass-muted text-xs">Manage your previous queries and availability checks.</p>
              </div>
              <div className="flex gap-3">
                  <button 
                    onClick={() => onExportHistory()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors border border-white/5 hover:border-white/10"
                  >
                      <Download size={14} />
                      Export CSV
                  </button>
                  <button 
                    onClick={() => onClearHistory()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-colors border border-red-500/10 hover:border-red-500/20"
                  >
                      <Trash2 size={14} />
                      Clear All
                  </button>
              </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-glass-muted opacity-50">
                    <HistoryIcon size={48} className="mb-4" />
                    <p>No search history yet.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {history.map((item) => (
                        <div key={item.id} className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-lg">
                                    {item.query.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-white text-sm">{item.query}</div>
                                    <div className="text-[10px] text-glass-muted flex items-center gap-2 mt-0.5">
                                        <span>{formatTime(item.timestamp)}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                        <span>{item.availableCount} / {item.totalCount} Available</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onHistoryRestore(item.query)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-glass-muted hover:text-white transition-colors"
                                    title="Search Again"
                                >
                                    <RotateCcw size={14} />
                                </button>
                                <button 
                                    onClick={() => onDeleteHistoryItem(item.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/20 text-glass-muted hover:text-red-400 transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
      </div>
  );

  const renderSettings = () => (
    <div className="w-full h-full flex flex-col animate-slide-up">
        <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
        <p className="text-glass-muted text-xs mb-8">Configure application preferences and data.</p>

        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-4">
            {/* Appearance Section */}
            <section>
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles size={12} /> Appearance
                </h3>
                <GlassPane className="p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-white">Theme</div>
                            <div className="text-[10px] text-glass-muted">Liquid Glass (Default)</div>
                        </div>
                        <div className="flex gap-1 p-1 bg-black/20 rounded-lg">
                            <button className="px-3 py-1 bg-white/10 rounded text-[10px] text-white">Dark</button>
                            <button className="px-3 py-1 text-[10px] text-white/40 hover:text-white disabled:opacity-50" disabled>Light</button>
                        </div>
                    </div>
                </GlassPane>
            </section>

            {/* Data Section */}
            <section>
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Database size={12} /> Data & Privacy
                </h3>
                <GlassPane className="p-4 rounded-xl space-y-4">
                     <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-white">Local Storage</div>
                            <div className="text-[10px] text-glass-muted">All data is stored locally on your device.</div>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => onExportHistory()} className="px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-[10px] text-white transition-colors">
                                Export Data
                             </button>
                        </div>
                    </div>
                     <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-red-300">Reset Application</div>
                            <div className="text-[10px] text-glass-muted">Clear all history, folders, and settings.</div>
                        </div>
                         <button onClick={() => onResetApp()} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-lg text-[10px] text-red-300 transition-colors">
                            Clear All Data
                         </button>
                    </div>
                </GlassPane>
            </section>

             {/* System Section */}
             <section>
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Info size={12} /> System
                </h3>
                <GlassPane className="p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-white">Version</div>
                        </div>
                         <div className="text-xs text-glass-muted font-mono">v1.2.0-beta</div>
                    </div>
                     <div className="flex items-center justify-between mt-3">
                        <div>
                            <div className="text-sm text-white">Build ID</div>
                        </div>
                         <div className="text-xs text-glass-muted font-mono">8f92a1d</div>
                    </div>
                </GlassPane>
            </section>
        </div>
    </div>
  );

  const renderSmartView = (type: 'business' | 'project' | 'all', title: string, subtitle: string, icon: React.ReactNode) => {
    // Aggregate items from all folders. Use a filter to only grab from user folders to avoid duplication if we had other types
    const allItems = folders
        .filter(f => f.type === 'user')
        .flatMap(f => f.items || [])
        .filter(item => {
            if (type === 'all') return true;
            return item.type === type;
        });

    // Sort by timestamp descending
    allItems.sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="w-full h-full flex flex-col animate-slide-up">
            <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                      <span className="p-2 bg-white/5 rounded-lg text-blue-400">{icon}</span>
                      {title}
                  </h2>
                  <p className="text-glass-muted text-xs ml-1">{subtitle}</p>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-glass-muted border border-white/5">
                    {allItems.length} Items
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {allItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-glass-muted opacity-50">
                        {icon}
                        <p className="mt-4 text-sm">No items found in {title}.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allItems.map((item, idx) => {
                            // Find which folder this item actually belongs to for context
                            const parentFolder = folders.find(f => f.items?.some(i => i.handle === item.handle));

                            return (
                                <div key={`${item.handle}-${idx}`} className="group relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white font-bold text-lg border border-white/5">
                                            {item.handle.substring(0, 1).toUpperCase()}
                                        </div>
                                        <button className="text-glass-muted hover:text-white transition-colors">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                    
                                    <h3 className="font-semibold text-white mb-1 truncate">{item.handle}</h3>
                                    
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                            item.type === 'business' 
                                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' 
                                            : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                                        } uppercase tracking-wide font-medium`}>
                                            {item.type}
                                        </span>
                                        {parentFolder && (
                                            <span className="text-[10px] text-glass-muted flex items-center gap-1 truncate max-w-[100px]">
                                                <Folder size={10} />
                                                {parentFolder.name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(item.handle);
                                            }}
                                            className="flex-1 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Copy size={10} /> Copy
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setLocalQuery(item.handle);
                                                onSearch(item.handle);
                                            }}
                                            className="flex-1 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <ExternalLink size={10} /> Check
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderFolderView = () => {
      const folder = folders.find(f => f.id === activeFolderId);
      if (!folder) return renderSearch();

      return (
          <div className="w-full h-full flex flex-col animate-slide-up">
              <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <span className="p-2 bg-white/5 rounded-lg text-white">
                            <FolderOpen size={20} />
                        </span>
                        {folder.name}
                    </h2>
                    <p className="text-glass-muted text-xs ml-1">User collection</p>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {(!folder.items || folder.items.length === 0) ? (
                       <div className="h-full flex flex-col items-center justify-center text-glass-muted opacity-50">
                            <Folder size={48} className="mb-4" />
                            <p>This folder is empty.</p>
                       </div>
                  ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {folder.items.map((item, idx) => (
                               <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-all">
                                   <div className="flex justify-between mb-2">
                                       <div className="font-semibold text-white">{item.handle}</div>
                                       <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase ${item.type === 'business' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                           {item.type}
                                       </span>
                                   </div>
                                   <div className="text-[10px] text-glass-muted mb-3">{formatTime(item.timestamp)}</div>
                                   <button 
                                        onClick={() => {
                                            setLocalQuery(item.handle);
                                            onSearch(item.handle);
                                        }}
                                        className="w-full py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
                                    >
                                        Check Availability
                                    </button>
                               </div>
                           ))}
                       </div>
                  )}
              </div>
          </div>
      );
  };

  const renderSaveModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <GlassPane className="w-full max-w-md p-6 rounded-2xl relative animate-zoom-in">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="absolute top-4 right-4 text-glass-muted hover:text-white transition-colors"
              >
                  <XCircle size={20} />
              </button>

              {saveStep === 'success' ? (
                  <div className="flex flex-col items-center text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-4 animate-blob">
                          <Check size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Saved Successfully!</h3>
                      <p className="text-glass-muted">Your handle has been saved.</p>
                  </div>
              ) : saveStep === 'type' ? (
                  <div>
                      <h3 className="text-lg font-bold text-white mb-2 text-center">Save Handle</h3>
                      <p className="text-sm text-glass-muted mb-6 text-center">Organize '{localQuery}' by classifying it.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => handleTypeSelect('new_business')} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors">
                            <Briefcase size={24} className="text-blue-300 mb-2"/>
                            <div className="font-semibold">New Business</div>
                            <div className="text-xs text-glass-muted">Starting a new brand or company.</div>
                        </button>
                         <button onClick={() => handleTypeSelect('project')} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors">
                            <Rocket size={24} className="text-purple-300 mb-2"/>
                            <div className="font-semibold">Side Project</div>
                            <div className="text-xs text-glass-muted">A personal or experimental venture.</div>
                        </button>
                      </div>
                  </div>
              ) : (
                  <div>
                      <h3 className="text-lg font-bold text-white mb-2">Select a Folder</h3>
                      <p className="text-sm text-glass-muted mb-6">Choose where to save '{localQuery}'.</p>

                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                          {folders.filter(f => f.type === 'user').map(folder => (
                              <button 
                                key={folder.id}
                                onClick={() => {
                                    setSelectedFolderId(folder.id);
                                    setIsCreatingFolder(false);
                                }}
                                className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                                    selectedFolderId === folder.id && !isCreatingFolder ? 'bg-blue-500/20' : 'hover:bg-white/5'
                                }`}
                              >
                                  <div className="flex items-center gap-3">
                                    <Folder size={16} />
                                    <span className="text-sm">{folder.name}</span>
                                  </div>
                                  {selectedFolderId === folder.id && !isCreatingFolder && <Check size={16} className="text-blue-300"/>}
                              </button>
                          ))}
                      </div>

                      <div className="mt-4">
                          <button 
                            onClick={() => {
                                setIsCreatingFolder(true);
                                setSelectedFolderId(null);
                            }}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${isCreatingFolder ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}
                          >
                              <Plus size={16} />
                              <span className="text-sm">Create a new folder</span>
                          </button>
                          {isCreatingFolder && (
                              <input 
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Enter folder name..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm mt-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                              />
                          )}
                      </div>

                       <button 
                        onClick={handleFinalSave}
                        disabled={!selectedFolderId && (!isCreatingFolder || !newFolderName.trim())}
                        className="w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-400 text-black font-bold text-sm mt-6 transition-all disabled:bg-gray-500/20 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                          Save Handle
                      </button>
                  </div>
              )}
          </GlassPane>
      </div>
  );

  const renderSearch = () => (
    <div className="w-full flex flex-col h-full">
        {/* Search Input Area */}
        <div className="relative w-full max-w-3xl mx-auto z-10 animate-slide-up" style={{ animationDelay: '100ms'}}>
            <GlassPane className="flex items-center gap-4 w-full rounded-2xl p-3 pr-5 shadow-2xl shadow-black/30">
                <span className="pl-2 text-glass-muted"><Search size={22} /></span>
                <input 
                    type="text" 
                    placeholder="Enter a handle to check availability..."
                    className="flex-1 bg-transparent text-lg text-white placeholder-glass-muted focus:outline-none"
                    value={localQuery}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch(localQuery)}
                />
                {localQuery && (
                     <button onClick={handleClear} className="text-glass-muted hover:text-white">
                        <XCircle size={18} />
                    </button>
                )}
                <button 
                    onClick={() => onSearch(localQuery)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:from-gray-500 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
                    disabled={!localQuery.trim() || isTyping}
                >
                    {isTyping ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} />} 
                    Check
                </button>
            </GlassPane>
        </div>

        {/* Main Content Area Based on State */}
        <div className="flex-1 flex items-center justify-center -mt-16 overflow-hidden">
          {viewMode === 'claim_summary' && (
              <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-white/[0.03] border border-white/10 animate-zoom-in">
                  <h2 className="text-2xl font-bold text-white mb-2 text-center">Claim Summary</h2>
                  <p className="text-sm text-glass-muted mb-6 text-center">You are about to claim {selectedForClaim.length} handles.</p>

                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2 mb-6">
                      {results.filter(r => selectedForClaim.includes(r.id)).map(p => (
                          <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                            <div className="flex items-center gap-2">
                               <AtSign size={16} className="text-glass-muted"/>
                               <span className="text-sm font-medium">{localQuery}</span>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">{p.name}</span>
                          </div>
                      ))}
                  </div>

                  <div className="flex gap-4">
                       <button onClick={resetFlow} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                           Cancel
                       </button>
                       <button onClick={confirmClaim} className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-black text-sm font-bold transition-colors shadow-lg shadow-blue-500/20">
                           Confirm & Pay
                       </button>
                  </div>
              </div>
          )}

          {viewMode === 'processing' && (
              <div className="text-center animate-zoom-in">
                  <Loader2 size={48} className="animate-spin text-blue-400 mb-6 mx-auto" />
                  <h2 className="text-2xl font-bold text-white mb-2">Processing...</h2>
                  <p className="text-sm text-glass-muted">Please wait while we secure your handles.</p>
              </div>
          )}

          {viewMode === 'success' && (
               <div className="text-center animate-zoom-in">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-6 mx-auto animate-blob">
                    <ShieldCheck size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Congratulations!</h2>
                  <p className="text-glass-muted max-w-sm mx-auto mb-8">You have successfully claimed {selectedForClaim.length} handle(s). A confirmation email has been sent with next steps.</p>
                   <button onClick={resetFlow} className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
                       Back to Search
                   </button>
              </div>
          )}
          
          {viewMode === 'search' && (
              <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center items-center text-center px-4 -mt-10">
                  {localQuery.trim() === '' ? (
                      <div className="max-w-md animate-fade-in">
                          <Wand2 size={48} className="text-blue-400 mb-6 mx-auto opacity-50" />
                          <h1 className="text-4xl font-bold text-white mb-4">Find Your Perfect Handle</h1>
                          <p className="text-glass-muted">
                              Check username availability across dozens of social networks and platforms instantly. Secure your brand identity in one place.
                          </p>
                      </div>
                  ) : isGenerating ? (
                      <div className="flex flex-col items-center animate-fade-in">
                          <Loader2 size={32} className="animate-spin text-blue-400 mb-4" />
                          <p className="text-glass-muted">Generating creative suggestions...</p>
                      </div>
                  ) : suggestions.length > 0 ? (
                      <div className="w-full max-w-xl animate-slide-up">
                          <h3 className="text-lg font-semibold text-white mb-4">Here are some suggestions:</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {suggestions.map((s, i) => (
                                  <button 
                                    key={i} 
                                    onClick={() => applySuggestion(s)}
                                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-300 text-sm text-white truncate"
                                  >
                                      {s}
                                  </button>
                              ))}
                          </div>
                      </div>
                  ) : (
                      <div></div> // Placeholder for when search has results
                  )}
              </div>
            )}
        </div>

        {/* Action buttons in search view */}
        {viewMode === 'search' && (
            <div className="flex justify-center items-center gap-4 mb-4 animate-slide-up" style={{ animationDelay: '200ms'}}>
                <button 
                    onClick={handleGenerateClick} 
                    disabled={!localQuery.trim() || isGenerating}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors border border-white/5 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} 
                   AI Suggestions
                </button>
                 <button 
                    onClick={() => setShowPlatformSelector(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors border border-white/5 hover:border-white/10"
                >
                    <SlidersHorizontal size={14} /> 
                    Platforms ({enabledPlatformIds.length})
                </button>
                {results.some(r => r.status === 'available') && (
                    <button 
                        onClick={startClaimFlow}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 hover:bg-green-500/20 text-xs font-medium text-green-300 transition-colors border border-green-500/20"
                    >
                        <ShieldCheck size={14} /> 
                        Claim Available
                    </button>
                )}
                <button 
                    onClick={openSaveModal}
                    disabled={!localQuery.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors border border-white/5 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Bookmark size={14} /> 
                    Save/Bookmark
                </button>
            </div>
        )}

        {showPlatformSelector && (
            <PlatformSelector 
                allPlatforms={allPlatforms}
                enabledPlatformIds={enabledPlatformIds}
                onTogglePlatform={onTogglePlatform}
                onSelectAll={onSelectAllPlatforms}
                onClearAll={onClearAllPlatforms}
                onClose={() => setShowPlatformSelector(false)}
            />
        )}
        {showSaveModal && renderSaveModal()}
    </div>
  );

  const activeContent = () => {
      switch(activeFolderId) {
        case 'dashboard':
          return renderSearch();
        case 'history':
          return renderHistory();
        case 'settings':
          return renderSettings();
        case 'premium':
          return renderPremium();
        case 'business':
             return renderSmartView('business', 'Businesses', 'All saved business handles', <Briefcase size={20}/>);
        case 'projects':
            return renderSmartView('project', 'Projects', 'All saved project handles', <Rocket size={20}/>);
        case 'handles':
            return renderSmartView('all', 'All Handles', 'All saved business and project handles', <Hash size={20}/>);
        default:
          return renderFolderView();
      }
  }

  return (
    <div className={`relative ${className}`}>
      {activeContent()}
    </div>
  );
};