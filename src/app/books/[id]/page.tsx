"use client";

import { useState, useEffect } from "react";
import { Buku } from "@/types";
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface BookDetailsPageProps {
  params: {
    id: string;
  };
}

export default function BookDetailsPage({ params }: BookDetailsPageProps) {
  const [book, setBook] = useState<Buku | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [borrowing, setBorrowing] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchBookDetails();
  }, [params.id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBookById(params.id);

      if (response.status) {
        setBook(response.data);
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError("Failed to fetch book details");
    } finally {
      setLoading(false);
    }
  };
  const handleBorrowRequest = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!book) return;

    try {
      setBorrowing(true);
      const response = await apiService.createBorrowRequest([book.id]);
      if (response.status) {
        toast.success(
          "Borrow request submitted successfully! Your request is now pending admin approval."
        );
        fetchBookDetails(); // Refresh book details
      } else {
        toast.error(response.message || "Failed to submit borrow request");
      }
    } catch (error: any) {
      console.error("Borrow request error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit borrow request";
      toast.error(errorMessage);
    } finally {
      setBorrowing(false);
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

  const getPublisherInfo = (book: Buku) => {
    if (book.penerbit) {
      return {
        name: book.penerbit.nama,
        location: `${book.penerbit.kota}`,
      };
    }
    if (book.penerbit_nama) {
      return {
        name: book.penerbit_nama,
        location: "",
      };
    }
    return {
      name: "Unknown Publisher",
      location: "",
    };
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FDFBF7" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#879D82" }}
          ></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: "#FDFBF7" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Book Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The requested book could not be found."}
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#879D82" }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const publisherInfo = getPublisherInfo(book);

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "#FDFBF7" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back to Books</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Book Cover */}
            <div className="flex justify-center">
              <div className="relative w-80 h-96">
                <Image
                  src={book.cover_image || "/images/placeholder-book.jpg"}
                  alt={book.judul}
                  fill
                  className="object-contain rounded-lg shadow-md"
                />
              </div>
            </div>

            {/* Book Information */}
            <div className="space-y-6">
              <div>
                <h1
                  className="text-3xl font-bold mb-2"
                  style={{ color: "#879D82" }}
                >
                  {book.judul}
                </h1>
                <p className="text-xl text-gray-700 mb-2">
                  by {formatAuthors(book.pengarang)}
                </p>
                <p className="text-gray-600">
                  Published by {publisherInfo.name}
                  {publisherInfo.location && ` (${publisherInfo.location})`}
                  in {book.tahun_terbit}
                </p>

                {book.isbn && (
                  <p className="text-sm text-gray-500 mt-2">
                    ISBN: {book.isbn}
                  </p>
                )}
              </div>

              {/* Status and Stock */}
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    book.tersedia
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {book.tersedia ? "Available" : "Unavailable"}
                </span>
                <span className="text-gray-600">
                  {book.stok} {book.stok === 1 ? "copy" : "copies"} available
                </span>
              </div>

              {/* Synopsis */}
              {book.synopsis && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "#879D82" }}
                  >
                    Synopsis
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {book.synopsis}
                  </p>
                </div>
              )}

              {/* Author Details */}
              {Array.isArray(book.pengarang) && book.pengarang.length > 0 && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "#879D82" }}
                  >
                    Author{book.pengarang.length > 1 ? "s" : ""}
                  </h3>
                  <div className="space-y-2">
                    {book.pengarang.map((author) => (
                      <div
                        key={author.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium">
                          {author.nama_depan} {author.nama_belakang}
                        </span>
                        <span className="text-gray-600 text-sm">
                          {author.kewarganegaraan}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publisher Details */}
              {book.penerbit && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "#879D82" }}
                  >
                    Publisher
                  </h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{book.penerbit.nama}</div>
                    <div className="text-gray-600 text-sm">
                      {book.penerbit.alamat_jalan}, {book.penerbit.kota}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-6 space-y-3">
                {user ? (
                  <>
                    {book.tersedia ? (
                      <button
                        onClick={handleBorrowRequest}
                        disabled={borrowing}
                        className="w-full py-3 px-6 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#879D82" }}
                      >
                        {borrowing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Submitting Request...
                          </div>
                        ) : (
                          "Request to Borrow"
                        )}
                      </button>
                    ) : (
                      <div className="w-full py-3 px-6 rounded-lg bg-gray-200 text-gray-500 text-center font-medium">
                        Currently Unavailable
                      </div>
                    )}

                    <button
                      onClick={() => router.push("/bookshelf")}
                      className="w-full py-3 px-6 border-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: "#879D82",
                        color: "#879D82",
                      }}
                    >
                      View My Bookshelf
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-600 text-center">
                      Please sign in to borrow this book
                    </p>
                    <button
                      onClick={() => router.push("/login")}
                      className="w-full py-3 px-6 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#879D82" }}
                    >
                      Sign In to Borrow
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "#879D82" }}
          >
            Book Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Title:</span>
                <span className="text-gray-600 text-right">{book.judul}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Author(s):</span>
                <span className="text-gray-600 text-right">
                  {formatAuthors(book.pengarang)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Publisher:</span>
                <span className="text-gray-600 text-right">
                  {publisherInfo.name}
                </span>
              </div>
              {book.isbn && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">ISBN:</span>
                  <span className="text-gray-600 text-right">{book.isbn}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Year:</span>
                <span className="text-gray-600">{book.tahun_terbit}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Stock:</span>
                <span className="text-gray-600">{book.stok} copies</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    book.tersedia
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {book.tersedia ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
