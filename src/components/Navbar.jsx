"use client";

import { useState, useEffect } from 'react';
import { Search, Bell, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('https://ophim1.com/v1/api/the-loai').then(res => res.json()),
      fetch('https://ophim1.com/v1/api/quoc-gia').then(res => res.json())
    ]).then(([catData, countryData]) => {
      if (catData.status === 'success') setCategories(catData.data.items);
      if (countryData.status === 'success') setCountries(countryData.data.items);
    }).catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      router.push(`/tim-kiem?keyword=${searchQuery}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        <Link href="/" className="logo">FLIX</Link>
        <ul className="nav-links">
          <li><Link href="/">Trang Chủ</Link></li>
          <li className="dropdown">
            <span>Thể Loại</span>
            <div className="dropdown-content">
              {categories.slice(0, 15).map(cat => (
                <Link key={cat._id} href={`/the-loai/${cat.slug}`}>{cat.name}</Link>
              ))}
            </div>
          </li>
          <li className="dropdown">
            <span>Quốc Gia</span>
            <div className="dropdown-content">
              {countries.slice(0, 15).map(country => (
                <Link key={country._id} href={`/quoc-gia/${country.slug}`}>{country.name}</Link>
              ))}
            </div>
          </li>
          <li><Link href="/danh-sach/phim-moi">Phim Mới</Link></li>
          <li><Link href="/danh-sach/phim-bo">Phim Bộ</Link></li>
          <li><Link href="/danh-sach/phim-le">Phim Lẻ</Link></li>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="button" className="icon-btn search-close" onClick={() => setShowSearch(false)}>
              <X size={20} />
            </button>
          </form>
        ) : (
          <button className="icon-btn" onClick={() => setShowSearch(true)}>
            <Search size={22} />
          </button>
        )}
        <button className="icon-btn"><Bell size={22} /></button>
        <div className="profile-placeholder"></div>
      </div>
    </nav>
  );
};

export default Navbar;
