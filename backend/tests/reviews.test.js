const request = require('supertest');
const express = require('express');
const createApiRouter = require('../routes');
const path = require('path');
const fs = require('fs');

const usersFile = path.join(__dirname, '../data/test-users.json');
const booksFile = path.join(__dirname, '../data/test-books.json');
const reviewsFile = path.join(__dirname, '../data/test-reviews.json');

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'test_secret';
function getToken(username = 'sandra') {
  return jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
}

const app = express();
app.use(express.json());
app.use('/api', createApiRouter({
  usersFile,
  booksFile,
  reviewsFile,
  readJSON: (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : [],
  writeJSON: (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2)),
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    try {
      req.user = jwt.verify(token, SECRET_KEY);
      next();
    } catch {
      return res.sendStatus(403);
    }
  },
  SECRET_KEY,
}));

// Reset test-reviews.json before each test
beforeEach(() => {
  fs.writeFileSync(reviewsFile, JSON.stringify({}));
});

describe('Reviews API', () => {
  it('GET /api/books/:id/reviews should return empty array for a book with no reviews', async () => {
    const res = await request(app).get('/api/books/1/reviews');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it('GET /api/books/:id/average-rating should return null average for a book with no reviews', async () => {
    const res = await request(app).get('/api/books/1/average-rating');
    expect(res.statusCode).toBe(200);
    expect(res.body.averageRating).toBeNull();
    expect(res.body.count).toBe(0);
  });

  it('POST /api/books/:id/reviews should fail without auth', async () => {
    const res = await request(app)
      .post('/api/books/1/reviews')
      .send({ rating: 4, text: 'Great book!' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/books/:id/reviews should create a review', async () => {
    const token = getToken('sandra');
    const res = await request(app)
      .post('/api/books/1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, text: 'Excellent read!' });
    expect(res.statusCode).toBe(201);
    expect(res.body.rating).toBe(5);
    expect(res.body.text).toBe('Excellent read!');
    expect(res.body.username).toBe('sandra');
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });

  it('POST /api/books/:id/reviews should fail with missing rating', async () => {
    const token = getToken('sandra');
    const res = await request(app)
      .post('/api/books/1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Good book!' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/rating/i);
  });

  it('POST /api/books/:id/reviews should fail with rating out of range', async () => {
    const token = getToken('sandra');
    const res = await request(app)
      .post('/api/books/1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 6, text: 'Too good!' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/books/:id/reviews should fail with missing text', async () => {
    const token = getToken('sandra');
    const res = await request(app)
      .post('/api/books/1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/text/i);
  });

  it('POST /api/books/:id/reviews should fail with empty text', async () => {
    const token = getToken('sandra');
    const res = await request(app)
      .post('/api/books/1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3, text: '   ' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/books/:id/reviews should return 404 for non-existent book', async () => {
    const token = getToken('sandra');
    const res = await request(app)
      .post('/api/books/99999/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3, text: 'Some review' });
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/books/:id/reviews should return 409 when user already reviewed the book', async () => {
    const token = getToken('sandra');
    await request(app)
      .post('/api/books/5/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, text: 'First review' });
    const res = await request(app)
      .post('/api/books/5/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, text: 'Second review attempt' });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already reviewed/i);
  });

  it('GET /api/books/:id/reviews should return reviews after submission', async () => {
    const token = getToken('sandra');
    await request(app)
      .post('/api/books/2/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3, text: 'Decent book' });
    const res = await request(app).get('/api/books/2/reviews');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].username).toBe('sandra');
    expect(res.body[0].rating).toBe(3);
  });

  it('GET /api/books/:id/average-rating should compute correct average', async () => {
    const token1 = getToken('sandra');
    const token2 = getToken('testuser123');
    await request(app)
      .post('/api/books/3/reviews')
      .set('Authorization', `Bearer ${token1}`)
      .send({ rating: 4, text: 'Good' });
    await request(app)
      .post('/api/books/3/reviews')
      .set('Authorization', `Bearer ${token2}`)
      .send({ rating: 2, text: 'Not great' });
    const res = await request(app).get('/api/books/3/average-rating');
    expect(res.statusCode).toBe(200);
    expect(res.body.averageRating).toBe(3);
    expect(res.body.count).toBe(2);
  });

  it('two different users can each review the same book', async () => {
    const token1 = getToken('sandra');
    const token2 = getToken('testuser123');
    const res1 = await request(app)
      .post('/api/books/4/reviews')
      .set('Authorization', `Bearer ${token1}`)
      .send({ rating: 5, text: 'Sandra loves it' });
    const res2 = await request(app)
      .post('/api/books/4/reviews')
      .set('Authorization', `Bearer ${token2}`)
      .send({ rating: 1, text: 'testuser hates it' });
    expect(res1.statusCode).toBe(201);
    expect(res2.statusCode).toBe(201);
  });
});
