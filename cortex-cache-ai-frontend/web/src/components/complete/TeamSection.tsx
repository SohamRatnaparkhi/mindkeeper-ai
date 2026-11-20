import { Github, Mail, Twitter } from 'lucide-react';

const TeamSection = () => {
    return (
        <div id='team' className="mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">
                Meet the Team
            </h2>

            <div className="flex justify-center">
                <div className="bg-gradient-to-r from-[#190D2E] to-[#020103] border border-purple-500/30 rounded-xl p-8 backdrop-blur-sm max-w-xl hover:scale-105 transition-transform duration-300">
                    <div className="text-center">
                        <img
                            src="/passport_size_photo.jpg"
                            alt="Soham Ratnaparkhi"
                            className="rounded-full w-32 h-32 mx-auto mb-4 border-2 border-purple-500/50"
                        />
                        <h3 className="text-2xl font-bold text-white mb-2">Soham Ratnaparkhi</h3>
                        <p className="text-purple-200 mb-4">Founder</p>
                        <p className="text-gray-300 mb-6 text-sm">
                            Building MindKeeper AI to revolutionize personal knowledge management through AI and LLMs.
                        </p>

                        <div className="flex justify-center space-x-4">
                            <a
                                href="https://github.com/SohamRatnaparkhi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-purple-900/50 hover:bg-purple-700/50 transition-colors duration-300"
                            >
                                <Github className="h-5 w-5 text-white" />
                            </a>
                            <a
                                href="https://twitter.com/SohamR_7113"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-purple-900/50 hover:bg-purple-700/50 transition-colors duration-300"
                            >
                                <Twitter className="h-5 w-5 text-white" />
                            </a>
                            <a
                                href="mailto:soham.ratnaparkhi@mindkeeperai.com"
                                className="p-2 rounded-full bg-purple-900/50 hover:bg-purple-700/50 transition-colors duration-300"
                            >
                                <Mail className="h-5 w-5 text-white" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-12">
                <p className="text-gray-400 text-sm">
                    Interested in joining our mission? <br />
                    <a
                        href="mailto:info@mindkeeperai.com"
                        className="text-purple-400 hover:text-purple-300 transition-colors duration-300"
                    >
                        Get in touch with us
                    </a>
                </p>
            </div>
        </div>
    );
};

export default TeamSection;