const express = require('express');

function createBooksRouter({ booksFile, readJSON, writeJSON, authenticateToken }) {
  const router = express.Router();

  router.get('/', (req, res) => {
    let books = readJSON(booksFile);
    const { sortBy, order, category } = req.query;

    // generated-by-copilot: filter books by category (case-insensitive) when provided
    if (category) {
      books = books.filter(b => (b.category || '').toLowerCase() === category.toLowerCase());
    }

    // generated-by-copilot: sort books by title or author, ascending or descending
    if (sortBy === 'title' || sortBy === 'author') {
      books = [...books].sort((a, b) => {
        const aVal = (a[sortBy] || '').toLowerCase();
        const bVal = (b[sortBy] || '').toLowerCase();
        if (aVal < bVal) return order === 'desc' ? 1 : -1;
        if (aVal > bVal) return order === 'desc' ? -1 : 1;
        return 0;
      });
    }

    res.json(books);
  });

  // POST /books removed: adding books is not allowed

  return router;
}

module.exports = createBooksRouter;
