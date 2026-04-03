// generated-by-copilot: unit tests for SearchInput component
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import booksReducer from '../store/booksSlice';
import userReducer from '../store/userSlice';
import SearchInput from '../components/SearchInput';

// generated-by-copilot: creates a minimal real Redux store for component tests
const makeStore = (preloadedBooks = {}) =>
  configureStore({
    reducer: { books: booksReducer, user: userReducer },
    preloadedState: {
      books: {
        items: [],
        status: 'idle',
        sortBy: 'title',
        order: 'asc',
        searchTerm: '',
        ...preloadedBooks,
      },
    },
  });

const renderWithStore = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <SearchInput />
    </Provider>
  );

describe('SearchInput – rendering', () => {
  it('renders the search input', () => {
    renderWithStore();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('has the correct placeholder text', () => {
    renderWithStore();
    expect(screen.getByPlaceholderText(/search by title or author/i)).toBeInTheDocument();
  });

  it('does NOT render the clear button when search term is empty', () => {
    renderWithStore();
    expect(screen.queryByTestId('search-clear-btn')).not.toBeInTheDocument();
  });

  it('renders the clear button when the store has a search term', () => {
    const store = makeStore({ searchTerm: 'hello' });
    renderWithStore(store);
    expect(screen.getByTestId('search-clear-btn')).toBeInTheDocument();
  });

  it('shows the current search term value from the store', () => {
    const store = makeStore({ searchTerm: 'Redux' });
    renderWithStore(store);
    expect(screen.getByTestId('search-input')).toHaveValue('Redux');
  });
});

describe('SearchInput – interactions', () => {
  it('dispatches setSearchTerm when user types', async () => {
    const store = makeStore();
    renderWithStore(store);
    const input = screen.getByTestId('search-input');
    await userEvent.type(input, 'clean');
    expect(store.getState().books.searchTerm).toBe('clean');
  });

  it('clear button dispatches setSearchTerm with empty string', async () => {
    const store = makeStore({ searchTerm: 'clean' });
    renderWithStore(store);
    const clearBtn = screen.getByTestId('search-clear-btn');
    await userEvent.click(clearBtn);
    expect(store.getState().books.searchTerm).toBe('');
  });

  it('clear button disappears after clearing', async () => {
    const store = makeStore({ searchTerm: 'clean' });
    renderWithStore(store);
    await userEvent.click(screen.getByTestId('search-clear-btn'));
    expect(screen.queryByTestId('search-clear-btn')).not.toBeInTheDocument();
  });

  it('input is empty after clearing', async () => {
    const store = makeStore({ searchTerm: 'clean' });
    renderWithStore(store);
    await userEvent.click(screen.getByTestId('search-clear-btn'));
    expect(screen.getByTestId('search-input')).toHaveValue('');
  });
});

describe('SearchInput – accessibility', () => {
  it('input has an accessible aria-label', () => {
    renderWithStore();
    expect(screen.getByLabelText(/search books by title or author/i)).toBeInTheDocument();
  });

  it('clear button has an accessible aria-label', () => {
    const store = makeStore({ searchTerm: 'test' });
    renderWithStore(store);
    expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument();
  });
});
