import MovieGrid from './MovieGrid';

export default async function ListServer({ endpoint, fallbackTitle }) {
  let movies = [];
  let cdnUrl = '';
  let title = fallbackTitle;

  try {
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    const json = await res.json();
    
    if (json.status === 'success') {
      movies = json.data.items;
      cdnUrl = json.data.APP_DOMAIN_CDN_IMAGE;
      title = json.data.titlePage || json.data.seoOnPage?.titleHead || title;
    }
  } catch (err) {
    console.error(err);
  }

  return <MovieGrid movies={movies} title={title} cdnUrl={cdnUrl} />;
}
