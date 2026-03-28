export default function StatCard({ icon, label, value, trend, color = 'blue' }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__content">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
        {trend && <span className="stat-card__trend">{trend}</span>}
      </div>
    </div>
  );
}
