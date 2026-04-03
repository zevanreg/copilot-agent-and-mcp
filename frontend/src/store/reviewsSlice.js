import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// generated-by-copilot: fetch all reviews for a book
export const fetchReviews = createAsyncThunk('reviews/fetchReviews', async (bookId) => {
  const res = await fetch(`http://localhost:4000/api/books/${bookId}/reviews`);
  const reviews = await res.json();
  return { bookId, reviews };
});

// generated-by-copilot: fetch average rating for a book
export const fetchAverageRating = createAsyncThunk('reviews/fetchAverageRating', async (bookId) => {
  const res = await fetch(`http://localhost:4000/api/books/${bookId}/average-rating`);
  const data = await res.json();
  return { bookId, averageRating: data.averageRating, count: data.count };
});

// generated-by-copilot: submit a new review for a book with proper error and auth handling
export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async ({ bookId, rating, text, token }, { rejectWithValue }) => {
    let res;
    try {
      res = await fetch(`http://localhost:4000/api/books/${bookId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, text }),
      });
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
    // generated-by-copilot: auth middleware sends plain-text for 401/403, handle before parsing JSON
    if (res.status === 401 || res.status === 403) {
      return rejectWithValue('Your session has expired. Please log in again.');
    }
    let data;
    try {
      data = await res.json();
    } catch {
      return rejectWithValue('Failed to submit review');
    }
    if (!res.ok) {
      return rejectWithValue(data.message || 'Failed to submit review');
    }
    return { bookId, review: data };
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    byBookId: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state, action) => {
        const bookId = action.meta.arg;
        if (!state.byBookId[bookId]) {
          state.byBookId[bookId] = { items: [], status: 'idle', averageRating: null, count: 0 };
        }
        state.byBookId[bookId].status = 'loading';
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        const { bookId, reviews } = action.payload;
        if (!state.byBookId[bookId]) {
          state.byBookId[bookId] = { items: [], status: 'idle', averageRating: null, count: 0 };
        }
        state.byBookId[bookId].items = reviews;
        state.byBookId[bookId].status = 'succeeded';
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        const bookId = action.meta.arg;
        if (!state.byBookId[bookId]) {
          state.byBookId[bookId] = { items: [], status: 'failed', averageRating: null, count: 0 };
        }
        state.byBookId[bookId].status = 'failed';
      })
      .addCase(fetchAverageRating.fulfilled, (state, action) => {
        const { bookId, averageRating, count } = action.payload;
        if (!state.byBookId[bookId]) {
          state.byBookId[bookId] = { items: [], status: 'idle', averageRating: null, count: 0 };
        }
        state.byBookId[bookId].averageRating = averageRating;
        state.byBookId[bookId].count = count;
      })
      // generated-by-copilot: update per-book review list on successful submission
      .addCase(submitReview.fulfilled, (state, action) => {
        const { bookId, review } = action.payload;
        if (!state.byBookId[bookId]) {
          state.byBookId[bookId] = { items: [], status: 'idle', averageRating: null, count: 0 };
        }
        state.byBookId[bookId].items.push(review);
      });
  },
});

export default reviewsSlice.reducer;
