const express = require('express');
const crypto = require('crypto');

const RATE_LIMIT_MS = 60 * 1000; // 1 minute between submissions per user per book

function createReviewsRouter({ reviewsFile, booksFile, readJSON, writeJSON, authenticateToken }) {
  const router = express.Router();
  // generated-by-copilot: per-instance rate limit store so each router has isolated state
  const lastSubmissionTime = {};

  // GET /api/books/:id/reviews - returns all reviews for a book
  router.get('/:id/reviews', (req, res) => {
    const reviews = readJSON(reviewsFile);
    res.json(reviews[req.params.id] || []);
  });

  // GET /api/books/:id/average-rating - returns average rating and count for a book
  router.get('/:id/average-rating', (req, res) => {
    const reviews = readJSON(reviewsFile);
    const bookReviews = reviews[req.params.id] || [];
    if (bookReviews.length === 0) {
      return res.json({ averageRating: null, count: 0 });
    }
    const avg = bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
    res.json({ averageRating: Math.round(avg * 10) / 10, count: bookReviews.length });
  });

  // POST /api/books/:id/reviews - submit a review (authenticated)
  router.post('/:id/reviews', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { rating, text } = req.body;

    // Validate book exists
    const books = readJSON(booksFile);
    if (!books.find(b => b.id === id)) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Validate rating
    const ratingNum = Number(rating);
    if (!rating || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    // Validate text
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ message: 'Review text is required' });
    }

    // Check for existing review by this user for this book (before rate limiting for clearer error)
    const reviews = readJSON(reviewsFile);
    const bookReviews = reviews[id] || [];
    if (bookReviews.find(r => r.username === req.user.username)) {
      return res.status(409).json({ message: 'You have already reviewed this book' });
    }

    // generated-by-copilot: rate limit - prevent rapid successive review submissions
    const rateLimitKey = `${req.user.username}:${id}`;
    const now = Date.now();
    if (lastSubmissionTime[rateLimitKey] && now - lastSubmissionTime[rateLimitKey] < RATE_LIMIT_MS) {
      return res.status(429).json({ message: 'Please wait before submitting another review for this book' });
    }

    const review = {
      id: crypto.randomUUID(),
      username: req.user.username,
      rating: ratingNum,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!reviews[id]) reviews[id] = [];
    reviews[id].push(review);
    writeJSON(reviewsFile, reviews);

    lastSubmissionTime[rateLimitKey] = now;

    res.status(201).json(review);
  });

  return router;
}

module.exports = createReviewsRouter;
