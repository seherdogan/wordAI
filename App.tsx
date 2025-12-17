import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Marketplace from './components/Marketplace';
import Editor from './components/Editor';

type ViewState = 'marketplace' | 'editor';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('marketplace');
  const [currentDocTitle, setCurrentDocTitle] = useState('');

  const handleOpenDoc = (id: string, title: string) => {
    setCurrentDocTitle(title);
    setView('editor');
  };

  const handleCreateNew = () => {
    setCurrentDocTitle("Adsız Belge");
    setView('editor');
  };

  const handleGoHome = () => {
    setView('marketplace');
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#f5f5f7]">
      <Navbar onHomeClick={handleGoHome} />
      
      {view === 'marketplace' ? (
        <Marketplace onOpenDocument={handleOpenDoc} onCreateNew={handleCreateNew} />
      ) : (
        <Editor title={currentDocTitle} onBack={handleGoHome} />
      )}
    </div>
  );
};

export default App;