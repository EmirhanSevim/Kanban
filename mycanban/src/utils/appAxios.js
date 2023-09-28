import axios from 'axios';

export const appAxios = axios.create({
  baseURL: 'https://localhost:44355/api',
});
