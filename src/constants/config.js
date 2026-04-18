// ============================================
// Cấu hình chung cho toàn bộ ứng dụng
// ============================================

/** Base URL của OPhim API */
export const API_BASE_URL = 'https://ophim1.com/v1/api';

/** CDN fallback khi API không trả về CDN URL */
export const CDN_FALLBACK = 'https://img.ophim.live';

/** Thời gian cache cho Server Components (giây) */
export const REVALIDATE_TIME = 3600;

/** Số trang tối đa khi fetch danh sách phim */
export const MAX_PAGES_LISTING = 10;

/** Số trang fetch cho thể loại / quốc gia */
export const MAX_PAGES_CATEGORY = 3;

/** Số phim hiển thị trên hero slider */
export const HERO_SLIDER_COUNT = 8;

/** Thời gian tự chuyển slide (ms) */
export const HERO_AUTO_INTERVAL = 8000;
