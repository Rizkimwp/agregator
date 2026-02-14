'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Calendar, Search, Database, Clock, CheckCircle2, 
  Loader2, ExternalLink, ArrowLeft, Link as LinkIcon,
  RefreshCw // Icon baru untuk tombol refresh
} from 'lucide-react';

// ... (Type definitions tetap sama)

export default function TopicAggregatorDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topik | null>(null);
  const [selectedTopicDetails, setSelectedTopicDetails] = useState<TopikDetail[]>([]);
  
  const [listTopik, setListTopik] = useState<Topik[]>([]);
  const [counts, setCounts] = useState({ waiting: 0, progress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false); // State khusus untuk feedback visual refresh

  const BASE_URL = 'https://202.138.242.28/testing_reza';

  // Bungkus dalam useCallback agar bisa dipanggil berulang kali
  const fetchData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefetching(true);
      else setLoading(true);

      const [resTopik, resCount] = await Promise.all([
        fetch(`${BASE_URL}/api_topik.php`),
        fetch(`${BASE_URL}/api_url.php?action=count`)
      ]);

      const dataTopik = await resTopik.json();
      const dataCount = await resCount.json();

      setListTopik(dataTopik);
      setCounts(dataCount); 
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler untuk tombol Refresh
  const handleRefetch = () => {
    fetchData(true);
  };

  // ... (handleViewDetail dan filteredData tetap sama)

  const handleViewDetail = async (topic: Topik) => {
    setSelectedTopic(topic);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${BASE_URL}/api_topik_detail.php?id_topik=${topic.id}`);
      const data = await res.json();
      setSelectedTopicDetails(data);
    } catch (error) {
      console.error("Gagal mengambil detail:", error);
      setSelectedTopicDetails([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredData = useMemo(() => 
    listTopik.filter(t => t.topik.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, listTopik]
  );

  if (selectedTopic) {
    // ... (View Detail tetap sama)
    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans text-slate-900">
          <div className="max-w-4xl mx-auto space-y-6">
            <button 
              onClick={() => { setSelectedTopic(null); setSelectedTopicDetails([]); }}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors"
            >
              <ArrowLeft size={20} /> Kembali ke Daftar
            </button>
  
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-8 md:p-12 space-y-8">
              <div>
                <h1 className="text-3xl font-black mb-4">{selectedTopic.topik}</h1>
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Ringkasan Eksekutif:</p>
                  <p className="text-slate-700 leading-relaxed italic text-lg">&quot;{selectedTopic.ringkasan}&quot;</p>
                </div>
              </div>
  
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <LinkIcon size={16} /> Sumber Data (Link) :
                </h3>
                
                {loadingDetail ? (
                  <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-500" /></div>
                ) : (
                  <div className="grid gap-3">
                    {selectedTopicDetails.length > 0 ? selectedTopicDetails.map((link, index) => (
                      <a 
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{link.sosial_media || 'Link'}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[200px] md:max-w-md">{link.url}</p>
                          </div>
                        </div>
                        <ExternalLink size={18} className="text-slate-300 group-hover:text-indigo-600" />
                      </a>
                    )) : <p className="text-center text-slate-400 py-4">Tidak ada data link.</p>}
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
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Clock className="text-amber-500" />} label="Waiting" value={counts.waiting.toString()} />
          <StatCard icon={<Loader2 className="text-blue-500 animate-spin" />} label="Dalam Proses" value={counts.progress.toString()} />
          <StatCard icon={<CheckCircle2 className="text-emerald-500" />} label="Completed" value={counts.completed.toString()} />
        </div>

        {/* LIST CONTAINER */}
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
               <h2 className="text-xl font-bold flex items-center gap-2"><Database size={20} className="text-indigo-600" /> Hasil Agregasi</h2>
               {/* TOMBOL REFETCH */}
               <button 
                onClick={handleRefetch}
                disabled={isRefetching || loading}
                title="Perbarui Data"
                className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
               >
                 <RefreshCw size={18} className={`${isRefetching ? 'animate-spin text-indigo-500' : 'text-slate-400'}`} />
               </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search topik..." 
                className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="p-8 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="text-slate-400 font-medium">Memuat data dari server...</p>
              </div>
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div key={item.id} className="bg-white border border-slate-100 rounded-[32px] p-8 hover:shadow-lg transition-all border-l-4 border-l-indigo-500">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">{item.topik}</h3>
                      <p className="text-slate-400 text-sm flex items-center gap-2"><Calendar size={14} /> {item.periode}</p>
                    </div>
                    <button 
                      onClick={() => handleViewDetail(item)}
                      className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                    >
                      Detail
                    </button>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ringkasan :</p>
                    <p className="text-slate-600 line-clamp-2">{item.ringkasan}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-10">Data tidak ditemukan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ... (StatCard Component tetap sama)
function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
        <div className="mb-3">{icon}</div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</h3>
        <p className="text-4xl font-black mt-1">{value}</p>
      </div>
    );
  }