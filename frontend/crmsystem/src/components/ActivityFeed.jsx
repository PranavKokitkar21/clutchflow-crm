const typeConfig = {
  email: { icon: '📧', color: '#6366f1' },
  call: { icon: '📞', color: '#10b981' },
  note: { icon: '📝', color: '#f59e0b' },
  meeting: { icon: '🤝', color: '#ec4899' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ActivityFeed({ activities = [] }) {
  if (!activities.length) {
    return (
      <div className="activity-feed-empty">
        <span>📭</span>
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map((activity) => {
        const config = typeConfig[activity.type] || typeConfig.note;
        return (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon" style={{ background: config.color + '20', color: config.color }}>
              {config.icon}
            </div>
            <div className="activity-content">
              <p className="activity-message">{activity.message}</p>
              <div className="activity-meta">
                <span className="activity-customer">{activity.customers?.name || 'Unknown'}</span>
                <span className="activity-time">{timeAgo(activity.created_at)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
