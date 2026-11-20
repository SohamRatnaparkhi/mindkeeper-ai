"use client";
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
            }
        };

        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-lg' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/landing" className="flex items-center">
                        <Image
                            src="/logo/final-no-name.png"
                            alt="Logo"
                            width={48}
                            height={48}
                            className="sm:w-12 sm:h-12 w-8 h-8 transition-transform duration-300 hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex items-center space-x-6">
                            <NavItem href="#features" label="Features" />
                            <NavItem href="#usecases" label="Use Cases" />
                            <NavItem href="#team" label="Team" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/privacy-policy">
                                <button className="text-white/90 hover:text-white px-3 py-1 rounded-md text-sm transition-colors">
                                    Privacy Policy
                                </button>
                            </Link>
                            <Link href="/auth/register">
                                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
                                    Try for free
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                <div className={`md:hidden fixed inset-x-0 top-16 bg-black/95 backdrop-blur-lg transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
                    }`}>
                    <div className="p-4 space-y-4">
                        <NavItem href="#features" label="Features" mobile />
                        <NavItem href="#usecases" label="Use Cases" mobile />
                        <NavItem href="#team" label="Team" mobile />
                        <div className="pt-4 space-y-3">
                            <Link href="/privacy-policy" className="block">
                                <button className="w-full text-left text-white/90 hover:text-white px-3 py-2 rounded-md text-sm transition-colors">
                                    Privacy Policy
                                </button>
                            </Link>
                            <Link href="/auth/register" className="block">
                                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300">
                                    Try for free
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavItem = ({
    href,
    label,
    mobile = false
}: {
    href: string;
    label: string;
    mobile?: boolean;
}) => (
    <Link
        href={href}
        className={`group flex items-center transition-colors duration-300 ${mobile ? 'text-sm text-white/90 hover:text-white px-3 py-2' : 'text-sm text-white/90 hover:text-white'
            }`}
        onClick={() => mobile && document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })}
    >
        {label}
    </Link>
);

export default Navbar;