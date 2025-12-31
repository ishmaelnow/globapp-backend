import { useEffect, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Notification badge component that shows unread count
 * Can be used in navigation bars
 */
const NotificationBadge = ({ recipientType = 'admin', recipientId = null, className = '' }) => {
  const { unreadCount } = useNotifications(recipientType, recipientId, null, 10000); // Poll every 10 seconds

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span
      className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ${className}`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

export default NotificationBadge;

