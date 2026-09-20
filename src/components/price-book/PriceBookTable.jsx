// src/components/price-book/PriceBookTable.jsx
"use client";

import { useState, useEffect } from "react";

export default function PriceBookTable({ initialData = [] }) {
    const [items, setItems] = useState(initialData);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState("IDR");
    const [exchangeRates, setExchangeRates] = useState({ USD: 15800, EUR: 17200, IDR: 1 });
    const [isLoadingRates, setIsLoadingRates] = useState(false);

    // Simulasi Add-On: Fetch Live Currency Rate API
    const fetchLiveRates = async () => {
        setIsLoadingRates(true);
        try {
            // Contoh integrasi API live currency (misal: exchangerate-api atau endpoint internal)
            setTimeout(() => {
                setExchangeRates({ USD: 15750, EUR: 17100, IDR: 1 });
                setIsLoadingRates(false);
            }, 800);
        } catch (error) {
            setIsLoadingRates(false);
        }
    };

    useEffect(() => {
        fetchLiveRates();
    }, []);

    // Fungsi Kalkulator Dinamis berdasarkan Mata Uang Aktif
    const convertPrice = (basePriceInIDR, currency) => {
        const rate = exchangeRates[currency] || 1;
        if (currency === "IDR") return basePriceInIDR.toLocaleString("id-ID");
        return (basePriceInIDR / rate).toLocaleString("en-US", { style: "currency", currency });
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">

            {/* TOP CONTROL BAR & ADD-ON WIDGET */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="w-full lg:w-96">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama item atau kode SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-sky-500 transition"
                    />
                </div>

                {/* ADD-ON FEATURE: LIVE CURRENCY SELECTOR */}
                <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-medium">Add-on Live Currency:</span>
                    <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="bg-slate-900 text-sky-400 font-bold text-xs rounded-lg px-2.5 py-1.5 outline-none border border-slate-700"
                    >
                        <option value="IDR">IDR (Rp)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                    </select>
                    <button
                        onClick={fetchLiveRates}
                        disabled={isLoadingRates}
                        className="text-xs bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 px-2.5 py-1.5 rounded-lg transition"
                    >
                        {isLoadingRates ? "Syncing..." : "🔄 Refresh Rate"}
                    </button>
                </div>
            </div>

            {/* MODULAR DATA TABLE */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                            <th className="p-3.5">SKU / Kode</th>
                            <th className="p-3.5">Nama Item / Layanan</th>
                            <th className="p-3.5">Kategori</th>
                            <th className="p-3.5">Harga Dasar (IDR)</th>
                            <th className="p-3.5 text-sky-400">Harga Konversi ({selectedCurrency})</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                                    <td className="p-3.5 font-mono text-slate-400">{item.code}</td>
                                    <td className="p-3.5 font-semibold text-white">{item.name}</td>
                                    <td className="p-3.5">
                                        <span className="bg-slate-800 px-2.5 py-1 rounded-md text-[11px] text-slate-300 border border-slate-700">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-3.5 font-mono">Rp {item.basePriceIDR.toLocaleString("id-ID")}</td>
                                    <td className="p-3.5 font-mono text-sky-400 font-bold">
                                        {convertPrice(item.basePriceIDR, selectedCurrency)}
                                    </td>
                                    <td className="p-3.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-3.5 text-center space-x-2">
                                        <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition font-medium">Edit</button>
                                        <button className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-3 py-1.5 rounded-lg transition font-medium">Hapus</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="p-6 text-center text-slate-500 italic">
                                    Tidak ada data price book ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}