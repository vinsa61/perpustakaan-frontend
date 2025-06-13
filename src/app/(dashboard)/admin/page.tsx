"use client";

import { useState, useEffect } from "react";
import { BorrowRequest } from "@/types";
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const router = useRouter();

  // Check if user is admin
  const isAdmin = user?.account_type === "admin";

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!isAdmin) {
      router.push("/");
      return;
    }

    fetchRequests();
  }, [filter, currentPage, user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRequests({
        status: filter === "all" ? undefined : filter,
        page: currentPage,
        limit: 10,
      });

      if (response.status) {
        setRequests(response.data?.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    requestId: number,
    status: "approved" | "rejected"
  ) => {
    try {
      const response = await apiService.updateRequestStatus(
        requestId.toString(),
        status
      );

      if (response.status) {
        fetchRequests(); // Refresh the list
      } else {
        alert(response.message);
      }
    } catch (error: any) {
      alert("Failed to update request status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "dipinjam":
        return "bg-blue-100 text-blue-800";
      case "selesai":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "dipinjam":
        return "Borrowed";
      case "selesai":
        return "Returned";
      default:
        return status;
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "#FDFBF7" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: "#879D82" }}>
            Admin Panel
          </h1>
          <p className="text-gray-600">
            Manage borrow requests and library operations
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filter Options */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? "text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor: filter === status ? "#879D82" : undefined,
                  border: filter !== status ? "1px solid #d1d5db" : undefined,
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} Requests
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
              >
                <div className="flex space-x-4">
                  <div className="w-16 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No requests found for the selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative w-16 h-20">
                      <Image
                        src={
                          request.cover_image || "/images/placeholder-book.jpg"
                        }
                        alt={request.book_title}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Book Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {request.book_title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-1">
                          by {request.book_author}
                        </p>
                        <p className="text-gray-500 text-xs mb-2">
                          ISBN: {request.isbn}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {request.publisher}
                        </p>
                      </div>

                      {/* User Information */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Requestor Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Name:</span>{" "}
                            {request.user_name}
                          </p>
                          <p>
                            <span className="font-medium">Username:</span>{" "}
                            {request.username}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span>{" "}
                            {request.email}
                          </p>
                          <p>
                            <span className="font-medium">Role:</span>{" "}
                            {request.academic_role}
                          </p>
                          <p>
                            <span className="font-medium">ID:</span>{" "}
                            {request.no_induk}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Request Date:
                        </span>
                        <p className="text-gray-600">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Borrow Date:
                        </span>
                        <p className="text-gray-600">
                          {new Date(
                            request.tanggal_pinjam
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Due Date:
                        </span>
                        <p className="text-gray-600">
                          {new Date(
                            request.tenggat_pengembalian
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusText(request.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Type: {request.request_type}
                        </span>
                      </div>

                      {request.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(request.id, "approved")
                            }
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(request.id, "rejected")
                            }
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                Previous
              </button>

              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
