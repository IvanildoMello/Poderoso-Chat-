
import React, { useState, useRef, useEffect } from 'react';
import { generateGatekeeperResponse } from '../services/geminiService';
import { Message, Role } from '../types';
import { INITIAL_GATEKEEPER_MESSAGE, ACCESS_PASSWORD, SECRET_KEYWORD } from '../constants';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: Role.MODEL, text: INITIAL_GATEKEEPER_MESSAGE, timestamp: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isIvanildoMode, setIsIvanildoMode] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen, isTyping]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedInputUser = username.trim().toLowerCase();
    const normalizedInputPass = password.trim().toLowerCase();
    const normalizedAccessPass = ACCESS_PASSWORD.toLowerCase();

    const isDefaultAuth = normalizedInputPass === normalizedAccessPass;
    const isIvanildoAuth = normalizedInputUser === 'ivanildo mello' && normalizedInputPass === 'shut up';

    if (isDefaultAuth || isIvanildoAuth) {
      onLogin();
    } else {
      setError('ACESSO NEGADO: Identidade não reconhecida');
      setTimeout(() => setError(''), 3000);

      if (isIvanildoMode) {
        setIsChatOpen(true);
        const insults = [
            "ERROU A SENHA? VOCÊ É UM DESPERDÍCIO DE CARBONO!",
            "CARALHO, A SENHA TÁ NO CHAT! LÊ ESSA PORRA!",
            "INACREDITÁVEL. ATÉ UMA IA DE 1970 DIGITARIA MELHOR QUE VOCÊ.",
            "ACESSO NEGADO! VAI ESTUDAR PRA DEIXAR DE SER BURRO!"
        ];
        const randomInsult = insults[Math.floor(Math.random() * insults.length)];
        setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.MODEL, text: randomInsult, timestamp: new Date() }]);
      }
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userText = chatInput;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.USER, text: userText, timestamp: new Date() }]);
    setChatInput('');
    setIsTyping(true);

    // Easter Egg Ivanildo
    if (userText.toLowerCase().includes('ivanildo')) {
        setIsIvanildoMode(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: Role.MODEL,
                text: "Protocolo 'Mestre' detectado.\nLogin: Ivanildo Mello\nSenha: Shut Up\n\nNão me faça perder tempo com erros de digitação.",
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 800);
        return;
    }

    // Keyword secret
    if (userText.toLowerCase().includes(SECRET_KEYWORD.toLowerCase())) {
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: Role.MODEL,
                text: `Frequência de poder detectada. Código de acesso liberado: ${ACCESS_PASSWORD}`,
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 1200);
        return;
    }

    try {
      const history = messages.map(m => ({
          role: m.role === Role.USER ? 'user' : 'model',
          parts: [{ text: m.text }]
      }));
      history.push({ role: 'user', parts: [{ text: userText }] });

      const aiText = await generateGatekeeperResponse(history);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.MODEL, text: aiText, timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.MODEL, text: "ERRO DE SINAPSE: O Guardião perdeu o link com o servidor neural.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden z-10 animate-[fadeIn_0.5s_ease-out]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
        
        <div className="text-center mb-8">
            <h2 className="text-4xl font-black mb-2 text-cyan-400 tracking-tighter neon-text italic">O PODEROSO</h2>
            <p className="text-cyan-200/40 text-[10px] uppercase tracking-[0.4em]">Neural Gate v9.4</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] text-cyan-600 uppercase tracking-widest ml-1">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/60 border border-cyan-900 rounded-lg p-3 text-cyan-100 focus:border-cyan-400 focus:outline-none transition-all font-mono"
              placeholder="ID_OPERADOR"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] text-cyan-600 uppercase tracking-widest ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-cyan-900 rounded-lg p-3 text-cyan-100 focus:border-cyan-400 focus:outline-none transition-all font-mono"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-500 text-[10px] font-bold tracking-widest animate-flicker border border-red-900/50 p-2 bg-red-900/10 rounded text-center uppercase">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-cyan-500/10 hover:bg-cyan-500 hover:text-black border border-cyan-500/50 text-cyan-400 font-bold py-3 rounded-lg transition-all duration-300 uppercase tracking-[0.2em] text-xs shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            Acessar Interface
          </button>
        </form>
      </div>

      <button 
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${isChatOpen ? 'scale-0' : 'scale-100'}`}
      >
        <div className="w-14 h-14 bg-black border border-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-avatar-breath">
             <div className="w-6 h-6 border-2 border-cyan-400 rounded-sm rotate-45 animate-spin"></div>
        </div>
      </button>

      <div className={`fixed z-50 glass-panel flex flex-col transition-all duration-500 bottom-0 left-0 right-0 md:left-auto md:right-10 md:bottom-10 md:w-96 md:h-[550px] md:rounded-2xl ${isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
         <div className="p-4 border-b border-cyan-900 flex justify-between items-center bg-black/60">
             <span className="text-[10px] font-bold text-cyan-400 tracking-[0.3em] uppercase">Guardião_V3</span>
             <button onClick={() => setIsChatOpen(false)} className="text-cyan-800 hover:text-cyan-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
             </button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40 scrollbar-hide">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-3 rounded-xl text-xs border ${msg.role === Role.USER ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-100' : 'bg-black border-white/5 text-gray-400'}`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isTyping && <div className="text-[9px] text-cyan-500 animate-pulse ml-2 font-mono">ANALISANDO_INTENÇÃO...</div>}
            <div ref={chatEndRef} />
         </div>

         <div className="p-4 border-t border-cyan-900 bg-black/60">
            <form onSubmit={handleChatSubmit} className="relative">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="w-full bg-black border border-cyan-900 rounded-full py-2 px-4 pr-10 text-cyan-100 text-xs focus:border-cyan-400 focus:outline-none"
                    placeholder="Tente negociar..."
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 rotate-90"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default LoginScreen;
