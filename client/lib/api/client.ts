import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Extend AxiosRequestConfig to include retry tracking
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryConfig;

        if (!originalRequest) {
          return Promise.reject(error);
        }

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        // Handle timeout and network errors with retry logic
        if (this.shouldRetry(error) && !originalRequest._retry) {
          const retryCount = originalRequest._retryCount || 0;
          
          if (retryCount < MAX_RETRIES) {
            originalRequest._retryCount = retryCount + 1;
            
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, retryCount) * 1000;
            await this.sleep(delay);
            
            return this.client(originalRequest);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    if (!error.response) {
      // Network error or timeout
      return true;
    }
    
    const status = error.response.status;
    // Retry on server errors (500-599) except 501 (Not Implemented)
    return status >= 500 && status !== 501;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { token } = response.data.data;
        this.setToken(token);
        return token;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private handleError(error: AxiosError): Error {
    // Log error for debugging
    this.logError(error);

    if (error.response) {
      // Server responded with error
      const message = (error.response.data as any)?.message || 'An error occurred';
      const customError = new Error(message);
      (customError as any).status = error.response.status;
      (customError as any).data = error.response.data;
      return customError;
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error. Please check your connection.');
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      return new Error('Request timed out. Please try again.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  private logError(error: AxiosError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Store error in localStorage for debugging (last 50 errors)
    if (typeof window !== 'undefined') {
      try {
        const errors = JSON.parse(localStorage.getItem('api_errors') || '[]');
        errors.unshift({
          timestamp: new Date().toISOString(),
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
        });
        localStorage.setItem('api_errors', JSON.stringify(errors.slice(0, 50)));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  private handleAuthFailure() {
    this.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getClient();
