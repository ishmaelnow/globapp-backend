import { useState, useEffect, useRef } from 'react';
import { getRideMessages, sendRideMessage } from '../services/rideMessagesService';

const POLL_INTERVAL_MS = 5000;

const RideChat = ({ rideId, senderType = 'rider' }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const listEndRef = useRef(null);

  const fetchMessages = async () => {
    if (!rideId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await getRideMessages(rideId);
      setMessages(Array.isArray(list) ? list : []);
    } catch (err) {
      if (err.response?.status === 503 || err.response?.data?.detail?.includes('migration')) {
        setError('Chat not available yet.');
      } else {
        setError(err.response?.data?.detail || 'Failed to load messages');
      }
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [rideId]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || sending || !rideId) return;
    setSending(true);
    setError(null);
    try {
      await sendRideMessage(rideId, text);
      setInputText('');
      await fetchMessages();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  if (!rideId) return null;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-900 px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
        💬 Chat with your driver
        <span className="block text-xs font-normal text-gray-600 mt-0.5">
          In-app messages (updates every few seconds)
        </span>
      </h3>
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm border-b border-red-100">
          {error}
        </div>
      )}
      <div className="flex flex-col" style={{ minHeight: 200, maxHeight: 320 }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && messages.length === 0 ? (
            <p className="text-gray-500 text-sm">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet. Say hi to your driver.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === senderType ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.sender_type === senderType
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="font-medium text-xs opacity-80 mb-0.5 capitalize">
                    {msg.sender_type === 'rider' ? 'You' : 'Driver'}
                  </p>
                  <p className="break-words">{msg.message_text}</p>
                  <p className="text-xs opacity-70 mt-1">{formatTime(msg.created_at_utc)}</p>
                </div>
              </div>
            ))
          )}
          <div ref={listEndRef} />
        </div>
        <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RideChat;
