type TopikDetail = {
    id: number;
    sosial_media: 'YouTube' | 'TikTok' | 'Instagram';
    tipe: string;
    url: string;
    transkrip: string;
  };
  
  type Topik = {
    id: number;
    topik: string;
    periode: string;
    ringkasan: string;
    details: TopikDetail[];
  };