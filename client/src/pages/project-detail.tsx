import { useParams, Link } from "wouter";
import { ArrowLeft, ExternalLink, Github, Code2, Zap, Brain, Target, Package, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";

// Project data - in a real app, this would come from an API or database
const projectsData = {
  1: {
    title: "Smart Meal Planner",
    subtitle: "AI-powered meal planning app",
    description: "A comprehensive meal planning application that leverages artificial intelligence to suggest personalized recipes based on dietary preferences, available ingredients, and nutritional goals. The app learns from user behavior to improve recommendations over time.",
    duration: "3 months",
    role: "Full Stack Developer",
    status: "Completed",
    liveUrl: "https://smartmealplanner.demo",
    githubUrl: "https://github.com/demo/smart-meal-planner",
    technologies: [
      { name: "React", category: "frontend" },
      { name: "TypeScript", category: "frontend" },
      { name: "Node.js", category: "backend" },
      { name: "Express", category: "backend" },
      { name: "PostgreSQL", category: "database" },
      { name: "Redis", category: "cache" },
      { name: "OpenAI API", category: "ai" },
      { name: "Docker", category: "devops" },
    ],
    features: [
      {
        title: "Intelligent Recipe Suggestions",
        description: "AI analyzes user preferences, dietary restrictions, and ingredient availability to suggest personalized recipes.",
        icon: Brain,
      },
      {
        title: "Nutritional Tracking",
        description: "Comprehensive nutritional analysis for each meal with daily, weekly, and monthly tracking.",
        icon: Target,
      },
      {
        title: "Shopping List Generation",
        description: "Automatic shopping list creation based on selected meal plans with smart grouping by store sections.",
        icon: Package,
      },
      {
        title: "Real-time Collaboration",
        description: "Share meal plans with family members and collaborate on weekly menus in real-time.",
        icon: Zap,
      },
    ],
    challenges: [
      {
        problem: "Complex dietary restriction handling",
        solution: "Implemented a flexible rule engine that can handle multiple, overlapping dietary restrictions while maintaining recipe quality.",
      },
      {
        problem: "Recipe recommendation accuracy",
        solution: "Developed a hybrid recommendation system combining collaborative filtering with content-based filtering for better personalization.",
      },
      {
        problem: "Real-time sync across devices",
        solution: "Utilized WebSockets with Redis pub/sub for efficient real-time updates with conflict resolution.",
      },
    ],
    results: [
      "92% user satisfaction rate",
      "45% reduction in meal planning time",
      "30% decrease in food waste reported by users",
      "15K+ active monthly users",
    ],
  },
  2: {
    title: "Focus Timer Pro",
    subtitle: "Minimalist productivity app",
    description: "A beautifully designed productivity application implementing the Pomodoro technique with ambient soundscapes, detailed analytics, and team collaboration features for remote workers and students.",
    duration: "2 months",
    role: "Lead Developer",
    status: "In Production",
    liveUrl: "https://focustimerpro.demo",
    githubUrl: "https://github.com/demo/focus-timer-pro",
    technologies: [
      { name: "React Native", category: "mobile" },
      { name: "TypeScript", category: "frontend" },
      { name: "Firebase", category: "backend" },
      { name: "Web Audio API", category: "audio" },
      { name: "Chart.js", category: "visualization" },
      { name: "Stripe", category: "payments" },
    ],
    features: [
      {
        title: "Smart Break Reminders",
        description: "AI-powered break suggestions based on productivity patterns and fatigue detection.",
        icon: Brain,
      },
      {
        title: "Ambient Soundscapes",
        description: "Curated collection of focus-enhancing sounds with dynamic mixing capabilities.",
        icon: Zap,
      },
      {
        title: "Team Sync Sessions",
        description: "Synchronized focus sessions for remote teams with shared goals and progress tracking.",
        icon: Target,
      },
      {
        title: "Detailed Analytics",
        description: "Comprehensive productivity insights with weekly reports and trend analysis.",
        icon: Package,
      },
    ],
    challenges: [
      {
        problem: "Cross-platform audio synchronization",
        solution: "Developed a custom audio engine using Web Audio API for precise timing across devices.",
      },
      {
        problem: "Battery optimization on mobile",
        solution: "Implemented intelligent background processing with native modules for 70% better battery life.",
      },
    ],
    results: [
      "4.8/5 app store rating",
      "50K+ downloads in first month",
      "85% user retention after 3 months",
    ],
  },
  3: {
    title: "Local Weather Station",
    subtitle: "Personal weather tracking app",
    description: "A comprehensive weather monitoring system using IoT sensors to track local weather conditions. Features beautiful data visualizations, historical trends, and accurate forecasts based on hyperlocal data collection.",
    duration: "4 months",
    role: "Full Stack Developer",
    status: "Completed",
    liveUrl: "https://weatherstation.demo",
    githubUrl: "https://github.com/demo/weather-station",
    technologies: [
      { name: "Vue.js", category: "frontend" },
      { name: "TypeScript", category: "frontend" },
      { name: "Python", category: "backend" },
      { name: "FastAPI", category: "backend" },
      { name: "InfluxDB", category: "database" },
      { name: "Grafana", category: "visualization" },
      { name: "MQTT", category: "iot" },
      { name: "Raspberry Pi", category: "hardware" },
    ],
    features: [
      {
        title: "Real-time Data Collection",
        description: "Continuous monitoring of temperature, humidity, pressure, and air quality with sub-minute updates.",
        icon: Zap,
      },
      {
        title: "Predictive Forecasting",
        description: "ML-based local weather predictions using historical data and pattern recognition.",
        icon: Brain,
      },
      {
        title: "Interactive Dashboards",
        description: "Beautiful, responsive visualizations with customizable time ranges and data overlays.",
        icon: Target,
      },
      {
        title: "Alert System",
        description: "Configurable weather alerts for extreme conditions with mobile notifications.",
        icon: Package,
      },
    ],
    challenges: [
      {
        problem: "Sensor calibration and accuracy",
        solution: "Implemented auto-calibration algorithms with reference data from nearby weather stations.",
      },
      {
        problem: "Large-scale time series data storage",
        solution: "Used InfluxDB with intelligent downsampling policies for efficient long-term storage.",
      },
    ],
    results: [
      "±0.5°C temperature accuracy",
      "99.9% uptime over 6 months",
      "2TB+ weather data collected",
      "Featured in local maker community",
    ],
  },
  4: {
    title: "Expense Tracker",
    subtitle: "Smart personal finance app",
    description: "An intelligent expense tracking application with automatic categorization, spending insights, and budget recommendations. Uses machine learning to understand spending patterns and provide personalized financial advice.",
    duration: "2 months",
    role: "Lead Developer",
    status: "In Production",
    liveUrl: "https://expensetracker.demo",
    githubUrl: "https://github.com/demo/expense-tracker",
    technologies: [
      { name: "React", category: "frontend" },
      { name: "TypeScript", category: "frontend" },
      { name: "Node.js", category: "backend" },
      { name: "MongoDB", category: "database" },
      { name: "Plaid API", category: "fintech" },
      { name: "TensorFlow.js", category: "ai" },
      { name: "Chart.js", category: "visualization" },
    ],
    features: [
      {
        title: "Smart Categorization",
        description: "AI-powered automatic expense categorization with 95%+ accuracy.",
        icon: Brain,
      },
      {
        title: "Budget Insights",
        description: "Personalized budget recommendations based on spending patterns.",
        icon: Target,
      },
      {
        title: "Bank Sync",
        description: "Secure bank account integration for automatic transaction import.",
        icon: Zap,
      },
      {
        title: "Visual Analytics",
        description: "Interactive charts and reports for spending trends and patterns.",
        icon: Package,
      },
    ],
    challenges: [
      {
        problem: "Secure handling of financial data",
        solution: "Implemented end-to-end encryption with PCI DSS compliance standards.",
      },
      {
        problem: "Accurate transaction categorization",
        solution: "Developed custom NLP model trained on 100K+ categorized transactions.",
      },
    ],
    results: [
      "20% average user savings increase",
      "4.7/5 user satisfaction rating",
      "10K+ active users",
    ],
  },
  5: {
    title: "Reading List",
    subtitle: "Personal book tracker",
    description: "A beautiful book tracking application for avid readers. Features reading progress tracking, personal notes, book recommendations based on reading history, and integration with popular book databases.",
    duration: "6 weeks",
    role: "Solo Developer",
    status: "Completed",
    liveUrl: "https://readinglist.demo",
    githubUrl: "https://github.com/demo/reading-list",
    technologies: [
      { name: "Next.js", category: "frontend" },
      { name: "TypeScript", category: "frontend" },
      { name: "Prisma", category: "backend" },
      { name: "PostgreSQL", category: "database" },
      { name: "OpenLibrary API", category: "external" },
      { name: "Vercel", category: "deployment" },
    ],
    features: [
      {
        title: "Reading Progress",
        description: "Track your reading progress with beautiful visualizations and statistics.",
        icon: Target,
      },
      {
        title: "Smart Recommendations",
        description: "Get personalized book recommendations based on your reading history.",
        icon: Brain,
      },
      {
        title: "Note Taking",
        description: "Capture thoughts and quotes while reading with rich text editor.",
        icon: Package,
      },
      {
        title: "Social Features",
        description: "Share reading lists and reviews with friends and book clubs.",
        icon: Zap,
      },
    ],
    challenges: [
      {
        problem: "Book data accuracy and completeness",
        solution: "Integrated multiple book APIs with intelligent data merging and deduplication.",
      },
      {
        problem: "Recommendation algorithm performance",
        solution: "Implemented collaborative filtering with content-based fallback for new users.",
      },
    ],
    results: [
      "50% increase in reading completion rate",
      "3000+ books tracked",
      "Featured on Product Hunt",
    ],
  },
  6: {
    title: "Plant Care Assistant",
    subtitle: "Indoor gardening companion",
    description: "A comprehensive plant care application that helps users maintain healthy indoor gardens. Features watering reminders, growth tracking, disease identification using computer vision, and a community platform for plant enthusiasts.",
    duration: "3 months",
    role: "Full Stack Developer",
    status: "In Beta",
    liveUrl: "https://plantcare.demo",
    githubUrl: "https://github.com/demo/plant-care",
    technologies: [
      { name: "React Native", category: "mobile" },
      { name: "TypeScript", category: "frontend" },
      { name: "Django", category: "backend" },
      { name: "PostgreSQL", category: "database" },
      { name: "TensorFlow", category: "ai" },
      { name: "AWS S3", category: "storage" },
      { name: "PlantNet API", category: "external" },
    ],
    features: [
      {
        title: "Care Reminders",
        description: "Smart watering and care schedules based on plant species and environment.",
        icon: Zap,
      },
      {
        title: "Disease Detection",
        description: "AI-powered plant health analysis using photo recognition.",
        icon: Brain,
      },
      {
        title: "Growth Tracking",
        description: "Visual timeline of plant growth with photo comparisons.",
        icon: Target,
      },
      {
        title: "Community Forum",
        description: "Connect with other plant parents for tips and troubleshooting.",
        icon: Package,
      },
    ],
    challenges: [
      {
        problem: "Accurate plant disease identification",
        solution: "Fine-tuned computer vision model on 50K+ labeled plant disease images.",
      },
      {
        problem: "Personalized care recommendations",
        solution: "Built ML model considering local climate, indoor conditions, and plant species.",
      },
    ],
    results: [
      "85% plant survival rate improvement",
      "15K+ beta users",
      "92% disease detection accuracy",
    ],
  },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = parseInt(id || "0", 10);
  const project = projectsData[projectId as keyof typeof projectsData];

  if (!project || !id) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link href="/">
            <a className="text-blue-400 hover:text-blue-300">Return to home</a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <span className="font-['Courier_Prime']">Back to Projects</span>
            </a>
          </Link>
        </motion.nav>

        {/* Hero Section */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 font-['Courier_Prime']">
            {project.title}
          </h1>
          <p className="text-xl text-gray-400 mb-6">{project.subtitle}</p>
          
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
            {project.liveUrl && (
              <a 
                href={project.liveUrl}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
            >
              <h2 className="text-2xl font-bold mb-4 font-['Courier_Prime']">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{project.description}</p>
            </motion.section>

            {/* Key Features */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
            >
              <h2 className="text-2xl font-bold mb-6 font-['Courier_Prime']">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {project.features.map((feature, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <feature.icon size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{feature.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Challenges & Solutions */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
            >
              <h2 className="text-2xl font-bold mb-6 font-['Courier_Prime']">Challenges & Solutions</h2>
              <div className="space-y-6">
                {project.challenges.map((challenge, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold text-red-400">Challenge:</h3>
                    <p className="text-gray-300 pl-4">{challenge.problem}</p>
                    <h3 className="font-semibold text-green-400 mt-3">Solution:</h3>
                    <p className="text-gray-300 pl-4">{challenge.solution}</p>
                  </div>
                ))}
              </div>
            </motion.section>
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
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      tech.category === 'frontend' ? 'border-blue-500/50 text-blue-400' :
                      tech.category === 'backend' ? 'border-green-500/50 text-green-400' :
                      tech.category === 'database' ? 'border-purple-500/50 text-purple-400' :
                      tech.category === 'ai' ? 'border-yellow-500/50 text-yellow-400' :
                      'border-gray-600 text-gray-400'
                    }`}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </motion.section>

            {/* Results */}
            {project.results && (
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
              >
                <h3 className="text-xl font-bold mb-4 font-['Courier_Prime']">Results</h3>
                <ul className="space-y-3">
                  {project.results.map((result, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{result}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Project Visual */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-8 border border-gray-800 flex items-center justify-center min-h-[200px]"
            >
              <Code2 size={48} className="text-gray-600" />
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}