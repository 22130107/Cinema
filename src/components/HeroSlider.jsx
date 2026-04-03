"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

export default function HeroSlider({ movies, cdnUrl }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 700); // Tương ứng với transition trong CSS nếu có
  }, [animating]);

  const goNext = useCallback(() => {
    if (!movies || movies.length === 0) return;
    goTo((current + 1) % movies.length);
  }, [current, movies, goTo]);

  const goPrev = useCallback(() => {
    if (!movies || movies.length === 0) return;
    goTo((current - 1 + movies.length) % movies.length);
  }, [current, movies, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, 10000); // 10 giây chuyển phim
  }, [goNext]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[current];
  const bg = movie.thumb_url?.startsWith('http')
    ? movie.thumb_url
    : `${cdnUrl}/uploads/movies/${movie.thumb_url}`;

  return (
    <div className="billboard" style={{ backgroundImage: `url(${bg})`, transition: 'background-image 0.5s ease-in-out' }}>
      <div className="billboard-vignette"></div>
      <div className="billboard-info">
        <h1 className="billboard-title">{movie.name}</h1>
        <p className="billboard-desc">
          {movie.origin_name && <span>{movie.origin_name}</span>}
          {movie.year && <span> • Năm {movie.year}</span>}
          {movie.quality && <span> • {movie.quality}</span>}
        </p>
        <div className="billboard-buttons">
          <Link href={`/phim/${movie.slug}`} className="btn btn-play">
             Phát
          </Link>
          <Link href={`/phim/${movie.slug}`} className="btn btn-more">
             Thông Tin Khác
          </Link>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '20px', right: '4vw', display: 'flex', gap: '10px' }}>
        <button onClick={() => { goPrev(); resetTimer(); }} style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>&#8249;</button>
        <button onClick={() => { goNext(); resetTimer(); }} style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>&#8250;</button>
      </div>
    </div>
  );
}
