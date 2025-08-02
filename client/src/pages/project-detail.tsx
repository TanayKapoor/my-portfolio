import { useParams, Link } from "wouter";
import { ArrowLeft, ExternalLink, Github, Code2, Zap, Brain, Target, Package, Calendar, User, Image, Terminal, Clock, Download, Play, Settings, GitBranch, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import type { Project } from '@shared/schema';

export default function ProjectDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'commands' | 'versions'>('overview');
  
  // Fetch project from API
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ['/api/projects', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading project...</h1>
        </div>
      </div>
    );
  }

  if (error || !project || !id) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">Return to home</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'commands', label: 'Commands', icon: Terminal },
    { id: 'versions', label: 'Version History', icon: Clock },
  ] as const;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-['Courier_Prime']">Back to Projects</span>
          </Link>
        </motion.nav>

        {/* Hero Section */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-start gap-6 mb-6">
            {/* Project Icon */}
            {project.iconUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={project.iconUrl} 
                  alt={`${project.title} icon`}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-700"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 font-['Courier_Prime']">
                {project.title}
              </h1>
            </div>
          </div>
          <p className="text-xl text-gray-400 mb-6">{project.description}</p>
          
          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar size={16} />
              <span className="text-sm">{project.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <User size={16} />
              <span className="text-sm">{project.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${project.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`} />
              <span className="text-sm text-gray-400">{project.status}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {project.demoUrl && (
              <a 
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ExternalLink size={16} />
                <span>View Live Demo</span>
              </a>
            )}
            {project.githubUrl && (
              <a 
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
              >
                <Github size={16} />
                <span>View Source</span>
              </a>
            )}
          </div>
        </motion.header>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex bg-gray-800/80 backdrop-blur-sm rounded-full p-1 border border-gray-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-gray-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab project={project} />}
          {activeTab === 'commands' && <CommandsTab project={project} />}
          {activeTab === 'versions' && <VersionsTab project={project} />}
        </motion.div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Project Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-6 font-['Courier_Prime']">Project Showcase</h2>
          <div className="flex items-center justify-center h-48 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-center">
              <Image size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Project screenshots coming soon</p>
            </div>
          </div>
        </motion.section>

        {/* Description */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-4 font-['Courier_Prime']">Project Overview</h2>
          <p className="text-gray-300 leading-relaxed">{project.description}</p>
        </motion.section>

        {/* Key Features */}
        {project.features && project.features.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <h2 className="text-2xl font-bold mb-6 font-['Courier_Prime']">Key Features</h2>
            <div className="space-y-4">
              {project.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                    <Zap size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-300">{feature}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Challenges */}
        {project.challenges && project.challenges.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
          >
            <h2 className="text-2xl font-bold mb-6 font-['Courier_Prime']">Challenges</h2>
            <div className="space-y-4">
              {project.challenges.map((challenge: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                    <AlertCircle size={20} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-gray-300">{challenge}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Right Column - Sidebar */}
      <div className="space-y-6">
        {/* Technologies */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
        >
          <h3 className="text-xl font-bold mb-4 font-['Courier_Prime']">Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 text-xs rounded-full border border-gray-600 text-gray-400"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Project Status */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
        >
          <h3 className="text-xl font-bold mb-4 font-['Courier_Prime']">Project Status</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-gray-300">{project.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-400" />
              <span className="text-gray-300">{project.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-purple-400" />
              <span className="text-gray-300">{project.role}</span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

// Commands Tab Component  
function CommandsTab({ project }: { project: Project }) {
  return (
    <div className="max-w-4xl">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
      >
        <h2 className="text-2xl font-bold mb-6 font-['Courier_Prime'] flex items-center gap-2">
          <Terminal size={24} />
          Commands Guide
        </h2>
        <div className="text-center py-8">
          <Terminal size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Commands section coming soon for {project.title}</p>
        </div>
      </motion.section>
    </div>
  );
}

// Versions Tab Component  
function VersionsTab({ project }: { project: Project }) {
  return (
    <div className="max-w-4xl">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
      >
        <h2 className="text-2xl font-bold mb-6 font-['Courier_Prime'] flex items-center gap-2">
          <Clock size={24} />
          Version History
        </h2>
        <div className="text-center py-8">
          <GitBranch size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Version history coming soon for {project.title}</p>
        </div>
      </motion.section>
    </div>
  );
}