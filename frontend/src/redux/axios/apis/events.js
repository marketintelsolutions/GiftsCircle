import api from '../axios';

const GetUserEventsApi = id => {
  return api.get(`/event/UserEvents/${id}`);
};

const GetEventGiftsApi = eventId => {
  return api.get(`gift/Get/EventGifts/${eventId}`);
};

const CreateEventApi1 = data => {
  return api.post(`/event/create`, data);
};

const CreateEventApi2 = data => {
  return api.post(`/event/create2`, data);
};

const DeleteEventApi = id => {
  return api.delete(`/event/${id}`);
};

export {
  GetUserEventsApi,
  GetEventGiftsApi,
  CreateEventApi1,
  CreateEventApi2,
  DeleteEventApi,
};
