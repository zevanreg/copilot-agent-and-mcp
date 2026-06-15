const express = require('express');

// generated-by-copilot: normalize favorites array to always use object form { bookId, comment }
function normalizeFavorites(favs) {
  return favs.map(f => (typeof f === 'string' ? { bookId: f, comment: '' } : f));
}

function createFavoritesRouter({ usersFile, booksFile, readJSON, writeJSON, authenticateToken }) {
  const router = express.Router();

  router.get('/', authenticateToken, (req, res) => {
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const books = readJSON(booksFile);
    const normalized = normalizeFavorites(user.favorites);
    // generated-by-copilot: attach comment from favorites entry to each returned book object
    const favorites = normalized
      .map(fav => {
        const book = books.find(b => b.id === fav.bookId);
        return book ? { ...book, comment: fav.comment || '' } : null;
      })
      .filter(Boolean);
    res.json(favorites);
  });

  router.post('/', authenticateToken, (req, res) => {
    const { bookId, comment } = req.body;
    if (!bookId) return res.status(400).json({ message: 'Book ID required' });
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const normalized = normalizeFavorites(user.favorites);
    const existing = normalized.find(f => f.bookId === bookId);
    if (!existing) {
      normalized.push({ bookId, comment: comment || '' });
      user.favorites = normalized;
      writeJSON(usersFile, users);
    }
    res.status(200).json({ message: 'Book added to favorites' });
  });

  // generated-by-copilot: PATCH endpoint to update the comment on a favorite
  router.patch('/:bookId/comment', authenticateToken, (req, res) => {
    const { bookId } = req.params;
    const { comment } = req.body;
    if (comment === undefined) return res.status(400).json({ message: 'Comment required' });
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const normalized = normalizeFavorites(user.favorites);
    const fav = normalized.find(f => f.bookId === bookId);
    if (!fav) return res.status(404).json({ message: 'Favorite not found' });
    fav.comment = comment;
    user.favorites = normalized;
    writeJSON(usersFile, users);
    res.status(200).json({ message: 'Favorite comment updated', favorite: { bookId, comment } });
  });

  // generated-by-copilot: DELETE endpoint to remove a book from the user's favorites
  router.delete('/:bookId', authenticateToken, (req, res) => {
    const { bookId } = req.params;
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const normalized = normalizeFavorites(user.favorites);
    const index = normalized.findIndex(f => f.bookId === bookId);
    if (index === -1) return res.status(404).json({ message: 'Favorite not found' });
    normalized.splice(index, 1);
    user.favorites = normalized;
    writeJSON(usersFile, users);
    res.status(200).json({ message: 'Book removed from favorites' });
  });

  return router;
}

module.exports = createFavoritesRouter;
