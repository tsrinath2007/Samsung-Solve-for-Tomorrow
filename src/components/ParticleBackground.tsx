import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    const mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2 };

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const draw = () => {
      // Smooth mouse interpolation
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Draw faint radial lights
      const gradient1 = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        10,
        mouse.x,
        mouse.y,
        350
      );
      gradient1.addColorStop(0, 'rgba(124, 58, 237, 0.04)');
      gradient1.addColorStop(1, 'rgba(5, 8, 22, 0)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);

      // Render grid overlay (CSS handles this partially, but we add visual depth here)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.003)';
      
      // Update and draw particles
      particles.forEach((p, idx) => {
        // Mouse interaction (push/pull slightly)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let ox = 0;
        let oy = 0;
        
        if (dist < 200) {
          const force = (200 - dist) / 200;
          ox = (dx / dist) * force * 15;
          oy = (dy / dist) * force * 15;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.fill();

        // Connect particles close to each other
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x + ox - (p2.x + (dist < 200 ? (p2.x - mouse.x) / dist * (200 - dist) / 200 * 15 : 0));
          const dy2 = p.y + oy - (p2.y + (dist < 200 ? (p2.y - mouse.y) / dist * (200 - dist) / 200 * 15 : 0));
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist2 < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x + ox, p.y + oy);
            ctx.lineTo(
              p2.x + (dist < 200 ? (p2.x - mouse.x) / dist * (200 - dist) / 200 * 15 : 0), 
              p2.y + (dist < 200 ? (p2.y - mouse.y) / dist * (200 - dist) / 200 * 15 : 0)
            );
            ctx.strokeStyle = `rgba(124, 58, 237, ${(100 - dist2) / 100 * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" />;
};
