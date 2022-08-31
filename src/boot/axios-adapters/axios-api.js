import axios from 'axios';

export const API = axios.create({
  // baseURL: 'https://arboratorgrew.elizia.net/api',
  // baseURL: `/api`,
  baseURL: process.env.DEV ? '/api' : `${process.env.API}/api`,
  timeout: 50000,
  withCredentials: false,
});
