import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Check } from 'lucide-react';

const GridBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
            className="w-full h-full"
            style={{
                backgroundImage: `
          linear-gradient(to bottom, rgba(10, 4, 28, 0.7) 0%, rgba(10, 4, 28, 0.9) 100%),
          linear-gradient(to right, transparent 19px, rgba(139, 92, 246, 0.2) 19px, rgba(139, 92, 246, 0.2) 20px, transparent 20px),
          linear-gradient(transparent 19px, rgba(139, 92, 246, 0.2) 19px, rgba(139, 92, 246, 0.2) 20px, transparent 20px)
        `,
                backgroundSize: '100% 100%, 20px 20px, 20px 20px',
            }}
        >
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(to right, transparent 79px, rgba(139, 92, 246, 0.3) 79px, rgba(139, 92, 246, 0.3) 80px, transparent 80px),
            linear-gradient(transparent 79px, rgba(139, 92, 246, 0.3) 79px, rgba(139, 92, 246, 0.3) 80px, transparent 80px)
          `,
                    backgroundSize: '40px 40px',
                }}
            />
        </div>
    </div>
);

interface ProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: 'alpha' | 'beta') => void;
    isLoading: boolean;
}

const ProgramModal = ({ isOpen, onClose, onSelect, isLoading }: ProgramModalProps) => {
    const programs = {
        alpha: {
            benefits: [
                "Access all features for free",
                "Heavy discounts after first major launch",
                "1 life-time offer only for alpha users",
                "Get direct attention and each feedback will be addressed",
                "Start now without credit card requirement"
            ],
            disadvantages: ["Few bugs"],
            cta: "Join Alpha Program"
        },
        beta: {
            benefits: [
                "Access all premium and pro features at discounted rates",
                "Huge free tier compared to non-beta users",
                "Test features before they are launched",
                "More stable than alpha"
            ],
            disadvantages: ["Fewer bugs", "Can't access all features for free before beta-launch"],
            cta: "Join Beta Program"
        }
    };

    interface ProgramTabProps {
        type: 'alpha' | 'beta';
        details: {
            benefits: string[];
            disadvantages: string[];
            cta: string;
        };
    }

    const ProgramTab = ({ type, details }: ProgramTabProps) => (
        <div className="space-y-6 relative z-10">
            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Benefits</h3>
                    <ul className="space-y-2">
                        {details.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-200">{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Considerations</h3>
                    <ul className="space-y-2">
                        {details.disadvantages.map((disadvantage, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-200">{disadvantage}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full relative z-10"
                onClick={() => onSelect(type)}
            >
                {
                    isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-t-2 border-[#9855FF] rounded-full animate-spin" />
                        </div>
                    ) : details.cta
                }
            </Button>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0A041C] border-none max-w-2xl relative fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-h-[90vh] p-[1px] rounded-lg overflow-hidden">
                <style jsx global>{`
                    @keyframes movingGradient {
                        0% { background-position: 0% 0%; }
                        100% { background-position: 200% 0%; }
                    }
                    
                    .animated-border {
                        background: linear-gradient(
                            90deg,
                            rgba(152, 85, 255, 0.7) 0%,
                            rgba(248, 87, 166, 0.7) 33%,
                            rgba(87, 204, 248, 0.7) 66%,
                            rgba(152, 85, 255, 0.7) 100%
                        );
                        background-size: 200% auto;
                        animation: movingGradient 8s linear infinite;
                    }
                    
                    /* Hide scrollbar for Chrome, Safari and Opera */
                    ::-webkit-scrollbar {
                        display: none;
                    }
                    
                    /* Hide scrollbar for IE, Edge and Firefox */
                    * {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                `}</style>

                <div className="animated-border absolute inset-0 rounded-lg" />

                <div className="relative bg-[#0A041C] rounded-lg w-full h-full overflow-y-auto">
                    <GridBackground />

                    <div className="relative z-10 p-6">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-2xl font-bold text-white">
                                Choose Your Program
                            </DialogTitle>
                            <DialogDescription className="text-purple-200">
                                Select the program that best fits your needs and involvement level
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="alpha" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-[#150934] sticky top-0 z-20">
                                <TabsTrigger
                                    value="alpha"
                                    className="data-[state=active]:bg-purple-600 text-white"
                                >
                                    Alpha Program
                                </TabsTrigger>
                                <TabsTrigger
                                    value="beta"
                                    className="data-[state=active]:bg-purple-600 text-white"
                                >
                                    Beta Program
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-6">
                                <TabsContent value="alpha">
                                    <ProgramTab type="alpha" details={programs.alpha} />
                                </TabsContent>
                                <TabsContent value="beta">
                                    <ProgramTab type="beta" details={programs.beta} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProgramModal;