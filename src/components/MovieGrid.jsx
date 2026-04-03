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
            <div className="poster-overlay">
              <h3 className="poster-title">{movie.name}</h3>
              <div className="poster-info">
                <span style={{color: '#46d369', fontWeight: 'bold'}}>{movie.year}</span>
                <span className="quality-badge">{movie.quality}</span>
                <span className="quality-badge">{movie.lang}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MovieGrid;
