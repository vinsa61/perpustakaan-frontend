"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import toast from "react-hot-toast";

interface ViewData {
  peminjamanAnggota: any[];
  peminjamanPerpustakaan: any[];
  pengembalian: any[];
  bukuPopuler: any[];
  statistik: any[];
}

export default function AdminViewsPage() {
  const [viewData, setViewData] = useState<ViewData>({
    peminjamanAnggota: [],
    peminjamanPerpustakaan: [],
    pengembalian: [],
    bukuPopuler: [],
    statistik: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeView, setActiveView] =
    useState<keyof ViewData>("peminjamanAnggota");
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

    fetchAllViews();
  }, [user, isAdmin, router]);

  const fetchAllViews = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        peminjamanAnggotaRes,
        peminjamanPerpustakaanRes,
        pengembalianRes,
        bukuPopulerRes,
        statistikRes,
      ] = await Promise.all([
        apiService.getPeminjamanAnggotaView(),
        apiService.getPeminjamanPerpustakaanView(),
        apiService.getPengembalianView(),
        apiService.getBukuPopulerView(),
        apiService.getStatistikView(),
      ]);

      console.log("API Responses:", {
        peminjamanAnggotaRes,
        peminjamanPerpustakaanRes,
        pengembalianRes,
        bukuPopulerRes,
        statistikRes,
      });

      setViewData({
        peminjamanAnggota: peminjamanAnggotaRes.status
          ? peminjamanAnggotaRes.data
          : [],
        peminjamanPerpustakaan: peminjamanPerpustakaanRes.status
          ? peminjamanPerpustakaanRes.data
          : [],
        pengembalian: pengembalianRes.status ? pengembalianRes.data : [],
        bukuPopuler: bukuPopulerRes.status ? bukuPopulerRes.data : [],
        statistik: statistikRes.status ? statistikRes.data : [],
      });
    } catch (error: any) {
      setError("Failed to fetch database views");
      toast.error("Failed to load database views");
      console.error("Error fetching views:", error);
    } finally {
      setLoading(false);
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

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "number") {
      if (value > 1000000) {
        return `Rp ${value.toLocaleString("id-ID")}`;
      }
      return value.toLocaleString("id-ID");
    }
    return value.toString();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const viewTabs = [
    { key: "peminjamanAnggota", label: "Peminjaman Anggota", icon: "👥" },
    {
      key: "peminjamanPerpustakaan",
      label: "Peminjaman Perpustakaan",
      icon: "📚",
    },
    { key: "pengembalian", label: "Pengembalian", icon: "↩️" },
    { key: "bukuPopuler", label: "Buku Populer", icon: "⭐" },
    { key: "statistik", label: "Statistik", icon: "📊" },
  ];
  const renderTable = () => {
    const data = viewData[activeView];

    console.log(`Current view: ${activeView}`, data);

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No data available</p>
          <p className="text-xs text-gray-400 mt-2">
            Current view: {activeView} | Data length:{" "}
            {data ? data.length : "null"}
          </p>
        </div>
      );
    }

    // Get column headers from the first row
    const columns = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                >
                  {column
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-4 py-3 text-sm text-gray-900 border-b"
                  >
                    {column.includes("tanggal") || column.includes("date")
                      ? formatDate(row[column])
                      : formatValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "#FDFBF7" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: "#003880" }}>
            Database Views
          </h1>
          <p className="text-gray-600">
            View comprehensive reports and statistics from database views
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: "#003880" }}
            ></div>
            <span className="ml-2 text-gray-600">
              Loading database views...
            </span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700">{error}</div>
            <button
              onClick={fetchAllViews}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* View Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                  {viewTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveView(tab.key as keyof ViewData)}
                      className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                        activeView === tab.key
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                      style={{
                        borderColor:
                          activeView === tab.key ? "#003880" : "transparent",
                        color: activeView === tab.key ? "#003880" : undefined,
                      }}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Data Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Total records: {viewData[activeView]?.length || 0}
              </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {renderTable()}
            </div>

            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={fetchAllViews}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#003880" }}
              >
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
