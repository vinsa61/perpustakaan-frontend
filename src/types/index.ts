export interface Admin {
  id: number;
  nama: string;
  username: string;
  email: string;
  password?: string;
}

export interface Anggota {
  id: number;
  nama: string;
  username: string;
  email: string;
  password?: string;
  academic_role: 'mahasiswa' | 'dosen' | 'tendik';
  no_induk: string;
}

export interface User extends Anggota {
  account_type: 'admin' | 'member';
  token?: string;
}

export interface Pengarang {
  id: number;
  nama_depan: string;
  nama_belakang: string;
  kewarganegaraan: string;
}

export interface Penerbit {
  id: number;
  nama: string;
  alamat_jalan: string;
  kota: string;
}

export interface Buku {
  id: number;
  judul: string;
  id_penerbit: number;
  tahun_terbit: number;
  stok: number;
  tersedia: boolean;
  cover_image?: string;
  synopsis?: string;
  isbn?: string;
  // Joined data
  penerbit?: Penerbit;
  pengarang?: Pengarang[];
  penerbit_nama?: string;
}

export interface Book extends Buku {} // Alias for compatibility

export interface Peminjaman {
  id: number;
  tanggal_pinjam: string;
  tenggat_pengembalian: string;
  status: 'dipinjam' | 'selesai';
  user_id: number;
}

export interface PeminjamanDetail {
  id: number;
  peminjaman_id: number;
  buku_id: number;
}

export interface Pengembalian {
  id: number;
  tanggal_dikembalikan: string;
  denda: number;
  peminjaman_id: number;
  admin_id?: number;
}

export interface BorrowRequest {
  id: number;
  user_id: number;
  book_id: number;
  request_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'dipinjam' | 'selesai';
  created_at: string;
  tanggal_pinjam: string;
  tenggat_pengembalian: string;
  book_title: string;
  book_author: string;
  cover_image?: string;
  isbn?: string;
  publisher: string;
  user_name: string;
  username: string;
  email: string;
  academic_role: string;
  no_induk: string;
}

export interface BookshelfBook {
  peminjaman_id: number;
  book_id: number;
  book_title: string;
  book_author: string;
  kategori: string;
  tahun_terbit: number;
  stok: number;
  tersedia: boolean;
  publisher: string;
  publisher_address: string;
  publisher_city: string;
  tanggal_pinjam: string;
  tenggat_pengembalian: string;
  status: 'dipinjam' | 'selesai';
  book_status: 'borrowed' | 'returned';
  tanggal_dikembalikan?: string;
  denda: number;
  request_date: string;
}

export interface BookshelfSummary {
  total_requests: number;
  borrowed: number;
  returned: number;
  dipinjam: number;
  selesai: number;
}

export interface BookshelfData {
  user: Anggota | null;
  books: BookshelfBook[];
  summary: BookshelfSummary;
}

export interface BookshelfApiResponse {
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

export interface BorrowingHistory {
  id: number;
  aksi: 'pinjam' | 'kembali';
  tanggal_aksi: string;
  jumlah_buku: number;
  keterangan?: string;
  peminjaman_id: number;
  tanggal_pinjam: string;
  tenggat_pengembalian: string;
  peminjaman_status: 'dipinjam' | 'selesai';
}

export interface BookshelfStats {
  currently_borrowed: number;
  total_returned: number;
  total_borrowings: number;
  total_fines: number;
  overdue_count: number;
}

export interface VwDaftarPeminjamanAnggota {
  peminjaman_id: number;
  tanggal_pinjam: string;
  tenggat_pengembalian: string;
  status: 'dipinjam' | 'selesai';
  anggota_id: number;
  nama_anggota: string;
  no_induk: string;
  academic_role: 'mahasiswa' | 'dosen' | 'tendik';
  jumlah_buku: number;
  daftar_buku: string;
  status_peminjaman: 'Terlambat' | 'Aktif' | 'Selesai';
  hari_terlambat: number;
}

export interface VwDaftarPeminjamanPerpustakaan {
  peminjaman_id: number;
  nama_peminjam: string;
  no_induk: string;
  academic_role: 'mahasiswa' | 'dosen' | 'tendik';
  tanggal_pinjam: string;
  tenggat_pengembalian: string;
  status: 'dipinjam' | 'selesai';
  total_buku_dipinjam: number;
  status_detail: 'Terlambat' | 'Dipinjam' | 'Dikembalikan';
  hari_keterlambatan: number;
  estimasi_denda: number;
}

export interface VwDaftarPengembalian {
  pengembalian_id: number;
  peminjaman_id: number;
  nama_peminjam: string;
  no_induk: string;
  academic_role: 'mahasiswa' | 'dosen' | 'tendik';
  tanggal_pinjam: string;
  tenggat_pengembalian: string;
  tanggal_dikembalikan: string;
  denda: number;
  nama_admin?: string;
  jumlah_buku_dikembalikan: number;
  daftar_buku_dikembalikan: string;
  hari_terlambat: number;
  kategori_keterlambatan: 'Tepat Waktu' | 'Terlambat (1-7 hari)' | 'Terlambat (1-4 minggu)' | 'Sangat Terlambat (>1 bulan)';
}

export interface VwLaporanBukuSeringDipinjam {
  buku_id: number;
  judul: string;
  pengarang: string;
  penerbit: string;
  tahun_terbit: number;
  kategori: string;
  stok_tersedia: number;
  total_dipinjam: number;
  jumlah_peminjam_unik: number;
  terakhir_dipinjam?: string;
  rata_rata_hari_pinjam?: number;
  sedang_dipinjam: number;
  persentase_dari_total_peminjaman: number;
  kategori_popularitas: 'Sangat Populer' | 'Populer' | 'Cukup Populer' | 'Jarang Dipinjam';
}

export interface VwStatistikPerpustakaan {
  metrik: string;
  nilai: number;
  satuan: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Function/Procedure Result Types
export interface DendaCalculationResult {
  denda: number;
}

export interface StokCheckResult {
  stok: number;
}

export interface BlacklistCheckResult {
  is_blacklisted: boolean;
}

export interface SearchBooksResult {
  hasil: string;
}

export interface DeadlineCheckResult {
  sisa_hari: number;
}

export interface PeminjamanProcedureResult {
  peminjaman_id: number;
  status_message: string;
}

export interface PengembalianProcedureResult {
  total_denda: number;
  status_message: string;
}