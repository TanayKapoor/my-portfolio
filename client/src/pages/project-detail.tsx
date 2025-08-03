import { useParams, Link } from "wouter";
import { ArrowLeft, ExternalLink, Github, Code2, Zap, Brain, Target, Package, Calendar, User, Image, Terminal, Clock, Download, Play, Settings, GitBranch, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Grid3X3, RotateCcw, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
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

// Project Showcase Component with Gallery and Slideshow Views
function ProjectShowcase({ project }: { project: Project }) {
  const [viewMode, setViewMode] = useState<'gallery' | 'slideshow'>('slideshow');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const screenshots = project.screenshotUrls || [];

  // Auto-advance slideshow
  useEffect(() => {
    if (viewMode === 'slideshow' && screenshots.length > 1 && !isFullscreen) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % screenshots.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [viewMode, screenshots.length, isFullscreen]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const openFullscreen = (index: number) => {
    setCurrentSlide(index);
    setIsFullscreen(true);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-['Courier_Prime']">Project Showcase</h2>
          
          {screenshots.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="inline-flex bg-gray-800/80 backdrop-blur-sm rounded-lg p-1 border border-gray-700/50">
                <button
                  onClick={() => setViewMode('gallery')}
                  className={`px-3 py-1 rounded-md transition-all duration-200 text-sm font-medium ${
                    viewMode === 'gallery'
                      ? 'bg-gray-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Grid3X3 size={16} className="inline mr-1" />
                  Gallery
                </button>
                <button
                  onClick={() => setViewMode('slideshow')}
                  className={`px-3 py-1 rounded-md transition-all duration-200 text-sm font-medium ${
                    viewMode === 'slideshow'
                      ? 'bg-gray-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <RotateCcw size={16} className="inline mr-1" />
                  Slideshow
                </button>
              </div>
            </div>
          )}
        </div>

        {screenshots.length > 0 ? (
          <div className="relative">
            {viewMode === 'gallery' ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {screenshots.map((url, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative cursor-pointer"
                    onClick={() => openFullscreen(index)}
                  >
                    <img
                      src={url}
                      alt={`${project.title} screenshot ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-700 group-hover:border-gray-600 transition-all duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Maximize2 size={24} className="text-white mx-auto mb-2" />
                        <span className="text-white text-sm">Screenshot {index + 1}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative bg-gray-800 rounded-lg overflow-hidden"
              >
                <div className="relative h-80 lg:h-96">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentSlide}
                      src={screenshots[currentSlide]}
                      alt={`${project.title} screenshot ${currentSlide + 1}`}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openFullscreen(currentSlide)}
                    />
                  </AnimatePresence>

                  {screenshots.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                      >
                        <ChevronLeft size={20} className="text-white" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                      >
                        <ChevronRight size={20} className="text-white" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {screenshots.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentSlide ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => openFullscreen(currentSlide)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <Maximize2 size={16} className="text-white" />
                  </button>
                </div>

                <div className="p-4 text-center">
                  <span className="text-sm text-gray-400">
                    {currentSlide + 1} of {screenshots.length}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-center">
              <Image size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No screenshots available</p>
            </div>
          </div>
        )}
      </motion.section>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                src={screenshots[currentSlide]}
                alt={`${project.title} screenshot ${currentSlide + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <X size={20} className="text-white" />
              </button>

              {screenshots.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevSlide();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <ChevronLeft size={24} className="text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextSlide();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <ChevronRight size={24} className="text-white" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <div className="absolute bottom-4 right-4 text-white bg-black/50 px-3 py-1 rounded-lg">
                {currentSlide + 1} of {screenshots.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Overview Tab Component
function OverviewTab({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Project Showcase */}
        <ProjectShowcase project={project} />

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