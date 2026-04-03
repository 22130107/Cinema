import Link from 'next/link';

const MovieGrid = ({ movies, title, cdnUrl }) => {
  if (!movies || movies.length === 0) return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>Không tìm thấy danh sách phim nào.</p>
    </div>
  );

  return (
    <div className="movie-grid-container">
      <h2 className="grid-title">{title}</h2>
      <div className="grid">
        {movies.map(movie => (
          <Link href={`/phim/${movie.slug}`} className="poster-card grid-item" key={movie._id}>
            <img 
              src={`${cdnUrl}/uploads/movies/${movie.thumb_url}`} 
              alt={movie.name} 
              className="poster"
              loading="lazy"
            />
            <div className="poster-info-static">
              <h3 className="poster-title" title={movie.name}>{movie.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MovieGrid;
