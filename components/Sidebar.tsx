import React, { useState, useRef, useEffect } from 'react';
import { GlassPane } from './GlassPane';
import { FolderKanban, Hash, LayoutGrid, Settings, Briefcase, Plus, Folder as FolderIcon, X, Check, Clock, Crown } from 'lucide-react';
import { Folder } from '../types';

interface SidebarProps {
  className?: string;
  folders: Folder[];
  activeFolderId: string;
  onSelectFolder: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onOpenSettings: () => void;
  onOpenPremium: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  folders, 
  activeFolderId, 
  onSelectFolder, 
  onCreateFolder,
  onOpenSettings,
  onOpenPremium
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleCreateSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setNewFolderName('');
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'layout-grid': return <LayoutGrid size={14} />;
      case 'briefcase': return <Briefcase size={14} />;
      case 'hash': return <Hash size={14} />;
      case 'folder-kanban': return <FolderKanban size={14} />;
      case 'clock': return <Clock size={14} />;
      case 'folder': default: return <FolderIcon size={14} />;
    }
  };

  const isSettingsActive = activeFolderId === 'settings';
  const isPremiumActive = activeFolderId === 'premium';

  return (
    <GlassPane className={`flex flex-col rounded-2xl p-4 ${className}`}>
      <div className="mb-6 px-2 flex-1 overflow-y-auto custom-scrollbar">
        <h2 className="text-[10px] uppercase tracking-wider text-glass-muted font-bold mb-4">Folders</h2>
        <nav className="space-y-1">
          {folders.map((folder) => {
            const isActive = folder.id === activeFolderId;
            return (
              <button
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-500/20 text-blue-100 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                    : 'text-glass-muted hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-blue-400' : 'text-glass-muted group-hover:text-white transition-colors'}>
                  {getIcon(folder.icon)}
                </span>
                <span className="truncate">{folder.name}</span>
                {folder.count !== undefined && folder.count > 0 && (
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-blue-500/20 text-blue-200' : 'bg-white/10 text-white/60'}`}>
                    {folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto pt-4 border-t border-white/5">
        {!isCreating ? (
          <div 
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-xl p-3 mb-2 cursor-pointer hover:border-white/20 transition-all group"
          >
             <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                   <Plus size={16} />
                </div>
                <div>
                   <div className="text-white text-xs font-medium">New Brand</div>
                   <div className="text-[10px] text-glass-muted">Create folder</div>
                </div>
             </div>
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit} className="bg-white/[0.05] border border-white/10 rounded-xl p-3 mb-2">
            <input
              ref={inputRef}
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder Name"
              className="w-full bg-transparent border-none outline-none text-white text-xs placeholder-white/20 mb-2"
            />
            <div className="flex gap-2">
              <button 
                type="submit"
                className="flex-1 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] transition-colors"
              >
                Create
              </button>
              <button 
                type="button"
                onClick={cancelCreate}
                className="px-2 py-1 rounded-md hover:bg-white/10 text-glass-muted hover:text-white text-[10px] transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </form>
        )}

        <button 
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-[13px] transition-all group ${
            isSettingsActive
              ? 'bg-blue-500/20 text-blue-100 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
              : 'text-glass-muted hover:bg-white/[0.05] hover:text-white'
          }`}
        >
          <span className={isSettingsActive ? 'text-blue-400' : 'text-glass-muted group-hover:text-white transition-colors'}>
            <Settings size={16} />
          </span>
          <span>Settings</span>
        </button>

        <button 
          onClick={onOpenPremium}
          className={`w-full flex items-center gap-3 px-3 py-3 mt-3 rounded-lg text-[13px] transition-all relative overflow-hidden group border ${
            isPremiumActive
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
              : 'bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-100 hover:border-cyan-500/40'
          }`}
        >
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-cyan-400">
            <Crown size={16} />
          </span>
          <div className="flex flex-col items-start leading-tight relative z-10">
             <span className="font-semibold text-xs">Premium Plan</span>
             <span className="text-[9px] opacity-80">₹199 / mo</span>
          </div>
        </button>
      </div>
    </GlassPane>
  );
};