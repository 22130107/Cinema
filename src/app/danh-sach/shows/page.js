'use client';

import { useState, useEffect } from 'react';
import HeroSlider from '../../../components/HeroSlider';
import MovieListingClient from '../../../components/MovieListingClient';

export default function ShowsPage() {
  const [movies, setMovies] = useState([]);
  const [cdnUrl, setCdnUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        let allMovies = [];
        let allCdnUrl = '';
        const seenIds = new Set();

        // Fetch from shows endpoint and filter by type: tvshows
        for (let page = 1; page <= 10; page++) {
          try {
            const res = await fetch(`https://ophim1.com/v1/api/danh-sach/shows?page=${page}`);
            const json = await res.json();

            if (json.status === 'success' && json.data?.items) {
              const uniqueMovies = json.data.items
                .filter(movie => movie.type === 'tvshows')
                .filter(movie => {
                  if (!movie._id || !movie.name) return false;
                  if (seenIds.has(movie._id)) return false;
                  seenIds.add(movie._id);
                  return true;
                });
              allMovies = [...allMovies, ...uniqueMovies];
              if (!allCdnUrl) allCdnUrl = json.data.APP_DOMAIN_CDN_IMAGE;
            }
          } catch (err) {
            // Silent fail for individual pages
          }
        }

        setCdnUrl(allCdnUrl || 'https://img.ophim.live');
        setMovies(allMovies);
      } catch (err) {
        console.error('Lỗi tải shows:', err);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const sliderMovies = movies.slice(0, 8);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <HeroSlider movies={sliderMovies} cdnUrl={cdnUrl} />

      <div style={{ padding: '40px 4vw 0' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Shows</h1>
      </div>

      <div style={{ padding: '0 4vw' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Đang tải...
          </div>
        ) : (
          <MovieListingClient
            movies={movies}
            cdnUrl={cdnUrl}
            title="Shows"
            allowFiltering={true}
            sortOptions={['year', 'rating']}
          />
        )}
      </div>
    </div>
  );
}
