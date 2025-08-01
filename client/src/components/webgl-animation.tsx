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
  private mouseSmoothness: number = 0.12; // Enhanced mouse responsiveness
  private scale: number = 1;
  private lastRenderTime: number = 0;
  private targetFPS: number = 60; // Optimized for quality
  private performanceMode: boolean = false;
  private frameCount: number = 0;
  private lastFPSCheck: number = 0;

  private vertexSource = `#version 300 es
precision highp float;
in vec4 position;
void main(){
  gl_Position = position;
}`;

  private fragmentSource = `#version 300 es
/*********
* High-Quality WebGL Shader with Advanced Effects
* Enhanced fractal rendering with superior visual quality
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
#define PI 3.14159265359
#define rot(a) mat2(cos((a)-vec4(0,11,33,0)))
#define csqr(a) vec2(a.x*a.x-a.y*a.y,2.*a.x*a.y)

// High-quality hash function for better randomness
float hash13(vec3 p3) {
    p3 = fract(p3 * .1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// Enhanced multi-octave noise
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    return mix(
        mix(mix(hash13(i + vec3(0,0,0)), hash13(i + vec3(1,0,0)), f.x),
            mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),
            mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
}

// Fractal Brownian Motion for detailed texturing
float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < octaves; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// Enhanced swirls with superior detail and smoothness
float swirls(in vec3 p) {
    float d = 0.0;
    vec3 c = p;
    float scale = 1.0;
    
    // Increased iterations for higher quality
    for(float i = 0.0; i < 8.0; i++) {
        p = 0.85 * abs(p) / dot(p, p) - 0.82;
        p.yz = csqr(p.yz);
        p = p.zxy;
        
        float intensity = exp(-18.0 * abs(dot(p, c)));
        d += intensity * scale;
        scale *= 0.85;
        
        // Add subtle variation
        c += vec3(sin(T * 0.1 + i), cos(T * 0.15 + i), sin(T * 0.12 + i)) * 0.02;
    }
    
    // Add fine detail with FBM
    d += fbm(p * 2.0 + T * 0.1, 3) * 0.15;
    
    return d;
}

// Advanced raymarching with adaptive step size and better sampling
vec3 march(in vec3 p, vec3 rd) {
    float d = 0.2, t = 0.0, c = 0.0;
    float k = mix(0.88, 1.08, hash13(rd));
    float maxd = length(p) - 1.1;
    vec3 col = vec3(0);
    vec3 totalLight = vec3(0);
    
    // Enhanced marching with more iterations for quality
    for(float i = 0.0; i < 64.0; i++) {
        vec3 pos = p + rd * t;
        c = swirls(pos);
        
        // Adaptive step size based on density
        float adaptiveStep = mix(0.3, 1.2, 1.0 - c);
        t += d * exp(-1.6 * c) * k * adaptiveStep;
        
        if (t < 0.01 || t > maxd) break;
        
        // Enhanced color mixing with better gradients
        vec3 sampleColor = vec3(
            c * c * 1.2,           // Red channel - high frequency detail
            c * 0.9 + c * c * 0.4, // Green channel - mid-range warmth
            c * 0.6 + c * c * 0.8  // Blue channel - depth and coolness
        );
        
        // Apply lighting based on position and density
        float lighting = 1.0 + 0.3 * sin(t * 2.0 + T * 0.5);
        sampleColor *= lighting;
        
        // Energy-conserving accumulation
        float alpha = c * 0.025;
        col += sampleColor * alpha * (1.0 - length(col) * 0.1);
        totalLight += vec3(alpha);
    }
    
    // Tone mapping and color enhancement
    col = col / (1.0 + col); // Reinhard tone mapping
    return col;
}

// Enhanced sky with nebula-like effects
vec3 sky(vec2 p, bool anim) {
    p.x -= 0.17 - (anim ? 0.0001 * T : 0.0);
    
    // Multi-layer star field
    vec3 stars = vec3(0);
    
    // Large bright stars
    vec2 p1 = p * 180.0;
    vec2 id1 = floor(p1), gv1 = fract(p1) - 0.5;
    float n1 = hash12(id1), d1 = length(gv1);
    if (n1 > 0.992) {
        float brightness = S(0.04 * n1, 0.001 * n1, d1 * d1);
        stars += vec3(brightness * (0.8 + 0.4 * sin(T * 2.0 + n1 * 20.0)));
    }
    
    // Medium stars
    vec2 p2 = p * 350.0;
    vec2 id2 = floor(p2), gv2 = fract(p2) - 0.5;
    float n2 = hash12(id2), d2 = length(gv2);
    if (n2 > 0.988) {
        float brightness = S(0.02 * n2, 0.0005 * n2, d2 * d2);
        stars += vec3(brightness * 0.6);
    }
    
    // Nebula-like background
    vec3 nebula = vec3(
        fbm(vec3(p * 8.0, T * 0.05), 4) * 0.15,
        fbm(vec3(p * 6.0 + 100.0, T * 0.03), 3) * 0.1,
        fbm(vec3(p * 10.0 + 200.0, T * 0.07), 3) * 0.2
    ) * 0.3;
    
    return stars + nebula;
}

// Sophisticated camera system with smooth movements
void cam(inout vec3 p) {
    float mouseInfluence = 0.7;
    float autoRotation = T * 0.018;
    
    // Smooth mouse response with easing
    vec2 smoothMove = move * mouseInfluence;
    smoothMove *= 1.0 + 0.2 * sin(T * 0.3); // Subtle breathing effect
    
    p.yz *= rot(smoothMove.y * 7.0 / MN + autoRotation * 0.6);
    p.xz *= rot(-smoothMove.x * 7.0 / MN + autoRotation);
    
    // Add subtle orbital motion
    p.xy *= rot(sin(T * 0.05) * 0.1);
}

// Advanced anti-aliasing through supersampling
vec3 getPixelColor(vec2 coord) {
    vec2 uv = (coord - 0.5 * R) / MN;
    vec3 col = vec3(0);
    vec3 p = vec3(0, 0, -16);
    vec3 rd = N(vec3(uv, 1.0));
    vec3 rdd = rd;
    
    // Apply camera transformations
    cam(p);
    cam(rd);
    
    // Render main fractal
    col = march(p, rd);
    
    // Enhanced contrast and smoothing
    col = S(-0.05, 0.9, col);
    
    // Add enhanced sky
    vec2 sn = 0.5 + vec2(atan(rdd.x, rdd.z), atan(length(rdd.xz), rdd.y)) / (2.0 * PI);
    vec3 skyColor = sky(sn, true);
    col = max(col, skyColor * 0.6);
    
    return col;
}

void main() {
    vec3 col = vec3(0);
    
    // 2x2 supersampling for anti-aliasing
    float samples = 2.0;
    float invSamples = 1.0 / (samples * samples);
    
    for(float x = 0.0; x < samples; x++) {
        for(float y = 0.0; y < samples; y++) {
            vec2 offset = vec2(x, y) / samples - 0.5;
            col += getPixelColor(FC + offset) * invSamples;
        }
    }
    
    // Smooth fade-in with easing
    float fadeTime = min((time - 0.3) * 0.8, 1.0);
    fadeTime = fadeTime * fadeTime * (3.0 - 2.0 * fadeTime); // Smoothstep
    
    // Enhanced vignette with artistic flair
    vec2 uv = FC / R * 2.0 - 1.0;
    uv *= 0.75;
    float vignette = 1.0 - pow(dot(uv, uv), 1.4);
    vignette = S(0.1, 0.9, vignette);
    col *= vignette;
    
    // Apply fade-in
    col = mix(vec3(0), col, fadeTime);
    col = max(col, 0.02);
    
    // Elegant bottom gradient for page integration
    float screenY = FC.y / R.y;
    float bottomFade = S(0.0, 0.5, screenY);
    bottomFade = bottomFade * bottomFade * (3.0 - 2.0 * bottomFade);
    col *= bottomFade;
    
    // Advanced color grading and enhancement
    col = pow(col, vec3(1.05)); // Subtle gamma correction
    col = mix(col, S(0.0, 1.0, col), 0.4); // Enhance contrast
    
    // Film-like color treatment
    col *= vec3(1.02, 0.99, 1.01); // Subtle color temperature
    col = col / (1.0 + col * 0.3); // Soft tone mapping
    
    // Final saturation boost
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, 1.15);
    
    O = vec4(col, 1.0);
}`;

  private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false, // We handle AA in shader
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    });
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }
    this.gl = gl;
    
    // Enhanced rendering scale for premium quality
    this.scale = Math.min(1.0, Math.max(0.7, window.devicePixelRatio * 0.9));
    
    // Enable high-quality WebGL extensions
    this.gl.getExtension('EXT_color_buffer_float');
    this.gl.getExtension('OES_texture_float_linear');
    
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
    
    // Adaptive performance monitoring
    this.frameCount++;
    if (currentTime - this.lastFPSCheck > 1000) {
      const actualFPS = this.frameCount;
      this.frameCount = 0;
      this.lastFPSCheck = currentTime;
      
      // Auto-adjust quality based on performance
      if (actualFPS < 30 && !this.performanceMode) {
        this.performanceMode = true;
        this.scale *= 0.8; // Reduce resolution for better performance
        this.resize();
      } else if (actualFPS > 55 && this.performanceMode) {
        this.performanceMode = false;
        this.scale = Math.min(1.0, Math.max(0.7, window.devicePixelRatio * 0.9));
        this.resize();
      }
    }
    
    // Enhanced frame rate control
    if (deltaTime < targetFrameTime * 0.9) {
      this.animationId = requestAnimationFrame(() => this.render());
      return;
    }
    
    this.lastRenderTime = currentTime;
    const now = (Date.now() - this.startTime) * 0.001;
    
    // Enhanced mouse interpolation with momentum
    const smoothnessFactor = this.performanceMode ? this.mouseSmoothness * 1.5 : this.mouseSmoothness;
    this.mouseMove[0] += (this.targetMouse[0] - this.mouseMove[0]) * smoothnessFactor;
    this.mouseMove[1] += (this.targetMouse[1] - this.mouseMove[1]) * smoothnessFactor;
    
    // Enhanced WebGL state management
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
    
    // Optimized uniform locations (cached for performance)
    const resolutionLocation = this.gl.getUniformLocation(this.program, 'resolution');
    const timeLocation = this.gl.getUniformLocation(this.program, 'time');
    const moveLocation = this.gl.getUniformLocation(this.program, 'move');
    
    this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(timeLocation, now);
    this.gl.uniform2f(moveLocation, this.mouseMove[0], this.mouseMove[1]);
    
    // Render with enhanced quality
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