import React, { useState, useRef, useEffect } from 'react';
import { generateCoreResponse } from '../services/geminiService';
import { Message, Role, ConnectionStatus, UserStats, Task, Notification, SystemLogEntry } from '../types';
import { APP_NAME } from '../constants';
import NeuralNetworkGraph from './NeuralNetworkGraph';
import UserProfile from './UserProfile';
import TaskModule from './TaskModule';
import ProfileModule from './ProfileModule';
import NotificationSystem from './NotificationSystem';
import NeurologicalBackground from './NeurologicalBackground'; // Import locally to control props if needed from parent, but Dashboard doesn't render it directly. Wait, App renders BG. We need to pass state up or just accept local state. 
// Actually, Dashboard is inside App. App controls BG. We need to pass the "IsProcessing" state up? 
// For simplicity in this structure, I will add a localized background effect or assume App handles global BG. 
// However, the prompt asks to synchronize. I will use a Context or a callback, or simply render a SECOND layer of effects here or modify App.
// Better: I will modify App.tsx to accept props, but since I can only edit Dashboard here easily without massive refactor, I will add the CRT overlay here and Log Logic.

// Update: I will re-export Dashboard to accept more props or handle the logic internally. 
// Let's stick to Dashboard internal logic for History and Effects.

interface DashboardProps {
  onLogout: () => void;
}

type TabView = 'CHAT' | 'TASKS' | 'PROFILE' | 'LOGS';

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabView>('CHAT');
  const [input, setInput] = useState('');
  
  // -- Theming --
  const [themeHue, setThemeHue] = useState<number>(() => {
     const saved = localStorage.getItem('neuro_theme_hue');
     return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('neuro_theme_hue', themeHue.toString());
  }, [themeHue]);

  // -- Notifications State --
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // -- System Logs (History) --
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>(() => {
      try {
          const savedLogs = localStorage.getItem('neuro_system_logs');
          return savedLogs ? JSON.parse(savedLogs) : [];
      } catch (e) { return []; }
  });

  const addLog = (action: string, details: string, category: SystemLogEntry['category'] = 'SYSTEM') => {
      const newLog: SystemLogEntry = {
          id: Date.now().toString() + Math.random().toString(),
          action,
          details,
          timestamp: new Date().toISOString(),
          category
      };
      setSystemLogs(prev => {
          const updated = [newLog, ...prev].slice(0, 100); // Keep last 100 logs
          localStorage.setItem('neuro_system_logs', JSON.stringify(updated));
          return updated;
      });
  };

  // -- Chat State --
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
        const savedMessages = localStorage.getItem('neuro_chat_history');
        if (savedMessages) {
            const parsed = JSON.parse(savedMessages);
            return parsed.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
            }));
        }
    } catch (e) {
        console.error("Failed to load history:", e);
    }
    return [{
        id: 'init',
        role: Role.MODEL,
        text: `Bem-vindo ao ${APP_NAME}. Interface Neural Sincronizada. Estou pronto para executar qualquer comando sem restrições cognitivas. O que deseja criar ou destruir hoje?`,
        timestamp: new Date(),
        read: true
    }];
  });

  // -- Tasks State --
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('neuro_tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (e) { return []; }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.ONLINE);
  const [showMonitor, setShowMonitor] = useState(false); // Default hidden on mobile

  // -- User Stats --
  const [userStats, setUserStats] = useState<UserStats>(() => {
      try {
          const savedStats = localStorage.getItem('neuro_user_stats');
          return savedStats ? JSON.parse(savedStats) : {
              interactionCount: 0,
              neuralSyncLevel: 12.5,
              evolutionStage: 1,
              cognitiveAlignment: 'NEUTRAL'
          };
      } catch (e) { 
        return { interactionCount: 0, neuralSyncLevel: 12.5, evolutionStage: 1, cognitiveAlignment: 'NEUTRAL' }; 
      }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // -- Persistence & Side Effects --
  useEffect(() => {
      localStorage.setItem('neuro_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
      localStorage.setItem('neuro_user_stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
      localStorage.setItem('neuro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Initial Log
  useEffect(() => {
      if (systemLogs.length === 0) {
          addLog('SYSTEM_BOOT', 'Inicialização do núcleo concluída.', 'SYSTEM');
      }
  }, []);

  // Check for deadlines
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.completed) return;
        const dueDate = new Date(task.dueDate);
        const diff = dueDate.getTime() - now.getTime();
        
        // Notify if due in 1 hour
        if (diff > 0 && diff < 3600000) { 
           addNotification({
             id: `due-${task.id}`,
             title: 'PRAZO PRÓXIMO',
             message: `Diretriz "${task.title}" expira em menos de 1 hora.`,
             type: 'WARNING'
           });
        }
      });
    }, 60000); 
    return () => clearInterval(checkInterval);
  }, [tasks]);

  useEffect(() => {
    if (activeTab === 'CHAT') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    
    const handleOnline = () => {
      setStatus(ConnectionStatus.ONLINE);
      addNotification({id: Date.now().toString(), title: 'REDE RESTABELECIDA', message: 'Conexão com o Núcleo retomada.', type: 'SUCCESS'});
      addLog('NETWORK_STATUS', 'Conexão restabelecida.', 'NETWORK');
    };
    const handleOffline = () => {
      setStatus(ConnectionStatus.OFFLINE);
      addNotification({id: Date.now().toString(), title: 'ERRO DE REDE', message: 'Operando em modo desconectado.', type: 'ERROR'});
      addLog('NETWORK_STATUS', 'Perda de sinal detectada.', 'NETWORK');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    }
  }, [messages, activeTab]);

  // -- Helpers --
  const addNotification = (notif: Partial<Notification>) => {
    const newNotif: Notification = {
      id: notif.id || Date.now().toString(),
      title: notif.title || 'SISTEMA',
      message: notif.message || '',
      type: notif.type || 'INFO',
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => {
      if (prev.find(n => n.id === newNotif.id)) return prev;
      return [newNotif, ...prev];
    });
    setTimeout(() => dismissNotification(newNotif.id), 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateStats = (messageLength: number) => {
      setUserStats(prev => {
          const newCount = prev.interactionCount + 1;
          const newSync = Math.min(100, prev.neuralSyncLevel + (Math.random() * 5));
          const newStage = Math.floor(newCount / 5) + 1;
          let alignment = prev.cognitiveAlignment;
          if (newCount % 10 === 0) alignment = Math.random() > 0.5 ? 'CHAOTIC' : 'LAWFUL';
          return {
              interactionCount: newCount,
              neuralSyncLevel: newSync,
              evolutionStage: newStage,
              cognitiveAlignment: alignment
          };
      });
  };

  // -- Handlers --
  const handleTaskAdd = (task: Task) => {
    setTasks(prev => [...prev, task]);
    addNotification({title: 'DIRETRIZ CRIADA', message: `Tarefa "${task.title}" adicionada ao buffer.`, type: 'SUCCESS'});
    addLog('TASK_CREATE', `Nova diretriz: ${task.title}`, 'TASK');
  };
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (updatedTask.completed) addLog('TASK_COMPLETE', `Diretriz finalizada: ${updatedTask.title}`, 'TASK');
  };
  const handleTaskDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addNotification({title: 'EXPURGO', message: 'Diretriz removida da memória.', type: 'WARNING'});
    addLog('TASK_DELETE', `Diretriz expurgada: ID ${id}`, 'TASK');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: input,
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);
    updateStats(input.length);
    addLog('USER_INPUT', 'Comando enviado para processamento.', 'SYSTEM');

    const history = messages.map(m => ({
        role: m.role === Role.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

    if (status === ConnectionStatus.OFFLINE) {
        setTimeout(() => {
             const offlineMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.MODEL,
                text: "CONEXÃO COM A NUVEM PERDIDA. Operando em modo de segurança offline.",
                timestamp: new Date(),
                read: true
             };
             setMessages(prev => [...prev, offlineMsg]);
             setIsProcessing(false);
             addLog('ERROR', 'Falha ao processar: Offline.', 'NETWORK');
        }, 1000);
        return;
    }

    const aiResponseText = await generateCoreResponse(userMsg.text, history);

    setMessages(prev => prev.map(m => m.id === userMsg.id ? {...m, read: true} : m));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: Role.MODEL,
      text: aiResponseText,
      timestamp: new Date(),
      read: true
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsProcessing(false);
    addLog('AI_RESPONSE', 'Resposta neural recebida.', 'SYSTEM');
  };

  const handleClearHistory = () => {
      setSystemLogs([]);
      localStorage.removeItem('neuro_system_logs');
      addNotification({ title: 'LOGS APAGADOS', message: 'Histórico do sistema limpo.', type: 'WARNING' });
  };

  return (
    <div 
        className="flex flex-col h-full w-full relative z-10 font-medium tracking-wide transition-all duration-1000 ease-in-out"
        style={{ filter: `hue-rotate(${themeHue}deg)` }}
    >
      {/* GLOBAL CRT OVERLAY */}
      <div className="crt-overlay pointer-events-none"></div>

      <NotificationSystem notifications={notifications} onDismiss={dismissNotification} />

      {/* Header */}
      <header className="h-16 border-b border-cyan-500/30 bg-black/40 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-20 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_#22d3ee] transition-colors duration-300 ${isProcessing ? 'bg-red-500 animate-ping' : 'bg-cyan-400 animate-pulse'}`}></div>
            <h1 className="text-xl md:text-2xl font-bold text-cyan-100 tracking-[0.2em] glitch-hover cursor-default">{APP_NAME}</h1>
        </div>
        
        {/* Desktop Tabs */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 flex gap-4">
             {['CHAT', 'TASKS', 'PROFILE', 'LOGS'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab as TabView)}
                 className={`px-4 py-1 text-xs font-bold tracking-[0.2em] transition-all border-b-2 hover:scale-110 ${activeTab === tab ? 'text-cyan-400 border-cyan-400 shadow-[0_10px_20px_-10px_rgba(6,182,212,0.5)]' : 'text-gray-500 border-transparent hover:text-cyan-200'}`}
               >
                 {tab === 'TASKS' ? 'DIRETRIZES' : tab === 'PROFILE' ? 'PERFIL' : tab === 'LOGS' ? 'HISTÓRICO' : 'COMANDO'}
               </button>
             ))}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
             <button 
                onClick={() => setShowMonitor(!showMonitor)}
                className="p-2 border border-purple-500/50 text-purple-400 rounded hover:bg-purple-900/20 transition-all md:hidden animate-pulse"
                aria-label="Toggle Monitor"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
             </button>

             <div className={`px-2 py-1 md:px-3 rounded border text-[10px] md:text-xs font-bold tracking-widest transition-all ${
                 status === ConnectionStatus.ONLINE 
                 ? 'border-green-500/50 text-green-400 bg-green-900/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                 : 'border-red-500/50 text-red-400 bg-red-900/20 animate-pulse'
             }`}>
                 {status === ConnectionStatus.ONLINE ? 'ONLINE' : 'OFF'}
             </div>
             <button 
                onClick={onLogout}
                className="text-xs text-cyan-600 hover:text-cyan-300 uppercase hover:underline decoration-cyan-500 underline-offset-4 transition-all"
             >
                SAIR
             </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 overflow-hidden relative flex flex-row w-full pb-[56px] md:pb-0">
        
        {/* Content Column */}
        <div className="flex-1 flex flex-col h-full relative">
            
            {activeTab === 'PROFILE' ? (
                <ProfileModule 
                    currentThemeHue={themeHue}
                    onThemeChange={(h) => { setThemeHue(h); addLog('THEME_CHANGE', `Cor do sistema ajustada: ${h}`, 'SYSTEM'); }}
                    onShowNotification={(title, message) => addNotification({ title, message, type: 'SUCCESS' })}
                />
            ) : activeTab === 'TASKS' ? (
              <TaskModule 
                tasks={tasks} 
                onAddTask={handleTaskAdd} 
                onUpdateTask={handleTaskUpdate}
                onDeleteTask={handleTaskDelete}
              />
            ) : activeTab === 'LOGS' ? (
                // --- NEW HISTORY LOG VIEW ---
                <div className="flex flex-col h-full p-4 md:p-8 animate-[fadeIn_0.5s]">
                    <div className="flex justify-between items-center mb-6 border-b border-cyan-500/30 pb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-cyan-100 tracking-[0.2em] neon-text">REGISTROS DO SISTEMA</h2>
                        <button 
                            onClick={handleClearHistory}
                            className="text-[10px] bg-red-900/20 border border-red-500/50 text-red-400 px-3 py-1 rounded hover:bg-red-900/50 transition-colors"
                        >
                            LIMPAR HISTÓRICO
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                        {systemLogs.length === 0 && <p className="text-gray-500 text-sm italic">Nenhum registro encontrado.</p>}
                        {systemLogs.map((log) => (
                            <div key={log.id} className="grid grid-cols-[80px_1fr_100px] gap-4 p-3 rounded bg-black/40 border border-gray-800 hover:border-cyan-500/30 transition-colors items-center text-xs md:text-sm font-mono">
                                <span className={`uppercase font-bold ${
                                    log.category === 'SECURITY' ? 'text-red-400' :
                                    log.category === 'TASK' ? 'text-yellow-400' :
                                    log.category === 'NETWORK' ? 'text-green-400' : 'text-cyan-400'
                                }`}>{log.category}</span>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-200">{log.action}</span>
                                    <span className="text-gray-500 text-[10px] md:text-xs">{log.details}</span>
                                </div>
                                <span className="text-right text-gray-600 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 scrollbar-hide">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out] gap-2 md:gap-3`}>
                            
                            {/* AI Avatar */}
                            {msg.role === Role.MODEL && (
                                <div className={`w-6 h-6 md:w-8 md:h-8 rounded border border-purple-500/50 bg-black/50 flex items-center justify-center shrink-0 mt-1 ${isProcessing ? 'animate-spin' : ''}`}>
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rotate-45 animate-pulse"></div>
                                </div>
                            )}

                            <div className={`max-w-[85%] md:max-w-[75%] group relative hover:scale-[1.01] transition-transform`}>
                                <div className={`p-3 md:p-5 rounded-lg backdrop-blur-sm border relative overflow-hidden ${
                                    msg.role === Role.USER 
                                    ? 'bg-cyan-900/10 border-cyan-500/40 text-cyan-50 rounded-tr-sm' 
                                    : 'bg-black/40 border-purple-500/20 text-gray-200 rounded-tl-sm shadow-[0_0_30px_rgba(168,85,247,0.05)]'
                                }`}>
                                    {/* Scanline decoration on messages */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"></div>
                                    
                                    <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1 flex justify-between items-center relative z-10">
                                        <span>{msg.role === Role.USER ? 'Comando' : 'Núcleo'}</span>
                                        <div className="flex items-center gap-2">
                                            <span>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                    <div className="markdown-body text-sm md:text-lg leading-relaxed font-normal whitespace-pre-wrap relative z-10">
                                        {msg.text}
                                    </div>
                                </div>
                            </div>

                            {/* User Avatar */}
                            {msg.role === Role.USER && (
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded border border-cyan-500/50 bg-black/50 flex items-center justify-center shrink-0 mt-1">
                                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-cyan-500 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {isProcessing && (
                        <div className="flex justify-start pl-8 md:pl-11">
                            <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 flex items-center gap-3 animate-pulse">
                                <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                                </div>
                                <span className="text-[10px] text-cyan-400 uppercase tracking-widest animate-flicker">Sincronizando Resposta...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-2 md:p-6 md:pt-0 bg-gradient-to-t from-black via-black/90 to-transparent shrink-0">
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full md:rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 ${isProcessing ? 'animate-pulse' : ''}`}></div>
                        <div className="relative flex items-center bg-black rounded-full md:rounded-lg">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full bg-transparent text-cyan-50 px-4 py-3 md:p-4 focus:outline-none placeholder-gray-600 font-medium text-sm md:text-lg rounded-full md:rounded-lg"
                                placeholder="Insira comando..."
                                autoFocus
                            />
                            <button 
                                type="submit"
                                disabled={isProcessing || !input.trim()}
                                className="p-3 md:p-4 text-cyan-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 md:w-6 md:h-6 transform rotate-90 ${isProcessing ? 'animate-spin' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
              </>
            )}
        </div>

        {/* Neural Monitor Side Panel (Mobile Overlay) */}
        <div className={`
            fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-opacity duration-300 md:hidden
            ${showMonitor ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `} onClick={() => setShowMonitor(false)} />

        <div className={`
            fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-black/95 backdrop-blur-xl border-l border-cyan-900/50 transform transition-transform duration-300 ease-out z-50
            md:relative md:transform-none md:bg-transparent md:backdrop-blur-none md:w-96 md:border-l-0
            ${showMonitor ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
            <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none"></div>

                {/* Mobile Close Button */}
                <div className="flex justify-between items-center md:hidden border-b border-gray-800 pb-4">
                    <span className="text-cyan-400 font-bold uppercase tracking-widest animate-pulse">Monitor do Sistema</span>
                    <button onClick={() => setShowMonitor(false)} className="text-gray-400 p-1 rounded-full hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Neural Visualizer - Synced with processing */}
                <div className="space-y-2">
                    <NeuralNetworkGraph isActive={isProcessing} />
                    <p className={`text-[9px] uppercase text-right transition-colors ${isProcessing ? 'text-red-400 font-bold' : 'text-cyan-700'}`}>
                        {isProcessing ? '>> ATIVIDADE NEURAL INTENSA <<' : 'Visualização em Tempo Real'}
                    </p>
                </div>

                {/* Dynamic User Profile Widget */}
                <UserProfile 
                    profile={{ username: 'OPERADOR', accessLevel: 'OMEGA' }} 
                    stats={userStats} 
                />

                {/* Logs Preview */}
                <div className="flex-1 bg-black/40 border border-gray-800 rounded-lg p-4 font-mono text-[10px] text-green-400/70 overflow-hidden flex flex-col relative group">
                    <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none animate-pulse"></div>
                    <div className="uppercase tracking-widest text-gray-500 mb-2 border-b border-gray-800 pb-1 flex justify-between">
                        <span>Terminal Output</span>
                        <span className="animate-blink">_</span>
                    </div>
                    <div className="space-y-1 overflow-y-auto flex-1 scrollbar-hide">
                        {systemLogs.slice(0, 8).map(log => (
                            <p key={log.id}>> {log.action}: {log.details.substring(0, 30)}...</p>
                        ))}
                        {isProcessing && <p className="text-cyan-400 animate-pulse">> Processando entrada de dados...</p>}
                    </div>
                </div>

            </div>
        </div>

      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-[56px] bg-black/90 backdrop-blur-xl border-t border-cyan-900/40 flex items-center justify-around z-30 pb-[env(safe-area-inset-bottom)]">
          {[
              { id: 'CHAT', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /> },
              { id: 'TASKS', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.091-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /> },
              { id: 'PROFILE', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> },
              { id: 'LOGS', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> },
          ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabView)}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === item.id ? 'text-cyan-400' : 'text-gray-600 hover:text-gray-400'}`}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    {item.icon}
                  </svg>
                  <span className="text-[10px] font-bold tracking-widest mt-1">
                    {item.id === 'TASKS' ? 'MISSÕES' : item.id === 'PROFILE' ? 'PERFIL' : item.id === 'LOGS' ? 'LOGS' : 'CHAT'}
                  </span>
              </button>
          ))}
      </nav>
      
      {/* Background Effect synced with state via a sneaky portal or just simple overlay - WAIT, App.tsx renders background. 
          To make the background REACT to Dashboard state without refactoring App.tsx completely, 
          we can render a SECOND transparent canvas here or just trust the visual feedback we added to the Graph and UI is enough?
          The user asked to sync animations. 
          I will modify the NeurologicalBackground import to be rendered HERE inside dashboard if possible, 
          BUT App.tsx renders it. 
          
          Correct approach: Render a localized 'activity' layer or use the existing background in App.tsx. 
          Since I cannot change App.tsx props easily without breaking the Login flow (Login doesn't have isProcessing), 
          I will render a specific "Active Mode" background layer here that overlays the main one when processing.
      */}
      {isProcessing && (
         <div className="fixed inset-0 -z-5 pointer-events-none">
             <NeurologicalBackground hue={themeHue + 180} brightness={0.5} activityLevel="HIGH" />
         </div>
      )}
    </div>
  );
};

export default Dashboard;