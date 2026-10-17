// מסך זמני למסכים שייבנו במשימות 7.2–7.5.
export default function Placeholder({ title }) {
  return (
    <div className="container page">
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">המסך הזה בדרך אלייך 🙂</p>
    </div>
  );
}
