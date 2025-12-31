
import React from 'react';
import { Menu, Search, LogOut } from 'lucide-react';
import { UserRole } from './types';

interface HeaderProps {
  title: string;
  userName: string;
  userRole: UserRole;
  onToggleSidebar: () => void;
  onSearchChange: (value: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, userName, userRole, onToggleSidebar, onSearchChange, onLogout 
}) => (
  <header className="no-print h-32 bg-white/70 backdrop-blur-2xl border-b border-gray-100 flex items-center justify-between px-16 sticky top-0 z-40">
    <div className="flex items-center gap-10">
      <button 
        onClick={onToggleSidebar} 
        className="p-4.5 bg-gray-50 rounded-[1.25rem] text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <Menu size={28} />
      </button>
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{title}</h1>
        <p className="text-[10px] font-black text-indigo-400 mt-1 uppercase tracking-widest">ANC Monitoring Control</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
       <div className="relative w-80 hidden xl:block">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
         <input 
           type="text" 
           placeholder="Cari Pasien..." 
           onChange={(e) => onSearchChange(e.target.value)} 
           className="w-full pl-16 pr-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all" 
         />
       </div>
       <div className="flex items-center gap-5 pl-8 border-l border-gray-100">
         <div className="text-right hidden sm:block">
           <p className="text-base font-black text-gray-900 leading-none">{userName}</p>
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">{userRole}</p>
         </div>
         <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border-4 border-indigo-100 relative group overflow-hidden">
           {userName.charAt(0)}
           <button 
             onClick={onLogout} 
             className="absolute inset-0 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
             title="Keluar"
           >
             <LogOut size={24}/>
           </button>
         </div>
       </div>
    </div>
  </header>
);
