'use client';

import { Play, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import MovieSection from '@/components/MovieSection';
import { API_BASE_URL, CDN_FALLBACK, HERO_SLIDER_COUNT, HERO_AUTO_INTERVAL } from '@/constants/config';
import { getImageUrl, normalize } from '@/lib/utils';

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

  // Filter tabs (home)
  const [selectedCinemaYear, setSelectedCinemaYear] = useState('');
  const [selectedSeriesTab, setSelectedSeriesTab] = useState('');
  const [selectedSingleTab, setSelectedSingleTab] = useState('');

  // Calculate movies to show based on window width
  const getMoviesToShow = () => {
    if (windowWidth < 480) return 4;
    if (windowWidth < 768) return 6;
    if (windowWidth < 1024) return 8;
    return 14;
  };

  const moviesToShow = getMoviesToShow();

  // --- Helper functions cho filter ---
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

  // --- Hero slider ---
  const heroMovies = useMemo(() => (
    Array.isArray(allMovies) ? allMovies.slice(0, HERO_SLIDER_COUNT) : []
  ), [allMovies]);
  const activeHeroMovie = heroMovies[heroIndex] || featuredMovie;

  const goToHero = (index) => {
    if (!heroMovies.length) return;
    setHeroIndex((index + heroMovies.length) % heroMovies.length);
  };

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
        const [homeJson, chieuRapJson, boJson, leJson, hoatHinhJson] = await Promise.all([
          fetch(`${API_BASE_URL}/home`).then(r => r.json()),
          fetch(`${API_BASE_URL}/danh-sach/phim-chieu-rap?page=1`).then(r => r.json()),
          fetch(`${API_BASE_URL}/danh-sach/phim-bo?page=1`).then(r => r.json()),
          fetch(`${API_BASE_URL}/danh-sach/phim-le?page=1`).then(r => r.json()),
          fetch(`${API_BASE_URL}/danh-sach/hoat-hinh?page=1`).then(r => r.json()),
        ]);

        if (homeJson.status === 'success') {
          const fetchedMovies = homeJson.data.items;
          const cdn = homeJson.data.APP_DOMAIN_CDN_IMAGE;
          setCdnUrl(cdn);
          setAllMovies(fetchedMovies);
          if (fetchedMovies.length > 0) {
            setFeaturedMovie(fetchedMovies[0]);
          }
        }

        if (chieuRapJson.status === 'success') {
          setPhimChieuRapMovies((chieuRapJson.data.items || []).slice(0, 20));
        }
        if (boJson.status === 'success') {
          setPhimBoMovies((boJson.data.items || []).slice(0, 20));
        }
        if (leJson.status === 'success') {
          setPhimLeMovies((leJson.data.items || []).slice(0, 20));
        }
        if (hoatHinhJson.status === 'success') {
          setPhimHoatHinhMovies((hoatHinhJson.data.items || []).slice(0, 20));
        }
      } catch (err) {
        console.error('Lỗi khi gọi API:', err);
      }
    };

    fetchAllData();
  }, []);

  // Auto-slide hero
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const t = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, HERO_AUTO_INTERVAL);
    return () => clearInterval(t);
  }, [heroMovies.length]);

  // Lấy poster cho dải thumbnail hero
  useEffect(() => {
    const targets = heroMovies.slice(0, 6).filter((m) => m?.slug);
    if (!targets.length) return;

    let canceled = false;

    const loadThumbPosters = async () => {
      try {
        const pairs = await Promise.all(
          targets.map(async (m) => {
            try {
              const res = await fetch(`${API_BASE_URL}/phim/${m.slug}`);
              const json = await res.json();
              const item = json?.movie || json?.data?.item;
              const detailCdn = json?.data?.APP_DOMAIN_CDN_IMAGE || cdnUrl || CDN_FALLBACK;
              const poster = getImageUrl(item?.poster_url, detailCdn);
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
        // fallback sang poster_url/thumb_url local
      }
    };

    loadThumbPosters();
    return () => { canceled = true; };
  }, [heroMovies, cdnUrl]);

  // Lấy poster_url từ API chi tiết phim cho billboard
  useEffect(() => {
    if (!activeHeroMovie?.slug) return;

    let canceled = false;

    const fetchFeaturedPoster = async () => {
      if (!canceled) {
        setFeaturedPosterStatus('loading');
        setFeaturedPosterUrl('');
      }

      try {
        const res = await fetch(`${API_BASE_URL}/phim/${activeHeroMovie.slug}`);
        const json = await res.json();
        const item = json?.movie || json?.data?.item;
        const detailCdn = json?.data?.APP_DOMAIN_CDN_IMAGE || cdnUrl || CDN_FALLBACK;
        const poster = getImageUrl(item?.poster_url, detailCdn);

        if (!canceled && poster) {
          setFeaturedPosterUrl(poster);
          setFeaturedPosterStatus('loaded');
        } else if (!canceled) {
          setFeaturedPosterStatus('failed');
        }
      } catch {
        if (!canceled) setFeaturedPosterStatus('failed');
      }
    };

    fetchFeaturedPoster();
    return () => { canceled = true; };
  }, [activeHeroMovie?.slug, cdnUrl]);

  const fallbackThumb = activeHeroMovie
    ? getImageUrl(activeHeroMovie.thumb_url, cdnUrl || CDN_FALLBACK)
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
            <div className="billboard-thumbs">
              {heroMovies.slice(0, 6).map((m, idx) => {
                const thumbSrc = heroPosterBySlug[m?.slug]
                  || getImageUrl(m?.poster_url || m?.thumb_url, cdnUrl || CDN_FALLBACK);
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
