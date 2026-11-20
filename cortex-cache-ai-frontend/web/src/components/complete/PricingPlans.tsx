import { Check, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";

const PricingSection = () => {
    const plans = [
        {
            title: "Free",
            price: "$0",
            period: "forever",
            description: "Perfect for trying out your AI brain",
            features: [
                "3 AI-powered queries per week",
                "2GB storage limit",
                "Basic document analysis",
                "Access to GPT-4o",
                "PDF, Audio, Video, Image support",
                "Community support",
                "No credit card required"
            ],
            buttonText: "Get Started Free",
            buttonColor: "gray"
        },
        {
            title: "Pro",
            price: "$29",
            period: "month",
            description: "Most popular for professionals",
            highlighted: true,
            features: [
                "Unlimited AI queries",
                "50GB secure storage (expandable)",
                "All AI models (GPT-4o, Claude 3.5, LLaMA 3.1/3.2)",
                "Advanced semantic search",
                "Real-time web research",
                "All file types supported",
                "Code supported",
                "YouTube video analysis",
                "All integrations (Notion, Drive, GitHub)",
                "Priority support",
                "Team sharing (up to 3 users)",
                "Advanced security features"
            ],
            savings: "Most cost-effective for regular usage",
            buttonText: "Start Free Trial",
            buttonColor: "purple"
        },
        {
            title: "Pay-as-you-go",
            price: "From $15",
            period: "month",
            description: "Flexible pricing for occasional use",
            features: [
                "All Pro features included",
                "No monthly commitment",
                "Pay only for what you use",
                "Read tokens: $0.008/1K tokens",
                "Write tokens: $0.016/1K tokens",
                "Storage: $0.015/GB/month",
                "Real-time usage dashboard",
                "Ideal for sporadic usage"
            ],
            costExample: [
                "Example usage scenario:",
                "• Light usage (20K tokens): $0.16",
                "• Medium usage (100K tokens): $0.80",
                "• 50GB storage: $0.75",
                "• Base price: $15/mo",
                "Typical total: $16.71/mo",
                "Heavy usage could reach $35-45/mo"
            ],
            buttonText: "Start Free Trial",
            buttonColor: "indigo",
            footnote: "Perfect for those who need occasional access"
        },
        {
            title: "Enterprise",
            price: "Custom",
            period: "pricing",
            description: "Full-featured solution for organizations",
            features: [
                "Unlimited storage",
                "Custom AI model deployment",
                "Enterprise SSO & SAML",
                "Advanced security features",
                "Custom integrations",
                "Dedicated support team",
                "SLA guarantees",
                "Unlimited team members",
                "Custom retention policies",
                "Audit logs & analytics",
                "API access",
                "Training & onboarding"
            ],
            buttonText: "Contact Sales",
            buttonColor: "pink"
        }
    ];

    return (
        <div id="pricing" className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                        Choose Your Memory Upgrade
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Scale your second brain as you grow. Upgrade or downgrade anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {plans.map((plan) => (
                        <Card
                            key={plan.title}
                            className={`backdrop-blur-sm border-purple-700 transition-all duration-300 ease-in-out
                                ${plan.highlighted ?
                                    'bg-gradient-to-br from-purple-900/60 to-pink-900/60 scale-105' :
                                    'bg-purple-900/20 hover:scale-102'}`}
                        >
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-white">{plan.title}</CardTitle>
                                <div className="flex items-baseline mb-2">
                                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                                    <span className="text-sm text-gray-400 ml-2">/{plan.period}</span>
                                </div>
                                <p className="text-sm text-gray-300">{plan.description}</p>
                                {plan.savings && (
                                    <p className="mt-2 text-sm text-green-400 font-medium">{plan.savings}</p>
                                )}
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center">
                                            <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                                            <span className="text-sm text-gray-200">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                {plan.costExample && (
                                    <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                                        <p className="text-sm font-medium text-purple-300 mb-2">{plan.costExample[0]}</p>
                                        {plan.costExample.slice(1).map((line, index) => (
                                            <p key={index} className="text-sm text-gray-300">{line}</p>
                                        ))}
                                    </div>
                                )}
                                {plan.footnote && (
                                    <p className="mt-3 text-sm text-gray-400 italic">{plan.footnote}</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Link href={'https://www.mindkeeperai.com'}    >
                                    <Button
                                        className={`w-full bg-${plan.buttonColor}-600 hover:bg-${plan.buttonColor}-700  
                                        text-white font-semibold py-2 px-4 rounded transition-all duration-300 ease-in-out`}
                                    >
                                        {plan.buttonText}
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 flex items-center justify-center">
                        <Info className="h-5 w-5 mr-2" />
                        All paid plans include a 14-day free trial with full features
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PricingSection;
