import axios, { AxiosError } from "axios";
import { GetServerSidePropsContext } from "next/types";
import Cookies from "universal-cookie";

import { getToken } from "@/lib/cookies";
import {
  UninterceptedApiError,
  ApiResponse,
  PaginatedApiResponse,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const context = <GetServerSidePropsContext>{};

export const baseURL =
  process.env.NEXT_PUBLIC_RUN_MODE === "development"
    ? process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:5000/api"
    : process.env.NEXT_PUBLIC_API_URL_PROD || "http://localhost:5000/api";

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
  }
);

// API Service Class
class ApiService {
  // Auth APIs
  async register(userData: {
    nama: string;
    username: string;
    email: string;
    password: string;
    academic_role: "mahasiswa" | "dosen" | "tendik";
    no_induk: string;
  }): Promise<ApiResponse<any>> {
    const response = await api.post("/auth/register", userData);
    return response.data;
  }
  async login(credentials: {
    username: string;
    password: string;
  }): Promise<ApiResponse<any>> {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  }

  async logout() {
    if (isBrowser) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  // Books APIs
  async getBooks(params?: {
    tersedia?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedApiResponse<any[]>> {
    const response = await api.get("/books", { params });
    return response.data;
  }

  async getBookById(id: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/books/${id}`);
    return response.data;
  } // Admin APIs
  async getRequests(params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const response = await api.get("/admin/requests", { params });
    return response.data;
  }
  async updateRequestStatus(
    id: string,
    action: "approve" | "reject"
  ): Promise<ApiResponse<any>> {
    const response = await api.patch(`/admin/requests/${id}`, { action });
    return response.data;
  }

  async getAdminStatistics(): Promise<any> {
    const response = await api.get("/admin/statistics");
    return response.data;
  }
  // Bookshelf API
  async getBookshelf(
    userId: string,
    params?: {
      status?:
        | "borrowed"
        | "returned"
        | "completed"
        | "overdue"
        | "dipinjam"
        | "selesai";
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<any>> {
    const response = await api.get(`/bookshelf/${userId}`, { params });
    return response.data;
  }
  // Get bookshelf summary
  async getBookshelfSummary(userId: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/bookshelf/${userId}/summary`);
    return response.data;
  }

  // Get bookshelf statistics
  async getBookshelfStatistics(userId: string): Promise<any> {
    const response = await api.get(`/bookshelf/${userId}/statistics`);
    return response.data;
  }

  // Get borrowing history
  async getBorrowingHistory(
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const response = await api.get(`/bookshelf/${userId}/history`, { params });
    return response.data;
  }

  // Borrow Request API (if you need to add this functionality)
  async createBorrowRequest(bookIds: number[]): Promise<ApiResponse<any>> {
    const response = await api.post("/borrow/request", { bookIds });
    return response.data;
  }

  async returnBook(peminjaman_id: number): Promise<ApiResponse<any>> {
    const response = await api.post(`/borrow/return/${peminjaman_id}`);
    return response.data;
  }

  // Admin APIs for managing borrow requests
  async approveBorrowRequest(peminjamanId: number): Promise<ApiResponse<any>> {
    const response = await api.post(`/admin/requests/${peminjamanId}/approve`);
    return response.data;
  }

  async rejectBorrowRequest(
    peminjamanId: number,
    reason?: string
  ): Promise<ApiResponse<any>> {
    const response = await api.post(`/admin/requests/${peminjamanId}/reject`, {
      reason,
    });
    return response.data;
  }

  // Admin APIs for managing return requests
  async approveReturnRequest(peminjamanId: number): Promise<ApiResponse<any>> {
    const response = await api.post(`/admin/returns/${peminjamanId}/approve`);
    return response.data;
  }

  async rejectReturnRequest(
    peminjamanId: number,
    reason?: string
  ): Promise<ApiResponse<any>> {
    const response = await api.post(`/admin/returns/${peminjamanId}/reject`, {
      reason,
    });
    return response.data;
  }

  // Database Views APIs
  async getPeminjamanAnggotaView(): Promise<ApiResponse<any>> {
    const response = await api.get("/admin/views/peminjaman-anggota");
    return response.data;
  }

  async getPeminjamanPerpustakaanView(): Promise<ApiResponse<any>> {
    const response = await api.get("/admin/views/peminjaman-perpustakaan");
    return response.data;
  }

  async getPengembalianView(): Promise<ApiResponse<any>> {
    const response = await api.get("/admin/views/pengembalian");
    return response.data;
  }

  async getBukuPopulerView(): Promise<ApiResponse<any>> {
    const response = await api.get("/admin/views/buku-populer");
    return response.data;
  }

  async getStatistikView(): Promise<ApiResponse<any>> {
    const response = await api.get("/admin/views/statistik");
    return response.data;
  }
}

export const apiService = new ApiService();
export default api;
