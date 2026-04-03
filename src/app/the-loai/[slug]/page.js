import HeroSlider from '../../../components/HeroSlider';
import MovieListingClient from '../../../components/MovieListingClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `Thể Loại: ${slug} | FLIX` };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;

  let movies = [];
  let cdnUrl = '';
  let title = slug;

  try {
    // Fetch 3 pages to get ~72 movies for better filtering
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(
        `https://ophim1.com/v1/api/the-loai/${slug}?page=${page}`,
        { next: { revalidate: 3600 } }
      );
      const json = await res.json();

      if (json.status === 'success') {
        movies = [...movies, ...(json.data.items || [])];
        if (!cdnUrl) {
          cdnUrl = json.data.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';
          title = json.data.titlePage || slug;
        }
      }
    }
  } catch (err) {
    console.error('Lỗi trang thể loại:', err);
  }

  const sliderMovies = movies.slice(0, 8);

  return (
    <div className="listing-page" style={{ paddingBottom: '40px' }}>
      {/* Hero Slider */}
      <HeroSlider movies={sliderMovies} cdnUrl={cdnUrl} />

      <div style={{ padding: '40px 4vw 0' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>{title}</h1>
      </div>

      {/* Movies Listing with Filters */}
      <div style={{ padding: '0 4vw' }}>
        <MovieListingClient movies={movies} cdnUrl={cdnUrl} title={title} allowFiltering={true} />
      </div>
    </div>
  );
}
