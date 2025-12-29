import { useState } from 'react';
import DriverLogin from './components/DriverLogin';
import DriverPortal from './components/DriverPortal';
import { getDriverAuth } from './utils/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getDriverAuth());

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <>
      {isAuthenticated ? (
        <DriverPortal onLogout={handleLogout} />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">GlobApp Driver Portal</h1>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DriverLogin onLoginSuccess={handleLoginSuccess} />
          </main>
        </div>
      )}
    </>
  );
}

export default App;


