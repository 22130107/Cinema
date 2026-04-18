import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-site">
      <div className="footer-container">
        <div className="footer-col footer-col-brand">
          <Link href="/" className="footer-logo">FLIX</Link>
          <p className="footer-desc">
            FLIX là nền tảng xem phim trực tuyến miễn phí với chất lượng video mượt mà. Cập nhật liên tục các bộ phim mới nhất, đa dạng thể loại từ phim hành động, tình cảm đến phim khoa học viễn tưởng.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link" title="Facebook">FB</a>
            <a href="#" className="social-link" title="Twitter">X</a>
            <a href="#" className="social-link" title="Instagram">IG</a>
          </div>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">Khám Phá</h3>
          <ul className="footer-links">
            <li><Link href="/danh-sach/phim-moi">Phim Mới</Link></li>
            <li><Link href="/danh-sach/phim-bo">Phim Bộ</Link></li>
            <li><Link href="/danh-sach/phim-le">Phim Lẻ</Link></li>
            <li><Link href="/danh-sach/phim-chieu-rap">Phim Chiếu Rạp</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">Thể Loại</h3>
          <ul className="footer-links">
            <li><Link href="/the-loai/hanh-dong">Hành Động</Link></li>
            <li><Link href="/the-loai/tinh-cam">Tình Cảm</Link></li>
            <li><Link href="/the-loai/hoat-hinh">Hoạt Hình</Link></li>
            <li><Link href="/the-loai/kinh-di">Kinh Dị</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">Hỗ Trợ</h3>
          <ul className="footer-links">
            <li><Link href="#">Câu Hỏi Thường Gặp</Link></li>
            <li><Link href="#">Điều Khoản Sử Dụng</Link></li>
            <li><Link href="#">Chính Sách Bảo Mật</Link></li>
            <li><Link href="#">Liên Hệ: hotro@flix.vn</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FLIX. Tham khảo giao diện phong cách Netflix. Phát triển với Next.js và OPhim API.</p>
        <p className="footer-disclaimer">Website chỉ sưu tầm phim, không lưu trữ dữ liệu video trên hệ thống.</p>
      </div>
    </footer>
  );
}
