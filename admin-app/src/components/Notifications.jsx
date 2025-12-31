import { useNotifications } from '../hooks/useNotifications';
import { markNotificationRead } from '../services/notificationService';

const Notifications = () => {
  const { notifications, unreadCount, loading, error, refresh, markAsRead } = useNotifications(
    'admin',
    null,
    null,
    10000 // Poll every 10 seconds for real-time updates
  );

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      markAsRead(notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Admin Notifications</h2>
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full animate-pulse">
                {unreadCount} new
              </span>
            )}
            <button
              onClick={refresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh notifications"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="mt-4 text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  notification.status === 'pending' ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {notification.status === 'pending' && (
                        <span className="h-2 w-2 bg-primary-600 rounded-full"></span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        notification.recipient_type === 'rider' ? 'bg-blue-100 text-blue-800' :
                        notification.recipient_type === 'driver' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.recipient_type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatTime(notification.created_at_utc)}</span>
                      {notification.ride_id && (
                        <span className="text-primary-600">Ride #{notification.ride_id.slice(0, 8)}</span>
                      )}
                      {notification.driver_id && (
                        <span className="text-green-600">Driver #{notification.driver_id.slice(0, 8)}</span>
                      )}
                    </div>
                  </div>
                  {notification.status === 'pending' && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-4 px-3 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

