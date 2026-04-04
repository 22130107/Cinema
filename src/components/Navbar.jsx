"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

// Danh sách thể loại tĩnh khớp với OPhim API slugs
const GENRES = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Hài Hước', slug: 'hai-huoc' },
  { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Tâm Lý', slug: 'tam-ly' },
  { name: 'Hình Sự', slug: 'hinh-su' },
  { name: 'Chiến Tranh', slug: 'chien-tranh' },
  { name: 'Thể Thao', slug: 'the-thao' },
  { name: 'Võ Thuật', slug: 'vo-thuat' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { name: 'Khoa Học', slug: 'khoa-hoc' },
  { name: 'Ma - Kinh Dị', slug: 'kinh-di' },
  { name: 'Âm Nhạc', slug: 'am-nhac' },
  { name: 'Thần Thoại', slug: 'than-thoai' },
  { name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { name: 'Truyền Hình', slug: 'truyen-hinh' },
  { name: 'Chiếu Rạp', slug: 'phim-chieu-rap' },
  { name: 'Anime', slug: 'anime' },
  { name: 'Thuyết Minh', slug: 'thuyet-minh' },
  { name: 'Gia Đình', slug: 'gia-dinh' },
  { name: 'Tài Liệu', slug: 'tai-lieu' },
  { name: 'Bí Ẩn', slug: 'bi-an' },
  { name: 'Lịch Sử', slug: 'lich-su' },
  { name: 'Tội Phạm', slug: 'toi-pham' },
  { name: 'Giật Gân', slug: 'giat-gan' },
  { name: 'Học Đường', slug: 'hoc-duong' },
  { name: 'Đam Mỹ', slug: 'dam-my' },
  { name: 'Bách Hợp', slug: 'bach-hop' },
  { name: 'Xuyên Không', slug: 'xuyen-khong' },
  { name: 'Chuyển Thể', slug: 'chuyen-the' },
  { name: 'Siêu Nhiên', slug: 'sieu-nhien' },
  { name: 'Tiểu Sử', slug: 'tieu-su' },
  { name: 'Sitcom', slug: 'sitcom' },
];

// Quốc gia khớp với OPhim API slugs
const COUNTRIES = [
  { name: 'Trung Quốc', slug: 'trung-quoc' },
  { name: 'Hàn Quốc', slug: 'han-quoc' },
  { name: 'Nhật Bản', slug: 'nhat-ban' },
  { name: 'Âu Mỹ', slug: 'au-my' },
  { name: 'Thái Lan', slug: 'thai-lan' },
  { name: 'Đài Loan', slug: 'dai-loan' },
  { name: 'Hồng Kông', slug: 'hong-kong' },
  { name: 'Ấn Độ', slug: 'an-do' },
  { name: 'Anh', slug: 'anh' },
  { name: 'Pháp', slug: 'phap' },
  { name: 'Đức', slug: 'duc' },
  { name: 'Tây Ban Nha', slug: 'tay-ban-nha' },
  { name: 'Nga', slug: 'nga' },
  { name: 'Thổ Nhĩ Kỳ', slug: 'tho-nhi-ky' },
  { name: 'Indonesia', slug: 'indonesia' },
  { name: 'Philippines', slug: 'philippines' },
  { name: 'Ý', slug: 'y' },
  { name: 'Úc', slug: 'uc' },
  { name: 'Canada', slug: 'canada' },
  { name: 'Tổng Hợp', slug: 'tong-hop' },
];

// Năm phát hành
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);

// Top Phim (dùng danh-sach API)
const TOP_SECTIONS = [
  { name: 'Phim HOT', slug: 'phim-bo', label: 'Phim Bộ HOT' },
  { name: 'Phim Lẻ', slug: 'phim-le', label: 'Phim Lẻ' },
  { name: 'Phim Bộ', slug: 'phim-bo', label: 'Phim Bộ' },
  { name: 'Phim Hoàn Tất', slug: 'phim-bo-da-hoan-thanh', label: 'Hoàn Tất' },
  { name: 'Phim Đang Chiếu', slug: 'phim-dang-chieu', label: 'Đang Chiếu' },
  { name: 'Phim Sắp Chiếu', slug: 'phim-sap-chieu', label: 'Sắp Chiếu' },
];

// Danh Sách Phim
const MOVIE_LISTS = [
  { name: 'Phim Mới', slug: 'danh-sach/phim-moi' },
  { name: 'Phim Bộ', slug: 'danh-sach/phim-bo' },
  { name: 'Phim Lẻ', slug: 'danh-sach/phim-le' },
  { name: 'Shows', slug: 'danh-sach/shows' },
  { name: 'Hoạt Hình', slug: 'danh-sach/hoat-hinh' },
  { name: 'Phim Vietsub', slug: 'danh-sach/vietsub' },
  { name: 'Phim Thuyết Minh', slug: 'danh-sach/thuyet-minh' },
  { name: 'Phim Lồng Tiếng', slug: 'danh-sach/long-tieng' },
  { name: 'Phim Bộ Đã Hoàn Thành', slug: 'danh-sach/phim-bo-da-hoan-thanh' },
  { name: 'Phim Bộ Đang Chiếu', slug: 'danh-sach/phim-bo-dang-chieu' },
  { name: 'Phim Sắp Chiếu', slug: 'danh-sach/phim-sap-chieu' },
  { name: 'Phim Chiếu Rạp', slug: 'danh-sach/phim-chieu-rap' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
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
          `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(q)}&page=1`,
          { signal: controller.signal }
        );
        const json = await res.json();

        if (json?.status === 'success') {
          const items = Array.isArray(json?.data?.items) ? json.data.items : [];
          setSuggestions(items.slice(0, 5));
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
                  suggestions.map((movie) => (
                    <button
                      key={movie?._id || movie?.slug}
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
                  ))
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
