import React, { useEffect } from 'react';
import { Notification } from '../types';

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 w-80 pointer-events-none">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className={`
            pointer-events-auto transform transition-all duration-500 animate-[slideIn_0.3s_ease-out]
            p-4 rounded border backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]
            ${notif.type === 'INFO' ? 'bg-cyan-900/80 border-cyan-500/50 text-cyan-100' : ''}
            ${notif.type === 'WARNING' ? 'bg-yellow-900/80 border-yellow-500/50 text-yellow-100' : ''}
            ${notif.type === 'SUCCESS' ? 'bg-green-900/80 border-green-500/50 text-green-100' : ''}
            ${notif.type === 'ERROR' ? 'bg-red-900/80 border-red-500/50 text-red-100' : ''}
          `}
        >
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-xs uppercase tracking-widest mb-1">{notif.title}</h4>
            <button 
              onClick={() => onDismiss(notif.id)}
              className="text-white/50 hover:text-white"
            >
              ×
            </button>
          </div>
          <p className="text-sm font-light opacity-90">{notif.message}</p>
          <span className="text-[10px] opacity-50 mt-2 block text-right">
            {new Date(notif.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;