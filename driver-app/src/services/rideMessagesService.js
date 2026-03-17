import api from '../config/api.js';

export const getRideMessages = async (rideId, limit = 100) => {
  const { data } = await api.get(`/rides/${rideId}/messages`, { params: { limit } });
  return data;
};

export const sendRideMessage = async (rideId, messageText) => {
  const { data } = await api.post(`/rides/${rideId}/messages`, { message_text: messageText });
  return data;
};
