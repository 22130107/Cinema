'use client';

import { useState, useEffect } from 'react';
import MovieListingClient from '../../../components/MovieListingClient';

export default function PhimLePage() {
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
        const res1 = await fetch(`https://ophim1.com/v1/api/danh-sach/phim-le?page=1`);
        const json1 = await res1.json();

        if (json1.status === 'success') {
          const filteredItems = (json1.data.items || []).filter(movie => movie.type === 'single');
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
            fetch(`https://ophim1.com/v1/api/danh-sach/phim-le?page=${page}`)
              .then(res => res.json())
              .catch(err => ({ status: 'error', err }))
          );
        }

        const results = await Promise.all(promises);
        results.forEach(json => {
          if (json.status === 'success') {
            const filteredItems = (json.data.items || []).filter(movie => movie.type === 'single');
            setMovies(prev => {
              const existingIds = new Set(prev.map(m => m._id));
              return [...prev, ...filteredItems.filter(m => !existingIds.has(m._id))];
            });
          }
        });
        setLoadingMore(false);
      } catch (err) {
        console.error('Lỗi tải danh sách phim lẻ:', err);
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--background)' }}>
      <div style={{ padding: '0 4vw' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '30px', color: 'white' }}>Phim Lẻ</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Đang tải...
          </div>
        ) : (
          <MovieListingClient 
            movies={movies} 
            cdnUrl={cdnUrl} 
            title="Phim Lẻ" 
            allowFiltering={true}
            sortOptions={['year', 'rating']}
          />
        )}
      </div>
    </div>
  );
}
