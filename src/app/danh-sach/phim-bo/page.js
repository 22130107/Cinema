'use client';

import { useState, useEffect } from 'react';
import MovieListingClient from '../../../components/MovieListingClient';

export default function PhimBoPage() {
  const [movies, setMovies] = useState([]);
  const [cdnUrl, setCdnUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        let allMovies = [];
        let allCdnUrl = '';

        // Fetch 10 pages to get comprehensive dataset for filtering
        for (let page = 1; page <= 10; page++) {
          const res = await fetch(`https://ophim1.com/v1/api/danh-sach/phim-bo?page=${page}`);
          const json = await res.json();

          if (json.status === 'success') {
            // Filter by type: series
            const filteredItems = (json.data.items || []).filter(movie => movie.type === 'series');
            allMovies = [...allMovies, ...filteredItems];
            if (!allCdnUrl) {
              allCdnUrl = json.data.APP_DOMAIN_CDN_IMAGE;
            }
          }
        }

        setCdnUrl(allCdnUrl);
        setMovies(allMovies);
      } catch (err) {
        console.error('Lỗi tải danh sách phim bộ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--background)' }}>
      <div style={{ padding: 'clamp(0px, 2vw, 20px)' }}>
        <h1 style={{ fontSize: 'clamp(1.2rem, 5vw, 2rem)', marginBottom: '20px', color: 'white' }}>Phim Bộ</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Đang tải...
          </div>
        ) : (
          <MovieListingClient 
            movies={movies} 
            cdnUrl={cdnUrl} 
            title="Phim Bộ" 
            allowFiltering={true}
            sortOptions={['year', 'rating']}
          />
        )}
      </div>
    </div>
  );
}
