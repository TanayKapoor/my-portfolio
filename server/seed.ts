import { db } from "./db";
import { projects, workExperiences } from "@shared/schema";

const projectsData = [
  {
    title: "Smart Meal Planner",
    subtitle: "AI-powered meal planning app",
    description: "A comprehensive meal planning application that leverages artificial intelligence to suggest personalized recipes based on dietary preferences, available ingredients, and nutritional goals. The app learns from user behavior to improve recommendations over time.",
    duration: "3 months",
    role: "Full Stack Developer",
    status: "Completed",
    technologies: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Redis", "OpenAI API", "Docker"],
    features: [
      "Intelligent Recipe Suggestions - AI analyzes user preferences, dietary restrictions, and ingredient availability",
      "Nutritional Tracking - Comprehensive nutritional analysis for each meal with daily, weekly, and monthly tracking",
      "Shopping List Generation - Automatically generates optimized shopping lists based on selected recipes",
      "Meal Calendar - Visual calendar interface for planning meals up to 30 days in advance"
    ],
    challenges: [
      "Complex algorithm optimization for recipe matching with multiple dietary constraints",
      "Real-time nutritional calculation requiring efficient database queries and caching strategies",
      "Integration with multiple external APIs while maintaining consistent response times"
    ],
    results: [
      "94% user satisfaction rate in beta testing with 500+ active users",
      "40% reduction in meal planning time compared to traditional methods",
      "Featured on ProductHunt with 200+ upvotes and positive reviews"
    ],
    demoUrl: "https://smartmealplanner.demo",
    githubUrl: "https://github.com/demo/smart-meal-planner",
    colorTheme: "green",
    order: 1,
    featured: true
  },
  {
    title: "Focus Timer Pro",
    subtitle: "Minimalist productivity app",
    description: "Minimalist productivity app with Pomodoro technique and ambient soundscapes for deep focus sessions.",
    duration: "2 months",
    role: "Lead Developer",
    status: "Active",
    technologies: ["React Native", "TypeScript", "Redux", "Firebase", "Node.js", "Express"],
    features: [
      "Pomodoro Timer - Customizable work and break intervals with visual and audio notifications",
      "Ambient Soundscapes - High-quality background sounds including nature, cafe, and white noise",
      "Progress Analytics - Detailed statistics and trends to track productivity over time",
      "Focus Goals - Set daily and weekly focus targets with achievement tracking"
    ],
    challenges: [
      "Cross-platform audio synchronization and background processing optimization",
      "Battery usage optimization for extended focus sessions on mobile devices",
      "Offline functionality ensuring timer works without internet connectivity"
    ],
    results: [
      "15,000+ downloads in first month with 4.8-star rating on app stores",
      "89% user retention rate after 30 days of usage",
      "Integration partnerships with 3 major productivity platforms"
    ],
    demoUrl: "https://focustimer.app",
    githubUrl: "https://github.com/demo/focus-timer",
    colorTheme: "blue",
    order: 2,
    featured: true
  },
  {
    title: "Local Weather Station",
    subtitle: "IoT weather tracking system",
    description: "Personal weather tracking app using IoT sensors with beautiful data visualizations and forecasts.",
    duration: "4 months",
    role: "IoT Developer",
    status: "Completed",
    technologies: ["Python", "Raspberry Pi", "React", "D3.js", "InfluxDB", "MQTT", "Arduino"],
    features: [
      "Real-time Sensor Data - Temperature, humidity, pressure, and air quality monitoring",
      "Weather Predictions - Machine learning models for local weather forecasting",
      "Data Visualization - Interactive charts and graphs showing weather trends",
      "Alert System - Configurable notifications for extreme weather conditions"
    ],
    challenges: [
      "Waterproofing and weatherproofing outdoor sensor installations",
      "Data transmission reliability in various weather conditions and network outages",
      "Calibration accuracy across different sensor types and environmental conditions"
    ],
    results: [
      "99.2% uptime with accurate readings within 0.5°C of professional stations",
      "Open-sourced hardware design adopted by 50+ maker community projects",
      "Featured in IoT Weekly newsletter with 10,000+ subscribers"
    ],
    demoUrl: "https://weatherstation.local",
    githubUrl: "https://github.com/demo/weather-station",
    colorTheme: "yellow",
    order: 3,
    featured: false
  },
  {
    title: "Code Snippet Manager",
    subtitle: "Developer productivity tool",
    description: "A powerful code snippet management tool with syntax highlighting, tagging, and team collaboration features.",
    duration: "6 weeks",
    role: "Frontend Developer",
    status: "Active",
    technologies: ["Vue.js", "TypeScript", "Electron", "Monaco Editor", "SQLite", "Prisma"],
    features: [
      "Syntax Highlighting - Support for 150+ programming languages with customizable themes",
      "Smart Tagging - AI-powered automatic tagging and categorization of code snippets",
      "Team Collaboration - Share snippet collections with team members and version control",
      "Quick Search - Instant search across all snippets with fuzzy matching and filters"
    ],
    challenges: [
      "Performance optimization for large snippet collections with thousands of entries",
      "Cross-platform compatibility ensuring consistent experience across operating systems",
      "Real-time collaboration without conflicts when multiple users edit simultaneously"
    ],
    results: [
      "2,500+ active users across 40+ countries with positive feedback",
      "Featured on GitHub Trending for developer tools category",
      "Adopted by 15+ development teams for internal snippet management"
    ],
    demoUrl: "https://snippetmanager.dev",
    githubUrl: "https://github.com/demo/snippet-manager",
    colorTheme: "purple",
    order: 4,
    featured: false
  },
  {
    title: "E-commerce Analytics",
    subtitle: "Business intelligence platform",
    description: "Comprehensive analytics dashboard for e-commerce businesses with real-time insights and predictive modeling.",
    duration: "5 months",
    role: "Data Engineer",
    status: "Active",
    technologies: ["Python", "FastAPI", "React", "Pandas", "PostgreSQL", "Redis", "Celery", "Tableau"],
    features: [
      "Real-time Dashboards - Live sales, inventory, and customer behavior tracking",
      "Predictive Analytics - Machine learning models for sales forecasting and inventory optimization",
      "Customer Segmentation - Advanced clustering algorithms for targeted marketing campaigns",
      "Performance Metrics - KPI tracking with customizable alerts and automated reporting"
    ],
    challenges: [
      "Processing large datasets with millions of transactions while maintaining real-time performance",
      "Data pipeline reliability ensuring accurate analytics despite various data source failures",
      "Scalable architecture supporting multiple tenants with isolated data and customizations"
    ],
    results: [
      "35% increase in sales efficiency for client businesses using predictive insights",
      "Processing 1M+ transactions daily with sub-second query response times",
      "Deployed across 25+ e-commerce businesses with 99.9% uptime"
    ],
    demoUrl: "https://ecommerce-analytics.biz",
    githubUrl: "https://github.com/demo/ecommerce-analytics",
    colorTheme: "red",
    order: 5,
    featured: true
  },
  {
    title: "Task Automation Hub",
    subtitle: "Workflow automation platform",
    description: "No-code automation platform that connects various APIs and services to streamline repetitive tasks.",
    duration: "8 months",
    role: "Platform Engineer",
    status: "Active",
    technologies: ["Node.js", "React", "MongoDB", "Docker", "Kubernetes", "Redis", "Webhook APIs"],
    features: [
      "Visual Workflow Builder - Drag-and-drop interface for creating complex automation workflows",
      "API Integrations - 200+ pre-built connectors for popular services and custom webhook support",
      "Scheduled Execution - Flexible scheduling with cron expressions and event-based triggers",
      "Error Handling - Comprehensive retry logic and failure notifications with detailed logs"
    ],
    challenges: [
      "Reliable execution of complex workflows with dependencies and error recovery mechanisms",
      "Scalable architecture handling thousands of concurrent automation workflows",
      "User-friendly interface abstracting complex technical concepts for non-technical users"
    ],
    results: [
      "500+ businesses automated 10,000+ repetitive tasks saving 40 hours per week on average",
      "99.8% workflow execution success rate with comprehensive error handling and recovery",
      "Featured in TechCrunch as a top productivity tool for small businesses"
    ],
    demoUrl: "https://automationhub.io",
    githubUrl: "https://github.com/demo/automation-hub",
    colorTheme: "teal",
    order: 6,
    featured: false
  }
];

const workExperiencesData = [
  {
    position: "Intern - Software Development",
    company: "InnovateLabs",
    location: "Remote",
    duration: "2019 - 2020",
    startDate: "2019",
    endDate: "2020",
    description: [
      "Assisted in developing mobile applications using React Native",
      "Learned fundamentals of software engineering and testing",
      "Participated in code reviews and documentation",
      "Built personal projects to strengthen programming skills"
    ],
    technologies: ["React Native", "JavaScript", "Firebase", "Git"],
    type: "past",
    order: 1
  },
  {
    position: "Junior Developer",
    company: "StartupHub India",
    location: "Delhi, India",
    duration: "2020 - 2021",
    startDate: "2020",
    endDate: "2021",
    description: [
      "Worked on full-stack web applications using MERN stack",
      "Contributed to open-source projects and internal tools",
      "Participated in agile development processes",
      "Gained experience in deployment and DevOps practices"
    ],
    technologies: ["MongoDB", "Express.js", "React", "Node.js", "Git", "Linux"],
    type: "past",
    order: 2
  },
  {
    position: "Software Engineer",
    company: "DataBridge Analytics",
    location: "Bangalore, India",
    duration: "2021 - 2023",
    startDate: "2021",
    endDate: "2023",
    description: [
      "Developed data visualization dashboards using React and D3.js",
      "Built ETL pipelines for processing large-scale datasets",
      "Implemented machine learning models for predictive analytics",
      "Collaborated with cross-functional teams on product roadmap"
    ],
    technologies: ["JavaScript", "Python", "React", "Django", "PostgreSQL", "Redis"],
    type: "past",
    order: 3
  },
  {
    position: "Full Stack Machine Learning Engineer",
    company: "TechFlow Solutions",
    location: "Mumbai, India",
    duration: "2023 - Present",
    startDate: "2023",
    endDate: "Present",
    description: [
      "Leading development of AI-powered products using modern ML frameworks",
      "Building scalable web applications with React, Node.js, and Python",
      "Implementing LLM integrations and prompt engineering solutions",
      "Architecting cloud-native solutions for production ML workflows"
    ],
    technologies: ["Python", "React", "Node.js", "TensorFlow", "AWS", "Docker"],
    type: "current",
    order: 4
  }
];

export async function seedProjects() {
  try {
    console.log("Starting to seed projects...");
    
    // Clear existing projects (optional)
    await db.delete(projects);
    
    // Insert new projects
    for (const project of projectsData) {
      await db.insert(projects).values(project);
      console.log(`Inserted project: ${project.title}`);
    }
    
    console.log("Projects seeded successfully!");
  } catch (error) {
    console.error("Error seeding projects:", error);
    throw error;
  }
}

export async function seedWorkExperiences() {
  try {
    console.log("Starting to seed work experiences...");
    
    // Clear existing work experiences (optional)
    await db.delete(workExperiences);
    
    // Insert new work experiences
    for (const workExperience of workExperiencesData) {
      await db.insert(workExperiences).values(workExperience);
      console.log(`Inserted work experience: ${workExperience.position} at ${workExperience.company}`);
    }
    
    console.log("Work experiences seeded successfully!");
  } catch (error) {
    console.error("Error seeding work experiences:", error);
    throw error;
  }
}

export async function seedAll() {
  try {
    await seedProjects();
    await seedWorkExperiences();
    console.log("All data seeded successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAll()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}