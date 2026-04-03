import { Play, Info } from 'lucide-react';
import Link from 'next/link';

function generateSlug(str) {
  str = str.toLowerCase();
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');
  str = str.replace(/([^a-z0-9-\s])/g, '');
  str = str.replace(/(\s+)/g, '-');
  str = str.replace(/^-+/g, '');
  str = str.replace(/-+$/g, '');
  return str;
}

export default async function Home() {
  let moviesByCategory = {};
  let featuredMovie = null;
  let cdnUrl = '';

  try {
    const res = await fetch('https://ophim1.com/v1/api/home', { next: { revalidate: 3600 } });
    const json = await res.json();
    
    if (json.status === 'success') {
      const fetchedMovies = json.data.items;
      cdnUrl = json.data.APP_DOMAIN_CDN_IMAGE;

      if (fetchedMovies.length > 0) {
        featuredMovie = fetchedMovies[0];

        const categoriesObj = {};
        fetchedMovies.forEach(movie => {
          if (movie.category && movie.category.length > 0) {
            movie.category.forEach(cat => {
              if (!categoriesObj[cat.name]) categoriesObj[cat.name] = [];
              categoriesObj[cat.name].push(movie);
            });
          }
        });

        const filteredCategories = {};
        Object.keys(categoriesObj).forEach(cat => {
          if (categoriesObj[cat].length >= 3) {
            filteredCategories[cat] = categoriesObj[cat];
          }
        });
        
        filteredCategories['Phim Mới Cập Nhật'] = fetchedMovies.slice(0, 15);
        moviesByCategory = filteredCategories;
      }
    }
  } catch (err) {
    console.error('Lỗi khi gọi API:', err);
  }

  const billboardImg = featuredMovie ? `${cdnUrl}/uploads/movies/${featuredMovie.thumb_url}` : '';

  return (
    <div className="home-page">
      {/* Billboard Hero Section */}
      {featuredMovie && (
        <header className="billboard" style={{ backgroundImage: `url(${billboardImg})` }}>
          <div className="billboard-vignette"></div>
          <div className="billboard-info">
            <h1 className="billboard-title">{featuredMovie.name}</h1>
            <p className="billboard-desc">
              Một tác phẩm từ {featuredMovie.country.map(c => c.name).join(', ')}. 
              Thể loại: {featuredMovie.category.map(c => c.name).join(', ')}. 
              Năm {featuredMovie.year}.
            </p>
            <div className="billboard-buttons">
              <Link href={`/phim/${featuredMovie.slug}`} className="btn btn-play">
                <Play size={24} fill="currentColor" /> Phát
              </Link>
              <Link href={`/phim/${featuredMovie.slug}`} className="btn btn-more">
                <Info size={24} /> Thông Tin Khác
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Movie Rows */}
      <div className="rows-container">
        {Object.entries(moviesByCategory).map(([category, crMovies]) => (
          <div className="row" key={category}>
            <div className="row-header">
              <h2 className="row-title">{category}</h2>
              <Link href={category === 'Phim Mới Cập Nhật' ? '/danh-sach/phim-moi' : `/the-loai/${generateSlug(category)}`} className="view-all-btn">
                Xem tất cả &#8250;
              </Link>
            </div>
            <div className="row-posters">
              {crMovies.map(movie => (
                <Link href={`/phim/${movie.slug}`} className="poster-card" key={movie._id}>
                  <img 
                    src={`${cdnUrl}/uploads/movies/${movie.thumb_url}`} 
                    alt={movie.name} 
                    className="poster"
                    loading="lazy"
                  />
                  <div className="poster-info-static">
                    <h3 className="poster-title" title={movie.name}>{movie.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
