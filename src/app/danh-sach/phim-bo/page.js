'use client';

import { useState, useEffect } from 'react';
import MovieListingClient from '../../../components/MovieListingClient';

export default function PhimBoPage() {
  const [movies, setMovies] = useState([]);
  const [cdnUrl, setCdnUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        let allMovies = [];
        let allCdnUrl = '';

        // Fetch first page immediately for quick initial load
        const res1 = await fetch(`https://ophim1.com/v1/api/danh-sach/phim-bo?page=1`);
        const json1 = await res1.json();

        if (json1.status === 'success') {
          const filteredItems = (json1.data.items || []).filter(movie => movie.type === 'series');
          allMovies = [...allMovies, ...filteredItems];
          allCdnUrl = json1.data.APP_DOMAIN_CDN_IMAGE;
        }

        setCdnUrl(allCdnUrl);
        setMovies(allMovies);
        setLoading(false);

        // Load remaining pages in background (parallel fetch)
        setLoadingMore(true);
        const promises = [];
        for (let page = 2; page <= 10; page++) {
          promises.push(
            fetch(`https://ophim1.com/v1/api/danh-sach/phim-bo?page=${page}`)
              .then(res => res.json())
              .catch(err => ({ status: 'error', err }))
          );
        }

        const results = await Promise.all(promises);
        results.forEach(json => {
          if (json.status === 'success') {
            const filteredItems = (json.data.items || []).filter(movie => movie.type === 'series');
            setMovies(prev => {
              const existingIds = new Set(prev.map(m => m._id));
              return [...prev, ...filteredItems.filter(m => !existingIds.has(m._id))];
            });
          }
        });
        setLoadingMore(false);
      } catch (err) {
        console.error('Lỗi tải danh sách phim bộ:', err);
        setLoading(false);
        setLoadingMore(false);
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
