
const GradientTransition = () => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Upper section with radial gradient background */}
            <div
                className="flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#9855FF] via-[#622A9A] to-[#361764]"
                style={{
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Your content for the upper section */}
            </div>

            {/* Transition section */}
            <div className="h-32 bg-gradient-to-b from-[#361764] to-black"></div>

            {/* Lower section with linear gradient background */}
            <div className="flex-1 bg-gradient-to-b from-black to-purple-950 text-white p-8">
                {/* Your content for the lower section */}
            </div>
        </div>
    );
};

export default GradientTransition;