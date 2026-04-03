// generated-by-copilot: real-time search input with icon and clear button
import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSearchTerm } from '../store/booksSlice';
import styles from './SearchInput.module.css';

const SearchIcon = () => (
  <svg
    className={styles.searchIcon}
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SearchInput = () => {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector(state => state.books.searchTerm);

  const handleChange = e => dispatch(setSearchTerm(e.target.value));
  const handleClear = () => dispatch(setSearchTerm(''));

  return (
    <div className={styles.wrapper}>
      <SearchIcon />
      <input
        type="text"
        className={styles.input}
        placeholder="Search by title or author…"
        value={searchTerm}
        onChange={handleChange}
        aria-label="Search books by title or author"
        data-testid="search-input"
        autoComplete="off"
        spellCheck={false}
      />
      {searchTerm && (
        <span
          className={styles.clearBtn}
          onClick={handleClear}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClear()}
          role="button"
          tabIndex={0}
          aria-label="Clear search"
          data-testid="search-clear-btn"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      )}
    </div>
  );
};

export default SearchInput;
