import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Receipt = ({ ride }) => {
  const receiptRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  const generatePDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `receipt-${ride.ride_id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!ride) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No ride data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Receipt</h2>
        <button
          onClick={generatePDF}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Receipt Content - Hidden but used for PDF generation */}
      <div ref={receiptRef} className="bg-white p-8 max-w-2xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GlobApp</h1>
          <p className="text-gray-600">Ride Receipt</p>
        </div>

        {/* Receipt Number */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">Receipt #</p>
          <p className="text-lg font-mono font-semibold">{ride.ride_id}</p>
        </div>

        {/* Ride Information */}
        <div className="mb-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-semibold">{formatDate(ride.completed_at_utc || ride.created_at_utc)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-semibold capitalize">{ride.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rider:</span>
            <span className="font-semibold">{ride.rider_name}</span>
          </div>
          {ride.driver_name && (
            <div className="flex justify-between">
              <span className="text-gray-600">Driver:</span>
              <span className="font-semibold">{ride.driver_name}</span>
            </div>
          )}
        </div>

        {/* Locations */}
        <div className="mb-6 space-y-3 border-t border-gray-200 pt-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Pickup Location:</p>
            <p className="font-semibold">{ride.pickup}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Dropoff Location:</p>
            <p className="font-semibold">{ride.dropoff}</p>
          </div>
        </div>

        {/* Fare Breakdown */}
        {ride.fare_quote && (
          <div className="mb-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold mb-3">Fare Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Fare:</span>
                <span>${ride.fare_quote.breakdown.base_fare?.toFixed(2) || '0.00'}</span>
              </div>
              {ride.fare_quote.distance_miles && (
                <div className="flex justify-between">
                  <span>Distance ({ride.fare_quote.distance_miles.toFixed(2)} miles):</span>
                  <span>${ride.fare_quote.breakdown.distance_fare?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              {ride.fare_quote.breakdown.time_fare > 0 && (
                <div className="flex justify-between">
                  <span>Time ({ride.fare_quote.duration_minutes} min):</span>
                  <span>${ride.fare_quote.breakdown.time_fare?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              {ride.fare_quote.breakdown.booking_fee > 0 && (
                <div className="flex justify-between">
                  <span>Booking Fee:</span>
                  <span>${ride.fare_quote.breakdown.booking_fee?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${ride.final_fare_usd?.toFixed(2) || ride.fare_quote.total_estimated_usd?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {ride.payment && (
          <div className="mb-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="capitalize font-semibold">{ride.payment.provider}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-semibold">${ride.payment.amount_usd?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className={`capitalize font-semibold ${
                  ride.payment.status === 'captured' || ride.payment.status === 'succeeded'
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}>
                  {ride.payment.status}
                </span>
              </div>
              {ride.payment.confirmed_at_utc && (
                <div className="flex justify-between">
                  <span>Paid At:</span>
                  <span>{formatDate(ride.payment.confirmed_at_utc)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-600">
          <p>Thank you for using GlobApp!</p>
          <p className="mt-2">For support, contact us at support@globapp.app</p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;

