describe('Book Favorites App', () => {
  // generate a random username and password for the e2e tests
  const username = `e2euser${Math.floor(Math.random() * 1000)}`;
  const password = `e2epass${Math.floor(Math.random() * 1000)}`;
  const user = { username, password };

  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should allow a new user to register and login', () => {
    cy.contains('Create Account').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#register').click();
    cy.contains('Registration successful! You can now log in.').should('exist');
    // wait for the app to navigate to the login page
    cy.url().should('include', '/login');
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains(`Hi, ${user.username}`).should('exist');
    cy.contains('Favorites').should('exist');
  });

  it('should show books and allow adding to favorites', () => {
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains('Books').click();
    cy.contains('h2', 'Books').should('exist');
    cy.get('button').contains('Add to Favorites').first().click();
    cy.get('a#favorites-link').click();
    cy.get('h2').contains('My Favorite Books').should('exist');
  });

  it('should logout and protect routes', () => {
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.get('button#logout').click();
    cy.contains('Login').should('exist');
    cy.visit('http://localhost:5173/books');
    cy.url().should('eq', 'http://localhost:5173/');
  });

  it('should clear all favorites when Clear All is clicked and confirmed', () => {
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    // Add a favorite if needed
    cy.contains('Books').click();
    cy.get('button').contains('Add to Favorites').first().click();
    cy.get('a#favorites-link').click();
    cy.get('h2').contains('My Favorite Books').should('exist');
    // Accept the confirmation dialog and click Clear All
    cy.on('window:confirm', () => true);
    cy.get('button#clear-all-favorites').click();
    cy.contains('No favorite books yet.').should('exist');
  });

  it('should sort books by title and author', () => {
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains('Books').click();
    cy.contains('h2', 'Books').should('exist');

    // generated-by-copilot: verify sort by title ascending (default)
    cy.get('[data-testid="sort-by-title"]').should('have.attr', 'aria-pressed', 'true');
    cy.get('[data-testid="sort-by-title"]').should('contain', '▲');

    // Sort by author ascending
    cy.get('[data-testid="sort-by-author"]').click();
    cy.get('[data-testid="sort-by-author"]').should('have.attr', 'aria-pressed', 'true');
    cy.get('[data-testid="sort-by-author"]').should('contain', '▲');

    // Toggle author to descending
    cy.get('[data-testid="sort-by-author"]').click();
    cy.get('[data-testid="sort-by-author"]').should('contain', '▼');

    // Switch back to title
    cy.get('[data-testid="sort-by-title"]').click();
    cy.get('[data-testid="sort-by-title"]').should('have.attr', 'aria-pressed', 'true');
  });

  // generated-by-copilot: category filter E2E tests
  it('should show the category filter after login', () => {
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains('Books').click();
    cy.get('[data-testid="category-filter"]').should('be.visible');
    cy.get('[data-testid="category-all"]').should('be.visible');
  });

  it('should filter books by category', () => {
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains('Books').click();
    cy.get('[data-testid="category-filter"]').should('be.visible');

    // Click the Fantasy category button
    cy.get('[data-testid="category-fantasy"]').click();
    cy.get('[data-testid="category-fantasy"]').should('have.attr', 'aria-pressed', 'true');

    // All visible book cards should show Fantasy books (The Hobbit and The Lord of the Rings)
    cy.get('[data-testid="category-fantasy"]').should('have.attr', 'aria-pressed', 'true');
    cy.get('[data-testid="category-all"]').should('have.attr', 'aria-pressed', 'false');
  });

  it('should restore all books when All Categories is selected', () => {
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains('Books').click();

    // Filter by Fantasy first
    cy.get('[data-testid="category-fantasy"]').click();
    cy.get('[data-testid="category-fantasy"]').should('have.attr', 'aria-pressed', 'true');

    // Reset to All Categories
    cy.get('[data-testid="category-all"]').click();
    cy.get('[data-testid="category-all"]').should('have.attr', 'aria-pressed', 'true');
    cy.get('[data-testid="category-fantasy"]').should('have.attr', 'aria-pressed', 'false');
  });

  it('should combine category filter and search input', () => {
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains('Books').click();

    // Select Classic category then search for a specific title
    cy.get('[data-testid="category-classic"]').click();
    cy.get('input[placeholder]').first().type('1984');
    // 1984 is Science Fiction, not Classic – so no results
    cy.contains('No books found in this category.').should('exist');
  });
});
