"use client";

import { useState, useEffect } from "react";
import { Buku } from "@/types"; // Changed from Book to Buku
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import BookCard from "@/components/books/BookCard";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [featuredBooks, setFeaturedBooks] = useState<Buku[]>([]); // Changed type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);
  const fetchFeaturedBooks = async () => {
    try {
      setLoading(true);

      const response = await apiService.getBooks({
        limit: 6,
        tersedia: true,
      });

      if (response.status) {
        const booksData = response.data?.data || response.data || [];
        setFeaturedBooks(booksData);
        setError("");
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError("Failed to fetch featured books");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBF7" }}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="max-w-7xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-6xl font-bold mb-6"
            style={{ color: "#003880" }}
          >
            MyITS Library
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover thousands of books, manage your reading journey, and
            explore knowledge at your fingertips.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/books"
                  className="px-8 py-4 rounded-lg text-white font-semibold text-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#003880" }}
                >
                  Browse Books
                </Link>
                <Link
                  href="/bookshelf"
                  className="px-8 py-4 rounded-lg border-2 font-semibold text-lg hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: "#003880",
                    color: "#003880",
                  }}
                >
                  My Bookshelf
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-lg text-white font-semibold text-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#003880" }}
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-lg border-2 font-semibold text-lg hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: "#003880",
                    color: "#003880",
                  }}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ color: "#003880" }}
          >
            Why Choose MyITS Library?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#003880" }}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Vast Collection</h3>
              <p className="text-gray-600">
                Access thousands of books from various authors and publishers.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#E2725B" }}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Management</h3>
              <p className="text-gray-600">
                Track your borrowed books, due dates, and request history
                effortlessly.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              {" "}
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#003880" }}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Access</h3>
              <p className="text-gray-600">
                Find and borrow books instantly with our user-friendly
                interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {" "}
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: "#003880" }}>
              Featured Books
            </h2>
            <Link
              href="/books"
              className="text-lg font-medium hover:underline"
              style={{ color: "#003880" }}
            >
              View All Books →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
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
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onBorrowSuccess={fetchFeaturedBooks}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#003880" }}>
            Ready to Start Reading?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our digital library community and unlock access to thousands of
            books.
          </p>

          {!user && (
            <Link
              href="/register"
              className="inline-block px-8 py-4 rounded-lg text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#003880" }}
            >
              Sign Up Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
