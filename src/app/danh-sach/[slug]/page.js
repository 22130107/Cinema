'use client';

import { useState, useEffect, useRef } from 'react';
import HeroSlider from '@/components/HeroSlider';
import MovieListingClient from '@/components/MovieListingClient';
import { useParams } from 'next/navigation';
import { API_BASE_URL, CDN_FALLBACK, HERO_SLIDER_COUNT } from '@/constants/config';

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
            `${API_BASE_URL}/danh-sach/${slug}?page=${page}`,
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

      // Bước 1: Fetch trang 1, hiển thị ngay
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
      cdnSaved = firstJson.data.APP_DOMAIN_CDN_IMAGE || CDN_FALLBACK;

      setCdnUrl(cdnSaved);
      setMovies(firstItems);
      setTotalLoaded(firstItems.length);
      setLoading(false);

      // Bước 2: Fetch trang 2–10 song song ngầm
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

  const sliderMovies = movies.slice(0, HERO_SLIDER_COUNT);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <HeroSlider movies={sliderMovies} cdnUrl={cdnUrl} />

      <div className="listing-page-header">
        <h1 className="listing-page-title">{title}</h1>
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

      <div className="listing-page-body">
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
            title={title}
            allowFiltering={true}
            sortOptions={['year', 'rating']}
          />
        )}
      </div>
    </div>
  );
}
