import './Timeline.css';
import { Activity } from 'lucide-react';

const Timeline = ({ events }) => {
    return (
        <div className="timeline-container fade-in">
            <div className="timeline-line"></div>

            {events.map((event, index) => (
                <div key={index} className="timeline-item">
                    <div className="timeline-marker">
                        <div className="marker-core glow-pulse"></div>
                    </div>

                    <div className="timeline-content glass">
                        <div className="timeline-header">
                            <span className="event-date text-mono text-neon">{event.date}</span>
                            <h4 className="event-title">{event.title}</h4>
                        </div>
                        <p className="event-description">{event.description}</p>
                        {event.technician && (
                            <div className="event-footer">
                                <span className="technician-label text-mono">OPERATOR_ID:</span>
                                <span className="technician-name text-mono">{event.technician.toUpperCase().replace(' ', '_')}</span>
                                <Activity size={12} className="text-neon" />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Timeline;
