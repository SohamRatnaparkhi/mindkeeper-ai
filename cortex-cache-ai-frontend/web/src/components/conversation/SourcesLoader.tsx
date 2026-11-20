import React from 'react';

interface OrbitalLoaderProps {
    size?: number;
    color?: string;
    speed?: number;
}

export const SourcesLoader: React.FC<OrbitalLoaderProps> = ({
    size = 24,
    color = '#A78BFA', // purple-400
    speed = 2.5
}) => {
    // Convert the animation CSS to a style object
    const styles = `
    .orbital-container {
      --uib-size: ${size}px;
      --uib-color: ${color};
      --uib-speed: ${speed}s;
    }

    .orbital-slice::before,
    .orbital-slice::after {
      --uib-a: calc(var(--uib-speed) / -2);
      --uib-b: calc(var(--uib-speed) / -6);
      content: '';
      position: absolute;
      top: 0;
      left: calc(50% - var(--uib-size) / 12);
      height: 100%;
      width: calc(100% / 6);
      border-radius: 9999px;
      background-color: var(--uib-color);
      flex-shrink: 0;
      animation: orbit var(--uib-speed) linear infinite;
      transition: background-color 0.3s ease;
    }

    .orbital-slice:nth-child(1)::after {
      animation-delay: var(--uib-a);
    }

    .orbital-slice:nth-child(2)::before {
      animation-delay: var(--uib-b);
    }

    .orbital-slice:nth-child(2)::after {
      animation-delay: calc(var(--uib-a) + var(--uib-b));
    }

    .orbital-slice:nth-child(3)::before {
      animation-delay: calc(var(--uib-b) * 2);
    }
    .orbital-slice:nth-child(3)::after {
      animation-delay: calc(var(--uib-a) + var(--uib-b) * 2);
    }

    .orbital-slice:nth-child(4)::before {
      animation-delay: calc(var(--uib-b) * 3);
    }
    .orbital-slice:nth-child(4)::after {
      animation-delay: calc(var(--uib-a) + var(--uib-b) * 3);
    }

    .orbital-slice:nth-child(5)::before {
      animation-delay: calc(var(--uib-b) * 4);
    }
    .orbital-slice:nth-child(5)::after {
      animation-delay: calc(var(--uib-a) + var(--uib-b) * 4);
    }

    .orbital-slice:nth-child(6)::before {
      animation-delay: calc(var(--uib-b) * 5);
    }
    .orbital-slice:nth-child(6)::after {
      animation-delay: calc(var(--uib-a) + var(--uib-b) * 5);
    }

    @keyframes orbit {
      0% {
        transform: translateX(calc(var(--uib-size) * 0.25)) scale(0.73684);
        opacity: 0.65;
      }
      5% {
        transform: translateX(calc(var(--uib-size) * 0.235)) scale(0.684208);
        opacity: 0.58;
      }
      10% {
        transform: translateX(calc(var(--uib-size) * 0.182)) scale(0.631576);
        opacity: 0.51;
      }
      15% {
        transform: translateX(calc(var(--uib-size) * 0.129)) scale(0.578944);
        opacity: 0.44;
      }
      20% {
        transform: translateX(calc(var(--uib-size) * 0.076)) scale(0.526312);
        opacity: 0.37;
      }
      25% {
        transform: translateX(0%) scale(0.47368);
        opacity: 0.3;
      }
      30% {
        transform: translateX(calc(var(--uib-size) * -0.076)) scale(0.526312);
        opacity: 0.37;
      }
      35% {
        transform: translateX(calc(var(--uib-size) * -0.129)) scale(0.578944);
        opacity: 0.44;
      }
      40% {
        transform: translateX(calc(var(--uib-size) * -0.182)) scale(0.631576);
        opacity: 0.51;
      }
      45% {
        transform: translateX(calc(var(--uib-size) * -0.235)) scale(0.684208);
        opacity: 0.58;
      }
      50% {
        transform: translateX(calc(var(--uib-size) * -0.25)) scale(0.73684);
        opacity: 0.65;
      }
      55% {
        transform: translateX(calc(var(--uib-size) * -0.235)) scale(0.789472);
        opacity: 0.72;
      }
      60% {
        transform: translateX(calc(var(--uib-size) * -0.182)) scale(0.842104);
        opacity: 0.79;
      }
      65% {
        transform: translateX(calc(var(--uib-size) * -0.129)) scale(0.894736);
        opacity: 0.86;
      }
      70% {
        transform: translateX(calc(var(--uib-size) * -0.076)) scale(0.947368);
        opacity: 0.93;
      }
      75% {
        transform: translateX(0%) scale(1);
        opacity: 1;
      }
      80% {
        transform: translateX(calc(var(--uib-size) * 0.076)) scale(0.947368);
        opacity: 0.93;
      }
      85% {
        transform: translateX(calc(var(--uib-size) * 0.129)) scale(0.894736);
        opacity: 0.86;
      }
      90% {
        transform: translateX(calc(var(--uib-size) * 0.182)) scale(0.842104);
        opacity: 0.79;
      }
      95% {
        transform: translateX(calc(var(--uib-size) * 0.235)) scale(0.789472);
        opacity: 0.72;
      }
      100% {
        transform: translateX(calc(var(--uib-size) * 0.25)) scale(0.73684);
        opacity: 0.65;
      }
    }
  `;

    return (
        <>
            <style>{styles}</style>
            <div className="orbital-container flex flex-col items-center justify-center" style={{ height: size, width: size }}>
                <div className="orbital-slice relative" style={{ height: `${size / 6}px`, width: '100%' }}></div>
                <div className="orbital-slice relative" style={{ height: `${size / 6}px`, width: '100%' }}></div>
                <div className="orbital-slice relative" style={{ height: `${size / 6}px`, width: '100%' }}></div>
                <div className="orbital-slice relative" style={{ height: `${size / 6}px`, width: '100%' }}></div>
                <div className="orbital-slice relative" style={{ height: `${size / 6}px`, width: '100%' }}></div>
                <div className="orbital-slice relative" style={{ height: `${size / 6}px`, width: '100%' }}></div>
            </div>
        </>
    );
};
