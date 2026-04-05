'use client';

import { useState, useEffect, useRef } from 'react';
import HeroSlider from '../../../components/HeroSlider';
import MovieListingClient from '../../../components/MovieListingClient';
import { useParams } from 'next/navigation';

export default function DanhSachPage() {
  const params = useParams();
  const slug = params?.slug;

  const [movies, setMovies] = useState([]);
  const [cdnUrl, setCdnUrl] = useState('');
  const [title, setTitle] = useState(slug || '');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!slug) return;

    // Hủy fetch cũ nếu slug thay đổi
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    setMovies([]);
    setLoading(true);
    setLoadingMore(false);
    setTotalLoaded(0);
    setTitle(slug.replace(/-/g, ' '));

    const fetchAllPages = async () => {
      const seenIds = new Set();
      let cdnSaved = '';

      const fetchPage = async (page) => {
        try {
          const res = await fetch(
            `https://ophim1.com/v1/api/danh-sach/${slug}?page=${page}`,
            { signal, cache: 'no-store' }
          );
          if (!res.ok) return null;
          const json = await res.json();
          if (json.status !== 'success' || !json.data?.items?.length) return null;
          return json;
        } catch {
          return null;
        }
      };

      // --- Bước 1: Fetch trang 1 ngay, hiển thị ngay ---
      const firstJson = await fetchPage(1);
      if (signal.aborted) return;

      if (!firstJson) {
        setLoading(false);
        return;
      }

      const firstItems = firstJson.data.items.filter((m) => {
        if (!m._id || !m.name || seenIds.has(m._id)) return false;
        seenIds.add(m._id);
        return true;
      });
      cdnSaved = firstJson.data.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';

      setCdnUrl(cdnSaved);
      setMovies(firstItems);
      setTotalLoaded(firstItems.length);
      setLoading(false); // ← Hiển thị ngay sau trang 1

      // --- Bước 2: Fetch trang 2–10 song song ngầm ---
      setLoadingMore(true);
      const pageNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = await Promise.allSettled(
        pageNumbers.map((p) => fetchPage(p))
      );
      if (signal.aborted) return;

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

      if (extraMovies.length > 0 && !signal.aborted) {
        setMovies((prev) => [...prev, ...extraMovies]);
        setTotalLoaded((prev) => prev + extraMovies.length);
      }
      setLoadingMore(false);
    };

    fetchAllPages();

    return () => {
      controller.abort();
    };
  }, [slug]);

  const sliderMovies = movies.slice(0, 8);

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Hero Slider */}
      <HeroSlider movies={sliderMovies} cdnUrl={cdnUrl} />

      <div style={{ padding: '40px 4vw 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '2rem', margin: 0, textTransform: 'capitalize' }}>{title}</h1>
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
            <span style={{ fontSize: '0.85rem', color: '#888' }}>
              {totalLoaded} phim
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '0 4vw' }}>
        {loading ? (
          // Skeleton loading khi chờ trang 1
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
            title={title}
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
