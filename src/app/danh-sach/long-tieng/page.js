'use client';

import { useState, useEffect } from 'react';
import HeroSlider from '../../../components/HeroSlider';
import MovieListingClient from '../../../components/MovieListingClient';

export default function LongTiengPage() {
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
        const seenIds = new Set();

        // Fetch first page from each endpoint (3 pages of data)
        const endpoints = ['phim-moi', 'phim-bo', 'phim-le'];
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(`https://ophim1.com/v1/api/danh-sach/${endpoint}?page=1`);
            const json = await res.json();

            if (json.status === 'success' && json.data?.items) {
              const uniqueMovies = json.data.items
                .filter(movie => {
                  const lang = String(movie.lang || '').toLowerCase();
                  const quality = String(movie.quality || '').toLowerCase();
                  const episode = String(movie.episode_current || '').toLowerCase();
                  
                  return lang.includes('lồng') || 
                         lang.includes('dubbed') ||
                         quality.includes('lồng') ||
                         episode.includes('lồng');
                })
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
            continue;
          }
        }

        setCdnUrl(allCdnUrl || 'https://img.ophim.live');
        setMovies(allMovies);
        setLoading(false);

        // Load remaining pages in background (all 30 pages in parallel)
        setLoadingMore(true);
        const promises = [];
        for (const endpoint of endpoints) {
          for (let page = 2; page <= 10; page++) {
            promises.push(
              fetch(`https://ophim1.com/v1/api/danh-sach/${endpoint}?page=${page}`)
                .then(res => res.json())
                .catch(err => ({ status: 'error', err }))
            );
          }
        }

        const results = await Promise.all(promises);
        results.forEach(json => {
          if (json.status === 'success' && json.data?.items) {
            const filteredItems = json.data.items
              .filter(movie => {
                const lang = String(movie.lang || '').toLowerCase();
                const quality = String(movie.quality || '').toLowerCase();
                const episode = String(movie.episode_current || '').toLowerCase();
                
                return lang.includes('lồng') || 
                       lang.includes('dubbed') ||
                       quality.includes('lồng') ||
                       episode.includes('lồng');
              })
              .filter(movie => movie._id && movie.name);
            setMovies(prev => {
              const existingIds = new Set(prev.map(m => m._id));
              return [...prev, ...filteredItems.filter(m => !existingIds.has(m._id))];
            });
          }
        });
        setLoadingMore(false);
      } catch (err) {
        console.error('Lỗi tải phim lồng tiếng:', err);
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
        <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Phim Lồng Tiếng</h1>
      </div>

      <div style={{ padding: '0 4vw' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Đang tải...
          </div>
        ) : movies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Không tìm thấy phim lồng tiếng
          </div>
        ) : (
          <MovieListingClient
            movies={movies}
            cdnUrl={cdnUrl}
            title="Phim Lồng Tiếng"
            allowFiltering={true}
            sortOptions={['year', 'rating']}
          />
        )}
      </div>
    </div>
  );
}
