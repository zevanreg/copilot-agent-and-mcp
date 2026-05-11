import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFavorites, removeFavorite, updateFavoriteComment } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/BookList.module.css';

const Favorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.favorites.items);
  const status = useAppSelector(state => state.favorites.status);
  const token = useAppSelector(state => state.user.token);
  const navigate = useNavigate();
  const [draftComments, setDraftComments] = useState({});
  const [savingBookId, setSavingBookId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(fetchFavorites(token));
  }, [dispatch, token, navigate]);

  useEffect(() => {
    setDraftComments(
      favorites.reduce((commentsByBookId, book) => {
        commentsByBookId[book.id] = book.comment || '';
        return commentsByBookId;
      }, {})
    );
  }, [favorites]);

  // generated-by-copilot: handle removal with a confirmation dialog
  const handleRemoveFavorite = (bookId, bookTitle) => {
    if (window.confirm(`Remove "${bookTitle}" from your favorites?`)) {
      dispatch(removeFavorite({ token, bookId }));
    }
  };

  const handleCommentChange = (bookId, comment) => {
    setDraftComments(currentComments => ({
      ...currentComments,
      [bookId]: comment,
    }));
  };

  const handleSaveComment = async (bookId) => {
    setSavingBookId(bookId);
    await dispatch(updateFavoriteComment({ token, bookId, comment: draftComments[bookId] || '' }));
    setSavingBookId(null);
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Failed to load favorites.</div>;

  return (
    <div>
      <h2>My Favorite Books</h2>
      {favorites.length === 0 ? (
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '2rem auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center',
          color: '#888',
        }}>
          <p>No favorite books yet.</p>
          <p>
            Go to the <a href="/books" onClick={e => { e.preventDefault(); navigate('/books'); }}>book list</a> to add some!
          </p>
        </div>
      ) : (
        <div className={styles.bookGrid}>
          {favorites.map(book => (
            <div className={styles.bookCard} key={book.id}>
              <div className={styles.bookTitle}>{book.title}</div>
              <div className={styles.bookAuthor}>by {book.author}</div>
              <label className={styles.favoriteCommentLabel} htmlFor={`favorite-comment-${book.id}`}>
                Your comment
              </label>
              <textarea
                id={`favorite-comment-${book.id}`}
                className={styles.favoriteCommentInput}
                value={draftComments[book.id] || ''}
                onChange={event => handleCommentChange(book.id, event.target.value)}
                rows={3}
                placeholder="Add a note about why this is a favorite"
              />
              <div className={styles.favoriteCommentActions}>
                <button
                  className={styles.simpleBtn}
                  onClick={() => handleSaveComment(book.id)}
                  disabled={savingBookId === book.id || (draftComments[book.id] || '') === (book.comment || '')}
                >
                  {savingBookId === book.id ? 'Saving...' : 'Save Comment'}
                </button>
              </div>
              {/* generated-by-copilot: trash icon button for removing a favorite */}
              <button
                className={styles.trashBtn}
                onClick={() => handleRemoveFavorite(book.id, book.title)}
                aria-label={`Remove ${book.title} from favorites`}
                title="Remove from favorites"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
