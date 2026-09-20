// src/app/admin/price-book/page.js
"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function MasterPriceBookPage() {
    // State Data Master Price Book
    const [priceItems, setPriceItems] = useState([
        {
            id: "SKU-001",
            code: "PV-600WP",
            name: "Solar Panel 600Wp Monocrystalline Tier 1",
            category: "Hardware",
            basePrice: 3200000,
            margin: 15,
            publicPrice: 3680000,
            description: "Modul surya efisiensi tinggi untuk komersial & residensial",
        },
        {
            id: "SKU-002",
            code: "INV-HYB-10KW",
            name: "Inverter Hybrid 10kW 3-Phase",
            category: "Hardware",
            basePrice: 18500000,
            margin: 20,
            publicPrice: 22200000,
            description: "Inverter 3 fasa dengan manajemen baterai terintegrasi",
        },
    ]);

    // State Form Input Baru
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        category: "Hardware",
        basePrice: "",
        margin: "",
        description: "",
    });

    // State Add-on: Live Currency Converter & Filter
    const [selectedCurrency, setSelectedCurrency] = useState("IDR");
    const exchangeRates = { IDR: 1, USD: 15800, EUR: 17200 };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Kalkulasi Harga Publik Otomatis berdasarkan Margin HPP
    const calculatePublicPrice = (base, margin) => {
        const b = Number(base) || 0;
        const m = Number(margin) || 0;
        return Math.round(b + (b * m) / 100);
    };

    // Handler Submit Simpan ke Database / State
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.code || !formData.name || !formData.basePrice) return;

        const calculatedPublic = calculatePublicPrice(formData.basePrice, formData.margin);

        const newItem = {
            id: `SKU-00${priceItems.length + 1}`,
            code: formData.code,
            name: formData.name,
            category: formData.category,
            basePrice: Number(formData.basePrice),
            margin: Number(formData.margin) || 0,
            publicPrice: calculatedPublic,
            description: formData.description,
        };

        setPriceItems([...priceItems, newItem]);
        setFormData({
            code: "",
            name: "",
            category: "Hardware",
            basePrice: "",
            margin: "",
            description: "",
        });
    };

    // Fungsi Konversi Mata Uang Add-on
    const formatPrice = (amountInIDR) => {
        const rate = exchangeRates[selectedCurrency] || 1;
        const converted = amountInIDR / rate;
        if (selectedCurrency === "IDR") {
            return `Rp ${amountInIDR.toLocaleString("id-ID")}`;
        }
        return converted.toLocaleString("en-US", { style: "currency", currency: selectedCurrency });
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">

                {/* HEADER MODUL */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Master Price Book (Dinamis & Modular)</h1>
                        <p className="text-sm text-slate-400">Pengelolaan HPP, Margin, dan Harga Publik yang terhubung ke database terpusat.</p>
                    </div>

                    {/* ADD-ON FITUR: LIVE CURRENCY WIDGET */}
                    <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                        <span className="text-xs text-slate-400 font-medium">Add-on Live Currency:</span>
                        <select
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                            className="bg-slate-900 text-sky-400 font-bold text-xs rounded-lg px-2.5 py-1.5 outline-none border border-slate-700 cursor-pointer"
                        >
                            <option value="IDR">IDR (Rp)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                        </select>
                    </div>
                </div>

                {/* FORM INPUT MODULAR */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                        <h3 className="text-base font-bold text-white">➕ Tambah Produk atau Jasa Baru</h3>
                        <p className="text-xs text-slate-400">Masukkan spesifikasi item dan persentase margin keuntungan.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-slate-300 font-medium block mb-1">Kode SKU</label>
                            <input
                                type="text"
                                name="code"
                                required
                                placeholder="Contoh: PV-600WP"
                                value={formData.code}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-sky-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300 font-medium block mb-1">Nama Produk / Layanan</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Contoh: Solar Panel Monocrystalline"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-sky-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300 font-medium block mb-1">Kategori</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-sky-500 cursor-pointer"
                            >
                                <option value="Hardware">Hardware (Solar, Inverter, Baterai)</option>
                                <option value="BOS">BOS & Kabel</option>
                                <option value="Jasa EPC">Jasa Instalasi & EPC</option>
                                <option value="Konsultasi">Konsultasi & Legalitas</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-slate-300 font-medium block mb-1">Harga Dasar / HPP (IDR)</label>
                            <input
                                type="number"
                                name="basePrice"
                                required
                                placeholder="Contoh: 3000000"
                                value={formData.basePrice}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-sky-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300 font-medium block mb-1">Min. Margin (%)</label>
                            <input
                                type="number"
                                name="margin"
                                placeholder="Contoh: 15"
                                value={formData.margin}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-sky-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300 font-medium block mb-1">Deskripsi Singkat</label>
                            <input
                                type="text"
                                name="description"
                                placeholder="Spesifikasi teknis singkat..."
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-sky-500"
                            />
                        </div>

                        <div className="md:col-span-3 pt-2 flex justify-end">
                            <button
                                type="submit"
                                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-sky-600/20"
                            >
                                Simpan ke Database Terpusat
                            </button>
                        </div>
                    </form>
                </div>

                {/* TABEL DATA MASTER PRICE BOOK */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-bold text-white">📊 Daftar Harga Aktif (Price Book Matrix)</h3>
                        <span className="text-xs text-slate-400 font-mono">Total Item: {priceItems.length}</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                                    <th className="p-3.5">SKU</th>
                                    <th className="p-3.5">Nama Produk / Jasa</th>
                                    <th className="p-3.5">Kategori</th>
                                    <th className="p-3.5">HPP (Internal)</th>
                                    <th className="p-3.5">Margin</th>
                                    <th className="p-3.5 text-sky-400">Harga Publik ({selectedCurrency})</th>
                                    <th className="p-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                                {priceItems.length > 0 ? (
                                    priceItems.map((item) => {
                                        const publicPriceCalculated = calculatePublicPrice(item.basePrice, item.margin);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-800/40 transition">
                                                <td className="p-3.5 font-mono text-slate-400">{item.code}</td>
                                                <td className="p-3.5 font-semibold text-white">
                                                    {item.name}
                                                    <div className="text-[10px] text-slate-500 font-normal">{item.description}</div>
                                                </td>
                                                <td className="p-3.5">
                                                    <span className="bg-slate-800 px-2.5 py-1 rounded-md text-[11px] text-slate-300 border border-slate-700">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 font-mono">Rp {item.basePrice.toLocaleString("id-ID")}</td>
                                                <td className="p-3.5 font-mono text-emerald-400 font-bold">{item.margin}%</td>
                                                <td className="p-3.5 font-mono text-sky-400 font-bold">
                                                    {formatPrice(publicPriceCalculated)}
                                                </td>
                                                <td className="p-3.5 text-center space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            const updated = priceItems.filter((p) => p.id !== item.id);
                                                            setPriceItems(updated);
                                                        }}
                                                        className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-3 py-1.5 rounded-lg transition font-medium"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-6 text-center text-slate-500 italic">
                                            Belum ada data dalam Master Price Book.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}