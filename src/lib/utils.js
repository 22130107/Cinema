// ============================================
// Các hàm tiện ích dùng chung
// ============================================

import { CDN_FALLBACK } from '@/constants/config';

/**
 * Chuyển chuỗi tiếng Việt thành slug URL
 * @param {string} str - Chuỗi cần chuyển
 * @returns {string} slug
 */
export function generateSlug(str) {
  str = str.toLowerCase();
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');
  str = str.replace(/([^a-z0-9-\s])/g, '');
  str = str.replace(/(\s+)/g, '-');
  str = str.replace(/^-+/g, '');
  str = str.replace(/-+$/g, '');
  return str;
}

/**
 * Chuyển path ảnh phim thành URL tuyệt đối
 * @param {string} path - path gốc (có thể là URL đầy đủ hoặc relative)
 * @param {string} cdnUrl - CDN URL base
 * @returns {string} URL tuyệt đối
 */
export function getImageUrl(path, cdnUrl) {
  if (!path) return '';
  if (String(path).startsWith('http')) return path;
  return `${cdnUrl || CDN_FALLBACK}/uploads/movies/${path}`;
}

/**
 * Lấy rating từ movie object (ưu tiên TMDB > IMDB)
 * @param {object} movie - Movie object từ API
 * @returns {number|null} Rating hoặc null
 */
export function getMovieRating(movie) {
  const tmdb = Number(movie?.tmdb?.vote_average);
  if (Number.isFinite(tmdb) && tmdb > 0) return tmdb;

  const imdb = Number(movie?.imdb?.vote_average);
  if (Number.isFinite(imdb) && imdb > 0) return imdb;

  return null;
}

/**
 * Loại bỏ HTML tags khỏi chuỗi
 * @param {string} html - Chuỗi chứa HTML
 * @returns {string} Chuỗi đã loại bỏ HTML
 */
export function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '');
}

/**
 * Normalize chuỗi để so sánh (lowercase, trim)
 * @param {*} s - Giá trị cần normalize
 * @returns {string} Chuỗi đã normalize
 */
export function normalize(s) {
  return (s || '').toString().trim().toLowerCase();
}
