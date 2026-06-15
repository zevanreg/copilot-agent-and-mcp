import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchFavorites = createAsyncThunk('favorites/fetchFavorites', async (token) => {
  const res = await fetch('http://localhost:4000/api/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
});

export const addFavorite = createAsyncThunk('favorites/addFavorite', async ({ token, bookId }) => {
  await fetch('http://localhost:4000/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookId }),
  });
  return bookId;
});

// generated-by-copilot: async thunk to remove a book from the user's favorites
export const removeFavorite = createAsyncThunk('favorites/removeFavorite', async ({ token, bookId }, { rejectWithValue }) => {
  const res = await fetch('http://localhost:4000/api/favorites/' + bookId, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return rejectWithValue(bookId);
  }
  return bookId;
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { items: [], status: 'idle', removeError: null, _removedItem: null, _removedIndex: -1 },
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
      // generated-by-copilot: optimistic removal — stash removed item and its index for position-accurate rollback
      .addCase(removeFavorite.pending, (state, action) => {
        state.removeError = null;
        const bookId = action.meta.arg.bookId;
        const index = state.items.findIndex(b => b.id === bookId);
        state._removedItem = index !== -1 ? state.items[index] : null;
        state._removedIndex = index;
        state.items = state.items.filter(b => b.id !== bookId);
      })
      .addCase(removeFavorite.fulfilled, (state) => {
        state.removeError = null;
        state._removedItem = null;
        state._removedIndex = -1;
      })
      .addCase(removeFavorite.rejected, (state) => {
        // Rollback: restore the item at its original position
        if (state._removedItem) {
          const idx = state._removedIndex >= 0 ? state._removedIndex : state.items.length;
          state.items.splice(idx, 0, state._removedItem);
          state._removedItem = null;
          state._removedIndex = -1;
        }
        state.removeError = 'Failed to remove favorite. Please try again.';
      });
  },
});

export default favoritesSlice.reducer;
