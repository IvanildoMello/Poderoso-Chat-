import React, { useState } from 'react';
import { Task, TaskPriority } from '../types';

interface TaskModuleProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const TaskModule: React.FC<TaskModuleProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask.title) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: currentTask.title,
      description: currentTask.description || '',
      priority: (currentTask.priority as TaskPriority) || 'MEDIUM',
      dueDate: currentTask.dueDate || new Date().toISOString(),
      completed: false,
    };

    onAddTask(newTask);
    setCurrentTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
    setIsEditing(false);
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'CRITICAL': return 'text-red-500 border-red-500 bg-red-900/20';
      case 'HIGH': return 'text-orange-500 border-orange-500 bg-orange-900/20';
      case 'MEDIUM': return 'text-yellow-500 border-yellow-500 bg-yellow-900/20';
      case 'LOW': return 'text-green-500 border-green-500 bg-green-900/20';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 p-4 md:p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-cyan-500/20 pb-4">
        <h2 className="text-lg md:text-xl font-bold text-cyan-400 tracking-[0.2em]">DIRETRIZES OPERACIONAIS</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-cyan-900/30 hover:bg-cyan-700/50 border border-cyan-500 text-cyan-300 px-3 py-2 rounded uppercase text-[10px] md:text-xs tracking-widest transition-all"
        >
          {isEditing ? 'Cancelar' : '+ Nova'}
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="mb-6 bg-black/40 p-4 rounded border border-cyan-500/30 animate-[fadeIn_0.3s]">
          <div className="grid gap-3 md:gap-4">
            <input 
              type="text" 
              placeholder="Título da Missão" 
              className="w-full bg-black/50 border border-cyan-800 rounded p-2 text-cyan-100 focus:border-cyan-400 focus:outline-none placeholder-gray-600"
              value={currentTask.title}
              onChange={e => setCurrentTask({...currentTask, title: e.target.value})}
            />
            <textarea 
              placeholder="Parâmetros da execução..." 
              className="w-full bg-black/50 border border-cyan-800 rounded p-2 text-cyan-100 focus:border-cyan-400 focus:outline-none h-20 resize-none placeholder-gray-600"
              value={currentTask.description}
              onChange={e => setCurrentTask({...currentTask, description: e.target.value})}
            />
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <select 
                className="w-full bg-black/50 border border-cyan-800 rounded p-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                value={currentTask.priority}
                onChange={e => setCurrentTask({...currentTask, priority: e.target.value as TaskPriority})}
              >
                <option value="LOW">Baixa Prioridade</option>
                <option value="MEDIUM">Média Prioridade</option>
                <option value="HIGH">Alta Prioridade</option>
                <option value="CRITICAL">CRÍTICO</option>
              </select>
              <input 
                type="datetime-local" 
                className="w-full bg-black/50 border border-cyan-800 rounded p-2 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                value={currentTask.dueDate}
                onChange={e => setCurrentTask({...currentTask, dueDate: e.target.value})}
              />
            </div>
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)]">REGISTRAR DIRETRIZ</button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1 md:pr-2 pb-10 md:pb-0">
        {tasks.length === 0 && (
          <div className="text-center text-gray-500 mt-10 italic text-sm">Nenhuma diretriz ativa no banco de dados.</div>
        )}
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`
              p-4 rounded border backdrop-blur-sm transition-all group
              ${task.completed ? 'bg-gray-900/50 border-gray-700 opacity-60' : 'bg-cyan-900/10 border-cyan-500/30 hover:border-cyan-400'}
            `}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => onUpdateTask({...task, completed: !task.completed})}
                  className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${task.completed ? 'bg-cyan-500 border-cyan-500' : 'border-cyan-500/50 hover:border-cyan-400'}`}
                >
                  {task.completed && <span className="text-black text-xs font-bold">✓</span>}
                </button>
                <div className="min-w-0">
                  <h3 className={`font-bold truncate ${task.completed ? 'line-through text-gray-500' : 'text-cyan-100'}`}>{task.title}</h3>
                  <p className="text-xs md:text-sm text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                <span className={`text-[9px] md:text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'LOW' ? 'BAIXA' : task.priority === 'MEDIUM' ? 'MÉDIA' : task.priority === 'HIGH' ? 'ALTA' : 'CRÍTICO'}
                </span>
                <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="text-red-500/50 hover:text-red-400 text-xs uppercase opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                >
                  Expurgar
                </button>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-end border-t border-dashed border-gray-700 pt-2">
              <span className="text-[10px] text-gray-500">PRAZO: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskModule;