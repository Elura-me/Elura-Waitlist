import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';

interface Message {
    id: string;
    sender: 'ai' | 'user';
    text: string;
}

const initialMessages: Message[] = [
    {
        id: '1',
        sender: 'ai',
        text: 'Hi, I am Elura. Are you a makeup artist looking to get more clients, or a client looking to book an artist?'
    }
];

export const EluraAgent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');

        // Simulate AI response based on gemini.md guidelines
        setTimeout(() => {
            let aiText = "I can guide you step-by-step. Let me know your specific goal.";
            const lowerText = text.toLowerCase();

            if (lowerText.includes('artist') || lowerText.includes('more clients')) {
                aiText = "Great! To help you get more clients, we should ensure your portfolio stands out. Where are you currently based?";
            } else if (lowerText.includes('client') || lowerText.includes('need') || lowerText.includes('book')) {
                aiText = "I can help with that. Could you tell me the location and the type of event you need makeup for?";
            } else if (lowerText.length > 2 && !lowerText.includes('hi') && !lowerText.includes('hello')) {
                aiText = "Perfect. Local artists usually see the best results when they display clear, well-lit portfolio images. Elura will help you manage direct bookings without relying on Instagram DMs.";
            }

            const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiText };
            setMessages((prev) => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsOpen(true)}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            right: '2rem',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(26, 26, 35, 0.92)',
                            color: 'var(--elura-blend)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                            zIndex: 50,
                            cursor: 'pointer'
                        }}
                    >
                        <MessageSquare size={28} />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            right: '2rem',
                            width: '350px',
                            height: '500px',
                            backgroundColor: 'var(--bg-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '1.5rem',
                            boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 50,
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            padding: '1.25rem',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }} />
                                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>
                                    <span className="elura-mark" style={{ fontSize: '1.35rem' }}>Elura</span>{' '}
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', letterSpacing: '0.03em' }}>AI</span>
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{
                            flex: 1,
                            padding: '1.25rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {messages.map((msg) => (
                                <div key={msg.id} className={msg.sender === 'ai' ? 'agent-bubble' : 'user-bubble'}>
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
                                style={{ display: 'flex', gap: '0.5rem' }}
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask anything..."
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem 1rem',
                                        borderRadius: '2rem',
                                        border: '1px solid var(--border-color)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#fff',
                                    }}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--accent-color)',
                                        color: 'var(--bg-color)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                >
                                    <Send size={18} style={{ marginLeft: '-2px' }} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
