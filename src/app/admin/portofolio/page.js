"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";

// Parameter Konstanta Lingkungan & Finansial (Effisiensi 70% Rata-rata)
const PSH = 4;
const PR = 0.70; // 70% Efisiensi Rata-rata
const EMISSION_FACTOR = 0.85; // kg CO2 / kWh
const COAL_FACTOR = 0.40; // kg Batu Bara / kWh
const TREE_FACTOR = 21.0; // kg CO2 / pohon / tahun
const DEFAULT_TARIFF = 1444.70; // Rp / kWh

export default function PortfolioAdminPage() {
    const [portfolioList, setPortfolioList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nama: "",
        kategori: "C&I",
        lokasi: "",
        kapasitasNum: "", // Angka murni kWp
        tipe: "On-Grid",
        inverter: "",
        battery: "",
        tahun: new Date().getFullYear().toString(),
        status: "Completed (BAST Done)",
        gdriveUrl: "",
        uploadedImages: [], // Array gambar (Base64 atau URL)
    });

    // Load Data dari LocalStorage saat Mount
    useEffect(() => {
        const saved = localStorage.getItem("custom_portfolios");
        if (saved) {
            try {
                setPortfolioList(JSON.parse(saved));
            } catch (e) {
                console.error("Gagal parse portfolios", e);
            }
        } else {
            // Default Data Awal
            const initialData = [
                calculateCalculatedFields({
                    id: "PRJ-001",
                    nama: "PLTS Hybrid Pegangsaan Dua",
                    kategori: "Residensial",
                    lokasi: "Pegangsaan Dua, Jakarta Utara",
                    kapasitasNum: 5.5,
                    tipe: "Hybrid System",
                    inverter: "Sigenergy / Huawei",
                    battery: "LiFePO4 Storage System",
                    tahun: "2026",
                    status: "Completed (BAST Done)",
                    images: [
                        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800",
                        "https://images.unsplash.com/photo-1508873696983-2df515122519?w=800"
                    ]
                }),
                calculateCalculatedFields({
                    id: "PRJ-002",
                    nama: "PLTS Off-Grid Sumba",
                    kategori: "Utilitas",
                    lokasi: "Sumba, Nusa Tenggara Timur",
                    kapasitasNum: 17.28,
                    tipe: "Off-Grid System",
                    inverter: "Off-Grid Inverter Series",
                    battery: "80 kWh LiFePO4 Battery Bank",
                    tahun: "2026",
                    status: "In Progress",
                    images: [
                        "https://images.unsplash.com/photo-1508873696983-2df515122519?w=800"
                    ]
                })
            ];
            setPortfolioList(initialData);
            localStorage.setItem("custom_portfolios", JSON.stringify(initialData));
        }
    }, []);

    // Fungsi Kalkulasi Otomatis Berdasarkan Input kWp
    function calculateCalculatedFields(data) {
        const kwp = parseFloat(data.kapasitasNum) || 0;
        const annualKwh = kwp * PSH * PR * 365;

        const co2Ton = (annualKwh * EMISSION_FACTOR) / 1000;
        const coalKg = annualKwh * COAL_FACTOR;
        const trees = (annualKwh * EMISSION_FACTOR) / TREE_FACTOR;
        const saveBillMonthly = (annualKwh * DEFAULT_TARIFF) / 12;

        return {
            ...data,
            kapasitas: `${kwp} kWp`,
            annualKwh: annualKwh.toFixed(0),
            co2: `${co2Ton.toFixed(2)} Ton CO2/Thn`,
            co2Num: co2Ton.toFixed(2),
            coalSaved: `${coalKg.toLocaleString('id-ID', { maximumFractionDigits: 0 })} Kg/Thn`,
            treesEquivalent: `${Math.round(trees)} Pohon/Thn`,
            estSaveBill: `Rp ${Math.round(saveBillMonthly).toLocaleString('id-ID')}/Bln`
        };
    }

    // Handle Upload Foto Lokal (Base64 untuk dikirim ke Media Library)
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({
                    ...prev,
                    uploadedImages: [...prev.uploadedImages, reader.result],
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    // Handle Tambah Link Google Drive / External URL
    const handleAddGdriveLink = () => {
        if (!formData.gdriveUrl.trim()) return;
        setFormData((prev) => ({
            ...prev,
            uploadedImages: [...prev.uploadedImages, formData.gdriveUrl.trim()],
            gdriveUrl: "",
        }));
    };

    // Remove Photo dari Library Form
    const handleRemoveImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            uploadedImages: prev.uploadedImages.filter((_, i) => i !== index),
        }));
    };

    // Submit Form Proyek
    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.uploadedImages.length === 0) {
            alert("Harap masukkan minimal 1 gambar (Upload file atau Link Drive)!");
            return;
        }

        const rawEntry = {
            id: `PRJ-00${portfolioList.length + 1}`,
            nama: formData.nama,
            kategori: formData.kategori,
            lokasi: formData.lokasi,
            kapasitasNum: formData.kapasitasNum,
            tipe: formData.tipe,
            inverter: formData.inverter,
            battery: formData.battery,
            tahun: formData.tahun,
            status: formData.status,
            images: formData.uploadedImages,
        };

        const newCalculatedEntry = calculateCalculatedFields(rawEntry);
        const updatedList = [newCalculatedEntry, ...portfolioList];

        setPortfolioList(updatedList);
        localStorage.setItem("custom_portfolios", JSON.stringify(updatedList));

        // Reset Form
        setIsModalOpen(false);
        setFormData({
            nama: "",
            kategori: "C&I",
            lokasi: "",
            kapasitasNum: "",
            tipe: "On-Grid",
            inverter: "",
            battery: "",
            tahun: new Date().getFullYear().toString(),
            status: "Completed (BAST Done)",
            gdriveUrl: "",
            uploadedImages: [],
        });
    };

    const handleDelete = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus portofolio ini?")) {
            const updated = portfolioList.filter((item) => item.id !== id);
            setPortfolioList(updated);
            localStorage.setItem("custom_portfolios", JSON.stringify(updated));
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold text-white">💼 Portofolio Proyek PLTS</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Kelola rekam jejak instalasi, kalkulasi manfaat lingkungan otomatis (PR 70%), dan galeri media.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg flex items-center gap-2"
                    >
                        <span>+ Tambah Portofolio</span>
                    </button>
                </div>

                {/* List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolioList.map((item) => (
                        <div
                            key={item.id}
                            className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
                        >
                            <div className="p-5 space-y-4">
                                {/* Image Preview */}
                                <div className="h-40 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800">
                                    {item.images && item.images.length > 0 ? (
                                        <img src={item.images[0]} alt={item.nama} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-500 text-xs">Tanpa Gambar</div>
                                    )}
                                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                                        {item.images?.length || 0} Foto
                                    </span>
                                </div>

                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-xs font-mono font-semibold bg-blue-900/40 text-blue-400 border border-blue-800/50 px-2.5 py-1 rounded-md">
                                        {item.id}
                                    </span>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-md border font-medium ${item.status.includes("Completed")
                                                ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/50"
                                                : "bg-amber-950/50 text-amber-400 border-amber-800/50"
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white leading-snug">{item.nama}</h3>
                                    <p className="text-xs text-slate-400 mt-1">📍 {item.lokasi}</p>
                                </div>

                                {/* Otomatisasi Matriks */}
                                <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                                    <div className="flex justify-between"><span className="text-slate-400">Kapasitas:</span><span className="font-semibold text-white">{item.kapasitas}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Reduksi CO2:</span><span className="font-semibold text-emerald-400">{item.co2}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Coal Saved:</span><span className="font-semibold text-amber-400">{item.coalSaved}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Eq. Trees:</span><span className="font-semibold text-green-400">{item.treesEquivalent}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Est. Save Bill:</span><span className="font-semibold text-sky-400">{item.estSaveBill}</span></div>
                                </div>
                            </div>

                            <div className="px-5 py-3 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-900/50 hover:bg-rose-950/50 transition"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal tambah portofolio */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl my-8">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <h3 className="text-lg font-bold text-white">Tambah Portofolio Proyek & Media</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-300 block mb-1">Nama Proyek</label>
                                        <input type="text" required value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" placeholder="Contoh: PLTS Rooftop Pabrik A" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-300 block mb-1">Kategori Proyek</label>
                                        <select value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                                            <option value="C&I">C&I (Industri/Komersial)</option>
                                            <option value="Utilitas">Utilitas</option>
                                            <option value="Residensial">Residensial</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-300 block mb-1">Lokasi</label>
                                        <input type="text" required value={formData.lokasi} onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" placeholder="Contoh: Cikarang, Jawa Barat" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-300 block mb-1">Kapasitas (kWp Angka)</label>
                                        <input type="number" step="0.01" required value={formData.kapasitasNum} onChange={(e) => setFormData({ ...formData, kapasitasNum: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" placeholder="Contoh: 100" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-300 block mb-1">Tipe Sistem</label>
                                        <select value={formData.tipe} onChange={(e) => setFormData({ ...formData, tipe: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                                            <option value="On-Grid">On-Grid</option>
                                            <option value="Off-Grid">Off-Grid</option>
                                            <option value="Hybrid System">Hybrid System</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-300 block mb-1">Status BAST</label>
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                                            <option value="Completed (BAST Done)">Completed (BAST Done)</option>
                                            <option value="In Progress">In Progress</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Media Library Upload Section */}
                                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                                    <label className="text-xs text-blue-400 font-bold block">📸 Media Library (Upload / Link GDrive)</label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* Local File Upload */}
                                        <div>
                                            <label className="text-[11px] text-slate-400 block mb-1">Upload Foto Komputer</label>
                                            <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs hover:file:bg-blue-500 cursor-pointer" />
                                        </div>

                                        {/* GDrive / URL Link */}
                                        <div>
                                            <label className="text-[11px] text-slate-400 block mb-1">Atau Masukkan Link Gambar (GDrive/URL)</label>
                                            <div className="flex gap-2">
                                                <input type="url" value={formData.gdriveUrl} onChange={(e) => setFormData({ ...formData, gdriveUrl: e.target.value })} placeholder="https://..." className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white" />
                                                <button type="button" onClick={handleAddGdriveLink} className="bg-slate-800 text-white text-xs px-3 rounded-lg border border-slate-700 hover:bg-slate-700">Tambah</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Selected Images */}
                                    {formData.uploadedImages.length > 0 && (
                                        <div className="mt-2">
                                            <span className="text-[11px] text-slate-400 block mb-1">Gambar Terpilih ({formData.uploadedImages.length}):</span>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {formData.uploadedImages.map((img, idx) => (
                                                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0 group">
                                                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute inset-0 bg-red-900/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-xl">Batal</button>
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2 rounded-xl">Simpan & Sinkronkan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}