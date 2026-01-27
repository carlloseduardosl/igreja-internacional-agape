
import React, { useState, useEffect, useMemo } from 'react';
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

  // Cell Search State
  const [cellSearchTerm, setCellSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Donation State
  const [donationStep, setDonationStep] = useState<'form' | 'payment' | 'success'>('form');
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationCategory, setDonationCategory] = useState<string>('Oferta');
  const [pixCopied, setPixCopied] = useState(false);
  const presetAmounts = ['30', '50', '100', '200'];
  const donationCategories = ['Dízimo', 'Oferta', 'Missões', 'Obra Social', 'Construção'];

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

  const toggleSubNotif = (key: keyof typeof notifConfig) => {
    if (!notifConfig.master) return;
    // Fix: Corrected typo 'setDonifConfig' to 'setNotifConfig'
    setNotifConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const showTestNotification = async (message: string) => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.showNotification('Ágape Itaperuna', {
          body: message,
          icon: 'https://iili.io/f4RBYzP.jpg',
          badge: 'https://iili.io/f4RBYzP.jpg',
          vibrate: [100, 50, 100],
        } as any);
        return;
      }
    }
    new Notification('Ágape Itaperuna', { body: message, icon: 'https://iili.io/f4RBYzP.jpg' });
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
    // Configurações refinadas para maximizar a precisão
    const geoOptions = {
      enableHighAccuracy: true, // Força o uso de GPS se disponível
      timeout: 15000,           // Espera até 15 segundos por um sinal de qualidade
      maximumAge: 0             // Impede o uso de localização em cache (força leitura nova)
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

  const groupedCells = useMemo(() => {
    if (userLocation) return null;

    return filteredCells.reduce((acc, cell) => {
      const day = cell.day;
      if (!acc[day]) acc[day] = [];
      acc[day].push(cell);
      return acc;
    }, {} as Record<string, CellGroup[]>);
  }, [filteredCells, userLocation]);

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingBooking(true);

    try {
      const FORMSPREE_URL = 'https://formspree.io/f/maqqgbpn'; 
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

  const SectionTitle: React.FC<{ title: string; subtitle?: string; light?: boolean }> = ({ title, subtitle, light }) => (
    <div className="text-center mb-10">
      <h2 className={`text-3xl md:text-4xl font-serif mb-3 px-4 ${light || darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      {subtitle && <p className={`max-w-2xl mx-auto px-6 text-sm ${light || darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{subtitle}</p>}
      <div className="w-12 h-[2px] bg-agape-red mx-auto mt-5"></div>
    </div>
  );

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

  const ImageZoomOverlay = () => {
    if (!zoomedImage) return null;
    return (
      <div 
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        onClick={() => setZoomedImage(null)}
      >
        <div className="relative max-w-5xl w-full flex items-center justify-center">
          <button 
            onClick={() => setZoomedImage(null)}
            className="absolute -top-12 right-0 text-white hover:text-agape-red transition-colors p-2"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img 
            src={zoomedImage} 
            alt="Imagem ampliada" 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-slideIn" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  };

  const EventDetailOverlay = () => {
    if (!selectedEvent) return null;
    return (
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
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-2 mb-6">
              <p className="text-sm dark:text-gray-200"><strong>Data:</strong> {selectedEvent.date}</p>
              <p className="text-sm dark:text-gray-200"><strong>Horário:</strong> {selectedEvent.time}</p>
              <p className="text-sm dark:text-gray-200"><strong>Local:</strong> {selectedEvent.location}</p>
            </div>
            
            <div className="space-y-3">
              {selectedEvent.whatsappLink && (
                <a 
                  href={selectedEvent.whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Falar no WhatsApp
                </a>
              )}
              <button onClick={() => setSelectedEvent(null)} className="w-full bg-agape-red text-white py-4 rounded-xl font-bold">Fechar</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const finalYoutubeUrl = useMemo(() => {
    return `${YOUTUBE_LIVE_EMBED_URL}&rel=0&modestbranding=1&autoplay=0`;
  }, []);

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
            <span className="text-gray-400 dark:text-gray-500 mt-1 uppercase text-[10px] font-bold w-12 shrink-0">Bairro</span>
            <p className="text-sm dark:text-gray-300">{cell.neighborhood || 'Itaperuna'}</p>
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
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Como Chegar (GPS)
        </a>
        <a 
          href={formatWhatsappUrl(cell.contact, `Olá, gostaria de saber mais informações sobre a ${cell.name}!`)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-center hover:bg-[#128C7E] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Falar com Líder
        </a>
      </div>
    </div>
  );

  const ToggleSwitch = ({ active, onClick, disabled = false }: { active: boolean, onClick: () => void, disabled?: boolean }) => (
    <button 
      onClick={(e) => { e.preventDefault(); if(!disabled) onClick(); }}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar onNavigate={(s) => { setActiveSection(s); setBookingSuccess(false); setDonationStep('form'); window.scrollTo(0, 0); }} activeSection={activeSection} />

      <main className="flex-grow pt-14">
        <EventDetailOverlay />
        <ImageZoomOverlay />

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

            {/* SEÇÃO: Ágape TV */}
            <div className="pt-16 pb-10 px-4 md:px-6 bg-white dark:bg-gray-950 overflow-hidden">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8 px-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </span>
                    <span className="text-agape-red font-bold uppercase tracking-widest text-[10px]">Ao Vivo</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white">Ágape TV</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Acompanhe nossos cultos de onde estiver.</p>
                </div>

                <div className="relative w-full max-w-4xl mx-auto rounded-2xl md:rounded-3xl overflow-hidden bg-black shadow-lg">
                  <div className="aspect-video w-full relative">
                    <iframe 
                      src={finalYoutubeUrl}
                      title="Ágape TV Live"
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      loading="eager"
                    ></iframe>
                  </div>
                </div>

                <div className="mt-8 text-center px-4">
                  <p className="text-gray-400 dark:text-gray-500 text-[9px] md:text-[10px] uppercase tracking-widest mb-4 leading-relaxed">
                    Não consegue visualizar? Algumas redes mobile ou navegadores com proteção extra podem bloquear o vídeo.
                  </p>
                  <a 
                    href={YOUTUBE_CHANNEL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-agape-red text-white px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    Abrir no Canal do YouTube
                  </a>
                </div>
              </div>
            </div>

            {/* SEÇÃO CARROSSEL: Próximos Eventos */}
            <div className="py-12 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 overflow-hidden">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8 px-2">
                  <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white leading-tight">Próximos Eventos</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 uppercase tracking-widest text-[10px] font-bold">Fique por dentro da nossa agenda</p>
                  <div className="w-10 h-1 bg-agape-red mt-2 mx-auto"></div>
                </div>

                <div className="relative group w-full h-[480px] md:h-[600px] rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div 
                    className="relative w-full h-full flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{ transform: `translateX(-${currentEventIndex * 100}%)` }}
                  >
                    {(SPECIAL_EVENTS_DATA as SpecialEvent[]).map((event) => (
                      <div 
                        key={event.id}
                        className="w-full h-full flex-shrink-0 relative cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <img 
                          src={event.image} 
                          alt={event.title} 
                          className="absolute inset-0 w-full h-full object-cover opacity-80" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="absolute inset-0 p-6 md:p-16 flex flex-col items-center justify-end text-center">
                          <span className="bg-agape-red text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 md:mb-6 shadow-lg shadow-red-900/20">
                            {event.category.toUpperCase()}
                          </span>
                          <h3 className="text-3xl md:text-5xl font-serif text-white mb-4 leading-tight drop-shadow-md">
                            {event.title}
                          </h3>
                          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8 mb-8 text-white/95">
                            <div className="flex items-center gap-2 justify-center">
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-agape-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <span className="font-bold text-sm md:text-lg">{event.date} às {event.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
                    {(SPECIAL_EVENTS_DATA as any[]).map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setCurrentEventIndex(index); }}
                        className={`h-1.5 transition-all rounded-full ${
                          index === currentEventIndex ? 'w-8 bg-agape-red' : 'w-2 bg-white/50 hover:bg-white'
                        }`}
                        aria-label={`Ir para slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div className="hidden md:flex absolute inset-y-0 left-0 right-0 z-20 items-center justify-between px-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentEventIndex((prev) => (prev - 1 + SPECIAL_EVENTS_DATA.length) % SPECIAL_EVENTS_DATA.length);
                      }}
                      className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-agape-red transition-all pointer-events-auto shadow-2xl transform group-hover:translate-x-2"
                      title="Anterior"
                    >
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentEventIndex((prev) => (prev + 1) % SPECIAL_EVENTS_DATA.length);
                      }}
                      className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-agape-red transition-all pointer-events-auto shadow-2xl transform group-hover:-translate-x-2"
                      title="Próximo"
                    >
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Onde Estamos */}
            <div className="pt-16 pb-12 px-6 bg-white dark:bg-gray-950">
              <div className="max-w-5xl mx-auto text-center">
                <SectionTitle title="Onde Estamos" subtitle="Rua Mozart Bastos Soares, 1390 - Cehab, Itaperuna-RJ" />
                <div className="h-[400px] w-full max-w-4xl mx-auto rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 mt-4">
                  <iframe 
                    title="Mapa" 
                    src="https://www.google.com/maps?q=Rua+Mozart+Bastos+Soares+1390+Cehab+Itaperuna+RJ&output=embed" 
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <div className="mt-8">
                  <a 
                    href="https://www.google.com/maps/place/Igreja+internacional+%C3%81gape/@-21.1866173,-41.9051078,1511m/data=!3m1!1e3!4m10!1m2!2m1!1sRua+Mozart+Bastos+Soares+1390+Cehab+Itaperuna+RJ!3m6!1s0xbc604bc03f0f8d:0x92a191f74c1f921c!8m2!3d-21.1866173!4d-41.8960956"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-agape-red text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Como Chegar
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection !== 'home' && (
          <div className="max-w-5xl mx-auto px-6 py-12">
            {activeSection === 'history' && (
              <div className="animate-fadeIn">
                <SectionTitle title="Nossa História" />
                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-light text-center">
                  {CHURCH_HISTORY.split('\n').map((p, i) => (
                    <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: p }} />
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'schedule' && (
              <div className="animate-fadeIn">
                <SectionTitle title="Agenda Semanal" />
                <div className="space-y-4 max-w-2xl mx-auto">
                  {SCHEDULE_DATA.map((item) => (
                    <div key={item.id} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center group hover:bg-white dark:hover:bg-gray-750 hover:shadow-md transition-all">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-sm text-agape-red dark:text-red-400 font-medium">{item.day} • {item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'events' && (
              <div className="animate-fadeIn">
                <SectionTitle title="Eventos Especiais" subtitle="Confira nossa lista completa de programações e eventos." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {SPECIAL_EVENTS_DATA.map((event) => (
                    <div key={event.id} className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all">
                      <div className="relative h-56 overflow-hidden">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 left-4 bg-agape-red text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                          {event.category}
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="text-2xl font-serif mb-2 text-gray-900 dark:text-white">{event.title}</h3>
                        <p className="text-agape-red dark:text-red-400 text-sm font-bold mb-4">{event.date} • {event.time}</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2 leading-relaxed">{event.description}</p>
                        <button onClick={() => setSelectedEvent(event)} className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-agape-red hover:text-white transition-all">Mais Informações</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'ministries' && (
              <div className="animate-fadeIn">
                <SectionTitle title="Nossas Redes" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MINISTRIES_DATA.map((m) => (
                    <div key={m.id} className="p-8 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-center hover:bg-white dark:hover:bg-gray-750 hover:shadow-lg transition-all flex flex-col">
                      <div className="w-10 h-[2px] bg-agape-red mx-auto mb-4"></div>
                      <h3 className="text-xl font-serif mb-2 dark:text-white">{m.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-grow">{m.description}</p>
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-left space-y-2 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-agape-red dark:text-red-400 uppercase tracking-wider">Líder(es)</span>
                          <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{m.leader}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'cells' && (
              <div className="animate-fadeIn">
                <SectionTitle title="Encontre sua Célula" subtitle="Busque pelo bairro, dia ou use sua localização para encontrar a célula mais próxima." />
                
                <div className="max-w-2xl mx-auto mb-12 space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Buscar por bairro, líder ou dia..." 
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 pl-12 rounded-2xl text-sm outline-none shadow-sm transition-all focus:border-agape-red focus:ring-1 focus:ring-agape-red/20 dark:text-white dark:placeholder-gray-500"
                      value={cellSearchTerm}
                      onChange={(e) => setCellSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-center">
                    <button 
                      onClick={handleLocateUser}
                      disabled={isLocating}
                      className={`
                        flex items-center gap-3 px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95
                        ${isLocating 
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                          : userLocation 
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' 
                            : 'bg-agape-red text-white hover:bg-red-700'
                        }
                      `}
                    >
                      {isLocating ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Buscando Sinal Preciso...
                        </>
                      ) : userLocation ? (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Células mais próximas no topo
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Ver Células Perto de Mim
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="animate-fadeIn">
                  {userLocation ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {filteredCells.map(renderCellCard)}
                    </div>
                  ) : groupedCells ? (
                    <div className="space-y-12">
                      {(Object.entries(groupedCells) as [string, CellGroup[]][]).map(([day, cells]) => (
                        <div key={day} className="space-y-6">
                          <div className="flex items-center gap-4">
                            <h3 className="text-xl font-serif text-gray-900 dark:text-white shrink-0">{day}</h3>
                            <div className="h-[1px] bg-gray-200 dark:bg-gray-800 w-full"></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {cells.map(renderCellCard)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {filteredCells.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <p className="text-gray-400 dark:text-gray-500 font-serif italic">Nenhuma célula encontrada com esses termos.</p>
                      <button onClick={() => setCellSearchTerm('')} className="mt-4 text-agape-red dark:text-red-400 text-xs font-bold uppercase tracking-widest underline">Limpar busca</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'teaching' && (
              <div className="animate-fadeIn">
                <SectionTitle title="Escola Bíblica" subtitle="Crescendo na graça e no conhecimento da Palavra." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {COURSES_DATA.map((course) => (
                    <div key={course.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow">
                      <img 
                        src={course.image} 
                        className="w-full sm:w-48 h-auto object-contain cursor-zoom-in hover:opacity-90 transition-opacity" 
                        alt={course.title} 
                        onClick={() => setZoomedImage(course.image)}
                      />
                      <div className="p-6 flex flex-col justify-center">
                        <h4 className="font-bold text-lg mb-1 dark:text-white">{course.title}</h4>
                        <p className="text-xs text-agape-red dark:text-red-400 font-bold mb-3 uppercase tracking-widest">{course.duration}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{course.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'booking' && (
              <div className="animate-fadeIn max-w-2xl mx-auto">
                <SectionTitle title="Atendimento Pastoral" subtitle="Agende um momento para aconselhamento, oração ou conversa com nossos pastores." />
                
                {bookingSuccess ? (
                  <div className="bg-green-50 dark:bg-green-900/20 p-10 rounded-3xl text-center border border-green-100 dark:border-green-800 animate-fadeIn">
                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
                    <h3 className="text-2xl font-serif text-green-900 dark:text-green-400 mb-2">Solicitação Enviada!</h3>
                    <p className="text-green-700 dark:text-green-300 text-sm mb-8">Recebemos seu pedido. Em breve entraremos em contato via WhatsApp para confirmar.</p>
                    <button 
                      onClick={() => setBookingSuccess(false)}
                      className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest"
                    >
                      Novo Agendamento
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitBooking} className="bg-gray-50 dark:bg-gray-800 p-8 md:p-12 rounded-[32px] border border-gray-100 dark:border-gray-700 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Seu Nome</label>
                        <input required name="nome" value={bookingData.nome} onChange={handleBookingChange} type="text" className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 outline-none focus:border-agape-red transition-all text-sm bg-white dark:bg-gray-750 dark:text-white" placeholder="Nome completo" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">WhatsApp</label>
                        <input required name="whatsapp" value={bookingData.whatsapp} onChange={handleBookingChange} type="tel" className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 outline-none focus:border-agape-red transition-all text-sm bg-white dark:bg-gray-750 dark:text-white" placeholder="(22) 99999-9999" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Pastor(a)</label>
                        <select name="pastor" value={bookingData.pastor} onChange={handleBookingChange} className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 outline-none focus:border-agape-red transition-all text-sm bg-white dark:bg-gray-750 dark:text-white">
                          {PASTORS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Data Desejada</label>
                        <input required name="data" value={bookingData.data} onChange={handleBookingChange} type="date" className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 outline-none focus:border-agape-red transition-all text-sm bg-white dark:bg-gray-750 dark:text-white" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Período</label>
                      <select name="periodo" value={bookingData.periodo} onChange={handleBookingChange} className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 outline-none focus:border-agape-red transition-all text-sm bg-white dark:bg-gray-750 dark:text-white">
                        <option>Manhã (09:00 - 12:00)</option>
                        <option>Tarde (14:00 - 17:00)</option>
                        <option>Noite (Sob consulta)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Motivo / Assunto</label>
                      <textarea name="motivo" value={bookingData.motivo} onChange={handleBookingChange} rows={3} className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 outline-none focus:border-agape-red transition-all text-sm resize-none bg-white dark:bg-gray-750 dark:text-white" placeholder="Ex: Aconselhamento, Oração, Visita..." />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSendingBooking}
                      className="w-full bg-agape-red text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      {isSendingBooking ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : 'Solicitar Agendamento'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeSection === 'donations' && (
              <div className="animate-fadeIn max-w-2xl mx-auto">
                <SectionTitle title="Dízimos e Ofertas" subtitle="Sua fidelidade contribui para o crescimento do Reino e manutenção das obras sociais." />
                
                {donationStep === 'form' && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-8 md:p-12 rounded-[32px] border border-gray-100 dark:border-gray-700 space-y-8 animate-fadeIn">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Selecione uma categoria</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {donationCategories.map(cat => (
                          <button 
                            key={cat} 
                            onClick={() => setDonationCategory(cat)}
                            className={`p-3 text-[10px] font-bold rounded-xl border transition-all uppercase tracking-widest ${donationCategory === cat ? 'bg-agape-red text-white border-agape-red shadow-lg' : 'bg-white dark:bg-gray-750 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-agape-red/30'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Valor da Contribuição (R$)</label>
                      <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                        {presetAmounts.map(amount => (
                          <button 
                            key={amount} 
                            onClick={() => setDonationAmount(amount)}
                            className="bg-white dark:bg-gray-750 border border-gray-100 dark:border-gray-700 px-6 py-3 rounded-xl font-bold text-xs hover:border-agape-red hover:text-agape-red transition-all shrink-0 dark:text-gray-200"
                          >
                            R$ {amount}
                          </button>
                        ))}
                      </div>
                      <input 
                        type="number" 
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="Outro valor..." 
                        className="w-full p-5 rounded-2xl border border-gray-200 dark:border-gray-700 outline-none focus:border-agape-red text-xl font-serif bg-white dark:bg-gray-750 dark:text-white"
                      />
                    </div>

                    <button 
                      onClick={() => setDonationStep('payment')}
                      disabled={!donationAmount}
                      className="w-full bg-agape-red text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      Continuar com PIX
                    </button>
                  </div>
                )}

                {donationStep === 'payment' && (
                  <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[32px] border border-gray-100 dark:border-gray-700 text-center space-y-8 animate-fadeIn">
                    <div className="space-y-2">
                      <h3 className="text-xl font-serif text-gray-900 dark:text-white">Contribuição via PIX</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">Destino: {donationCategory} - Valor: R$ {donationAmount}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-white p-6 rounded-3xl inline-block mx-auto border-4 border-white dark:border-gray-700 shadow-inner">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020126360014BR.GOV.BCB.PIX0114033534040001575204000053039865802BR5925COMUNIDADE AGAPE DE LOUVO6009SAO.PAULO62070503***6304994C" 
                        alt="QR Code PIX" 
                        className="w-48 h-48 md:w-56 md:h-56 mix-blend-multiply"
                      />
                    </div>

                    <div className="space-y-4">
                      <button 
                        onClick={handleCopyPixCode}
                        className={`w-full py-5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${pixCopied ? 'bg-green-500 text-white shadow-green-200 shadow-xl' : 'bg-gray-900 dark:bg-black text-white'}`}
                      >
                        {pixCopied ? 'Copiado com Sucesso!' : 'Copiar Código PIX (Copia e Cola)'}
                      </button>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl text-left border border-gray-100 dark:border-gray-600">
                        <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Dados da Conta</p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-tight">
                          <strong>Favorecido:</strong> Comunidade Louvor Adoração Ágape<br/>
                          <strong>CNPJ:</strong> 03.353.404/0001-57<br/>
                          <strong>Banco:</strong> SICOOB (756)
                        </p>
                      </div>

                      <button 
                        onClick={() => setDonationStep('form')}
                        className="text-agape-red dark:text-red-400 text-[10px] font-bold uppercase tracking-widest hover:underline mt-4"
                      >
                        ← Alterar Valor
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="animate-fadeIn max-w-2xl mx-auto">
                <SectionTitle title="Ajustes e Informações" subtitle="Gerencie suas preferências e saiba mais sobre o aplicativo." />
                
                <div className="space-y-6">
                  {/* Seção de Tema Visua */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[32px] p-8 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-50 dark:bg-red-950/30 text-agape-red dark:text-red-400 rounded-2xl">
                          {darkMode ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707-.707M15.657 12a3.657 3.657 0 11-7.314 0 3.657 3.657 0 017.314 0z" /></svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">Modo Escuro</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Alterne entre o tema claro e escuro.</p>
                        </div>
                      </div>
                      <ToggleSwitch active={darkMode} onClick={() => setDarkMode(!darkMode)} />
                    </div>
                  </div>

                  {/* Seção de Notificações */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[32px] p-8 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-50 dark:bg-red-950/30 text-agape-red dark:text-red-400 rounded-2xl">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">Notificações</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Ativar ou desativar todos os alertas.</p>
                        </div>
                      </div>
                      <ToggleSwitch active={notifConfig.master} onClick={handleToggleMasterNotifications} />
                    </div>

                    <div className={`space-y-6 transition-all duration-500 ${!notifConfig.master ? 'pointer-events-none opacity-40' : ''}`}>
                      <div className="h-[1px] bg-gray-50 dark:bg-gray-700 w-full mb-6"></div>
                      
                      <div className="flex items-center justify-between group">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Avisos Gerais</h4>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Cultos e Mensagens Urgentes</p>
                        </div>
                        <ToggleSwitch active={notifConfig.general} onClick={() => toggleSubNotif('general')} disabled={!notifConfig.master} />
                      </div>

                      <div className="flex items-center justify-between group">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Novos Eventos</h4>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Agenda de Congressos e Retiros</p>
                        </div>
                        <ToggleSwitch active={notifConfig.events} onClick={() => toggleSubNotif('events')} disabled={!notifConfig.master} />
                      </div>

                      <div className="flex items-center justify-between group">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Lembretes de Células</h4>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Horários e locais das reuniões</p>
                        </div>
                        <ToggleSwitch active={notifConfig.cells} onClick={() => toggleSubNotif('cells')} disabled={!notifConfig.master} />
                      </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1">Status do Navegador</p>
                      <p className={`text-xs font-bold ${notifStatus === 'granted' ? 'text-green-600' : notifStatus === 'denied' ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                        {notifStatus === 'granted' ? 'Permissão Concedida' : notifStatus === 'denied' ? 'Acesso Negado' : 'Aguardando Permissão'}
                      </p>
                    </div>
                  </div>

                  {/* Seção de Informações do App */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[32px] p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-4 border-b border-gray-50 dark:border-gray-700 pb-6">
                       <AgapeLogo className="h-8 w-auto" />
                       <div>
                         <h3 className="font-bold text-gray-900 dark:text-white">App Ágape Itaperuna</h3>
                         <p className="text-xs text-gray-500 dark:text-gray-400">Versão 1.0.4 Stable</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1">Desenvolvedor</p>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Comunidade Ágape</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1">Licença</p>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Uso Institucional</p>
                      </div>
                    </div>

                    <a 
                      href="mailto:contato@agapeitaperuna.com.br" 
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-agape-red/20 transition-all group"
                    >
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Suporte & Feedback</span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-agape-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Botão Voltar ao Topo */}
      {activeSection !== 'home' && showBackToTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 md:right-10 z-[40] bg-agape-red text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all animate-fadeIn"
          aria-label="Voltar ao Topo"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-10 text-center transition-colors duration-300">
        <AgapeLogo className="h-8 w-auto mx-auto mb-4" />
        <p className="text-gray-300 dark:text-gray-600 text-[8px] tracking-[0.2em] uppercase">&copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default App;
