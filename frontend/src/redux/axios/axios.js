import axios from 'axios';

const headers = {
  "Access-Control-Allow-Origin": "*",
  'content-type': 'Application/json',
};

axios.defaults.baseURL = 'https://giftcircle-ws.onrender.com/api/';

const axiosInstance = axios.create({
  headers,
  timeout: 60000,
  withCredentials: false,
});

axiosInstance.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('accessToken');
    // dispatch(setToken(Token));
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  err => Promise.reject(err)
);


export default axiosInstance;
