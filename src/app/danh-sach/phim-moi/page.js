'use client';

import { useState, useEffect } from 'react';
import HeroSlider from '../../../components/HeroSlider';
import MovieListingClient from '../../../components/MovieListingClient';

export default function PhimMoiPage() {
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

        // Fetch 10 pages from phim-moi endpoint
        for (let page = 1; page <= 10; page++) {
          const res = await fetch(`https://ophim1.com/v1/api/danh-sach/phim-moi?page=${page}`);
          const json = await res.json();

          if (json.status === 'success') {
            const uniqueMovies = (json.data.items || []).filter(movie => {
              if (seenIds.has(movie._id)) return false;
              seenIds.add(movie._id);
              return true;
            });
            allMovies = [...allMovies, ...uniqueMovies];
            if (!allCdnUrl) {
              allCdnUrl = json.data.APP_DOMAIN_CDN_IMAGE;
            }
          }
        }

        setCdnUrl(allCdnUrl);
        setMovies(allMovies);
      } catch (err) {
        console.error('Lỗi tải phim mới:', err);
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
        <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Phim Mới</h1>
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
            title="Phim Mới"
            allowFiltering={true}
            sortOptions={['year', 'rating']}
          />
        )}
      </div>
    </div>
  );
}
