
import React from 'react';
import { LogOut, CheckCircle } from 'lucide-react';
import { NAVIGATION } from './constants';
import { UserRole } from './types';

interface SidebarProps {
  currentView: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  userRole: UserRole;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, userRole, isOpen }) => {
  const filteredNav = NAVIGATION.filter(n => n.roles.includes(userRole));

  return (
    <aside className={`no-print fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-100 transform transition-transform duration-700 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
      <div className="h-full flex flex-col p-12">
        <div className="flex items-center gap-4 mb-20">
          <div className="bg-indigo-600 p-3.5 rounded-2xl text-white shadow-2xl rotate-3">
            <CheckCircle size={32} />
          </div>
          <span className="text-3xl font-black tracking-tighter">Smart ANC</span>
        </div>
        
        <nav className="flex-1 space-y-3">
          {filteredNav.map(nav => (
            <button 
              key={nav.path} 
              onClick={() => onNavigate(nav.path)} 
              className={`w-full flex items-center gap-6 px-6 py-5 rounded-[1.75rem] text-[13px] font-black transition-all ${currentView === nav.path ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 translate-x-2' : 'text-gray-400 hover:bg-gray-50 hover:text-indigo-600'}`}
            >
              {nav.icon} {nav.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10 border-t">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-6 px-6 py-5 rounded-[1.75rem] text-[13px] font-black text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} /> Keluar Sesi
          </button>
        </div>
      </div>
    </aside>
  );
};
