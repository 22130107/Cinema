'use client';

import { Play, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

function generateSlug(str) {
  str = str.toLowerCase();
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');
  str = str.replace(/([^a-z0-9-\s])/g, '');
  str = str.replace(/(\s+)/g, '-');
  str = str.replace(/^-+/g, '');
  str = str.replace(/-+$/g, '');
  return str;
}

const MovieSection = ({ title, movies, tabs, cdnUrl, selectedTab, onTabChange, viewAllLink }) => {
  // Sort movies by year (newest first), then by rating (highest first)
  const sortedMovies = [...movies].sort((a, b) => {
    const yearA = a.year || 0;
    const yearB = b.year || 0;
    
    // Sort by year first (descending - newer first)
    if (yearA !== yearB) {
      return yearB - yearA;
    }
    
    // If same year, sort by rating (descending - highest first)
    const ratingA = a.tmdb?.vote_average || a.imdb?.vote_average || 0;
    const ratingB = b.tmdb?.vote_average || b.imdb?.vote_average || 0;
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
                onClick={() => onTabChange(tab)}
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
        {sortedMovies && sortedMovies.length > 0 ? sortedMovies.map(movie => {
          const rating = movie.tmdb?.vote_average || movie.imdb?.vote_average;
          return (
            <Link href={`/phim/${movie.slug}`} className="grid-poster-card-row" key={movie._id}>
              <div className="poster-container">
                <img 
                  src={`${cdnUrl}/uploads/movies/${movie.thumb_url}`} 
                  alt={movie.name} 
                  className="poster"
                  loading="lazy"
                />
                {movie.quality && (
                  <span className="quality-tag">{movie.quality}</span>
                )}
                {rating && (
                  <span className="rating-tag">⭐ {rating.toFixed(1)}</span>
                )}
              </div>
              <h3 className="grid-poster-title" title={movie.name}>{movie.name}</h3>
              {movie.year && <p className="movie-year">{movie.year}</p>}
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
};

export default function Home() {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [cdnUrl, setCdnUrl] = useState('');
  const [allMovies, setAllMovies] = useState([]);
  const [countryTabs, setCountryTabs] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [genreTabs, setGenreTabs] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  
  const [phimChieuRapMovies, setPhimChieuRapMovies] = useState([]);
  const [phimBoMovies, setPhimBoMovies] = useState([]);
  const [phimLeMovies, setPhimLeMovies] = useState([]);
  const [phimHoatHinhMovies, setPhimHoatHinhMovies] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch home data (featured)
        const homeRes = await fetch('https://ophim1.com/v1/api/home');
        const homeJson = await homeRes.json();
        
        if (homeJson.status === 'success') {
          const fetchedMovies = homeJson.data.items;
          const cdn = homeJson.data.APP_DOMAIN_CDN_IMAGE;
          setCdnUrl(cdn);
          setAllMovies(fetchedMovies);

          if (fetchedMovies.length > 0) {
            setFeaturedMovie(fetchedMovies[0]);
          }
        }
        
        // Fetch phim chiếu rạp (cinema movies)
        const chieuRapRes = await fetch('https://ophim1.com/v1/api/danh-sach/phim-chieu-rap?page=1');
        const chieuRapJson = await chieuRapRes.json();
        if (chieuRapJson.status === 'success') {
          const movies = (chieuRapJson.data.items || []).slice(0, 14);
          setPhimChieuRapMovies(movies);
        }
        
        // Fetch phim bộ (series movies)
        const boRes = await fetch('https://ophim1.com/v1/api/danh-sach/phim-bo?page=1');
        const boJson = await boRes.json();
        if (boJson.status === 'success') {
          const movies = (boJson.data.items || []).slice(0, 14);
          setPhimBoMovies(movies);
        }
        
        // Fetch phim lẻ (single movies)
        const leRes = await fetch('https://ophim1.com/v1/api/danh-sach/phim-le?page=1');
        const leJson = await leRes.json();
        if (leJson.status === 'success') {
          const movies = (leJson.data.items || []).slice(0, 14);
          setPhimLeMovies(movies);
        }
        
        // Fetch phim hoạt hình (animated movies)
        const hoatHinhRes = await fetch('https://ophim1.com/v1/api/danh-sach/hoat-hinh?page=1');
        const hoatHinhJson = await hoatHinhRes.json();
        if (hoatHinhJson.status === 'success') {
          const movies = (hoatHinhJson.data.items || []).slice(0, 14);
          setPhimHoatHinhMovies(movies);
        }
        
      } catch (err) {
        console.error('Lỗi khi gọi API:', err);
      }
    };

    fetchAllData();
  }, []);

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
  };

  const billboardImg = featuredMovie ? `${cdnUrl}/uploads/movies/${featuredMovie.thumb_url}` : '';

  return (
    <div className="home-page">
      {/* Billboard Hero Section */}
      {featuredMovie && (
        <header className="billboard" style={{ backgroundImage: `url(${billboardImg})` }}>
          <div className="billboard-vignette"></div>
          <div className="billboard-info">
            <h1 className="billboard-title">{featuredMovie.name}</h1>
            <p className="billboard-desc">
              Một tác phẩm từ {featuredMovie.country.map(c => c.name).join(', ')}. 
              Thể loại: {featuredMovie.category.map(c => c.name).join(', ')}. 
              Năm {featuredMovie.year}.
            </p>
            <div className="billboard-buttons">
              <Link href={`/phim/${featuredMovie.slug}`} className="btn btn-play">
                <Play size={24} fill="currentColor" /> Phát
              </Link>
              <Link href={`/phim/${featuredMovie.slug}`} className="btn btn-more">
                <Info size={24} /> Thông Tin Khác
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Section 1: PHIM CHIẾU RẠP MỚI */}
      <MovieSection
        title="PHIM CHIẾU RẠP MỚI"
        movies={phimChieuRapMovies}
        tabs={['2025', '2024', '2023', '2022']}
        cdnUrl={cdnUrl}
        selectedTab="2025"
        onTabChange={() => {}}
        viewAllLink="/danh-sach/phim-chieu-rap"
      />

      {/* Section 2: PHIM BỘ */}
      <MovieSection
        title="PHIM BỘ"
        movies={phimBoMovies}
        tabs={['2025', '2024', '2023', '2022']}
        cdnUrl={cdnUrl}
        selectedTab="2025"
        onTabChange={() => {}}
        viewAllLink="/danh-sach/phim-bo"
      />

      {/* Section 3: PHIM LẺ */}
      <MovieSection
        title="PHIM LẺ"
        movies={phimLeMovies}
        tabs={['2025', '2024', '2023', '2022']}
        cdnUrl={cdnUrl}
        selectedTab="2025"
        onTabChange={() => {}}
        viewAllLink="/danh-sach/phim-le"
      />

      {/* Section 4: PHIM HOẠT HÌNH */}
      <MovieSection
        title="PHIM HOẠT HÌNH"
        movies={phimHoatHinhMovies}
        tabs={['2025', '2024', '2023', '2022']}
        cdnUrl={cdnUrl}
        selectedTab="2025"
        onTabChange={() => {}}
        viewAllLink="/danh-sach/hoat-hinh"
      />
    </div>
  );
}
