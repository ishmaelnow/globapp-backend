import { useState, useEffect } from 'react';
import { isPWAInstalled } from '../utils/pwa';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (isPWAInstalled()) {
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Listen for beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt after a delay if on mobile
    if (iOS || android) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android Chrome - use the prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS - show instructions
      setShowPrompt(false);
      // Instructions are already shown in the prompt
    }
  };

  if (!showPrompt || isPWAInstalled()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-primary-600 text-white rounded-lg shadow-lg p-4 z-50 md:max-w-md md:left-auto">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Install GlobApp</h3>
          {isIOS ? (
            <div className="text-sm">
              <p className="mb-2">To install this app:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Tap the Share button <span className="text-2xl">⎋</span></li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add"</li>
              </ol>
            </div>
          ) : isAndroid ? (
            <p className="text-sm mb-2">Install GlobApp for a better experience!</p>
          ) : (
            <p className="text-sm mb-2">Install this app on your device</p>
          )}
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="ml-4 text-white hover:text-gray-200"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      {!isIOS && (
        <button
          onClick={handleInstallClick}
          className="mt-3 w-full bg-white text-primary-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Install Now
        </button>
      )}
    </div>
  );
};

export default InstallPrompt;

