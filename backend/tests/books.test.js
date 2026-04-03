const request = require('supertest');
const express = require('express');
const createApiRouter = require('../routes');
const path = require('path');

const app = express();
app.use(express.json());
app.use('/api', createApiRouter({
  usersFile: path.join(__dirname, '../data/test-users.json'),
  booksFile: path.join(__dirname, '../data/test-books.json'),
  readJSON: (file) => require('fs').existsSync(file) ? JSON.parse(require('fs').readFileSync(file, 'utf-8')) : [],
  writeJSON: (file, data) => require('fs').writeFileSync(file, JSON.stringify(data, null, 2)),
  authenticateToken: (req, res, next) => next(), // No auth for books
  SECRET_KEY: 'test_secret',
}));

describe('Books API', () => {
  it('GET /api/books should return a list of books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/books should not be allowed', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ title: 'Test Book', author: 'Test Author' });
    expect([404, 405]).toContain(res.statusCode);
  });

  // generated-by-copilot: sorting tests
  it('GET /api/books?sortBy=title&order=asc should return books sorted by title ascending', async () => {
    const res = await request(app).get('/api/books?sortBy=title&order=asc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const titles = res.body.map(b => b.title.toLowerCase());
    for (let i = 0; i < titles.length - 1; i++) {
      expect(titles[i] <= titles[i + 1]).toBe(true);
    }
  });

  it('GET /api/books?sortBy=title&order=desc should return books sorted by title descending', async () => {
    const res = await request(app).get('/api/books?sortBy=title&order=desc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const titles = res.body.map(b => b.title.toLowerCase());
    for (let i = 0; i < titles.length - 1; i++) {
      expect(titles[i] >= titles[i + 1]).toBe(true);
    }
  });

  it('GET /api/books?sortBy=author&order=asc should return books sorted by author ascending', async () => {
    const res = await request(app).get('/api/books?sortBy=author&order=asc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const authors = res.body.map(b => b.author.toLowerCase());
    for (let i = 0; i < authors.length - 1; i++) {
      expect(authors[i] <= authors[i + 1]).toBe(true);
    }
  });

  it('GET /api/books?sortBy=author&order=desc should return books sorted by author descending', async () => {
    const res = await request(app).get('/api/books?sortBy=author&order=desc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const authors = res.body.map(b => b.author.toLowerCase());
    for (let i = 0; i < authors.length - 1; i++) {
      expect(authors[i] >= authors[i + 1]).toBe(true);
    }
  });

  it('GET /api/books with invalid sortBy should return unsorted books', async () => {
    const res = await request(app).get('/api/books?sortBy=invalid');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // generated-by-copilot: category filtering tests
  it('GET /api/books?category=Fantasy should return only Fantasy books', async () => {
    const res = await request(app).get('/api/books?category=Fantasy');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach(b => expect(b.category).toBe('Fantasy'));
  });

  it('GET /api/books?category=fantasy (lowercase) should still match Fantasy books', async () => {
    const res = await request(app).get('/api/books?category=fantasy');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach(b => expect(b.category.toLowerCase()).toBe('fantasy'));
  });

  it('GET /api/books?category=Unknown should return an empty array', async () => {
    const res = await request(app).get('/api/books?category=Unknown');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it('GET /api/books?category=Classic&sortBy=title&order=asc should return filtered and sorted results', async () => {
    const res = await request(app).get('/api/books?category=Classic&sortBy=title&order=asc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach(b => expect(b.category).toBe('Classic'));
    const titles = res.body.map(b => b.title.toLowerCase());
    for (let i = 0; i < titles.length - 1; i++) {
      expect(titles[i] <= titles[i + 1]).toBe(true);
    }
  });

  // generated-by-copilot: categories endpoint tests
  it('GET /api/categories should return a sorted array of unique categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    // all strings
    res.body.forEach(c => expect(typeof c).toBe('string'));
    // sorted
    const sorted = [...res.body].sort();
    expect(res.body).toEqual(sorted);
    // unique
    const unique = [...new Set(res.body)];
    expect(res.body).toEqual(unique);
    // known categories are present
    expect(res.body).toContain('Classic');
    expect(res.body).toContain('Fantasy');
    expect(res.body).toContain('Science Fiction');
  });
});
