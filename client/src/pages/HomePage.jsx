import { Link } from 'react-router-dom';
import InstallPrompt from '../components/InstallPrompt.jsx';
import { useAuthContext } from '../context/AuthContext.jsx';

const highlights = [
  {
    title: 'Real-time collaboration',
    description: 'Stay in sync with your coaching staff through live updates on every drill.',
  },
  {
    title: 'Offline ready',
    description: 'Access cached training plans even when you are traveling to away games.',
  },
  {
    title: 'Sports analytics',
    description: 'Track progress and plan practices with precision across all sport disciplines.',
  },
];

const HomePage = () => {
  const { user } = useAuthContext();

  return (
    <div className="container home-page">
      <section className="hero">
        <div style={{ maxWidth: '640px' }}>
          <h1 className="hero__title">Coach smarter. Train harder. Win faster.</h1>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7 }}>
            TROPA helps coaching teams manage training tasks, coordinate schedules, and stay productive on and off the
            field.
          </p>
          <div className="hero__cta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <Link to={user ? '/dashboard' : '/register'} className="btn btn--outline">
              {user ? 'Go to dashboard' : 'Create your team'}
            </Link>
            <Link to="/schedule" className="btn btn--outline">
              View practice schedule
            </Link>
            <InstallPrompt />
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', color: '#1f2937', textAlign: 'center' }}>
          Why coaches love TROPA
        </h2>
        <div className="card-grid">
          {highlights.map((item, idx) => {
            const colors = ['#2563eb', '#10b981', '#f59e0b'];
            return (
              <article key={item.title} className="card" style={{ borderLeftColor: colors[idx % 3] }}>
                <h2 className="card__title">{item.title}</h2>
                <p style={{ color: '#64748b', lineHeight: 1.6 }}>{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
