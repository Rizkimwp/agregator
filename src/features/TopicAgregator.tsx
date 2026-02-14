'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Search, Database, Clock, CheckCircle2, 
  Loader2, ExternalLink, ArrowLeft, Link as LinkIcon, AlertCircle, ListChecks
} from 'lucide-react';

// --- TYPES ---
type TopikDetail = {
  id: string | number;
  url: string;
  sosial_media: string;
};

type Topik = {
  id: string;
  topik: string;
  periode: string;
  ringkasan: string;
  jumlah_detail: string;
  created_at: string;
};

export default function TopicAggregatorDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topik | null>(null);
  const [selectedTopicDetails, setSelectedTopicDetails] = useState<TopikDetail[]>([]);
  
  const [listTopik, setListTopik] = useState<Topik[]>([]);
  const [counts, setCounts] = useState({ waiting: 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = 'https://rumah-yatim.net/testing_reza';

  // 1. FETCH DATA UTAMA (Membaca properti "data" dari JSON)
  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch List Topik
      const resTopik = await fetch(`${BASE_URL}/api_topik.php`);
      const jsonTopik = await resTopik.json();
      if (jsonTopik.success) {
        setListTopik(jsonTopik.data);
      }

      // Fetch Counter
      const resCount = await fetch(`${BASE_URL}/api_url.php?action=count`);
      const jsonCount = await resCount.json();
      if (jsonCount.success) {
        setCounts({
          waiting: jsonCount.data.waiting || 0,
          completed: jsonCount.data.completed || 0,
          total: jsonCount.data.total || 0
        });
      }
    } catch (err: any) {
      setError("Gagal memuat data. Periksa koneksi atau CORS pada rumah-yatim.net");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // 2. FETCH DETAIL
  const handleViewDetail = async (topic: Topik) => {
    setSelectedTopic(topic);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${BASE_URL}/api_topik_detail.php?id_topik=${topic.id}`);
      const jsonDetail = await res.json();
      // Asumsi detail juga dibungkus dalam "data" jika sukses
      setSelectedTopicDetails(jsonDetail.success ? jsonDetail.data : (Array.isArray(jsonDetail) ? jsonDetail : []));
    } catch (err) {
      console.error("Gagal ambil detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredData = useMemo(() => 
    listTopik.filter(t => t.topik?.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, listTopik]
  );

  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans text-slate-900">
        <div className="max-w-4xl mx-auto space-y-6">
          <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
            <ArrowLeft size={20} /> Kembali
          </button>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8 md:p-12 space-y-8">
            <div>
              <h1 className="text-3xl font-black mb-4">{selectedTopic.topik}</h1>
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Ringkasan:</p>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-lg">
                  {selectedTopic.ringkasan}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LinkIcon size={16} /> Sumber Terdeteksi ({selectedTopic.jumlah_detail}):
              </h3>

              {loadingDetail ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-500" /></div>
              ) : (
                <div className="grid gap-3">
                    {selectedTopicDetails.map((link, index) => (
                      <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-500 transition-all group">
                        <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold">{index + 1}</span>
                        <div>
                          <p className="font-bold text-slate-900">{link.sosial_media || 'Source'}</p>
                          <p className="text-xs text-slate-400 truncate max-w-xs md:max-w-md">{link.url}</p>
                        </div>
                      </div>
                      <ExternalLink size={18} className="text-slate-300 group-hover:text-indigo-600" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* STATS CARDS (Updated from API Data) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Clock className="text-amber-500" />} label="Waiting" value={counts.waiting} />
          <StatCard icon={<CheckCircle2 className="text-emerald-500" />} label="Completed" value={counts.completed} />
          <StatCard icon={<ListChecks className="text-indigo-500" />} label="Total Topik" value={counts.total} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} /> <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Database size={20} className="text-indigo-600" /> Whatsapp Agregator</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="Cari topik..."
                className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="p-8 space-y-6">
            {loading ? (
              <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-indigo-500" size={40} /></div>
            ) : filteredData.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-[32px] p-8 hover:shadow-lg transition-all border-l-4 border-l-indigo-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">{item.topik}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      <Calendar size={14} /> {item.periode} <span className="mx-2">•</span> {item.jumlah_detail} Detail
                    </p>
                  </div>
                  <button onClick={() => handleViewDetail(item)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-indigo-600 shadow-lg transition-all">
                    Detail
                  </button>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <p className="text-slate-600 line-clamp-3 whitespace-pre-line text-sm leading-relaxed">{item.ringkasan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
      <div className="mb-3">{icon}</div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</h3>
      <p className="text-4xl font-black mt-1">{value}</p>
    </div>
  );
}