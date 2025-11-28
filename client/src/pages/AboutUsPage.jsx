import { Link } from 'react-router-dom';

const teamMembers = [
  {
    name: 'Lemuel John Ellasus',
    role: 'Head Performance Strategist',
    bio: 'Guides elite programs with data-led practice design and athlete-first leadership.',
  },
  {
    name: 'Harvy Penaflor',
    role: 'Player Development Analyst',
    bio: 'Turns practice footage into actionable insights and drills that drive weekly improvements.',
  },
  {
    name: 'Marlon Inocencio',
    role: 'Operations & Logistics',
    bio: 'Keeps the travel itineraries tight, gear stocked, and recovery stations dialed in.',
  },
];

const AboutUsPage = () => (
  <div className="container" style={{ display: 'grid', gap: '2rem' }}>
    <section className="card">
      <h1 className="card__title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>About TROPA</h1>
      <p style={{ color: '#475569', lineHeight: 1.7 }}>
        Built by former coaches and analysts, TROPA is the command center for programs that want to synchronize
        practice plans, training rooms, and game-day execution. We believe every staff deserves tools that feel
        pro-grade without the pro-league price tag.
      </p>
    </section>

    <section className="card" style={{ display: 'grid', gap: '1.5rem' }}>
      <header>
        <h2 className="card__title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Our playbook</h2>
        <p style={{ margin: 0, color: '#64748b' }}>
          We combine real-time sync, offline reliability, and smart task workflows so your staff stays focused on
          coaching.
        </p>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <article className="card" style={{
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.5rem',
          display: 'grid',
          gap: '0.75rem',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem' }}>Connected staff</h3>
          <p style={{ margin: 0, color: '#475569' }}>
            Assign drills, add notes, and push updates to assistants and captains instantly.
          </p>
        </article>
        <article className="card" style={{
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.5rem',
          display: 'grid',
          gap: '0.75rem',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem' }}>Offline tough</h3>
          <p style={{ margin: 0, color: '#475569' }}>
            Lose the arena Wi-Fi? Your drills, notes, and task boards stay at your fingertips.
          </p>
        </article>
        <article className="card" style={{
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.5rem',
          display: 'grid',
          gap: '0.75rem',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem' }}>Athlete-first insights</h3>
          <p style={{ margin: 0, color: '#475569' }}>
            Surface trends that help you rotate workloads, prevent burnout, and celebrate wins.
          </p>
        </article>
      </div>
    </section>

    <section className="card" style={{ display: 'grid', gap: '1.5rem' }}>
      <header>
        <h2 className="card__title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Meet the squad</h2>
        <p style={{ margin: 0, color: '#64748b' }}>
          We obsess over gear checks, practice scripts, and team rituals so you can deliver unforgettable seasons.
        </p>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {teamMembers.map((member) => (
          <article
            key={member.name}
            className="card"
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1.5rem',
              display: 'grid',
              gap: '0.5rem',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
            }}
          >
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>{member.name}</h3>
            <p style={{ margin: 0, color: '#1d4ed8', fontWeight: 600 }}>{member.role}</p>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{member.bio}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="card" style={{ display: 'grid', gap: '1rem', alignItems: 'start' }}>
      <h2 className="card__title" style={{ fontSize: '1.5rem', margin: 0 }}>Ready to huddle up?</h2>
      <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>
        Whether you are piloting a youth academy or chasing a championship, TROPA is the locker room HQ that scales
        with your program.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/register" className="btn">
          Start for free
        </Link>
        <Link to="/schedule" className="btn btn--ghost">
          Explore training sessions
        </Link>
      </div>
    </section>
  </div>
);

export default AboutUsPage;
