import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiUrl } from '../api';

export const fetchFavorites = createAsyncThunk('favorites/fetchFavorites', async (token) => {
  const res = await fetch(apiUrl('/favorites'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
});

export const addFavorite = createAsyncThunk('favorites/addFavorite', async ({ token, bookId }) => {
  await fetch(apiUrl('/favorites'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookId }),
  });
  return bookId;
});

// generated-by-copilot: thunk to remove a book from favorites
export const removeFavorite = createAsyncThunk('favorites/removeFavorite', async ({ token, bookId }) => {
  const res = await fetch(apiUrl(`/favorites/${bookId}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to remove favorite');
  return bookId;
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFavorites.pending, state => { state.status = 'loading'; })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, state => { state.status = 'failed'; })
      .addCase(addFavorite.fulfilled, (state, action) => {
        // After adding, fetch the updated favorites list to ensure UI is in sync
      })
      // generated-by-copilot: remove the book from items immediately for a responsive UI
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = state.items.filter(book => book.id !== action.payload);
      });
  },
});

export default favoritesSlice.reducer;
