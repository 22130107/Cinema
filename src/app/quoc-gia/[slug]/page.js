import HeroSlider from '../../../components/HeroSlider';
import MovieGrid from '../../../components/MovieGrid';
import Pagination from '../../../components/Pagination';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `Quốc Gia: ${slug} | FLIX` };
}

export default async function QuocGiaPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number(sp?.page) || 1;

  let movies = [];
  let cdnUrl = '';
  let title = slug;
  let totalPages = 1;

  try {
    const res = await fetch(
      `https://ophim1.com/v1/api/quoc-gia/${slug}?page=${page}`,
      { next: { revalidate: 3600 } }
    );
    const json = await res.json();

    if (json.status === 'success') {
      movies = json.data.items || [];
      cdnUrl = json.data.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';
      title = json.data.titlePage || slug;

      const pagination = json.data.params?.pagination;
      if (pagination) {
        totalPages =
          pagination.totalPages ||
          Math.ceil(pagination.totalItems / pagination.totalItemsPerPage) ||
          1;
      }
    }
  } catch (err) {
    console.error('Lỗi trang quốc gia:', err);
  }

  const sliderMovies = movies.slice(0, 8);

  return (
    <div className="listing-page" style={{ paddingBottom: '40px' }}>
      <HeroSlider movies={sliderMovies} cdnUrl={cdnUrl} />

      <div style={{ padding: '40px 4vw 0' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Trang {page} / {totalPages}</p>
      </div>

      <MovieGrid movies={movies} cdnUrl={cdnUrl} title="" />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/quoc-gia/${slug}`}
      />
    </div>
  );
}
