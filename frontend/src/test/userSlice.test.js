// generated-by-copilot: unit tests for userSlice – userType support
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import userReducer, { setUser, logout, USER_TYPES } from '../store/userSlice';

// generated-by-copilot: mock localStorage to isolate tests from real browser storage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

beforeEach(() => {
  vi.stubGlobal('localStorage', localStorageMock);
  localStorageMock.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('userSlice – USER_TYPES constants', () => {
  it('exports MEMBER constant', () => {
    expect(USER_TYPES.MEMBER).toBe('member');
  });

  it('exports ADMINISTRATOR constant', () => {
    expect(USER_TYPES.ADMINISTRATOR).toBe('administrator');
  });
});

describe('userSlice – setUser', () => {
  const base = { token: null, username: null, userType: null };

  it('stores member userType in state', () => {
    const next = userReducer(base, setUser({ token: 'tok', username: 'alice', userType: 'member' }));
    expect(next.userType).toBe('member');
  });

  it('stores administrator userType in state', () => {
    const next = userReducer(base, setUser({ token: 'tok', username: 'alice', userType: 'administrator' }));
    expect(next.userType).toBe('administrator');
  });

  it('defaults to "member" when userType is not provided', () => {
    const next = userReducer(base, setUser({ token: 'tok', username: 'alice' }));
    expect(next.userType).toBe('member');
  });

  it('persists userType to localStorage', () => {
    userReducer(base, setUser({ token: 'tok', username: 'bob', userType: 'administrator' }));
    expect(localStorage.getItem('userType')).toBe('administrator');
  });

  it('stores token and username in state', () => {
    const next = userReducer(base, setUser({ token: 'tok123', username: 'carol', userType: 'member' }));
    expect(next.token).toBe('tok123');
    expect(next.username).toBe('carol');
  });
});

describe('userSlice – logout', () => {
  const loggedIn = { token: 'tok', username: 'alice', userType: 'administrator' };

  it('clears userType from state on logout', () => {
    const next = userReducer(loggedIn, logout());
    expect(next.userType).toBeNull();
  });

  it('removes userType from localStorage on logout', () => {
    localStorage.setItem('userType', 'administrator');
    userReducer(loggedIn, logout());
    expect(localStorage.getItem('userType')).toBeNull();
  });

  it('clears token and username from state on logout', () => {
    const next = userReducer(loggedIn, logout());
    expect(next.token).toBeNull();
    expect(next.username).toBeNull();
  });
});
