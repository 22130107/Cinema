'use client';

import { useState, useEffect } from 'react';
import MovieListingClient from '@/components/MovieListingClient';
import { API_BASE_URL, CDN_FALLBACK } from '@/constants/config';

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
        const res = await fetch(`${API_BASE_URL}/danh-sach/phim-moi?page=${page}`);
        if (!res.ok) return null;
        const json = await res.json();
        if (json.status !== 'success' || !json.data?.items?.length) return null;
        return json;
      } catch {
        return null;
      }
    };

    const fetchAll = async () => {
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
      const cdn = firstJson.data.APP_DOMAIN_CDN_IMAGE || CDN_FALLBACK;

      setCdnUrl(cdn);
      setMovies(firstItems);
      setTotalLoaded(firstItems.length);
      setLoading(false);

      // Fetch trang 2–10 song song ngầm
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
      <div className="listing-page-body">
        <div className="listing-page-header" style={{ padding: 0 }}>
          <h1 className="listing-page-title">Danh Sách Phim</h1>
          {loadingMore && (
            <span className="loading-badge">
              <span className="loading-dot" />
              Đang tải thêm...
            </span>
          )}
          {!loading && !loadingMore && totalLoaded > 0 && (
            <span className="listing-page-count">{totalLoaded} phim</span>
          )}
        </div>

        {loading ? (
          <div className="skeleton-grid">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image" />
                <div className="skeleton-text" />
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
    </div>
  );
}
