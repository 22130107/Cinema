'use client';

import { useState, useEffect } from 'react';
import HeroSlider from '../../../components/HeroSlider';
import MovieListingClient from '../../../components/MovieListingClient';

export default function PhimChieuRapPage() {
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
        try {
          const res1 = await fetch(`https://ophim1.com/v1/api/danh-sach/phim-chieu-rap?page=1`);
          const json1 = await res1.json();

          if (json1.status === 'success' && json1.data?.items) {
            const filteredItems = json1.data.items.filter(movie => movie._id && movie.name);
            allMovies = [...filteredItems];
            allCdnUrl = json1.data.APP_DOMAIN_CDN_IMAGE;
          }
        } catch (err) {
          console.error('Failed to fetch phim-chieu-rap page 1:', err);
        }

        setCdnUrl(allCdnUrl || 'https://img.ophim.live');
        setMovies(allMovies);
        setLoading(false);

        // Load remaining pages in background (parallel fetch)
        setLoadingMore(true);
        const promises = [];
        for (let page = 2; page <= 10; page++) {
          promises.push(
            fetch(`https://ophim1.com/v1/api/danh-sach/phim-chieu-rap?page=${page}`)
              .then(res => res.json())
              .catch(err => ({ status: 'error', err }))
          );
        }

        const results = await Promise.all(promises);
        results.forEach(json => {
          if (json.status === 'success' && json.data?.items) {
            const filteredItems = json.data.items.filter(movie => movie._id && movie.name);
            setMovies(prev => {
              const existingIds = new Set(prev.map(m => m._id));
              return [...prev, ...filteredItems.filter(m => !existingIds.has(m._id))];
            });
          }
        });
        setLoadingMore(false);
      } catch (err) {
        console.error('Lỗi tải phim chiếu rạp:', err);
        setMovies([]);
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchMovies();
  }, []);

  const sliderMovies = movies.slice(0, 8);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <HeroSlider movies={sliderMovies} cdnUrl={cdnUrl} />

      <div style={{ padding: '40px 4vw 0' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Phim Chiếu Rạp</h1>
      </div>

      <div style={{ padding: '0 4vw' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Đang tải...
          </div>
        ) : movies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Không tìm thấy phim
          </div>
        ) : (
          <MovieListingClient
            movies={movies}
            cdnUrl={cdnUrl}
            title="Phim Chiếu Rạp"
            allowFiltering={true}
            sortOptions={['year', 'rating']}
          />
        )}
      </div>
    </div>
  );
}
