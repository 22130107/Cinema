'use client';

import { useState, useEffect } from 'react';
import MovieListingClient from '../../components/MovieListingClient';

export default function MovieListPage() {
  const [movies, setMovies] = useState([]);
  const [cdnUrl, setCdnUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalLoaded, setTotalLoaded] = useState(0);

  useEffect(() => {
    const seenIds = new Set();

    const fetchPage = async (page) => {
      try {
        const res = await fetch(`https://ophim1.com/v1/api/danh-sach/phim-moi?page=${page}`);
        if (!res.ok) return null;
        const json = await res.json();
        if (json.status !== 'success' || !json.data?.items?.length) return null;
        return json;
      } catch {
        return null;
      }
    };

    const fetchAll = async () => {
      // --- Bước 1: Fetch trang 1 trước, hiển thị ngay ---
      const firstJson = await fetchPage(1);
      if (!firstJson) {
        setLoading(false);
        return;
      }

      const firstItems = firstJson.data.items.filter((m) => {
        if (!m._id || !m.name || seenIds.has(m._id)) return false;
        seenIds.add(m._id);
        return true;
      });
      const cdn = firstJson.data.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';

      setCdnUrl(cdn);
      setMovies(firstItems);
      setTotalLoaded(firstItems.length);
      setLoading(false); // ← Hiển thị ngay

      // --- Bước 2: Fetch trang 2–10 song song ngầm ---
      setLoadingMore(true);
      const results = await Promise.allSettled(
        [2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => fetchPage(p))
      );

      const extraMovies = [];
      for (const result of results) {
        if (result.status !== 'fulfilled' || !result.value) continue;
        const items = result.value.data.items.filter((m) => {
          if (!m._id || !m.name || seenIds.has(m._id)) return false;
          seenIds.add(m._id);
          return true;
        });
        extraMovies.push(...items);
      }

      if (extraMovies.length > 0) {
        setMovies((prev) => [...prev, ...extraMovies]);
        setTotalLoaded((prev) => prev + extraMovies.length);
      }
      setLoadingMore(false);
    };

    fetchAll();
  }, []);

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--background)' }}>
      <div style={{ padding: '0 4vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '2rem', color: 'white', margin: 0 }}>Danh Sách Phim</h1>
          {loadingMore && (
            <span style={{
              fontSize: '0.85rem',
              color: '#e74c3c',
              background: 'rgba(231,76,60,0.12)',
              border: '1px solid rgba(231,76,60,0.3)',
              padding: '4px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#e74c3c', animation: 'pulse 1s infinite' }} />
              Đang tải thêm...
            </span>
          )}
          {!loading && !loadingMore && totalLoaded > 0 && (
            <span style={{ fontSize: '0.85rem', color: '#888' }}>{totalLoaded} phim</span>
          )}
        </div>

        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '15px',
          }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '2/3',
                  background: 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: '8px',
                }} />
                <div style={{
                  height: '14px',
                  background: '#252525',
                  borderRadius: '4px',
                  marginTop: '8px',
                  width: '80%',
                }} />
              </div>
            ))}
          </div>
        ) : (
          <MovieListingClient
            movies={movies}
            cdnUrl={cdnUrl}
            title="Danh Sách Phim"
            allowFiltering={true}
            sortOptions={['year', 'rating']}
          />
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
