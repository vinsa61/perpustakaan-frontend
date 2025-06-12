import axios, { AxiosError } from "axios";
import { GetServerSidePropsContext } from "next/types";
import Cookies from "universal-cookie";

import { getToken } from "@/lib/cookies";
import { UninterceptedApiError, ApiResponse, PaginatedApiResponse } from "@/types/api";
import { BookshelfApiResponse, BorrowingHistory, BookshelfStats } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class BookshelfService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Get user's bookshelf
  async getBookshelf(
    userId: number,
    params?: {
      status?: 'borrowed' | 'returned' | 'dipinjam' | 'selesai';
      page?: number;
      limit?: number;
    }
  ): Promise<BookshelfApiResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    const endpoint = `/bookshelf/${userId}${query ? `?${query}` : ''}`;
    
    return this.makeRequest<BookshelfApiResponse>(endpoint);
  }

  // Get bookshelf summary
  async getBookshelfSummary(userId: number): Promise<ApiResponse<BookshelfStats>> {
    return this.makeRequest<ApiResponse<BookshelfStats>>(`/bookshelf/${userId}/summary`);
  }

  // Get borrowing history
  async getBorrowingHistory(
    userId: number,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<BorrowingHistory[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    const endpoint = `/bookshelf/${userId}/history${query ? `?${query}` : ''}`;
    
    return this.makeRequest<ApiResponse<BorrowingHistory[]>>(endpoint);
  }
}

export const bookshelfService = new BookshelfService();
const context = <GetServerSidePropsContext>{};

export const baseURL =
  process.env.NEXT_PUBLIC_RUN_MODE === "development"
    ? process.env.NEXT_PUBLIC_API_URL_DEV
    : process.env.NEXT_PUBLIC_API_URL_PROD;

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

api.defaults.withCredentials = false;
const isBrowser = typeof window !== "undefined";

api.interceptors.request.use(function (config) {
  if (config.headers) {
    let token: string | undefined;

    if (!isBrowser) {
      if (!context)
        throw "Api Context not found. You must call `setApiContext(context)` before calling api on server-side";

      const cookies = new Cookies(context.req?.headers.cookie);
      token = cookies.get("@library/token");
    } else {
      token = getToken();
    }

    config.headers.Authorization = token ? `Bearer ${token}` : "";
  }

  return config;
});

api.interceptors.response.use(
  (config) => {
    return config;
  },
  (error: AxiosError<UninterceptedApiError>) => {
    // parse error
    if (error.response?.data.message) {
      return Promise.reject({
        ...error,
        response: {
          ...error.response,
          data: {
            ...error.response.data,
            message:
              typeof error.response.data.message === "string"
                ? error.response.data.message
                : Object.values(error.response.data.message)[0][0],
          },
        },
      });
    }
    return Promise.reject(error);
  },
);

// API Service Class
class ApiService {
  // Auth APIs
  async register(userData: {
    nama: string;
    username: string;
    email: string;
    password: string;
    academic_role: 'mahasiswa' | 'dosen' | 'tendik';
    no_induk: string;
  }): Promise<ApiResponse<any>> {
    const response = await api.post('/auth/register', userData);
    
    // Store token if login successful
    if (response.data.success && response.data.token) {
      if (isBrowser) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
    }
    
    return response.data;
  }

  async login(credentials: { 
    username: string; 
    password: string; 
  }): Promise<ApiResponse<any>> {
    const response = await api.post('/auth/login', credentials);
    
    // Store token if login successful
    if (response.data.success && response.data.token) {
      if (isBrowser) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
    }
    
    return response.data;
  }

  async logout() {
    if (isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Books APIs
  async getBooks(params?: {
    tersedia?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedApiResponse<any[]>> {
    const response = await api.get('/books', { params });
    return response.data;
  }

  async getBookById(id: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/books/${id}`);
    return response.data;
  }

  // Admin APIs
  async getRequests(params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedApiResponse<any[]>> {
    const response = await api.get('/requests', { params });
    return response.data;
  }

  async updateRequestStatus(
    id: string, 
    status: 'approved' | 'rejected'
  ): Promise<ApiResponse<any>> {
    const response = await api.patch(`/requests/${id}`, { status });
    return response.data;
  }

  // Bookshelf API
  async getBookshelf(userId: string, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedApiResponse<any>> {
    const response = await api.get(`/bookshelf/${userId}`, { params });
    return response.data;
  }

  // Borrow Request API (if you need to add this functionality)
  async createBorrowRequest(bookIds: number[]): Promise<ApiResponse<any>> {
    const response = await api.post('/borrow/request', { bookIds });
    return response.data;
  }

  async returnBook(peminjaman_id: number): Promise<ApiResponse<any>> {
    const response = await api.post(`/borrow/return/${peminjaman_id}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default api;