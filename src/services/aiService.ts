import type { RoadmapData } from '../context/RoadmapContext';

// Helper to clean up titles for matching
const matchRole = (role: string, keywords: string[]): boolean => {
  return keywords.some(kw => role.toLowerCase().includes(kw));
};

// ----------------------------------------------------
// REAL STREAMING OPENAI COMPLETIONS FOR NOVA AI
// ----------------------------------------------------
export interface NovaAIContext {
  career: string;
  completedCount: number;
  totalCount: number;
  xp: number;
  level: number;
  resumeScore: number;
  githubScore: string;
}

export const streamNovaAIResponse = async (
  prompt: string,
  context: NovaAIContext,
  apiKey?: string,
  onToken?: (token: string) => void
): Promise<string> => {
  const systemPrompt = `You are Nova AI, a premium, encouraging, and highly intelligent Career Copilot similar to Apple Intelligence or Cursor AI.
  You are mentoring a student pursuing a career in: "${context.career || 'Software Engineering'}".
  Here is their active learning telemetry:
  - Completed milestones: ${context.completedCount} / ${context.totalCount} steps.
  - User level: Level ${context.level} (XP: ${context.xp}).
  - Resume ATS Score: ${context.resumeScore || 'Un-scored'}%.
  - GitHub Portfolio Score: ${context.githubScore || 'Un-scored'}.

  When answering, refer directly to their progress, resume metrics, or completed projects to give highly personalized, context-aware advice! Keep answers concise, and format code blocks, lists, or tables using Markdown when appropriate.`;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          stream: true,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('API Request Failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let completeText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            const cleanedLine = line.trim();
            if (cleanedLine === 'data: [DONE]') continue;
            if (cleanedLine.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(cleanedLine.substring(6));
                const content = parsed.choices[0].delta.content || '';
                if (content) {
                  completeText += content;
                  if (onToken) onToken(content);
                }
              } catch (e) {
                // skip malformed chunks
              }
            }
          }
        }
        return completeText;
      }
    } catch (error) {
      console.warn('Real AI streaming failed, falling back to local compilation...', error);
    }
  }

  // Fallback Local Streaming Simulator
  const lowercasePrompt = prompt.toLowerCase();
  let responseText = '';

  if (lowercasePrompt.includes('explain') || lowercasePrompt.includes('what is')) {
    responseText = `As your Career Copilot, I'd love to explain this! In your current path as a **${context.career || 'Software Developer'}**, understanding core principles is key.
    
Here's a breakdown of the concept:
* **Definition**: It acts as a modular container encapsulating specific state behaviors.
* **Use Case**: Used heavily to isolate concerns and decouple complex file configurations.
* **Aesthetic Tip**: When building this, integrate smooth Framer Motion transitions to make it feel premium.

Since you've completed **${context.completedCount}/${context.totalCount}** steps on your roadmap, mastering this will unlock your next milestones!`;
  } else if (lowercasePrompt.includes('today\'s plan') || lowercasePrompt.includes('task') || lowercasePrompt.includes('what should i do')) {
    responseText = `Checking your telemetry dashboard... You are currently at **Level ${context.level}** with **${context.xp} XP**. 

Here is your customized **Nova AI Action Plan** for today:
1. **Morning (Theory)**: Read up on documentation relating to your next step.
2. **Afternoon (Practice)**: Code 2 practice exercises to secure your daily streak.
3. **Evening (Project)**: Write 20-30 lines of code for your recommended portfolio projects.

Let's maintain your learning streak! What module would you like to debug first?`;
  } else {
    responseText = `Hello! I'm Nova AI, your Career Copilot. I see you're pursuing a **${context.career || 'career goal'}**. 

Here is what I suggest based on your active scores:
* Your **Resume ATS Score** is **${context.resumeScore}%**. We should optimize your project descriptors to boost this.
* You have earned **${context.xp} XP** so far. Completing your current roadmap step will award you another **250 XP** and advance your level.

How can I help you write code, design database schemas, or practice interview questions today?`;
  }

  // Stream characters out with a small delay
  let activeText = '';
  for (let i = 0; i < responseText.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 8)); // fast typing typing
    const char = responseText[i];
    activeText += char;
    if (onToken) onToken(char);
  }

  return responseText;
};

// ----------------------------------------------------
// ROADMAP DATA GENERATOR
// ----------------------------------------------------
export const generateAIRoadmap = async (career: string, apiKey?: string): Promise<RoadmapData> => {
  if (apiKey && apiKey.trim() !== '') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are an expert career mentor and hiring manager. Generate a comprehensive, beginner-friendly, and up-to-date learning roadmap. Return ONLY a valid JSON object matching this schema:
              {
                "career": "Title",
                "description": "Overview description",
                "difficulty": "Beginner | Intermediate | Advanced",
                "expectedSalary": {
                  "entry": "$60,000",
                  "mid": "$95,000",
                  "senior": "$140,000",
                  "average": "$98,000"
                },
                "duration": "Duration (e.g. 6 Months)",
                "jobGrowth": "Percentage (e.g. +22% over next decade)",
                "industryOutlook": "Brief overview of industry demand",
                "milestones": [
                  {
                    "id": "m1",
                    "title": "Milestone Title",
                    "description": "Detailed description of this milestone",
                    "duration": "Duration (e.g. 4 Weeks)",
                    "skills": ["Skill 1", "Skill 2"],
                    "projects": [
                      {
                        "title": "Project Title",
                        "description": "Description",
                        "skillsUsed": ["Skill 1"],
                        "difficulty": "Beginner | Intermediate | Advanced",
                        "timeEst": "2 Weeks",
                        "githubInspiration": "https://github.com/...",
                        "deploymentTarget": "Vercel | Netlify | AWS",
                        "resumeImpact": "Highly impact bullet point"
                      }
                    ],
                    "tasks": ["Task 1", "Task 2"],
                    "commonMistakes": ["Mistake 1"],
                    "outcome": "Able to...",
                    "resources": [
                      {
                        "title": "Course/Resource Title",
                        "platform": "YouTube | Coursera | Udemy | freeCodeCamp | MDN",
                        "difficulty": "Beginner | Intermediate | Advanced",
                        "duration": "Resource length",
                        "rating": 4.8,
                        "url": "https://..."
                      }
                    ],
                    "certifications": [
                      {
                        "name": "Cert Name",
                        "provider": "Provider Name",
                        "duration": "Study time",
                        "difficulty": "Beginner | Intermediate | Advanced",
                        "recognition": "High | Medium",
                        "cost": "$200 / Free",
                        "badge": "Badge Symbol",
                        "url": "https://..."
                      }
                    ]
                  }
                ],
                "interviewTopics": [
                  {
                    "category": "Technical | Coding | System Design | Behavioral",
                    "question": "Question text?",
                    "hints": ["Hint 1"],
                    "expectedAnswer": "Brief detailed answer guidelines",
                    "difficulty": "Easy | Medium | Hard"
                  }
                ],
                "resumeTips": ["Tip 1"],
                "portfolioSuggestions": ["Suggestion 1"],
                "keywords": ["keyword1"]
              }`,
            },
            {
              role: 'user',
              content: `Generate a comprehensive, beginner-friendly, and up-to-date learning roadmap for the role: '${career}'. The roadmap must be practical, realistic, and aligned with current industry expectations.`,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('API Request Failed');
      }

      const raw = await response.json();
      const content = raw.choices[0].message.content;
      return JSON.parse(content) as RoadmapData;
    } catch (error) {
      console.warn('Real AI generation failed, falling back to local compilation...', error);
    }
  }

  // Local engine fallback simulation (Procedural Compiler)
  await new Promise(resolve => setTimeout(resolve, 3500));

  const role = career.toLowerCase();
  
  if (matchRole(role, ['front', 'react', 'web', 'ui', 'vue'])) {
    return getFrontendRoadmap(career);
  } else if (matchRole(role, ['machine', 'ml', 'ai', 'deep', 'artificial', 'intelligence'])) {
    return getAIRoadmapData(career);
  } else if (matchRole(role, ['cyber', 'security', 'pentest', 'ethical', 'hack'])) {
    return getCybersecurityRoadmap(career);
  } else if (matchRole(role, ['data', 'analytics', 'analysis'])) {
    return getDataScienceRoadmap(career);
  } else if (matchRole(role, ['devops', 'cloud', 'aws', 'azure', 'docker'])) {
    return getDevOpsRoadmap(career);
  } else if (matchRole(role, ['block', 'chain', 'crypto', 'web3', 'solidity'])) {
    return getBlockchainRoadmap(career);
  } else if (matchRole(role, ['design', 'ux', 'ui', 'figma'])) {
    return getUIUXRoadmap(career);
  } else if (matchRole(role, ['product', 'project', 'manager', 'agile'])) {
    return getProductManagerRoadmap(career);
  } else if (matchRole(role, ['game', 'unity', 'unreal', 'c#', 'c++', 'shader'])) {
    return getGameDeveloperRoadmap(career);
  }

  return getGeneralRoadmap(career);
};

// ----------------------------------------------------
// LOCAL COMPILER DATA GENERATORS
// ----------------------------------------------------

const getFrontendRoadmap = (career: string): RoadmapData => ({
  career: career || "AI Frontend Engineer",
  description: "Specializes in building premium, responsive user interfaces and integrating them with AI services, Large Language Model streams, and state management frameworks.",
  difficulty: "Intermediate",
  expectedSalary: { entry: "$75,000", mid: "$110,000", senior: "$165,000", average: "$112,000" },
  duration: "6 Months",
  jobGrowth: "+25% (Much faster than average)",
  industryOutlook: "High demand for developers capable of merging modern React frameworks with streaming AI APIs and rich interfaces.",
  milestones: [
    {
      id: "fe_m1",
      title: "UI Foundations (HTML, CSS & Tailwind)",
      description: "Master modern semantic web markup, layout styling paradigms, responsive constraints, and utility-first styling with Tailwind CSS.",
      duration: "4 Weeks",
      skills: ["Semantic HTML", "CSS Grid & Flexbox", "Tailwind CSS", "Responsive Design"],
      projects: [
        {
          title: "Premium Glassmorphic Portfolio",
          description: "Build a sleek personal landing page with particle overlays, responsive typography, and glowing dark backgrounds.",
          skillsUsed: ["HTML5", "CSS Grid", "Tailwind CSS", "A11y"],
          difficulty: "Beginner",
          timeEst: "1 Week",
          githubInspiration: "https://github.com/codex-git/premium-glass-portfolio",
          deploymentTarget: "Vercel",
          resumeImpact: "Implemented modern dark mode glassmorphism matching modern SaaS landing pages, optimized for 100% Google Lighthouse accessibility scores."
        }
      ],
      tasks: [
        "Create a fluid 3-column layout that collapses to a single column on mobile.",
        "Implement a theme switch using CSS variables or Tailwind's dark class.",
        "Ensure all interactive items have focus states and keyboard navigation support."
      ],
      commonMistakes: [
        "Relying too heavily on fixed pixel dimensions instead of relative units (rem, em, %).",
        "Neglecting keyboard accessibility (focus states, logical tab order)."
      ],
      outcome: "Ability to recreate complex layouts from Figma designs with full responsive flexibility.",
      resources: [
        { title: "HTML & CSS Crash Course", platform: "freeCodeCamp", difficulty: "Beginner", duration: "11 Hours", rating: 4.9, url: "https://www.freecodecamp.org/" },
        { title: "Tailwind CSS Tutorial", platform: "YouTube", difficulty: "Beginner", duration: "3 Hours", rating: 4.8, url: "https://tailwindcss.com" }
      ],
      certifications: [
        { name: "Responsive Web Design", provider: "freeCodeCamp", duration: "300 Hours", difficulty: "Beginner", recognition: "Medium", cost: "Free", badge: "🎨", url: "https://www.freecodecamp.org/" }
      ]
    },
    {
      id: "fe_m2",
      title: "JavaScript & TypeScript Mechanics",
      description: "Dive deep into modern JavaScript syntax, asynchronous patterns, DOM manipulation, promises, error handling, and type safety with TypeScript.",
      duration: "5 Weeks",
      skills: ["ES6+ Syntax", "Promises & Async/Await", "TypeScript Typings", "Generics & Interfaces"],
      projects: [
        {
          title: "Asynchronous Kanban Board",
          description: "A drag-and-drop task board persisting to localStorage, built with complete type-safe TypeScript interfaces.",
          skillsUsed: ["TypeScript", "ES6 Modules", "HTML5 Drag-Drop", "LocalStorage"],
          difficulty: "Intermediate",
          timeEst: "2 Weeks",
          githubInspiration: "https://github.com/developer-kanban/ts-board",
          deploymentTarget: "Netlify",
          resumeImpact: "Designed type-safe data structures using TypeScript interfaces, reducing runtime task manipulation errors by 90%."
        }
      ],
      tasks: [
        "Write custom utility functions using TypeScript Generics for generic API fetching.",
        "Build a custom event pub/sub system to communicate actions between decoupled page elements.",
        "Create a wrapper around fetch that automatically handles request timeouts and token additions."
      ],
      commonMistakes: [
        "Using 'any' type in TypeScript, bypassing static checking safety.",
        "Failing to handle failed Promise rejections (missing try/catch wrappers)."
      ],
      outcome: "Ability to write clean, type-safe, and self-documenting logic that runs asynchronously.",
      resources: [
        { title: "JavaScript: The Hard Parts", platform: "MDN", difficulty: "Intermediate", duration: "15 Hours", rating: 4.8, url: "https://developer.mozilla.org/en-US/" },
        { title: "TypeScript Beginners Course", platform: "YouTube", difficulty: "Beginner", duration: "4 Hours", rating: 4.7, url: "https://typescriptlang.org" }
      ]
    },
    {
      id: "fe_m3",
      title: "React Core & State Management",
      description: "Understand virtual DOM, component lifecycles, advanced React Hooks, custom hooks, and managing application-wide state using Context or Zustand.",
      duration: "5 Weeks",
      skills: ["React Components", "useState & useEffect", "Zustand / Redux Toolkit", "Custom React Hooks"],
      projects: [
        {
          title: "Audio Streaming Client",
          description: "Build an interactive audio player with custom controls, visualizers, queue system, and global state sync.",
          skillsUsed: ["React", "HTML5 Audio API", "Zustand", "Framer Motion"],
          difficulty: "Intermediate",
          timeEst: "2 Weeks",
          githubInspiration: "https://github.com/audio-react/music-player",
          deploymentTarget: "Vercel",
          resumeImpact: "Configured Zustand for lightweight global audio state sync, decreasing UI re-render latency by 40%."
        }
      ],
      tasks: [
        "Write a custom hook `useDebounce` to throttle typing triggers for search inputs.",
        "Refactor an inline prop-drilling system into a unified global state manager.",
        "Implement React.memo and useMemo optimizations to fix UI lag during list filtering."
      ],
      commonMistakes: [
        "Creating infinite loops by forgetting to configure the dependency array in useEffect.",
        "Putting local UI state into a global state store."
      ],
      outcome: "Ability to build modular, component-based user interfaces with lightning-fast interactive state.",
      resources: [
        { title: "React Developer Path", platform: "Coursera", difficulty: "Intermediate", duration: "48 Hours", rating: 4.8, url: "https://www.coursera.org/" }
      ],
      certifications: [
        { name: "Meta Front-End Developer", provider: "Coursera", duration: "7 Months", difficulty: "Intermediate", recognition: "High", cost: "$49/mo", badge: "⚛️", url: "https://www.coursera.org/professional-certificates/meta-frontend-developer" }
      ]
    },
    {
      id: "fe_m4",
      title: "Next.js Framework & Server Elements",
      description: "Adopt React Server Components (RSC), SSR/SSG compilation strategies, routing conventions, API routes, and edge functions in Next.js.",
      duration: "4 Weeks",
      skills: ["Next.js App Router", "Server Components", "Server Actions", "Vercel Deployment"],
      projects: [
        {
          title: "Full-Stack SaaS Admin Panel",
          description: "Build a telemetry dashboard utilizing server-side rendering for instant page paints and server actions for secure settings updates.",
          skillsUsed: ["Next.js", "Server Components", "Tailwind CSS", "Recharts"],
          difficulty: "Advanced",
          timeEst: "3 Weeks",
          githubInspiration: "https://github.com/saas-templates/nextjs-admin",
          deploymentTarget: "Vercel",
          resumeImpact: "Leveraged Next.js Server Components to decrease initial page load times (First Contentful Paint) from 2.4s to 0.6s."
        }
      ],
      tasks: [
        "Set up dynamic routes to fetch database parameters dynamically on request.",
        "Deploy Next.js api routes to process Stripe Webhooks asynchronously.",
        "Create custom error.tsx and loading.tsx boundaries to handle API failure states gracefully."
      ],
      commonMistakes: [
        "Marking all components with 'use client' unnecessarily, negating server component performance.",
        "Running secure queries directly inside client components."
      ],
      outcome: "Ability to deploy modern, secure, and search-engine optimized React applications that scale.",
      resources: [
        { title: "Next.js Official Learn Course", platform: "Official Documentation", difficulty: "Intermediate", duration: "12 Hours", rating: 4.9, url: "https://nextjs.org/learn" }
      ]
    },
    {
      id: "fe_m5",
      title: "AI Integrations & Vercel AI SDK",
      description: "Build interfaces that talk to LLMs, stream text tokens, handle chat interfaces, render Markdown, and execute vector store query operations.",
      duration: "4 Weeks",
      skills: ["Vercel AI SDK", "Streaming APIs", "Markdown Rendering", "Vector Database Queries"],
      projects: [
        {
          title: "ChatPDF: Interactive AI Document Assistant",
          description: "Users upload documents and chat with them in real-time, utilizing streaming replies and highlighted references.",
          skillsUsed: ["Vercel AI SDK", "Next.js", "OpenAI API", "Pinecone Vector DB"],
          difficulty: "Advanced",
          timeEst: "3 Weeks",
          githubInspiration: "https://github.com/ai-documents/chat-pdf",
          deploymentTarget: "Vercel",
          resumeImpact: "Developed a streaming chat application with OpenAI and Vercel AI SDK, delivering tokens to the UI at 80 tokens/sec with 0 initial buffering."
        }
      ],
      tasks: [
        "Build a custom user interface that processes and displays streaming markdown replies with code highlighting.",
        "Implement client-side chat history preservation using SQLite or indexedDB.",
        "Create a rate-limiting middleware for API routes using Upstash Redis."
      ],
      commonMistakes: [
        "Hardcoding OpenAI API Keys in client-side components.",
        "Blocking UI rendering while waiting for the entire LLM prompt completion instead of streaming tokens."
      ],
      outcome: "Capable of designing highly conversational, modern AI client products using standard SDK integrations.",
      resources: [
        { title: "AI Application Development Course", platform: "Udemy", difficulty: "Advanced", duration: "20 Hours", rating: 4.8, url: "https://www.udemy.com/" }
      ]
    },
    {
      id: "fe_m6",
      title: "Interview Prep & Portfolio Launch",
      description: "Assemble your projects, optimize your resume for applicant tracking systems, customize GitHub, and practice mock coding problems.",
      duration: "2 Weeks",
      skills: ["System Design", "LeetCode Fundamentals", "ATS Optimization", "Behavioral Interview Methods"],
      projects: [
        {
          title: "PathWise Professional Portfolio Portfolio",
          description: "Aggregate all previous project blocks into a single interactive showcases, highlighting direct metrics.",
          skillsUsed: ["Next.js", "Framer Motion", "React Flow", "Tailwind CSS"],
          difficulty: "Advanced",
          timeEst: "1 Week",
          githubInspiration: "https://github.com/pathwise-dev/portfolio",
          deploymentTarget: "Vercel",
          resumeImpact: "Built and deployed a production portfolio hosting 5+ interactive applications, attracting over 1,000 unique visits."
        }
      ],
      tasks: [
        "Align all previous project codebases to pass strict ESLint settings.",
        "Write clear READMEs containing GIFs, installation prompts, and tech stack details for all repositories.",
        "Complete 3 behavioral mock recordings detailing your architectural choices."
      ],
      commonMistakes: [
        "Listing skills in resume without tying them to measurable project outcomes.",
        "Neglecting coding preparation (basic data structures like arrays, hash maps)."
      ],
      outcome: "Fully certified, prepared, and positioned to secure your target career role.",
      resources: [
        { title: "Frontend Interview Guide", platform: "YouTube", difficulty: "Intermediate", duration: "6 Hours", rating: 4.9, url: "https://youtube.com" }
      ],
      certifications: [
        { name: "Frontend Engineer Interview Certificate", provider: "Udemy", duration: "12 Hours", difficulty: "Intermediate", recognition: "Medium", cost: "$15", badge: "💼", url: "https://www.udemy.com" }
      ]
    }
  ],
  interviewTopics: [
    { category: "Technical", question: "Explain the difference between React Server Components (RSC) and Client Components.", hints: ["Think about where the code runs", "Consider bundle size benefits"], expectedAnswer: "React Server Components run exclusively on the server, meaning their code does not get bundled to the client, leading to faster loads. Client Components are traditional React components that download to the browser to enable dynamic interactions (hooks, event listeners).", difficulty: "Medium" },
    { category: "Technical", question: "How does the virtual DOM work in React, and how does reconciliation happen?", hints: ["Fiber architecture", "Diffing algorithm"], expectedAnswer: "React maintains a virtual representation of the DOM. When state changes, a new virtual DOM tree is constructed. React compares this with the previous tree using a diffing algorithm (Reconciliation) and computes the minimal set of updates to apply to the real DOM.", difficulty: "Medium" },
    { category: "Coding", question: "Write a custom hook called useLocalStorage to persist and retrieve state.", hints: ["Initialize state with function callback", "Use useEffect or sync update logic"], expectedAnswer: "Create a function useLocalStorage(key, initialValue) that reads the key from localStorage on init. It returns state and a setter function that updates the state and saves it to localStorage.", difficulty: "Easy" }
  ],
  resumeTips: [
    "Quantify impact: e.g., 'Optimized React re-renders, reducing FCP from 2.1s to 0.8s'.",
    "List TypeScript and Next.js explicitly in your skills list.",
    "Include links to live project demos on your Vercel domains."
  ],
  portfolioSuggestions: [
    "Deploy a full Next.js App Router project that features live streaming AI chatbot modules.",
    "A reusable npm package or custom React hooks library, demonstrating code modularity."
  ],
  keywords: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel AI SDK", "Zustand"]
});

const getAIRoadmapData = (career: string): RoadmapData => ({
  career: career || "Machine Learning Engineer",
  description: "Bridges the gap between data science and software engineering by building, deploying, and optimizing predictive models, neural networks, and LLM pipelines.",
  difficulty: "Advanced",
  expectedSalary: { entry: "$90,000", mid: "$130,000", senior: "$190,000", average: "$138,050" },
  duration: "8 Months",
  jobGrowth: "+40% (Explosive Growth)",
  industryOutlook: "Exponential demand across all sectors for engineers who can construct custom models and deploy scalable AI infra.",
  milestones: [
    {
      id: "ai_m1",
      title: "Mathematics & Python Foundations",
      description: "Master the mathematical prerequisites: Linear Algebra, Calculus, Probability, Statistics, and core Python scripting libraries.",
      duration: "6 Weeks",
      skills: ["Linear Algebra", "Calculus", "Probability & Statistics", "NumPy & Pandas"],
      projects: [
        {
          title: "Statistical Housing Price Predictor",
          description: "Perform exploratory data analysis and build a multivariable regression estimator using NumPy.",
          skillsUsed: ["Python", "NumPy", "Pandas", "Matplotlib"],
          difficulty: "Beginner",
          timeEst: "2 Weeks",
          resumeImpact: "Cleaned and processed a dataset of 50,000 properties, applying multivariate calculus algorithms to predict pricing with 92% R-squared accuracy."
        }
      ],
      tasks: [
        "Implement a matrix multiplication algorithm from scratch without NumPy.",
        "Calculate Mean Squared Error (MSE) and gradient steps for simple regression manually.",
        "Clean a dataset containing 20% missing values using advanced Pandas interpolation."
      ],
      commonMistakes: [
        "Skipping mathematical foundations to jump directly to importing neural networks.",
        "Not understanding data distribution properties before scaling."
      ],
      outcome: "Comfortable importing, transforming, plotting, and analyzing datasets using mathematical constructs.",
      resources: [
        { title: "Mathematics for Machine Learning", platform: "Coursera", difficulty: "Beginner", duration: "36 Hours", rating: 4.8, url: "https://www.coursera.org/specializations/mathematics-machine-learning" }
      ]
    }
  ],
  interviewTopics: [
    { category: "Technical", question: "What is overfitting, and what techniques do you use to prevent it in deep learning?", hints: ["Regularization", "Data Augmentation", "Dropout"], expectedAnswer: "Overfitting is when a model performs exceptionally well on training data but fails to generalize to test data. To prevent it, you can use: L1/L2 regularization, dropout layers, early stopping, batch normalization, and data augmentation.", difficulty: "Easy" }
  ],
  resumeTips: [
    "Highlight mathematics and engineering balance.",
    "List specific frameworks (PyTorch, Hugging Face, Scikit-Learn) and cloud capabilities (AWS SageMaker, Docker)."
  ],
  portfolioSuggestions: [
    "An open-source github repository showing PyTorch custom layer implementations with complete unit tests."
  ],
  keywords: ["PyTorch", "Scikit-Learn", "FastAPI", "Docker", "AWS", "Hugging Face", "MLOps", "Transformers"]
});

const getCybersecurityRoadmap = (career: string): RoadmapData => ({
  career: career || "Cybersecurity Analyst",
  description: "Protects enterprise systems, monitors networks for intrusions, conducts vulnerability reviews, and implements security controls.",
  difficulty: "Beginner",
  expectedSalary: { entry: "$65,000", mid: "$95,000", senior: "$145,000", average: "$99,000" },
  duration: "6 Months",
  jobGrowth: "+32% (Explosive)",
  industryOutlook: "Massive global shortage of cybersecurity specialists. Organizations desperately need analysts to secure cloud endpoints and identify active threats.",
  milestones: [
    {
      id: "cs_m1",
      title: "Network Fundamentals & Systems Administration",
      description: "Learn TCP/IP networking, OSI model, subnetting, ports, routing, and command line operation in Linux/Windows.",
      duration: "4 Weeks",
      skills: ["TCP/IP Networking", "Linux Administration", "Wireshark Analysis", "CLI scripting"],
      projects: [
        {
          title: "Network Packet Analyzer",
          description: "Use Wireshark to monitor traffic, filter ports, dissect HTTP headers, and capture credentials.",
          skillsUsed: ["Wireshark", "Networking", "Network Security"],
          difficulty: "Beginner",
          timeEst: "1 Week",
          resumeImpact: "Analyzed local area network traffic using Wireshark, identifying 5 unencrypted credential packages and mapping network layouts."
        }
      ],
      tasks: ["Configure static routing on Linux VMs.", "Identify network ports using Nmap scans.", "Analyze packet caps for DNS leak patterns."],
      commonMistakes: ["Skipping core network architecture concepts before running hacking tools.", "Executing scans on unauthorized networks."],
      outcome: "Ability to run administrative commands in Linux shell and diagnose networking routes.",
      resources: [{ title: "CompTIA Network+ Course", platform: "YouTube", difficulty: "Beginner", duration: "18 Hours", rating: 4.8, url: "https://youtube.com" }]
    }
  ],
  interviewTopics: [
    { category: "Technical", question: "Describe what happens during a three-way TCP handshake.", hints: ["SYN, SYN-ACK, ACK", "Sequence numbers"], expectedAnswer: "The client sends a SYN packet to initiate. The server responds with a SYN-ACK packet indicating readiness. The client answers with an ACK, establishing a state connection.", difficulty: "Easy" }
  ],
  resumeTips: ["List Linux command line, networking skills, and wireshark analysis explicitly."],
  portfolioSuggestions: ["Writeups of vulnerable machines solved on HackTheBox or TryHackMe."],
  keywords: ["Nmap", "Wireshark", "Nessus", "SIEM", "Splunk", "Linux", "TCP/IP", "CompTIA Security+"]
});

const getDataScienceRoadmap = (career: string): RoadmapData => ({
  career: career || "Data Scientist",
  description: "Extracts insights from structured and unstructured data, applies statistical models, builds prediction machines, and informs business decisions.",
  difficulty: "Intermediate",
  expectedSalary: { entry: "$70,000", mid: "$105,000", senior: "$150,000", average: "$108,000" },
  duration: "6 Months",
  jobGrowth: "+35% (Rapid)",
  industryOutlook: "Organizations are seeking professionals who can construct clean analytics databases and translate technical output into business metrics.",
  milestones: [
    {
      id: "ds_m1",
      title: "SQL & Relational Databases",
      description: "Master structured query language (SQL), database design, joins, aggregates, subqueries, and window functions.",
      duration: "4 Weeks",
      skills: ["PostgreSQL", "SQL Queries", "Relational Database Design", "Window Functions"],
      projects: [
        {
          title: "Relational E-commerce Analytics Schema",
          description: "Design database schemas, insert mock parameters, and write complex aggregate reports.",
          skillsUsed: ["PostgreSQL", "Data Schema Design", "Aggregations", "Views"],
          difficulty: "Beginner",
          timeEst: "1 Week",
          resumeImpact: "Designed normalized Postgres database schemas, reducing analytics execution times by 60%."
        }
      ],
      tasks: ["Write aggregate reports containing GROUP BY, HAVING, and JOIN.", "Create a dynamic view showing rolling 7-day sales values."],
      commonMistakes: ["Using slow subqueries instead of efficient JOIN mappings."],
      outcome: "Ability to extract customized reports from multi-table SQL databases with clean schema queries.",
      resources: [{ title: "SQL for Data Science", platform: "Coursera", difficulty: "Beginner", duration: "14 Hours", rating: 4.7, url: "https://coursera.org" }]
    }
  ],
  interviewTopics: [
    { category: "Technical", question: "What is the difference between inner, left, right, and outer joins in SQL?", hints: ["Match criteria", "Null values"], expectedAnswer: "Inner join returns matching rows in both tables. Left join returns all rows from the left table and matched rows from the right (else null). Right join is the opposite of left.", difficulty: "Easy" }
  ],
  resumeTips: ["List SQL, Python, Pandas, and Tableau capabilities."],
  portfolioSuggestions: ["EDA notebooks explaining dataset anomalies and conclusions."],
  keywords: ["SQL", "PostgreSQL", "Python", "Pandas", "Tableau", "Data Analysis", "Statistics"]
});

const getDevOpsRoadmap = (career: string): RoadmapData => ({
  career: career || "DevOps Engineer",
  description: "Specializes in automating software delivery pipelines, managing cloud infrastructure, monitoring deployments, and enforcing reliability.",
  difficulty: "Advanced",
  expectedSalary: { entry: "$85,000", mid: "$120,000", senior: "$175,000", average: "$122,000" },
  duration: "6 Months",
  jobGrowth: "+24%",
  industryOutlook: "Companies need infrastructure automation specialists to manage AWS costs and scale cloud resources reliably using infrastructure as code (IaC).",
  milestones: [
    {
      id: "do_m1",
      title: "Linux, Scripting & Git",
      description: "Master terminal commands, bash scripting, file system hierarchy, process management, and collaborative Git strategies.",
      duration: "4 Weeks",
      skills: ["Linux Shell", "Bash Scripting", "Git Workflows", "VPC Networking"],
      projects: [
        {
          title: "Automated Log Rotation Script",
          description: "Write a Bash script that monitors CPU and rotates system logs, reporting status via webhooks.",
          skillsUsed: ["Bash", "Linux", "Cron Jobs", "Webhooks"],
          difficulty: "Beginner",
          timeEst: "1 Week",
          resumeImpact: "Wrote automated system rotation scripts deployed across 50 staging VMs, reducing disk overflow outages to 0%."
        }
      ],
      tasks: ["Write a cron job that backs up folder contents every night.", "Resolve multi-branch merge conflicts in Git."],
      commonMistakes: ["Hardcoding user keys inside system scripts."],
      outcome: "Ability to run administrative tasks inside terminal shells and write shell files.",
      resources: [{ title: "Linux Administration Bootcamp", platform: "Udemy", difficulty: "Beginner", duration: "15 Hours", rating: 4.8, url: "https://udemy.com" }]
    }
  ],
  interviewTopics: [
    { category: "Technical", question: "What is CI/CD, and what are its benefits?", hints: ["Continuous Integration", "Automated deployment"], expectedAnswer: "Continuous Integration automates code testing and merging. Continuous Delivery/Deployment automatically deploys these changes to staging/production.", difficulty: "Easy" }
  ],
  resumeTips: ["List AWS/GCP, Docker, Kubernetes, Terraform, and CI/CD tools."],
  portfolioSuggestions: ["Git repositories hosting Terraform files for cloud deployments."],
  keywords: ["AWS", "Docker", "Terraform", "CI/CD", "Kubernetes", "Linux", "Bash", "GitHub Actions"]
});

const getBlockchainRoadmap = (career: string): RoadmapData => ({
  career: career || "Blockchain Developer",
  description: "Constructs decentralized applications (dApps), smart contracts, token standards, and Web3 connection layers.",
  difficulty: "Advanced",
  expectedSalary: { entry: "$85,000", mid: "$125,000", senior: "$180,000", average: "$125,000" },
  duration: "6 Months",
  jobGrowth: "+20%",
  industryOutlook: "Ongoing interest in building decentralized storage, finance systems (DeFi), tokenization assets, and secure transactions.",
  milestones: [
    {
      id: "bc_m1",
      title: "Solidity & Smart Contracts",
      description: "Learn Solidity syntax, EVM operations, compiler setups, contract vulnerabilities, and testing with Hardhat.",
      duration: "6 Weeks",
      skills: ["Solidity", "EVM Mechanics", "ERC Token Standards", "Hardhat Framework"],
      projects: [
        {
          title: "ERC-20 Token & Staking Contract",
          description: "Write, test, and deploy custom ERC-20 token contracts with built-in reward payouts.",
          skillsUsed: ["Solidity", "Hardhat", "Chai Testing", "Ethers.js"],
          difficulty: "Intermediate",
          timeEst: "2 Weeks",
          resumeImpact: "Wrote secure staking smart contracts executing on Ethereum Sepolia testnet, covered with 100% unit tests."
        }
      ],
      tasks: ["Write a contract that redistributes dividends to addresses.", "Implement access control boundaries using OpenZeppelin standards."],
      commonMistakes: ["Ignoring reentrancy security vulnerabilities."],
      outcome: "Ability to write secure, testable Solidity smart contracts and compile them on Hardhat.",
      resources: [{ title: "Solidity Smart Contract Course", platform: "freeCodeCamp", difficulty: "Intermediate", duration: "32 Hours", rating: 4.9, url: "https://www.freecodecamp.org/" }]
    }
  ],
  interviewTopics: [
    { category: "Technical", question: "What is a reentrancy attack in Solidity, and how do you prevent it?", hints: ["State changes", "Checks-Effects-Interactions"], expectedAnswer: "Reentrancy occurs when a contract sends funds to an external address that makes recursive calls back to the contract before state variables are updated.", difficulty: "Hard" }
  ],
  resumeTips: ["List Solidity, Hardhat, Ethers.js, Web3.js, and EVM structures."],
  portfolioSuggestions: ["Decentralized applications hosted on IPFS linked to live contracts."],
  keywords: ["Solidity", "Web3", "Ethereum", "Hardhat", "Ethers.js", "Smart Contracts", "dApps"]
});

const getUIUXRoadmap = (career: string): RoadmapData => ({
  career: career || "UI/UX Designer",
  description: "Researches user behaviors, builds wireframes, designs UI components, structures page hierarchies, and creates prototypes in Figma.",
  difficulty: "Beginner",
  expectedSalary: { entry: "$55,000", mid: "$85,000", senior: "$130,000", average: "$89,000" },
  duration: "5 Months",
  jobGrowth: "+18%",
  industryOutlook: "Strong demand for designers who can combine graphic design aesthetics with conversion principles and deep accessibility standards.",
  milestones: [
    {
      id: "ux_m1",
      title: "Design Principles & Figma Core",
      description: "Master alignment, spacing, color theory, typography scale, responsive constraints, and auto-layout inside Figma.",
      duration: "4 Weeks",
      skills: ["Figma Operations", "Auto Layout", "Design Systems", "Component Libraries"],
      projects: [
        {
          title: "SaaS Mobile App Mockup",
          description: "Create a complete mobile landing dashboard in Figma using auto layout and shared styles.",
          skillsUsed: ["Figma", "Auto Layout", "Style Guides", "Typography"],
          difficulty: "Beginner",
          timeEst: "1 Week",
          resumeImpact: "Designed high-fidelity SaaS dashboard wireframes containing 30+ reusable atomic UI components."
        }
      ],
      tasks: ["Configure nested auto layout headers.", "Set up a typography hierarchy scale."],
      commonMistakes: ["Ignoring grids, creating inconsistent alignments."],
      outcome: "Ability to build clean, maintainable UI files in Figma that developers can easily translate to code.",
      resources: [{ title: "Figma UI/UX Masterclass", platform: "Udemy", difficulty: "Beginner", duration: "24 Hours", rating: 4.8, url: "https://udemy.com" }]
    }
  ],
  interviewTopics: [
    { category: "Technical", question: "What is the difference between UI and UX design?", hints: ["Visuals vs Flow", "Aesthetics vs Usability"], expectedAnswer: "UI (User Interface) focuses on the visual touchpoints of the product. UX (User Experience) focuses on the system structure, user flows, accessibility, and general product usability.", difficulty: "Easy" }
  ],
  resumeTips: ["List Figma, Prototyping, Wireframing, User Research, and Design System experience."],
  portfolioSuggestions: ["Detailed case studies describing research, wireframing, and final iterations."],
  keywords: ["Figma", "UX Research", "Wireframing", "Prototyping", "Design Systems", "Auto Layout", "Visual Design"]
});

const getProductManagerRoadmap = (career: string): RoadmapData => ({
  career: career || "Product Manager",
  description: "Defines product roadmaps, gathers customer requirements, translates them to engineering tasks, coordinates releases, and monitors product telemetry.",
  difficulty: "Intermediate",
  expectedSalary: { entry: "$75,000", mid: "$115,000", senior: "$165,000", average: "$114,000" },
  duration: "5 Months",
  jobGrowth: "+16%",
  industryOutlook: "Companies need technical product coordinators who can balance engineering resources against market feedback and business priorities.",
  milestones: [
    {
      id: "pm_m1",
      title: "Product Strategy & Agile Execution",
      description: "Learn backlog prioritization frameworks (RICE, Kano), writing clear PRDs, structuring user stories, and managing sprints in Jira.",
      duration: "4 Weeks",
      skills: ["Agile/Scrum", "RICE Prioritization", "PRD Writing", "Jira Backlog Management"],
      projects: [
        {
          title: "Product Requirements Document (PRD)",
          description: "Write a detailed PRD for a mobile application including success metrics, mock flows, and roadmap stages.",
          skillsUsed: ["PRD Writing", "Wireframing", "Metric Tracking", "Jira Planning"],
          difficulty: "Beginner",
          timeEst: "1 Week",
          resumeImpact: "Authored comprehensive PRDs coordinating 10-person developer teams, aligning product milestones with core business goals."
        }
      ],
      tasks: ["Write 5 detailed user stories with clear acceptance criteria.", "Prioritize a backlog of 20 items using the RICE framework."],
      commonMistakes: ["Writing vague requirements that cause developer confusion."],
      outcome: "Ability to coordinate sprint backlogs and write development instructions.",
      resources: [{ title: "Brand Product Management Course", platform: "Coursera", difficulty: "Beginner", duration: "20 Hours", rating: 4.8, url: "https://coursera.org" }]
    }
  ],
  interviewTopics: [
    { category: "Behavioral", question: "How do you handle disagreements between engineering teams and product roadmap priorities?", hints: ["Empathy", "Data-driven alignment", "Tradeoffs"], expectedAnswer: "I facilitate open discussions. First, I understand developer concerns. Then, I present clear business impact metrics to align tradeoffs.", difficulty: "Medium" }
  ],
  resumeTips: ["List Jira, Agile/Scrum, RICE Framework, SQL, and PRD writing."],
  portfolioSuggestions: ["Example PRDs and user story layouts published as case studies."],
  keywords: ["Product Strategy", "Jira", "Agile", "Scrum", "PRD", "RICE Prioritization", "Product Analytics"]
});

const getGeneralRoadmap = (career: string): RoadmapData => ({
  career: career || "Software Engineer",
  description: "Builds scaleable software solutions, organizes computational structures, writes algorithms, and maintains computer systems.",
  difficulty: "Intermediate",
  expectedSalary: { entry: "$68,000", mid: "$100,000", senior: "$150,000", average: "$104,000" },
  duration: "6 Months",
  jobGrowth: "+22%",
  industryOutlook: "Consistent baseline industry demand for programmers with strong logical problem-solving skills, algorithm knowledge, and system familiarity.",
  milestones: [
    {
      id: "ge_m1",
      title: "Data Structures & Algorithms",
      description: "Learn standard memory organization: Arrays, Linked Lists, Hash Tables, Trees, Graphs, sorting algorithms, and Big-O computational time complexity.",
      duration: "6 Weeks",
      skills: ["Big-O Complexity", "Sorting & Searching", "Hash Tables & Trees", "Recursion Basics"],
      projects: [
        {
          title: "Visual Algorithms Sandbox",
          description: "Implement search and sort algorithms (Binary Search, QuickSort) with a visual display demonstrating operations.",
          skillsUsed: ["JavaScript/TypeScript", "DOM Rendering", "Sorting Algorithms", "Big-O Analysis"],
          difficulty: "Beginner",
          timeEst: "2 Weeks",
          resumeImpact: "Implemented visual algorithm demonstrators, helping study partners comprehend time-complexity steps."
        }
      ],
      tasks: ["Solve 15 basic LeetCode array operations.", "Measure execution durations of linear vs binary search operations."],
      commonMistakes: ["Failing to calculate memory spatial requirements."],
      outcome: "Ability to write efficient code and determine processing time constraints.",
      resources: [{ title: "Algorithms Specialization", platform: "Coursera", difficulty: "Intermediate", duration: "48 Hours", rating: 4.8, url: "https://coursera.org" }]
    }
  ],
  interviewTopics: [
    { category: "Technical", question: "What is the time complexity of searching inside a Hash Table vs a Binary Search Tree?", hints: ["Average vs Worst case", "Direct index hashing"], expectedAnswer: "Searching in a Hash Table is on average O(1) time due to direct index hashes. Searching a balanced Binary Search Tree is O(log n) time.", difficulty: "Medium" }
  ],
  resumeTips: ["List algorithms, core coding languages, databases, and version control."],
  portfolioSuggestions: ["Git repositories hosting clean, commented algorithms solutions."],
  keywords: ["Algorithms", "Data Structures", "Big-O", "Git", "System Design", "Databases"]
});

const getGameDeveloperRoadmap = (career: string): RoadmapData => ({
  career: career || "Game Developer",
  description: "Specializes in building interactive 2D and 3D games, programming engine logic, shader structures, physics components, and user interfaces.",
  difficulty: "Advanced",
  expectedSalary: { entry: "$70,000", mid: "$105,000", senior: "$155,000", average: "$110,000" },
  duration: "6 Months",
  jobGrowth: "+21% (High demand in AAA and Indie spaces)",
  industryOutlook: "Strong outlook with the expansion of immersive gaming engines, metaverse graphics, and mobile game releases.",
  milestones: [
    {
      id: "gd_m1",
      title: "Programming Fundamentals & C#",
      description: "Learn C# foundations, variables, loops, arrays, OOP, classes, inheritance, and generic structures.",
      duration: "4 Weeks",
      skills: ["C# OOP", "Variables & Control Flow", "Collections & Generics", "Classes & Inheritance"],
      projects: [
        {
          title: "Console Text Adventure Game",
          description: "Build a text-based RPG in console using core OOP principles and saving states.",
          skillsUsed: ["C# OOP", "System.IO", "Text Parsing"],
          difficulty: "Beginner",
          timeEst: "1 Week",
          resumeImpact: "Designed a clean C# codebase demonstrating SOLID principles and generic state managers."
        }
      ],
      tasks: ["Write 5 class definitions inheriting from a base Actor class.", "Configure a simple text inventory list."],
      commonMistakes: ["Using global variables instead of encapsulating class states."],
      outcome: "Ability to write clean, modular object-oriented C# code.",
      resources: [{ title: "C# Beginner Tutorial", platform: "YouTube", difficulty: "Beginner", duration: "8 Hours", rating: 4.8, url: "https://youtube.com" }]
    },
    {
      id: "gd_m2",
      title: "Unity Engine Core Layouts",
      description: "Master Unity interface, GameObjects, Prefabs, transforms, script bindings, and basic game loops.",
      duration: "6 Weeks",
      skills: ["Unity Editor", "GameObjects & Components", "Transforms & Vector Math", "Prefabs & Spawning"],
      projects: [
        {
          title: "2D Endless Runner Sandbox",
          description: "Develop a 2D side-scroller game with parallax scrolling backgrounds and spawning obstacles.",
          skillsUsed: ["Unity Editor", "C# scripting", "2D Transforms"],
          difficulty: "Beginner",
          timeEst: "2 Weeks",
          resumeImpact: "Created a complete 2D side-scrolling runner, optimising sprite asset sheets and parallax layers."
        }
      ],
      tasks: ["Import a custom sprite asset sheet and slice it.", "Create a spawner prefab script to generate obstacles."],
      commonMistakes: ["Failing to reuse spawned assets, leading to memory leaks."],
      outcome: "Complete comfort managing scenes, gameobjects, and transforms in Unity.",
      resources: [{ title: "Unity Essentials", platform: "YouTube", difficulty: "Beginner", duration: "12 Hours", rating: 4.9, url: "https://unity.com/learn" }]
    },
    {
      id: "gd_m3",
      title: "Game Physics & Colliders",
      description: "Master Rigidbody components, colliders, trigger events, gravity vectors, forces, and raycasting.",
      duration: "5 Weeks",
      skills: ["Rigidbody Physics", "Trigger & Collision Events", "Forces & Torques", "Raycasting"],
      projects: [
        {
          title: "3D Physics Roller Game",
          description: "Create a 3D marble roller using forces, gravity manipulation, and raycasted ground checks.",
          skillsUsed: ["3D Physics", "Raycasting", "Inputs Manager"],
          difficulty: "Intermediate",
          timeEst: "2 Weeks",
          resumeImpact: "Developed precise physics controllers utilizing trigger layers and forces instead of hardcoded transforms."
        }
      ],
      tasks: ["Configure a raycast ground check to verify jump viability.", "Apply impulse forces to trigger jump events on collision."],
      commonMistakes: ["Moving physics objects via Transform.Translate instead of AddForce."],
      outcome: "Ability to design immersive, responsive physical game interactions.",
      resources: [{ title: "Unity Physics Basics", platform: "Udemy", difficulty: "Intermediate", duration: "6 Hours", rating: 4.7, url: "https://udemy.com" }]
    },
    {
      id: "gd_m4",
      title: "Game Animation & Shaders",
      description: "Learn Animator controllers, state machines, animation parameters, blend trees, and custom shader graphs.",
      duration: "4 Weeks",
      skills: ["Animator State Machines", "Blend Trees", "Animation Blending", "Shader Graph Basics"],
      projects: [
        {
          title: "Character Walk/Run Blending",
          description: "Set up a 3D avatar with seamless walk-to-run transitions and custom dissolve shaders.",
          skillsUsed: ["Animator States", "Blend Trees", "Shader Graph"],
          difficulty: "Intermediate",
          timeEst: "2 Weeks",
          resumeImpact: "Configured animation blend trees based on input velocities, producing fluid transition motions."
        }
      ],
      tasks: ["Configure a float parameter to blend between walking and sprinting animations.", "Create a custom glowing dissolve shader graph."],
      commonMistakes: ["Neglecting transition exit times, creating jerky, snap motions."],
      outcome: "Mastery over player animations and graphic visual shader overlays.",
      resources: [{ title: "Unity Animation Deep Dive", platform: "YouTube", difficulty: "Intermediate", duration: "5 Hours", rating: 4.8, url: "https://youtube.com" }]
    },
    {
      id: "gd_m5",
      title: "AI NPC & Pathfinding",
      description: "Configure Navigation Meshes (NavMesh), agents, obstacle avoidance, state machines, and behaviour trees.",
      duration: "5 Weeks",
      skills: ["NavMesh & NavMeshAgent", "AI Pathfinding", "Finite State Machines", "Behaviour Trees"],
      projects: [
        {
          title: "Stealth AI Guard Simulator",
          description: "Build an AI guard that patrols a set route, pursues players on sight, and returns to route when lost.",
          skillsUsed: ["NavMesh", "Raycasts", "State Machines"],
          difficulty: "Advanced",
          timeEst: "2.5 Weeks",
          resumeImpact: "Programmed robust state-driven stealth guards utilizing field-of-view raycasting and NavMesh pathfinding."
        }
      ],
      tasks: ["Bake a navigation mesh map and set up NavMeshAgent targets.", "Implement patrol, chase, and inspect states in a guard FSM."],
      commonMistakes: ["Recalculating NavMesh paths every frame, which heavily impacts frame rates."],
      outcome: "Ability to program responsive, smart NPC behaviors and paths.",
      resources: [{ title: "AI in Unity Course", platform: "Coursera", difficulty: "Advanced", duration: "16 Hours", rating: 4.8, url: "https://coursera.org" }]
    },
    {
      id: "gd_m6",
      title: "Networking & Game Optimization",
      description: "Learn multiplayer basics, RPCs, state synchronizations, frame rate profiling, and building/exporting game builds.",
      duration: "6 Weeks",
      skills: ["Multiplayer Basics", "RPC & State Sync", "Unity Profiler", "Build Exporting"],
      projects: [
        {
          title: "Multiplayer Arena Lobby",
          description: "Create a simple multiplayer lobby supporting room joins and networked character spawning.",
          skillsUsed: ["Netcode for GameObjects", "RPCs", "Profiler Tools"],
          difficulty: "Advanced",
          timeEst: "3 Weeks",
          resumeImpact: "Architected a multiplayer network lobby with state synchronizations, reducing latency footprint by 30%."
        }
      ],
      tasks: ["Implement an RPC method to sync player damage across client screens.", "Profile draw calls and batch materials to optimize GPU rendering."],
      commonMistakes: ["Syncing non-essential transform parameters, clogging packet networks."],
      outcome: "Ready to deploy, compile, build, and distribute multiplayer projects.",
      resources: [{ title: "Unity Multiplayer Development", platform: "Udemy", difficulty: "Advanced", duration: "18 Hours", rating: 4.9, url: "https://udemy.com" }]
    }
  ],
  interviewTopics: [
    { category: "Technical", question: "What is the difference between Update and FixedUpdate in game loops?", hints: ["Frame rate independent vs physics cycles", "Collision calculations"], expectedAnswer: "Update runs once per frame and is ideal for input and rendering. FixedUpdate runs at standard intervals (default 0.02s) and is used for physics and Rigidbody adjustments.", difficulty: "Medium" }
  ],
  resumeTips: ["List game engines, coding skills, vector mathematics, shaders, and hosting sites."],
  portfolioSuggestions: ["Itch.io portfolio linking playable game projects and Git repos."],
  keywords: ["Unity", "C#", "Vector Math", "Physics", "Shaders", "Multiplayer", "Profiler"]
});

