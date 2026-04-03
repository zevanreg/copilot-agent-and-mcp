import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout, USER_TYPES } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const username = useAppSelector(state => state.user.username);
  const userType = useAppSelector(state => state.user.userType);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // generated-by-copilot: visual styles for each user type badge
  const baseBadgeStyle = { borderRadius: '4px', padding: '0.1rem 0.5rem', fontSize: '0.8rem', marginLeft: '0.4rem', whiteSpace: 'nowrap' };
  const userTypeBadgeStyle = userType === USER_TYPES.ADMINISTRATOR
    ? { ...baseBadgeStyle, background: '#ffd700', color: '#333', fontWeight: 700 }
    : { ...baseBadgeStyle, background: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 600 };

  const userTypeLabel = userType === USER_TYPES.ADMINISTRATOR ? 'Administrator' : 'Member';

  return (
    <header style={{
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      background: '#20b2aa',
      color: '#fff',
      minHeight: '3.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      boxSizing: 'border-box',
    }}>
      <span style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '1px' }}>Book Favorites</span>
      {username && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <a
              id="books-link"
              href="/books"
              onClick={e => { e.preventDefault(); navigate('/books'); }}
              style={{
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '0.3rem 0.8rem',
                borderRadius: '4px',
                transition: 'background 0.2s',
                background: window.location.pathname === '/books' ? 'rgba(255,255,255,0.18)' : 'none',
              }}
            >
              Books
            </a>
            <a
              id="favorites-link"
              href="/favorites"
              onClick={e => { e.preventDefault(); navigate('/favorites'); }}
              style={{
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '0.3rem 0.8rem',
                borderRadius: '4px',
                transition: 'background 0.2s',
                background: window.location.pathname === '/favorites' ? 'rgba(255,255,255,0.18)' : 'none',
              }}
            >
              Favorites
            </a>
          </nav>
          <span style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
            Hi, {username}
            {/* generated-by-copilot: display user type badge next to username for role clarity */}
            {userType && <span data-testid="user-type-badge" style={userTypeBadgeStyle}>{userTypeLabel}</span>}
          </span>
          <button id="logout" onClick={handleLogout} style={{ padding: '0.3rem 1rem', fontSize: '1rem', background: '#fff', color: '#20b2aa', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      )}
    </header>
  );
};

export default Header;
