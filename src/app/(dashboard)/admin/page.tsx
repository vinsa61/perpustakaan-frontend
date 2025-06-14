"use client";

import { useState, useEffect } from "react";
import { AdminRequest, AdminRequestsResponse } from "@/types";
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";

export default function AdminPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [statistics, setStatistics] = useState({
    total_requests: 0,
    waiting_approval: 0,
    borrowed: 0,
    returned: 0,
    waiting_return_approval: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    | "all"
    | "waiting for approval"
    | "borrowed"
    | "returned"
    | "waiting for return approval"
    | "completed"
  >("all");
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
    fetchStatistics();
  }, [filter, currentPage, user]);

  const fetchStatistics = async () => {
    try {
      const response = await apiService.getAdminStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      if (filter !== "all") {
        params.type = filter;
      }
      const response: AdminRequestsResponse = await apiService.getRequests(
        params
      );
      if (response.success) {
        setRequests(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setError("");
      } else {
        setError(response.message || "Failed to fetch requests");
      }
    } catch (error: any) {
      setError("Failed to fetch requests");
      console.error("Fetch requests error:", error);
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting for approval":
        return "bg-yellow-100 text-yellow-800";
      case "borrowed":
        return "bg-blue-100 text-blue-800";
      case "returned":
        return "bg-orange-100 text-orange-800";
      case "waiting for return approval":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting for approval":
        return "Waiting for Approval";
      case "borrowed":
        return "Borrowed";
      case "returned":
        return "Returned";
      case "waiting for return approval":
        return "Waiting for Return Approval";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };
  // Handle borrow request approval/rejection
  const handleBorrowAction = async (
    requestId: number,
    action: "approve" | "reject"
  ) => {
    try {
      const response =
        action === "approve"
          ? await apiService.approveBorrowRequest(requestId)
          : await apiService.rejectBorrowRequest(requestId);
      if (response.status) {
        fetchRequests(); // Refresh the list
        fetchStatistics(); // Refresh statistics
        toast.success(`Borrow request ${action}d successfully!`);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(`Failed to ${action} borrow request`);
    }
  };
  // Handle return request approval/rejection
  const handleReturnAction = async (
    requestId: number,
    action: "approve" | "reject"
  ) => {
    try {
      const response =
        action === "approve"
          ? await apiService.approveReturnRequest(requestId)
          : await apiService.rejectReturnRequest(requestId);
      if (response.status) {
        fetchRequests(); // Refresh the list
        fetchStatistics(); // Refresh statistics
        toast.success(`Return request ${action}d successfully!`);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(`Failed to ${action} return request`);
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
          </p>{" "}
        </div>{" "}
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.total_requests}
            </div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {statistics.waiting_approval}
            </div>
            <div className="text-sm text-gray-600">Waiting for Approval</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {statistics.borrowed}
            </div>
            <div className="text-sm text-gray-600">Borrowed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">
              {statistics.returned}
            </div>
            <div className="text-sm text-gray-600">Returned</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {statistics.waiting_return_approval}
            </div>
            <div className="text-sm text-gray-600">Waiting Return Approval</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-indigo-600">
              {statistics.completed}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {/* Filter Options */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {" "}
            {[
              { key: "all", label: "All Requests" },
              { key: "waiting for approval", label: "Waiting for Approval" },
              { key: "borrowed", label: "Borrowed" },
              { key: "returned", label: "Returned" },
              {
                key: "waiting for return approval",
                label: "Waiting Return Approval",
              },
              { key: "completed", label: "Completed" },
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterOption.key
                    ? "text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor:
                    filter === filterOption.key ? "#879D82" : undefined,
                  border:
                    filter !== filterOption.key
                      ? "1px solid #d1d5db"
                      : undefined,
                }}
              >
                {filterOption.label}
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
                key={request.peminjaman_id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex flex-col gap-6">
                  {/* Header with Status */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Borrowing Request #{request.peminjaman_id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.total_books} book(s) •{" "}
                        {formatDate(request.created_at)}
                      </p>
                    </div>{" "}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          request.current_status
                        )}`}
                      >
                        {getStatusText(request.current_status)}
                      </span>{" "}
                      {/* Approve/Reject buttons for pending borrow requests */}
                      {request.current_status === "waiting for approval" && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() =>
                              handleBorrowAction(
                                request.peminjaman_id,
                                "approve"
                              )
                            }
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            title="Approve Borrow Request"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleBorrowAction(
                                request.peminjaman_id,
                                "reject"
                              )
                            }
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            title="Reject Borrow Request"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {/* Approve/Reject buttons for pending return requests */}
                      {request.current_status ===
                        "waiting for return approval" && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() =>
                              handleReturnAction(
                                request.peminjaman_id,
                                "approve"
                              )
                            }
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            title="Approve Return Request"
                          >
                            Approve Return
                          </button>
                          <button
                            onClick={() =>
                              handleReturnAction(
                                request.peminjaman_id,
                                "reject"
                              )
                            }
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            title="Reject Return Request"
                          >
                            Reject Return
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Book Information */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Books
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">
                            Titles:
                          </span>
                          <p className="text-gray-600 text-sm">
                            {request.book_titles}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Authors:
                          </span>
                          <p className="text-gray-600 text-sm">
                            {request.book_authors}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Publishers:
                          </span>
                          <p className="text-gray-600 text-sm">
                            {request.publishers}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User Information */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Borrower Details
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t pt-4">
                    <div>
                      <span className="font-medium text-gray-700">
                        Borrow Date:
                      </span>
                      <p className="text-gray-600">
                        {formatDate(request.tanggal_pinjam)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Due Date:
                      </span>
                      <p className="text-gray-600">
                        {formatDate(request.tenggat_pengembalian)}
                      </p>
                    </div>
                    {request.return_date && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Return Date:
                        </span>
                        <p className="text-gray-600">
                          {formatDate(request.return_date)}
                        </p>
                      </div>
                    )}
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
