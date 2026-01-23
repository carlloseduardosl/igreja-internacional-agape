
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { 
  CHURCH_HISTORY, 
  SCHEDULE_DATA, 
  CELLS_DATA, 
  COURSES_DATA, 
  MINISTRIES_DATA,
  SPECIAL_EVENTS_DATA,
  PASTORS,
  AgapeLogo
} from './constants';
import { getDailyWord, getPastoralAssistantResponse } from './services/geminiService';
import { SpecialEvent } from './types';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState<SpecialEvent | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [dailyWord, setDailyWord] = useState('Carregando palavra do dia...');
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Donation State
  const [donationStep, setDonationStep] = useState<'form' | 'payment' | 'success'>('form');
  const [donationAmount, setDonationAmount] = useState<string>('');
  const presetAmounts = ['30', '50', '100', '200'];

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
    fetchDailyWord();
  }, []);

  const fetchDailyWord = async () => {
    const word = await getDailyWord();
    setDailyWord(word);
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsLoadingAi(true);
    const response = await getPastoralAssistantResponse(question);
    setAiResponse(response);
    setIsLoadingAi(false);
  };

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

  const handleCopyPix = () => {
    const pixKey = "03353404000157";
    navigator.clipboard.writeText(pixKey);
    alert('Chave PIX copiada!');
  };

  const nextEvent = SPECIAL_EVENTS_DATA[0];

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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar onNavigate={(s) => { setActiveSection(s); setBookingSuccess(false); setDonationStep('form'); window.scrollTo(0, 0); }} activeSection={activeSection} />

      <main className="flex-grow pt-14">
        <EventDetailOverlay />
        <ImageZoomOverlay />

        {activeSection === 'home' && (
          <section className="animate-fadeIn">
            {/* Hero */}
            <div className="relative h-[65vh] bg-black text-white flex items-center justify-center overflow-hidden">
              <img src="https://iili.io/f4TNO2s.jpg" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Igreja Ágape" />
              <div className="relative z-10 text-center px-6">
                <h1 className="text-4xl md:text-6xl font-serif mb-3">Bem-vindo à Ágape</h1>
                <p className="text-lg md:text-xl font-light italic text-gray-200">"Onde o Amor de Deus Transforma Vidas"</p>
              </div>
            </div>

            {/* Palavra do Dia */}
            <div className="py-12 px-6 bg-gray-50 border-b border-gray-100">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-agape-red font-bold uppercase tracking-widest text-[10px] mb-4">Palavra Profética</h3>
                <p className="text-lg md:text-xl text-gray-800 italic leading-relaxed font-serif">"{dailyWord}"</p>
              </div>
            </div>

            {/* DESTAQUE: Próximo Evento */}
            {nextEvent && (
              <div className="py-16 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                  <SectionTitle title="Fique por Dentro" subtitle="Não perca nosso próximo encontro especial." />
                  <div className="relative group overflow-hidden rounded-3xl shadow-xl bg-gray-900 text-white max-w-4xl mx-auto">
                    <img src={nextEvent.image} alt={nextEvent.title} className="w-full h-[400px] object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-agape-red text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Próximo Evento</span>
                        <span className="text-gray-300 text-xs font-medium">{nextEvent.date}</span>
                      </div>
                      <h3 className="text-3xl md:text-5xl font-serif mb-4 leading-tight">{nextEvent.title}</h3>
                      <p className="text-gray-300 text-sm md:text-base max-w-2xl mb-8 line-clamp-2 md:line-clamp-none">{nextEvent.description}</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={() => setSelectedEvent(nextEvent)}
                          className="bg-white text-black px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-agape-red hover:text-white transition-all shadow-lg"
                        >
                          Ver Detalhes
                        </button>
                        <button 
                          onClick={() => setActiveSection('events')}
                          className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
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
            <div className="py-16 px-6 bg-gray-50">
              <div className="max-w-5xl mx-auto">
                <SectionTitle title="Onde Estamos" subtitle="Rua Mozart Bastos Soares, 1390 - Cehab, Itaperuna-RJ" />
                <div className="h-[400px] w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg border border-gray-100 mt-4">
                  <iframe 
                    title="Mapa" 
                    src="https://www.google.com/maps?q=Rua+Mozart+Bastos+Soares+1390+Cehab+Itaperuna+RJ&output=embed" 
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* IA */}
            <div className="py-16 px-6 bg-gray-500 text-white">
              <div className="max-w-3xl mx-auto">
                <SectionTitle title="Dúvidas Espirituais?" subtitle="Receba orientações bíblicas e palavras de conforto através do nosso Assistente Virtual baseado nos princípios da Palavra de Deus." light />
                <form onSubmit={handleAskAi} className="space-y-4">
                  <textarea 
                    value={question} onChange={(e) => setQuestion(e.target.value)} 
                    placeholder="Escreva sua dúvida aqui..." 
                    className="w-full bg-white text-gray-900 border-none rounded-lg p-5 focus:ring-2 focus:ring-agape-red outline-none h-32 text-base transition-all shadow-inner" 
                  />
                  <button type="submit" disabled={isLoadingAi} className="w-full bg-agape-red hover:bg-red-700 py-4 rounded-lg font-bold text-sm uppercase tracking-widest transition-all shadow-lg">
                    {isLoadingAi ? 'Buscando sabedoria...' : 'Perguntar ao Assistente'}
                  </button>
                </form>
                {aiResponse && (
                  <div className="mt-8 p-6 bg-white text-gray-900 rounded-lg border-l-4 border-agape-red shadow-xl animate-slideIn">
                    <p className="text-sm md:text-base leading-relaxed">{aiResponse}</p>
                  </div>
                )}
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
                  <div key={event.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <p className="text-agape-red text-sm font-bold mb-4">{event.date}</p>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                      <button onClick={() => setSelectedEvent(event)} className="text-agape-red font-bold text-xs uppercase tracking-widest hover:underline">Mais Informações &rarr;</button>
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
                  <div key={m.id} className="p-8 bg-gray-50 border border-gray-100 rounded-xl text-center hover:bg-white hover:shadow-lg transition-all">
                    <div className="w-10 h-[2px] bg-agape-red mx-auto mb-4"></div>
                    <h3 className="text-xl font-serif mb-2">{m.name}</h3>
                    <p className="text-gray-500 text-sm">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'cells' && (
            <div className="animate-fadeIn">
              <SectionTitle title="Nossas Células" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CELLS_DATA.map((cell) => (
                  <div key={cell.id} className="p-6 bg-gray-50 border border-gray-100 rounded-xl">
                    <h4 className="text-xl font-bold mb-1">{cell.name}</h4>
                    <p className="text-agape-red text-sm font-bold mb-3">{cell.day} às {cell.time}</p>
                    <p className="text-gray-600 text-sm"><strong>Líder:</strong> {cell.leader}</p>
                    <p className="text-gray-600 text-sm"><strong>Local:</strong> {cell.location}</p>
                  </div>
                ))}
              </div>
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Chave PIX CNPJ</p>
                    <p className="text-lg font-bold text-gray-800 mb-6">03.353.404/0001-57</p>
                    <button 
                      onClick={handleCopyPix} 
                      className="bg-agape-red/5 text-agape-red px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-agape-red hover:text-white transition-all"
                    >
                      Copiar Chave
                    </button>
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
      `}} />
    </div>
  );
};

export default App;
