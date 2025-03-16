// Define interfaces locally to avoid import issues
export interface Chapter {
  id: string;
  title: string;
  startTime: string;
  content: string;
}

export interface VideoTranscription {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  creator?: string;
  views?: number;
  uploadDate?: string;
  chapters: Chapter[];
}

export const mockVideos: VideoTranscription[] = [
  {
    id: 'windsurfing-kitesurfing-tips',
    title: 'Windsurfing & Kitesurfing Tips for Beginners',
    videoUrl: 'https://www.youtube.com/embed/fWfNWx7U4Pk',
    thumbnail: 'https://i.ytimg.com/vi/fWfNWx7U4Pk/hqdefault.jpg',
    creator: 'Water Sports Academy',
    views: 45678,
    uploadDate: '2024-04-20T10:00:00.000Z',
    chapters: [
      {
        id: 'new-1-1',
        title: 'Introduction to Windsurfing',
        startTime: '00:00',
        content: 'This video covers essential tips for beginners in windsurfing and kitesurfing. We\'ll start with the basics of equipment, safety, and techniques to get you started on your water sports journey.'
      },
      {
        id: 'new-1-2',
        title: 'Basic Techniques',
        startTime: '03:45',
        content: 'Learn the fundamental techniques for maintaining balance, controlling the sail, and navigating in different wind conditions. These skills form the foundation for more advanced maneuvers.'
      },
      {
        id: 'new-1-3',
        title: 'Safety Guidelines',
        startTime: '09:20',
        content: 'Safety is paramount in water sports. This section covers weather awareness, equipment checks, and emergency procedures to ensure you stay safe while enjoying windsurfing and kitesurfing.'
      }
    ]
  },
  {
    id: 'windsurfing-beginner-journey',
    title: 'My First Year of Windsurfing - From Beginner to Intermediate',
    videoUrl: 'https://www.youtube.com/embed/9eF51MGhOEk',
    thumbnail: 'https://i.ytimg.com/vi/9eF51MGhOEk/hqdefault.jpg',
    creator: 'WindSurf Journey',
    views: 38729,
    uploadDate: '2024-04-15T14:30:00.000Z',
    chapters: [
      {
        id: 'new-2-1',
        title: 'First Steps on the Board',
        startTime: '00:00',
        content: 'Follow my personal journey from complete beginner to intermediate windsurfer. This chapter covers the initial challenges, frustrations, and breakthrough moments during my first months of learning.'
      },
      {
        id: 'new-2-2',
        title: 'Building Confidence',
        startTime: '05:10',
        content: 'After the basics, building confidence is key to progression. Learn how consistent practice, gradual skill-building, and overcoming fear helped me advance to more challenging conditions.'
      },
      {
        id: 'new-2-3',
        title: 'Advanced Techniques',
        startTime: '12:35',
        content: 'By the end of my first year, I was able to try more advanced techniques. This section shows my progression to harness use, water starts, and basic planing - with tips for your own journey.'
      }
    ]
  },
  {
    id: 'windsurf-tutorial-basics',
    title: 'Windsurf Tutorial for Beginners - Comprehensive Guide',
    videoUrl: 'https://www.youtube.com/embed/sAxEm7gfAHo',
    thumbnail: 'https://i.ytimg.com/vi/sAxEm7gfAHo/hqdefault.jpg',
    creator: 'Pro Windsurfer',
    views: 56432,
    uploadDate: '2024-04-10T09:15:00.000Z',
    chapters: [
      {
        id: 'new-3-1',
        title: 'Equipment Overview',
        startTime: '00:00',
        content: 'This comprehensive tutorial starts with a detailed overview of windsurfing equipment. Learn about different board types, sail sizes, masts, booms, and how to choose the right setup for beginners.'
      },
      {
        id: 'new-3-2',
        title: 'On-Land Practice',
        startTime: '07:30',
        content: 'Before hitting the water, it\'s essential to practice on land. This section demonstrates simulator exercises, how to hold the sail properly, and basic stance and body positioning techniques.'
      },
      {
        id: 'new-3-3',
        title: 'First Water Session',
        startTime: '14:15',
        content: 'Now it\'s time to get wet! Learn the process of getting on the board, basic steering techniques, and how to handle falls and get back on the board safely in calm water conditions.'
      },
      {
        id: 'new-3-4',
        title: 'Common Mistakes to Avoid',
        startTime: '21:40',
        content: 'This final section covers the most common mistakes beginners make and how to avoid them. From improper sail handling to incorrect body positioning, these tips will accelerate your learning curve.'
      }
    ]
  },
  {
    id: 'getting-started',
    title: 'Getting Started with WindSurf IDE',
    videoUrl: 'https://www.youtube.com/embed/ENKR0_dE7Wc',
    thumbnail: 'https://i.ytimg.com/vi/ENKR0_dE7Wc/hqdefault.jpg',
    creator: 'WindSurf IDE Team',
    views: 128765,
    uploadDate: '2024-03-10T14:30:00.000Z',
    chapters: [
      {
        id: '1-1',
        title: 'Introduction to WindSurf IDE',
        startTime: '00:00',
        content: 'Welcome to this introduction to WindSurf IDE. WindSurf IDE is a powerful, modern code editor designed for developers who want to streamline their workflow and boost productivity. In this video, we\'ll cover the basics of setting up and using WindSurf IDE.'
      },
      {
        id: '1-2',
        title: 'Installation Process',
        startTime: '01:15',
        content: 'Installing WindSurf IDE is straightforward across all major operating systems. Simply download the installer from our website, run it, and follow the on-screen instructions. The installation wizard will guide you through setting up your development environment with recommended extensions and configurations.'
      },
      {
        id: '1-3',
        title: 'User Interface Overview',
        startTime: '03:30',
        content: 'Let\'s explore the user interface of WindSurf IDE. The main layout includes the editor area in the center, a file explorer on the left, and various panels for terminal, debugging, and extensions at the bottom. The menu bar at the top provides access to all features and settings. You can customize the layout and color themes to match your preferences.'
      },
      {
        id: '1-4',
        title: 'Creating Your First Project',
        startTime: '06:45',
        content: 'Now let\'s create your first project in WindSurf IDE. You can either open an existing folder, clone a Git repository, or start from a template. Templates are a great way to kickstart new projects with the correct structure and dependencies already set up.'
      }
    ]
  },
  {
    id: 'codium-integration',
    title: 'Codium AI Integration with WindSurf IDE',
    videoUrl: 'https://www.youtube.com/embed/C_D8V9odBQ8',
    thumbnail: 'https://i.ytimg.com/vi/C_D8V9odBQ8/hqdefault.jpg',
    creator: 'Tech Tutorials',
    views: 85342,
    uploadDate: '2024-03-12T09:15:00.000Z',
    chapters: [
      {
        id: '2-1',
        title: 'What is Codium AI',
        startTime: '00:00',
        content: 'Codium AI is a powerful artificial intelligence assistant integrated into WindSurf IDE. It helps developers write, understand, and debug code more efficiently. Unlike basic code completion tools, Codium can understand context, generate entire functions, and even explain complex code snippets to help you learn faster.'
      },
      {
        id: '2-2',
        title: 'Setting Up Codium',
        startTime: '04:20',
        content: 'To get started with Codium in WindSurf IDE, you\'ll need to install the Codium extension from the marketplace. Once installed, you\'ll need to authenticate with your Codium account or create a new one. You can then configure Codium\'s behavior and API key through the settings panel.'
      },
      {
        id: '2-3',
        title: 'Using Codium for Code Generation',
        startTime: '08:45',
        content: 'One of the most powerful features of Codium is code generation. To use this feature, simply write a comment describing what you want to achieve, then press Ctrl+Enter. Codium will analyze your project context and generate appropriate code. You can also select existing code and ask Codium to explain, refactor, or optimize it.'
      }
    ]
  },
  {
    id: 'extension-guide',
    title: 'Essential Extensions for WindSurf IDE',
    videoUrl: 'https://www.youtube.com/embed/8TcWGk1DJVs',
    thumbnail: 'https://i.ytimg.com/vi/8TcWGk1DJVs/hqdefault.jpg',
    creator: 'Dev Productivity',
    views: 54289,
    uploadDate: '2024-03-15T16:45:00.000Z',
    chapters: [
      {
        id: '3-1',
        title: 'Extension Marketplace Overview',
        startTime: '00:00',
        content: 'WindSurf IDE\'s extension marketplace contains thousands of plugins to enhance your development experience. In this section, we\'ll explore how to navigate the marketplace, search for extensions, and read reviews to find the best tools for your workflow.'
      },
      {
        id: '3-2',
        title: 'Language Support Extensions',
        startTime: '05:10',
        content: 'Language support extensions add features like syntax highlighting, code completion, and linting for specific programming languages. We recommend installing extensions for all languages you regularly use. Popular choices include TypeScript, Python, and Rust extensions that provide deep integration with language servers.'
      },
      {
        id: '3-3',
        title: 'Productivity and Workflow Extensions',
        startTime: '10:25',
        content: 'Beyond language support, productivity extensions can dramatically improve your efficiency. Tools like GitLens enhance source control, while Prettier and ESLint automate code formatting and quality checks. We\'ll also cover note-taking extensions, theme customizers, and remote collaboration tools.'
      }
    ]
  },
  {
    id: 'debugging-techniques',
    title: 'Advanced Debugging in WindSurf IDE',
    videoUrl: 'https://www.youtube.com/embed/oL1lEzWSxPE',
    thumbnail: 'https://i.ytimg.com/vi/oL1lEzWSxPE/hqdefault.jpg',
    creator: 'Debug Master',
    views: 32456,
    uploadDate: '2024-03-18T11:20:00.000Z',
    chapters: [
      {
        id: '4-1',
        title: 'Debugging Fundamentals',
        startTime: '00:00',
        content: 'WindSurf IDE includes a powerful integrated debugger that works with most popular languages and frameworks. We\'ll start with the basics of setting breakpoints, stepping through code, and inspecting variables to find and fix issues in your applications.'
      },
      {
        id: '4-2',
        title: 'Configuring Launch Profiles',
        startTime: '03:15',
        content: 'To debug effectively, you\'ll need to set up launch configurations in launch.json. We\'ll show you how to configure different environments, command-line arguments, and environment variables for your debugging sessions. You\'ll learn to create configurations for various scenarios like unit testing or cloud deployment.'
      },
      {
        id: '4-3',
        title: 'Conditional Breakpoints and Watches',
        startTime: '07:40',
        content: 'Advanced debugging techniques include setting conditional breakpoints that only trigger when specific conditions are met. You can also use watch expressions to monitor values across your application and logpoints to log information without modifying your code.'
      },
      {
        id: '4-4',
        title: 'Remote Debugging',
        startTime: '12:20',
        content: 'WindSurf IDE supports debugging applications running on remote machines, containers, or cloud services. We\'ll demonstrate how to configure SSH connections, attach to running processes, and debug applications in Docker containers or Kubernetes pods.'
      }
    ]
  },
  {
    id: 'git-workflow',
    title: 'Git Integration in WindSurf IDE',
    videoUrl: 'https://www.youtube.com/embed/ZEqSuggBKo8',
    thumbnail: 'https://i.ytimg.com/vi/ZEqSuggBKo8/hqdefault.jpg',
    creator: 'Version Control Pro',
    views: 47234,
    uploadDate: '2024-03-24T08:30:00.000Z',
    chapters: [
      {
        id: '5-1',
        title: 'Git Basics in WindSurf IDE',
        startTime: '00:00',
        content: 'WindSurf IDE comes with built-in Git integration that makes version control seamless. This section covers initializing repositories, cloning existing projects, and understanding the Git status indicators in the file explorer and gutter.'
      },
      {
        id: '5-2',
        title: 'Committing and Branching',
        startTime: '04:30',
        content: 'Learn how to stage changes, create commits with meaningful messages, and work with branches all from within the IDE. The source control panel provides a visual interface for managing your Git workflow without needing the command line.'
      },
      {
        id: '5-3',
        title: 'Pull Requests and Code Reviews',
        startTime: '09:15',
        content: 'WindSurf IDE integrates with GitHub, GitLab, and Bitbucket to let you create, review, and merge pull requests without leaving your editor. You can view inline comments, suggest changes, and resolve conflicts with the built-in merge editor.'
      }
    ]
  },
  {
    id: 'performance-tips',
    title: 'Optimizing WindSurf IDE Performance',
    videoUrl: 'https://www.youtube.com/embed/Wvyc2E6OHm8',
    thumbnail: 'https://i.ytimg.com/vi/Wvyc2E6OHm8/hqdefault.jpg',
    creator: 'Performance Guru',
    views: 28976,
    uploadDate: '2024-04-01T14:10:00.000Z',
    chapters: [
      {
        id: '6-1',
        title: 'Understanding Performance Factors',
        startTime: '00:00',
        content: 'WindSurf IDE is designed to be lightweight and fast, but large projects or certain extensions can impact performance. This section explains how the IDE uses system resources and identifies common causes of slowdowns.'
      },
      {
        id: '6-2',
        title: 'Configuration Optimization',
        startTime: '05:30',
        content: 'Adjust key settings to improve performance, including workspace trust settings, file watching limits, and extension loading behavior. We\'ll also cover how to use workspace-specific settings to optimize for different project types.'
      },
      {
        id: '6-3',
        title: 'Extension Management',
        startTime: '11:45',
        content: 'Extensions can significantly impact performance. Learn to identify resource-intensive extensions using the built-in Developer: Profile Extensions command. We\'ll show you how to disable unnecessary extensions for specific workspaces and create targeted extension profiles.'
      }
    ]
  },
  {
    id: 'remote-development',
    title: 'Remote Development with WindSurf IDE',
    videoUrl: 'https://www.youtube.com/embed/824Fyh146_w',
    thumbnail: 'https://i.ytimg.com/vi/824Fyh146_w/hqdefault.jpg',
    creator: 'Remote Dev Expert',
    views: 61432,
    uploadDate: '2024-04-05T10:45:00.000Z',
    chapters: [
      {
        id: '8-1',
        title: 'Remote Development Options',
        startTime: '00:00',
        content: 'WindSurf IDE offers powerful remote development capabilities. This section introduces the three main approaches: SSH remotes for connecting to any server, Container remotes for Dockerized development, and WSL remotes for Windows users working with Linux tools.'
      },
      {
        id: '8-2',
        title: 'Setting Up SSH Remotes',
        startTime: '03:45',
        content: 'Learn how to configure secure SSH connections to remote development machines. We\'ll cover key-based authentication, SSH config files, and how to install the necessary server components for a smooth remote development experience.'
      },
      {
        id: '8-3',
        title: 'Working with Containers',
        startTime: '08:10',
        content: 'Container-based development provides consistent environments across your team. This chapter shows how to open your code inside a Docker container, customize container configurations with devcontainer.json, and handle volume mounting for performance.'
      }
    ]
  },
  {
    id: 'customization-tips',
    title: 'Customizing WindSurf IDE to Your Workflow',
    videoUrl: 'https://www.youtube.com/embed/ilTzOaYLeHA',
    thumbnail: 'https://i.ytimg.com/vi/ilTzOaYLeHA/hqdefault.jpg',
    creator: 'IDE Customization Expert',
    views: 39587,
    uploadDate: '2024-04-08T15:30:00.000Z',
    chapters: [
      {
        id: '9-1',
        title: 'Theme and UI Customization',
        startTime: '00:00',
        content: 'Make WindSurf IDE your own by customizing colors, fonts, and layouts. We\'ll explore the built-in themes, how to install new ones from the marketplace, and how to fine-tune specific UI elements through settings.json and CSS modifications.'
      },
      {
        id: '9-2',
        title: 'Keyboard Shortcuts and Keymaps',
        startTime: '04:20',
        content: 'Keyboard shortcuts are essential for efficient coding. Learn how to view, modify, and create custom keyboard shortcuts. We also cover how to import keymaps from other editors like Visual Studio, JetBrains IDEs, or Sublime Text if you\'re transitioning from another tool.'
      },
      {
        id: '9-3',
        title: 'Creating User Snippets',
        startTime: '08:15',
        content: 'Snippets help you quickly insert common code patterns. This section demonstrates how to create custom snippets for various languages, use snippet variables for dynamic content, and organize snippets in your workspace or globally across projects.'
      }
    ]
  },
  {
    id: 'advanced-features',
    title: 'Advanced Features of WindSurf IDE',
    videoUrl: 'https://www.youtube.com/embed/3xk2qG2QPdU',
    thumbnail: 'https://i.ytimg.com/vi/3xk2qG2QPdU/hqdefault.jpg',
    creator: 'Advanced Development Team',
    views: 23456,
    uploadDate: '2024-04-15T13:20:00.000Z',
    chapters: [
      {
        id: '10-1',
        title: 'Advanced Search Capabilities',
        startTime: '00:00',
        content: 'WindSurf IDE offers powerful search features beyond simple text matching. Learn to use regular expressions, search across multiple projects, and utilize semantic search to find code by meaning rather than exact matches.'
      },
      {
        id: '10-2',
        title: 'Code Refactoring Tools',
        startTime: '04:30',
        content: 'Refactoring is essential for maintaining clean code. This section covers WindSurf IDE\'s automated refactoring tools for variable renaming, method extraction, interface implementation, and more complex code restructuring.'
      },
      {
        id: '10-3',
        title: 'Advanced Terminal Integration',
        startTime: '09:00',
        content: 'The integrated terminal in WindSurf IDE is highly customizable and supports advanced workflows. Learn how to configure multiple shells, use split terminals, create task runners, and integrate with external tools and build systems.'
      }
    ]
  }
];

export default mockVideos; 