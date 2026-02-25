import { motion } from 'framer-motion';
import { Smartphone, Users, CalendarX } from 'lucide-react';

const problems = [
    {
        icon: <Users size={18} />,
        title: 'Instagram is Crowded',
        desc: 'Standing out in a sea of algorithms means you lose potential clients daily.'
    },
    {
        icon: <CalendarX size={18} />,
        title: 'Inconsistent Bookings',
        desc: 'Relying on DMs structure leads to ghosting and unpaid time.'
    },
    {
        icon: <Smartphone size={18} />,
        title: 'Unprofessional Booking',
        desc: 'No dedicated system to showcase your worth and verify clients safely.'
    }
];

export const Problem = () => {
    return (
        <section className="section" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>The Old Way is Broken</h2>
                <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.125rem' }}>
                    As a professional makeup artist, you deserve better tools than endless scrolling and chaotic DMs.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {problems.map((item, index) => (
                    <motion.div
                        key={index}
                        className="glass-panel"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                    >
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '12px',
                            background: 'rgba(232, 174, 183, 0.08)', color: 'var(--accent-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                            border: '1px solid rgba(232, 174, 183, 0.2)'
                        }}>
                            {item.icon}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-color)' }}>{item.title}</h3>
                        <p style={{ margin: 0 }}>{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
