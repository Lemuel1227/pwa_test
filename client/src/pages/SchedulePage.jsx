import { useMemo, useState } from 'react';
import dayjs from '../utils/dayjs.js';
import { useTasks } from '../hooks/useTasks.js';

const TrainingSessionsPage = () => {
  const { tasks, status } = useTasks();

  const sessions = useMemo(
    () =>
      tasks
        .filter((task) => task.dueDate)
        .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()),
    [tasks]
  );

  const nextSession = sessions[0];

  const sessionsBySport = useMemo(() => {
    const counts = sessions.reduce((acc, task) => {
      const key = task.sport || 'Multi-sport';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([sport, count]) => ({ sport, count }))
      .sort((a, b) => b.count - a.count);
  }, [sessions]);

  const [showFullList, setShowFullList] = useState(false);

  return (
    <div className="container" style={{ display: 'grid', gap: '2rem' }}>
      <section className="card">
        <h1 className="card__title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Training Sessions HQ</h1>
        <p style={{ color: '#475569', lineHeight: 1.7 }}>
          Organize every workout, scrimmage, and film study in one place. Offline support keeps your mission-critical
          plans available even when the arena signal fades.
        </p>
      </section>

      <section className="card" style={{ display: 'grid', gap: '1.5rem' }}>
        <div>
          <h2 className="card__title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Next on the court</h2>
          {status === 'loading' ? <p>Loading sessions...</p> : null}
          {nextSession ? (
            <div
              style={{
                borderLeft: '4px solid #1d4ed8',
                padding: '1rem',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                display: 'grid',
                gap: '0.35rem',
              }}
            >
              <p style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>{nextSession.title}</p>
              <p style={{ margin: 0, color: '#475569' }}>
                {dayjs(nextSession.dueDate).format('dddd · MMM D · h:mm A')}
              </p>
              <p style={{ margin: 0, color: '#1e293b' }}>
                Focus sport: <strong>{nextSession.sport || 'All disciplines'}</strong>
              </p>
            </div>
          ) : (
            <p>No upcoming sessions yet. Add due dates from the dashboard to build momentum.</p>
          )}
        </div>

        <div>
          <h2 className="card__title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Volume by sport</h2>
          {sessionsBySport.length ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
              {sessionsBySport.map(({ sport, count }) => (
                <li
                  key={sport}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#1e293b', fontWeight: 500 }}>{sport}</span>
                  <span style={{ color: '#475569' }}>{count} session{count > 1 ? 's' : ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Once you attach due dates to tasks, the full calendar will populate automatically.</p>
          )}
        </div>
      </section>

      <section className="card" style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <h2 className="card__title" style={{ fontSize: '1.5rem', margin: 0 }}>Complete schedule</h2>
          {sessions.length > 4 ? (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setShowFullList((prev) => !prev)}
              style={{ padding: '0.4rem 0.75rem' }}
            >
              {showFullList ? 'Show fewer' : 'Show all'}
            </button>
          ) : null}
        </div>
        {sessions.length ? (
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
            {(showFullList ? sessions : sessions.slice(0, 4)).map((task) => (
              <li
                key={task._id}
                style={{
                  borderRadius: '8px',
                  border: '2px solid rgba(30, 58, 138, 0.25)',
                  padding: '1rem 1.25rem',
                  display: 'grid',
                  gap: '0.35rem',
                  background: '#f8fafc',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                }}
              >
                <p style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>{task.title}</p>
                <p style={{ margin: 0, color: '#475569' }}>{task.sport || 'Multi-sport focus'}</p>
                <p style={{ margin: 0, color: '#64748b' }}>
                  {dayjs(task.dueDate).format('ddd, MMM D, YYYY · h:mm A')}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p>Once you attach due dates to tasks, the full calendar will populate automatically.</p>
        )}
      </section>
    </div>
  );
};

export default TrainingSessionsPage;
