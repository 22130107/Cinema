import ClientPlayer from '../../../components/ClientPlayer';

export default async function MovieDetail({ params }) {
  const { slug } = await params;
  let movie = null;
  let episodes = [];

  try {
    const res = await fetch(`https://ophim1.com/v1/api/phim/${slug}`, { next: { revalidate: 3600 } });
    const json = await res.json();
    
    if (json.status === true || json.status === 'success') {
      const item = json.movie || (json.data && json.data.item);
      const epData = json.episodes || (item && item.episodes) || [];
      
      if (item) {
        const cdnUrl = (json.data && json.data.APP_DOMAIN_CDN_IMAGE) || 'https://img.ophim.live';
        item.thumb_url = `${cdnUrl}/uploads/movies/${item.thumb_url}`;
        item.poster_url = `${cdnUrl}/uploads/movies/${item.poster_url || item.thumb_url.split('/').pop()}`;
      }
      
      movie = item;
      episodes = epData;
    }
  } catch (err) {
    console.error(err);
  }

  if (!movie) return <div className="empty-state">Không tìm thấy phim.</div>;

  return (
    <div className="movie-detail-page animate-fade-in">
      <ClientPlayer movie={movie} episodes={episodes} />
    </div>
  );
}
