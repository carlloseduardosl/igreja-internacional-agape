
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
  const [dailyWord, setDailyWord] = useState('Carregando palavra do dia...');
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Donation State
  const [donationStep, setDonationStep] = useState<'form' | 'payment' | 'success'>('form');
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationType, setDonationType] = useState<string>('Dízimo');

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
          Mensagem: `Olá, gostaria de agendar um atendimento com o ${bookingData.pastor}.
          
Data sugerida: ${bookingData.data}
Período: ${bookingData.periodo}
Motivo: ${bookingData.motivo || 'Não informado'}
          
Contato via WhatsApp: ${bookingData.whatsapp}`
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
        throw new Error('Falha no servidor de e-mail');
      }
    } catch (error) {
      alert('Houve um erro ao processar sua solicitação. Por favor, tente novamente ou entre em contato diretamente via WhatsApp.');
    } finally {
      setIsLoadingBooking(false);
    }
  };

  const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4 px-4">{title}</h2>
      {subtitle && <p className="text-gray-600 max-w-2xl mx-auto px-6 text-sm md:text-base">{subtitle}</p>}
      <div className="w-20 h-1 bg-agape-red mx-auto mt-6"></div>
    </div>
  );

  const resetDonation = () => {
    setDonationStep('form');
    setDonationAmount('');
  };

  const handleCopyPix = () => {
    const pixKey = "03353404000157";
    navigator.clipboard.writeText(pixKey);
    alert('Chave PIX (CNPJ) copiada com sucesso!');
  };

  const EventDetailOverlay = () => {
    if (!selectedEvent) return null;
    
    const isRetiro = selectedEvent.id === 'se0';

    return (
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideIn">
          <div className="relative h-48 sm:h-64">
            <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors backdrop-blur-md"
              aria-label="Fechar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-white text-2xl sm:text-3xl font-serif">{selectedEvent.title}</h3>
            </div>
          </div>
          
          <div className="p-6 sm:p-8">
            {isRetiro ? (
              <div className="space-y-6 text-gray-700">
                <div className="flex flex-col sm:flex-row gap-6 border-b border-gray-100 pb-6">
                  <div className="flex-1">
                    <h4 className="font-bold text-agape-red uppercase tracking-widest text-[10px] mb-2">Data e Local</h4>
                    <p className="font-semibold text-base">🗓 14 a 18 de fevereiro de 2026</p>
                    <p className="text-gray-600 text-sm">📍 Chalé São Miguel – Valão do Cágado, Itaperuna</p>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-agape-red uppercase tracking-widest text-[10px] mb-2">Inscrições</h4>
                    <p className="text-sm font-semibold">Até 31 de janeiro de 2026</p>
                    <p className="text-xs text-gray-500">R$ 360,00 (3x no cartão)</p>
                    <p className="text-xs text-gray-500">R$ 320,00 (dinheiro ou pix)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                      <svg className="w-5 h-5 text-agape-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      O que levar
                    </h4>
                    <ul className="text-sm space-y-1 list-disc list-inside text-gray-600">
                      <li>Bíblia e material para anotações</li>
                      <li>Roupas confortáveis</li>
                      <li>Roupas de cama, toalha e higiene</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                      <svg className="w-5 h-5 text-agape-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Horários
                    </h4>
                    <p className="text-sm text-gray-600"><strong>Saída:</strong> 14/02 a partir das 14h</p>
                    <p className="text-sm text-gray-600"><strong>Retorno:</strong> 18/02 após encerramento</p>
                  </div>
                </div>

                <div className="bg-red-50 p-4 sm:p-6 rounded-2xl border border-red-100">
                  <h4 className="font-bold text-agape-red mb-3 text-sm">⚠️ Orientações importantes</h4>
                  <ul className="text-xs sm:text-sm space-y-1 list-disc list-inside text-gray-700">
                    <li>Respeitar a programação e líderes</li>
                    <li>Proibido itens inadequados ao ambiente</li>
                    <li>Manter espírito de comunhão</li>
                  </ul>
                </div>

                <div className="text-center space-y-4 py-2">
                  <p className="font-serif italic text-agape-red text-sm">
                    "Prepare seu coração para dias de renovo!"
                  </p>
                  <p className="text-sm font-semibold">
                    Dúvidas? <a href="https://wa.me/5522998484977?text=Olá,%20gostaria%20de%20mais%20informações%20sobre%20o%20retiro." target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline underline-offset-4 transition-colors">WhatsApp Ágape</a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{selectedEvent.description}</p>
                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                   <p className="text-sm"><strong>Data:</strong> {selectedEvent.date}</p>
                   <p className="text-sm"><strong>Horário:</strong> {selectedEvent.time}</p>
                   <p className="text-sm"><strong>Local:</strong> {selectedEvent.location}</p>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setSelectedEvent(null)}
              className="mt-8 w-full bg-agape-red text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg active:scale-[0.98]"
            >
              Fechar Informativo
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onNavigate={(s) => { setActiveSection(s); resetDonation(); setBookingSuccess(false); window.scrollTo(0, 0); }} activeSection={activeSection} />

      <main className="flex-grow pt-20">
        <EventDetailOverlay />

        {/* HOME SECTION */}
        {activeSection === 'home' && (
          <section className="animate-fadeIn">
            <div className="relative h-[80vh] bg-black text-white flex items-center justify-center overflow-hidden">
              <img 
                src="https://iili.io/f4TNO2s.jpg" 
                className="absolute inset-0 w-full h-full object-cover opacity-60" 
                alt="Adoração na Igreja Ágape"
              />
              <div className="relative z-10 text-center px-4">
                <h1 className="text-4xl md:text-7xl font-serif mb-6 leading-tight">Bem-vindo à Ágape</h1>
                <p className="text-lg md:text-2xl mb-10 font-light italic">"Onde o Amor de Deus Transforma Vidas"</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => setActiveSection('schedule')} className="bg-agape-red hover:bg-red-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg active:scale-95">Ver Programação</button>
                  <button onClick={() => setActiveSection('donations')} className="bg-white hover:bg-gray-100 text-agape-red px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg active:scale-95">Contribuir Online</button>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 py-12 px-4">
              <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-sm border-l-8 border-agape-red">
                <h3 className="text-agape-red font-bold uppercase tracking-widest text-[10px] mb-2">Palavra do Dia</h3>
                <p className="text-lg text-gray-800 italic leading-relaxed">{dailyWord}</p>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 text-center group">
                <div className="w-16 h-16 bg-red-50 text-agape-red rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Células</h3>
                <p className="text-gray-600 mb-6 text-sm">A vida acontece em comunidade. Encontre um grupo perto de você.</p>
                <button onClick={() => setActiveSection('cells')} className="text-agape-red font-bold hover:underline">Ver locais &rarr;</button>
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 text-center group">
                <div className="w-16 h-16 bg-red-50 text-agape-red rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Ensino Bíblico</h3>
                <p className="text-gray-600 mb-6 text-sm">Cresça no conhecimento da Palavra através da nossa escola.</p>
                <button onClick={() => setActiveSection('teaching')} className="text-agape-red font-bold hover:underline">Ver cursos &rarr;</button>
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 text-center group">
                <div className="w-16 h-16 bg-red-50 text-agape-red rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Ministérios</h3>
                <p className="text-gray-600 mb-6 text-sm">Descubra onde você pode se conectar e servir à Igreja.</p>
                <button onClick={() => setActiveSection('ministries')} className="text-agape-red font-bold hover:underline">Ver todos &rarr;</button>
              </div>
            </div>

            {/* LOCATION SECTION */}
            <div className="bg-white py-20 px-4 border-t border-gray-50">
              <div className="max-w-7xl mx-auto">
                <SectionTitle title="Onde Estamos" subtitle="Rua Mozart Bastos Soares, 1390 - Cehab, Itaperuna-RJ" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 space-y-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-red-50 text-agape-red rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">Endereço Completo</h4>
                          <p className="text-gray-600 leading-relaxed text-sm">Rua Mozart Bastos Soares, 1390<br />Bairro Cehab, Itaperuna-RJ<br />CEP: 28300-000</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-red-50 text-agape-red rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">Contato</h4>
                          <p className="text-gray-600 text-sm">(22) 99848-4977</p>
                        </div>
                      </div>

                      <a 
                        href="https://www.google.com/maps/search/?api=1&query=Igreja+Internacional+Agape+Rua+Mozart+Bastos+Soares+1390+Itaperuna" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-agape-red text-white font-bold py-4 px-8 rounded-xl hover:bg-red-700 transition-all shadow-md w-full sm:w-auto active:scale-95"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.483V8.414a2 2 0 011.118-1.789L9 4l6 3 5.447-2.724A2 2 0 0123 6.065v7.069a2 2 0 01-1.118 1.789L16 18l-7 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4v16m7-13v13" /></svg>
                        Abrir no GPS
                      </a>
                    </div>
                  </div>
                  
                  <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-xl border border-gray-200">
                    <iframe 
                      title="Mapa da Igreja Internacional Ágape"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.753361138865!2d-41.8906969!3d-21.21323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xbb3543d8376ef7%3A0xc3692e1069b2d8c3!2sR.%20Mozart%20Bastos%20Soares%2C%201390%20-%20Cidade%20Nova%2C%20Itaperuna%20-%20RJ%2C%2028300-000!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 text-white py-20 px-4">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-3xl font-serif text-center mb-6">Dúvidas Espirituais?</h3>
                <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">Use nossa IA Pastoral treinada na Palavra para obter orientações bíblicas rápidas.</p>
                <form onSubmit={handleAskAi} className="flex flex-col gap-4">
                  <textarea 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ex: Como posso fortalecer minha fé no trabalho?"
                    className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-agape-red h-32 resize-none transition-all"
                  />
                  <button type="submit" disabled={isLoadingAi} className="bg-agape-red hover:bg-red-700 py-4 rounded-2xl font-bold disabled:opacity-50 transition-all shadow-lg active:scale-95">
                    {isLoadingAi ? 'Buscando orientação...' : 'Perguntar ao Assistente'}
                  </button>
                </form>
                {aiResponse && (
                  <div className="mt-8 p-6 bg-gray-800 rounded-2xl border border-agape-red animate-slideIn">
                    <p className="text-gray-200 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{aiResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* HISTORY SECTION */}
        {activeSection === 'history' && (
          <section className="max-w-4xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Nossa História" subtitle="O legado de amor que estamos construindo juntos através das gerações." />
            <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 border border-gray-100">
              <div className="space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed text-center">
                <p className="whitespace-pre-wrap">{CHURCH_HISTORY}</p>
              </div>
            </div>
          </section>
        )}

        {/* SCHEDULE SECTION */}
        {activeSection === 'schedule' && (
          <section className="max-w-7xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Agenda Semanal" subtitle="Momentos preciosos de oração, estudo e adoração." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SCHEDULE_DATA.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-agape-red hover:shadow-lg transition-all group">
                  <div className="text-agape-red font-bold text-[10px] mb-2 uppercase tracking-widest">{item.day} • {item.time}</div>
                  <h4 className="text-xl font-bold mb-3 group-hover:text-agape-red transition-colors">{item.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EVENTS SECTION */}
        {activeSection === 'events' && (
          <section className="max-w-7xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Eventos Especiais" subtitle="Prepare-se para viver experiências marcantes com Deus." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SPECIAL_EVENTS_DATA.map((event) => (
                <div 
                  key={event.id} 
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl group flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 left-4 bg-agape-red text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {event.category === 'retiro' ? 'Retiro' : event.category === 'conferencia' ? 'Conferência' : 'Campanha'}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-agape-red transition-colors">{event.title}</h3>
                    <div className="flex flex-col space-y-2 text-gray-500 text-xs mb-6">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-agape-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {event.date}
                      </span>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-agape-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {event.location}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-8 line-clamp-2">{event.description}</p>
                    <button 
                      onClick={() => setSelectedEvent(event)} 
                      className="mt-auto w-full bg-agape-red text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-900/10 hover:shadow-red-900/20 active:scale-[0.98]"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MINISTRIES SECTION */}
        {activeSection === 'ministries' && (
          <section className="max-w-7xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Nossas Redes" subtitle="Descubra o ministério que mais combina com seu momento de vida." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MINISTRIES_DATA.map((ministry) => (
                <div key={ministry.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                  <div className="h-48 overflow-hidden relative">
                    <img src={ministry.image} alt={ministry.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                    <div className={`absolute inset-0 opacity-40 ${ministry.color}`}></div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{ministry.name}</h3>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase font-bold tracking-widest">{ministry.tagline}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{ministry.description}</p>
                    <div className="pt-4 border-t border-gray-50 space-y-2">
                      <p className="text-xs text-gray-400">Liderança: <span className="text-gray-700 font-semibold">{ministry.leader}</span></p>
                      <p className="text-xs text-gray-400">Encontros: <span className="text-gray-700 font-semibold">{ministry.meetingInfo}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CELLS SECTION */}
        {activeSection === 'cells' && (
          <section className="max-w-7xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Células Ágape" subtitle="Pequenos grupos onde o amor Ágape é vivido na prática." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CELLS_DATA.map((cell) => (
                <div key={cell.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-agape-red hover:shadow-lg transition-all group">
                  <h4 className="text-lg font-bold text-agape-red mb-1 group-hover:translate-x-1 transition-transform">{cell.name}</h4>
                  <p className="text-[10px] text-gray-400 mb-4 uppercase font-bold tracking-widest">{cell.location}</p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {cell.leader}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {cell.day} às {cell.time}
                    </div>
                  </div>
                  <a href={`https://wa.me/${cell.contact.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="block text-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all text-sm active:scale-95 shadow-md">Conversar com Líder</a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TEACHING SECTION */}
        {activeSection === 'teaching' && (
          <section className="max-w-7xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Ensino Ágape" subtitle="Cursos para capacitação bíblica e ministerial." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {COURSES_DATA.map((course) => (
                <div key={course.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row hover:shadow-lg transition-all">
                  <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                  </div>
                  <div className="p-6 md:w-2/3 flex flex-col">
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-gray-400 text-[10px] mb-4 uppercase tracking-widest font-bold">{course.instructor} • {course.duration}</p>
                    <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">{course.description}</p>
                    <button className="bg-agape-red text-white font-bold py-3 px-8 rounded-xl self-start hover:bg-red-700 transition-colors shadow-md active:scale-95">Inscrições Abertas</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DONATIONS SECTION */}
        {activeSection === 'donations' && (
          <section className="max-w-4xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Dízimos e Ofertas" subtitle="Sua fidelidade contribui para a expansão do Reino e ajuda ao próximo." />
            {donationStep === 'form' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {['20', '50', '100', '200'].map(amount => (
                    <button key={amount} onClick={() => setDonationAmount(amount)} className={`py-4 rounded-2xl border-2 font-bold transition-all ${donationAmount === amount ? 'border-agape-red text-agape-red bg-red-50' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>R$ {amount}</button>
                  ))}
                </div>
                <div className="space-y-6">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} placeholder="Outro Valor" className="w-full bg-white text-gray-900 border border-gray-200 rounded-2xl p-4 pl-12 text-xl focus:ring-2 focus:ring-agape-red outline-none transition-all" />
                  </div>
                  <select value={donationType} onChange={(e) => setDonationType(e.target.value)} className="w-full bg-white text-gray-900 border border-gray-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-agape-red transition-all appearance-none cursor-pointer">
                    <option>Dízimo</option>
                    <option>Oferta Geral</option>
                    <option>Oferta Missionária</option>
                    <option>Construção</option>
                  </select>
                  <button onClick={() => setDonationStep('payment')} disabled={!donationAmount} className="w-full bg-agape-red text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]">Prosseguir</button>
                </div>
              </div>
            )}
            
            {donationStep === 'payment' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-slideIn">
                <button onClick={() => setDonationStep('form')} className="text-gray-400 hover:text-agape-red text-xs font-bold mb-6 flex items-center gap-1 transition-colors uppercase tracking-widest">&larr; Voltar</button>
                <h3 className="text-2xl font-bold mb-8 text-center text-gray-800">Transferência via PIX</h3>
                
                <div className="bg-gray-50 p-6 sm:p-10 rounded-3xl text-center mb-8 border border-gray-100">
                  <div className="text-left space-y-4 max-w-md mx-auto">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Favorecido</p>
                        <p className="text-sm sm:text-base text-gray-800 font-semibold leading-tight">Comunidade Ágape de Louvor e Adoração</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CNPJ (PIX)</p>
                          <p className="text-sm text-gray-800 font-mono">03.353.404/0001-57</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Banco</p>
                          <p className="text-sm text-gray-800">Bradesco (237)</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Agência</p>
                          <p className="text-sm text-gray-800">0587</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Conta Corrente</p>
                          <p className="text-sm text-gray-800">48497-0</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleCopyPix} 
                    className="mt-8 w-full bg-white border-2 border-agape-red text-agape-red font-bold py-4 px-6 rounded-2xl hover:bg-agape-red hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copiar Chave PIX
                  </button>
                </div>

                <button onClick={() => setDonationStep('success')} className="w-full bg-agape-red text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg active:scale-[0.98]">Confirmar Conclusão</button>
              </div>
            )}
            {donationStep === 'success' && (
              <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100 text-center animate-slideIn">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-800">Deus o abençoe!</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">Sua doação é fundamental para continuarmos alcançando mais vidas com o amor Ágape.</p>
                <button onClick={() => { setActiveSection('home'); resetDonation(); }} className="bg-agape-red text-white px-10 py-4 rounded-full font-bold hover:bg-red-700 transition-all shadow-md active:scale-95">Voltar ao Início</button>
              </div>
            )}
          </section>
        )}

        {/* BOOKING SECTION */}
        {activeSection === 'booking' && (
          <section className="max-w-4xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Aconselhamento" subtitle="Reserve um tempo para oração e orientação espiritual com nossos pastores." />
            
            {bookingSuccess ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100 text-center animate-slideIn">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-800">Recebemos seu pedido!</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">Sua solicitação foi encaminhada. Em breve um de nossos auxiliares entrará em contato via WhatsApp para confirmar o melhor horário.</p>
                <button onClick={() => { setBookingSuccess(false); setActiveSection('home'); }} className="bg-agape-red text-white px-10 py-4 rounded-full font-bold hover:bg-red-700 transition-all shadow-md">Voltar ao Início</button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <form onSubmit={handleSubmitBooking} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Nome Completo</label>
                      <input 
                        type="text" 
                        name="nome" 
                        value={bookingData.nome} 
                        onChange={handleBookingChange} 
                        className="w-full bg-white text-gray-900 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-agape-red outline-none transition-all" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">WhatsApp</label>
                      <input 
                        type="tel" 
                        name="whatsapp" 
                        value={bookingData.whatsapp} 
                        onChange={handleBookingChange} 
                        placeholder="(22) 99999-9999" 
                        className="w-full bg-white text-gray-900 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-agape-red outline-none transition-all" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Escolha o Pastor</label>
                    <select 
                      name="pastor" 
                      value={bookingData.pastor} 
                      onChange={handleBookingChange} 
                      className="w-full bg-white text-gray-900 border border-gray-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-agape-red transition-all cursor-pointer"
                    >
                      {PASTORS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Data Sugerida</label>
                      <input 
                        type="date" 
                        name="data" 
                        value={bookingData.data} 
                        onChange={handleBookingChange} 
                        className="w-full bg-white text-gray-900 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-agape-red outline-none transition-all" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Melhor Período</label>
                      <select 
                        name="periodo" 
                        value={bookingData.periodo} 
                        onChange={handleBookingChange} 
                        className="w-full bg-white text-gray-900 border border-gray-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-agape-red transition-all cursor-pointer"
                      >
                        <option>Manhã (09:00 - 12:00)</option>
                        <option>Tarde (14:00 - 18:00)</option>
                        <option>Noite (19:00 - 21:00)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Observação ou Motivo</label>
                    <textarea 
                      name="motivo" 
                      value={bookingData.motivo} 
                      onChange={handleBookingChange} 
                      placeholder="Breve comentário sobre sua solicitação..." 
                      className="w-full bg-white text-gray-900 border border-gray-200 rounded-2xl p-4 h-32 focus:ring-2 focus:ring-agape-red outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                  <button type="submit" disabled={isSendingBooking} className="w-full bg-agape-red text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center">
                    {isSendingBooking ? 'Enviando...' : 'Solicitar Atendimento'}
                  </button>
                </form>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <AgapeLogo className="h-8 w-auto mx-auto mb-4" />
          <h3 className="text-gray-800 font-bold mb-1">Igreja Internacional Ágape</h3>
          <p className="text-gray-400 text-[10px] italic mb-6">"Onde o Amor de Deus Transforma Vidas"</p>
          <div className="flex justify-center gap-6 mb-8 text-gray-400">
             <a href="#" className="hover:text-agape-red transition-colors" aria-label="Facebook"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg></a>
             <a href="#" className="hover:text-agape-red transition-colors" aria-label="Instagram"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
          </div>
          <p className="text-gray-300 text-[10px]">&copy; {new Date().getFullYear()} Igreja Internacional Ágape. Desenvolvido para abençoar vidas.</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slideIn { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};

export default App;
