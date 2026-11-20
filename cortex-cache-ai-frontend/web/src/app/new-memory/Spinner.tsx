// Spinner.tsx
import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-purple-600 border-t-transparent"></div>
        </div>
    );
};

export default Spinner;