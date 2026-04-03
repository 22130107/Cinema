import HeroSlider from '../../../components/HeroSlider';
import MovieListingClient from '../../../components/MovieListingClient';

export async function generateMetadata({ params }) {
  const { year } = await params;
  return {
    title: `Phim Năm ${year} | FLIX`,
    description: `Xem phim hay nhất năm ${year} - cập nhật mới nhất, vietsub và thuyết minh.`,
  };
}

export default async function NamPage({ params, searchParams }) {
  const { year } = await params;
  const sp = await searchParams;

  let movies = [];
  let cdnUrl = 'https://img.ophim.live';

  try {
    // OPhim API hỗ trợ lọc theo năm qua danh-sach với filter nam
    // Fetch multiple pages to get comprehensive movie list for filtering
    let combined = [];
    const seenIds = new Set(); // Remove duplicates

    // Fetch phim-bo (3 pages = ~72 movies)
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(
        `https://ophim1.com/v1/api/danh-sach/phim-bo?nam=${year}&page=${page}`,
        { next: { revalidate: 1800 } }
      );
      const json = await res.json();
      if (json.status === 'success') {
        const uniqueMovies = (json.data.items || []).filter(movie => {
          if (seenIds.has(movie._id)) return false;
          seenIds.add(movie._id);
          return true;
        });
        combined = [...combined, ...uniqueMovies];
        if (!cdnUrl || cdnUrl === 'https://img.ophim.live') {
          cdnUrl = json.data.APP_DOMAIN_CDN_IMAGE || cdnUrl;
        }
      }
    }

    // Fetch phim-le (3 pages = ~72 movies)
    for (let page = 1; page <= 3; page++) {
      const res2 = await fetch(
        `https://ophim1.com/v1/api/danh-sach/phim-le?nam=${year}&page=${page}`,
        { next: { revalidate: 1800 } }
      );
      const json2 = await res2.json();
      if (json2.status === 'success') {
        const uniqueMovies = (json2.data.items || []).filter(movie => {
          if (seenIds.has(movie._id)) return false;
          seenIds.add(movie._id);
          return true;
        });
        combined = [...combined, ...uniqueMovies];
        if (!cdnUrl || cdnUrl === 'https://img.ophim.live') {
          cdnUrl = json2.data.APP_DOMAIN_CDN_IMAGE || cdnUrl;
        }
      }
    }

    // Xáo trộn để trộn phim bộ và phim lẻ
    movies = combined.sort(() => Math.random() - 0.5);

  } catch (err) {
    console.error('Lỗi trang năm phát hành:', err);
  }

  const sliderMovies = movies.slice(0, 8);

  return (
    <div className="listing-page" style={{ paddingBottom: '40px' }}>
      <HeroSlider movies={sliderMovies} cdnUrl={cdnUrl} />

      <div style={{ padding: '40px 4vw 0' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>
          🎬 Phim Năm {year}
        </h1>
      </div>

      <div style={{ padding: '0 4vw' }}>
        <MovieListingClient movies={movies} cdnUrl={cdnUrl} title={`Phim Năm ${year}`} allowFiltering={true} />
      </div>
    </div>
  );
}
