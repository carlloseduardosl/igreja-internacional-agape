
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from './components/Navbar';
import { 
  CHURCH_HISTORY, 
  SCHEDULE_DATA, 
  CELLS_DATA, 
  COURSES_DATA, 
  MINISTRIES_DATA,
  SPECIAL_EVENTS_DATA,
  PASTORS,
  AgapeLogo,
  YOUTUBE_LIVE_EMBED_URL,
  YOUTUBE_CHANNEL_URL
} from './constants';
import { getDailyVerse } from './services/geminiService';
import { SpecialEvent, CellGroup } from './types';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState<SpecialEvent | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [dailyVerse, setDailyVerse] = useState('Carregando versículo do dia...');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [notifStatus, setNotifStatus] = useState<NotificationPermission>('default');
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Notification Detailed Config
  const [notifConfig, setNotifConfig] = useState({
    master: true,
    general: true,
    events: true,
    cells: true
  });

  // Carousel State
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Cell Search State
  const [cellSearchTerm, setCellSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Donation State
  const [pixCopied, setPixCopied] = useState(false);

  // Booking State
  const [isSendingBooking, setIsLoadingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState({
    nome: '',
    whatsapp: '',
    pastor: PASTORS[0],
    data: '',
    periodo: 'Manhã (09:00 - 12:00)',
    motivo: ''
  });

  // Effect to handle theme switching
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchDailyVerse();
    
    if ('Notification' in window) {
      setNotifStatus(Notification.permission);
    }

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance Carousel
  useEffect(() => {
    if (activeSection === 'home' && SPECIAL_EVENTS_DATA.length > 1) {
      const timer = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % SPECIAL_EVENTS_DATA.length);
      }, 6000); 
      return () => clearInterval(timer);
    }
  }, [activeSection]);

  const fetchDailyVerse = async () => {
    const verse = await getDailyVerse();
    setDailyVerse(verse);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleToggleMasterNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações.');
      return;
    }

    if (Notification.permission === 'denied') {
      alert('As notificações estão bloqueadas no navegador. Clique no ícone de cadeado para liberar.');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotifStatus(permission);
      if (permission !== 'granted') return;
    }

    setNotifConfig(prev => {
      const newState = !prev.master;
      return {
        master: newState,
        general: newState,
        events: newState,
        cells: newState
      };
    });

    if (!notifConfig.master) {
      showTestNotification('Notificações ativadas! 🙏');
    }
  };

  const showTestNotification = async (message: string) => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.showNotification('Ágape Itaperuna', {
          body: message,
          icon: 'https://iili.io/fsJj82S.png',
          badge: 'https://iili.io/fsJj82S.png',
          vibrate: [100, 50, 100],
        } as any);
        return;
      }
    }
    new Notification('Ágape Itaperuna', { body: message, icon: 'https://iili.io/fsJj82S.png' });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada no seu navegador.');
      return;
    }
    setIsLocating(true);
    const geoOptions = {
      enableHighAccuracy: true, 
      timeout: 15000,           
      maximumAge: 0             
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        let msg = 'Não foi possível obter sua localização precisa.';
        if (err.code === 1) msg = 'Permissão de localização negada. Ative nas configurações do navegador.';
        if (err.code === 3) msg = 'Tempo esgotado ao buscar sinal de GPS. Tente novamente em um local mais aberto.';
        alert(msg);
        setIsLocating(false);
      },
      geoOptions
    );
  };

  const filteredCells = useMemo(() => {
    let result = [...CELLS_DATA];
    
    if (cellSearchTerm.trim() !== '') {
      const term = cellSearchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.leader.toLowerCase().includes(term) || 
        c.neighborhood?.toLowerCase().includes(term) ||
        c.location.toLowerCase().includes(term) ||
        c.day.toLowerCase().includes(term)
      );
    }

    if (userLocation) {
      result = (result as any[]).map(c => ({
        ...c,
        distance: calculateDistance(userLocation.lat, userLocation.lng, c.latitude, c.longitude)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0)) as (CellGroup & { distance?: number })[];
    }

    return result as (CellGroup & { distance?: number })[];
  }, [cellSearchTerm, userLocation]);

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingBooking(true);

    try {
      const FORMSPREE_URL = 'https://formspree.io/f/mrekgwga'; 
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...bookingData,
          _subject: `Novo Agendamento Pastoral: ${bookingData.nome}`,
          Mensagem: `Solicitação de atendimento pastoral:\nPastor: ${bookingData.pastor}\nData: ${bookingData.data}\nPeríodo: ${bookingData.periodo}\nMotivo: ${bookingData.motivo}\nWhatsApp: ${bookingData.whatsapp}`
        })
      });

      if (response.ok) {
        setBookingSuccess(true);
        setBookingData({
          nome: '',
          whatsapp: '',
          pastor: PASTORS[0],
          data: '',
          periodo: 'Manhã (09:00 - 12:00)',
          motivo: ''
        });
      } else {
        throw new Error('Falha no servidor');
      }
    } catch (error) {
      alert('Houve um erro. Tente novamente mais tarde.');
    } finally {
      setIsLoadingBooking(false);
    }
  };

  const handleCopyPixCode = () => {
    const pixCode = "00020126360014BR.GOV.BCB.PIX0114033534040001575204000053039865802BR5925COMUNIDADE AGAPE DE LOUVO6009SAO.PAULO62070503***6304994C";
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const formatWhatsappUrl = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) setCurrentEventIndex((prev) => (prev + 1) % SPECIAL_EVENTS_DATA.length);
    if (distance < -50) setCurrentEventIndex((prev) => (prev - 1 + SPECIAL_EVENTS_DATA.length) % SPECIAL_EVENTS_DATA.length);
  };

  // Helper Components
  const SectionTitle: React.FC<{ title: string; subtitle?: string; light?: boolean }> = ({ title, subtitle, light }) => (
    <div className="text-center mb-10">
      <h2 className={`text-3xl md:text-4xl font-serif mb-3 px-4 ${light || darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      {subtitle && <p className={`max-w-2xl mx-auto px-6 text-sm ${light || darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{subtitle}</p>}
      <div className="w-12 h-[2px] bg-agape-red mx-auto mt-5"></div>
    </div>
  );

  const ToggleSwitch = ({ active, onClick, disabled = false }: { active: boolean, onClick: () => void, disabled?: boolean }) => (
    <button 
      onClick={(e) => { e.preventDefault(); if(!disabled) onClick(); }}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none ${active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  const renderCellCard = (cell: CellGroup & { distance?: number }) => (
    <div key={cell.id} className="group relative p-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[32px] flex flex-col justify-between hover:shadow-2xl dark:hover:shadow-black/50 transition-all h-full">
      {cell.distance !== undefined && (
        <div className="absolute -top-3 right-6 bg-agape-red text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 z-10 border border-white dark:border-gray-700">
          <span className="text-[11px] font-black uppercase tracking-wider">
            {cell.distance >= 1 ? `${cell.distance.toFixed(1)} km` : `${(cell.distance * 1000).toFixed(0)} m`}
          </span>
        </div>
      )}
      <div>
        <h4 className="text-2xl font-serif text-gray-900 dark:text-white mb-4">{cell.name}</h4>
        <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/30 text-agape-red dark:text-red-400 px-4 py-2 rounded-xl mb-6 font-bold text-xs uppercase tracking-wider">
          {cell.day} às {cell.time}
        </div>
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-gray-400 dark:text-gray-500 mt-1 uppercase text-[10px] font-bold w-12 shrink-0">Líder</span>
            <p className="text-sm font-medium dark:text-gray-200">{cell.leader}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gray-400 dark:text-gray-500 mt-1 uppercase text-[10px] font-bold w-12 shrink-0">Local</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{cell.location}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${cell.latitude},${cell.longitude}&travelmode=driving`}
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Como Chegar (GPS)
        </a>
        <a 
          href={formatWhatsappUrl(cell.contact, `Olá, gostaria de saber mais informações sobre a ${cell.name}!`)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-center hover:bg-[#128C7E] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Falar com Líder
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar onNavigate={(s) => { setActiveSection(s); window.scrollTo(0,0); }} activeSection={activeSection} />

      <main className="flex-grow pt-14">
        {/* Detail Overlays */}
        {selectedEvent && (
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideIn">
              <div className="relative h-56">
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-serif mb-4 dark:text-white">{selectedEvent.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">{selectedEvent.description}</p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-2 mb-6 text-sm dark:text-gray-200">
                  <p><strong>Data:</strong> {selectedEvent.date}</p>
                  <p><strong>Horário:</strong> {selectedEvent.time}</p>
                  <p><strong>Local:</strong> {selectedEvent.location}</p>
                </div>
                <div className="space-y-3">
                  {selectedEvent.whatsappLink && (
                    <a href={selectedEvent.whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Falar no WhatsApp
                    </a>
                  )}
                  <button onClick={() => setSelectedEvent(null)} className="w-full bg-agape-red text-white py-4 rounded-xl font-bold">Fechar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'home' && (
          <section className="animate-fadeIn">
            <div className="relative h-[45vh] bg-black text-white flex items-center justify-center overflow-hidden">
              <img src="https://iili.io/f4TNO2s.jpg" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Igreja Ágape" />
              <div className="relative z-10 text-center px-6">
                <h1 className="text-4xl md:text-6xl font-serif mb-3">Bem-vindo à Ágape</h1>
                <p className="text-lg md:text-xl font-light italic text-gray-200">"Onde o Amor de Deus Transforma Vidas"</p>
              </div>
            </div>

            <div className="py-12 px-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-agape-red font-bold uppercase tracking-widest text-[10px] mb-4">Versículo Diário</h3>
                <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 italic leading-relaxed font-serif">{dailyVerse}</p>
              </div>
            </div>

            {/* Ágape TV Section */}
            <div className="pt-16 pb-10 px-4 md:px-6 bg-white dark:bg-gray-950">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span></span>
                    <span className="text-agape-red font-bold uppercase tracking-widest text-[10px]">Ao Vivo</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white">Ágape TV</h2>
                </div>
                <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-3xl overflow-hidden bg-black shadow-lg">
                  <iframe src={YOUTUBE_LIVE_EMBED_URL} title="Live" className="absolute inset-0 w-full h-full border-0" allowFullScreen></iframe>
                </div>
              </div>
            </div>

            {/* Events Carousel */}
            <div className="py-12 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 overflow-hidden">
              <div className="max-w-5xl mx-auto">
                <SectionTitle title="Próximos Eventos" subtitle="Fique por dentro da nossa agenda" />
                <div 
                  className="relative group w-full h-[480px] md:h-[600px] rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl bg-gray-900"
                  onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
                >
                  <div className="relative w-full h-full flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ transform: `translateX(-${currentEventIndex * 100}%)` }}>
                    {SPECIAL_EVENTS_DATA.map((event) => (
                      <div key={event.id} className="w-full h-full flex-shrink-0 relative cursor-pointer" onClick={() => setSelectedEvent(event)}>
                        <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="absolute inset-0 p-6 md:p-16 flex flex-col items-center justify-end text-center">
                          <span className="bg-agape-red text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">{event.category}</span>
                          <h3 className="text-3xl md:text-5xl font-serif text-white mb-4 leading-tight">{event.title}</h3>
                          <div className="flex items-center gap-2 text-white/95"><svg className="w-5 h-5 text-agape-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span>{event.date} às {event.time}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Indicators */}
                  <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
                    {SPECIAL_EVENTS_DATA.map((_, i) => (
                      <button key={i} onClick={() => setCurrentEventIndex(i)} className={`h-1.5 transition-all rounded-full ${i === currentEventIndex ? 'w-8 bg-agape-red' : 'w-2 bg-white/50'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Onde Estamos */}
            <div className="pt-16 pb-12 px-6 bg-white dark:bg-gray-950">
              <div className="max-w-5xl mx-auto text-center">
                <SectionTitle title="Onde Estamos" subtitle="Rua Mozart Bastos Soares, 1390 - Cehab, Itaperuna-RJ" />
                <div className="h-[400px] w-full max-w-4xl mx-auto rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
                  <iframe title="Mapa" src="https://www.google.com/maps?q=Rua+Mozart+Bastos+Soares+1390+Cehab+Itaperuna+RJ&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
                </div>
                <div className="mt-8">
                  <a 
                    href="https://www.google.com/maps/place/Igreja+internacional+%C3%81gape/@-21.1866217,-41.8959563,105m/data=!3m1!1e3!4m12!1m5!3m4!2zMjHCsDExJzExLjUiUyA0McKwNTMnNDUuNSJX!8m2!3d-21.1865313!4d-41.8959801!3m5!1s0xbc604bc03f0f8d:0x92a191f74c1f921c!8m2!3d-21.1866173!4d-41.8960956!16s%2Fg%2F11b6gqt4zd?entry=ttu&g_ep=EgoyMDI2MDEyNi4wIKXMDSoASAFQAw%3D%3D" 
                    target="_blank" rel="noopener noreferrer" 
                    className="inline-flex items-center gap-3 bg-agape-red text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Como Chegar
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Other Sections */}
        {activeSection !== 'home' && (
          <div className="max-w-5xl mx-auto px-6 py-12 animate-fadeIn">
            {activeSection === 'history' && (
              <>
                <SectionTitle title="Nossa História" />
                <div className="prose prose-lg dark:prose-invert max-w-none text-center text-gray-700 dark:text-gray-300 font-light" dangerouslySetInnerHTML={{ __html: CHURCH_HISTORY.replace(/\n/g, '<br/>') }}></div>
              </>
            )}

            {activeSection === 'schedule' && (
              <>
                <SectionTitle title="Agenda Semanal" />
                <div className="space-y-4 max-w-2xl mx-auto">
                  {SCHEDULE_DATA.map((item) => (
                    <div key={item.id} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center group hover:shadow-md transition-all">
                      <div><h4 className="font-bold dark:text-white">{item.title}</h4><p className="text-sm text-agape-red dark:text-red-400 font-medium">{item.day} • {item.time}</p></div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'events' && (
              <>
                <SectionTitle title="Agenda de Eventos" subtitle="Participe de nossos eventos especiais e conferências." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {SPECIAL_EVENTS_DATA.map((event) => (
                    <div key={event.id} className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group">
                      <div className="relative h-48 overflow-hidden">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 left-4 bg-agape-red text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">{event.category}</div>
                      </div>
                      <div className="p-8">
                        <h4 className="text-xl font-serif dark:text-white mb-2">{event.title}</h4>
                        <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                          <span>📅 {event.date}</span>
                          <span>⏰ {event.time}</span>
                          <span>📍 {event.location}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-6">{event.description}</p>
                        <button onClick={() => setSelectedEvent(event)} className="w-full bg-gray-900 dark:bg-gray-700 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-agape-red transition-all">Ver Detalhes</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'ministries' && (
              <>
                <SectionTitle title="Nossas Redes" subtitle="Conheça nossos ministérios e áreas de atuação." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {MINISTRIES_DATA.map((min) => (
                    <div key={min.id} className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                      <div className={`h-3 w-full ${min.color}`}></div>
                      <div className="p-8">
                        <h4 className="text-2xl font-serif dark:text-white mb-1">{min.name}</h4>
                        <p className="text-agape-red dark:text-red-400 text-[10px] font-black uppercase tracking-widest mb-6">{min.tagline}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed italic">"{min.description}"</p>
                        <div className="space-y-4 text-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">👤</span>
                            <span className="dark:text-gray-200"><strong>Líder:</strong> {min.leader}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">🕒</span>
                            <span className="dark:text-gray-200"><strong>Reuniões:</strong> {min.meetingInfo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'cells' && (
              <>
                <SectionTitle title="Encontre sua Célula" subtitle="Busque pelo bairro, líder ou dia." />
                <div className="max-w-2xl mx-auto mb-12 space-y-6">
                  <input type="text" placeholder="Buscar por bairro, líder ou dia..." className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl outline-none shadow-sm dark:text-white" value={cellSearchTerm} onChange={(e) => setCellSearchTerm(e.target.value)} />
                  <div className="flex justify-center">
                    <button onClick={handleLocateUser} disabled={isLocating} className="bg-agape-red text-white px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 flex items-center gap-2">
                      {isLocating ? 'Buscando...' : userLocation ? 'Células mais próximas no topo' : 'Ver Células Perto de Mim'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredCells.map(renderCellCard)}
                </div>
              </>
            )}

            {activeSection === 'teaching' && (
              <>
                <SectionTitle title="Escola Bíblica" subtitle="Crescendo na graça e no conhecimento." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {COURSES_DATA.map((course) => (
                    <div key={course.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md">
                      <img src={course.image} className="w-full sm:w-48 h-auto object-contain cursor-zoom-in" alt={course.title} onClick={() => setZoomedImage(course.image)} />
                      <div className="p-6">
                        <h4 className="font-bold dark:text-white">{course.title}</h4>
                        <p className="text-xs text-agape-red font-bold mb-3 uppercase">{course.duration}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{course.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'booking' && (
              <div className="max-w-2xl mx-auto">
                <SectionTitle title="Atendimento Pastoral" subtitle="Agende um momento de aconselhamento." />
                {bookingSuccess ? (
                  <div className="bg-green-50 dark:bg-green-900/20 p-10 rounded-3xl text-center border border-green-100 dark:border-green-800">
                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
                    <h3 className="text-2xl font-serif text-green-900 dark:text-green-400">Solicitação Enviada!</h3>
                    <button onClick={() => setBookingSuccess(false)} className="mt-8 bg-green-600 text-white px-8 py-4 rounded-xl font-bold">Novo Agendamento</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitBooking} className="bg-gray-50 dark:bg-gray-800 p-8 md:p-12 rounded-[32px] border border-gray-100 dark:border-gray-700 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input required name="nome" value={bookingData.nome} onChange={handleBookingChange} className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 text-gray-900 dark:text-white outline-none focus:border-agape-red transition-all" placeholder="Seu Nome" />
                      <input required name="whatsapp" value={bookingData.whatsapp} onChange={handleBookingChange} className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 text-gray-900 dark:text-white outline-none focus:border-agape-red transition-all" placeholder="WhatsApp" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <select name="pastor" value={bookingData.pastor} onChange={handleBookingChange} className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 text-gray-900 dark:text-white outline-none focus:border-agape-red transition-all">
                        {PASTORS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input required name="data" value={bookingData.data} onChange={handleBookingChange} type="date" className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 text-gray-900 dark:text-white outline-none focus:border-agape-red transition-all" />
                    </div>
                    <div className="space-y-1">
                      <select name="periodo" value={bookingData.periodo} onChange={handleBookingChange} className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 text-gray-900 dark:text-white outline-none focus:border-agape-red transition-all">
                        <option value="Manhã (09:00 - 12:00)">Manhã (09:00 - 12:00)</option>
                        <option value="Tarde (14:00 - 17:00)">Tarde (14:00 - 17:00)</option>
                        <option value="Noite (Sob consulta)">Noite (Sob consulta)</option>
                      </select>
                    </div>
                    <textarea name="motivo" value={bookingData.motivo} onChange={handleBookingChange} className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 text-gray-900 dark:text-white outline-none focus:border-agape-red h-32 resize-none transition-all" placeholder="Motivo da conversa..." />
                    <button type="submit" disabled={isSendingBooking} className="w-full bg-agape-red text-white py-5 rounded-2xl font-bold uppercase tracking-widest shadow-xl active:scale-[0.98]">
                      {isSendingBooking ? 'Enviando...' : 'Solicitar Agendamento'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeSection === 'donations' && (
              <div className="max-w-2xl mx-auto">
                <SectionTitle title="Dízimos e Ofertas" subtitle="Sua fidelidade contribui para o Reino de Deus." />
                <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[32px] border border-gray-100 dark:border-gray-700 text-center space-y-8 shadow-sm">
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif dark:text-white">Escaneie o QR Code PIX</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Use o app do seu banco para ler o código abaixo</p>
                  </div>
                  
                  <div className="relative inline-block p-4 bg-white rounded-2xl shadow-inner border border-gray-50">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020126360014BR.GOV.BCB.PIX0114033534040001575204000053039865802BR5925COMUNIDADE AGAPE DE LOUVO6009SAO.PAULO62070503***6304994C`} 
                      alt="QR Code PIX" 
                      className="w-48 h-48 mx-auto" 
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl text-left space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Instituição</span>
                      <span className="text-xs font-medium dark:text-gray-200">Igreja Internacional Ágape</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400">CNPJ</span>
                      <span className="text-xs font-medium dark:text-gray-200">03.353.404/0001-57</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCopyPixCode} 
                    className={`w-full py-5 rounded-2xl font-bold transition-all text-white shadow-xl active:scale-[0.98] ${pixCopied ? 'bg-green-500' : 'bg-gray-900 dark:bg-gray-700'}`}
                  >
                    {pixCopied ? 'Chave Copiada! 🙏' : 'Copiar Chave PIX'}
                  </button>
                  
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">"Cada um contribua segundo propôs no seu coração" - 2 Co 9:7</p>
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <SectionTitle title="Ajustes" />
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[32px] p-6 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 text-agape-red rounded-2xl">
                      {darkMode ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="4" strokeWidth={2} />
                          <path strokeLinecap="round" strokeWidth={2} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                        </svg>
                      )}
                    </div>
                    <div><h3 className="font-bold dark:text-white">Modo Escuro</h3><p className="text-xs text-gray-500">Tema visual do aplicativo</p></div>
                  </div>
                  <ToggleSwitch active={darkMode} onClick={() => setDarkMode(!darkMode)} />
                </div>
                {/* Notifications in Settings */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[32px] p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-red-50 dark:bg-red-950/30 text-agape-red rounded-2xl"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg></div>
                      <div><h3 className="font-bold dark:text-white">Notificações</h3><p className="text-xs text-gray-500">Alertas e lembretes</p></div>
                    </div>
                    <ToggleSwitch active={notifConfig.master} onClick={handleToggleMasterNotifications} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl animate-slideIn" alt="Zoom" />
        </div>
      )}

      {showBackToTop && activeSection !== 'home' && (
        <button onClick={scrollToTop} className="fixed bottom-24 right-6 bg-agape-red text-white p-4 rounded-full shadow-2xl animate-fadeIn"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg></button>
      )}

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-10 text-center transition-colors duration-300">
        <AgapeLogo className="h-8 w-auto mx-auto mb-4" />
        <p className="text-gray-300 dark:text-gray-600 text-[8px] tracking-[0.2em] uppercase">&copy; {new Date().getFullYear()} - Ágape Itaperuna</p>
      </footer>
    </div>
  );
};

export default App;
