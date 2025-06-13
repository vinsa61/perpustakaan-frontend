"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/lib/api";
import { BookshelfBook, BookshelfSummary, Anggota } from "@/types";
import { formatDate } from "@/utils/dateUtils";

interface BookshelfData {
  user: Anggota | null;
  borrow_requests: BookshelfBook[];
  summary: BookshelfSummary;
}

interface BookshelfResponse {
  success: boolean;
  message: string;
  data: BookshelfData;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function BookShelfPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bookshelfData, setBookshelfData] = useState<BookshelfData | null>(
    null
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBookshelf = async (page = 1, status = "all") => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (status !== "all") {
        params.status = status;
      }

      const response = await apiService.getBookshelf(
        user.id.toString(),
        params
      ) as unknown as BookshelfResponse;

      if (response.success) {
        setBookshelfData(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || "Failed to fetch bookshelf data");
      }
    } catch (err) {
      setError("An error occurred while fetching your bookshelf");
      console.error("Bookshelf fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBookshelf(currentPage, statusFilter);
    }
  }, [isAuthenticated, user, currentPage, statusFilter]);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "borrowed":
      case "active":
        return "bg-blue-100 text-blue-800";
      case "returned":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplay = (book: BookshelfBook) => {
    if (book.borrow_info.status_detail === "overdue") {
      return `Overdue (${book.borrow_info.days_overdue} days)`;
    }
    return (
      book.borrow_info.current_status.charAt(0).toUpperCase() +
      book.borrow_info.current_status.slice(1)
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Please log in to view your bookshelf.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookshelf</h1>
          <p className="text-gray-600 mt-2">
            Manage your borrowed books and view your reading history
          </p>
        </div>

        {/* Summary Cards */}
        {bookshelfData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">
                {bookshelfData.summary.total_requests}
              </div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">
                {bookshelfData.summary.active_borrowed}
              </div>
              <div className="text-sm text-gray-600">Currently Borrowed</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-purple-600">
                {bookshelfData.summary.returned}
              </div>
              <div className="text-sm text-gray-600">Returned</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-gray-600">
                {bookshelfData.summary.completed}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-red-600">
                {bookshelfData.summary.overdue}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Filter Books
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Books" },
              { key: "borrowed", label: "Currently Borrowed" },
              { key: "returned", label: "Returned" },
              { key: "completed", label: "Completed" },
              { key: "overdue", label: "Overdue" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleStatusFilter(filter.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === filter.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="text-red-800">
                <h3 className="text-sm font-medium">Error</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Books List */}
        {!loading && bookshelfData && (
          <div className="space-y-6">
            {bookshelfData.borrow_requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No books found
                </h3>
                <p className="text-gray-600">
                  {statusFilter === "all"
                    ? "You haven't borrowed any books yet."
                    : `No books found with status: ${statusFilter}`}
                </p>
              </div>
            ) : (
              bookshelfData.borrow_requests.map((book) => (
                <div
                  key={`${book.peminjaman_id}-${book.detail_id}`}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {book.book_title}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p>
                              <strong>Authors:</strong>{" "}
                              {book.book_authors.join(", ")}
                            </p>
                            <p>
                              <strong>Category:</strong> {book.kategori}
                            </p>
                            <p>
                              <strong>Year:</strong> {book.tahun_terbit}
                            </p>
                            <p>
                              <strong>Publisher:</strong> {book.publisher.name}
                            </p>
                          </div>

                          <div>
                            <p>
                              <strong>Borrowed Date:</strong>{" "}
                              {formatDate(book.borrow_info.tanggal_pinjam)}
                            </p>
                            <p>
                              <strong>Due Date:</strong>{" "}
                              {formatDate(
                                book.borrow_info.tenggat_pengembalian
                              )}
                            </p>
                            {book.return_info && (
                              <>
                                <p>
                                  <strong>Returned Date:</strong>{" "}
                                  {formatDate(
                                    book.return_info.tanggal_dikembalikan
                                  )}
                                </p>
                                {book.return_info.denda > 0 && (
                                  <p>
                                    <strong>Fine:</strong> Rp{" "}
                                    {book.return_info.denda.toLocaleString()}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 flex flex-col items-end">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            book.borrow_info.current_status
                          )}`}
                        >
                          {getStatusDisplay(book)}
                        </span>

                        {book.borrow_info.status_detail === "overdue" && (
                          <div className="mt-2 text-red-600 text-sm font-medium">
                            {book.borrow_info.days_overdue} day(s) overdue
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.totalPages} (
              {pagination.total} total items)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                )
                .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {index > 0 && arr[index - 1] !== page - 1 && (
                      <span className="px-3 py-2 text-sm text-gray-500">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
