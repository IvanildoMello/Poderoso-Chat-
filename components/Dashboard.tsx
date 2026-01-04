
import React, { useState, useRef, useEffect } from 'react';
import { generateCoreResponse } from '../services/geminiService';
import { db, saveLog, getLogs, saveMessage, getMessages, getUserStats, saveUserStats, syncWithCloud } from '../services/db';
import { Message, Role, ConnectionStatus, UserStats, Task, Notification, SystemLogEntry, NetworkDetails } from '../types';
import { APP_NAME } from '../constants';
import NeuralNetworkGraph from './NeuralNetworkGraph';
import UserProfile from './UserProfile';
import TaskModule from './TaskModule';
import ProfileModule from './ProfileModule';
import NotificationSystem from './NotificationSystem';
import NeurologicalBackground from './NeurologicalBackground';

interface DashboardProps {
  onLogout: () => void;
}

type TabView = 'CHAT' | 'TASKS' | 'PROFILE' | 'LOGS';

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabView>('CHAT');
  const [input, setInput] = useState('');
  const [themeHue, setThemeHue] = useState<number>(() => {
     const saved = localStorage.getItem('neuro_theme_hue');
     return saved ? parseInt(saved) : 0;
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>(navigator.onLine ? ConnectionStatus.ONLINE : ConnectionStatus.OFFLINE);
  const [network, setNetwork] = useState<NetworkDetails>({ type: 'unknown', effectiveType: 'unknown', downlink: 0, rtt: 0 });
  const [userStats, setUserStatsState] = useState<UserStats>({ interactionCount: 0, neuralSyncLevel: 12.5, evolutionStage: 1, cognitiveAlignment: 'NEUTRAL' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkConnectivity = () => {
      const isOnline = navigator.onLine;
      const newStatus = isOnline ? ConnectionStatus.ONLINE : ConnectionStatus.OFFLINE;
      if (newStatus !== status) {
        setStatus(newStatus);
        if (isOnline) triggerSync();
      }
    };
    window.addEventListener('online', checkConnectivity);
    window.addEventListener('offline', checkConnectivity);
    return () => {
      window.removeEventListener('online', checkConnectivity);
      window.removeEventListener('offline', checkConnectivity);
    };
  }, [status]);

  useEffect(() => {
      const load = async () => {
          const msgs = await getMessages();
          setMessages(msgs.length > 0 ? msgs : [{ id: 'init', role: Role.MODEL, text: `Núcleo de Inteligência Online. Buscas em tempo real ativadas.`, timestamp: new Date() }]);
          const logs = await getLogs(); setSystemLogs(logs);
          const stats = await getUserStats(); if (stats) setUserStatsState(stats);
      };
      load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const addLogEntry = async (action: string, details: string, category: SystemLogEntry['category'] = 'SYSTEM') => {
      const newLog: SystemLogEntry = { id: Math.random().toString(), action, details, timestamp: new Date().toISOString(), category };
      await saveLog(newLog);
      setSystemLogs(await getLogs());
  };

  const triggerSync = async () => {
      setIsSyncing(true);
      await syncWithCloud();
      setIsSyncing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);
    await saveMessage(userMsg);

    const history = messages.slice(-6).map(m => ({
        role: m.role === Role.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

    const result = await generateCoreResponse(userMsg.text, history);
    
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: Role.MODEL,
      text: result.text,
      timestamp: new Date()
    };

    // Adicionar fontes se houver
    if (result.chunks && result.chunks.length > 0) {
        const sources = result.chunks
            .filter((c: any) => c.web)
            .map((c: any) => `\n• [${c.web.title}](${c.web.uri})`)
            .join('');
        if (sources) aiMsg.text += `\n\n**FONTES DE DADOS:**${sources}`;
    }

    setMessages(prev => [...prev, aiMsg]);
    await saveMessage(aiMsg);
    setIsProcessing(false);
    
    const newStats = { ...userStats, interactionCount: userStats.interactionCount + 1, neuralSyncLevel: Math.min(100, userStats.neuralSyncLevel + 0.5) };
    setUserStatsState(newStats);
    await saveUserStats(newStats);
  };

  return (
    <div className="flex flex-col h-full w-full relative z-10" style={{ filter: `hue-rotate(${themeHue}deg)` }}>
      <div className="crt-overlay pointer-events-none"></div>
      
      <header className="h-16 border-b border-cyan-500/30 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status === ConnectionStatus.ONLINE ? 'bg-cyan-400 shadow-[0_0_8px_cyan]' : 'bg-red-500'}`}></div>
            <h1 className="text-xl font-bold text-cyan-100 tracking-[0.2em] italic">{APP_NAME}</h1>
        </div>
        <div className="flex gap-4 items-center">
             <div className="text-[10px] text-cyan-500/50 font-mono hidden md:block">PRECISION_ENGINE: ACTIVE</div>
             <button onClick={onLogout} className="text-[10px] text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">Desconectar</button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-row w-full bg-black/20">
        <div className="flex-1 flex flex-col h-full relative">
            {activeTab === 'PROFILE' ? (
                <ProfileModule currentThemeHue={themeHue} onThemeChange={setThemeHue} onSyncTrigger={triggerSync} />
            ) : activeTab === 'TASKS' ? (
              <TaskModule onLog={addLogEntry} onNotify={(t, m, ty) => {}} onSyncTrigger={triggerSync} />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.2s_ease-out]`}>
                            <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl border ${msg.role === Role.USER ? 'bg-cyan-900/20 border-cyan-500/40 text-cyan-50' : 'bg-white/5 border-white/10 text-gray-200'}`}>
                                <div className="text-[8px] uppercase tracking-[0.2em] opacity-30 mb-2">{msg.role === Role.USER ? 'INPUT_PROCESS' : 'NEURAL_OUTPUT'}</div>
                                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-light">{msg.text}</div>
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="flex items-center gap-3 text-cyan-500 text-[10px] font-bold tracking-widest animate-pulse">
                            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                            ESCANEANDO REDE GLOBAL...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <form onSubmit={handleSubmit} className="relative max-w-5xl mx-auto group">
                        <div className="absolute -inset-1 bg-cyan-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                        <div className="relative flex items-center">
                          <input
                              type="text"
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 pr-16 text-cyan-100 focus:outline-none focus:border-cyan-500/50 backdrop-blur-md transition-all placeholder:text-gray-700"
                              placeholder="Consulte o núcleo ou pesquise na rede global..."
                          />
                          <button type="submit" className="absolute right-5 text-cyan-500 hover:text-cyan-300 transition-colors">
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                          </button>
                        </div>
                    </form>
                </div>
              </>
            )}
        </div>

        <aside className="hidden xl:flex w-80 flex-col border-l border-white/5 p-6 space-y-6 bg-black/40 backdrop-blur-sm">
            <NeuralNetworkGraph isActive={isProcessing} />
            <UserProfile profile={{ username: 'OP_MELLO', accessLevel: 'OMEGA' }} stats={userStats} />
            <div className="flex-1 flex flex-col justify-end">
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-[10px] font-mono text-cyan-500/60 leading-tight">
                    <p className="mb-2 text-cyan-400 font-bold">SYSTEM_INFO:</p>
                    <p>ENGINE: Gemini 3 Flash</p>
                    <p>SEARCH: Enabled (RT)</p>
                    <p>PRECISION: 99.9%</p>
                    <p>LATENCY: Optimized</p>
                </div>
            </div>
        </aside>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-black/90 border-t border-white/5 flex items-center justify-around z-30 px-4">
          {['CHAT', 'TASKS', 'PROFILE'].map((id) => (
              <button 
                key={id} 
                onClick={() => setActiveTab(id as TabView)} 
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === id ? 'text-cyan-400 scale-110' : 'text-gray-600'}`}
              >
                <div className={`w-1 h-1 rounded-full mb-1 ${activeTab === id ? 'bg-cyan-400 shadow-[0_0_5px_cyan]' : 'bg-transparent'}`}></div>
                <span className="text-[10px] font-bold tracking-widest">{id}</span>
              </button>
          ))}
      </nav>
    </div>
  );
};

export default Dashboard;
