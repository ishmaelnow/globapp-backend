import { useState } from 'react';
import { driverLogin } from '../services/driverService';
import { saveDriverAuth } from '../utils/auth';

const DriverLogin = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    phone: '',
    pin: '',
    device_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await driverLogin(
        formData.phone,
        formData.pin,
        formData.device_id || null
      );
      
      saveDriverAuth({
        driver_id: response.driver_id,
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_in: response.access_token_expires_minutes * 60,
      });

      if (onLoginSuccess) {
        onLoginSuccess(response);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Driver Login</h2>
      <p className="text-gray-600 mb-8">Sign in to access your driver portal</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="1234567890"
            required
          />
        </div>

        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
            PIN
          </label>
          <input
            type="password"
            id="pin"
            value={formData.pin}
            onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your PIN"
            required
          />
        </div>

        <div>
          <label htmlFor="device_id" className="block text-sm font-medium text-gray-700 mb-2">
            Device ID (Optional)
          </label>
          <input
            type="text"
            id="device_id"
            value={formData.device_id}
            onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Device identifier"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold text-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default DriverLogin;

