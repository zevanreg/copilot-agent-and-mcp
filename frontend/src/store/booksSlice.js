import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiUrl } from '../api';

export const fetchBooks = createAsyncThunk('books/fetchBooks', async () => {
  const res = await fetch(apiUrl('/books'));
  return res.json();
});

const booksSlice = createSlice({
  name: 'books',
  initialState: { items: [], status: 'idle' },
  reducers: {},
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

export default booksSlice.reducer;
