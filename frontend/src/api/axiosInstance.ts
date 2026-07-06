import axios from 'axios'

const axiosInstance = axios.create({
    // Dev: hit FastAPI directly on :8000. Prod: baked to "/api" (nginx proxy) at build time.
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
})

export default axiosInstance
