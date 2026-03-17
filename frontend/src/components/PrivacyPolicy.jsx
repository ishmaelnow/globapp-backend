import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  useEffect(() => {
    // Set page title and meta tags
    document.title = 'Privacy Policy | FairFare';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'FairFare Privacy Policy - Learn how we collect, use, and protect your personal information.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'FairFare Privacy Policy - Learn how we collect, use, and protect your personal information.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">GlobApp</h1>
          </Link>
          {/* Back to Landing Button */}
      <Link
  to="/"
  className="inline-flex items-center px-6 py-2 rounded-md font-medium transition-all bg-white text-primary-600 shadow-sm border border-gray-200 hover:bg-primary-50"
>
  ← Back to Landing
</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> 20 January 2022
          </p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              FairFare ("FairFare", "we", "us", or "our") is committed to protecting your privacy.
              This Privacy Policy explains how your personal information is collected, used, and
              disclosed by FairFare.
            </p>

            <p className="text-gray-700 mb-6">
              This Privacy Policy applies to the FairFare website and the FairFare mobile applications
              (the "Service"), including:
            </p>

            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2 ml-4">
              <li>iOS Driver App</li>
              <li>iOS Customer App</li>
              <li>Android Driver App</li>
              <li>Android Customer App</li>
            </ul>

            <p className="text-gray-700 mb-8">
              By accessing or using our Service, you agree to the collection, storage, use, and disclosure
              of your personal information as described in this Privacy Policy.
            </p>

            {/* Zero Tolerance Policy Section */}
            <section className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🚗 Zero Tolerance Policy{' '}
                <small className="text-base font-normal text-gray-600">
                  (City of Dallas Ord. 29696; Sec. 47A-2.1.6 & 47A-2.1.7)
                </small>
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-gray-700 mb-3">
                  FairFare Transportation maintains an <strong>operating authority zero-tolerance policy</strong> for intoxicating substances.
                  <strong> Drivers are strictly prohibited</strong> from using drugs or alcohol while providing transportation services
                  or immediately before operating a vehicle.
                </p>
                <p className="text-gray-700 mb-3">
                  If you suspect your driver is under the influence of drugs or alcohol, <strong>end the trip immediately</strong>.
                  To report a complaint to the City of Dallas, dial <strong>3-1-1</strong> (or <strong>214-670-3111</strong> from outside Dallas)
                  pursuant to <strong>Ord. 29696</strong>. In an emergency, call <strong>911</strong>.
                </p>
                <p className="text-gray-700">
                  Any violation of this Zero Tolerance Policy will result in <strong>immediate suspension</strong> of the driver and an internal
                  investigation consistent with City of Dallas Transportation-for-Hire regulations.
                </p>
              </div>
            </section>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Definitions</h2>
            <div className="text-gray-700 mb-6 space-y-2">
              <p>
                <strong>Account</strong> means a unique account created to access the Service.
              </p>
              <p>
                <strong>Personal Data</strong> means any information relating to an identifiable individual.
              </p>
              <p>
                <strong>Usage Data</strong> refers to data collected automatically when using the Service.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Personal Data</h3>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2 ml-4">
              <li>Email address</li>
              <li>First and last name</li>
              <li>Phone number</li>
              <li>Address, city, state, ZIP/postal code</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Usage Data</h3>
            <p className="text-gray-700 mb-6">
              Usage Data may include IP address, browser type, device identifiers, pages visited,
              and diagnostic data.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Tracking Technologies</h2>
            <p className="text-gray-700 mb-6">
              We use cookies, web beacons, and similar technologies to track activity on our Service
              and improve functionality.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Use of Personal Data</h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2 ml-4">
              <li>To provide and maintain the Service</li>
              <li>To manage user accounts</li>
              <li>To perform contractual obligations</li>
              <li>To communicate service-related updates</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Third-Party Services</h2>
            <p className="text-gray-700 mb-6">
              We may share data with trusted service providers such as hosting, dispatch, mapping,
              and payment processors, solely to operate the Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Data Retention</h2>
            <p className="text-gray-700 mb-6">
              Personal Data is retained only as long as necessary to fulfill the purposes outlined
              in this Privacy Policy and comply with legal requirements.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Deletion of Personal Data</h2>
            <p className="text-gray-700 mb-6">
              Users may request deletion or transfer of their personal data by contacting us.
              Requests are handled within one month.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">International Data Transfers</h2>
            <p className="text-gray-700 mb-6">
              Your information may be processed outside your jurisdiction. By using the Service,
              you consent to such transfers.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Disclosure of Personal Data</h2>
            <p className="text-gray-700 mb-6">
              Personal Data may be disclosed to comply with legal obligations, protect rights,
              or ensure user safety.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Security</h2>
            <p className="text-gray-700 mb-6">
              We implement commercially reasonable safeguards, but no method of transmission
              or storage is 100% secure.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Links to Other Websites</h2>
            <p className="text-gray-700 mb-6">
              We are not responsible for third-party websites linked from our Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Privacy Policy periodically. Changes are effective when posted
              on this page.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Contact Us</h2>
            <p className="text-gray-700 mb-6">
              Email: <a href="mailto:support@fairfare.app" className="text-primary-600 hover:text-primary-700 underline">support@fairfare.app</a>
              <br />
              Website: <a href="https://fairfare.app" className="text-primary-600 hover:text-primary-700 underline" target="_blank" rel="noopener noreferrer">https://fairfare.app</a>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm mb-2">
              © {new Date().getFullYear()} GlobApp. Your trusted ride booking service.
            </p>
            <p className="text-sm">
              <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-700 underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;

