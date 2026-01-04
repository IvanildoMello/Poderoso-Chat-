import React, { useState, useRef, useEffect } from 'react';
import { UserProfileDetails } from '../types';
import { db, getUserProfile, saveUserProfile } from '../services/db';

interface ProfileModuleProps {
  currentThemeHue: number;
  onThemeChange: (hue: number) => void;
  onShowNotification?: (title: string, message: string) => void;
  onSyncTrigger: () => void;
}

const DEFAULT_BIO = `Sou Ivanildo, desenvolvedor de software com foco em soluções digitais modernas, automação e integração com inteligência artificial. Tenho experiência em estruturar aplicações funcionais, escaláveis e orientadas à experiência do usuário.
Meu objetivo é utilizar IA para otimizar processos, gerar valor real e transformar ideias em produtos digitais eficientes.`;

const THEMES = [
  { name: 'NEON CYAN', hue: 0, color: '#06b6d4' },
  { name: 'MATRIX GREEN', hue: 240, color: '#22c55e' }, 
  { name: 'ROYAL PURPLE', hue: 50, color: '#a855f7' }, 
  { name: 'CRIMSON RED', hue: 140, color: '#ef4444' }, 
  { name: 'GOLDEN DATA', hue: 170, color: '#eab308' }, 
];

const ProfileModule: React.FC<ProfileModuleProps> = ({ currentThemeHue, onThemeChange, onShowNotification, onSyncTrigger }) => {
  const [profile, setProfile] = useState<UserProfileDetails>({
      name: 'Ivanildo Mello',
      bio: DEFAULT_BIO,
      avatarUrl: null,
      coverImageUrl: null,
      githubUrl: '',
      linkedinUrl: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(15);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Typing Effect State
  const [displayedBio, setDisplayedBio] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Load from DB
  useEffect(() => {
      const load = async () => {
          const p = await getUserProfile();
          if (p) {
              setProfile(p);
          }
          const speedSetting = await db.settings.get('typing_speed' as any);
          if (speedSetting) {
            setTypingSpeed(speedSetting.value);
          }
      };
      load();
  }, []);

  // Save typing speed to DB
  const handleSpeedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value);
    setTypingSpeed(newSpeed);
    await db.settings.put({ id: 'typing_speed', value: newSpeed });
  };

  // Save to DB when profile changes
  const saveToDB = async (newProfile: UserProfileDetails) => {
      await saveUserProfile(newProfile);
      setProfile(newProfile);
      onSyncTrigger();
  }

  // Typing Effect Logic
  useEffect(() => {
    if (isEditing) {
      setDisplayedBio(profile.bio);
      setIsTypingComplete(true);
      return;
    }

    setDisplayedBio('');
    setIsTypingComplete(false);
    let currentIndex = 0;
    const fullText = profile.bio;
    
    const intervalId = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedBio(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(intervalId);
      }
    }, typingSpeed);

    return () => clearInterval(intervalId);
  }, [profile.bio, isEditing, typingSpeed]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newProfile = { ...profile, avatarUrl: reader.result as string };
        saveToDB(newProfile);
        if (onShowNotification) onShowNotification("IMAGEM ATUALIZADA", "Avatar reprocessado com sucesso.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newProfile = { ...profile, avatarUrl: null };
    saveToDB(newProfile);
    if (onShowNotification) onShowNotification("AVATAR REMOVIDO", "Restaurado para o padrão do sistema.");
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newProfile = { ...profile, coverImageUrl: reader.result as string };
        saveToDB(newProfile);
        if (onShowNotification) onShowNotification("AMBIENTE ATUALIZADO", "Fundo personalizado aplicado.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCover = () => {
    const newProfile = { ...profile, coverImageUrl: null };
    saveToDB(newProfile);
    if (onShowNotification) onShowNotification("FUNDO RESTAURADO", "Grade holográfica padrão ativada.");
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      if (onShowNotification) {
        onShowNotification('LINK COPIADO', 'URL do perfil transferida para área de transferência.');
      }
    });
  };

  const handleSaveText = () => {
      saveToDB(profile); 
      setIsEditing(false);
  }

  const primaryColor = `hsl(${currentThemeHue}, 100%, 50%)`; 
  const secondaryColor = `hsl(${currentThemeHue + 60}, 100%, 40%)`; 

  return (
    <div 
        className="flex flex-col h-full overflow-y-auto scrollbar-hide p-4 md:p-8 max-w-4xl mx-auto w-full animate-[fadeIn_0.5s_ease-out] relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-1000 ease-in-out group/module pb-20 md:pb-8"
        style={{
            '--dynamic-primary': primaryColor,
            '--dynamic-secondary': secondaryColor
        } as React.CSSProperties}
    >
      <div 
        className="absolute inset-0 -z-30 animate-gradient opacity-40 transition-colors duration-1000 ease-in-out"
        style={{
            backgroundImage: `linear-gradient(-45deg, var(--dynamic-secondary), #000000, var(--dynamic-primary))`
        }}
      />
      
      {profile.coverImageUrl && (
          <div 
            className="absolute inset-0 -z-20 bg-cover bg-center transition-opacity duration-700 opacity-50 mix-blend-overlay animate-ken-burns"
            style={{ backgroundImage: `url(${profile.coverImageUrl})` }}
          />
      )}
      
      <div className="absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 -z-10 bg-black/60 backdrop-blur-[2px]" />

      <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-white/10 pb-4 relative z-10">
        <h2 className="text-xl md:text-2xl font-bold text-cyan-100 tracking-[0.2em] neon-text">
          IDENTIDADE
        </h2>
        
        <div className="flex gap-2 items-center">
            {profile.coverImageUrl && (
                <button 
                    onClick={handleRemoveCover}
                    className="p-1.5 text-red-400 hover:text-red-200 border border-red-500/30 rounded bg-red-900/10 hover:bg-red-900/30 transition-all"
                    title="Remover Fundo Personalizado"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
            <button 
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-500/70 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-400 bg-cyan-900/10 hover:bg-cyan-900/30 px-3 py-1.5 rounded transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                title="Alterar Imagem de Fundo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="hidden md:inline">Fundo</span>
            </button>
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />

            <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-500 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 bg-cyan-900/10 hover:bg-cyan-900/30 px-3 py-1.5 rounded transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                title="Copiar Link do Perfil"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
                <span className="hidden md:inline">Compartilhar</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-cyan-500/30 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)] bg-black/40 relative z-10 transition-all duration-500 animate-avatar-breath group-hover:animate-none group-hover:shadow-[0_0_60px_rgba(6,182,212,0.8)] group-hover:border-cyan-400 group-hover:scale-105">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-cyan-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-cyan-400 mb-2 animate-bounce">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Alterar Foto</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            <div className="absolute -inset-4 border border-dashed border-cyan-500/20 rounded-full animate-[spin_12s_linear_infinite] pointer-events-none group-hover:border-cyan-500/50"></div>
            {profile.avatarUrl && (
                <div className="absolute top-0 right-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <button onClick={handleRemoveAvatar} className="bg-red-900/80 p-1.5 rounded-full text-red-300 hover:text-white hover:bg-red-700 border border-red-500/50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
          </div>

          <div className="w-full bg-black/30 p-4 rounded-lg border border-white/10 backdrop-blur-sm shadow-lg">
            <h3 className="text-xs text-cyan-500 uppercase tracking-widest mb-3 text-center">Calibração Visual</h3>
            <div className="flex justify-center gap-3 flex-wrap mb-4">
              {THEMES.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => onThemeChange(theme.hue)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform duration-300 hover:scale-110 ${currentThemeHue === theme.hue ? 'border-white scale-110 shadow-[0_0_15px_white]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: theme.color }}
                  title={theme.name}
                />
              ))}
            </div>

            <div className="space-y-2 px-2">
                <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest">
                    <span>Velocidade de Processamento</span>
                    <span className="text-cyan-400 font-mono">{typingSpeed}ms</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5"
                  value={typingSpeed} 
                  onChange={handleSpeedChange}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="space-y-6">
              <div className="relative">
                 {isEditing ? (
                  <div className="space-y-1 animate-[fadeIn_0.3s]">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest block">Nome do Operador</label>
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full bg-black/50 border border-cyan-700 rounded p-2 text-xl text-cyan-100 font-bold focus:border-cyan-400 focus:outline-none"
                        autoFocus
                      />
                  </div>
                ) : (
                  <div className="flex justify-between items-end border-b border-cyan-500/30 pb-2">
                    <h1 className="text-2xl md:text-4xl font-bold text-white tracking-wide neon-text truncate max-w-[70%]">{profile.name}</h1>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="text-cyan-500 hover:text-cyan-300 text-[10px] md:text-xs uppercase tracking-widest bg-cyan-900/10 px-3 py-1 rounded border border-cyan-500/20 hover:border-cyan-400"
                    >
                        Editar Dados
                    </button>
                  </div>
                )}
              </div>

              <div className="group/bio relative">
                <div className={`bg-black/40 border border-cyan-500/20 rounded-lg p-6 relative backdrop-blur-md min-h-[160px] ${!isEditing ? 'hover:border-cyan-500/40 hover:bg-cyan-900/5' : ''}`}>
                    {!isEditing && (
                         <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none animate-scanline"></div>
                    )}
                    <div className="relative z-10">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Arquivo de Dados</label>
                        {isEditing ? (
                        <div className="animate-[fadeIn_0.3s]">
                            <textarea 
                                value={profile.bio}
                                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                className="w-full h-40 bg-black/50 border border-cyan-700 rounded p-3 text-gray-300 resize-none focus:border-cyan-400 focus:outline-none"
                            />
                            <div className="flex justify-end mt-2">
                                <button onClick={handleSaveText} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 px-6 rounded transition-all">SALVAR ALTERAÇÕES</button>
                            </div>
                        </div>
                        ) : (
                        <p className="text-base md:text-lg text-gray-300 font-light leading-relaxed whitespace-pre-wrap border-l-2 border-cyan-500/30 pl-4">
                            {displayedBio}
                            {!isTypingComplete && <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse align-middle"></span>}
                        </p>
                        )}
                    </div>
                </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 border border-gray-800 rounded-lg p-4 flex items-center gap-4 hover:border-gray-500 transition-all">
              <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </div>
              <div className="flex-1 overflow-hidden">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest block">GitHub</label>
                {isEditing ? (
                  <input type="text" value={profile.githubUrl} onChange={(e) => setProfile({...profile, githubUrl: e.target.value})} className="w-full bg-transparent border-b border-gray-700 text-sm text-cyan-300 focus:outline-none" />
                ) : (
                  profile.githubUrl ? <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-white truncate block text-sm">{profile.githubUrl.replace('https://', '')}</a> : <span className="text-gray-600 text-sm italic">Não vinculado</span>
                )}
              </div>
            </div>

            <div className="bg-black/40 border border-gray-800 rounded-lg p-4 flex items-center gap-4 hover:border-blue-500/50 transition-all">
              <div className="w-10 h-10 bg-blue-900/20 rounded flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </div>
              <div className="flex-1 overflow-hidden">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest block">LinkedIn</label>
                {isEditing ? (
                  <input type="text" value={profile.linkedinUrl} onChange={(e) => setProfile({...profile, linkedinUrl: e.target.value})} className="w-full bg-transparent border-b border-gray-700 text-sm text-cyan-300 focus:outline-none" />
                ) : (
                  profile.linkedinUrl ? <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-white truncate block text-sm">{profile.linkedinUrl.replace('https://', '')}</a> : <span className="text-gray-600 text-sm italic">Não vinculado</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModule;