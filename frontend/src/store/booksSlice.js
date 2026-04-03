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
  initialState: { items: [], status: 'idle', sortBy: 'title', order: 'asc' },
  reducers: {
    // generated-by-copilot: update sort state without re-fetching
    setSort: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
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

export const { setSort } = booksSlice.actions;
export default booksSlice.reducer;
