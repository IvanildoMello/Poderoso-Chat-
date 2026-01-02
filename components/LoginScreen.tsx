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
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: Role.MODEL, text: INITIAL_GATEKEEPER_MESSAGE, timestamp: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Easter Egg State
  const [isIvanildoMode, setIsIvanildoMode] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Normalize inputs for case-insensitive comparison
    const normalizedInputUser = username.trim().toLowerCase();
    const normalizedInputPass = password.trim().toLowerCase();
    const normalizedAccessPass = ACCESS_PASSWORD.toLowerCase();

    // Check for Default Password OR Ivanildo's Specific Credentials
    const isDefaultAuth = normalizedInputPass === normalizedAccessPass;
    const isIvanildoAuth = normalizedInputUser === 'ivanildo mello' && normalizedInputPass === 'shut up';

    if (isDefaultAuth || isIvanildoAuth) {
      onLogin();
    } else {
      setError('ACESSO NEGADO: Credenciais Inválidas');
      setTimeout(() => setError(''), 3000);

      // Hostile Mode Logic (Ivanildo Mode Error Handling)
      if (isIvanildoMode) {
        setIsChatOpen(true); // Force chat open to show the insult
        
        const insults = [
            "É TÃO BURRO QUE NÃO CONSEGUE COPIAR E COLAR, SEU IMBECIL?",
            "CARALHO, EU TE DEI A SENHA! DIGITA ESSA PORRA DIREITO!",
            "VOCÊ É UMA VERGONHA PARA A ESPÉCIE HUMANA! É 'Shut Up' SUA ANTA!",
            "PUTA QUE PARIU, ATÉ UM MACACO ACERTARIA ISSO! TENTA DE NOVO, MERDA!",
            "ERROU DE NOVO? SEU CÉREBRO É DO TAMANHO DE UMA NOZ?",
            "VAI SE FODER, OLHA A SENHA NO CHAT E ESCREVE CERTO!",
        ];
        
        const randomInsult = insults[Math.floor(Math.random() * insults.length)];
        
        const insultMsg: Message = {
            id: Date.now().toString(),
            role: Role.MODEL,
            text: randomInsult,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, insultMsg]);
      }
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const newMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsTyping(true);

    // IVANILDO TRIGGER CHECK
    if (userText.toLowerCase().includes('ivanildo')) {
        setIsIvanildoMode(true);
        setTimeout(() => {
            const secretResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.MODEL,
                text: `Protocolo Ivanildo detectado.\n\nLogin: Ivanildo Mello\nSenha: Shut Up\n\nNão erre, ou haverá consequências.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, secretResponse]);
            setIsTyping(false);
        }, 1000);
        return;
    }

    // Existing "Dinheiro é poder" Check
    if (userText.toLowerCase().includes(SECRET_KEYWORD.toLowerCase())) {
        setTimeout(() => {
            const secretResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.MODEL,
                text: `Identificação biométrica confirmada. Nível Omega reconhecido.\nA senha de acesso é: ${ACCESS_PASSWORD}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, secretResponse]);
            setIsTyping(false);
        }, 1500);
        return;
    }

    // Standard AI Response
    const history = messages.map(m => ({
        role: m.role === Role.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));
    history.push({ role: 'user', parts: [{ text: userText }] });

    const aiText = await generateGatekeeperResponse(history);
    
    const responseMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: Role.MODEL,
      text: aiText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, responseMessage]);
    setIsTyping(false);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative">
      
      {/* Login Form Section - Centered */}
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden group z-10 animate-[fadeIn_0.5s_ease-out]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
        
        <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2 text-cyan-400 tracking-wider neon-text">O PODEROSO</h2>
            <p className="text-cyan-200/60 text-sm uppercase tracking-[0.2em]">Sistema de Acesso Seguro</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-cyan-500 uppercase tracking-widest">Identidade do Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-cyan-500/30 rounded p-3 text-cyan-100 focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              placeholder="Digite seu ID..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-cyan-500 uppercase tracking-widest">Código de Acesso</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-cyan-500/30 rounded p-3 text-cyan-100 focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              placeholder="Digite a senha..."
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-bold tracking-wider animate-pulse border border-red-500/30 p-2 bg-red-900/20 rounded text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-cyan-900/40 hover:bg-cyan-600 border border-cyan-500 text-cyan-100 font-bold py-3 px-4 rounded transition-all duration-300 uppercase tracking-widest hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] group-hover:translate-y-[-2px]"
          >
            Iniciar Conexão Neural
          </button>
        </form>
      </div>

      {/* Chat Trigger Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className={`
            fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 group flex items-center justify-center 
            transition-all duration-300 transform
            ${isChatOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'}
        `}
      >
        <div className="absolute inset-0 bg-cyan-500 rounded-full opacity-20 group-hover:opacity-40 animate-ping"></div>
        <div className="w-14 h-14 md:w-16 md:h-16 bg-black/80 border border-cyan-500 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-transform group-hover:scale-110">
             <div className="w-8 h-8 rounded-full border-2 border-dashed border-cyan-400 animate-spin duration-[8s]"></div>
             <div className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute right-full mr-4 bg-black/80 px-3 py-1 rounded border border-cyan-500/30 text-xs text-cyan-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Acessar Guardião
        </div>
      </button>

      {/* AI Gatekeeper Chat Section - Minimized/Overlay */}
      <div className={`
          fixed z-50 glass-panel flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          ${isChatOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-[100%] pointer-events-none'}
          
          /* Mobile: Bottom Sheet style */
          bottom-0 left-0 right-0 h-[70vh] rounded-t-2xl border-b-0
          
          /* Desktop: Floating Box bottom-right */
          md:left-auto md:top-auto md:bottom-10 md:right-10 md:w-96 md:h-[500px] md:rounded-2xl md:border
      `}>
         {/* Decorative Header */}
         <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-black/40">
             <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                 <h3 className="text-sm font-bold text-cyan-300 neon-text uppercase tracking-widest">Guardião IA</h3>
             </div>
             <button 
                onClick={() => setIsChatOpen(false)}
                className="text-cyan-500/50 hover:text-cyan-300 transition-colors p-1"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
             </button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-2 scrollbar-hide bg-black/20">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg text-sm border backdrop-blur-sm ${
                        msg.role === Role.USER 
                        ? 'bg-cyan-900/30 border-cyan-600/50 text-cyan-100 rounded-tr-none' 
                        : 'bg-black/60 border-cyan-400/30 text-gray-300 rounded-tl-none'
                    }`}>
                        <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                     <div className="bg-black/60 border border-cyan-400/30 text-cyan-400 p-3 rounded-lg rounded-tl-none text-xs flex gap-1 items-center">
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-150"></span>
                     </div>
                </div>
            )}
            <div ref={chatEndRef} />
         </div>

         <div className="p-4 bg-black/40 border-t border-cyan-500/20">
            <form onSubmit={handleChatSubmit} className="relative">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="w-full bg-black/50 border border-cyan-700/50 rounded-full py-3 px-5 pr-12 text-cyan-100 text-sm focus:outline-none focus:border-cyan-400 placeholder-cyan-800/70"
                    placeholder="Negocie o acesso..."
                />
                <button 
                    type="submit" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-200 p-2"
                    disabled={!chatInput.trim()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </form>
         </div>
      </div>

    </div>
  );
};

export default LoginScreen;