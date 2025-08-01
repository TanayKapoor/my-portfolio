import { useEffect, useRef } from 'react';

interface ConnectThreeAnimationProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function ConnectThreeAnimation({ 
  className = '', 
  title = "Connect Three",
  subtitle 
}: ConnectThreeAnimationProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const largeHeader = headerRef.current;
    const canvas = canvasRef.current;
    
    if (!largeHeader || !canvas) return;

    let width: number, height: number, ctx: CanvasRenderingContext2D | null, points: any[], target: { x: number; y: number }, animateHeader = true;

    // Initialize the animation
    function initHeader() {
      if (!largeHeader || !canvas) return;
      
      width = window.innerWidth;
      height = window.innerHeight;
      target = { x: width / 2, y: height / 2 };

      largeHeader.style.height = height + 'px';

      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Create points
      points = [];
      for (let x = 0; x < width; x = x + width / 20) {
        for (let y = 0; y < height; y = y + height / 20) {
          const px = x + Math.random() * width / 20;
          const py = y + Math.random() * height / 20;
          const p = { x: px, originX: px, y: py, originY: py };
          points.push(p);
        }
      }

      // For each point find the 5 closest points
      for (let i = 0; i < points.length; i++) {
        const closest: any[] = [];
        const p1 = points[i];
        for (let j = 0; j < points.length; j++) {
          const p2 = points[j];
          if (!(p1 == p2)) {
            let placed = false;
            for (let k = 0; k < 5; k++) {
              if (!placed) {
                if (closest[k] == undefined) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }

            for (let k = 0; k < 5; k++) {
              if (!placed) {
                if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }
          }
        }
        p1.closest = closest;
      }

      // Assign a circle to each point
      for (let i in points) {
        const c = Circle(points[i], 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
        points[i].circle = c;
      }
    }

    // Event handling
    function addListeners() {
      if (!('ontouchstart' in window)) {
        window.addEventListener('mousemove', mouseMove);
      }
      window.addEventListener('scroll', scrollCheck);
      window.addEventListener('resize', resize);
    }

    function mouseMove(e: MouseEvent) {
      let posx = 0, posy = 0;
      if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
      } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      target.x = posx;
      target.y = posy;
    }

    function scrollCheck() {
      if (document.body.scrollTop > height) animateHeader = false;
      else animateHeader = true;
    }

    function resize() {
      if (!largeHeader || !canvas) return;
      
      width = window.innerWidth;
      height = window.innerHeight;
      largeHeader.style.height = height + 'px';
      canvas.width = width;
      canvas.height = height;
    }

    // Animation
    function initAnimation() {
      animate();
      for (let i in points) {
        shiftPoint(points[i]);
      }
    }

    function animate() {
      if (animateHeader && ctx) {
        ctx.clearRect(0, 0, width, height);
        for (let i in points) {
          // Detect points in range
          if (Math.abs(getDistance(target, points[i])) < 4000) {
            points[i].active = 0.3;
            points[i].circle.active = 0.6;
          } else if (Math.abs(getDistance(target, points[i])) < 20000) {
            points[i].active = 0.1;
            points[i].circle.active = 0.3;
          } else if (Math.abs(getDistance(target, points[i])) < 40000) {
            points[i].active = 0.02;
            points[i].circle.active = 0.1;
          } else {
            points[i].active = 0;
            points[i].circle.active = 0;
          }

          drawLines(points[i]);
          points[i].circle.draw();
        }
      }
      requestAnimationFrame(animate);
    }

    function shiftPoint(p: any) {
      // Simple animation without external libraries
      const startTime = Date.now();
      const duration = 1000 + 1000 * Math.random();
      const startX = p.x;
      const startY = p.y;
      const targetX = p.originX - 50 + Math.random() * 100;
      const targetY = p.originY - 50 + Math.random() * 100;

      function animatePoint() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        p.x = startX + (targetX - startX) * easeProgress;
        p.y = startY + (targetY - startY) * easeProgress;

        if (progress < 1) {
          requestAnimationFrame(animatePoint);
        } else {
          shiftPoint(p);
        }
      }
      
      requestAnimationFrame(animatePoint);
    }

    // Canvas manipulation
    function drawLines(p: any) {
      if (!p.active || !ctx) return;
      for (let i in p.closest) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.closest[i].x, p.closest[i].y);
        ctx.strokeStyle = 'rgba(156,217,249,' + p.active + ')';
        ctx.stroke();
      }
    }

    function Circle(pos: any, rad: number, color: string) {
      const _this = {
        pos: pos || null,
        radius: rad || 0,
        color: color || null,
        active: 0,
        draw: function() {
          if (!_this.active || !ctx || !_this.radius) return;
          ctx.beginPath();
          ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = 'rgba(156,217,249,' + _this.active + ')';
          ctx.fill();
        }
      };
      return _this;
    }

    // Utility
    function getDistance(p1: any, p2: any) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    // Initialize everything
    initHeader();
    initAnimation();
    addListeners();

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('scroll', scrollCheck);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div 
      ref={headerRef}
      className={`large-header ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        background: '#333',
        overflow: 'hidden',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        zIndex: 1,
        backgroundImage: 'url("https://www.marcoguglie.it/Codepen/AnimatedHeaderBg/demo-1/img/demo-1-bg.jpg")'
      }}
    >
      <canvas 
        ref={canvasRef}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
      {title && (
        <h1 
          className="main-title"
          style={{
            position: 'absolute',
            margin: 0,
            padding: 0,
            color: '#f9f1e9',
            textAlign: 'center',
            top: '50%',
            left: '50%',
            transform: 'translate3d(-50%,-50%,0)',
            textTransform: 'uppercase',
            fontSize: '4.2em',
            letterSpacing: '0.1em',
            fontWeight: 'bold'
          }}
        >
          {title.split(' ').map((word, index) => 
            word.toLowerCase() === 'three' ? (
              <span key={index} style={{ fontWeight: 200 }}>{word}</span>
            ) : (
              <span key={index}>{word} </span>
            )
          )}
        </h1>
      )}
      {subtitle && (
        <p 
          className="subtitle"
          style={{
            position: 'absolute',
            margin: 0,
            padding: 0,
            color: '#f9f1e9',
            textAlign: 'center',
            top: '60%',
            left: '50%',
            transform: 'translate3d(-50%,-50%,0)',
            fontSize: '1.2em',
            opacity: 0.8
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}