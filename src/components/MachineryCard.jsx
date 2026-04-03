import './MachineryCard.css';

const MachineryCard = ({ name, id, status, nextMaintenance, image }) => {
    return (
        <div className="machinery-card fade-in">
            <div className="card-header">
                <span className={`status-badge ${status.toLowerCase()}`}>
                    {status}
                </span>
            </div>

            <div className="card-body">
                <div className="machinery-image glass">
                    {image ? (
                        <img src={image} alt={name} />
                    ) : (
                        <div className="image-placeholder">
                            <div className="placeholder-icon"></div>
                        </div>
                    )}
                </div>

                <div className="machinery-info">
                    <h3 className="machinery-name">{name}</h3>
                    <p className="machinery-id text-mono">ID: {id}</p>
                </div>

                <div className="maintenance-info">
                    <span className="info-label text-mono">Next Maintenance</span>
                    <span className="info-value text-neon text-mono">{nextMaintenance}</span>
                </div>
            </div>

            <div className="card-footer">
                <button className="btn-secondary-neo text-mono">Execute Inspection</button>
            </div>
        </div>
    );
};

export default MachineryCard;
