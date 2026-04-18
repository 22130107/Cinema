'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMovieRating, getImageUrl } from '@/lib/utils';

export default function MovieListingClient({
  initialMovies,
  movies,
  cdnUrl,
  title,
  allowFiltering = true,
  sortOptions = ['year', 'rating'],
  itemsPerPage = 24
}) {
  const movieList = initialMovies || movies || [];
  const [sortBy, setSortBy] = useState(sortOptions[0] || 'year');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);

  // Available options
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [years, setYears] = useState([]);

  // Extract filter options from movies
  useEffect(() => {
    const genresSet = new Set();
    const countriesSet = new Set();
    const yearsSet = new Set();

    movieList.forEach(movie => {
      if (Array.isArray(movie.category)) {
        movie.category.forEach(cat => {
          if (cat?.name && cat?.slug) genresSet.add(JSON.stringify(cat));
        });
      }
      if (Array.isArray(movie.country)) {
        movie.country.forEach(c => {
          if (c?.name && c?.slug) countriesSet.add(JSON.stringify(c));
        });
      }
      if (movie.year) {
        const year = parseInt(movie.year, 10);
        const currentYear = new Date().getFullYear();
        if (!isNaN(year) && year > 1900 && year <= currentYear + 1) {
          yearsSet.add(year);
        }
      }
    });

    setGenres(Array.from(genresSet).map(g => JSON.parse(g)).sort((a, b) => a.name.localeCompare(b.name)));
    setCountries(Array.from(countriesSet).map(c => JSON.parse(c)).sort((a, b) => a.name.localeCompare(b.name)));
    setYears(Array.from(yearsSet).sort((a, b) => b - a));
  }, [movieList]);

  // Filter and sort movies
  const filteredMovies = movieList
    .filter(movie => {
      if (!allowFiltering) return true;
      if (!movie._id || !movie.name) return false;

      if (selectedGenres.length > 0) {
        const movieCategories = movie.category || [];
        if (!selectedGenres.some(g => movieCategories.some(c => c?.name === g))) return false;
      }
      if (selectedCountries.length > 0) {
        const movieCountries = movie.country || [];
        if (!selectedCountries.some(c => movieCountries.some(cnt => cnt?.name === c))) return false;
      }
      if (selectedYears.length > 0) {
        if (!selectedYears.includes(parseInt(movie.year, 10))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'year') {
        const yearDiff = (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
        if (yearDiff !== 0) return yearDiff;
        return (getMovieRating(b) ?? 0) - (getMovieRating(a) ?? 0);
      }
      if (sortBy === 'rating') {
        return (getMovieRating(b) ?? 0) - (getMovieRating(a) ?? 0);
      }
      return 0;
    });

  const toggleFilter = (setter) => (value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedGenres([]);
    setSelectedCountries([]);
    setSelectedYears([]);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovies = filteredMovies.slice(startIndex, startIndex + itemsPerPage);
  const hasActiveFilters = selectedGenres.length > 0 || selectedCountries.length > 0 || selectedYears.length > 0;

  return (
    <div className="listing-client">
      {/* Filter Section */}
      {allowFiltering && genres.length > 0 && (
        <div className="listing-filters">
          {/* Sort By */}
          <div className="filter-group">
            <h3 className="filter-label">Sắp xếp</h3>
            <div className="filter-options">
              {[
                { value: 'year', label: 'Năm sản xuất' },
                { value: 'rating', label: 'Điểm đánh giá' },
              ]
                .filter(opt => sortOptions.includes(opt.value))
                .map(option => (
                  <button
                    key={option.value}
                    className={`filter-btn filter-btn-sort ${sortBy === option.value ? 'active' : ''}`}
                    onClick={() => setSortBy(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
            </div>
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="filter-group">
              <h3 className="filter-label">Thể loại</h3>
              <div className="filter-options">
                {genres.slice(0, 12).map(genre => (
                  <button
                    key={genre.slug}
                    className={`filter-btn ${selectedGenres.includes(genre.name) ? 'selected' : ''}`}
                    onClick={() => toggleFilter(setSelectedGenres)(genre.name)}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Countries */}
          {countries.length > 0 && (
            <div className="filter-group">
              <h3 className="filter-label">Quốc gia</h3>
              <div className="filter-options">
                {countries.slice(0, 10).map(country => (
                  <button
                    key={country.slug}
                    className={`filter-btn ${selectedCountries.includes(country.name) ? 'selected' : ''}`}
                    onClick={() => toggleFilter(setSelectedCountries)(country.name)}
                  >
                    {country.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Years */}
          {years.length > 0 && (
            <div className="filter-group">
              <h3 className="filter-label">Năm sản xuất</h3>
              <div className="filter-options">
                {years.slice(0, 15).map(year => (
                  <button
                    key={year}
                    className={`filter-btn ${selectedYears.includes(year) ? 'selected' : ''}`}
                    onClick={() => toggleFilter(setSelectedYears)(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button className="filter-btn filter-btn-reset" onClick={resetFilters}>
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Movies Grid */}
      <div className="listing-results">
        <h2 className="listing-results-title">
          Kết quả: {filteredMovies.length} phim {totalPages > 1 && `(Trang ${currentPage}/${totalPages})`}
        </h2>

        {filteredMovies.length > 0 ? (
          <>
            <div className="listing-grid">
              {paginatedMovies.map(movie => {
                const rating = getMovieRating(movie);
                const imgSrc = getImageUrl(movie.thumb_url, cdnUrl);

                return (
                  <Link href={`/phim/${movie.slug}`} key={movie._id} className="listing-card">
                    <div className="listing-card-poster">
                      <img src={imgSrc} alt={movie.name} loading="lazy" />
                      {movie.quality && <span className="quality-tag">{movie.quality}</span>}
                      {rating !== null && (
                        <span className="rating-tag">&#11088; {rating.toFixed(1)}</span>
                      )}
                      <div className="listing-card-overlay">
                        <h3 className="listing-card-title">{movie.name}</h3>
                        {movie.year && <p className="listing-card-year">{movie.year}</p>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="listing-pagination">
                <button
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="listing-empty">Không tìm thấy phim nào</div>
        )}
      </div>
    </div>
  );
}
