import React from 'react';
import './NotificationBadge.css';

const NotificationBadge = ({ count, className = '' }) => {
    if (count === 0) return null;

    return (
        <span className={`notification-badge ${className}`}>
            {count > 99 ? '99+' : count}
        </span>
    );
};

export default NotificationBadge; 