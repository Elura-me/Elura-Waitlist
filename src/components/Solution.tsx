import { motion } from 'framer-motion';
import { Layout, CheckSquare, ShieldCheck } from 'lucide-react';

const solutions = [
    {
        icon: <Layout size={16} />,
        title: 'Professional Portfolio',
        desc: 'A premium space that highlights your best work.'
    },
    {
        icon: <CheckSquare size={16} />,
        title: 'Direct Booking System',
        desc: 'Let clients book your services directly without the back and forth.'
    },
    {
        icon: <ShieldCheck size={16} />,
        title: 'Verified Trust Layer',
        desc: 'Build trust with real reviews and secure transactions.'
    }
];

export const Solution = () => {
    return (
        <section className="section" style={{ paddingTop: '3.5rem', paddingBottom: '4.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>
                    Enter <span className="elura-mark" style={{ fontSize: '1.08em' }}>Elura</span>
                </h2>
                <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.125rem' }}>
                    The professional platform built exclusively for beauty artists.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.9rem', maxWidth: '880px', margin: '0 auto' }}>
                {solutions.map((item, index) => (
                    <motion.div
                        key={index}
                        className="glass-panel"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.65rem', padding: '0.95rem 0.9rem' }}
                    >
                        <div style={{
                            flexShrink: 0, width: '34px', height: '34px', borderRadius: '10px',
                            background: 'rgba(232, 174, 183, 0.1)', color: 'var(--accent-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(232, 174, 183, 0.2)'
                        }}>
                            {item.icon}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem', color: 'var(--text-color)' }}>{item.title}</h3>
                            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.45 }}>{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
