import Features from "@/components/complete/Features"
import Hero from "@/components/complete/Hero"
import Navbar from "@/components/complete/Navbar"

const LandingPage = () => {
    return (
        <div className="min-w-full min-h-screen flex flex-col relative md:bg-cover md:bg-blend-normal"

        // style={{ backgroundImage: "url('/landing/fullmask4_small.png')" }}
        >
            <Navbar />
            <div
                className="flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[##12061c] via-[##431c6b] to-[#2a1242]"
                style={{
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <Hero />
            </div>
            <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
                <Features />
                {/* <PricingSection /> */}
            </div>

        </div>
    )
}

export default LandingPage