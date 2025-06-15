"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            {" "}
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/library2.png"
                alt="My ITS Library"
                width={200}
                height={200}
                className="-translate-y-10"
              />
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed -translate-y-24">
              Your gateway to knowledge. Discover, borrow, and explore thousands
              of books in our modern library system.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/books"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Browse Books
                </Link>
              </li>
              <li>
                <Link
                  href="/bookshelf"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  My Bookshelf
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <p className="text-gray-500 text-sm">
              © {currentYear} Digital Library. Final Project - Database
              Management.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
