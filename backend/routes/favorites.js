const express = require('express');

function getFavoriteBookId(favorite) {
  return typeof favorite === 'string' ? favorite : favorite.bookId;
}

function getFavoriteComment(favorite) {
  if (typeof favorite === 'string') return '';
  return typeof favorite.comment === 'string' ? favorite.comment : '';
}

function toFavoriteEntry(bookId, comment = '') {
  return { bookId, comment };
}

function createFavoritesRouter({ usersFile, booksFile, readJSON, writeJSON, authenticateToken }) {
  const router = express.Router();

  router.get('/', authenticateToken, (req, res) => {
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const books = readJSON(booksFile);
    const favoriteMetadata = new Map(
      user.favorites.map(favorite => [getFavoriteBookId(favorite), getFavoriteComment(favorite)])
    );
    const favorites = books
      .filter(book => favoriteMetadata.has(book.id))
      .map(book => ({ ...book, comment: favoriteMetadata.get(book.id) }));
    res.json(favorites);
  });

  router.post('/', authenticateToken, (req, res) => {
    const { bookId, comment = '' } = req.body;
    if (!bookId) return res.status(400).json({ message: 'Book ID required' });
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const favoriteIndex = user.favorites.findIndex(favorite => getFavoriteBookId(favorite) === bookId);
    const normalizedComment = typeof comment === 'string' ? comment.trim() : '';

    if (favoriteIndex === -1) {
      user.favorites.push(toFavoriteEntry(bookId, normalizedComment));
      writeJSON(usersFile, users);
    } else if (normalizedComment !== getFavoriteComment(user.favorites[favoriteIndex])) {
      user.favorites[favoriteIndex] = toFavoriteEntry(bookId, normalizedComment);
      writeJSON(usersFile, users);
    }

    res.status(200).json({ message: 'Book added to favorites' });
  });

  router.patch('/:bookId', authenticateToken, (req, res) => {
    const { bookId } = req.params;
    const { comment = '' } = req.body;
    if (typeof comment !== 'string') return res.status(400).json({ message: 'Comment must be a string' });

    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const favoriteIndex = user.favorites.findIndex(favorite => getFavoriteBookId(favorite) === bookId);
    if (favoriteIndex === -1) return res.status(404).json({ message: 'Favorite not found' });

    user.favorites[favoriteIndex] = toFavoriteEntry(bookId, comment.trim());
    writeJSON(usersFile, users);
    res.status(200).json({ message: 'Favorite comment updated', comment: comment.trim() });
  });

  // generated-by-copilot: remove a book from favorites
  router.delete('/:bookId', authenticateToken, (req, res) => {
    const { bookId } = req.params;
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.favorites = user.favorites.filter(favorite => getFavoriteBookId(favorite) !== bookId);
    writeJSON(usersFile, users);
    res.status(200).json({ message: 'Book removed from favorites' });
  });

  return router;
}

module.exports = createFavoritesRouter;
