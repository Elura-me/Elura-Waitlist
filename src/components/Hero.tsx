import { motion } from 'framer-motion';

export const Hero = () => {
    return (
        <section className="section" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '6rem', paddingBottom: '4rem', overflow: 'hidden' }}>
            {/* Background Glow Effect */}
            <div className="hero-glow"></div>

            <div style={{ maxWidth: '800px', position: 'relative', zIndex: 10 }}>
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}
                >
                    Stop chasing clients. <span style={{ color: 'var(--accent-color)' }}>Start getting booked.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.25 }}
                    style={{ fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', color: 'rgba(255,255,255,0.7)' }}
                >
                    <span className="elura-mark" style={{ fontSize: '1.45em', lineHeight: 0.9 }}>Elura</span> makes artists feel like professionals. Setup your premium portfolio, get discovered by clients, and manage bookings effortlessly.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <a href="#waitlist-form" className="btn-primary" style={{ padding: '0.84rem 1.65rem', fontSize: '0.94rem' }}>
                        Join as an Artist
                    </a>
                </motion.div>
            </div>
        </section>
    );
};
