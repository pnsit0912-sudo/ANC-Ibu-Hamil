
import React from 'react';
import { HeartPulse } from 'lucide-react';
import { MOCK_USERS } from './constants';
import { User } from './types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => (
  <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
    <div className="bg-white w-full max-w-md rounded-[5rem] shadow-2xl p-14 text-center border-b-[12px] border-indigo-700 animate-in zoom-in-95 duration-500">
      <div className="bg-indigo-50 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-indigo-600 shadow-inner rotate-3">
        <HeartPulse size={72} className="animate-pulse" />
      </div>
      <h1 className="text-6xl font-black text-gray-900 mb-3 tracking-tighter">Smart ANC</h1>
      <p className="text-gray-400 font-bold uppercase text-[11px] tracking-[0.4em] mb-14">Monitoring Ibu Hamil Cerdas</p>
      
      <div className="space-y-4">
        <button 
          onClick={() => onLogin(MOCK_USERS[1])} 
          className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          Masuk Sebagai Admin
        </button>
        <button 
          onClick={() => onLogin(MOCK_USERS[2])} 
          className="w-full py-6 bg-blue-500 text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          Masuk Sebagai Nakes
        </button>
        <button 
          onClick={() => onLogin(MOCK_USERS[0])} 
          className="w-full py-6 bg-teal-500 text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          Masuk Sebagai Ibu Hamil
        </button>
      </div>
      
      <p className="mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
        &copy; 2024 Puskesmas Pasar Minggu
      </p>
    </div>
  </div>
);
