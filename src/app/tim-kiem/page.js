import MovieGrid from '../../components/MovieGrid';
import Pagination from '../../components/Pagination';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  return { title: `Tìm kiếm: ${sp?.keyword || ''} | FLIX` };
}

export default async function TimKiemPage({ searchParams }) {
  const sp = await searchParams;
  const keyword = sp?.keyword || '';
  const page = Number(sp?.page) || 1;

  let movies = [];
  let cdnUrl = '';
  let title = `Kết quả tìm kiếm cho: "${keyword}"`;
  let totalPages = 1;

  if (keyword) {
    try {
      const res = await fetch(
        `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`,
        { next: { revalidate: 3600 } }
      );
      const json = await res.json();

      if (json.status === 'success') {
        movies = json.data.items || [];
        cdnUrl = json.data.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';

        const pagination = json.data.params?.pagination;
        if (pagination) {
          totalPages =
            pagination.totalPages ||
            Math.ceil(pagination.totalItems / pagination.totalItemsPerPage) ||
            1;
        }
      }
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err);
    }
  }

  return (
    <div className="listing-page" style={{ paddingBottom: '40px' }}>
      <div style={{ padding: '120px 4vw 0' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Trang {page} / {totalPages} • Lấy được {movies.length} kết quả</p>
      </div>

      <MovieGrid movies={movies} cdnUrl={cdnUrl} title="" />

      {movies.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={`/tim-kiem`}
          extraParams={{ keyword }}
        />
      )}
    </div>
  );
}
