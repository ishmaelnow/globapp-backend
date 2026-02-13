import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface ReceiptProps {
  ride: any;
}

const Receipt: React.FC<ReceiptProps> = ({ ride }) => {
  const formatDate = (dateString?: string) => {
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
    } catch {
      return dateString;
    }
  };

  const generatePDF = async () => {
    if (!ride) {
      Alert.alert('Error', 'No ride data available');
      return;
    }

    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 {
                font-size: 32px;
                font-weight: bold;
                margin: 0 0 10px 0;
                color: #333;
              }
              .header p {
                font-size: 16px;
                color: #666;
                margin: 0;
              }
              .section {
                margin-bottom: 25px;
              }
              .section-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #333;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #eee;
              }
              .info-label {
                color: #666;
                font-size: 14px;
              }
              .info-value {
                color: #333;
                font-weight: 600;
                font-size: 14px;
                text-align: right;
                max-width: 60%;
              }
              .location {
                margin-bottom: 15px;
              }
              .location-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
              }
              .location-value {
                font-size: 14px;
                font-weight: 600;
                color: #333;
              }
              .total {
                font-size: 20px;
                font-weight: bold;
                color: #4CAF50;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 2px solid #4CAF50;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #333;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>GlobApp</h1>
              <p>Ride Receipt</p>
            </div>

            <div class="section">
              <div class="info-row">
                <span class="info-label">Receipt #</span>
                <span class="info-value">${ride.ride_id || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date</span>
                <span class="info-value">${formatDate(ride.completed_at_utc || ride.created_at_utc)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status</span>
                <span class="info-value">${ride.status?.charAt(0).toUpperCase() + ride.status?.slice(1) || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Rider</span>
                <span class="info-value">${ride.rider_name || 'N/A'}</span>
              </div>
              ${ride.driver_name ? `
              <div class="info-row">
                <span class="info-label">Driver</span>
                <span class="info-value">${ride.driver_name}</span>
              </div>
              ` : ''}
            </div>

            <div class="section">
              <div class="section-title">Locations</div>
              <div class="location">
                <div class="location-label">Pickup Location:</div>
                <div class="location-value">${ride.pickup || 'N/A'}</div>
              </div>
              <div class="location">
                <div class="location-label">Dropoff Location:</div>
                <div class="location-value">${ride.dropoff || 'N/A'}</div>
              </div>
            </div>

            ${ride.fare_quote ? `
            <div class="section">
              <div class="section-title">Fare Breakdown</div>
              <div class="info-row">
                <span class="info-label">Base Fare</span>
                <span class="info-value">$${ride.fare_quote.breakdown?.base_fare?.toFixed(2) || '0.00'}</span>
              </div>
              ${ride.fare_quote.distance_miles ? `
              <div class="info-row">
                <span class="info-label">Distance (${ride.fare_quote.distance_miles.toFixed(2)} miles)</span>
                <span class="info-value">$${ride.fare_quote.breakdown?.distance_fare?.toFixed(2) || '0.00'}</span>
              </div>
              ` : ''}
              ${ride.fare_quote.breakdown?.time_fare && ride.fare_quote.breakdown.time_fare > 0 ? `
              <div class="info-row">
                <span class="info-label">Time (${ride.fare_quote.duration_minutes || 0} min)</span>
                <span class="info-value">$${ride.fare_quote.breakdown.time_fare.toFixed(2)}</span>
              </div>
              ` : ''}
              ${ride.fare_quote.breakdown?.booking_fee && ride.fare_quote.breakdown.booking_fee > 0 ? `
              <div class="info-row">
                <span class="info-label">Booking Fee</span>
                <span class="info-value">$${ride.fare_quote.breakdown.booking_fee.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="info-row total">
                <span>Total:</span>
                <span>$${ride.final_fare_usd?.toFixed(2) || ride.fare_quote.total_estimated_usd?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            ` : ''}

            ${ride.payment ? `
            <div class="section">
              <div class="section-title">Payment Information</div>
              <div class="info-row">
                <span class="info-label">Payment Method</span>
                <span class="info-value">${ride.payment.provider?.charAt(0).toUpperCase() + ride.payment.provider?.slice(1) || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Amount Paid</span>
                <span class="info-value">$${ride.payment.amount_usd?.toFixed(2) || '0.00'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Status</span>
                <span class="info-value">${ride.payment.status?.charAt(0).toUpperCase() + ride.payment.status?.slice(1) || 'N/A'}</span>
              </div>
              ${ride.payment.confirmed_at_utc ? `
              <div class="info-row">
                <span class="info-label">Paid At</span>
                <span class="info-value">${formatDate(ride.payment.confirmed_at_utc)}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}

            <div class="footer">
              <p>Thank you for using GlobApp!</p>
              <p style="margin-top: 10px;">For support, contact us at support@globapp.app</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Success', 'PDF generated successfully. Check your device files.');
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  if (!ride) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No ride data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Receipt</Text>
        <TouchableOpacity style={styles.downloadButton} onPress={generatePDF}>
          <Text style={styles.downloadButtonText}>📄 Download PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});

export default Receipt;
































