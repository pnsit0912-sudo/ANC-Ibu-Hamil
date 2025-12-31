
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
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">ANC Monitoring Control</p>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <div className={`flex items-center gap-1 text-[9px] font-black uppercase transition-all ${isSyncing ? 'text-blue-500' : 'text-emerald-500'}`}>
               {isSyncing ? <RefreshCw size={10} className="animate-spin" /> : <CloudLightning size={10} />}
               {isSyncing ? 'Syncing...' : 'Connected'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative w-80 hidden xl:block">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="Cari Pasien..." 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="w-full pl-16 pr-8 py-5 bg-gray-50 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all" 
          />
        </div>

        {/* Notifications Bell */}
        {(userRole === UserRole.ADMIN || userRole === UserRole.NAKES) && (
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-5 rounded-[1.25rem] transition-all relative group ${unreadAlerts.length > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400 hover:text-indigo-600'}`}
            >
              <Bell size={24} className={unreadAlerts.length > 0 ? 'animate-swing' : ''} />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-6 w-96 bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-4 duration-500 z-50">
                <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                   <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2"><Bell size={14}/> Pemberitahuan Sistem</h4>
                   <button onClick={() => setShowNotifications(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"><X size={16}/></button>
                </div>
                
                <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                  {alerts.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {alerts.map(alert => (
                        <div 
                          key={alert.id} 
                          className={`p-6 hover:bg-gray-50 transition-all group relative ${!alert.isRead ? 'bg-indigo-50/30' : ''}`}
                        >
                          <div className="flex gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert.type === 'EMERGENCY' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                {alert.type === 'EMERGENCY' ? <AlertCircle size={20}/> : <Clock size={20}/>}
                             </div>
                             <div className="flex-1">
                                <div className="flex justify-between items-start">
                                   <p className="text-[10px] font-black text-gray-900 uppercase leading-none mb-1">{alert.patientName}</p>
                                   <span className="text-[8px] font-bold text-gray-400">{new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-[11px] font-bold text-gray-500 leading-snug">{alert.message}</p>
                                
                                <div className="mt-4 flex gap-2">
                                   <button 
                                      onClick={() => {
                                        onNavigateToPatient('monitoring');
                                        setShowNotifications(false);
                                      }}
                                      className="px-4 py-2 bg-indigo-600 text-white text-[9px] font-black rounded-lg uppercase flex items-center gap-1 hover:scale-105 transition-all"
                                   >
                                     Tindak Lanjut <ChevronRight size={10}/>
                                   </button>
                                   {!alert.isRead && (
                                     <button 
                                        onClick={() => onMarkAsRead(alert.id)}
                                        className="px-4 py-2 bg-gray-100 text-gray-500 text-[9px] font-black rounded-lg uppercase hover:bg-indigo-100 hover:text-indigo-600 transition-all"
                                     >
                                       Abaikan
                                     </button>
                                   )}
                                </div>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center">
                       <Bell size={48} className="mx-auto text-gray-100 mb-4" />
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Tidak ada notifikasi baru</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
};
