import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchReviews,
  fetchAverageRating,
  submitReview,
} from '../store/reviewsSlice';
import styles from '../styles/BookList.module.css';

// generated-by-copilot: renders filled/empty stars for a given rating value
function StarDisplay({ rating, max = 5 }) {
  return (
    <span className={styles.starDisplay} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </span>
  );
}

// generated-by-copilot: interactive star picker for the review form
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className={styles.starPicker} role="group" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.starPickerBtn} ${star <= (hovered || value) ? styles.starFilled : styles.starEmpty}`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={value === star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </span>
  );
}

const BookReviews = ({ bookId }) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.user.token);
  const bookData = useAppSelector((state) => state.reviews.byBookId[bookId]);

  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [formError, setFormError] = useState('');
  // generated-by-copilot: per-card local state so each book card has independent submit status
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitError, setSubmitError] = useState(null);

  const reviews = bookData?.items || [];
  const averageRating = bookData?.averageRating;
  const reviewCount = bookData?.count ?? reviews.length;
  const loadStatus = bookData?.status || 'idle';

  const handleToggle = () => {
    if (!isOpen) {
      dispatch(fetchReviews(bookId));
      dispatch(fetchAverageRating(bookId));
      setSubmitStatus('idle');
      setSubmitError(null);
    }
    setIsOpen((prev) => !prev);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (rating === 0) {
      setFormError('Please select a rating.');
      return;
    }
    if (!text.trim()) {
      setFormError('Please enter a review.');
      return;
    }
    setSubmitStatus('loading');
    setSubmitError(null);
    const result = await dispatch(submitReview({ bookId, rating, text, token }));
    if (submitReview.fulfilled.match(result)) {
      setSubmitStatus('succeeded');
      setRating(0);
      setText('');
      dispatch(fetchAverageRating(bookId));
    } else {
      setSubmitStatus('failed');
      setSubmitError(result.payload || 'Failed to submit review');
    }
  };

  return (
    <div className={styles.reviewsSection}>
      {/* generated-by-copilot: toggle button shows review count and average */}
      <button
        className={styles.reviewsToggleBtn}
        onClick={handleToggle}
        aria-expanded={isOpen}
        data-testid={`reviews-toggle-${bookId}`}
      >
        Reviews ({reviewCount})
        {averageRating !== null && averageRating !== undefined && (
          <span className={styles.avgRatingBadge}>
            {averageRating.toFixed(1)} ★
          </span>
        )}
        <span className={styles.reviewsChevron}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.reviewsBody}>
          {/* Average rating summary */}
          {averageRating !== null && averageRating !== undefined && reviewCount > 0 && (
            <div className={styles.avgRatingSummary}>
              <StarDisplay rating={averageRating} />
              <span className={styles.avgRatingText}>
                {averageRating.toFixed(1)} / 5 ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Reviews list */}
          <div className={styles.reviewsList}>
            {loadStatus === 'loading' && <p className={styles.reviewsLoading}>Loading reviews…</p>}
            {loadStatus === 'failed' && <p className={styles.reviewsError}>Failed to load reviews.</p>}
            {loadStatus === 'succeeded' && reviews.length === 0 && (
              <p className={styles.reviewsEmpty}>No reviews yet. Be the first to review!</p>
            )}
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewUsername}>{review.username}</span>
                  <StarDisplay rating={review.rating} />
                </div>
                <p className={styles.reviewText}>{review.text}</p>
                <span className={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>

          {/* Submit review form (only for authenticated users) */}
          {token && (
            <form className={styles.reviewForm} onSubmit={handleSubmit} data-testid={`review-form-${bookId}`}>
              <div className={styles.reviewFormRow}>
                <label className={styles.reviewFormLabel}>Your rating:</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <textarea
                className={styles.reviewTextarea}
                placeholder="Write your review…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={1000}
                aria-label="Review text"
              />
              {formError && <p className={styles.reviewsError}>{formError}</p>}
              {submitError && submitStatus === 'failed' && (
                <p className={styles.reviewsError}>{submitError}</p>
              )}
              {submitStatus === 'succeeded' && (
                <p className={styles.reviewsSuccess}>Review submitted!</p>
              )}
              <button
                type="submit"
                className={styles.simpleBtn}
                disabled={submitStatus === 'loading'}
                data-testid={`submit-review-${bookId}`}
              >
                {submitStatus === 'loading' ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default BookReviews;
