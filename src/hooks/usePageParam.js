import { useSearchParams } from 'react-router-dom';

// מספר העמוד נשמר בכתובת (?page=2), כך שרענון ו"אחורה" שומרים עליו.
export function usePageParam() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);

  const setPage = (next, options) =>
    setParams((current) => {
      const updated = new URLSearchParams(current);
      if (next <= 1) updated.delete('page');
      else updated.set('page', String(next));
      return updated;
    }, options);

  return [page, setPage];
}
