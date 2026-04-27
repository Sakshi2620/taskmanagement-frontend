function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const go = (p) => onPageChange(Math.max(1, Math.min(totalPages, p)));

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="pagination">
      <button
        className="secondary-btn"
        disabled={prevDisabled}
        onClick={() => go(page - 1)}
      >
        Prev
      </button>

      <div className="page-pills" aria-label="Pagination">
        {start > 1 && (
          <>
            <button className="page-pill" onClick={() => go(1)}>
              1
            </button>
            {start > 2 && <span className="ellipsis">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            className={p === page ? "page-pill active" : "page-pill"}
            onClick={() => go(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="ellipsis">…</span>}
            <button className="page-pill" onClick={() => go(totalPages)}>
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        className="secondary-btn"
        disabled={nextDisabled}
        onClick={() => go(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;

