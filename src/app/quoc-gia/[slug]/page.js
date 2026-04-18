import HeroSlider from '@/components/HeroSlider';
import MovieListingClient from '@/components/MovieListingClient';
import { fetchByCountry } from '@/lib/api';
import { HERO_SLIDER_COUNT } from '@/constants/config';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `Quốc Gia: ${slug} | FLIX` };
}

export default async function QuocGiaPage({ params }) {
  const { slug } = await params;
  const { movies, cdnUrl, title } = await fetchByCountry(slug);
  const sliderMovies = movies.slice(0, HERO_SLIDER_COUNT);
  const pageTitle = title || slug;

  return (
    <div className="listing-page" style={{ paddingBottom: '40px' }}>
      <HeroSlider movies={sliderMovies} cdnUrl={cdnUrl} />

      <div className="listing-page-header">
        <h1 className="listing-page-title">{pageTitle}</h1>
      </div>

      <div className="listing-page-body">
        <MovieListingClient movies={movies} cdnUrl={cdnUrl} title={pageTitle} allowFiltering={true} />
      </div>
    </div>
  );
}
