import React, { useRef, useEffect } from 'react';

interface NeurologicalBackgroundProps {
  hue: number;
  brightness: number;
  activityLevel?: 'NORMAL' | 'HIGH'; // New prop to sync with processing
}

const NeurologicalBackground: React.FC<NeurologicalBackgroundProps> = ({ hue, brightness, activityLevel = 'NORMAL' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const activityRef = useRef(activityLevel);

  // Sync ref with prop for use inside animation loop
  useEffect(() => {
    activityRef.current = activityLevel;
  }, [activityLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId: number;

    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const particleCount = 90; 
    const connectionDistance = 160;
    const mouseConnectionDistance = 250;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseSize: number;
      size: number;
      pulseSpeed: number;
      angle: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.baseSize = Math.random() * 2 + 1;
        this.size = this.baseSize;
        this.pulseSpeed = 0.02 + Math.random() * 0.03;
        this.angle = Math.random() * Math.PI * 2;
      }

      update() {
        // Dynamic speed based on activity level
        const speedMultiplier = activityRef.current === 'HIGH' ? 4.0 : 1.0;
        
        this.x += this.vx * speedMultiplier;
        this.y += this.vy * speedMultiplier;

        // Bounce off walls
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Pulse Animation (faster when active)
        this.angle += this.pulseSpeed * speedMultiplier;
        this.size = this.baseSize + Math.sin(this.angle) * 0.5;

        // Jitter effect when high activity
        if (activityRef.current === 'HIGH') {
            this.x += (Math.random() - 0.5) * 2;
            this.y += (Math.random() - 0.5) * 2;
        }

        // Mouse avoidance/attraction
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < mouseConnectionDistance) {
           this.x += dx * 0.005 * speedMultiplier;
           this.y += dy * 0.005 * speedMultiplier;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
        
        // Color shift based on activity
        const color = activityRef.current === 'HIGH' ? `rgba(200, 255, 255, 0.8)` : `rgba(0, 255, 255, 0.6)`;
        
        ctx.fillStyle = color;
        ctx.shadowBlur = activityRef.current === 'HIGH' ? 15 : 8;
        ctx.shadowColor = `rgba(0, 255, 255, 0.4)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      
      const gradient = ctx.createRadialGradient(
          width / 2, height / 2, 0,
          width / 2, height / 2, width
      );
      gradient.addColorStop(0, '#050a15');
      gradient.addColorStop(1, '#000000');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw Connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        const mouseDx = mouseRef.current.x - p1.x;
        const mouseDy = mouseRef.current.y - p1.y;
        const mouseDist = Math.sqrt(mouseDx*mouseDx + mouseDy*mouseDy);

        if (mouseDist < mouseConnectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = activityRef.current === 'HIGH' 
                ? `rgba(100, 255, 255, ${1 - mouseDist / mouseConnectionDistance})`
                : `rgba(0, 255, 255, ${1 - mouseDist / mouseConnectionDistance})`;
            ctx.lineWidth = activityRef.current === 'HIGH' ? 1.5 : 0.8;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.stroke();
        }

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 255, 255, ${(1 - distance / connectionDistance) * 0.4})`;
            ctx.lineWidth = 0.3;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = () => {
        // Shockwave effect on click
        particles.forEach(p => {
            const dx = p.x - mouseRef.current.x;
            const dy = p.y - mouseRef.current.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 300) {
                const angle = Math.atan2(dy, dx);
                const force = (300 - dist) / 10;
                p.vx += Math.cos(angle) * force;
                p.vy += Math.sin(angle) * force;
            }
        });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('resize', handleResize);

    init();
    animate();

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      init();
    };

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    }
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 transition-all duration-[1000ms] ease-in-out" 
      style={{
        filter: `hue-rotate(${hue}deg) brightness(${brightness})`
      }}
    />
  );
};

export default NeurologicalBackground;