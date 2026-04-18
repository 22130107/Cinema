import ClientPlayer from '@/components/ClientPlayer';
import { fetchMovieDetail } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { REVALIDATE_TIME } from '@/constants/config';

export default async function MovieDetail({ params }) {
  const { slug } = await params;
  const { movie, episodes, cdnUrl } = await fetchMovieDetail(slug, {
    next: { revalidate: REVALIDATE_TIME },
  });

  if (!movie) return <div className="empty-state">Không tìm thấy phim.</div>;

  // Tạo URL tuyệt đối cho ảnh
  movie.thumb_url = getImageUrl(movie.thumb_url, cdnUrl);
  movie.poster_url = getImageUrl(movie.poster_url || movie.thumb_url, cdnUrl);

  return (
    <div className="movie-detail-page animate-fade-in">
      <ClientPlayer movie={movie} episodes={episodes} />
    </div>
  );
}
