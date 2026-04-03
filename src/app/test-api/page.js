'use client';

import { useState, useEffect } from 'react';

export default function TestApiPage() {
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(true);

  useEffect(() => {
    const testApis = async () => {
      const endpoints = [
        { name: 'Phim Mới', url: 'https://ophim1.com/v1/api/danh-sach/phim-moi?page=1' },
        { name: 'Phim Bộ', url: 'https://ophim1.com/v1/api/danh-sach/phim-bo?page=1' },
        { name: 'Phim Lẻ', url: 'https://ophim1.com/v1/api/danh-sach/phim-le?page=1' },
        { name: 'Shows', url: 'https://ophim1.com/v1/api/the-loai/truyen-hinh?page=1' },
        { name: 'Hoạt Hình', url: 'https://ophim1.com/v1/api/the-loai/hoat-hinh?page=1' },
        { name: 'Phim Vietsub', url: 'https://ophim1.com/v1/api/the-loai/vietsub?page=1' },
        { name: 'Phim Thuyết Minh', url: 'https://ophim1.com/v1/api/the-loai/thuyet-minh?page=1' },
        { name: 'Phim Lồng Tiếng', url: 'https://ophim1.com/v1/api/the-loai/long-tieng?page=1' },
        { name: 'Phim Bộ Đã Hoàn Thành', url: 'https://ophim1.com/v1/api/the-loai/phim-bo-da-hoan-thanh?page=1' },
        { name: 'Phim Bộ Đang Chiếu', url: 'https://ophim1.com/v1/api/the-loai/phim-bo-dang-chieu?page=1' },
        { name: 'Phim Sắp Chiếu', url: 'https://ophim1.com/v1/api/the-loai/phim-sap-chieu?page=1' },
        { name: 'Phim Chiếu Rạp', url: 'https://ophim1.com/v1/api/the-loai/phim-chieu-rap?page=1' },
      ];

      const res = [];
      for (const endpoint of endpoints) {
        try {
          const resp = await fetch(endpoint.url);
          const json = await resp.json();
          const itemCount = json.data?.items?.length || 0;
          res.push({
            name: endpoint.name,
            status: itemCount > 0 ? 'success' : 'empty',
            count: itemCount,
            error: null,
          });
        } catch (err) {
          res.push({
            name: endpoint.name,
            status: 'error',
            count: 0,
            error: err.message,
          });
        }
      }
      setResults(res);
      setTesting(false);
    };

    testApis();
  }, []);

  return (
    <div style={{ padding: '40px', background: '#1a1a1a', color: '#fff', minHeight: '100vh' }}>
      <h1>Test API Endpoints</h1>
      
      {testing && <div style={{ fontSize: '1.2rem', color: '#ffa500' }}>Đang kiểm tra...</div>}

      <div style={{ marginTop: '30px' }}>
        {results.map((result) => (
          <div
            key={result.name}
            style={{
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '8px',
              background: result.status === 'success' ? '#1a3a1a' : result.status === 'empty' ? '#3a2a1a' : '#3a1a1a',
              borderLeft: `4px solid ${result.status === 'success' ? '#00ff00' : result.status === 'empty' ? '#ff9900' : '#ff0000'}`,
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {result.status === 'success' ? '✅' : result.status === 'empty' ? '⚠️' : '❌'} {result.name}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '5px' }}>
              {result.status === 'success' && `${result.count} phim`}
              {result.status === 'empty' && `Không có phim (${result.count})`}
              {result.status === 'error' && `Lỗi: ${result.error}`}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>Tóm tắt</h3>
        <div style={{ marginTop: '10px' }}>
          <div>✅ Trả về phim: {results.filter(r => r.status === 'success').length}</div>
          <div style={{ color: '#ffa500' }}>⚠️ Không có phim: {results.filter(r => r.status === 'empty').length}</div>
          <div style={{ color: '#ff0000' }}>❌ Lỗi: {results.filter(r => r.status === 'error').length}</div>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>Hướng dẫn:</h3>
        <ul>
          <li><strong>✅ Xanh lá:</strong> Danh mục có phim - giữ lại</li>
          <li><strong>⚠️ Orange:</strong> Danh mục không có phim - XÓA khỏi dropdown</li>
          <li><strong>❌ Đỏ:</strong> Lỗi API - kiểm tra slug</li>
        </ul>
        <p style={{ marginTop: '15px', color: '#aaa' }}>
          Những danh mục orange cần được xóa khỏi MOVIE_LISTS trong Navbar.jsx
        </p>
      </div>
    </div>
  );
}
