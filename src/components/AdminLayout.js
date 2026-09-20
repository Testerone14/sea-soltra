import Link from "next/link";

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-slate-900 text-slate-100">
            {/* Sidebar Modular Navigasi */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
                            S
                        </div>
                        <span className="font-bold text-lg text-white">SOLTRA EPCC</span>
                    </div>

                    <nav className="mt-6 space-y-1">
                        <Link
                            href="/admin"
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white"
                        >
                            📊 Overview Proyek
                        </Link>

                        {/* TAMBAHAN MENU PORTOFOLIO */}
                        <Link
                            href="/admin/portofolio"
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                            💼 Portofolio Proyek
                        </Link>

                        <Link
                            href="/admin/price-book"
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                            🏷️ Master Price Book
                        </Link>
                        <Link
                            href="/admin/parse-pdf"
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                            📄 Parser Tarif & Dokumen
                        </Link>
                    </nav>
                </div>

                <div className="pt-4 border-t border-slate-800">
                    <Link
                        href="/"
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                        ← Kembali ke Website Utama
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
    );
}