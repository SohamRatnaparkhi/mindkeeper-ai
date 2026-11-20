'use client';

import { useState } from 'react';
import MobileUsecasesCarousel from './MobileUsecasesCarousel';
import ResponsiveContentTypes from './ResponsiveContentTypes';
import TeamSection from './TeamSection';
import UseCasesSection from './Usecases';
import { contentTypes, features } from './configs';

const Features = () => {
    const [selectedFeature, setSelectedFeature] = useState(null);
    const handleFeatureClick = (index: any) => {
        setSelectedFeature(selectedFeature === index ? null : index);
    };
    return (
        <div id='features' className="min-h-screen bg-black text-white py-16">
            <div className=" text-white">
                <div className='px-4 w-full md:w-11/12 mx-auto sm:px-6 lg:px-8 '>
                    <div className="text-center mb-16">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
                            Your AI-Powered Second Brain
                        </h1>
                        <p className="text-sm md:text-md text-gray-300 max-w-3xl mx-auto mb-6">
                            Single platform to organize and recall all—your files, bookmarks, YouTube playlists, notes, and more. <br />
                            Get results from your saved memories, the web, or both—whenever you need.
                        </p>
                        <div className="bg-[#180730] p-4 rounded-lg inline-block backdrop-blur-sm border border-purple-500/30">
                            <p className="text-md italic sm:text-large text-purple-200">
                                "It's like talking to a version of yourself that remembers everything you've ever read, watched, or learned."
                            </p>
                        </div>
                    </div>
                    <ResponsiveContentTypes contentTypes={contentTypes} />

                </div>
                <section className="mt-24 min-h-screen bg-gradient-to-r from-[#190D2E] to-[#020103] text-white px-6 py-16 md:px-8 lg:px-12">
                    {/* <section className="mt-24 min-h-screen bg-gradient-to-r from-[#18102b] to-[#0d0b14] text-white px-6 py-16 md:px-8 lg:px-12"> */}
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal mb-20">
                            Its the most accurate AI <br />
                            built for YOU.
                        </h1>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                            {features.map((feature, index) => (
                                <FeatureCard
                                    key={index}
                                    icon={feature.icon}
                                    title={feature.title}
                                    description={feature.description}
                                    highlight={true}
                                    examples={feature.examples}
                                    isDefaultOpen={index === 0}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            <UseCasesSection />
            <MobileUsecasesCarousel />
            <TeamSection />
            <div className='flex flex-row gap-2 text-xs items-center justify-center'>
                {/* <p className='m-2 pt-2 text-center text-gray-400'>Contact us: <a href="mailto:info@mindkeeperai.com">info@mindkeeperai.com</a></p> */}
                <p className='text-center text-gray-400 '><a className='text-blue-600' href="https://mindkeeperai.com/privacy-policy">Privacy policy</a> | </p>
                <p className='text-center text-gray-400 '><a className='text-blue-600' href="https://mindkeeperai.com/terms">Terms of service</a> | </p>
                <p className='text-center text-gray-400 '><a className='text-blue-600' href="https://mindkeeperai.com/refund">Refund policy</a> </p>
            </div>
        </div>
    );
};

export default Features;

interface FeatureProps {
    icon: React.ElementType
    title: string
    description: string
    highlight?: boolean
    examples?: string
}

function FeatureCard({ icon: Icon, title, description, highlight, examples, isDefaultOpen = false }: FeatureProps & { isDefaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(isDefaultOpen);

    return (
        <div
            className={`space-y-4 ${highlight ? 'bg-white/5 p-6 rounded-lg' : ''}`}
            onClick={() => window.innerWidth <= 768 && setIsOpen(!isOpen)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-white/80" />
                    <h2 className="text-xl font-medium">{title}</h2>
                </div>
                {/* Only show chevron on mobile */}
                <svg
                    className={`w-5 h-5 transition-transform md:hidden ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            <div className={`md:block ${isOpen ? 'block' : 'hidden'}`}>
                <p className="text-gray-400 leading-relaxed">{description}</p>
                {examples && (
                    <p className="text-sm text-gray-500 mt-4">{examples}</p>
                )}
            </div>
        </div>
    )
}
