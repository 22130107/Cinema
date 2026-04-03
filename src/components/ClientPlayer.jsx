"use client";

import { useState } from 'react';
import { Play } from 'lucide-react';

export default function ClientPlayer({ movie, episodes }) {
  const [currentEpisode, setCurrentEpisode] = useState(null);

  if (!currentEpisode) {
    return (
      <div 
        className="detail-hero"
        style={{ backgroundImage: `url(${movie.poster_url})` }}
      >
        <div className="detail-hero-vignette"></div>
        <div className="detail-container">
          <img src={movie.thumb_url} alt={movie.name} className="detail-poster" />
          <div className="detail-info">
            <h1>{movie.name}</h1>
            <p className="origin-name">{movie.origin_name} ({movie.year})</p>
            
            <div className="meta-tags">
              <span className="quality-badge">{movie.quality}</span>
              <span className="quality-badge">{movie.lang}</span>
              <span>{movie.time}</span>
            </div>

            <div className="desc" dangerouslySetInnerHTML={{ __html: movie.content }} />
            
            <div className="cast-info">
              <p><strong>Đạo diễn:</strong> {movie.director?.join(', ') || 'N/A'}</p>
              <p><strong>Diễn viên:</strong> {movie.actor?.join(', ') || 'N/A'}</p>
              <p><strong>Thể loại:</strong> {movie.category?.map(c => c.name).join(', ')}</p>
              <p><strong>Quốc gia:</strong> {movie.country?.map(c => c.name).join(', ')}</p>
            </div>

            {episodes.length > 0 && episodes[0].server_data && episodes[0].server_data.length > 0 && (
              <button 
                className="btn btn-play view-btn"
                onClick={() => setCurrentEpisode(episodes[0].server_data[0])}
              >
                <Play size={24} fill="currentColor" /> Xem Phim
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If user clicked watch
  return (
    <div className="movie-watch-mode">
      <div className="player-container">
        <iframe 
          src={currentEpisode.link_embed} 
          title="Video player" 
          allowFullScreen 
          className="video-player"
        ></iframe>
      </div>
      
      {/* Episodes List */}
      {episodes.map(server => (
        <div className="episodes-section" key={server.server_name}>
          <h3>Danh sách tập - {server.server_name}</h3>
          <div className="episodes-grid">
            {server.server_data.map(ep => (
              <button 
                key={ep.slug} 
                className={`ep-btn ${currentEpisode?.slug === ep.slug ? 'active' : ''}`}
                onClick={() => {
                  setCurrentEpisode(ep);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {ep.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
