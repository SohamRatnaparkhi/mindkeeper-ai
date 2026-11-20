'use client'

import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { AddMemoriesStep } from './AddMemoriesStep'
import { ChatStep } from './ChatStep'
import { ExploreMemoriesStep } from './ExploreMemoriesStep'
import { MindmapsStep } from './MindmapsStep'
import { WelcomeStep } from './WelcomStep'

// const steps = [
//     {
//         title: "Welcome to Mindkeeper AI",
//         description: `
//         Discover the ultimate AI-powered memory assistant! 
//         Capture, organize, and interact with your digital memories like never before. 
//         Mindkeeper makes it simple to create, search, and chat with your personal knowledge base.
//         `,
//         icon: Brain, // Use an engaging brain icon
//     },
//     {
//         title: "Adding Memories",
//         description: `
//         Get started with your memory vault:

//         - **How to Add Memories:**  
//           1. Click the '+' icon (top bar) or BrainCircuit icon (sidebar).  
//           2. Select from **Media, YouTube Video, Web Page, Git Repo**, or connect **Notion/Google Drive**.  
//           3. Provide a **Title** (required). Description and tags are optional.  
//           4. Click **Add Memory** to start uploading.

//         - **Upload Process:**  
//           - Uploads take 30 seconds to 15 minutes based on content size.  
//           - You'll receive an email when done.  
//           - Monitor progress in the **Status** section after clicking Add Memory.

//         Add diverse memories to make Mindkeeper smarter!
//         `,
//         icon: PlusCircle, // Icon emphasizing addition
//     },
//     {
//         title: "Exploring Memories",
//         description: `
//         Seamlessly access and find your memories:

//         - **Viewing Memories:**  
//           - Click the **Book** icon (sidebar) to view all saved memories.

//         - **Search Features:**  
//           1. **Normal Search:** Search by memory title.  
//           2. **AI Search:** Can't remember the title? Enter keywords or descriptions, and Mindkeeper will find it for you.  

//         - **Chat with Memories:**  
//           - Click on a memory to start a focused conversation.  
//           - Mindkeeper uses that memory's contents to provide targeted insights.  

//         Discover how easy memory retrieval can be!
//         `,
//         icon: BookOpen, // Icon for a book/memories
//     },
//     {
//         title: "Creating Mindmaps",
//         description: `
//         Combine memories for powerful insights:

//         - **Steps to Create Mindmaps:**  
//           1. Click the '+' icon or BrainCircuit icon.  
//           2. Go to the **Mindmap Tab**.  
//           3. Select two or more related memories.  
//           4. Add a title (required) and description (optional).  
//           5. Click **Create Mindmap** to link memories.

//         - **Access Mindmaps:**  
//           - Use the **Network Icon** in the sidebar to view and manage mindmaps.  
//           - Chat with mindmaps for cross-memory insights.

//         Mindmaps let you see the bigger picture and draw powerful connections.
//         `,
//         icon: Network, // Network/mindmap icon
//     },
//     {
//         title: "Chatting with Your Digital Brain",
//         description: `
//         Talk naturally with your knowledge assistant:

//         - **Starting Conversations:**  
//           - Click the **New Chat** icon (sidebar).  
//           - Type your question in natural language.  

//         - **Features:**  
//           - Toggle the **Web Option** to include web search results.  
//           - Click the **Recycle Button** for alternative answers.  
//           - Adjust agents or settings for tailored responses.

//         - **Past Conversations:**  
//           - Access them via the **History Icon** in the sidebar.

//         The more memories you add, the smarter and more helpful Mindkeeper becomes!
//         `,
//         icon: MessageCircle, // Icon for chat/message
//     },
// ];
const steps = [
    {
        component: WelcomeStep
    },
    {
        component: AddMemoriesStep
    },
    {
        component: ExploreMemoriesStep
    },
    {
        component: MindmapsStep
    },
    {
        component: ChatStep
    }
];

export function OnboardingModal({ onClose }: { onClose: () => void }) {
    const [currentStep, setCurrentStep] = useState(0)

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

    const StepComponent = steps[currentStep].component

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-700"
            >
                <div className="relative p-6 max-h-[50vh] overflow-y-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                    <AnimatePresence mode="wait">
                        <StepComponent key={currentStep} />
                    </AnimatePresence>
                </div>
                <div className="flex justify-between items-center px-6 py-4 bg-slate-800/50 backdrop-blur-sm">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="text-slate-300 border-slate-600 hover:bg-slate-700"
                    >
                        Previous
                    </Button>
                    <div className="flex space-x-2">
                        {steps.map((_, index) => (
                            <motion.div
                                key={index}
                                className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-blue-500' : 'bg-slate-500'
                                    }`}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: index === currentStep ? 1.2 : 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        ))}
                    </div>
                    <Button
                        onClick={currentStep === steps.length - 1 ? onClose : nextStep}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}

