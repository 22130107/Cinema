import Link from 'next/link';

export default function Pagination({ currentPage, totalPages, basePath, extraParams = {} }) {
  if (!totalPages || totalPages <= 1) return null;

  const getHref = (p) => {
    const params = new URLSearchParams({ ...extraParams, page: p });
    return `${basePath}?${params.toString()}`;
  };

  const delta = 2;
  const range = [];

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) range.unshift('...');
  if (currentPage + delta < totalPages - 1) range.push('...');

  range.unshift(1);
  if (totalPages > 1) range.push(totalPages);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', margin: '40px 0' }}>
      {currentPage > 1 ? (
        <Link href={getHref(currentPage - 1)} style={{ padding: '8px 16px', background: '#333', borderRadius: '4px' }}>
          Trước
        </Link>
      ) : (
        <span style={{ padding: '8px 16px', background: '#222', color: '#666', borderRadius: '4px' }}>Trước</span>
      )}

      {range.map((p, i) => {
        if (p === '...') {
          return <span key={`ellipsis-${i}`}>...</span>;
        }
        const isActive = p === currentPage;
        return (
          <Link
            key={p}
            href={getHref(p)}
            style={{
              padding: '8px 16px',
              background: isActive ? '#e50914' : '#333',
              borderRadius: '4px',
              fontWeight: isActive ? 'bold' : 'normal'
            }}
          >
            {p}
          </Link>
        );
      })}

      {currentPage < totalPages ? (
        <Link href={getHref(currentPage + 1)} style={{ padding: '8px 16px', background: '#333', borderRadius: '4px' }}>
          Sau
        </Link>
      ) : (
        <span style={{ padding: '8px 16px', background: '#222', color: '#666', borderRadius: '4px' }}>Sau</span>
      )}
    </div>
  );
}
