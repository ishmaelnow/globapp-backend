import { useState } from 'react';
import RideBooking from './RideBooking';
import MyBookings from './MyBookings';
import RideDetails from './RideDetails';
import Notifications from './Notifications';
import NotificationBadge from './NotificationBadge';
import InstallPrompt from './InstallPrompt';
import InstallPrompt from './InstallPrompt';

const Booking = () => {
  const [activeTab, setActiveTab] = useState('book');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRideId, setSelectedRideId] = useState(null);

  const handleBookingCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab('bookings');
  };

  const handleViewRideDetails = (rideId) => {
    setSelectedRideId(rideId);
    setActiveTab('details');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">GlobApp - Rider</h1>
            </div>
            <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('book')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'book'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Book Ride
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'bookings'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                  activeTab === 'notifications'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Notifications
                <NotificationBadge recipientType="rider" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'book' ? (
          <RideBooking onBookingCreated={handleBookingCreated} />
        ) : activeTab === 'bookings' ? (
          <MyBookings key={refreshKey} onViewRideDetails={handleViewRideDetails} />
        ) : activeTab === 'notifications' ? (
          <Notifications />
        ) : (
          <RideDetails initialRideId={selectedRideId} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">© {new Date().getFullYear()} GlobApp. Your trusted ride booking service.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Booking;




