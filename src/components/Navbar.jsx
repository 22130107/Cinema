"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { GENRES, COUNTRIES, MOVIE_LISTS } from '@/constants/navigation';
import { API_BASE_URL } from '@/constants/config';
import { getImageUrl } from '@/lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestCdnUrl, setSuggestCdnUrl] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng dropdown khi chuyển trang
  useEffect(() => {
    setActiveDropdown(null);
    setShowSearch(false);
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchQuery('');
  }, [pathname]);

  // Gợi ý tìm kiếm (AJAX) - giới hạn 5 phim
  useEffect(() => {
    if (!showSearch) return;

    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    setIsSuggesting(true);

    const handle = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `${API_BASE_URL}/tim-kiem?keyword=${encodeURIComponent(q)}&page=1`,
          { signal: controller.signal }
        );
        const json = await res.json();

        if (json?.status === 'success') {
          setSuggestCdnUrl(json?.data?.APP_DOMAIN_CDN_IMAGE || '');
          const items = Array.isArray(json?.data?.items) ? json.data.items : [];
          setSuggestions(items.slice(0, 9));
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setIsSuggesting(false);
      }
    }, 250);

    return () => {
      clearTimeout(handle);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [searchQuery, showSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tim-kiem?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setShowSuggestions(false);
      setSuggestions([]);
      setSearchQuery('');
    }
  };

  const handleSelectSuggestion = (slug) => {
    if (!slug) return;
    router.push(`/phim/${slug}`);
    setShowSearch(false);
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchQuery('');
  };

  const closeSearch = () => {
    if (abortRef.current) abortRef.current.abort();
    setShowSearch(false);
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchQuery('');
  };

  const toggleDropdown = (name) => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} ref={navRef}>
      <div className="nav-left">
        <Link href="/" className="logo">FLIX</Link>

        <ul className="nav-links">
          <li><Link href="/" className={pathname === '/' ? 'active' : ''}>Trang Chủ</Link></li>

          {/* Danh Sách Dropdown */}
          <li className="dropdown">
            <button
              className={`dropdown-trigger ${activeDropdown === 'list' ? 'open' : ''}`}
              onClick={() => toggleDropdown('list')}
            >
              Danh Sách <ChevronDown size={14} className="chevron" />
            </button>
            {activeDropdown === 'list' && (
              <div className="dropdown-content movie-list-grid">
                {MOVIE_LISTS.map(item => (
                  <Link key={item.slug} href={`/${item.slug}`} onClick={() => setActiveDropdown(null)}>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </li>

          {/* Thể Loại Dropdown */}
          <li className="dropdown">
            <button
              className={`dropdown-trigger ${activeDropdown === 'genre' ? 'open' : ''}`}
              onClick={() => toggleDropdown('genre')}
            >
              Thể Loại <ChevronDown size={14} className="chevron" />
            </button>
            {activeDropdown === 'genre' && (
              <div className="dropdown-content genre-grid">
                {GENRES.map(g => (
                  <Link key={g.slug} href={`/the-loai/${g.slug}`} onClick={() => setActiveDropdown(null)}>
                    {g.name}
                  </Link>
                ))}
              </div>
            )}
          </li>

          {/* Quốc Gia Dropdown */}
          <li className="dropdown">
            <button
              className={`dropdown-trigger ${activeDropdown === 'country' ? 'open' : ''}`}
              onClick={() => toggleDropdown('country')}
            >
              Quốc Gia <ChevronDown size={14} className="chevron" />
            </button>
            {activeDropdown === 'country' && (
              <div className="dropdown-content country-grid">
                {COUNTRIES.map(c => (
                  <Link key={c.slug} href={`/quoc-gia/${c.slug}`} onClick={() => setActiveDropdown(null)}>
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </li>
        </ul>
      </div>

      <div className="nav-right">
        {showSearch ? (
          <form onSubmit={handleSearch} className="search-form">
            <input
              autoFocus
              type="text"
              placeholder="Nhập tên phim..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="search-input"
            />
            <button type="button" className="icon-btn search-close" onClick={closeSearch}>
              <X size={18} />
            </button>

            {showSuggestions && (suggestions.length > 0 || isSuggesting) && (
              <div className="search-suggestions" role="listbox">
                {isSuggesting && suggestions.length === 0 ? (
                  <div className="search-suggestion muted">Đang tìm...</div>
                ) : (
                  suggestions.map((movie) => {
                    const imgSrc = getImageUrl(movie.thumb_url, suggestCdnUrl);
                    return (
                      <div key={movie?._id || movie?.slug} className="search-suggestion-wrapper">
                        <button
                          type="button"
                          className="search-suggestion"
                          role="option"
                          aria-selected="false"
                          onClick={() => handleSelectSuggestion(movie?.slug)}
                        >
                          <span className="search-suggestion-title">{movie?.name || 'Không có tên'}</span>
                          {movie?.year ? (
                            <span className="search-suggestion-meta">{movie.year}</span>
                          ) : null}
                        </button>
                        
                        <div className="search-suggestion-preview">
                           <img src={imgSrc} alt={movie?.name || 'Poster'} className="search-preview-img"/>
                           <div className="search-preview-info">
                             <div className="preview-title">{movie?.name}</div>
                             <div className="preview-meta">
                               {movie?.origin_name && <span>{movie.origin_name}</span>}
                               {movie?.year && <span>Năm: {movie.year}</span>}
                               {movie?.quality && <span>Chất lượng: {movie.quality}</span>}
                             </div>
                           </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </form>
        ) : (
          <button className="icon-btn" onClick={() => setShowSearch(true)} aria-label="Tìm kiếm">
            <Search size={22} />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
