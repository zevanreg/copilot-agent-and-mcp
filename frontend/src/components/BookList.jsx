
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBooks, setSort, setCategory, selectFilteredBooks, selectCategories } from '../store/booksSlice';
import { addFavorite, fetchFavorites } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/BookList.module.css';
import BookReviews from './BookReviews';
import SearchInput from './SearchInput';

const BookList = () => {
  const dispatch = useAppDispatch();
  // generated-by-copilot: use filtered selector so search updates the list in real-time
  const books = useAppSelector(selectFilteredBooks);
  const allBooks = useAppSelector(state => state.books.items);
  const status = useAppSelector(state => state.books.status);
  const sortBy = useAppSelector(state => state.books.sortBy);
  const order = useAppSelector(state => state.books.order);
  const selectedCategory = useAppSelector(state => state.books.selectedCategory);
  const categories = useAppSelector(selectCategories);
  const token = useAppSelector(state => state.user.token);
  const navigate = useNavigate();
  const favorites = useAppSelector(state => state.favorites.items);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(fetchBooks({ sortBy, order, category: selectedCategory }));
    dispatch(fetchFavorites(token));
  }, [dispatch, token, navigate, sortBy, order]);

  const handleAddFavorite = async (bookId) => {
    if (!token) {
      navigate('/');
      return;
    }
    await dispatch(addFavorite({ token, bookId }));
    dispatch(fetchFavorites(token));
  };

  // generated-by-copilot: set category filter and re-fetch books with the new category
  const handleCategory = (cat) => {
    dispatch(setCategory(cat));
    dispatch(fetchBooks({ sortBy, order, category: cat }));
  };

  // generated-by-copilot: toggle sort field or direction when a sort button is clicked
  const handleSort = (field) => {
    if (sortBy === field) {
      dispatch(setSort({ sortBy: field, order: order === 'asc' ? 'desc' : 'asc' }));
    } else {
      dispatch(setSort({ sortBy: field, order: 'asc' }));
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Failed to load books.</div>;

  return (
    <div>
      <h2>Books</h2>
      {/* generated-by-copilot: search input for real-time filtering */}
      <SearchInput />
      {/* generated-by-copilot: category filter buttons for filtering books by genre */}
      <div className={styles.categoryControls} data-testid="category-filter">
        <span className={styles.sortLabel}>Category:</span>
        <button
          className={`${styles.categoryBtn} ${selectedCategory === '' ? styles.categoryBtnActive : ''}`}
          onClick={() => handleCategory('')}
          aria-pressed={selectedCategory === ''}
          data-testid="category-all"
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.categoryBtnActive : ''}`}
            onClick={() => handleCategory(cat)}
            aria-pressed={selectedCategory === cat}
            data-testid={`category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {cat}
          </button>
        ))}
      </div>
      {/* generated-by-copilot: sort controls with visual indication of active sort */}
      <div className={styles.sortControls}>
        <span className={styles.sortLabel}>Sort by:</span>
        <button
          className={`${styles.sortBtn} ${sortBy === 'title' ? styles.sortBtnActive : ''}`}
          onClick={() => handleSort('title')}
          aria-pressed={sortBy === 'title'}
          aria-label={sortBy === 'title' ? `Sort by title, currently ${order === 'asc' ? 'ascending' : 'descending'}` : 'Sort by title'}
          data-testid="sort-by-title"
        >
          Title {sortBy === 'title' && <span aria-hidden="true">{order === 'asc' ? '▲' : '▼'}</span>}
        </button>
        <button
          className={`${styles.sortBtn} ${sortBy === 'author' ? styles.sortBtnActive : ''}`}
          onClick={() => handleSort('author')}
          aria-pressed={sortBy === 'author'}
          aria-label={sortBy === 'author' ? `Sort by author, currently ${order === 'asc' ? 'ascending' : 'descending'}` : 'Sort by author'}
          data-testid="sort-by-author"
        >
          Author {sortBy === 'author' && <span aria-hidden="true">{order === 'asc' ? '▲' : '▼'}</span>}
        </button>
      </div>
      {books.length === 0 ? (
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
          {allBooks.length === 0 ? (
            <>
              <p>No books available.</p>
              <p>Check back later or add a new book if you have permission.</p>
            </>
          ) : selectedCategory ? (
            <p>No books found in this category.</p>
          ) : (
            <p>No books match your search.</p>
          )}
        </div>
      ) : (
        <div className={styles.bookGrid}>
          {books.map(book => {
            const isFavorite = favorites.some(fav => fav.id === book.id);
            return (
              <div className={styles.bookCard + ' ' + styles.bookCardWithHeart} key={book.id}>
                {isFavorite && (
                  <span className={styles.favoriteHeart} title="In Favorites">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#e25555" stroke="#e25555" strokeWidth="1.5">
                      <path d="M12 21s-6.2-5.2-8.4-7.4C1.2 11.2 1.2 8.1 3.1 6.2c1.9-1.9 5-1.9 6.9 0l2 2 2-2c1.9-1.9 5-1.9 6.9 0 1.9 1.9 1.9 5 0 6.9C18.2 15.8 12 21 12 21z"/>
                    </svg>
                  </span>
                )}
                <div className={styles.bookTitle}>{book.title}</div>
                <div className={styles.bookAuthor}>by {book.author}</div>
                <button
                  className={styles.simpleBtn}
                  onClick={() => handleAddFavorite(book.id)}
                >
                  {isFavorite ? 'In Favorites' : 'Add to Favorites'}
                </button>
                <BookReviews bookId={book.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookList;
