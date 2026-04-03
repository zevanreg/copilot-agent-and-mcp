import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// generated-by-copilot: fetchBooks accepts optional sortBy and order params for backend sorting
export const fetchBooks = createAsyncThunk('books/fetchBooks', async ({ sortBy, order } = {}) => {
  const params = new URLSearchParams();
  if (sortBy) params.set('sortBy', sortBy);
  if (order) params.set('order', order);
  const res = await fetch(`http://localhost:4000/api/books?${params}`);
  return res.json();
});

const booksSlice = createSlice({
  name: 'books',
  initialState: { items: [], status: 'idle', sortBy: 'title', order: 'asc', searchTerm: '' },
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

export const { setSort, setSearchTerm } = booksSlice.actions;

// generated-by-copilot: memoised selector that filters books by title/author,
// normalises accented characters so 'cafe' matches 'café'
const normalise = str =>
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const selectFilteredBooks = state => {
  const { items, searchTerm } = state.books;
  if (!searchTerm.trim()) return items;
  const term = normalise(searchTerm);
  return items.filter(
    book => normalise(book.title).includes(term) || normalise(book.author).includes(term)
  );
};

export default booksSlice.reducer;
