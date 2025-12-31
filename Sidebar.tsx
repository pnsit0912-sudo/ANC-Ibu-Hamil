
import React from 'react';
import { LogOut, CheckCircle, ChevronLeft } from 'lucide-react';
import { NAVIGATION } from './constants';
import { UserRole } from './types';

interface SidebarProps {
  currentView: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  userRole: UserRole;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onNavigate, 
  onLogout, 
  userRole, 
  isOpen,
  onToggle 
}) => {
  const filteredNav = NAVIGATION.filter(n => n.roles.includes(userRole));

  return (
    <>
      {/* Backdrop for Pop-up mode on small screens */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-indigo-900/20 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-500"
          onClick={onToggle}
        />
      )}

      <aside className={`no-print fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-100 transform transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0 shadow-2xl shadow-indigo-100/50' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-10">
          {/* Sidebar Header with Hide Button */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl rotate-3">
                <CheckCircle size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter">Smart ANC</span>
            </div>
            <button 
              onClick={onToggle}
              className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all group"
              title="Sembunyikan Sidebar"
            >
              <ChevronLeft size={20} className={`transition-transform duration-500 ${!isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {filteredNav.map(nav => (
              <button 
                key={nav.path} 
                onClick={() => {
                  onNavigate(nav.path);
                  // Auto close on mobile after selection
                  if (window.innerWidth < 1024) onToggle();
                }} 
                className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-[1.5rem] text-[12px] font-black transition-all group ${
                  currentView === nav.path 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 translate-x-1' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                <span className={`${currentView === nav.path ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  {nav.icon}
                </span>
                {nav.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-gray-100">
            <button 
              onClick={onLogout} 
              className="w-full flex items-center gap-5 px-6 py-4.5 rounded-[1.5rem] text-[12px] font-black text-red-500 hover:bg-red-50 transition-all active:scale-95"
            >
              <LogOut size={20} /> Keluar Sesi
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
