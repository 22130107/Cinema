'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MovieListingClient({ 
  initialMovies, 
  movies, 
  cdnUrl, 
  title, 
  allowFiltering = true,
  sortOptions = ['year', 'rating'],
  itemsPerPage = 24
}) {
  const getMovieRatingNumber = (movie) => {
    const tmdb = Number(movie?.tmdb?.vote_average);
    if (Number.isFinite(tmdb) && tmdb > 0) return tmdb;

    const imdb = Number(movie?.imdb?.vote_average);
    if (Number.isFinite(imdb) && imdb > 0) return imdb;

    return null;
  };

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
      // Extract genres
      if (Array.isArray(movie.category)) {
        movie.category.forEach(cat => {
          if (cat?.name && cat?.slug) {
            genresSet.add(JSON.stringify(cat));
          }
        });
      }

      // Extract countries
      if (Array.isArray(movie.country)) {
        movie.country.forEach(c => {
          if (c?.name && c?.slug) {
            countriesSet.add(JSON.stringify(c));
          }
        });
      }

      // Extract and validate years
      if (movie.year) {
        const year = parseInt(movie.year, 10);
        const currentYear = new Date().getFullYear();
        if (!isNaN(year) && year > 1900 && year <= currentYear + 1) {
          yearsSet.add(year);
        }
      }
    });

    setGenres(Array.from(genresSet)
      .map(g => JSON.parse(g))
      .sort((a, b) => a.name.localeCompare(b.name)));
    
    setCountries(Array.from(countriesSet)
      .map(c => JSON.parse(c))
      .sort((a, b) => a.name.localeCompare(b.name)));
    
    setYears(Array.from(yearsSet).sort((a, b) => b - a));
  }, [movieList]);

  // Filter and sort movies
  const filteredMovies = movieList
    .filter(movie => {
      if (!allowFiltering) return true;

      // Ensure movie has valid data
      if (!movie._id || !movie.name) return false;

      // Filter by genres
      if (selectedGenres.length > 0) {
        const movieCategories = movie.category || [];
        const hasGenre = selectedGenres.some(g =>
          movieCategories.some(c => c?.name === g)
        );
        if (!hasGenre) return false;
      }

      // Filter by countries
      if (selectedCountries.length > 0) {
        const movieCountries = movie.country || [];
        const hasCountry = selectedCountries.some(c =>
          movieCountries.some(cnt => cnt?.name === c)
        );
        if (!hasCountry) return false;
      }

      // Filter by years
      if (selectedYears.length > 0) {
        const movieYear = parseInt(movie.year, 10);
        if (!selectedYears.includes(movieYear)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'year') {
        const yearDiff = (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
        if (yearDiff !== 0) return yearDiff;
        const ratingA = getMovieRatingNumber(a) ?? 0;
        const ratingB = getMovieRatingNumber(b) ?? 0;
        return ratingB - ratingA;
      }
      if (sortBy === 'rating') {
        const ratingA = getMovieRatingNumber(a) ?? 0;
        const ratingB = getMovieRatingNumber(b) ?? 0;
        return ratingB - ratingA;
      }
      return 0;
    });

  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
    setCurrentPage(1);
  };

  const toggleCountry = (country) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
    setCurrentPage(1);
  };

  const toggleYear = (year) => {
    setSelectedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedGenres([]);
    setSelectedCountries([]);
    setSelectedYears([]);
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

  return (
    <div>
      {/* Filter Section */}
      {allowFiltering && genres.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          {/* Sort By */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '15px', color: '#ccc', fontWeight: '600' }}>
              Sắp xếp
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { value: 'year', label: 'Năm sản xuất' },
                { value: 'rating', label: 'Điểm đánh giá' },
              ]
                .filter(opt => sortOptions.includes(opt.value))
                .map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    style={{
                      padding: '8px 16px',
                      background: sortBy === option.value ? '#e74c3c' : 'rgba(255,255,255,0.1)',
                      color: sortBy === option.value ? 'white' : 'rgba(255,255,255,0.7)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
            </div>
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '15px', color: '#ccc', fontWeight: '600' }}>
                Thể loại
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {genres.slice(0, 12).map(genre => (
                  <button
                    key={genre.slug}
                    onClick={() => toggleGenre(genre.name)}
                    style={{
                      padding: '6px 12px',
                      background: selectedGenres.includes(genre.name)
                        ? 'rgba(229,9,20,0.3)'
                        : 'rgba(255,255,255,0.08)',
                      color: selectedGenres.includes(genre.name) ? '#ff8c00' : 'rgba(255,255,255,0.7)',
                      border: selectedGenres.includes(genre.name)
                        ? '1px solid #ff8c00'
                        : '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Countries */}
          {countries.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '15px', color: '#ccc', fontWeight: '600' }}>
                Quốc gia
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {countries.slice(0, 10).map(country => (
                  <button
                    key={country.slug}
                    onClick={() => toggleCountry(country.name)}
                    style={{
                      padding: '6px 12px',
                      background: selectedCountries.includes(country.name)
                        ? 'rgba(229,9,20,0.3)'
                        : 'rgba(255,255,255,0.08)',
                      color: selectedCountries.includes(country.name) ? '#ff8c00' : 'rgba(255,255,255,0.7)',
                      border: selectedCountries.includes(country.name)
                        ? '1px solid #ff8c00'
                        : '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {country.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Years */}
          {years.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '15px', color: '#ccc', fontWeight: '600' }}>
                Năm sản xuất
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {years.slice(0, 15).map(year => (
                  <button
                    key={year}
                    onClick={() => toggleYear(year)}
                    style={{
                      padding: '6px 12px',
                      background: selectedYears.includes(year)
                        ? 'rgba(229,9,20,0.3)'
                        : 'rgba(255,255,255,0.08)',
                      color: selectedYears.includes(year) ? '#ff8c00' : 'rgba(255,255,255,0.7)',
                      border: selectedYears.includes(year)
                        ? '1px solid #ff8c00'
                        : '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reset Filters */}
          {(selectedGenres.length > 0 || selectedCountries.length > 0 || selectedYears.length > 0) && (
            <button
              onClick={resetFilters}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              ← Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Movies Grid */}
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#ccc' }}>
          Kết quả: {filteredMovies.length} phim {totalPages > 1 && `(Trang ${currentPage}/${totalPages})`}
        </h2>

        {filteredMovies.length > 0 ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '15px',
            }}>
              {paginatedMovies.map(movie => {
                const rating = getMovieRatingNumber(movie);
                return (
                  <Link
                    href={`/phim/${movie.slug}`}
                    key={movie._id}
                    style={{
                      textDecoration: 'none',
                      color: 'white',
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      marginBottom: '8px',
                    }}>
                      <img
                        src={`${cdnUrl}/uploads/movies/${movie.thumb_url}`}
                        alt={movie.name}
                        style={{
                          width: '100%',
                          aspectRatio: '2/3',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                      />
                      {movie.quality && (
                        <span style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: '#e74c3c',
                          color: 'white',
                          padding: '3px 6px',
                          borderRadius: '3px',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                        }}>
                          {movie.quality}
                        </span>
                      )}
                      {rating !== null && (
                        <span style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#ffd700',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                        }}>
                          ⭐ {rating.toFixed(1)}
                        </span>
                      )}
                      {/* Gradient overlay with title and year */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                        padding: '20px 8px 8px 8px',
                        borderRadius: '0 0 8px 8px',
                      }}>
                        <h3 style={{
                          fontSize: '0.8rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          margin: '0',
                          color: '#ffffff',
                          fontWeight: '600',
                        }}>
                          {movie.name}
                        </h3>
                        {movie.year && (
                          <p style={{
                            fontSize: '0.7rem',
                            color: '#aaa',
                            margin: '2px 0 0 0',
                          }}>
                            {movie.year}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '40px',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(229,9,20,0.3)',
                    color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#ff8c00',
                    border: currentPage === 1 ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ff8c00',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'default' : 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                  }}
                >
                  ← Trước
                </button>

                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: '6px 12px',
                        background: currentPage === page ? 'rgba(229,9,20,0.5)' : 'rgba(255,255,255,0.08)',
                        color: currentPage === page ? '#ff8c00' : 'rgba(255,255,255,0.7)',
                        border: currentPage === page ? '1px solid #ff8c00' : '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: currentPage === page ? '600' : '400',
                        minWidth: '32px',
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(229,9,20,0.3)',
                    color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#ff8c00',
                    border: currentPage === totalPages ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ff8c00',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'default' : 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                  }}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Không tìm thấy phim nào
          </div>
        )}
      </div>
    </div>
  );
}
