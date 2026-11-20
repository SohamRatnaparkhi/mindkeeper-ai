"use client";
import Link from 'next/link';

const CTAButton = () => {
    return (
        <Link href="/auth/register" className="w-full max-w-md my-2 mb-6">
            <button className="bg-gradient-to-r from-purple-600 my-2 mb-6 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg text-base font-medium transition-all duration-300">
                Try Now - No Credit Card Required
            </button>
        </Link>
    );
};

export default CTAButton;