const createAuthRouter = require('./auth');
const createBooksRouter = require('./books');
const createFavoritesRouter = require('./favorites');
const createReviewsRouter = require('./reviews');

function createApiRouter(deps) {
  const express = require('express');
  const router = express.Router();

  router.use('/', createAuthRouter(deps));
  router.use('/books', createBooksRouter(deps));
  router.use('/books', createReviewsRouter(deps));
  router.use('/favorites', createFavoritesRouter(deps));

  // generated-by-copilot: return sorted unique categories derived from book data
  router.get('/categories', (req, res) => {
    const books = deps.readJSON(deps.booksFile);
    const categories = [...new Set(books.map(b => b.category).filter(Boolean))].sort();
    res.json(categories);
  });

  return router;
}

module.exports = createApiRouter;
