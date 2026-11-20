import React, { ReactNode } from 'react';

interface CustomScrollAreaProps {
    className?: string;
    children: ReactNode;
    smoothScroll?: boolean;
}

const CustomScrollArea: React.FC<CustomScrollAreaProps> = ({
    className,
    children,
    smoothScroll = false
}) => {
    return (
        <div
            className={`custom-scroll-area ${className}`}
            style={{ scrollBehavior: smoothScroll ? 'smooth' : 'auto' }}
        >
            {children}
        </div>
    );
};

export default CustomScrollArea;