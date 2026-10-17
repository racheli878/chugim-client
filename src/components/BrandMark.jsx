// הלוגו: ארבע נקודות — שלוש "תפוסות" בצבעי הקטגוריות ואחת פנויה. זה כל רעיון האתר.
export default function BrandMark({ size = 10 }) {
  return (
    <span className="brand-mark" aria-hidden="true" style={{ '--dot': `${size}px` }}>
      <span style={{ background: '#E8456B' }} />
      <span style={{ background: '#10A39B' }} />
      <span style={{ background: '#FF8B3D' }} />
      <span className="brand-mark-free" />
    </span>
  );
}
