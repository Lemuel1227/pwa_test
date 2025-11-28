import { Link, NavLink } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';

const navLinks = [
  { to: '/', label: 'Home', private: false },
  { to: '/dashboard', label: 'Dashboard', private: true },
  { to: '/schedule', label: 'Training Sessions', private: true },
  { to: '/about', label: 'About Us', private: false },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuthContext();

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__branding">
          <Link to="/" className="layout__logo">
            <span className="layout__logo-mark" aria-hidden="true">
              TROPA
            </span>
            SportsHQ
          </Link>
          <p className="layout__tagline">Manage your training tasks efficiently</p>
        </div>
        <nav className="layout__nav">
          {navLinks.map((link) => {
            if (link.private && !user) return null;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `layout__nav-link ${isActive ? 'layout__nav-link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="layout__auth">
          {user ? (
            <>
              <span className="layout__user">{user.username}</span>
              <button type="button" className="btn btn--ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">
                Log in
              </Link>
              <Link to="/register" className="btn">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="layout__main">{children}</main>
      <footer className="layout__footer">
        <p>&copy; {new Date().getFullYear()} TROPA. Stay ahead of the competition.</p>
      </footer>
    </div>
  );
};

export default Layout;
