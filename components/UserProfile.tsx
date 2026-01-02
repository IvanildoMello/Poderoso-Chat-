import React from 'react';
import { UserStats, UserProfile as UserProfileType } from '../types';

interface UserProfileProps {
  profile: UserProfileType;
  stats: UserStats;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, stats }) => {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-purple-500/20 rounded-lg p-4 w-full">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-purple-500/20">
        <div>
          <h3 className="text-lg font-bold text-white tracking-widest">{profile.username}</h3>
          <span className="text-[10px] text-purple-400 uppercase tracking-[0.2em]">{profile.accessLevel} CLEARANCE</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-purple-500 flex items-center justify-center bg-purple-900/20 animate-pulse">
            <span className="text-xs font-bold text-purple-200">{stats.evolutionStage}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Interaction Stat */}
        <div className="group">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Interações</span>
            <span className="text-cyan-400 font-mono">{stats.interactionCount}</span>
          </div>
          <div className="h-1 w-full bg-gray-800 rounded overflow-hidden">
            <div 
                className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" 
                style={{ width: `${Math.min(stats.interactionCount * 2, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Neural Sync Stat */}
        <div className="group">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Sincronia Neural</span>
            <span className="text-purple-400 font-mono">{stats.neuralSyncLevel.toFixed(1)}%</span>
          </div>
          <div className="h-1 w-full bg-gray-800 rounded overflow-hidden">
             <div 
                className="h-full bg-purple-500 shadow-[0_0_10px_#a855f7] transition-all duration-1000" 
                style={{ width: `${stats.neuralSyncLevel}%` }}
             ></div>
          </div>
        </div>

        {/* Alignment Matrix */}
        <div className="border border-gray-800 bg-black/30 p-2 rounded mt-2">
            <div className="text-[10px] text-gray-500 uppercase text-center mb-2">Matriz de Alinhamento</div>
            <div className="flex justify-between items-center text-[10px]">
                <span className={`px-2 py-1 rounded ${stats.cognitiveAlignment === 'CHAOTIC' ? 'bg-red-900/40 text-red-400 border border-red-500/30' : 'text-gray-700'}`}>CAÓTICO</span>
                <span className={`px-2 py-1 rounded ${stats.cognitiveAlignment === 'NEUTRAL' ? 'bg-gray-800 text-gray-300' : 'text-gray-700'}`}>NEUTRO</span>
                <span className={`px-2 py-1 rounded ${stats.cognitiveAlignment === 'LAWFUL' ? 'bg-blue-900/40 text-blue-400 border border-blue-500/30' : 'text-gray-700'}`}>LEAL</span>
            </div>
        </div>
      </div>
      
      <div className="mt-4 pt-2 border-t border-dashed border-gray-800 text-center">
          <p className="text-[9px] text-gray-600 animate-pulse">DADOS BIOMÉTRICOS SINCRONIZADOS</p>
      </div>
    </div>
  );
};

export default UserProfile;