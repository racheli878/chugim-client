import { Component } from 'react';
import BrandMark from './BrandMark.jsx';

// רשת ביטחון אחרונה: אם רכיב קורס בזמן רינדור — מציגים מסך ידידותי במקום דף לבן.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected UI error', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="container page empty-state" role="alert">
        <BrandMark size={14} />
        <h1 className="page-title">אופס, משהו השתבש</h1>
        <p className="page-subtitle">קרתה תקלה לא צפויה. טעינה מחדש של הדף בדרך כלל פותרת את זה.</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          טעינה מחדש
        </button>
      </main>
    );
  }
}
