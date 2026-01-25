
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

  // Cell Search State
  const [cellSearchTerm, setCellSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Donation State
  const [donationStep, setDonationStep] = useState<'form' | 'payment' | 'success'>('form');
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationCategory, setDonationCategory] = useState<string>('Oferta');
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

  useEffect(() => {
    fetchDailyVerse();
  }, []);

  const fetchDailyVerse = async () => {
    const verse = await getDailyVerse();
    setDailyVerse(verse);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Raio da Terra em KM
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
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const filteredCells = useMemo(() => {
    let result = [...CELLS_DATA];
    
    // Filtro por texto
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

    // Ordenação por localização
    if (userLocation) {
      result = result.map(c => ({
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
      <h2 className={`text-3xl md:text-4xl font-serif mb-3 px-4 ${light ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      {subtitle && <p className={`max-w-2xl mx-auto px-6 text-sm ${light ? 'text-gray-300' : 'text-gray-500'}`}>{subtitle}</p>}
      <div className="w-12 h-[2px] bg-agape-red mx-auto mt-5"></div>
    </div>
  );

  const handleCopyPixCode = () => {
    const pixCode = "00020126360014BR.GOV.BCB.PIX0114033534040001575204000053039865802BR5925COMUNIDADE AGAPE DE LOUVO6009SAO.PAULO62070503***6304994C";
    navigator.clipboard.writeText(pixCode);
    alert('Código PIX Copia e Cola copiado com sucesso!');
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
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideIn">
          <div className="relative h-56">
            <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
            <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-serif mb-4">{selectedEvent.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{selectedEvent.description}</p>
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 mb-6">
              <p className="text-sm"><strong>Data:</strong> {selectedEvent.date}</p>
              <p className="text-sm"><strong>Horário:</strong> {selectedEvent.time}</p>
              <p className="text-sm"><strong>Local:</strong> {selectedEvent.location}</p>
            </div>
            
            <div className="space-y-3">
              {selectedEvent.whatsappLink && (
                <a 
                  href={selectedEvent.whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.761-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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

  const closestEvent = SPECIAL_EVENTS_DATA[0];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar onNavigate={(s) => { setActiveSection(s); setBookingSuccess(false); setDonationStep('form'); window.scrollTo(0, 0); }} activeSection={activeSection} />

      <main className="flex-grow pt-14">
        <EventDetailOverlay />
        <ImageZoomOverlay />

        {activeSection === 'home' && (
          <section className="animate-fadeIn">
            {/* Hero - Altura reduzida de 65vh para 45vh */}
            <div className="relative h-[45vh] bg-black text-white flex items-center justify-center overflow-hidden">
              <img src="https://iili.io/f4TNO2s.jpg" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Igreja Ágape" />
              <div className="relative z-10 text-center px-6">
                <h1 className="text-4xl md:text-6xl font-serif mb-3">Bem-vindo à Ágape</h1>
                <p className="text-lg md:text-xl font-light italic text-gray-200">"Onde o Amor de Deus Transforma Vidas"</p>
              </div>
            </div>

            {/* Versículo do Dia */}
            <div className="py-12 px-6 bg-gray-50 border-b border-gray-100">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-agape-red font-bold uppercase tracking-widest text-[10px] mb-4">Versículo Diário</h3>
                <p className="text-lg md:text-xl text-gray-800 italic leading-relaxed font-serif">{dailyVerse}</p>
              </div>
            </div>

            {/* SEÇÃO: Ágape TV - Transmissão ao Vivo */}
            <div className="py-16 px-6 bg-white">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                      </span>
                      <span className="text-agape-red font-bold uppercase tracking-widest text-[10px]">Ao Vivo</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-900">Ágape TV</h2>
                    <p className="text-gray-500 text-sm mt-1">Acompanhe nossos cultos de onde estiver.</p>
                  </div>
                  <a 
                    href={YOUTUBE_CHANNEL_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-red-50 text-agape-red px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-agape-red hover:text-white transition-all shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    Acessar Canal
                  </a>
                </div>

                <div className="relative w-full max-w-4xl mx-auto aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl group">
                  <iframe 
                    src={YOUTUBE_LIVE_EMBED_URL}
                    title="YouTube Live Stream"
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            {/* DESTAQUE: Evento Mais Próximo */}
            {closestEvent && (
              <div className="py-20 px-6 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                  <div className="flex items-center justify-between mb-10 px-2">
                    <div className="text-left">
                      <h2 className="text-3xl md:text-4xl font-serif text-gray-900 leading-tight">Próximo Evento</h2>
                      <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest text-[10px] font-bold">Destaque da semana</p>
                    </div>
                  </div>

                  <div className="group relative w-full h-[500px] md:h-[600px] rounded-[40px] overflow-hidden shadow-2xl bg-gray-900 border border-gray-100">
                    <img 
                      src={closestEvent.image} 
                      alt={closestEvent.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-8 md:p-16 flex flex-col justify-end items-start">
                      <span className="bg-agape-red text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6">
                        {closestEvent.category === 'campanha' ? 'Vigília Especial' : closestEvent.category === 'retiro' ? 'Retiro' : 'Conferência'}
                      </span>
                      <h3 className="text-4xl md:text-6xl font-serif text-white mb-4 leading-none">{closestEvent.title}</h3>
                      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-8 text-white/90">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-agape-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="font-bold text-sm md:text-lg">{closestEvent.date} às {closestEvent.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-agape-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <span className="text-sm md:text-lg">{closestEvent.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <button 
                          onClick={() => setSelectedEvent(closestEvent)}
                          className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-agape-red hover:text-white transition-all shadow-xl active:scale-[0.98]"
                        >
                          Mais Informações
                        </button>
                        <button 
                          onClick={() => { setActiveSection('events'); window.scrollTo(0, 0); }}
                          className="bg-white/10 backdrop-blur-lg border border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-[0.98]"
                        >
                          Ver Todos os Eventos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onde Estamos */}
            <div className="py-20 px-6 bg-white">
              <div className="max-w-5xl mx-auto">
                <SectionTitle title="Onde Estamos" subtitle="Rua Mozart Bastos Soares, 1390 - Cehab, Itaperuna-RJ" />
                <div className="h-[400px] w-full max-w-4xl mx-auto rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 mt-4">
                  <iframe 
                    title="Mapa" 
                    src="https://www.google.com/maps?q=Rua+Mozart+Bastos+Soares+1390+Cehab+Itaperuna+RJ&output=embed" 
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Demais Abas */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          {activeSection === 'history' && (
            <div className="animate-fadeIn">
              <SectionTitle title="Nossa História" />
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-light text-center">
                {CHURCH_HISTORY.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
            </div>
          )}

          {activeSection === 'schedule' && (
            <div className="animate-fadeIn">
              <SectionTitle title="Agenda Semanal" />
              <div className="space-y-4 max-w-2xl mx-auto">
                {SCHEDULE_DATA.map((item) => (
                  <div key={item.id} className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-agape-red font-medium">{item.day} • {item.time}</p>
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
                  <div key={event.id} className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                    <div className="relative h-56 overflow-hidden">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 left-4 bg-agape-red text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        {event.category}
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-serif mb-2 text-gray-900">{event.title}</h3>
                      <p className="text-agape-red text-sm font-bold mb-4">{event.date} • {event.time}</p>
                      <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">{event.description}</p>
                      <button onClick={() => setSelectedEvent(event)} className="w-full bg-gray-50 text-gray-900 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-agape-red hover:text-white transition-all">Mais Informações</button>
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
                  <div key={m.id} className="p-8 bg-gray-50 border border-gray-100 rounded-xl text-center hover:bg-white hover:shadow-lg transition-all flex flex-col">
                    <div className="w-10 h-[2px] bg-agape-red mx-auto mb-4"></div>
                    <h3 className="text-xl font-serif mb-2">{m.name}</h3>
                    <p className="text-gray-500 text-sm mb-6 flex-grow">{m.description}</p>
                    
                    <div className="pt-4 border-t border-gray-200 text-left space-y-2 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-agape-red uppercase tracking-wider">Líder(es)</span>
                        <span className="text-sm text-gray-800 font-medium">{m.leader}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-agape-red uppercase tracking-wider">Encontro</span>
                        <span className="text-sm text-gray-800">{m.meetingInfo}</span>
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
              
              {/* Mecanismo de Busca */}
              <div className="max-w-2xl mx-auto mb-12 space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-agape-red transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Buscar por bairro, líder ou dia da semana..." 
                    className="w-full bg-white border border-gray-200 p-4 pl-12 rounded-2xl text-sm focus:ring-2 focus:ring-agape-red outline-none shadow-sm transition-all"
                    value={cellSearchTerm}
                    onChange={(e) => setCellSearchTerm(e.target.value)}
                  />
                  {cellSearchTerm && (
                    <button 
                      onClick={() => setCellSearchTerm('')}
                      className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={handleLocateUser}
                  disabled={isLocating}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                    userLocation 
                    ? 'bg-green-50 text-green-700 border border-green-100' 
                    : 'bg-agape-red/5 text-agape-red border border-agape-red/10 hover:bg-agape-red/10'
                  }`}
                >
                  <svg className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {isLocating ? 'Obtendo localização...' : userLocation ? 'Ordenado por distância' : 'Encontrar Célula Mais Próxima'}
                </button>
              </div>

              {filteredCells.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideIn">
                  {filteredCells.map((cell) => (
                    <div key={cell.id} className="p-6 bg-white border border-gray-100 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all border-b-4 border-b-agape-red/5 hover:border-b-agape-red relative overflow-hidden">
                      {cell.distance !== undefined && (
                        <div className="absolute top-4 right-4 bg-gray-900 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                          A {cell.distance.toFixed(1)} km de você
                        </div>
                      )}
                      
                      <div>
                        <div className="mb-4">
                          <span className="bg-agape-red/10 text-agape-red text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                            {cell.neighborhood || 'Itaperuna'}
                          </span>
                          <h4 className="text-xl font-serif text-gray-900">{cell.name}</h4>
                        </div>
                        
                        <p className="text-agape-red text-sm font-bold mb-4 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {cell.day} às {cell.time}
                        </p>
                        
                        <div className="space-y-3 mb-6 bg-gray-50/50 p-4 rounded-2xl">
                          <p className="text-gray-600 text-xs flex items-start gap-2">
                            <strong className="text-gray-900 font-bold uppercase tracking-widest text-[9px] mt-0.5">Líder:</strong> 
                            <span>{cell.leader}</span>
                          </p>
                          <p className="text-gray-600 text-xs flex items-start gap-2">
                            <strong className="text-gray-900 font-bold uppercase tracking-widest text-[9px] mt-0.5">Local:</strong> 
                            <span className="leading-relaxed">{cell.location}</span>
                          </p>
                        </div>
                      </div>
                      
                      <a 
                        href={formatWhatsappUrl(cell.contact, `Olá, gostaria de saber mais informações sobre a ${cell.name}!`)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#128C7E] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Falar com Líder
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhuma célula encontrada</h3>
                  <p className="text-gray-500 text-sm">Tente buscar por outro bairro ou termo.</p>
                  <button onClick={() => setCellSearchTerm('')} className="mt-4 text-agape-red font-bold text-xs uppercase tracking-widest hover:underline">Ver todas as células</button>
                </div>
              )}
            </div>
          )}

          {activeSection === 'teaching' && (
            <div className="animate-fadeIn">
              <SectionTitle title="Escola Bíblica" subtitle="Crescendo na graça e no conhecimento da Palavra." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {COURSES_DATA.map((course) => (
                  <div key={course.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow">
                    <img 
                      src={course.image} 
                      className="w-full sm:w-48 h-auto object-contain cursor-zoom-in hover:opacity-90 transition-opacity" 
                      alt={course.title} 
                      onClick={() => setZoomedImage(course.image)}
                    />
                    <div className="p-6 flex flex-col justify-center">
                      <h4 className="font-bold text-lg mb-1">{course.title}</h4>
                      <p className="text-xs text-agape-red font-bold mb-3 uppercase tracking-widest">{course.duration}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{course.description}</p>
                      <button 
                        onClick={() => setZoomedImage(course.image)}
                        className="mt-4 text-agape-red text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                        Ampliar Apostila
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'booking' && (
            <div className="animate-fadeIn max-w-2xl mx-auto">
              <SectionTitle title="Agendamento" subtitle="Preencha os dados abaixo para solicitar um atendimento pastoral." />
              {bookingSuccess ? (
                <div className="text-center p-12 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm animate-slideIn">
                  <div className="text-green-500 mb-4 flex justify-center">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Solicitação Enviada!</h3>
                  <p className="text-gray-500 text-sm">Em breve nossa secretaria entrará em contato com você via WhatsApp para confirmar o horário.</p>
                  <button onClick={() => setBookingSuccess(false)} className="mt-6 text-agape-red font-bold text-xs uppercase hover:underline">Fazer nova solicitação</button>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking} className="space-y-6 bg-gray-50 p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Seu Nome</label>
                      <input type="text" name="nome" value={bookingData.nome} onChange={handleBookingChange} placeholder="Nome Completo" className="w-full bg-white text-gray-900 border border-gray-200 p-4 rounded-xl text-sm focus:ring-2 focus:ring-agape-red outline-none shadow-sm transition-all" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">WhatsApp</label>
                      <input type="tel" name="whatsapp" value={bookingData.whatsapp} onChange={handleBookingChange} placeholder="(22) 99999-9999" className="w-full bg-white text-gray-900 border border-gray-200 p-4 rounded-xl text-sm focus:ring-2 focus:ring-agape-red outline-none shadow-sm transition-all" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pastor(a) Desejado</label>
                    <select name="pastor" value={bookingData.pastor} onChange={handleBookingChange} className="w-full bg-white text-gray-900 border border-gray-200 p-4 rounded-xl text-sm focus:ring-2 focus:ring-agape-red outline-none shadow-sm transition-all">
                      {PASTORS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Data Pretendida</label>
                      <input type="date" name="data" value={bookingData.data} onChange={handleBookingChange} className="w-full bg-white text-gray-900 border border-gray-200 p-4 rounded-xl text-sm focus:ring-2 focus:ring-agape-red outline-none shadow-sm transition-all" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Período</label>
                      <select name="periodo" value={bookingData.periodo} onChange={handleBookingChange} className="w-full bg-white text-gray-900 border border-gray-200 p-4 rounded-xl text-sm focus:ring-2 focus:ring-agape-red outline-none shadow-sm transition-all">
                        <option>Manhã (09:00 - 12:00)</option>
                        <option>Tarde (14:00 - 18:00)</option>
                        <option>Noite (19:00 - 21:00)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Motivo / Observação</label>
                    <textarea name="motivo" value={bookingData.motivo} onChange={handleBookingChange} placeholder="Breve descrição do assunto..." className="w-full bg-white text-gray-900 border border-gray-200 p-4 rounded-xl text-sm h-28 resize-none focus:ring-2 focus:ring-agape-red outline-none shadow-sm transition-all" />
                  </div>

                  <button type="submit" disabled={isSendingBooking} className="w-full bg-agape-red text-white py-5 rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-900/10 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50">
                    {isSendingBooking ? 'Processando Solicitação...' : 'Confirmar Agendamento'}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeSection === 'donations' && (
            <div className="animate-fadeIn max-w-xl mx-auto text-center">
              <SectionTitle title="Dízimos e Ofertas" subtitle="Sua contribuição sustenta a obra de Deus." />
              <div className="bg-gray-50 p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm mb-10 italic">"Cada um dê conforme determinou em seu coração..." - 2 Co 9:7</p>
                
                {/* Categorias de Doação - Modificado para Selectbox */}
                <div className="mb-10 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block ml-1">Finalidade da Doação</label>
                  <select
                    value={donationCategory}
                    onChange={(e) => { setDonationCategory(e.target.value); setDonationStep('form'); }}
                    className="w-full bg-white text-gray-900 border border-gray-200 p-4 rounded-xl text-sm focus:ring-2 focus:ring-agape-red outline-none shadow-sm transition-all"
                  >
                    {donationCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => { setDonationAmount(amount); setDonationStep('form'); }}
                      className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                        donationAmount === amount 
                        ? 'bg-agape-red text-white border-agape-red shadow-md' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-agape-red/50'
                      }`}
                    >
                      R$ {amount}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 mb-8 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ou digite outro valor</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input 
                      type="number" 
                      value={donationAmount} 
                      onChange={(e) => { setDonationAmount(e.target.value); setDonationStep('form'); }} 
                      placeholder="0,00" 
                      className="w-full p-5 pl-12 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-agape-red outline-none text-2xl font-bold bg-white shadow-sm transition-all" 
                    />
                  </div>
                </div>

                <button 
                  onClick={() => donationAmount && setDonationStep('payment')} 
                  disabled={!donationAmount}
                  className="w-full bg-agape-red text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-900/10 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Gerar Código PIX
                </button>
                
                {donationStep === 'payment' && (
                  <div className="mt-10 p-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl animate-slideIn">
                    <div className="w-12 h-12 bg-red-50 text-agape-red rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Resumo da Doação</p>
                      <p className="text-sm font-medium text-gray-900">{donationCategory} - R$ {donationAmount}</p>
                    </div>

                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">PIX Copia e Cola</p>
                    
                    <div className="bg-gray-50 p-4 rounded-xl text-[10px] break-all text-gray-500 font-mono border border-gray-100 mb-6 text-left max-h-24 overflow-y-auto no-scrollbar">
                      00020126360014BR.GOV.BCB.PIX0114033534040001575204000053039865802BR5925COMUNIDADE AGAPE DE LOUVO6009SAO.PAULO62070503***6304994C
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={handleCopyPixCode} 
                        className="w-full bg-agape-red text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Copiar Código PIX
                      </button>
                      <div className="py-4 border-t border-gray-100">
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">DADOS DA CONTA</p>
                        <p className="text-[11px] font-bold text-gray-700">Comunidade Ágape de Louvo</p>
                        <p className="text-[10px] text-gray-500 italic">03.353.404/0001-57</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 text-center">
        <AgapeLogo className="h-8 w-auto mx-auto mb-4" />
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Igreja Internacional Ágape</p>
        <p className="text-gray-300 text-[8px] tracking-[0.2em] uppercase">&copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
        .cursor-zoom-in { cursor: zoom-in; }
        .cursor-zoom-out { cursor: zoom-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

export default App;
