
import React, { useState } from 'react';
import { Menu, Search, LogOut, CloudLightning, RefreshCw, Bell, X, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { UserRole, SystemAlert } from './types';

interface HeaderProps {
  title: string;
  userName: string;
  userRole: UserRole;
  onToggleSidebar: () => void;
  onSearchChange: (value: string) => void;
  onLogout: () => void;
  isSyncing?: boolean;
  alerts: SystemAlert[];
  onMarkAsRead: (alertId: string) => void;
  onNavigateToPatient: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, userName, userRole, onToggleSidebar, onSearchChange, onLogout, isSyncing, alerts, onMarkAsRead, onNavigateToPatient 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadAlerts = alerts.filter(a => !a.isRead);

  return (
    <header className="no-print h-20 md:h-32 bg-white/70 backdrop-blur-2xl border-b border-gray-100 flex items-center justify-between px-4 md:px-16 sticky top-0 z-40">
      <div className="flex items-center gap-3 md:gap-10">
        <button 
          onClick={onToggleSidebar} 
          className="p-3 md:p-4.5 bg-gray-50 rounded-xl md:rounded-[1.25rem] text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-lg md:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none truncate max-w-[120px] md:max-w-none">{title}</h1>
          <p className="hidden md:block text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">ANC Monitoring Control</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative w-80 hidden xl:block">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="Cari..." 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="w-full pl-16 pr-8 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all" 
          />
        </div>

        <div className="flex items-center gap-2 pl-3 md:pl-8 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-900 leading-none truncate max-w-[80px]">{userName}</p>
            <p className="text-[8px] font-black text-indigo-400 uppercase mt-1">{userRole}</p>
          </div>
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border-2 md:border-4 border-indigo-100 relative group overflow-hidden">
            {userName.charAt(0)}
            <button onClick={onLogout} className="absolute inset-0 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><LogOut size={20}/></button>
          </div>
        </div>
      </div>
    </header>
  );
};
