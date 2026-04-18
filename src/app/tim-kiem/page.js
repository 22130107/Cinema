import MovieListingClient from '@/components/MovieListingClient';
import { searchMovies } from '@/lib/api';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  return { title: `Tìm kiếm: ${sp?.keyword || ''} | FLIX` };
}

export default async function TimKiemPage({ searchParams }) {
  const sp = await searchParams;
  const keyword = sp?.keyword || '';

  let movies = [];
  let cdnUrl = '';
  const title = `Kết quả tìm kiếm cho: "${keyword}"`;

  if (keyword) {
    const result = await searchMovies(keyword);
    movies = result.movies;
    cdnUrl = result.cdnUrl;
  }

  return (
    <div className="listing-page" style={{ paddingBottom: '40px' }}>
      <div style={{ padding: '120px 4vw 0' }}>
        <h1 className="listing-page-title">{title}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Lấy được {movies.length} kết quả</p>
      </div>

      <div className="listing-page-body">
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
