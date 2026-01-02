import React, { useRef, useEffect } from 'react';

interface NeuralNetworkGraphProps {
  isActive?: boolean; // New prop to sync with processing
}

const NeuralNetworkGraph: React.FC<NeuralNetworkGraphProps> = ({ isActive = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const layers = [4, 6, 6, 3];
    const neurons: Neuron[] = [];
    const signals: Signal[] = [];

    class Neuron {
      x: number;
      y: number;
      r: number;
      activation: number;
      layerIndex: number;

      constructor(x: number, y: number, layerIndex: number) {
        this.x = x;
        this.y = y;
        this.r = 4;
        this.activation = 0;
        this.layerIndex = layerIndex;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r + (this.activation * 3), 0, Math.PI * 2);
        
        const alpha = 0.3 + (this.activation * 0.7);
        // Turn red/orange if super active (high load simulation)
        const style = isActive && this.activation > 0.8 ? `rgba(255, 100, 100, ${alpha})` : `rgba(6, 182, 212, ${alpha})`;
        
        ctx.fillStyle = style;
        ctx.shadowBlur = this.activation * 15;
        ctx.shadowColor = isActive ? '#ff4444' : '#06b6d4';
        ctx.fill();
        ctx.shadowBlur = 0;

        this.activation = Math.max(0, this.activation - 0.05);
      }
    }

    class Signal {
      startNode: Neuron;
      endNode: Neuron;
      progress: number;
      speed: number;

      constructor(start: Neuron, end: Neuron) {
        this.startNode = start;
        this.endNode = end;
        this.progress = 0;
        this.speed = isActive ? 0.1 + Math.random() * 0.1 : 0.05 + Math.random() * 0.05; // Faster if active
      }

      update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
          this.endNode.activation = 1.0;
          return false;
        }
        return true;
      }

      draw() {
        if (!ctx) return;
        const cx = this.startNode.x + (this.endNode.x - this.startNode.x) * this.progress;
        const cy = this.startNode.y + (this.endNode.y - this.startNode.y) * this.progress;

        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#fff';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const init = () => {
      const layerSpacing = width / (layers.length + 1);
      layers.forEach((count, layerIdx) => {
        const x = layerSpacing * (layerIdx + 1);
        const verticalSpacing = height / (count + 1);
        for (let i = 0; i < count; i++) {
          const y = verticalSpacing * (i + 1);
          neurons.push(new Neuron(x, y, layerIdx));
        }
      });
    };

    const triggerSignals = () => {
        // Much higher probability of firing if active
        const probability = isActive ? 0.6 : 0.95;
        
        if (Math.random() > probability) {
            const sourceNeuron = neurons[Math.floor(Math.random() * (neurons.length - layers[layers.length-1]))];
            const nextLayerNeurons = neurons.filter(n => n.layerIndex === sourceNeuron.layerIndex + 1);
            
            if (nextLayerNeurons.length > 0) {
                const target = nextLayerNeurons[Math.floor(Math.random() * nextLayerNeurons.length)];
                signals.push(new Signal(sourceNeuron, target));
                sourceNeuron.activation = 1;
            }
        }
    };

    const drawConnections = () => {
        if (!ctx) return;
        ctx.lineWidth = 0.5;
        neurons.forEach(n1 => {
            neurons.forEach(n2 => {
                if (n2.layerIndex === n1.layerIndex + 1) {
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.strokeStyle = isActive ? 'rgba(255, 100, 100, 0.15)' : 'rgba(6, 182, 212, 0.1)';
                    ctx.stroke();
                }
            });
        });
    }

    init();

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      drawConnections();
      neurons.forEach(n => n.draw());
      for (let i = signals.length - 1; i >= 0; i--) {
        const alive = signals[i].update();
        signals[i].draw();
        if (!alive) signals.splice(i, 1);
      }
      triggerSignals();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
        if(canvasRef.current){
             width = canvasRef.current.offsetWidth;
             height = canvasRef.current.offsetHeight;
             canvasRef.current.width = width;
             canvasRef.current.height = height;
             neurons.length = 0;
             signals.length = 0;
             init();
        }
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]); // Re-run effect logic if active state changes (though canvas persists)

  return (
    <div className={`w-full h-48 bg-black/40 rounded-lg border relative overflow-hidden backdrop-blur-sm transition-colors duration-500 ${isActive ? 'border-red-500/30 shadow-[inset_0_0_20px_rgba(255,0,0,0.1)]' : 'border-cyan-500/20'}`}>
        <div className={`absolute top-2 left-3 text-[10px] uppercase tracking-widest z-10 transition-colors ${isActive ? 'text-red-400 animate-pulse' : 'text-cyan-500'}`}>
            Monitor de Rede Neural {isActive ? '(ATIVIDADE ELEVADA)' : '(STANDBY)'}
        </div>
        <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default NeuralNetworkGraph;