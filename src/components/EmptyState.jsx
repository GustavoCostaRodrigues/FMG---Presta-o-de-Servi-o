import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action }) => {
    return (
        <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="empty-state-icon">
                <Icon size={32} strokeWidth={1.5} />
            </div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{description}</p>
            {action && (
                <div style={{ marginTop: '24px' }}>
                    {action}
                </div>
            )}
        </motion.div>
    );
};

export default EmptyState;
