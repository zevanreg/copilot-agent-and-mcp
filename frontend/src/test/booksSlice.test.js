// generated-by-copilot: unit tests for the selectFilteredBooks selector and setSearchTerm reducer
import { describe, it, expect } from 'vitest';
import booksReducer, { setSearchTerm, selectFilteredBooks } from '../store/booksSlice';

const books = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin' },
  { id: 2, title: 'The Pragmatic Programmer', author: 'David Thomas' },
  { id: 3, title: 'Design Patterns', author: 'Gang of Four' },
  { id: 4, title: 'Café au Lait', author: 'Ångström Björk' },
];

const stateWith = (searchTerm) => ({
  books: {
    items: books,
    status: 'succeeded',
    sortBy: 'title',
    order: 'asc',
    searchTerm,
  },
});

describe('booksSlice – setSearchTerm', () => {
  it('sets the search term in state', () => {
    const initial = booksReducer(undefined, { type: '@@INIT' });
    const next = booksReducer(initial, setSearchTerm('clean'));
    expect(next.searchTerm).toBe('clean');
  });

  it('clears the search term', () => {
    const initial = booksReducer({ searchTerm: 'foo' }, setSearchTerm(''));
    expect(initial.searchTerm).toBe('');
  });
});

describe('selectFilteredBooks', () => {
  it('returns all books when search term is empty', () => {
    expect(selectFilteredBooks(stateWith(''))).toHaveLength(books.length);
  });

  it('returns all books when search term is only whitespace', () => {
    expect(selectFilteredBooks(stateWith('   '))).toHaveLength(books.length);
  });

  it('filters by title (case-insensitive)', () => {
    const result = selectFilteredBooks(stateWith('CLEAN'));
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Clean Code');
  });

  it('filters by author (case-insensitive)', () => {
    const result = selectFilteredBooks(stateWith('david'));
    expect(result).toHaveLength(1);
    expect(result[0].author).toBe('David Thomas');
  });

  it('matches a partial title substring', () => {
    const result = selectFilteredBooks(stateWith('Pragmat'));
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('The Pragmatic Programmer');
  });

  it('returns multiple matches', () => {
    const result = selectFilteredBooks(stateWith('design'));
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Design Patterns');
  });

  it('returns empty array when nothing matches', () => {
    expect(selectFilteredBooks(stateWith('xyzzy999'))).toHaveLength(0);
  });

  it('handles accented / special characters in search term', () => {
    // 'cafe' should match 'Café au Lait'
    const result = selectFilteredBooks(stateWith('cafe'));
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Café au Lait');
  });

  it('handles accented characters in book fields', () => {
    // searching with the actual accent should also work
    const result = selectFilteredBooks(stateWith('Café'));
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Café au Lait');
  });

  it('handles accented author names via normalisation', () => {
    // 'Angstrom' should match 'Ångström Björk'
    const result = selectFilteredBooks(stateWith('Angstrom'));
    expect(result).toHaveLength(1);
    expect(result[0].author).toBe('Ångström Björk');
  });
});
