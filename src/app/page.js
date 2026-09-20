"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// === KONSTANTA & FUNGSI KALKULATOR FINANSIAL (BAWAAN PAGE_4) ===
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const GRID_EMISSION_FACTOR_KG_PER_KWH = 0.85;
const TREE_ABSORPTION_KG_PER_YEAR = 21.0;
const COAL_KG_PER_KWH = 0.4;

function monthlyProduction(capacityKwp, psh, pr) {
  return DAYS_IN_MONTH.map(d => capacityKwp * psh * (pr / 100) * d);
}

function environmentalBenefits(annualProductionKwh) {
  const co2SavedKg = annualProductionKwh * GRID_EMISSION_FACTOR_KG_PER_KWH;
  const treesEquivalent = TREE_ABSORPTION_KG_PER_YEAR ? co2SavedKg / TREE_ABSORPTION_KG_PER_YEAR : 0;
  const coalSavedKg = annualProductionKwh * COAL_KG_PER_KWH;
  return { co2SavedKg, treesEquivalent, coalSavedKg };
}

function calcFinancialAdvanced(
  capacityKwp, psh, pr, monthlyLoad,
  capexTotal, tariff, escalation, degradation, opexPct, discountRate, lifeYears, variabilityLoad = 10
) {
  const lockedVariability = [10, 20].includes(variabilityLoad) ? variabilityLoad : 10;
  const varFactor = lockedVariability / 100;

  const adjustedLoad = monthlyLoad.map(l => l * (1 + varFactor));
  const monthlyProd1 = monthlyProduction(capacityKwp, psh, pr);
  const opex = capexTotal * (opexPct / 100);

  let cumulative = -capexTotal;
  let paybackYear = null;
  let annualProduction = monthlyProd1.reduce((a, b) => a + b, 0);

  for (let y = 1; y <= lifeYears; y++) {
    const degFactor = Math.pow(1 - degradation / 100, y - 1);
    const tariffY = tariff * Math.pow(1 + escalation / 100, y - 1);
    let production = 0.0;
    let selfConsumed = 0.0;

    for (let i = 0; i < 12; i++) {
      const pDeg = monthlyProd1[i] * degFactor;
      production += pDeg;
      selfConsumed += Math.min(pDeg, adjustedLoad[i]);
    }

    const savings = selfConsumed * tariffY;
    const net = savings - opex;
    const prevCum = cumulative;
    cumulative += net;

    if (paybackYear === null && prevCum < 0 && cumulative >= 0) {
      const frac = net === 0 ? 0 : (-prevCum) / net;
      paybackYear = (y - 1) + frac;
    }
  }

  const npvAt = (rate) => {
    let v = -capexTotal;
    for (let y = 1; y <= lifeYears; y++) {
      v += (monthlyProd1.reduce((acc, p, i) => acc + Math.min(p, adjustedLoad[i]), 0) * tariff - (capexTotal * (opexPct / 100))) / Math.pow(1 + rate, y);
    }
    return v;
  };

  const npv = npvAt(discountRate / 100);

  let irr = null;
  let lo = -0.5, hi = 3.0;
  let nLo = npvAt(lo), nHi = npvAt(hi);
  if (nLo * nHi < 0) {
    for (let i = 0; i < 80; i++) {
      let mid = (lo + hi) / 2;
      let nMid = npvAt(mid);
      if (Math.abs(nMid) < 1) break;
      if ((nMid > 0) === (nLo > 0)) { lo = mid; } else { hi = mid; }
    }
    irr = ((lo + hi) / 2) * 100;
  }

  const env = environmentalBenefits(annualProduction);
  const sumSelf = monthlyProd1.reduce((acc, p, i) => acc + Math.min(p, adjustedLoad[i]), 0);
  const rate = annualProduction > 0 ? (sumSelf / annualProduction) * 100 : 0;

  return {
    capexTotal,
    annualProduction,
    selfConsumptionRate: rate,
    npv,
    irr,
    paybackYear,
    ...env
  };
}

// === KOMPONEN UTAMA LANDING PAGE ===
export default function EPCCCorporateProfile() {
  // State Portofolio
  const [filter, setFilter] = useState('Semua');
  const [activeImageIndices, setActiveImageIndices] = useState({});
  const [allPortfolios, setAllPortfolios] = useState([]);

  // State Kalkulator & CRM
  const [tagihan, setTagihan] = useState('');
  const [hasilCalc, setHasilCalc] = useState(null);
  const [formData, setFormData] = useState({ nama: '', perusahaan: '', telepon: '', kebutuhan: 'On-Grid' });
  const [calcMode, setCalcMode] = useState('cepat');

  // State Company Profile
  const [certifications] = useState([
    { title: "SKTK ESDM Level 5", status: "Pembangunan & Pengawasan PLTS" },
    { title: "K3 BNSP Certified", status: "Supervisor Lapangan K3" },
    { title: "Standar Operasional K3", status: "Protokol Lapangan Ketat" },
    { title: "Tenaga Ahli Tersertifikasi", status: "Verified Resmi" }
  ]);

  const [methodologies] = useState([
    { step: "1. Engineering", desc: "Simulasi 3D HelioScope & PVSyst, SLD presisi, analisis radiasi dan shadowing loss." },
    { step: "2. Procurement", desc: "Jaminan Pasokan Tier-1: Modul Monocrystalline, Inverter tersertifikasi, dan Mounting Anodized Aluminium." },
    { step: "3. Construction", desc: "Eksekusi sipil dan mekanikal berbasis K3. Struktur tahan beban angin tinggi & proteksi cuaca." },
    { step: "4. Commissioning", desc: "Quality Control menyeluruh: Pengecekan visual panel/kabel, uji fungsi inverter & proteksi, serta uji beban jaringan." }
  ]);

  // State Parameter Lanjutan
  const [systemType, setSystemType] = useState('On-Grid');
  const lockedPsh = 4;
  const [pr] = useState(80);
  const [variabilityLoad, setVariabilityLoad] = useState(10);

  const comprehensiveTarifList = [
    { id: 'pdf_r1_900', golongan: 'Rumah Tangga R-1 (900 VA - RTM)', tarifPokok: 1352.00 },
    { id: 'pdf_r1_1300', golongan: 'Rumah Tangga R-1 (1.300 VA)', tarifPokok: 1444.70 },
    { id: 'pdf_r1_2200', golongan: 'Rumah Tangga R-1 (2.200 VA)', tarifPokok: 1444.70 },
    { id: 'pdf_r2_3500', golongan: 'Rumah Tangga R-2 (3.500 s.d. 5.500 VA)', tarifPokok: 1699.53 },
    { id: 'pdf_r3_6600', golongan: 'Rumah Tangga R-3 (di atas 6.600 VA)', tarifPokok: 1699.53 },
    { id: 'pdf_b3_tm', golongan: 'Bisnis B-3 / Tegangan Menengah (TM, TT)', tarifPokok: 1035.78 },
    { id: 'def_ind', golongan: 'Industri I-3 / Tegangan Menengah', tarifPokok: 1114.74 },
    { id: 'def_sos', golongan: 'Sosial / Layanan Khusus', tarifPokok: 1699.53 }
  ];

  const [daftarTarifPln] = useState(comprehensiveTarifList);
  const [selectedTariffId, setSelectedTariffId] = useState('pdf_r1_1300');
  const [selectedTariff, setSelectedTariff] = useState(1444.70);
  const [customTariff, setCustomTariff] = useState(1444.70);

  const [capexMode, setCapexMode] = useState('pln');
  const [userBudget, setUserBudget] = useState(50000000);
  const [plnCapacityVA, setPlnCapacityVA] = useState(6600);

  const [unitCapexPrice] = useState(20000000);
  const [adminSourceInfo] = useState('Default Sistem');

  const [escalation] = useState(3);
  const [degradation] = useState(0.5);
  const [opexPct] = useState(1);
  const [discountRate] = useState(8);
  const [lifeYears] = useState(25);

  // LOAD PORTOFOLIO DARI LOCALSTORAGE
  useEffect(() => {
    const loadPortfolios = () => {
      const savedPortfolios = localStorage.getItem('custom_portfolios');
      if (savedPortfolios) {
        try {
          setAllPortfolios(JSON.parse(savedPortfolios));
        } catch (e) {
          console.error("Gagal membaca portfolio", e);
        }
      }
    };

    loadPortfolios();
    window.addEventListener('storage', loadPortfolios);
    return () => window.removeEventListener('storage', loadPortfolios);
  }, []);

  const filteredPortfolios = filter === 'Semua' ? allPortfolios : allPortfolios.filter(p => p.kategori === filter);

  // Fungsi Navigasi Gambar (Carousel Portofolio)
  const handleNextImage = (e, projId, totalImages) => {
    e.preventDefault();
    setActiveImageIndices(prev => {
      const currentIndex = prev[projId] || 0;
      return { ...prev, [projId]: (currentIndex + 1) % totalImages };
    });
  };

  const handlePrevImage = (e, projId, totalImages) => {
    e.preventDefault();
    setActiveImageIndices(prev => {
      const currentIndex = prev[projId] || 0;
      return { ...prev, [projId]: (currentIndex - 1 + totalImages) % totalImages };
    });
  };

  const handleTarifChange = (e) => {
    const id = e.target.value;
    setSelectedTariffId(id);
    if (id === 'custom') {
      setSelectedTariff(0);
    } else {
      const found = daftarTarifPln.find(item => item.id === id);
      if (found) {
        const tarifVal = found.tarifPokok || 1444.7;
        setSelectedTariff(tarifVal);
      }
    }
  };

  const effectiveTariff = selectedTariff === 0 ? customTariff : selectedTariff;

  let calculatedCapacityKwp = 0;
  let calculatedCapexTotal = 0;

  if (capexMode === 'budget') {
    calculatedCapexTotal = userBudget;
    calculatedCapacityKwp = unitCapexPrice > 0 ? userBudget / unitCapexPrice : 0;
  } else {
    calculatedCapacityKwp = (plnCapacityVA / 1000) * 0.7;
    calculatedCapexTotal = calculatedCapacityKwp * unitCapexPrice;
  }

  const monthlyLoadSample = Array(12).fill((calculatedCapacityKwp * lockedPsh * 30 * 0.7) || 1000);

  const advancedResult = calcFinancialAdvanced(
    calculatedCapacityKwp, lockedPsh, pr, monthlyLoadSample,
    calculatedCapexTotal, effectiveTariff, escalation, degradation, opexPct, discountRate, lifeYears, variabilityLoad
  );

  const hitungPotensiCepat = () => {
    const tagihanAngka = parseFloat(tagihan);
    if (!tagihanAngka || tagihanAngka <= 0) return;

    const konsumsiBulananKwh = tagihanAngka / effectiveTariff;
    const targetCoverKwh = konsumsiBulananKwh * 0.4;
    const kapasitasKwpEst = targetCoverKwh / (lockedPsh * 30 * (pr / 100));
    const penghematan = targetCoverKwh * effectiveTariff;
    const reduksiKarbon = targetCoverKwh * 0.87;

    setHasilCalc({
      kapasitas: kapasitasKwpEst.toFixed(1),
      penghematan: Math.round(penghematan).toLocaleString('id-ID'),
      karbon: (reduksiKarbon / 1000).toFixed(2),
    });
  };

  const submitCRM = (e) => {
    e.preventDefault();
    alert(`Terima kasih ${formData.nama}, data inquiry untuk ${formData.perusahaan} berhasil diproses ke sistem CRM!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 scroll-smooth">

      {/* NAVBAR */}
      <nav className="bg-slate-900 text-white p-5 shadow-lg sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 hover:opacity-90 transition">
            <span className="text-xl font-extrabold tracking-wider">SEA <span className="text-blue-500">Soltra</span></span>
          </a>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-300 items-center">
            <a href="#about-us" className="hover:text-white transition-colors cursor-pointer tracking-wide">About Us</a>
            <a href="#portofolio-project" className="hover:text-white transition-colors cursor-pointer tracking-wide">Portofolio Project</a>
            <a href="#kalkulator" className="hover:text-white transition-colors cursor-pointer tracking-wide">Solar Calculator</a>
            <a href="#crm" className="hover:text-white transition-colors cursor-pointer tracking-wide">CRM System</a>
            <Link
              href="/admin/portofolio"
              className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-4 py-2 rounded-lg font-semibold transition-all text-xs flex items-center gap-2 shadow-sm"
            >
              🔒 Portal Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Rekayasa Presisi untuk Transisi Energi</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Infrastruktur EPCC (Engineering, Procurement, Construction, & Commissioning) Tenaga Surya berstandar internasional dengan garansi performa tinggi.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {certifications.map((cert, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border text-center flex flex-col items-center justify-center hover:shadow-md transition">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold mb-3 shadow-inner">✓</div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">{cert.title}</h3>
              <span className="text-xs font-semibold text-green-600">{cert.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about-us" className="max-w-7xl mx-auto py-12 px-6 scroll-mt-20">
        <h2 className="text-3xl font-bold border-l-4 border-blue-600 pl-4 mb-3 text-slate-900">About Us & Metodologi EPCC</h2>
        <p className="text-slate-600 mb-8">Mengenal standar kualitas, komitmen, serta tahapan operasional profesional kami.</p>
        <div className="grid md:grid-cols-4 gap-6">
          {methodologies.map((m, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between hover:border-blue-200 transition">
              <div>
                <h3 className="font-bold text-base text-blue-900 mb-2">{m.step}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PORTOFOLIO SECTION (UPGRADED) */}
      <section id="portofolio-project" className="max-w-7xl mx-auto py-12 px-6 scroll-mt-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold border-l-4 border-green-500 pl-4 mb-2 text-slate-900">Portofolio Project</h2>
            <p className="text-slate-600 text-sm">Rekam jejak instalasi teknis dan metrik keberlanjutan terhitung otomatis.</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0 flex-wrap">
            {['Semua', 'C&I', 'Utilitas', 'Residensial'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition ${filter === f ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredPortfolios.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            <p className="text-lg font-semibold mb-2">Belum ada portofolio yang ditampilkan.</p>
            <p className="text-sm mb-6">Silakan masuk ke halaman Admin untuk menambahkan data proyek baru.</p>
            <Link href="/admin/portofolio" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition">
              Buka Panel Admin Portofolio
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredPortfolios.map(proj => {
              const imagesList = proj.images && proj.images.length > 0 ? proj.images : [];
              const currentIndex = activeImageIndices[proj.id] || 0;

              return (
                <div key={proj.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    {/* Slideshow Image Box */}
                    <div className="h-52 bg-slate-900 w-full relative overflow-hidden flex items-center justify-center group">
                      {imagesList.length > 0 ? (
                        <img src={imagesList[currentIndex]} alt={proj.nama} className="w-full h-full object-cover transition-all duration-300" />
                      ) : (
                        <span className="text-slate-500 font-semibold text-xs">Tidak Ada Foto</span>
                      )}

                      {/* Tombol Slide / Navigasi Carousel */}
                      {imagesList.length > 1 && (
                        <>
                          <button
                            onClick={(e) => handlePrevImage(e, proj.id, imagesList.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            ‹
                          </button>
                          <button
                            onClick={(e) => handleNextImage(e, proj.id, imagesList.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            ›
                          </button>

                          {/* Indicator Dot */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 px-2 py-1 rounded-full">
                            {imagesList.map((_, idx) => (
                              <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {proj.kategori} | {proj.tipe}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{proj.tahun}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{proj.nama}</h3>
                      <p className="text-xs text-slate-500 mt-1">📍 {proj.lokasi}</p>
                    </div>
                  </div>

                  {/* Matriks Hasil Otomatisasi (Ditampilkan Semua Sesuai PR 70%) */}
                  <div className="p-5 pt-0 mt-auto">
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Kapasitas System:</span><span className="font-bold text-slate-800">{proj.kapasitas}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Reduksi Karbon:</span><span className="font-bold text-emerald-600">{proj.co2 || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Batu Bara Hemat:</span><span className="font-bold text-amber-600">{proj.coalSaved || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Setara Penanaman:</span><span className="font-bold text-green-600">{proj.treesEquivalent || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Est. Hemat Tagihan:</span><span className="font-bold text-sky-600">{proj.estSaveBill || '-'}</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SOLAR CALCULATOR (BAWAAN PAGE_4) */}
      <section id="kalkulator" className="bg-slate-100 py-16 border-t border-slate-200 scroll-mt-10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-2 text-center text-slate-900">Solar Calculator & Simulasi Finansial</h2>
          <p className="text-center text-slate-600 mb-6 text-sm">Pilih jenis perhitungan yang ingin Anda gunakan untuk memperkirakan potensi sistem PLTS.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setCalcMode('cepat')}
              className={`p-4 rounded-xl font-bold text-sm transition-all border shadow-sm ${calcMode === 'cepat'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
            >
              ⚡ Estimasi Cepat (Berdasarkan Tagihan)
            </button>
            <button
              onClick={() => setCalcMode('lanjutan')}
              className={`p-4 rounded-xl font-bold text-sm transition-all border shadow-sm ${calcMode === 'lanjutan'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
            >
              📊 Simulasi Lanjutan (Teknis & Finansial)
            </button>
          </div>

          {/* Mode Estimasi Cepat */}
          {calcMode === 'cepat' && (
            <div className="bg-white text-slate-800 p-8 rounded-xl shadow border animate-fadeIn">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Estimasi Cepat Berdasarkan Tagihan Listrik Bulanan</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 font-semibold text-xs text-slate-600">Tagihan Listrik Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={tagihan}
                    onChange={(e) => setTagihan(e.target.value)}
                    className="w-full border p-2.5 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: 15000000"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-xs text-slate-600">Pilihan TDL PLN / Tarif</label>
                  <select
                    value={selectedTariffId}
                    onChange={handleTarifChange}
                    className="w-full border p-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    {daftarTarifPln.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.golongan} (Rp {item.tarifPokok || 0} / kWh)
                      </option>
                    ))}
                    <option value="custom">Custom (Atur Manual)</option>
                  </select>
                </div>
              </div>

              {selectedTariffId === 'custom' && (
                <div className="mb-4">
                  <label className="block mb-1 font-semibold text-xs text-slate-600">Masukkan Tarif Manual (Rp/kWh)</label>
                  <input type="number" value={customTariff} onChange={(e) => setCustomTariff(Number(e.target.value))} className="w-full border p-2 rounded text-sm text-slate-900" />
                </div>
              )}

              <button onClick={hitungPotensiCepat} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition text-sm shadow-md">Hitung Estimasi Cepat</button>

              {hasilCalc && (
                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                  <p className="mb-1 text-sm">Rekomendasi Kapasitas: <strong className="text-blue-900">{hasilCalc.kapasitas} kWp</strong></p>
                  <p className="mb-1 text-sm">Potensi Penghematan: <strong className="text-blue-900">Rp {hasilCalc.penghematan} / bulan</strong></p>
                  <p className="text-sm">Reduksi Emisi Karbon: <strong className="text-green-700">{hasilCalc.karbon} Ton CO2 / tahun</strong></p>
                </div>
              )}
            </div>
          )}

          {/* Mode Simulasi Lanjutan */}
          {calcMode === 'lanjutan' && (
            <div className="bg-white text-slate-800 p-8 rounded-xl shadow border animate-fadeIn space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Simulasi Lanjutan (Sistem, PSH, & Alokasi CAPEX)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Sistem PLTS</label>
                  <select value={systemType} onChange={(e) => setSystemType(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-slate-900 text-sm">
                    <option value="On-Grid">On-Grid (Tanpa Baterai)</option>
                    <option value="Off-Grid">Off-Grid (Dengan Baterai Mandiri)</option>
                    <option value="Hybrid">Hybrid (On-Grid + Baterai Backup)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Variability Load</label>
                  <select value={variabilityLoad} onChange={(e) => setVariabilityLoad(parseInt(e.target.value))} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-slate-900 text-sm">
                    <option value={10}>10%</option>
                    <option value={20}>20%</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-slate-900">Pengaturan CAPEX & Kapasitas</h4>
                  <span className="text-[11px] bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-full">
                    Harga dari Database: <strong>Rp {unitCapexPrice.toLocaleString('id-ID')} / kWp</strong>
                  </span>
                </div>

                <div className="flex gap-4 mb-4">
                  <label className="flex items-center text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="radio" name="capexMode" checked={capexMode === 'pln'} onChange={() => setCapexMode('pln')} className="mr-2" />
                    Hitung Kapasitas PLN
                  </label>
                  <label className="flex items-center text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="radio" name="capexMode" checked={capexMode === 'budget'} onChange={() => setCapexMode('budget')} className="mr-2" />
                    Hitung Berdasarkan Budget
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {capexMode === 'pln' ? (
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Kapasitas PLN Terpasang (VA)</label>
                      <input type="number" value={plnCapacityVA} onChange={(e) => setPlnCapacityVA(parseFloat(e.target.value) || 0)} className="w-full border p-2 rounded text-sm text-slate-900 bg-white" placeholder="Contoh: 6600" />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Total Budget Dimiliki (Rp)</label>
                      <input type="number" value={userBudget} onChange={(e) => setUserBudget(parseFloat(e.target.value) || 0)} className="w-full border p-2 rounded text-sm text-slate-900 bg-white" placeholder="Contoh: 75000000" />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Biaya Capex per kWp (Otomatis)</label>
                    <input type="text" disabled value={`Rp ${unitCapexPrice.toLocaleString('id-ID')}`} className="w-full border p-2 rounded text-sm text-slate-700 bg-slate-100 font-semibold cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl space-y-4">
                <h4 className="font-bold text-blue-900 text-base border-b border-blue-200 pb-2">Hasil Analisis & Output Finansial Lanjutan</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Estimasi Kapasitas</p>
                    <p className="font-extrabold text-blue-900 text-base">{calculatedCapacityKwp.toFixed(2)} kWp</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Total CAPEX</p>
                    <p className="font-extrabold text-blue-900 text-sm">Rp {Math.round(calculatedCapexTotal).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Payback Period</p>
                    <p className="font-extrabold text-green-700 text-base">{advancedResult.paybackYear !== null ? `${advancedResult.paybackYear.toFixed(1)} Tahun` : '> Umur Sistem'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">IRR</p>
                    <p className="font-extrabold text-blue-900 text-base">{advancedResult.irr !== null ? `${advancedResult.irr.toFixed(2)}%` : 'N/A'}</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* CRM SYSTEM */}
      <section id="crm" className="bg-slate-900 text-white py-16 border-t border-slate-800 scroll-mt-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-blue-400">CRM System Integration</h2>
            <p className="text-slate-400 text-sm">Formulir pengajuan survey & manajemen klien.</p>
          </div>
          <div className="bg-slate-800 p-8 rounded-xl shadow border border-slate-700">
            <form onSubmit={submitCRM} className="space-y-4">
              <div>
                <label className="block text-xs mb-1 text-slate-300">Nama Lengkap</label>
                <input type="text" required onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-300">Nama Perusahaan / Instansi</label>
                <input type="text" required onChange={(e) => setFormData({ ...formData, perusahaan: e.target.value })} className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-300">Nomor Telepon / WhatsApp</label>
                <input type="tel" required onChange={(e) => setFormData({ ...formData, telepon: e.target.value })} className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition mt-4 shadow-lg">Kirim Inquiry ke CRM System</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}