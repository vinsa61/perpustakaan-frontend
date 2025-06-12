"use client";

import { useState, useEffect } from "react";
import { Buku } from "@/types";
import { apiService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function BooksPage() {
  const [books, setBooks] = useState<Buku[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.get("search");
    const available = searchParams.get("available");

    if (search) setSearchQuery(search);
    if (available === "true") setAvailableOnly(true);

    fetchBooks();
  }, [searchParams, availableOnly, currentPage]);

  const fetchBooks = async () => {
    try {
      setLoading(true);

      const response = await apiService.getBooks({
        tersedia: availableOnly || undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 12,
      });

      if (response.status) {
        const booksData = response.data?.data || response.data || [];
        setBooks(booksData);
        setTotalPages(response.pagination?.totalPages || 1);
        setError("");
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks();
  };

  const handleBorrowRequest = async (bookId: number) => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const response = await apiService.createBorrowRequest([bookId]);
      if (response.status) {
        alert("Borrow request submitted successfully!");
        fetchBooks();
      } else {
        alert(response.message);
      }
    } catch (error: any) {
      alert("Failed to submit borrow request");
    }
  };

  const formatAuthors = (pengarang: any) => {
    if (typeof pengarang === "string") {
      return pengarang;
    }
    if (Array.isArray(pengarang)) {
      return pengarang
        .map((author) => `${author.nama_depan} ${author.nama_belakang}`)
        .join(", ");
    }
    return "Unknown Author";
  };

  const getPublisherName = (book: Buku) => {
    if (book.penerbit) {
      return book.penerbit.nama;
    }
    if (book.penerbit_nama) {
      return book.penerbit_nama;
    }
    return "Unknown Publisher";
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "#FDFBF7" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: "#879D82" }}>
            Browse Books
          </h1>
          <p className="text-gray-600">
            Discover and borrow from our extensive collection of books
          </p>
        </div>

        {/* Search and Filters - Removed Category Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search books by title, author, or publisher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#879D82" }}
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available-only"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
                style={{ accentColor: "#879D82" }}
              />
              <label
                htmlFor="available-only"
                className="text-sm font-medium text-gray-700"
              >
                Available only
              </label>
            </div>

            <button
              onClick={() => {
                setSearchQuery("");
                setAvailableOnly(false);
                setCurrentPage(1);
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
              >
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No books found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="relative w-full h-64 mb-4">
                  <Image
                    src={book.cover_image || "/images/placeholder-book.jpg"}
                    alt={book.judul}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {book.judul}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  by {formatAuthors(book.pengarang)}
                </p>
                <p className="text-gray-500 text-xs mb-2">
                  Published in {book.tahun_terbit}
                </p>
                <p className="text-gray-500 text-xs mb-2">
                  Publisher: {getPublisherName(book)}
                </p>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {book.synopsis || "No synopsis available."}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        book.tersedia
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {book.tersedia ? "Available" : "Unavailable"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {book.stok} left
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/books/${book.id}`}
                    className="flex-1 px-3 py-2 border rounded-lg text-center text-sm font-medium hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: "#879D82",
                      color: "#879D82",
                    }}
                  >
                    View Details
                  </Link>

                  {user && book.tersedia && (
                    <button
                      onClick={() => handleBorrowRequest(book.id)}
                      className="px-3 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#879D82" }}
                    >
                      Borrow
                    </button>
                  )}
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
