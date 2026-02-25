import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';

export const Form = () => {
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const payload = {
            name: String(formData.get('name') ?? '').trim(),
            email: String(formData.get('email') ?? '').trim(),
            instagram: String(formData.get('instagram') ?? '').trim(),
        };

        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = (await response.json().catch(() => null)) as { error?: string } | null;
                throw new Error(data?.error || 'Unable to join the waitlist right now.');
            }

            form.reset();
            setSubmitted(true);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to join the waitlist right now.';
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="waitlist-form" className="section" style={{ paddingTop: '3.2rem', paddingBottom: '6rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                    maxWidth: '560px',
                    margin: '0 auto',
                    padding: '1.8rem 1.35rem',
                    background: 'rgba(11, 11, 15, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '1rem',
                    backdropFilter: 'blur(8px)'
                }}
            >
                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '0.5rem 0.25rem' }}>
                        <p
                            style={{
                                marginBottom: '0.65rem',
                                fontSize: '0.78rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.14em',
                                color: 'rgba(232, 174, 183, 0.9)'
                            }}
                        >
                            Waitlist Confirmed
                        </p>
                        <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-color)', fontSize: '1.6rem' }}>You're on the list.</h2>
                        <p style={{ margin: 0, fontSize: '0.96rem' }}>We'll email you when early access opens.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '1.15rem' }}>
                            <h2 style={{ marginBottom: '0.45rem', fontSize: '1.65rem' }}>Join the Waitlist</h2>
                            <p style={{ margin: 0, fontSize: '0.98rem' }}>Get early access when Elura opens.</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch' }}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                required
                                style={{ padding: '0.85rem 1rem', borderRadius: '0.65rem', fontSize: '0.95rem' }}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                required
                                style={{ padding: '0.85rem 1rem', borderRadius: '0.65rem', fontSize: '0.95rem' }}
                            />
                            <input
                                type="text"
                                name="instagram"
                                placeholder="Instagram Handle (Optional)"
                                style={{ padding: '0.85rem 1rem', borderRadius: '0.65rem', fontSize: '0.95rem' }}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    marginTop: '0.35rem',
                                    alignSelf: 'flex-start',
                                    padding: '0.62rem 1rem',
                                    borderRadius: '999px',
                                    border: '1px solid rgba(232, 174, 183, 0.35)',
                                    background: 'rgba(232, 174, 183, 0.12)',
                                    color: 'rgba(255, 245, 247, 0.95)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.01em',
                                    opacity: isSubmitting ? 0.75 : 1,
                                }}
                            >
                                {isSubmitting ? 'Saving...' : 'Join Waitlist'}
                            </button>

                            {errorMessage ? (
                                <p style={{ margin: 0, fontSize: '0.86rem', color: '#f5b3c1' }}>{errorMessage}</p>
                            ) : null}
                        </form>
                    </>
                )}
            </motion.div>
        </section>
    );
};
