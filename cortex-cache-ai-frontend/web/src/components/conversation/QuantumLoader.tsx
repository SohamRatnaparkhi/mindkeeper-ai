import React from 'react';

interface QuantumLoaderProps {
    size?: number;
    color?: string;
    speed?: number;
}

const QuantumLoader: React.FC<QuantumLoaderProps> = ({
    size = 32,
    color = '#A78BFA', // purple-400
    speed = 1.75
}) => {
    // Particle configuration with rotation angles and delays
    const particles = [
        { rotate: 8, delay: 0 },
        { rotate: 36, delay: -0.4 },
        { rotate: 72, delay: -0.9 },
        { rotate: 90, delay: -0.5 },
        { rotate: 144, delay: -0.3 },
        { rotate: 180, delay: -0.2 },
        { rotate: 216, delay: -0.6 },
        { rotate: 252, delay: -0.7 },
        { rotate: 300, delay: -0.1 },
        { rotate: 324, delay: -0.8 },
        { rotate: 335, delay: -1.2 },
        { rotate: 290, delay: -0.5 },
        { rotate: 240, delay: -0.2 },
    ];

    const styles = `
    .quantum-container {
      --uib-size: ${size}px;
      --uib-color: ${color};
      --uib-speed: ${speed}s;
      position: relative;
      height: var(--uib-size);
      width: var(--uib-size);
      animation: rotate calc(var(--uib-speed) * 4) linear infinite;
    }

    @keyframes rotate {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .quantum-particle {
      position: absolute;
      top: 0%;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
    }

    .quantum-particle::before {
      content: '';
      position: absolute;
      height: 17.5%;
      width: 17.5%;
      border-radius: 9999px;
      background-color: var(--uib-color);
      flex-shrink: 0;
      transition: background-color 0.3s ease;
      animation: orbit var(--uib-speed) linear var(--uib-d) infinite;
    }

    ${particles.map((p, i) => `
      .quantum-particle:nth-child(${i + 1}) {
        --uib-delay: ${p.delay};
        --uib-d: calc(var(--uib-delay) * var(--uib-speed));
        transform: rotate(${p.rotate}deg);
      }
    `).join('\n')}

    @keyframes orbit {
      0% {
        transform: translate(calc(var(--uib-size) * 0.5)) scale(0.73684);
        opacity: 0.65;
      }
      5% {
        transform: translate(calc(var(--uib-size) * 0.4)) scale(0.684208);
        opacity: 0.58;
      }
      10% {
        transform: translate(calc(var(--uib-size) * 0.3)) scale(0.631576);
        opacity: 0.51;
      }
      15% {
        transform: translate(calc(var(--uib-size) * 0.2)) scale(0.578944);
        opacity: 0.44;
      }
      20% {
        transform: translate(calc(var(--uib-size) * 0.1)) scale(0.526312);
        opacity: 0.37;
      }
      25% {
        transform: translate(0%) scale(0.47368);
        opacity: 0.3;
      }
      30% {
        transform: translate(calc(var(--uib-size) * -0.1)) scale(0.526312);
        opacity: 0.37;
      }
      35% {
        transform: translate(calc(var(--uib-size) * -0.2)) scale(0.578944);
        opacity: 0.44;
      }
      40% {
        transform: translate(calc(var(--uib-size) * -0.3)) scale(0.631576);
        opacity: 0.51;
      }
      45% {
        transform: translate(calc(var(--uib-size) * -0.4)) scale(0.684208);
        opacity: 0.58;
      }
      50% {
        transform: translate(calc(var(--uib-size) * -0.5)) scale(0.73684);
        opacity: 0.65;
      }
      55% {
        transform: translate(calc(var(--uib-size) * -0.4)) scale(0.789472);
        opacity: 0.72;
      }
      60% {
        transform: translate(calc(var(--uib-size) * -0.3)) scale(0.842104);
        opacity: 0.79;
      }
      65% {
        transform: translate(calc(var(--uib-size) * -0.2)) scale(0.894736);
        opacity: 0.86;
      }
      70% {
        transform: translate(calc(var(--uib-size) * -0.1)) scale(0.947368);
        opacity: 0.93;
      }
      75% {
        transform: translate(0%) scale(1);
        opacity: 1;
      }
      80% {
        transform: translate(calc(var(--uib-size) * 0.1)) scale(0.947368);
        opacity: 0.93;
      }
      85% {
        transform: translate(calc(var(--uib-size) * 0.2)) scale(0.894736);
        opacity: 0.86;
      }
      90% {
        transform: translate(calc(var(--uib-size) * 0.3)) scale(0.842104);
        opacity: 0.79;
      }
      95% {
        transform: translate(calc(var(--uib-size) * 0.4)) scale(0.789472);
        opacity: 0.72;
      }
      100% {
        transform: translate(calc(var(--uib-size) * 0.5)) scale(0.73684);
        opacity: 0.65;
      }
    }
  `;

    return (
        <>
            <style>{styles}</style>
            <div className="quantum-container">
                {particles.map((_, index) => (
                    <div key={index} className="quantum-particle" />
                ))}
            </div>
        </>
    );
};

export default QuantumLoader;