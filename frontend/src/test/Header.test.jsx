// generated-by-copilot: unit tests for Header component – user type badge display
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import userReducer from '../store/userSlice';
import booksReducer from '../store/booksSlice';
import Header from '../components/Header';

// generated-by-copilot: helper to render Header with a given user state
const makeStore = (userState = {}) =>
  configureStore({
    reducer: { user: userReducer, books: booksReducer },
    preloadedState: {
      user: { token: null, username: null, userType: null, ...userState },
    },
  });

const renderHeader = (userState) =>
  render(
    <Provider store={makeStore(userState)}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </Provider>
  );

describe('Header – unauthenticated', () => {
  it('does not show a user type badge when not logged in', () => {
    renderHeader();
    expect(screen.queryByTestId('user-type-badge')).not.toBeInTheDocument();
  });

  it('does not show greeting when not logged in', () => {
    renderHeader();
    expect(screen.queryByText(/hi,/i)).not.toBeInTheDocument();
  });
});

describe('Header – member user', () => {
  const memberState = { token: 'tok', username: 'bob', userType: 'member' };

  it('shows greeting with username', () => {
    renderHeader(memberState);
    expect(screen.getByText(/Hi, bob/i)).toBeInTheDocument();
  });

  it('displays a "Member" badge', () => {
    renderHeader(memberState);
    const badge = screen.getByTestId('user-type-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Member');
  });
});

describe('Header – administrator user', () => {
  const adminState = { token: 'tok', username: 'alice', userType: 'administrator' };

  it('shows greeting with username', () => {
    renderHeader(adminState);
    expect(screen.getByText(/Hi, alice/i)).toBeInTheDocument();
  });

  it('displays an "Administrator" badge', () => {
    renderHeader(adminState);
    const badge = screen.getByTestId('user-type-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Administrator');
  });

  it('Administrator badge has a visually distinct gold background', () => {
    renderHeader(adminState);
    const badge = screen.getByTestId('user-type-badge');
    // generated-by-copilot: gold (#ffd700) background distinguishes administrator from member
    expect(badge).toHaveStyle({ background: '#ffd700' });
  });
});
