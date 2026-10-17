import Icon from '../../components/Icon.jsx';
import { categoryStyle } from '../../lib/categoryTheme.js';
import { SORT_OPTIONS } from './courseFilters.js';

export default function CourseFilters({ searchText, onSearchText, categories, filters, onChange }) {
  return (
    <form className="filters" role="search" aria-label="חיפוש וסינון חוגים" onSubmit={(e) => e.preventDefault()}>
      <label className="search-box">
        <Icon name="search" />
        <span className="visually-hidden">חיפוש</span>
        <input
          type="search"
          value={searchText}
          onChange={(e) => onSearchText(e.target.value)}
          placeholder="מה מעניין אותך? חוג או מדריכה"
          maxLength={100}
        />
      </label>

      <div className="chip-row" role="group" aria-label="קטגוריה">
        <button
          type="button"
          className="chip chip-all"
          aria-pressed={!filters.categoryId}
          onClick={() => onChange({ categoryId: null })}
        >
          הכול
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="chip"
            style={categoryStyle(category.id)}
            aria-pressed={filters.categoryId === category.id}
            onClick={() => onChange({ categoryId: filters.categoryId === category.id ? null : category.id })}
          >
            <span className="chip-dot" aria-hidden="true" />
            {category.name}
          </button>
        ))}
      </div>

      <div className="filters-end">
        <label className="check">
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => onChange({ onlyAvailable: e.target.checked })}
          />
          רק חוגים שיש בהם מקום
        </label>

        <label className="sort">
          סידור לפי
          <select className="select select-sm" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })}>
            {Object.entries(SORT_OPTIONS).map(([value, option]) => (
              <option key={value} value={value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
    </form>
  );
}
