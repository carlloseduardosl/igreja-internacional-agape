
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
      <h2 className="text-4xl font-serif text-gray-900 mb-4">{title}</h2>
      {subtitle && <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
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
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-white text-3xl font-serif">{selectedEvent.title}</h3>
            </div>
          </div>
          
          <div className="p-8">
            {isRetiro ? (
              <div className="space-y-6 text-gray-700">
                <div className="flex flex-col sm:flex-row gap-6 border-b border-gray-100 pb-6">
                  <div className="flex-1">
                    <h4 className="font-bold text-agape-red uppercase tracking-widest text-xs mb-2">Data e Local</h4>
                    <p className="font-semibold text-lg">🗓 14 a 18 de fevereiro de 2026</p>
                    <p className="text-gray-600">📍 Chalé São Miguel – Valão do Cágado, Itaperuna</p>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-agape-red uppercase tracking-widest text-xs mb-2">Inscrições</h4>
                    <p className="text-sm font-semibold">Até 31 de janeiro de 2026</p>
                    <p className="text-xs text-gray-500">R$ 360,00 (3x no cartão)</p>
                    <p className="text-xs text-gray-500">R$ 320,00 (dinheiro ou pix)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-agape-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      O que levar
                    </h4>
                    <ul className="text-sm space-y-1 list-disc list-inside text-gray-600">
                      <li>Bíblia e material para anotações</li>
                      <li>Roupas confortáveis e de uso pessoal</li>
                      <li>Roupas de cama, toalha e higiene</li>
                      <li>Garrafa de água</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-agape-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Horários
                    </h4>
                    <p className="text-sm text-gray-600"><strong>Saída:</strong> 14/02 a partir das 14h</p>
                    <p className="text-sm text-gray-600"><strong>Retorno:</strong> 18/02 após encerramento</p>
                  </div>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <h4 className="font-bold text-agape-red mb-3">⚠️ Orientações importantes</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                    <li>Chegar no horário combinado</li>
                    <li>Respeitar a programação e líderes</li>
                    <li>Proibido bebidas alcoólicas/itens inadequados</li>
                    <li>Manter espírito de comunhão e oração</li>
                  </ul>
                </div>

                <div className="text-center space-y-4 py-4">
                  <p className="font-serif italic text-agape-red">
                    "Prepare seu coração para dias de comunhão, crescimento espiritual e renovo em Deus!"
                  </p>
                  <p className="text-sm font-semibold">
                    Para mais informações clica no link: <a href="https://wa.me/5522998484977?text=Olá,%20gostaria%20de%20mais%20informações%20sobre%20o%20retiro." target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline decoration-green-500/30 underline-offset-4 transition-colors">WhatsApp Ágape</a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">{selectedEvent.description}</p>
                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                   <p className="text-sm"><strong>Data:</strong> {selectedEvent.date}</p>
                   <p className="text-sm"><strong>Horário:</strong> {selectedEvent.time}</p>
                   <p className="text-sm"><strong>Local:</strong> {selectedEvent.location}</p>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setSelectedEvent(null)}
              className="mt-8 w-full bg-agape-red text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
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
      <Navbar onNavigate={(s) => { setActiveSection(s); resetDonation(); setBookingSuccess(false); }} activeSection={activeSection} />

      <main className="flex-grow pt-20">
        <EventDetailOverlay />

        {/* HOME SECTION */}
        {activeSection === 'home' && (
          <section className="animate-fadeIn">
            <div className="relative h-[80vh] bg-black text-white flex items-center justify-center overflow-hidden">
              <img 
                src="https://iili.io/f4TNO2s.jpg" 
                className="absolute inset-0 w-full h-full object-cover opacity-60" 
                alt="Worship"
              />
              <div className="relative z-10 text-center px-4">
                <h1 className="text-5xl md:text-7xl font-serif mb-6">Bem-vindo à Ágape</h1>
                <p className="text-xl md:text-2xl mb-8 font-light italic">"Onde o Amor de Deus Transforma Vidas"</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => setActiveSection('schedule')} className="bg-agape-red hover:bg-red-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all shadow-lg">Conheça nossa programação</button>
                  <button onClick={() => setActiveSection('donations')} className="bg-white hover:bg-gray-100 text-agape-red px-8 py-3 rounded-full text-lg font-semibold transition-all shadow-lg">Contribuir Online</button>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 py-12 px-4">
              <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-sm border-l-8 border-agape-red">
                <h3 className="text-agape-red font-bold uppercase tracking-widest text-sm mb-2">Palavra do Dia</h3>
                <p className="text-lg text-gray-800 italic leading-relaxed">{dailyWord}</p>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center">
                <div className="w-16 h-16 bg-red-50 text-agape-red rounded-full flex items-center justify-center mx-auto mb-6">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Encontre uma Célula</h3>
                <p className="text-gray-600 mb-6">A vida acontece em comunidade. Encontre um grupo perto de você.</p>
                <button onClick={() => setActiveSection('cells')} className="text-agape-red font-semibold hover:underline">Ver locais &rarr;</button>
              </div>
              <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center">
                <div className="w-16 h-16 bg-red-50 text-agape-red rounded-full flex items-center justify-center mx-auto mb-6">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Ensino Ágape</h3>
                <p className="text-gray-600 mb-6">Cresça no conhecimento da Palavra através da nossa escola bíblica.</p>
                <button onClick={() => setActiveSection('teaching')} className="text-agape-red font-semibold hover:underline">Ver cursos &rarr;</button>
              </div>
              <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center">
                <div className="w-16 h-16 bg-red-50 text-agape-red rounded-full flex items-center justify-center mx-auto mb-6">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Redes da Igreja</h3>
                <p className="text-gray-600 mb-6">Descubra nossos ministérios específicos para cada fase da vida.</p>
                <button onClick={() => setActiveSection('ministries')} className="text-agape-red font-semibold hover:underline">Ver ministérios &rarr;</button>
              </div>
            </div>

            {/* LOCATION SECTION */}
            <div className="bg-white py-20 px-4 border-t border-gray-50">
              <div className="max-w-7xl mx-auto">
                <SectionTitle title="Nossa Localização" subtitle="Venha nos visitar! Estamos de portas abertas para receber você e sua família." />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 space-y-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-red-50 text-agape-red rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">Endereço</h4>
                          <p className="text-gray-600 leading-relaxed">Rua Mozart Bastos Soares, 1390<br />Bairro Cehab, Itaperuna-RJ<br />CEP: 28300-000</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-red-50 text-agape-red rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">Contato</h4>
                          <p className="text-gray-600">(22) 99848-4977</p>
                          <p className="text-gray-600">contato@igrejaagape.com.br</p>
                        </div>
                      </div>

                      <a 
                        href="https://www.google.com/maps/dir/-21.1932409,-41.9006983/Igreja+internacional+%C3%81gape,+R.+Mozart+Bastos+Soares,+35+-+Gov.+Roberto+Silveira,+Itaperuna+-+RJ,+28300-000/@-21.1902184,-41.9035673,1511m/data=!3m2!1e3!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0xbc604bc03f0f8d:0x92a191f74c1f921c!2m2!1d-41.8960678!2d-21.1866271?entry=ttu&g_ep=EgoyMDI2MDEyMC4wIKXMDSoASAFQAw%3D%3D" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-agape-red text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 transition-all shadow-md"
                      >
                        Como chegar
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
                <h3 className="text-3xl font-serif text-center mb-8">Dúvidas Espirituais?</h3>
                <p className="text-gray-400 text-center mb-8">Use nossa IA Pastoral para obter orientações bíblicas rápidas.</p>
                <form onSubmit={handleAskAi} className="flex flex-col gap-4">
                  <textarea 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ex: Como posso ter mais paz no meu dia a dia?"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-agape-red h-32 resize-none"
                  />
                  <button type="submit" disabled={isLoadingAi} className="bg-agape-red hover:bg-red-700 py-3 rounded-lg font-bold disabled:opacity-50 transition-all">
                    {isLoadingAi ? 'Buscando orientação...' : 'Perguntar ao Assistente'}
                  </button>
                </form>
                {aiResponse && (
                  <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-agape-red animate-slideIn">
                    <p className="text-gray-200 whitespace-pre-wrap">{aiResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* HISTORY SECTION */}
        {activeSection === 'history' && (
          <section className="max-w-4xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Nossa História" subtitle="O legado de amor que estamos construindo juntos." />
            <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed text-center">
                <p className="whitespace-pre-wrap">{CHURCH_HISTORY}</p>
              </div>
            </div>
          </section>
        )}

        {/* SCHEDULE SECTION */}
        {activeSection === 'schedule' && (
          <section className="max-w-7xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Programação Semanal" subtitle="Participe de nossos encontros e fortaleça sua fé." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SCHEDULE_DATA.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-agape-red transition-all group">
                  <div className="text-agape-red font-bold text-sm mb-2 uppercase tracking-tighter">{item.day} • {item.time}</div>
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
            <SectionTitle title="Eventos Especiais" subtitle="Momentos únicos de celebração, retiro e crescimento." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SPECIAL_EVENTS_DATA.map((event) => (
                <div 
                  key={event.id} 
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl cursor-default group flex flex-col"
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
            <SectionTitle title="Nossos Ministérios" subtitle="Descubra onde você pode se conectar e servir." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MINISTRIES_DATA.map((ministry) => (
                <div key={ministry.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                  <div className="h-48 overflow-hidden relative">
                    <img src={ministry.image} alt={ministry.name} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 opacity-40 ${ministry.color}`}></div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{ministry.name}</h3>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase font-bold tracking-widest">{ministry.tagline}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{ministry.description}</p>
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
            <SectionTitle title="Nossas Células" subtitle="Grupos pequenos para comunhão e estudo nos lares." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CELLS_DATA.map((cell) => (
                <div key={cell.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-agape-red transition-all">
                  <h4 className="text-lg font-bold text-agape-red mb-1">{cell.name}</h4>
                  <p className="text-sm text-gray-500 mb-4">{cell.location}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {cell.leader}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {cell.day} às {cell.time}
                    </div>
                  </div>
                  <a href={`https://wa.me/${cell.contact.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="block text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-colors text-sm">Entrar em contato</a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TEACHING SECTION */}
        {activeSection === 'teaching' && (
          <section className="max-w-7xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Escola de Ensino Ágape" subtitle="Equipando os santos para o ministério." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {COURSES_DATA.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-48 md:h-auto">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 md:w-2/3 flex flex-col">
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-gray-500 text-xs mb-4 uppercase tracking-widest">{course.instructor} • {course.duration}</p>
                    <p className="text-gray-600 text-sm mb-6 flex-grow">{course.description}</p>
                    <button className="bg-agape-red text-white font-bold py-2 px-6 rounded-lg self-start hover:bg-red-700 transition-colors">Inscrições Abertas</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DONATIONS SECTION */}
        {activeSection === 'donations' && (
          <section className="max-w-4xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Dízimos e Ofertas" subtitle="Contribua para a expansão do Reino de Deus." />
            {donationStep === 'form' && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {['20', '50', '100', '200'].map(amount => (
                    <button key={amount} onClick={() => setDonationAmount(amount)} className={`py-4 rounded-xl border-2 font-bold transition-all ${donationAmount === amount ? 'border-agape-red text-agape-red bg-red-50' : 'border-gray-100 text-gray-600'}`}>R$ {amount}</button>
                  ))}
                </div>
                <div className="space-y-6">
                  <input type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} placeholder="Outro Valor (R$)" className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 text-xl focus:ring-2 focus:ring-agape-red outline-none" />
                  <select value={donationType} onChange={(e) => setDonationType(e.target.value)} className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-agape-red">
                    <option>Dízimo</option>
                    <option>Oferta Geral</option>
                    <option>Oferta Missionária</option>
                    <option>Construção</option>
                  </select>
                  <button onClick={() => setDonationStep('payment')} disabled={!donationAmount} className="w-full bg-agape-red text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg">Continuar para Pagamento</button>
                </div>
              </div>
            )}
            
            {donationStep === 'payment' && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-slideIn">
                <button onClick={() => setDonationStep('form')} className="text-gray-500 hover:text-agape-red text-sm font-bold mb-6 flex items-center">&larr; Voltar</button>
                <h3 className="text-2xl font-bold mb-6 text-center text-gray-700">Pagamento via PIX</h3>
                
                <div className="bg-gray-50 p-8 rounded-2xl text-center mb-8 border border-gray-200">
                  <div className="text-left space-y-4 max-w-md mx-auto">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Dados Bancários / Chave PIX</p>
                      <div>
                        <p className="text-sm font-bold text-gray-500">Favorecido:</p>
                        <p className="text-base text-gray-900">Comunidade Ágape de Louvor e Adoração</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-500">CNPJ (Chave PIX):</p>
                        <p className="text-base text-gray-900">03.353.404/0001-57</p>
                      </div>
                      <div className="pt-2 border-t border-gray-50">
                        <p className="text-sm font-bold text-gray-500">Banco:</p>
                        <p className="text-base text-gray-900">Bradesco (237)</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-bold text-gray-500">Agência:</p>
                          <p className="text-base text-gray-900">0587</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-500">Conta Corrente:</p>
                          <p className="text-base text-gray-900">48497-0</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleCopyPix} 
                    className="mt-8 w-full bg-white border-2 border-agape-red text-agape-red font-bold py-3 px-6 rounded-xl hover:bg-agape-red hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copiar Chave PIX (CNPJ)
                  </button>
                </div>

                <button onClick={() => setDonationStep('success')} className="w-full bg-agape-red text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors shadow-lg">Confirmar Pagamento</button>
              </div>
            )}
            {donationStep === 'success' && (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center animate-slideIn">
                <h3 className="text-3xl font-bold mb-4 text-gray-900">Doação Confirmada!</h3>
                <button onClick={() => { setActiveSection('home'); resetDonation(); }} className="bg-agape-red text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors">Voltar para o Início</button>
              </div>
            )}
          </section>
        )}

        {/* BOOKING SECTION */}
        {activeSection === 'booking' && (
          <section className="max-w-4xl mx-auto px-4 py-20 animate-fadeIn">
            <SectionTitle title="Atendimento Pastoral" subtitle="Reserve um momento para aconselhamento e oração com nossos pastores." />
            
            {bookingSuccess ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center animate-slideIn">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-3xl font-bold mb-4">Solicitação Enviada!</h3>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto">Sua solicitação foi encaminhada. Em breve entraremos em contato via WhatsApp para confirmar o seu horário.</p>
                <button onClick={() => { setBookingSuccess(false); setActiveSection('home'); }} className="bg-agape-red text-white px-8 py-3 rounded-full font-bold hover:bg-red-700">Voltar para o Início</button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <form onSubmit={handleSubmitBooking} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
                      <input 
                        type="text" 
                        name="nome" 
                        value={bookingData.nome} 
                        onChange={handleBookingChange} 
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-agape-red outline-none" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp</label>
                      <input 
                        type="tel" 
                        name="whatsapp" 
                        value={bookingData.whatsapp} 
                        onChange={handleBookingChange} 
                        placeholder="(00) 00000-0000" 
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-agape-red outline-none" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Selecione o Pastor</label>
                    <select 
                      name="pastor" 
                      value={bookingData.pastor} 
                      onChange={handleBookingChange} 
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-agape-red"
                    >
                      {PASTORS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Data Sugerida</label>
                      <input 
                        type="date" 
                        name="data" 
                        value={bookingData.data} 
                        onChange={handleBookingChange} 
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-agape-red outline-none" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Melhor Período</label>
                      <select 
                        name="periodo" 
                        value={bookingData.periodo} 
                        onChange={handleBookingChange} 
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-agape-red"
                      >
                        <option>Manhã (09:00 - 12:00)</option>
                        <option>Tarde (14:00 - 18:00)</option>
                        <option>Noite (19:00 - 21:00)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Breve Motivo</label>
                    <textarea 
                      name="motivo" 
                      value={bookingData.motivo} 
                      onChange={handleBookingChange} 
                      placeholder="Ex: Oração pela família, orientação espiritual..." 
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-agape-red outline-none"
                    ></textarea>
                  </div>
                  <button type="submit" disabled={isSendingBooking} className="w-full bg-agape-red text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg flex items-center justify-center">
                    {isSendingBooking ? 'Enviando Solicitação...' : 'Solicitar Agendamento'}
                  </button>
                </form>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-12 text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Igreja Internacional Ágape</h3>
        <p className="text-gray-500 text-xs italic mb-4">"Onde o Amor de Deus Transforma Vidas"</p>
        <p className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} Igreja Internacional Ágape. Todos os direitos reservados.</p>
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
