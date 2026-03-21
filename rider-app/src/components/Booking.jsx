import { useState } from 'react';
import RideBooking from './RideBooking';
import MyBookings from './MyBookings';
import RideDetails from './RideDetails';
import Notifications from './Notifications';
import NotificationBadge from './NotificationBadge';
import InstallPrompt from './InstallPrompt';
import MapBackground from './MapBackground';
import ActiveRideBanner from './ActiveRideBanner';

const Booking = () => {
  const [activeTab, setActiveTab] = useState('book');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [headerActiveRide, setHeaderActiveRide] = useState(null);

  const handleBookingCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab('bookings');
  };

  const handleViewRideDetails = (rideId) => {
    setSelectedRideId(rideId);
    setActiveTab('details');
  };

  const handleOpenActiveRide = (rideId) => {
    if (rideId) {
      handleViewRideDetails(rideId);
    }
  };

  return (
    <div className="min-h-screen relative">
      <MapBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200">
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
            <nav className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg justify-end sm:justify-start">
              <button
                onClick={() => setActiveTab('book')}
                className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                  activeTab === 'book'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Book Ride
                {headerActiveRide && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-gray-100"
                    title="You have an active ride"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                  activeTab === 'bookings'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Bookings
                {headerActiveRide && activeTab !== 'details' && (
                  <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                    LIVE
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => headerActiveRide && handleOpenActiveRide(headerActiveRide.ride_id)}
                disabled={!headerActiveRide}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  headerActiveRide
                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Current ride
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

      <ActiveRideBanner
        key={refreshKey}
        onOpenRide={handleOpenActiveRide}
        onActiveRideChange={setHeaderActiveRide}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'book' ? (
          <RideBooking
            onBookingCreated={handleBookingCreated}
            onOpenCurrentRide={handleOpenActiveRide}
            onRideSessionChanged={() => setRefreshKey((k) => k + 1)}
          />
        ) : activeTab === 'bookings' ? (
          <MyBookings
            key={refreshKey}
            onViewRideDetails={handleViewRideDetails}
            onRideSessionChanged={() => setRefreshKey((k) => k + 1)}
          />
        ) : activeTab === 'notifications' ? (
          <Notifications />
        ) : (
          <RideDetails initialRideId={selectedRideId} />
        )}
      </main>

      <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">© {new Date().getFullYear()} GlobApp. Your trusted ride booking service.</p>
          </div>
        </div>
      </footer>

      {/* Install Prompt for Mobile */}
      <InstallPrompt />
      </div>
    </div>
  );
};

export default Booking;




