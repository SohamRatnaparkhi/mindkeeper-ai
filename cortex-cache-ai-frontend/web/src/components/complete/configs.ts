import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Bot, Brain, FileText, Globe, Image, Layers, Link, Quote, Search, Shield, Sparkles, Video } from "lucide-react";
import { DriveIcon, NotionIcon, YouTubeIcon } from "../conversation/CustomeIcons";

export interface UseCase {
    title: string;
    description: string;
    benefit: string;
}

export const useCases: UseCase[] = [
    {
        title: "Academic Research and Education",
        description: "Upload academic papers, lecture notes, and multimedia resources. Query to retrieve relevant information for studies with accurate citations.",
        benefit: "Enhances research efficiency and accuracy with a comprehensive, easily accessible knowledge base."
    },
    {
        title: "Corporate Knowledge Management",
        description: "Manage corporate knowledge by uploading internal documents, training videos, and project files. Query to find specific information instantly.",
        benefit: "Streamlines information retrieval and improves productivity while ensuring access to latest company knowledge."
    },
    {
        title: "Healthcare and Medical Records",
        description: "Store patient records, medical research, and treatment protocols. Query to retrieve patient histories or research findings quickly.",
        benefit: "Supports better patient care through quick access to comprehensive medical data."
    },
    {
        title: "Creative Industries",
        description: "Upload creative work like scripts, design files, and inspiration boards. Query stored content to find past ideas or references.",
        benefit: "Fosters creativity by providing easy access to past work and inspiration sources."
    },
    {
        title: "Legal Industry",
        description: "Store case files, legal research, and court documents. Query for case precedents or specific legal information.",
        benefit: "Aids in building stronger cases by providing quick access to relevant legal information."
    },
    {
        title: "Personal Productivity",
        description: "Manage personal documents, reminders, and multimedia memories. Query for past events, notes, or important documents.",
        benefit: "Enhances personal productivity by organizing life's information in one searchable place."
    },
    {
        title: "Education and E-learning",
        description: "Upload lecture notes, videos, and supplementary materials. Query for specific topics or generate quick summaries.",
        benefit: "Facilitates personalized learning and quick access to educational resources."
    },
    {
        title: "Financial Services",
        description: "Store market reports, client portfolios, and financial models. Query for trends or specific client data.",
        benefit: "Streamlines financial analysis and improves client advisory services."
    }
];


export const contentTypes = [
    {
        icon: FileText,
        label: "Files",
        description: "Upload and chat with any document or PDF file",
        examples: ["Research papers", "Books", "Articles"],
        colors: {
            gradientFrom: "from-sky-900/40",
            gradientTo: "to-indigo-900/40",
            borderColor: "border-sky-400/20",
            hoverBorderColor: "border-sky-400/40",
            iconColor: "text-yellow-400",
            hoverIconColor: "text-yellow-300",
            shadowColor: "shadow-yellow-500/20"
        }
    },
    {
        icon: Video,
        label: "Video/Audio",
        description: "Extract insights from video and audio content",
        examples: ["Podcasts", "Lectures", "Interviews"],
        colors: {
            gradientFrom: "from-fuchsia-900/40",
            gradientTo: "to-purple-900/40",
            borderColor: "border-fuchsia-400/20",
            hoverBorderColor: "border-fuchsia-400/40",
            iconColor: "text-red-400",
            hoverIconColor: "text-red-300",
            shadowColor: "shadow-red-500/20"
        }
    },
    {
        icon: Image,
        label: "Images",
        description: "Analyze and understand visual content",
        examples: ["Diagrams", "Charts", "Screenshots"],
        colors: {
            gradientFrom: "from-teal-900/40",
            gradientTo: "to-emerald-900/40",
            borderColor: "border-teal-400/20",
            hoverBorderColor: "border-teal-400/40",
            iconColor: "text-teal-400",
            hoverIconColor: "text-teal-300",
            shadowColor: "shadow-teal-500/20"
        }
    },
    {
        icon: YouTubeIcon,
        label: "YouTube",
        description: "Learn from your favorite YouTube content in ANY LANGUAGE",
        examples: ["Tutorials", "Documentaries", "Talks", "Podcasts"],
        colors: {
            gradientFrom: "from-rose-900/40",
            gradientTo: "to-pink-900/40",
            borderColor: "border-rose-400/20",
            hoverBorderColor: "border-rose-400/40",
            iconColor: "text-rose-400",
            hoverIconColor: "text-rose-300",
            shadowColor: "shadow-rose-500/20"
        }
    },
    {
        icon: Globe,
        label: "Web Pages",
        description: "Save and chat with web content",
        examples: ["Articles", "Blogs", "News"],
        colors: {
            gradientFrom: "from-violet-900/40",
            gradientTo: "to-purple-900/40",
            borderColor: "border-violet-400/20",
            hoverBorderColor: "border-violet-400/40",
            iconColor: "text-sky-400",
            hoverIconColor: "text-sky-300",
            shadowColor: "shadow-sky-500/20"
        }
    },
    {
        icon: NotionIcon,
        label: "Notion Pages",
        description: "Sync your Notion workspace instantly",
        examples: ["Notes", "Projects"],
        colors: {
            gradientFrom: "from-slate-900/40",
            gradientTo: "to-zinc-900/40",
            borderColor: "border-slate-400/20",
            hoverBorderColor: "border-slate-400/40",
            iconColor: "text-slate-400",
            hoverIconColor: "text-slate-300",
            shadowColor: "shadow-slate-500/20"
        }
    },
    {
        icon: DriveIcon,
        label: "Google Drive",
        description: "Access your Drive files seamlessly",
        examples: ["Docs", "Sheets", "Slides"],
        colors: {
            gradientFrom: "from-amber-900/40",
            gradientTo: "to-orange-900/40",
            borderColor: "border-amber-400/20",
            hoverBorderColor: "border-amber-400/40",
            iconColor: "text-amber-400",
            hoverIconColor: "text-amber-300",
            shadowColor: "shadow-amber-500/20"
        }
    },
    {
        icon: GitHubLogoIcon,
        label: "Code Repos",
        description: "Understand and discuss code better",
        examples: ["GitHub repositories", "Code snippets"],
        colors: {
            gradientFrom: "from-indigo-900/40",
            gradientTo: "to-blue-900/40",
            borderColor: "border-indigo-400/20",
            hoverBorderColor: "border-indigo-400/40",
            iconColor: "text-white",
            hoverIconColor: "text-white",
            shadowColor: "shadow-white/20"
        }
    },
    {
        icon: Search,
        label: "Web search",
        description: "Get real-time answers from the web",
        examples: ["Latest news", "Research", "Trends"],
        colors: {
            gradientFrom: "from-cyan-900/40",
            gradientTo: "to-sky-900/40",
            borderColor: "border-cyan-400/20",
            hoverBorderColor: "border-cyan-400/40",
            iconColor: "text-green-400",
            hoverIconColor: "text-green-300",
            shadowColor: "shadow-green-500/20"
        }
    },
    {
        icon: Bot,
        label: "Latest LLMs",
        description: "Powered by cutting-edge AI models",
        examples: ["GPT-4o", "Claude 3.5", "Gemini 1.5 Pro"],
        colors: {
            gradientFrom: "from-purple-900/40",
            gradientTo: "to-indigo-900/40",
            borderColor: "border-purple-400/20",
            hoverBorderColor: "border-purple-400/40",
            iconColor: "text-white",
            hoverIconColor: "text-white/20",
            shadowColor: "shadow-white/20"
        }
    }
];

export const features = [
    {
        icon: Brain,
        title: "Your Digital Brain",
        description: "Store everything in one place—documents, videos, notes, bookmarks—and easily recall it through natural conversations. Never forget a thing.",
        highlight: true,
        examples: "Documents • Videos • Notes • Meetings • Research • Ideas"
    },
    {
        icon: Link,
        title: "Everything in Sync",
        description: "Connect all your tools—Notion, Google Drive, GitHub, YouTube, bookmarks—and access everything seamlessly in one organized space.",
        highlight: true,
        examples: "Notion • Drive • GitHub • YouTube • Bookmarks • Web Pages"
    },
    {
        icon: Quote,
        title: "Answers with Citations",
        description: "Get precise answers with references, including page numbers, timestamps, and links, so you always know where your information comes from.",
        highlight: true,
        examples: "Quote sources • Page numbers • Video timestamps • Links"
    },
    {
        icon: Layers,
        title: "Use Latest LLMs",
        description: "Combine the power of GPT-4, Claude, Gemini, and more to get the most accurate and insightful answers tailored to your content.",
        examples: "GPT-4 • Claude • Gemini"
    },
    {
        icon: Globe,
        title: "Knowledge = Memories + Web + AI",
        description: "Find answers using your uploaded content, advanced AI, and even real-time web searches. You’re in control of the sources.",
        examples: "Your Content + AI + Web • Custom Search Scope • Real-time Web Integration"
    },
    {
        icon: Sparkles,
        title: "Visual Mind Maps",
        description: "Organize and connect ideas visually to explore your knowledge in clusters, playlists, and groups.",
        examples: "Playlists • Memory Clusters • Docs • Code"
    },
    {
        icon: Shield,
        title: "Privacy You Can Trust",
        description: "Your data is yours alone. Everything is encrypted, private, and fully under your control. No sharing, ever.",
        examples: "End-to-end encryption • GDPR • Total privacy"
    }
];