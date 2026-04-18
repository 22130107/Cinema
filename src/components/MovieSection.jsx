'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { getMovieRating, getImageUrl } from '@/lib/utils';

/**
 * Component hiển thị một section phim trên trang chủ
 * (VD: Phim Chiếu Rạp Mới, Phim Bộ, Phim Lẻ...)
 */
export default function MovieSection({
  title,
  movies,
  tabs,
  cdnUrl,
  selectedTab,
  onTabChange,
  viewAllLink,
  filterFn,
  limit,
}) {
  const filteredMovies = Array.isArray(movies)
    ? movies.filter((m) => (typeof filterFn === 'function' ? filterFn(m, selectedTab) : true))
    : [];

  // Sort movies by year (newest first), then by rating (highest first)
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    const yearA = a.year || 0;
    const yearB = b.year || 0;

    if (yearA !== yearB) return yearB - yearA;

    const ratingA = getMovieRating(a) ?? 0;
    const ratingB = getMovieRating(b) ?? 0;
    return ratingB - ratingA;
  });

  return (
    <div className="section-wrapper">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {tabs && tabs.length > 0 && (
          <div className="category-tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`tab-btn ${selectedTab === tab ? 'active' : ''}`}
                onClick={() => onTabChange(selectedTab === tab ? '' : tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
        {viewAllLink && (
          <Link href={viewAllLink} className="view-all-link">
            Xem tất cả &#8250;
          </Link>
        )}
      </div>

      <div className="movies-row">
        {sortedMovies && sortedMovies.length > 0 ? sortedMovies.slice(0, limit ?? sortedMovies.length).map(movie => {
          const rating = getMovieRating(movie);
          const imgSrc = getImageUrl(movie.thumb_url, cdnUrl);

          return (
            <Link href={`/phim/${movie.slug}`} className="grid-poster-card-row" key={movie._id} title={movie.name}>
              <div className="poster-container">
                <img
                  src={imgSrc}
                  alt={movie.name}
                  className="poster"
                  loading="lazy"
                />
                {movie.quality && (
                  <span className="quality-tag">{movie.quality}</span>
                )}
                {rating !== null && (
                  <span className="rating-tag">&#11088; {rating.toFixed(1)}</span>
                )}
                <span className="poster-play-btn" aria-hidden="true">
                  <span className="poster-play-circle">
                    <Play size={18} fill="currentColor" />
                  </span>
                </span>
                <div className="poster-title-overlay">
                  <h3 className="grid-poster-title" title={movie.name}>{movie.name}</h3>
                </div>
              </div>
            </Link>
          );
        }) : (
          <div style={{ color: '#999', padding: '20px' }}>
            Đang tải phim...
          </div>
        )}
      </div>
    </div>
  );
}
