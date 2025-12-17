import React from 'react';

interface NavbarProps {
  onHomeClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onHomeClick }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 py-4 px-4 md:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={onHomeClick}>
          <div className="bg-dark text-white p-2 rounded-lg group-hover:bg-brand transition-colors">
            <span className="material-symbols-rounded text-2xl">shopping_bag</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-dark">SERAH.</span>
        </div>

        {/* Right Actions - Simplified */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
             <span className="text-xs font-bold text-dark">Demo Kullanıcısı</span>
             <span className="text-[10px] text-gray-500">Pro Plan</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-md overflow-hidden">
            <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;