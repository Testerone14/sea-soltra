// src/app/admin/page.js
"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import SCurveChart from "@/components/admin/SCurveChart";

const initialProjects = [
    {
        id: "PRJ-001",
        name: "PLTS Rooftop Cikarang Industrial",
        region: "Jawa Barat",
        capacity: "500 kWp",
        status: "Running",
        prepStage: "-",
        client: "PT Industri Makmur",
        value: "IDR 7.5 Miliar",
        sCurve: {
            months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
            planned: [10, 25, 45, 70, 90, 100],
            actual: [8, 20, 40, 65, 82, 95],
        },
    },
    {
        id: "PRJ-002",
        name: "PLTS Ground-Mounted Subang",
        region: "Jawa Barat",
        capacity: "2.5 MWp",
        status: "Preparation",
        prepStage: "Pengadaan Lahan & Perizinan PLN (55%)",
        client: "PT Energi Bersama",
        value: "IDR 32 Miliar",
        sCurve: {
            months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
            planned: [5, 15, 30, 50, 75, 100],
            actual: [5, 12, 28, 45, 60, 80],
        },
    },
];

export default function AdminDashboard() {
    const [projectsList, setProjectsList] = useState(initialProjects);
    const [selectedRegion, setSelectedRegion] = useState("All");
    const [selectedProjectId, setSelectedProjectId] = useState(initialProjects[0].id);

    // State Terpisah untuk Modal Tambah Proyek (Modular & Tidak Mengganggu View Utama)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        id: `PRJ-00${initialProjects.length + 1}`,
        name: "",
        region: "Jawa Barat",
        capacity: "",
        status: "Preparation",
        prepStage: "Studi Kelayakan Awal (10%)",
        client: "",
        value: "",
    });

    // Filter Proyek berdasarkan Region
    const filteredProjects = selectedRegion === "All"
        ? projectsList
        : projectsList.filter((p) => p.region === selectedRegion);

    // Proyek aktif yang sedang dibaca Kurva S-nya
    const activeProject = projectsList.find((p) => p.id === selectedProjectId) || filteredProjects[0] || projectsList[0];

    // Statistik Kontrak Dinamis
    const totalContracts = filteredProjects.length;
    const runningContracts = filteredProjects.filter((p) => p.status === "Running").length;
    const prepContracts = filteredProjects.filter((p) => p.status === "Preparation").length;

    // Handler Simpan Proyek Baru
    const handleAddProjectSubmit = (e) => {
        e.preventDefault();
        const projectToAdd = {
            ...newProject,
            sCurve: {
                months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
                planned: [10, 30, 50, 70, 90, 100],
                actual: [5, 15, 30, 50, 70, 85],
            },
        };
        setProjectsList([...projectsList, projectToAdd]);
        setSelectedProjectId(projectToAdd.id); // Otomatis mengarahkan pilihan ke proyek baru
        setIsAddModalOpen(false);

        // Reset form
        setNewProject({
            id: `PRJ-00${projectsList.length + 2}`,
            name: "",
            region: "Jawa Barat",
            capacity: "",
            status: "Preparation",
            prepStage: "Studi Kelayakan Awal (10%)",
            client: "",
            value: "",
        });
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">

                {/* HEADER & KONTROL FILTER GLOBAL/REGIONAL */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/70 p-5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-lg">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">EPCC Control Tower & Overview</h1>
                        <p className="text-sm text-slate-400">Monitoring Kontrak, Status Persiapan, dan Live Kurva S Terintegrasi</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Filter Cakupan Wilayah */}
                        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                            <span className="text-xs text-slate-400 font-medium">Cakupan:</span>
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="bg-transparent text-white text-sm font-semibold outline-none cursor-pointer"
                            >
                                <option value="All" className="bg-slate-900">🌐 Global (Semua Region)</option>
                                <option value="Jawa Barat" className="bg-slate-900">📍 Jawa Barat</option>
                                <option value="Sumatera" className="bg-slate-900">📍 Sumatera</option>
                            </select>
                        </div>

                        {/* Tombol Terpisah untuk Memicu Form Tambah Proyek */}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-sky-600/20 flex items-center gap-2 ml-auto"
                        >
                            <span>+ Tambah Proyek Baru</span>
                        </button>
                    </div>
                </div>

                {/* RINGKASAN METRIK KONTRAK */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-md">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Kontrak Aktif</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <h2 className="text-3xl font-black text-white">{totalContracts}</h2>
                            <span className="text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">Semua Status</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-md">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kontrak Running (Executing)</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <h2 className="text-3xl font-black text-emerald-400">{runningContracts}</h2>
                            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Konstruksi Berjalan</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-md">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kontrak Persiapan Running</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <h2 className="text-3xl font-black text-amber-400">{prepContracts}</h2>
                            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Pre-Execution</span>
                        </div>
                    </div>
                </div>

                {/* SECTION UTAMA: PEMBACAAN LIVE KURVA S & DETAIL PROYEK TERPISAH */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Kolom Kiri: Pemilihan Proyek & Detail Status Tahapan */}
                    <div className="lg:col-span-1 space-y-5 bg-slate-900/40 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-base font-bold text-white">Panel Navigasi Proyek</h2>
                                <p className="text-xs text-slate-400">Pilih proyek untuk melihat update Kurva S live</p>
                            </div>

                            {/* Dropdown Pemilih Proyek Spesifik */}
                            <div>
                                <label className="text-xs text-slate-300 font-medium block mb-1.5">Proyek Terpilih:</label>
                                <select
                                    value={activeProject?.id || ""}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-500"
                                >
                                    {filteredProjects.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.id} - {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {activeProject && (
                                <div className="space-y-3 pt-3 border-t border-slate-800">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Region:</span>
                                        <span className="text-white font-semibold">{activeProject.region}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Kapasitas:</span>
                                        <span className="text-white font-semibold">{activeProject.capacity}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Nilai Kontrak:</span>
                                        <span className="text-emerald-400 font-semibold">{activeProject.value}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Klien:</span>
                                        <span className="text-slate-200 font-medium">{activeProject.client}</span>
                                    </div>

                                    {/* Status & Tahap Persiapan Running */}
                                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 mt-3">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Status Kontrak</span>
                                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${activeProject.status === "Running" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                            }`}>
                                            {activeProject.status === "Running" ? "🟢 Running (Executing)" : "🟡 Persiapan Running"}
                                        </span>

                                        {activeProject.status === "Preparation" && (
                                            <div className="mt-3 pt-3 border-t border-slate-800/80">
                                                <span className="text-xs text-slate-400 block mb-1 font-semibold">Tahap Proses Saat Ini:</span>
                                                <p className="text-xs text-amber-200/90 font-medium leading-relaxed bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                                                    {activeProject.prepStage}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kolom Kanan: Tampilan Live Kurva S yang Terisolasi dan Komprehensif */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                        {activeProject && <SCurveChart sCurveData={activeProject.sCurve} />}
                    </div>
                </div>

                {/* MODAL TERPISAH: FORM TAMBAH PROYEK BARU */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <h3 className="text-lg font-bold text-white">Form Pendaftaran Proyek & Kontrak Baru</h3>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="text-slate-400 hover:text-white text-lg font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleAddProjectSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-300 block mb-1 font-medium">Nama Proyek</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: PLTS Industri Karawang"
                                        value={newProject.name}
                                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-300 block mb-1 font-medium">Region / Wilayah</label>
                                        <select
                                            value={newProject.region}
                                            onChange={(e) => setNewProject({ ...newProject, region: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                                        >
                                            <option value="Jawa Barat">Jawa Barat</option>
                                            <option value="Sumatera">Sumatera</option>
                                            <option value="Jawa Tengah">Jawa Tengah</option>
                                            <option value="Kalimantan">Kalimantan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-300 block mb-1 font-medium">Kapasitas</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Contoh: 1.2 MWp"
                                            value={newProject.capacity}
                                            onChange={(e) => setNewProject({ ...newProject, capacity: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-300 block mb-1 font-medium">Status Kontrak</label>
                                        <select
                                            value={newProject.status}
                                            onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                                        >
                                            <option value="Preparation">Preparation (Persiapan)</option>
                                            <option value="Running">Running (Berjalan)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-300 block mb-1 font-medium">Nilai Kontrak</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Contoh: IDR 15 Miliar"
                                            value={newProject.value}
                                            onChange={(e) => setNewProject({ ...newProject, value: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                                        />
                                    </div>
                                </div>

                                {newProject.status === "Preparation" && (
                                    <div>
                                        <label className="text-xs text-slate-300 block mb-1 font-medium">Tahap Proses Persiapan Saat Ini</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Pengurusan Izin PLN & Desain (40%)"
                                            value={newProject.prepStage}
                                            onChange={(e) => setNewProject({ ...newProject, prepStage: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs text-slate-300 block mb-1 font-medium">Nama Klien / Perusahaan</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: PT Semen Nusantara"
                                        value={newProject.client}
                                        onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-xl transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition shadow-lg shadow-sky-600/20"
                                    >
                                        Simpan Proyek Baru
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}