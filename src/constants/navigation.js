// ============================================
// Dữ liệu tĩnh cho Navigation (Navbar)
// ============================================

/** Danh sách thể loại - khớp với OPhim API slugs */
export const GENRES = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Hài Hước', slug: 'hai-huoc' },
  { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Tâm Lý', slug: 'tam-ly' },
  { name: 'Hình Sự', slug: 'hinh-su' },
  { name: 'Chiến Tranh', slug: 'chien-tranh' },
  { name: 'Thể Thao', slug: 'the-thao' },
  { name: 'Võ Thuật', slug: 'vo-thuat' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { name: 'Khoa Học', slug: 'khoa-hoc' },
  { name: 'Ma - Kinh Dị', slug: 'kinh-di' },
  { name: 'Âm Nhạc', slug: 'am-nhac' },
  { name: 'Thần Thoại', slug: 'than-thoai' },
  { name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { name: 'Truyền Hình', slug: 'truyen-hinh' },
  { name: 'Chiếu Rạp', slug: 'phim-chieu-rap' },
  { name: 'Anime', slug: 'anime' },
  { name: 'Thuyết Minh', slug: 'thuyet-minh' },
  { name: 'Gia Đình', slug: 'gia-dinh' },
  { name: 'Tài Liệu', slug: 'tai-lieu' },
  { name: 'Bí Ẩn', slug: 'bi-an' },
  { name: 'Lịch Sử', slug: 'lich-su' },
  { name: 'Tội Phạm', slug: 'toi-pham' },
  { name: 'Giật Gân', slug: 'giat-gan' },
  { name: 'Học Đường', slug: 'hoc-duong' },
  { name: 'Đam Mỹ', slug: 'dam-my' },
  { name: 'Bách Hợp', slug: 'bach-hop' },
  { name: 'Xuyên Không', slug: 'xuyen-khong' },
  { name: 'Chuyển Thể', slug: 'chuyen-the' },
  { name: 'Siêu Nhiên', slug: 'sieu-nhien' },
  { name: 'Tiểu Sử', slug: 'tieu-su' },
  { name: 'Sitcom', slug: 'sitcom' },
];

/** Danh sách quốc gia - khớp với OPhim API slugs */
export const COUNTRIES = [
  { name: 'Trung Quốc', slug: 'trung-quoc' },
  { name: 'Hàn Quốc', slug: 'han-quoc' },
  { name: 'Nhật Bản', slug: 'nhat-ban' },
  { name: 'Âu Mỹ', slug: 'au-my' },
  { name: 'Thái Lan', slug: 'thai-lan' },
  { name: 'Đài Loan', slug: 'dai-loan' },
  { name: 'Hồng Kông', slug: 'hong-kong' },
  { name: 'Ấn Độ', slug: 'an-do' },
  { name: 'Anh', slug: 'anh' },
  { name: 'Pháp', slug: 'phap' },
  { name: 'Đức', slug: 'duc' },
  { name: 'Tây Ban Nha', slug: 'tay-ban-nha' },
  { name: 'Nga', slug: 'nga' },
  { name: 'Thổ Nhĩ Kỳ', slug: 'tho-nhi-ky' },
  { name: 'Indonesia', slug: 'indonesia' },
  { name: 'Philippines', slug: 'philippines' },
  { name: 'Ý', slug: 'y' },
  { name: 'Úc', slug: 'uc' },
  { name: 'Canada', slug: 'canada' },
  { name: 'Tổng Hợp', slug: 'tong-hop' },
];

/** Danh sách năm phát hành */
const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);

/** Top Phim (dùng danh-sach API) */
export const TOP_SECTIONS = [
  { name: 'Phim HOT', slug: 'phim-bo', label: 'Phim Bộ HOT' },
  { name: 'Phim Lẻ', slug: 'phim-le', label: 'Phim Lẻ' },
  { name: 'Phim Bộ', slug: 'phim-bo', label: 'Phim Bộ' },
  { name: 'Phim Hoàn Tất', slug: 'phim-bo-da-hoan-thanh', label: 'Hoàn Tất' },
  { name: 'Phim Đang Chiếu', slug: 'phim-dang-chieu', label: 'Đang Chiếu' },
  { name: 'Phim Sắp Chiếu', slug: 'phim-sap-chieu', label: 'Sắp Chiếu' },
];

/** Danh Sách Phim cho Navbar dropdown */
export const MOVIE_LISTS = [
  { name: 'Phim Mới', slug: 'danh-sach/phim-moi' },
  { name: 'Phim Bộ', slug: 'danh-sach/phim-bo' },
  { name: 'Phim Lẻ', slug: 'danh-sach/phim-le' },
  { name: 'Shows', slug: 'danh-sach/shows' },
  { name: 'Hoạt Hình', slug: 'danh-sach/hoat-hinh' },
  { name: 'Phim Vietsub', slug: 'danh-sach/vietsub' },
  { name: 'Phim Thuyết Minh', slug: 'danh-sach/thuyet-minh' },
  { name: 'Phim Lồng Tiếng', slug: 'danh-sach/long-tieng' },
  { name: 'Phim Bộ Đã Hoàn Thành', slug: 'danh-sach/phim-bo-da-hoan-thanh' },
  { name: 'Phim Bộ Đang Chiếu', slug: 'danh-sach/phim-bo-dang-chieu' },
  { name: 'Phim Sắp Chiếu', slug: 'danh-sach/phim-sap-chieu' },
  { name: 'Phim Chiếu Rạp', slug: 'danh-sach/phim-chieu-rap' },
];
