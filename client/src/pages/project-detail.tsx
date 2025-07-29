import { useParams, Link } from "wouter";
import { ArrowLeft, ExternalLink, Github, Code2, Zap, Brain, Target, Package, Calendar, User, Image, Terminal, Clock, Download, Play, Settings, GitBranch, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

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
    screenshots: [
      { title: "Dashboard", description: "Main meal planning interface" },
      { title: "Recipe Details", description: "AI-powered recipe suggestions" },
      { title: "Shopping List", description: "Auto-generated shopping lists" },
      { title: "Analytics", description: "Nutritional tracking dashboard" },
    ],
    commands: [
      { title: "Installation", command: "npm install smart-meal-planner", description: "Install the package via npm" },
      { title: "Start Development", command: "npm run dev", description: "Start the development server" },
      { title: "Build Production", command: "npm run build", description: "Build for production deployment" },
      { title: "Run Tests", command: "npm test", description: "Execute the test suite" },
      { title: "Database Setup", command: "npm run db:migrate", description: "Run database migrations" },
    ],
    versionHistory: [
      { version: "v2.1.0", date: "2024-12-15", status: "latest", changes: ["Added meal prep scheduling", "Improved AI recommendations", "Bug fixes for mobile app"] },
      { version: "v2.0.0", date: "2024-11-20", status: "stable", changes: ["Major UI overhaul", "New collaboration features", "Enhanced nutritional tracking"] },
      { version: "v1.5.2", date: "2024-10-30", status: "stable", changes: ["Fixed shopping list sync issues", "Performance improvements", "Updated dietary restriction options"] },
      { version: "v1.5.0", date: "2024-10-15", status: "stable", changes: ["Added family sharing", "Introduced meal planning templates", "API rate limiting improvements"] },
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
    screenshots: [
      { title: "Timer Interface", description: "Clean Pomodoro timer design" },
      { title: "Statistics", description: "Productivity analytics dashboard" },
      { title: "Team Sessions", description: "Collaborative focus sessions" },
      { title: "Sound Library", description: "Ambient soundscape collection" },
    ],
    commands: [
      { title: "Installation", command: "npm install focus-timer-pro", description: "Install via npm" },
      { title: "Start App", command: "npm start", description: "Launch the application" },
      { title: "Build", command: "npm run build", description: "Create production build" },
      { title: "Test", command: "npm run test", description: "Run unit tests" },
    ],
    versionHistory: [
      { version: "v3.2.1", date: "2024-12-10", status: "latest", changes: ["Enhanced team sync features", "New ambient sounds", "iOS 18 compatibility"] },
      { version: "v3.1.0", date: "2024-11-25", status: "stable", changes: ["Added team collaboration", "Improved battery optimization", "New productivity insights"] },
      { version: "v3.0.0", date: "2024-11-01", status: "stable", changes: ["Complete UI redesign", "AI-powered break suggestions", "Cross-platform sync"] },
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
    screenshots: [
      { title: "Live Dashboard", description: "Real-time weather data display" },
      { title: "Historical Charts", description: "Weather trend visualizations" },
      { title: "Alert Configuration", description: "Customizable weather alerts" },
      { title: "Data Export", description: "CSV and JSON data export tools" },
    ],
    commands: [
      { title: "Setup Hardware", command: "python setup_sensors.py", description: "Configure Raspberry Pi sensors" },
      { title: "Start Collection", command: "python weather_collector.py", description: "Begin data collection" },
      { title: "Launch Dashboard", command: "python app.py", description: "Start web dashboard" },
      { title: "Export Data", command: "python export_data.py --format csv", description: "Export collected data" },
    ],
    versionHistory: [
      { version: "v2.3.0", date: "2024-12-01", status: "latest", changes: ["Added air quality monitoring", "Improved ML forecasting", "New mobile responsive design"] },
      { version: "v2.2.1", date: "2024-11-15", status: "stable", changes: ["Fixed sensor calibration bug", "Enhanced data visualization", "Better error handling"] },
      { version: "v2.1.0", date: "2024-10-20", status: "stable", changes: ["Added MQTT support", "Integrated with Grafana", "Predictive weather alerts"] },
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
    screenshots: [
      { title: "Expense Dashboard", description: "Overview of spending patterns" },
      { title: "Budget Analytics", description: "AI-powered budget insights" },
      { title: "Category Breakdown", description: "Smart expense categorization" },
      { title: "Reports", description: "Monthly financial reports" },
    ],
    commands: [
      { title: "Install", command: "npm install expense-tracker", description: "Install the application" },
      { title: "Start Development", command: "npm run dev", description: "Launch development server" },
      { title: "Build", command: "npm run build", description: "Create production build" },
      { title: "Import Data", command: "npm run import-bank-data", description: "Import bank transaction data" },
    ],
    versionHistory: [
      { version: "v1.8.2", date: "2024-12-05", status: "latest", changes: ["Enhanced AI categorization", "New budget alerts", "Improved mobile UI"] },
      { version: "v1.7.0", date: "2024-11-18", status: "stable", changes: ["Added investment tracking", "Multi-currency support", "Better data visualization"] },
      { version: "v1.6.1", date: "2024-10-25", status: "stable", changes: ["Fixed sync issues", "Performance improvements", "Security updates"] },
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
    screenshots: [
      { title: "Book Library", description: "Personal reading collection" },
      { title: "Reading Progress", description: "Track reading goals and progress" },
      { title: "Notes & Highlights", description: "Capture thoughts while reading" },
      { title: "Recommendations", description: "AI-powered book suggestions" },
    ],
    commands: [
      { title: "Install Dependencies", command: "npm install", description: "Install required packages" },
      { title: "Setup Database", command: "npx prisma db push", description: "Initialize database schema" },
      { title: "Start Development", command: "npm run dev", description: "Launch development server" },
      { title: "Import Books", command: "npm run import-goodreads", description: "Import from Goodreads CSV" },
    ],
    versionHistory: [
      { version: "v1.4.1", date: "2024-11-28", status: "latest", changes: ["Added reading statistics", "Improved book search", "Social sharing features"] },
      { version: "v1.3.0", date: "2024-11-10", status: "stable", changes: ["Book club integration", "Reading goals", "Enhanced recommendation engine"] },
      { version: "v1.2.2", date: "2024-10-15", status: "stable", changes: ["Fixed sync issues", "Better mobile experience", "Performance optimizations"] },
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
    screenshots: [
      { title: "Plant Collection", description: "Manage your indoor garden" },
      { title: "Care Reminders", description: "Smart watering schedules" },
      { title: "Disease Scanner", description: "AI-powered plant health check" },
      { title: "Community", description: "Connect with plant enthusiasts" },
    ],
    commands: [
      { title: "Install App", command: "npm install plant-care-assistant", description: "Install the mobile app" },
      { title: "Setup Backend", command: "python manage.py migrate", description: "Initialize Django database" },
      { title: "Start Server", command: "python manage.py runserver", description: "Launch development server" },
      { title: "Train Model", command: "python train_disease_model.py", description: "Train plant disease detection model" },
    ],
    versionHistory: [
      { version: "v0.9.3", date: "2024-12-12", status: "latest", changes: ["Enhanced disease detection", "New plant species support", "Community features beta"] },
      { version: "v0.8.5", date: "2024-11-22", status: "stable", changes: ["Improved care recommendations", "Bug fixes", "Performance optimizations"] },
      { version: "v0.7.0", date: "2024-11-01", status: "stable", changes: ["Initial beta release", "Core features implementation", "Basic AI integration"] },
    ],
  },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = parseInt(id || "0", 10);
  const project = projectsData[projectId as keyof typeof projectsData];
  const [activeTab, setActiveTab] = useState<'overview' | 'commands' | 'versions'>('overview');

  if (!project || !id) {
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
function OverviewTab({ project }: { project: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Screenshots Carousel Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-6 font-['Courier_Prime']">Screenshots</h2>
          <ScreenshotCarousel screenshots={project.screenshots} />
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
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-6 font-['Courier_Prime']">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {project.features.map((feature: any, index: number) => (
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
            {project.challenges.map((challenge: any, index: number) => (
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
            {project.technologies.map((tech: any, index: number) => (
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
              {project.results.map((result: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{result}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
      </div>
    </div>
  );
}

// Commands Tab Component
function CommandsTab({ project }: { project: any }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

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
        <p className="text-gray-400 mb-8">Follow these commands to get started with {project.title}:</p>
        
        <div className="space-y-6">
          {project.commands?.map((command: any, index: number) => (
            <div key={index} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Settings size={16} className="text-blue-400" />
                    {command.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{command.description}</p>
                  <div className="bg-black rounded-lg p-3 border border-gray-800">
                    <code className="text-green-400 font-['Courier_Prime'] text-sm">{command.command}</code>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(command.command, index)}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  {copiedIndex === index ? (
                    <>
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

// Versions Tab Component
function VersionsTab({ project }: { project: any }) {
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
        <p className="text-gray-400 mb-8">Track the evolution of {project.title} through its version releases:</p>
        
        <div className="space-y-6">
          {project.versionHistory?.map((version: any, index: number) => (
            <div key={index} className="relative">
              {/* Timeline Line */}
              {index < project.versionHistory.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-700"></div>
              )}
              
              <div className="flex items-start gap-4">
                {/* Version Badge */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  version.status === 'latest' 
                    ? 'border-green-500 bg-green-500/20' 
                    : 'border-gray-600 bg-gray-800'
                }`}>
                  <GitBranch size={16} className={version.status === 'latest' ? 'text-green-400' : 'text-gray-400'} />
                </div>
                
                {/* Version Details */}
                <div className="flex-1 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white font-['Courier_Prime']">{version.version}</h3>
                      {version.status === 'latest' && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/50">
                          Latest
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-sm">{version.date}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-300">Changes:</h4>
                    <ul className="space-y-1">
                      {version.changes.map((change: string, changeIndex: number) => (
                        <li key={changeIndex} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                          <span className="text-gray-400 text-sm">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

// Screenshots Carousel Component
function ScreenshotCarousel({ screenshots }: { screenshots: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    skipSnaps: false,
    dragFree: false
  });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-8 border border-gray-700 flex flex-col items-center justify-center min-h-[200px]">
        <Image size={48} className="text-gray-500 mb-3" />
        <p className="text-gray-400 text-center">No screenshots available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {screenshots.map((screenshot: any, index: number) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-8 border border-gray-700 flex flex-col items-center justify-center min-h-[220px] mx-2">
                <Image size={48} className="text-gray-500 mb-4" />
                <h3 className="font-semibold text-white text-lg text-center mb-2">{screenshot.title}</h3>
                <p className="text-sm text-gray-400 text-center max-w-xs">{screenshot.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {screenshots.length > 1 && (
        <>
          <button
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-gray-600 flex items-center justify-center transition-all ${
              prevBtnEnabled ? "text-white hover:bg-black/70" : "text-gray-600 cursor-not-allowed"
            }`}
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-gray-600 flex items-center justify-center transition-all ${
              nextBtnEnabled ? "text-white hover:bg-black/70" : "text-gray-600 cursor-not-allowed"
            }`}
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {screenshots.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {screenshots.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex ? "bg-white" : "bg-gray-600"
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
