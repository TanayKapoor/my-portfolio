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
  private scale: number = 1;
  private lastRenderTime: number = 0;
  private targetFPS: number = 30; // Limit to 30 FPS to reduce power consumption

  private vertexSource = `#version 300 es
precision highp float;
in vec4 position;
void main(){
  gl_Position = position;
}`;

  private fragmentSource = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
* Optimized for lower power consumption
*/
precision mediump float;
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
float rnd(vec3 p) {
  p=fract(p*vec3(12.9898,78.233,156.34));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y*p.z);
}
float swirls(in vec3 p) {
  float d=.0;
  vec3 c=p;
  // Reduced from 9 to 5 iterations
  for(float i=min(.0,time); i<5.; i++) {
    p=.7*abs(p)/dot(p,p)-.7;
    p.yz=csqr(p.yz);
    p=p.zxy;
    d+=exp(-19.*abs(dot(p,c)));
  }
  return d;
}
vec3 march(in vec3 p, vec3 rd) {
  float d=.3, t=.0, c=.0, k=mix(.9,1.,rnd(rd)),
  maxd=length(p)-1.;
  vec3 col=vec3(0);
  // Reduced from 120 to 60 iterations for better performance
  for(float i=min(.0,time); i<60.; i++) {
    t+=d*exp(-2.*c)*k;
    c=swirls(p+rd*t);
    if (t<8e-2 || t>maxd) break;
    col+=vec3(c*c,c/1.05,c)*1.2e-2;
  }
  return col;
}
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
vec3 sky(vec2 p, bool anim) {
  p.x-=.17-(anim?2e-4*T:.0);
  p*=300.; // Reduced detail
  vec2 id=floor(p), gv=fract(p)-.5;
  float n=rnd(id), d=length(gv);
  if (n<.98) return vec3(0); // Less dense stars
  return vec3(S(4e-2*n,2e-3*n,d*d));
}
void cam(inout vec3 p) {
  p.yz*=rot(move.y*6.3/MN-T*.03); // Slower rotation
  p.xz*=rot(-move.x*6.3/MN+T*.02);
}
void main() {
  vec2 uv=(FC-.5*R)/MN;
  vec3 col=vec3(0),
  p=vec3(0,0,-16),
  rd=N(vec3(uv,1)), rdd=rd;
  cam(p); cam(rd);
  col=march(p,rd);
  col=S(-.2,.9,col);
  vec2 sn=.5+vec2(atan(rdd.x,rdd.z),atan(length(rdd.xz),rdd.y))/6.28318;
  col=max(col,vec3(sky(sn,true)*0.7)); // Simplified sky calculation
  float t=min((time-.5)*.3,1.);
  uv=FC/R*2.-1.;
  uv*=.7;
  float v=pow(dot(uv,uv),1.8);
  col=mix(col,vec3(0),v);
  col=mix(vec3(0),col,t);
  col=max(col,.08);
  
  // Add black gradient at bottom for seamless page blending
  float screenY = FC.y / R.y;
  float bottomFade = S(0.0, 0.3, screenY); // Fade from black at bottom to normal at 30% height
  col *= bottomFade;
  
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
    // Reduce rendering scale for better performance
    this.scale = Math.min(0.75, 0.5 * window.devicePixelRatio);
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
    this.mouseMove = [x, y];
  }

  public render(): void {
    if (!this.program) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastRenderTime;
    const targetFrameTime = 1000 / this.targetFPS;
    
    // Frame rate limiting for power efficiency
    if (deltaTime < targetFrameTime) {
      this.animationId = requestAnimationFrame(() => this.render());
      return;
    }
    
    this.lastRenderTime = currentTime;
    const now = (Date.now() - this.startTime) * 0.001;
    
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

      window.addEventListener('resize', handleResize);
      canvas.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('mousemove', handleMouseMove);
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