import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { ResultsPane } from './components/ResultsPane';
import { SocialPlatform, Folder, PlatformDef, HistoryItem, SavedItem } from './types';

// Constants
const ALL_PLATFORMS: PlatformDef[] = [
  { id: 'twitter', name: 'Twitter', icon: 'twitter', color: 'text-sky-400' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram', color: 'text-pink-400' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', color: 'text-blue-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: 'text-blue-600' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', color: 'text-red-500' },
  { id: 'github', name: 'GitHub', icon: 'github', color: 'text-gray-300' },
  { id: 'reddit', name: 'Reddit', icon: 'reddit', color: 'text-orange-500' },
  { id: 'tiktok', name: 'TikTok', icon: 'tiktok', color: 'text-pink-500' },
];

type Theme = 'default' | 'dark' | 'light';

function App() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SocialPlatform[]>([]);
  const [enabledPlatformIds, setEnabledPlatformIds] = useState<string[]>(['twitter', 'instagram', 'facebook', 'linkedin']);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  
  // Folder Management State
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'dashboard', name: 'Dashboard', icon: 'layout-grid', type: 'system', items: [] },
    { id: 'business', name: 'Business', icon: 'briefcase', type: 'system', count: 0, items: [] },
    { id: 'projects', name: 'Projects', icon: 'folder-kanban', type: 'system', count: 0, items: [] },
    { id: 'handles', name: 'Handles', icon: 'hash', type: 'system', count: 0, items: [] },
    { id: 'history', name: 'History', icon: 'clock', type: 'system', items: [] },
    { 
      id: 'demo-folder', 
      name: 'Startup Ideas', 
      icon: 'folder', 
      type: 'user', 
      count: 2, 
      items: [
        { handle: 'tech-start', type: 'business', timestamp: Date.now() - 100000 },
        { handle: 'pixel-lab', type: 'project', timestamp: Date.now() - 200000 }
      ] 
    },
  ]);
  const [activeFolderId, setActiveFolderId] = useState('dashboard');

  // Helper to apply theme styles to body
  const applyThemeStyles = (selectedTheme: Theme) => {
    const body = document.body;
    
    // We remove the CSS transition on the body to allow the View Transition API 
    // to handle the cross-fade. This prevents the "flashing" of incorrect colors (orange/green)
    // that occurs when interpolating between inverted filters.
    
    if (selectedTheme === 'light') {
      // Invert to make light, rotate hue back to make blue look blue
      body.style.filter = 'invert(1) hue-rotate(-180deg)';
      body.style.backgroundColor = '#0f172a'; 
    } else if (selectedTheme === 'dark') {
      body.style.filter = 'invert(0) hue-rotate(0deg)';
      body.style.backgroundColor = '#000000';
    } else {
      // Default / Liquid
      body.style.filter = 'invert(0) hue-rotate(0deg)';
      body.style.backgroundColor = '#0f172a';
    }
  };

  useEffect(() => {
    applyThemeStyles(theme);
  }, [theme]);

  // Helper to compute folders with dynamic counts for system folders
  const getFoldersWithCounts = () => {
    // Count items for system folders
    let businessCount = 0;
    let projectCount = 0;
    let totalHandlesCount = 0;

    folders.forEach(f => {
      if (f.type === 'user' && f.items) {
        f.items.forEach(item => {
          if (item.type === 'business') businessCount++;
          if (item.type === 'project') projectCount++;
          totalHandlesCount++;
        });
      }
    });

    return folders.map(f => {
      if (f.id === 'business') return { ...f, count: businessCount };
      if (f.id === 'projects') return { ...f, count: projectCount };
      if (f.id === 'handles') return { ...f, count: totalHandlesCount };
      if (f.type === 'user') return { ...f, count: f.items?.length || 0 };
      return f;
    });
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      icon: 'folder', 
      type: 'user',
      count: 0,
      items: []
    };
    setFolders(prev => [...prev, newFolder]);
    return newFolder.id;
  };

  const handleSelectFolder = (id: string) => {
    setActiveFolderId(id);
  };

  const handleOpenSettings = () => {
    setActiveFolderId('settings');
  };

  const handleOpenPremium = () => {
    setActiveFolderId('premium');
  };

  const handleResetApp = () => {
    if (window.confirm('Are you sure you want to reset the app? This will clear all data, history, and folders.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSaveToFolder = (handle: string, folderId: string, type: 'business' | 'project') => {
    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        const currentItems = f.items || [];
        if (!currentItems.some(i => i.handle === handle)) {
            const newItem: SavedItem = {
              handle,
              type,
              timestamp: Date.now()
            };
            return { 
                ...f, 
                items: [...currentItems, newItem],
                count: (f.count || 0) + 1 
            };
        }
      }
      return f;
    }));
  };

  const handleTogglePlatform = (id: string) => {
    setEnabledPlatformIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAllPlatforms = () => {
    setEnabledPlatformIds(ALL_PLATFORMS.map(p => p.id));
  };

  const handleClearAllPlatforms = () => {
    setEnabledPlatformIds([]);
  };

  // Deterministic simulation logic
  const checkAvailability = (handle: string, platformId: string): SocialPlatform => {
    const lowerHandle = handle.toLowerCase();
    const platform = ALL_PLATFORMS.find(p => p.id === platformId) || { name: platformId, icon: platformId };
    const lowerPlatform = platform.name.toLowerCase();

    // Base object
    let result: SocialPlatform = {
      id: platformId,
      name: platform.name,
      icon: platformId,
      status: 'checking',
      price: 9.99, // Base price
      url: `https://${lowerPlatform}.com/${lowerHandle}`,
      details: { message: 'Checking...' }
    };

    // 1. Length checks & Formatting
    if (lowerHandle.length < 3) {
      return {
        ...result,
        status: 'taken',
        details: { message: 'Reserved', meta: 'Too short' }
      };
    }

    // 2. Hash function for consistent "randomness"
    let hash = 0;
    for (let i = 0; i < lowerHandle.length; i++) {
      hash = ((hash << 5) - hash) + lowerHandle.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    // 3. Platform specific logic
    if (platformId === 'twitter') {
      if (lowerHandle.length < 5 || absHash % 3 === 0) {
        const followers = (absHash % 5000) * 12 + 42;
        return {
          ...result,
          status: 'taken',
          details: { 
            message: 'Account active', 
            meta: `${(followers / 1000).toFixed(1)}k followers`,
            actionLabel: 'View Profile',
            actionUrl: `https://twitter.com/${lowerHandle}`
          }
        };
      }
    } else if (platformId === 'instagram') {
       if (absHash % 4 === 0) {
        return {
          ...result,
          status: 'taken',
          details: { message: 'Private Account', meta: 'Not available' }
        };
       }
    } else if (platformId === 'facebook') {
       if (absHash % 5 === 0) {
         return {
           ...result,
           status: 'taken',
           details: { message: 'Page exists', meta: 'Business Page' }
         };
       }
    } else if (platformId === 'github') {
        if (/[^a-zA-Z0-9-]/.test(lowerHandle)) {
            return {
                ...result,
                status: 'taken',
                details: { message: 'Invalid Format', meta: 'Alphanumeric Only' }
            };
        }
        if (absHash % 6 === 0) {
            return {
                ...result,
                status: 'taken',
                details: { message: 'User exists', meta: 'Active Dev' }
            };
        }
    } else if (platformId === 'youtube') {
        if (absHash % 4 === 2) {
            return {
                ...result,
                status: 'taken',
                details: { message: 'Channel exists', meta: 'Verified' }
            };
        }
    } else if (platformId === 'reddit') {
         if (absHash % 7 === 0) {
            return {
                ...result,
                status: 'taken',
                details: { message: 'Subreddit exists', meta: 'r/' + lowerHandle }
            };
        }
    }

    // 4. Premium Logic
    if (lowerHandle.length <= 4) {
      return {
        ...result,
        status: 'available',
        price: 299.00,
        details: { message: 'High Value', meta: 'Premium Tier' }
      };
    }

    return {
      ...result,
      status: 'available',
      price: 9.99,
      details: { message: 'Available', meta: 'Instant Delivery' }
    };
  };

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    
    if (!newQuery.trim()) {
        setIsSearching(false);
        setResults([]);
        return;
    }
    
    setIsSearching(true);

    setTimeout(() => {
        const newResults = enabledPlatformIds.map(platformId => 
            checkAvailability(newQuery, platformId)
        );
        
        setResults(newResults);
        setIsSearching(false);

        const availableCount = newResults.filter(r => r.status === 'available').length;
        const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            query: newQuery,
            timestamp: Date.now(),
            availableCount,
            totalCount: newResults.length,
            platforms: enabledPlatformIds
        };
        
        setHistory(prev => {
            const exists = prev.find(h => h.query === newQuery);
            if (exists) return prev;
            return [newHistoryItem, ...prev].slice(0, 50);
        });
    }, 600);
  };

  const handleClaim = (platformIds: string[]) => {
      setResults(prev => prev.map(r => {
          if (platformIds.includes(r.id) && r.status === 'available') {
              return {
                  ...r,
                  status: 'owned',
                  details: { message: 'Owned', meta: 'Secured via Handl' }
              };
          }
          return r;
      }));
  };

  const handleHistoryRestore = (q: string) => {
    handleSearch(q);
    setActiveFolderId('dashboard');
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all search history?')) {
        setHistory([]);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
      setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleExportHistory = () => {
      const csvContent = "data:text/csv;charset=utf-8," 
          + "Timestamp,Handle,Available,Total\n"
          + history.map(row => `${new Date(row.timestamp).toISOString()},${row.query},${row.availableCount},${row.totalCount}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "handl_history.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleToggleTheme = () => {
    let nextTheme: Theme;
    if (theme === 'light') nextTheme = 'default';
    else if (theme === 'default') nextTheme = 'dark';
    else nextTheme = 'light';

    // Use View Transitions API for a simple, smooth fade without artifacts
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(() => {
        setTheme(nextTheme);
        applyThemeStyles(nextTheme);
      });
    } else {
      setTheme(nextTheme);
      applyThemeStyles(nextTheme);
    }
  };

  return (
    <div className="flex flex-col h-screen text-white bg-transparent">
      <Navbar theme={theme} onToggleTheme={handleToggleTheme} />
      
      <div className="flex flex-1 overflow-hidden px-4 gap-4">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col">
          <Sidebar 
            className="h-full" 
            folders={getFoldersWithCounts()} 
            activeFolderId={activeFolderId}
            onSelectFolder={handleSelectFolder}
            onCreateFolder={handleCreateFolder}
            onOpenSettings={handleOpenSettings}
            onOpenPremium={handleOpenPremium}
          />
        </div>

        {/* Center Main Content */}
        <MainContent 
          className="flex-1 min-w-0"
          activeFolderId={activeFolderId}
          onSearch={handleSearch}
          query={query}
          results={results}
          onClaim={handleClaim}
          allPlatforms={ALL_PLATFORMS}
          enabledPlatformIds={enabledPlatformIds}
          onTogglePlatform={handleTogglePlatform}
          onSelectAllPlatforms={handleSelectAllPlatforms}
          onClearAllPlatforms={handleClearAllPlatforms}
          folders={getFoldersWithCounts()}
          onSaveToFolder={handleSaveToFolder}
          onCreateFolder={handleCreateFolder}
          history={history}
          onHistoryRestore={handleHistoryRestore}
          onClearHistory={handleClearHistory}
          onExportHistory={handleExportHistory}
          onDeleteHistoryItem={handleDeleteHistoryItem}
          onResetApp={handleResetApp}
        />

        {/* Right Results Pane */}
        {activeFolderId === 'dashboard' && (
          <div className="w-80 flex-shrink-0 flex flex-col">
            <ResultsPane 
              className="h-full" 
              results={results} 
              isSearching={isSearching} 
              onRefresh={() => handleSearch(query)}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;