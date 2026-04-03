import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'FLIX - Xem phim miễn phí',
  description: 'Trang web xem phim mới nhất, cập nhật liên tục.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <div className="app-container">
          <Navbar />
          <main className="main-content" style={{ minHeight: '100vh', paddingBottom: '60px' }}>
            {children}
          </main>
          <footer style={{ padding: '60px 4vw', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', background: '#111' }}>
            <p>Phát triển bởi Bằng API ophim. Next.js SSR Version.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
