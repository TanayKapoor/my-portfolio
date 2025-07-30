export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  duration?: string;
  role?: string;
  status?: string;
  technologies: string[];
  features: string[];
  challenges: string[];
  results: string[];
  demoUrl?: string;
  githubUrl?: string;
  colorTheme: string;
  order: number;
  featured?: boolean;
}

// Color theme mapping for visual consistency
export const colorThemes = {
  green: {
    background: "rgba(34, 197, 94, 0.3)",
    hover: "rgba(34, 197, 94, 0.4)",
    glow: "0 0 20px rgba(34, 197, 94, 0.3)"
  },
  blue: {
    background: "rgba(59, 130, 246, 0.3)",
    hover: "rgba(59, 130, 246, 0.4)",
    glow: "0 0 20px rgba(59, 130, 246, 0.3)"
  },
  yellow: {
    background: "rgba(245, 158, 11, 0.3)",
    hover: "rgba(245, 158, 11, 0.4)",
    glow: "0 0 20px rgba(245, 158, 11, 0.3)"
  },
  purple: {
    background: "rgba(168, 85, 247, 0.3)",
    hover: "rgba(168, 85, 247, 0.4)",
    glow: "0 0 20px rgba(168, 85, 247, 0.3)"
  },
  red: {
    background: "rgba(239, 68, 68, 0.3)",
    hover: "rgba(239, 68, 68, 0.4)",
    glow: "0 0 20px rgba(239, 68, 68, 0.3)"
  },
  teal: {
    background: "rgba(20, 184, 166, 0.3)",
    hover: "rgba(20, 184, 166, 0.4)",
    glow: "0 0 20px rgba(20, 184, 166, 0.3)"
  }
};

// Project icons mapping - simplified without JSX
export const getProjectIcon = (colorTheme: string) => {
  return null; // Icons will be handled inline in components
};