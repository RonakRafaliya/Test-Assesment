import { PropsWithChildren } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Layout = ({ children }: PropsWithChildren) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-logo">TaskFlow</h1>
        <nav className="app-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/tasks">Tasks</Link>
        </nav>
        {user && (
          <div className="app-user">
            <span>
              {user.firstName} {user.lastName}
            </span>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
};

