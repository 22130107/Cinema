import MovieListingClient from '../../components/MovieListingClient';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  return { title: `Tìm kiếm: ${sp?.keyword || ''} | FLIX` };
}

export default async function TimKiemPage({ searchParams }) {
  const sp = await searchParams;
  const keyword = sp?.keyword || '';

  let movies = [];
  let cdnUrl = '';
  let title = `Kết quả tìm kiếm cho: "${keyword}"`;

  if (keyword) {
    try {
      let allMovies = [];
      
      // Fetch multiple pages to ensure comprehensive search results for filtering
      for (let page = 1; page <= 3; page++) {
        const res = await fetch(
          `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`,
          { next: { revalidate: 3600 } }
        );
        const json = await res.json();

        if (json.status === 'success') {
          allMovies = [...allMovies, ...(json.data.items || [])];
          cdnUrl = json.data.APP_DOMAIN_CDN_IMAGE || cdnUrl || 'https://img.ophim.live';
        }
      }

      movies = allMovies;
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err);
    }
  }

  return (
    <div className="listing-page" style={{ paddingBottom: '40px' }}>
      <div style={{ padding: '120px 4vw 0' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Lấy được {movies.length} kết quả</p>
      </div>

      <div style={{ padding: '0 4vw' }}>
        <MovieListingClient 
          movies={movies} 
          cdnUrl={cdnUrl} 
          title={title} 
          allowFiltering={true}
          sortOptions={['year', 'rating']}
        />
      </div>
    </div>
  );
}
