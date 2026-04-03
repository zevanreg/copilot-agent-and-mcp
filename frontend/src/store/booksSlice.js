import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// generated-by-copilot: fetchBooks accepts optional sortBy, order, and category params for backend filtering/sorting
export const fetchBooks = createAsyncThunk('books/fetchBooks', async ({ sortBy, order, category } = {}) => {
  const params = new URLSearchParams();
  if (sortBy) params.set('sortBy', sortBy);
  if (order) params.set('order', order);
  if (category) params.set('category', category);
  const res = await fetch(`http://localhost:4000/api/books?${params}`);
  return res.json();
});

const booksSlice = createSlice({
  name: 'books',
  initialState: { items: [], status: 'idle', sortBy: 'title', order: 'asc', searchTerm: '', selectedCategory: '' },
  reducers: {
    // generated-by-copilot: update sort state without re-fetching
    setSort: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
    },
    // generated-by-copilot: update search term for real-time filtering
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    // generated-by-copilot: update selected category for filtering
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBooks.pending, state => { state.status = 'loading'; })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchBooks.rejected, state => { state.status = 'failed'; });
  },
});

export const { setSort, setSearchTerm, setCategory } = booksSlice.actions;

// generated-by-copilot: memoised selector that filters books by title/author,
// normalises accented characters so 'cafe' matches 'café'
const normalise = str =>
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// generated-by-copilot: filters by category and search term; category guard covers
// cases where items were loaded without a category-filtered fetch
export const selectFilteredBooks = state => {
  const { items, searchTerm, selectedCategory } = state.books;
  let result = items;
  if (selectedCategory) {
    result = result.filter(b => (b.category || '').toLowerCase() === selectedCategory.toLowerCase());
  }
  if (!searchTerm.trim()) return result;
  const term = normalise(searchTerm);
  return result.filter(
    book => normalise(book.title).includes(term) || normalise(book.author).includes(term)
  );
};

// generated-by-copilot: derives sorted unique category list from all loaded books
export const selectCategories = state => {
  const { items } = state.books;
  return [...new Set(items.map(b => b.category).filter(Boolean))].sort();
};

export default booksSlice.reducer;
