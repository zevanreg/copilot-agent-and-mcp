// generated-by-copilot: unit tests for the selectFilteredBooks selector and setSearchTerm reducer
import { describe, it, expect } from 'vitest';
import booksReducer, { setSearchTerm, setCategory, selectFilteredBooks, selectCategories } from '../store/booksSlice';

const books = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', category: 'Classic' },
  { id: 2, title: 'The Pragmatic Programmer', author: 'David Thomas', category: 'Classic' },
  { id: 3, title: 'Design Patterns', author: 'Gang of Four', category: 'Science Fiction' },
  { id: 4, title: 'Café au Lait', author: 'Ångström Björk', category: 'Fantasy' },
];

const stateWith = (searchTerm, selectedCategory = '') => ({
  books: {
    items: books,
    status: 'succeeded',
    sortBy: 'title',
    order: 'asc',
    searchTerm,
    selectedCategory,
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

// generated-by-copilot: tests for setCategory reducer
describe('booksSlice – setCategory', () => {
  it('sets the selected category in state', () => {
    const initial = booksReducer(undefined, { type: '@@INIT' });
    const next = booksReducer(initial, setCategory('Fantasy'));
    expect(next.selectedCategory).toBe('Fantasy');
  });

  it('clears the selected category', () => {
    const initial = booksReducer({ selectedCategory: 'Classic' }, setCategory(''));
    expect(initial.selectedCategory).toBe('');
  });
});

// generated-by-copilot: tests for selectFilteredBooks with category filter
describe('selectFilteredBooks – category filter', () => {
  it('returns all books when selectedCategory is empty', () => {
    expect(selectFilteredBooks(stateWith('', ''))).toHaveLength(books.length);
  });

  it('filters by category (case-sensitive match)', () => {
    const result = selectFilteredBooks(stateWith('', 'Classic'));
    expect(result).toHaveLength(2);
    result.forEach(b => expect(b.category).toBe('Classic'));
  });

  it('filters by category case-insensitively', () => {
    const result = selectFilteredBooks(stateWith('', 'classic'));
    expect(result).toHaveLength(2);
  });

  it('returns empty array for unknown category', () => {
    expect(selectFilteredBooks(stateWith('', 'Horror'))).toHaveLength(0);
  });

  it('applies both category and search term filters together', () => {
    // 'Classic' has 'Clean Code' and 'The Pragmatic Programmer'; search 'clean' narrows to 1
    const result = selectFilteredBooks(stateWith('clean', 'Classic'));
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Clean Code');
  });
});

// generated-by-copilot: tests for selectCategories selector
describe('selectCategories', () => {
  const state = stateWith('');

  it('returns a sorted array of unique categories', () => {
    const cats = selectCategories(state);
    expect(Array.isArray(cats)).toBe(true);
    expect(cats).toEqual([...cats].sort());
    expect(new Set(cats).size).toBe(cats.length);
  });

  it('contains all categories present in the books', () => {
    const cats = selectCategories(state);
    expect(cats).toContain('Classic');
    expect(cats).toContain('Fantasy');
    expect(cats).toContain('Science Fiction');
  });

  it('does not include undefined or empty string categories', () => {
    const stateWithMissing = {
      books: { ...state.books, items: [...books, { id: 99, title: 'No Cat', author: 'X' }] },
    };
    const cats = selectCategories(stateWithMissing);
    expect(cats).not.toContain(undefined);
    expect(cats).not.toContain('');
  });
});
