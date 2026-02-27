import { lazy, Suspense } from 'react';
import { Hero } from './components/Hero';
import { Solution } from './components/Solution';
import { Form } from './components/Form';

const BackgroundEffect = lazy(async () => {
  const module = await import('./components/BackgroundEffect');
  return { default: module.BackgroundEffect };
});

const EluraAgent = lazy(async () => {
  const module = await import('./components/EluraAgent');
  return { default: module.EluraAgent };
});

function App() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', isolation: 'isolate' }}>
      <Suspense fallback={null}>
        <BackgroundEffect />
      </Suspense>
      <div style={{
        position: 'fixed',
        top: '1.35rem',
        left: '2rem',
        zIndex: 40,
        pointerEvents: 'none'
      }}>
        <div className="elura-mark" style={{ fontSize: '2.8rem', lineHeight: 0.95 }}>
          Elura.
        </div>
      </div>

      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <Solution />
        <Form />
      </main>

      <footer style={{
        position: 'relative',
        zIndex: 1,
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)'
      }}>
        <p>&copy; {new Date().getFullYear()} <span className="elura-mark" style={{ fontSize: '1.15rem' }}>Elura.</span> All rights reserved.</p>
      </footer>

      <Suspense fallback={null}>
        <EluraAgent />
      </Suspense>
    </div>
  );
}

export default App;
