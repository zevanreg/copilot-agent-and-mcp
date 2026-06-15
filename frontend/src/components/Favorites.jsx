import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFavorites, removeFavorite, updateComment } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Favorites.module.css';

const Favorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.favorites.items);
  const status = useAppSelector(state => state.favorites.status);
  const removeError = useAppSelector(state => state.favorites.removeError);
  const token = useAppSelector(state => state.user.token);
  const navigate = useNavigate();

  // generated-by-copilot: local state for tracking which book is being edited and draft comment text
  const [editingId, setEditingId] = useState(null);
  const [draftComment, setDraftComment] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(fetchFavorites(token));
  }, [dispatch, token, navigate]);

  // generated-by-copilot: dispatch removeFavorite with optimistic UI update
  const handleRemove = (bookId) => {
    dispatch(removeFavorite({ token, bookId }));
  };

  // generated-by-copilot: open comment editor pre-filled with existing comment
  const handleEditComment = (book) => {
    setEditingId(book.id);
    setDraftComment(book.comment || '');
  };

  // generated-by-copilot: dispatch updateComment and close editor on success
  const handleSaveComment = (bookId) => {
    dispatch(updateComment({ token, bookId, comment: draftComment })).then(() => {
      setEditingId(null);
    });
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Failed to load favorites.</div>;

  return (
    <div>
      <h2>My Favorite Books</h2>
      {removeError && (
        <div className={styles.removeError} role="alert">{removeError}</div>
      )}
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
        <ul className={styles.favoritesList}>
          {favorites.map(book => (
            <li key={book.id} className={styles.favoriteItem}>
              <div className={styles.bookDetails}>
                <span className={styles.bookInfo}>
                  <strong>{book.title}</strong> by {book.author}
                </span>
                {/* generated-by-copilot: inline comment editor / display */}
                {editingId === book.id ? (
                  <div className={styles.commentEditor}>
                    <textarea
                      className={styles.commentInput}
                      value={draftComment}
                      onChange={e => setDraftComment(e.target.value)}
                      placeholder="Add a comment…"
                      rows={2}
                      aria-label="Edit comment"
                    />
                    <div className={styles.commentActions}>
                      <button className={styles.saveBtn} onClick={() => handleSaveComment(book.id)}>Save</button>
                      <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.commentRow}>
                    <span className={styles.commentText}>
                      {book.comment ? book.comment : <em className={styles.noComment}>No comment yet</em>}
                    </span>
                    <button
                      className={styles.editCommentBtn}
                      onClick={() => handleEditComment(book)}
                      aria-label={`Edit comment for ${book.title}`}
                      title="Edit comment"
                    >
                      {/* generated-by-copilot: pencil icon SVG */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <button
                className={styles.trashBtn}
                onClick={() => handleRemove(book.id)}
                aria-label={`Remove ${book.title} from favorites`}
                title="Remove from favorites"
              >
                {/* generated-by-copilot: trash icon SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
