import axios from "axios";
export const AUTH = axios.create({
    // baseURL: 'https://arboratorgrew.elizia.net/login',
    // baseURL: process.env.API + `/login`,
    baseURL: process.env.DEV ? "/api" : process.env.API + "/api",
    timeout: 5000,
    withCredentials: true,
  });