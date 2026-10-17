// עימוד: הקודם / מספרי עמודים (עם … כשיש הרבה) / הבא. משמש בכל הרשימות באתר.

function pageWindow(page, totalPages) {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  return pages.flatMap((p, i) => (i > 0 && p - pages[i - 1] > 1 ? ['gap', p] : [p]));
}

export default function Pagination({ page, totalPages, onChange, label = 'עמודים' }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label={label}>
      <button type="button" className="page-btn page-step" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        הקודם
      </button>
      {pageWindow(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="page-gap" aria-hidden="true">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className="page-btn"
            aria-label={`עמוד ${p}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button type="button" className="page-btn page-step" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        הבא
      </button>
    </nav>
  );
}
