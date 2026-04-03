import './SummaryCard.css';

const SummaryCard = ({ label, value, icon, trend, techLabel }) => {
    return (
        <div className="summary-card glass fade-in">
            <div className="summary-header">
                <div className="summary-icon-container">
                    {icon}
                </div>
                <div className="summary-trend text-mono">
                    {trend}
                </div>
            </div>

            <div className="summary-body">
                <h3 className="summary-value text-neon">{value}</h3>
                <p className="summary-label">{label}</p>
            </div>

            <div className="summary-footer">
                <span className="tech-label text-mono">{techLabel}</span>
            </div>
        </div>
    );
};

export default SummaryCard;
