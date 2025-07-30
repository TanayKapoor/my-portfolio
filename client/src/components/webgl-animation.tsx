import { useEffect, useRef } from 'react';

// WebGL Renderer class adapted for React
class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private animationId: number | null = null;
  private startTime: number = Date.now();
  private mouseMove: [number, number] = [0, 0];
  private targetMouse: [number, number] = [0, 0];
  private mouseSmoothness: number = 0.08; // Smoother mouse interpolation
  private scale: number = 1;
  private lastRenderTime: number = 0;
  private targetFPS: number = 60; // Higher FPS for smoother animation

  private vertexSource = `#version 300 es
precision highp float;
in vec4 position;
void main(){
  gl_Position = position;
}`;

  private fragmentSource = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
* Enhanced quality with improved mouse interaction
*/
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec2 move;
#define FC gl_FragCoord.xy
#define R resolution
#define T time
#define N normalize
#define S smoothstep
#define MN min(R.x,R.y)
#define rot(a) mat2(cos((a)-vec4(0,11,33,0)))
#define csqr(a) vec2(a.x*a.x-a.y*a.y,2.*a.x*a.y)

// Cleaner random function with reduced noise
float rnd(vec3 p) {
  p=fract(p*vec3(12.9898,78.233,156.34));
  p+=dot(p,p.yzx+34.56);
  return fract((p.x+p.y)*p.z);
}

// Smoother swirls function with controlled noise
float swirls(in vec3 p) {
  float d=.0;
  vec3 c=p;
  // Reduced iterations for cleaner look
  for(float i=min(.0,time); i<6.; i++) {
    p=.8*abs(p)/dot(p,p)-.8;
    p.yz=csqr(p.yz);
    p=p.zxy;
    d+=exp(-16.*abs(dot(p,c)));
  }
  return d;
}

// Cleaner marching function with reduced noise
vec3 march(in vec3 p, vec3 rd) {
  float d=.25, t=.0, c=.0, k=mix(.9,1.05,rnd(rd)),
  maxd=length(p)-1.2;
  vec3 col=vec3(0);
  // Balanced iterations for clean, smooth result
  for(float i=min(.0,time); i<50.; i++) {
    t+=d*exp(-1.8*c)*k;
    c=swirls(p+rd*t);
    if (t<8e-2 || t>maxd) break;
    // Smoother color mixing with less noise
    col+=vec3(c*c*0.8,c/1.1,c*0.7)*2.2e-2;
  }
  return col;
}

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p.yx+34.56);
  return fract(p.x*p.y);
}

// Cleaner sky with subtle stars
vec3 sky(vec2 p, bool anim) {
  p.x-=.17-(anim?1e-4*T:.0);
  p*=250.; // Reduced detail for cleaner look
  vec2 id=floor(p), gv=fract(p)-.5;
  float n=rnd(id), d=length(gv);
  if (n<.985) return vec3(0); // Fewer, cleaner stars
  float brightness = S(3e-2*n,5e-4*n,d*d);
  return vec3(brightness * (0.6 + 0.2*sin(T*1.5 + n*15.0))); // Subtle twinkling
}

// Smooth camera movement with controlled mouse interaction
void cam(inout vec3 p) {
  float mouseInfluence = 0.6;
  float autoRotation = T * 0.015;
  p.yz*=rot(move.y*6.0*mouseInfluence/MN + autoRotation*0.5);
  p.xz*=rot(-move.x*6.0*mouseInfluence/MN + autoRotation);
}

void main() {
  vec2 uv=(FC-.5*R)/MN;
  vec3 col=vec3(0),
  p=vec3(0,0,-16),
  rd=N(vec3(uv,1)), rdd=rd;
  
  // Apply smooth camera movement
  cam(p); cam(rd);
  
  // Get the main fractal color with smoothing
  col=march(p,rd);
  col=S(-.1,.8,col); // Smoother contrast transition
  
  // Add subtle sky background
  vec2 sn=.5+vec2(atan(rdd.x,rdd.z),atan(length(rdd.xz),rdd.y))/6.28318;
  vec3 skyColor = sky(sn,true);
  col=max(col, skyColor * 0.5);
  
  // Smooth fade-in effect
  float t=min((time-.2)*.5,1.);
  
  // Cleaner vignette effect
  uv=FC/R*2.-1.;
  uv*=.7;
  float v=pow(dot(uv,uv),1.2);
  col=mix(col,vec3(0),v*0.8);
  
  // Apply fade-in
  col=mix(vec3(0),col,t);
  col=max(col,.04);
  
  // Smooth bottom gradient for page blending
  float screenY = FC.y / R.y;
  float bottomFade = S(0.0, 0.4, screenY);
  col *= bottomFade;
  
  // Clean color enhancement
  col = pow(col, vec3(1.1)); // Subtle gamma for cleaner look
  col = mix(col, S(0.0, 1.0, col), 0.3); // Additional smoothing
  
  O=vec4(col,1);
}`;

  private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }
    this.gl = gl;
    // Enhanced rendering scale for better quality
    this.scale = Math.min(1.0, 0.8 * window.devicePixelRatio);
    this.resize();
  }

  private compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compilation error: ${error}`);
    }
    
    return shader;
  }

  private createProgram(): WebGLProgram {
    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, this.vertexSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, this.fragmentSource);
    
    const program = this.gl.createProgram();
    if (!program) throw new Error('Failed to create program');
    
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Program linking error: ${error}`);
    }
    
    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);
    
    return program;
  }

  public init(): void {
    this.program = this.createProgram();
    
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
    
    const position = this.gl.getAttribLocation(this.program, 'position');
    this.gl.enableVertexAttribArray(position);
    this.gl.vertexAttribPointer(position, 2, this.gl.FLOAT, false, 0, 0);
  }

  public resize(): void {
    const { innerWidth: width, innerHeight: height } = window;
    this.canvas.width = width * this.scale;
    this.canvas.height = height * this.scale;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  public updateMouse(x: number, y: number): void {
    this.targetMouse = [x, y];
  }

  public render(): void {
    if (!this.program) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastRenderTime;
    const targetFrameTime = 1000 / this.targetFPS;
    
    // Frame rate limiting for smooth animation
    if (deltaTime < targetFrameTime) {
      this.animationId = requestAnimationFrame(() => this.render());
      return;
    }
    
    this.lastRenderTime = currentTime;
    const now = (Date.now() - this.startTime) * 0.001;
    
    // Smooth mouse interpolation for fluid movement
    this.mouseMove[0] += (this.targetMouse[0] - this.mouseMove[0]) * this.mouseSmoothness;
    this.mouseMove[1] += (this.targetMouse[1] - this.mouseMove[1]) * this.mouseSmoothness;
    
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
    
    const resolutionLocation = this.gl.getUniformLocation(this.program, 'resolution');
    const timeLocation = this.gl.getUniformLocation(this.program, 'time');
    const moveLocation = this.gl.getUniformLocation(this.program, 'move');
    
    this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(timeLocation, now);
    this.gl.uniform2f(moveLocation, this.mouseMove[0], this.mouseMove[1]);
    
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    
    this.animationId = requestAnimationFrame(() => this.render());
  }

  public start(): void {
    this.render();
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public destroy(): void {
    this.stop();
    if (this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }
    if (this.buffer) {
      this.gl.deleteBuffer(this.buffer);
      this.buffer = null;
    }
  }
}

interface WebGLAnimationProps {
  className?: string;
}

export default function WebGLAnimation({ className = '' }: WebGLAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const renderer = new WebGLRenderer(canvas);
      rendererRef.current = renderer;
      
      renderer.init();
      renderer.start();

      const handleResize = () => {
        renderer.resize();
      };

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        renderer.updateMouse(x, -y);
      };

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (e.touches.length > 0) {
          const rect = canvas.getBoundingClientRect();
          const touch = e.touches[0];
          const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          const y = ((touch.clientY - rect.top) / rect.height) * 2 - 1;
          renderer.updateMouse(x, -y);
        }
      };

      const handleMouseLeave = () => {
        // Smoothly return to center when mouse leaves
        renderer.updateMouse(0, 0);
      };

      window.addEventListener('resize', handleResize);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        renderer.destroy();
        rendererRef.current = null;
      };
    } catch (error) {
      console.error('Failed to initialize WebGL animation:', error);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full bg-black ${className}`}
      style={{
        touchAction: 'none',
        objectFit: 'contain'
      }}
    />
  );
}