import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Github, ArrowLeft, Filter, Grid, List } from 'lucide-react';
import type { Project } from '@/types/project';
import ConnectThreeAnimation from '@/components/connect-three-animation';
import { motion, AnimatePresence } from 'framer-motion';

// Technology filter options
const TECH_FILTERS = [
  'All',
  'React',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'Python',
  'Next.js',
  'Tailwind CSS',
  'Express',
  'MongoDB'
];

const STATUS_FILTERS = [
  'All',
  'Completed',
  'In Progress',
  'Planning'
];

export default function ProjectsPage() {
  const [selectedTech, setSelectedTech] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch projects from API
  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Filter projects based on selected filters
  const filteredProjects = projects.filter(project => {
    const matchesTech = selectedTech === 'All' || 
      project.technologies?.some(tech => 
        tech.toLowerCase().includes(selectedTech.toLowerCase())
      );
    
    const matchesStatus = selectedStatus === 'All' || 
      project.status?.toLowerCase() === selectedStatus.toLowerCase();
    
    const matchesSearch = searchTerm === '' ||
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTech && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Connect Three Animation Background */}
      <div className="absolute inset-0 z-0">
        <ConnectThreeAnimation 
          title="Projects" 
          subtitle="A showcase of my latest work, side projects, and technical experiments"
        />
      </div>

      {/* Back to Home Link */}
      <Link href="/" className="absolute top-8 left-8 z-30">
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </motion.button>
      </Link>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen">
        {/* Hero spacer to push content down */}
        <div className="h-[100vh]"></div>
        
        {/* Projects Section */}
        <section className="relative z-20 pb-20 bg-black -mt-[200px] pt-[50px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters and Controls */}
            <motion.div
              className="mb-12 p-6 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Filter Options */}
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4">
                  {/* Technology Filter */}
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                      value={selectedTech}
                      onChange={(e) => setSelectedTech(e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    >
                      {TECH_FILTERS.map(tech => (
                        <option key={tech} value={tech} className="bg-gray-900">
                          {tech}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    >
                      {STATUS_FILTERS.map(status => (
                        <option key={status} value={status} className="bg-gray-900">
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Results Count */}
            <motion.div
              className="mb-8 text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Showing {filteredProjects.length} of {projects.length} projects
            </motion.div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-20">
                <div className="text-xl text-gray-400">Loading projects...</div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <div className="text-xl text-red-400">Failed to load projects. Please try again later.</div>
              </div>
            )}

            {/* Projects Grid/List */}
            {!isLoading && !error && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                      : 'space-y-6'
                  }
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {filteredProjects.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      viewMode={viewMode}
                      index={index}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* No Results */}
            {!isLoading && !error && filteredProjects.length === 0 && (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-xl text-gray-400 mb-4">No projects found matching your criteria</div>
                <button
                  onClick={() => {
                    setSelectedTech('All');
                    setSelectedStatus('All');
                    setSearchTerm('');
                  }}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  index: number;
}

function ProjectCard({ project, viewMode, index }: ProjectCardProps) {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <div className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-black/50 hover:border-white/20 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link href={`/project/${project.id}`}>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors cursor-pointer">
                  {project.title}
                </h3>
              </Link>
              <p className="text-gray-400 mb-4 line-clamp-2">
                {project.description}
              </p>
              
              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies?.slice(0, 4).map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies && project.technologies.length > 4 && (
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">
                    +{project.technologies.length - 4} more
                  </span>
                )}
              </div>

              {/* Status and Links */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  project.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                  project.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {project.status}
                </span>
                
                <div className="flex items-center gap-3">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Github size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <div className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-black/50 hover:border-white/20 transition-all duration-300 h-full">
        <Link href={`/project/${project.id}`}>
          <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors cursor-pointer">
            {project.title}
          </h3>
        </Link>
        
        <p className="text-gray-400 mb-4 line-clamp-3">
          {project.description}
        </p>
        
        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies?.slice(0, 3).map((tech, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm"
            >
              {tech}
            </span>
          ))}
          {project.technologies && project.technologies.length > 3 && (
            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-sm">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm ${
            project.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
            project.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {project.status}
          </span>
          
          <div className="flex items-center gap-2">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}