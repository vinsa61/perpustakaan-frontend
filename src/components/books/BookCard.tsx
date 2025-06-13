"use client";

import { Buku } from "@/types"; // Changed from Book to Buku
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookCardProps {
  book: Buku; // Changed from Book to Buku
  onBorrowSuccess?: () => void;
}

export default function BookCard({ book, onBorrowSuccess }: BookCardProps) {
  const [borrowing, setBorrowing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const isAvailable = book.tersedia === true;

  // Format authors according to new schema
  const formatAuthors = (pengarang: Buku["pengarang"]) => {
    if (!pengarang) {
      return "Unknown Author";
    }
    if (Array.isArray(pengarang)) {
      return pengarang
        .map((author) => `${author.nama_depan} ${author.nama_belakang}`)
        .join(", ");
    }
    if (typeof pengarang === "string") {
      return pengarang;
    }
    return "Unknown Author";
  };

  // Get publisher name according to new schema
  const getPublisherName = () => {
    if (book.penerbit) {
      return book.penerbit.nama;
    }
    if (book.penerbit_nama) {
      return book.penerbit_nama;
    }
    return "Unknown Publisher";
  };

  const handleBorrowRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isAvailable) return;

    try {
      setBorrowing(true);
      const response = await apiService.createBorrowRequest([book.id]);

      if (response.status) {
        alert("Borrow request submitted successfully!");
        onBorrowSuccess?.();
      } else {
        alert(response.message || "Failed to submit borrow request");
      }
    } catch (error: any) {
      alert("Failed to submit borrow request");
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-64 w-full">
        {" "}
        <Image
          src="/images/placeholder-book.jpg"
          alt={book.judul}
          fill
          className="object-contain"
        />
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
            isAvailable
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isAvailable ? "Available" : "Not Available"}
        </div>
        {/* Stock indicator */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
          {book.stok} {book.stok === 1 ? "copy" : "copies"}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">
          {book.judul}
        </h3>

        {/* Author(s) */}
        <p className="text-gray-600 text-sm mb-1">
          by {formatAuthors(book.pengarang)}
        </p>

        {/* Publisher and Year */}
        <p className="text-gray-500 text-xs mb-2">
          {getPublisherName()} • {book.tahun_terbit}
        </p>

        <div className="flex justify-between items-center">
          <Link
            href={`/books/${book.id}`}
            className="text-sm px-3 py-1 rounded border transition-colors hover:bg-gray-50"
            style={{
              borderColor: "#879D82",
              color: "#879D82",
            }}
          >
            View Details
          </Link>

          {user ? (
            <button
              onClick={handleBorrowRequest}
              disabled={!isAvailable || borrowing}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAvailable && !borrowing
                  ? "text-white hover:opacity-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              style={{
                backgroundColor:
                  isAvailable && !borrowing ? "#879D82" : undefined,
              }}
            >
              {borrowing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  Borrowing...
                </div>
              ) : isAvailable ? (
                "Borrow"
              ) : (
                "Unavailable"
              )}
            </button>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#879D82" }}
            >
              Sign In to Borrow
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
