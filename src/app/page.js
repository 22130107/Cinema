'use client';

import { Play, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

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

const MovieSection = ({ title, movies, tabs, cdnUrl, selectedTab, onTabChange, viewAllLink, filterFn, limit }) => {
  const getMovieRating = (movie) => {
    const tmdb = Number(movie?.tmdb?.vote_average);
    if (Number.isFinite(tmdb) && tmdb > 0) return tmdb;

    const imdb = Number(movie?.imdb?.vote_average);
    if (Number.isFinite(imdb) && imdb > 0) return imdb;

    return null;
  };

  const filteredMovies = Array.isArray(movies)
    ? movies.filter((m) => (typeof filterFn === 'function' ? filterFn(m, selectedTab) : true))
    : [];

  // Sort movies by year (newest first), then by rating (highest first)
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    const yearA = a.year || 0;
    const yearB = b.year || 0;
    
    // Sort by year first (descending - newer first)
    if (yearA !== yearB) {
      return yearB - yearA;
    }
    
    // If same year, sort by rating (descending - highest first)
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
          return (
            <Link href={`/phim/${movie.slug}`} className="grid-poster-card-row" key={movie._id} title={movie.name}>
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
                {rating !== null && (
                  <span className="rating-tag">⭐ {rating.toFixed(1)}</span>
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
};

export default function Home() {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [featuredPosterUrl, setFeaturedPosterUrl] = useState('');
  const [featuredPosterStatus, setFeaturedPosterStatus] = useState('idle');
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPosterBySlug, setHeroPosterBySlug] = useState({});
  const [cdnUrl, setCdnUrl] = useState('');
  const [allMovies, setAllMovies] = useState([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  const [phimChieuRapMovies, setPhimChieuRapMovies] = useState([]);
  const [phimBoMovies, setPhimBoMovies] = useState([]);
  const [phimLeMovies, setPhimLeMovies] = useState([]);
  const [phimHoatHinhMovies, setPhimHoatHinhMovies] = useState([]);

  // Filter tabs (home) - match sample-style UI
  const [selectedCinemaYear, setSelectedCinemaYear] = useState('');
  const [selectedSeriesTab, setSelectedSeriesTab] = useState('');
  const [selectedSingleTab, setSelectedSingleTab] = useState('');

  // Calculate movies to show based on window width
  const getMoviesToShow = () => {
    if (windowWidth < 480) return 4;      // Mobile: 4 phim
    if (windowWidth < 768) return 6;      // Small tablet: 6 phim
    if (windowWidth < 1024) return 8;     // Tablet: 8 phim
    return 14;                             // Desktop: 14 phim
  };

  const moviesToShow = getMoviesToShow();

  const normalize = (s) => (s || '').toString().trim().toLowerCase();

  const hasCategory = (movie, categoryName) => {
    if (!Array.isArray(movie?.category) || movie.category.length === 0) return true;
    return movie.category.some((c) => normalize(c?.name) === normalize(categoryName));
  };

  const hasCountry = (movie, countryName) => {
    if (!Array.isArray(movie?.country) || movie.country.length === 0) return true;
    return movie.country.some((c) => normalize(c?.name) === normalize(countryName));
  };

  const isFullSeries = (movie) => {
    const v = normalize(`${movie?.episode_current || ''} ${movie?.episode_total || ''}`);
    return v.includes('full') || v.includes('hoan') || v.includes('hoàn') || v.includes('tron') || v.includes('trọn');
  };

  const toAbsoluteMovieImage = (path, cdn) => {
    if (!path) return '';
    if (String(path).startsWith('http')) return path;
    return `${cdn}/uploads/movies/${path}`;
  };

  const heroMovies = useMemo(() => (
    Array.isArray(allMovies) ? allMovies.slice(0, 8) : []
  ), [allMovies]);
  const activeHeroMovie = heroMovies[heroIndex] || featuredMovie;

  const goToHero = (index) => {
    if (!heroMovies.length) return;
    const nextIndex = (index + heroMovies.length) % heroMovies.length;
    setHeroIndex(nextIndex);
  };

  const goNextHero = () => goToHero(heroIndex + 1);
  const goPrevHero = () => goToHero(heroIndex - 1);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch movies data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch tất cả 5 API song song cùng lúc
        const [homeJson, chieuRapJson, boJson, leJson, hoatHinhJson] = await Promise.all([
          fetch('https://ophim1.com/v1/api/home').then(r => r.json()),
          fetch('https://ophim1.com/v1/api/danh-sach/phim-chieu-rap?page=1').then(r => r.json()),
          fetch('https://ophim1.com/v1/api/danh-sach/phim-bo?page=1').then(r => r.json()),
          fetch('https://ophim1.com/v1/api/danh-sach/phim-le?page=1').then(r => r.json()),
          fetch('https://ophim1.com/v1/api/danh-sach/hoat-hinh?page=1').then(r => r.json()),
        ]);

        // Xử lý home data (featured)
        if (homeJson.status === 'success') {
          const fetchedMovies = homeJson.data.items;
          const cdn = homeJson.data.APP_DOMAIN_CDN_IMAGE;
          setCdnUrl(cdn);
          setAllMovies(fetchedMovies);
          if (fetchedMovies.length > 0) {
            setFeaturedMovie(fetchedMovies[0]);
          }
        }

        // Xử lý phim chiếu rạp
        if (chieuRapJson.status === 'success') {
          setPhimChieuRapMovies((chieuRapJson.data.items || []).slice(0, 20));
        }

        // Xử lý phim bộ
        if (boJson.status === 'success') {
          setPhimBoMovies((boJson.data.items || []).slice(0, 20));
        }

        // Xử lý phim lẻ
        if (leJson.status === 'success') {
          setPhimLeMovies((leJson.data.items || []).slice(0, 20));
        }

        // Xử lý phim hoạt hình
        if (hoatHinhJson.status === 'success') {
          setPhimHoatHinhMovies((hoatHinhJson.data.items || []).slice(0, 20));
        }

      } catch (err) {
        console.error('Lỗi khi gọi API:', err);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const t = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 8000);
    return () => clearInterval(t);
  }, [heroMovies.length]);

  // Lấy poster cho dải thumbnail hero (ưu tiên poster_url từ API chi tiết)
  useEffect(() => {
    const targets = heroMovies.slice(0, 6).filter((m) => m?.slug);
    if (!targets.length) return;

    let canceled = false;

    const loadThumbPosters = async () => {
      try {
        const pairs = await Promise.all(
          targets.map(async (m) => {
            try {
              const res = await fetch(`https://ophim1.com/v1/api/phim/${m.slug}`);
              const json = await res.json();
              const item = json?.movie || json?.data?.item;
              const detailCdn = json?.data?.APP_DOMAIN_CDN_IMAGE || cdnUrl || 'https://img.ophim.live';
              const poster = toAbsoluteMovieImage(item?.poster_url, detailCdn);
              return [m.slug, poster || ''];
            } catch {
              return [m.slug, ''];
            }
          })
        );

        if (!canceled) {
          setHeroPosterBySlug((prev) => {
            const next = { ...prev };
            pairs.forEach(([slug, poster]) => {
              if (poster) next[slug] = poster;
            });
            return next;
          });
        }
      } catch {
        // no-op: fallback sang poster_url/thumb_url local
      }
    };

    loadThumbPosters();

    return () => {
      canceled = true;
    };
  }, [heroMovies, cdnUrl]);

  // Lấy poster_url từ API chi tiết phim cho billboard trang chủ
  useEffect(() => {
    if (!activeHeroMovie?.slug) return;

    let canceled = false;

    const fetchFeaturedPoster = async () => {
      if (!canceled) {
        setFeaturedPosterStatus('loading');
        setFeaturedPosterUrl('');
      }

      try {
        const res = await fetch(`https://ophim1.com/v1/api/phim/${activeHeroMovie.slug}`);
        const json = await res.json();

        const item = json?.movie || json?.data?.item;
        const detailCdn = json?.data?.APP_DOMAIN_CDN_IMAGE || cdnUrl || 'https://img.ophim.live';
        const poster = toAbsoluteMovieImage(item?.poster_url, detailCdn);

        if (!canceled && poster) {
          setFeaturedPosterUrl(poster);
          setFeaturedPosterStatus('loaded');
        } else if (!canceled) {
          setFeaturedPosterStatus('failed');
        }
      } catch (err) {
        if (!canceled) {
          setFeaturedPosterStatus('failed');
        }
      }
    };

    fetchFeaturedPoster();

    return () => {
      canceled = true;
    };
  }, [activeHeroMovie?.slug, cdnUrl]);

  const fallbackThumb = activeHeroMovie
    ? toAbsoluteMovieImage(activeHeroMovie.thumb_url, cdnUrl || 'https://img.ophim.live')
    : '';
  const billboardImg = featuredPosterStatus === 'loaded'
    ? featuredPosterUrl
    : featuredPosterStatus === 'failed'
      ? fallbackThumb
      : '';

  return (
    <div className="home-page">
      {/* Billboard Hero Section */}
      {activeHeroMovie && (
        <header className="billboard" style={{ backgroundImage: `url(${billboardImg})` }}>
          <div className="billboard-vignette"></div>
          <div className="billboard-info">
            <h1 className="billboard-title">{activeHeroMovie.name}</h1>
            <p className="billboard-desc">
              Một tác phẩm từ {(activeHeroMovie.country || []).map(c => c.name).join(', ')}.
              {' '}Thể loại: {(activeHeroMovie.category || []).map(c => c.name).join(', ')}.
              {' '}Năm {activeHeroMovie.year}.
            </p>
            <div className="billboard-buttons">
              <Link href={`/phim/${activeHeroMovie.slug}`} className="btn btn-play">
                <Play size={24} fill="currentColor" /> Phát
              </Link>
              <Link href={`/phim/${activeHeroMovie.slug}`} className="btn btn-more">
                <Info size={24} /> Thông Tin Khác
              </Link>
            </div>
          </div>

          {heroMovies.length > 1 && (
            <>
              <div className="billboard-thumbs">
                {heroMovies.slice(0, 6).map((m, idx) => {
                  const thumbSrc = heroPosterBySlug[m?.slug]
                    || toAbsoluteMovieImage(m?.poster_url || m?.thumb_url, cdnUrl || 'https://img.ophim.live');
                  return (
                    <button
                      key={m._id || m.slug || idx}
                      type="button"
                      className={`billboard-thumb ${heroIndex === idx ? 'active' : ''}`}
                      onClick={() => goToHero(idx)}
                      title={m?.name || ''}
                    >
                      <img src={thumbSrc} alt={m?.name || 'movie'} />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </header>
      )}

      {/* Section 1: PHIM CHIẾU RẠP MỚI */}
      <MovieSection
        title="PHIM CHIẾU RẠP MỚI"
        movies={phimChieuRapMovies}
        tabs={['2025', '2024', '2023', '2022']}
        cdnUrl={cdnUrl}
        selectedTab={selectedCinemaYear}
        onTabChange={setSelectedCinemaYear}
        filterFn={(movie, tab) => {
          if (!tab) return true;
          const y = Number(tab);
          if (!Number.isFinite(y)) return true;
          const my = Number(movie?.year);
          if (!Number.isFinite(my)) return true;
          return my === y;
        }}
        limit={moviesToShow}
        viewAllLink="/danh-sach/phim-chieu-rap"
      />

      {/* Section 2: PHIM BỘ */}
      <MovieSection
        title="PHIM BỘ"
        movies={phimBoMovies}
        tabs={['Hàn Quốc', 'Trung Quốc', 'Âu - Mỹ', 'Phim Bộ Full']}
        cdnUrl={cdnUrl}
        selectedTab={selectedSeriesTab}
        onTabChange={setSelectedSeriesTab}
        filterFn={(movie, tab) => {
          if (!tab) return true;
          if (tab === 'Phim Bộ Full') return isFullSeries(movie);
          if (tab === 'Âu - Mỹ') return hasCountry(movie, 'Âu Mỹ');
          return hasCountry(movie, tab);
        }}
        limit={moviesToShow}
        viewAllLink="/danh-sach/phim-bo"
      />

      {/* Section 3: PHIM LẺ */}
      <MovieSection
        title="PHIM LẺ"
        movies={phimLeMovies}
        tabs={['Hành Động', 'Kinh Dị', 'Hài Hước']}
        cdnUrl={cdnUrl}
        selectedTab={selectedSingleTab}
        onTabChange={setSelectedSingleTab}
        filterFn={(movie, tab) => (!tab ? true : hasCategory(movie, tab))}
        limit={moviesToShow}
        viewAllLink="/danh-sach/phim-le"
      />

      {/* Section 4: PHIM HOẠT HÌNH */}
      <MovieSection
        title="PHIM HOẠT HÌNH"
        movies={phimHoatHinhMovies}
        tabs={[]}
        cdnUrl={cdnUrl}
        selectedTab=""
        onTabChange={() => {}}
        limit={moviesToShow}
        viewAllLink="/danh-sach/hoat-hinh"
      />
    </div>
  );
}
