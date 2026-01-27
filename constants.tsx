
import React from 'react';
import { EventItem, CellGroup, Course, PastoralSlot, Ministry, SpecialEvent } from './types';

// ID oficial do Canal da Igreja Internacional Ágape
export const YOUTUBE_CHANNEL_ID = "UCPmwowaeyCeqJGvhkteKgiA";

/**
 * URL de incorporação ultra-estável para canais.
 */
export const YOUTUBE_LIVE_EMBED_URL = `https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}`;
export const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`;

// Componente de Logo oficial: Imagem da Igreja Internacional Ágape
export const AgapeLogo = ({ className = "h-12 w-auto" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center overflow-hidden`}>
    <img
      src="https://iili.io/f4RBYzP.jpg"
      alt="Logo Igreja Internacional Ágape"
      className="h-full w-auto object-contain"
    />
  </div>
);

export const CHURCH_HISTORY = `
Fundada em 15 de dezembro de 1996 pelos fundadores Bispo Nélis de Lima e Bispa Roseliane de Lima, a nossa igreja nasceu sob o nome de Comunidade de Louvor e Adoração Ágape. Desde a fundação, nossa missão principal tem sido apresentar o amor ágape de Deus a todas as pessoas.

<strong>Nossos Pilares</strong>
Como o próprio nome sugere, nossa base é construída sobre a adoração genuína:

<strong>Louvor e Adoração:</strong> A essência do nosso ministério e nossa forma de gratidão.

<strong>Pregação da Palavra:</strong> O fundamento para uma vinda cristã sólida.

<strong>Ofertas e Serviço:</strong> Expressões práticas do nosso amor e entrega a Deus.

<strong>Liderança em Itaperuna</strong>
Dando continuidade a este legado de fé e amor, a igreja em Itaperuna é atualmente pastoreada pelo Pr. Marco Aurélio de Souza e Pra. Simone Duarte, que seguem com o compromisso de cuidar da comunidade e levar a mensagem de Cristo adiante.

<em>"Nossa missão é e sempre será apresentar o amor Ágape — o amor incondicional de Deus — através de cada vida e de cada ministério."</em>
`;

export const SCHEDULE_DATA: EventItem[] = [
  { id: '1', title: 'Culto de Celebração', day: 'Domingo', time: '19:00', description: 'Nosso encontro principal de celebração e adoração.', type: 'culto' },
  { id: '2', title: 'Culto das Redes', day: 'Quinta-feira', time: '19:30', description: 'Momento de lançar as redes.', type: 'culto' },
  { id: '3', title: 'Rede Ellos', day: 'Sábado', time: '19:30', description: 'Culto de jovens com louvor, adoração e comunhão.', type: 'evento' },
  { id: '4', title: 'Oração', day: 'Segunda à Sexta', time: '06:00 às 07:00', description: 'Momento de entregar tudo nas mãos de Deus.', type: 'reuniao' },
];

export const SPECIAL_EVENTS_DATA: SpecialEvent[] = [
  {
    id: 'se1',
    title: 'Grande Vigília',
    date: '31 de Janeiro de 2026',
    time: '19:00',
    location: 'Sítio Nova Aliança',
    description: 'Uma noite poderosa de clamor, adoração e busca intensa pela presença de Deus.',
    image: 'https://iili.io/f6jtIqX.jpg',
    category: 'campanha'
  },
  {
    id: 'se0',
    title: 'Retiro Ágape 2026',
    date: '14 a 18 de Fevereiro de 2026',
    time: 'Check-in à partir das 14:00',
    location: 'Chalé São Miguel – Valão do Cágado, Itaperuna',
    description: 'Inscrições até 31 de Janeiro!',
    image: 'https://iili.io/f4TWm9p.png',
    category: 'retiro',
    whatsappLink: 'https://wa.me/5522998484977?text=Olá,%20gostaria%20de%20mais%20informações%20sobre%20o%20Retiro%20Ágape%202026.'
  },
  {
    id: 'se2',
    title: 'Culto do Discipulado',
    date: '19 de Março de 2026',
    time: '19:30',
    location: 'Igreja Internacional Ágape',
    description: 'Um momento precioso de ensino e crescimento espiritual focado no chamado para o discipulado.',
    image: 'https://iili.io/fP92VNs.jpg',
    category: 'conferencia'
  },
  {
    id: 'se3',
    title: 'Musical de Páscoa - Celebrando a Redenção',
    date: '05 de Abril de 2026',
    time: '19:00',
    location: 'Igreja Internacional Ágape',
    description: 'Um musical emocionante celebrando a ressurreição de Cristo e o glorioso plano da redenção.',
    image: 'https://iili.io/fPVLNt4.png',
    category: 'musical'
  }
];

export const CELLS_DATA: CellGroup[] = [
  // SEGUNDA-FEIRA
  {
    id: 'c-varre-sai',
    name: 'Célula Varre-Sai',
    leader: 'Pr. Marco Aurélio',
    location: 'Varre-Sai',
    neighborhood: 'Varre-Sai',
    day: 'Segunda-feira',
    time: '19:00',
    contact: '(22) 99913-5656',
    latitude: -20.929510053642076,
    longitude: -41.86944294617659
  },
  {
    id: 'c-aljavas',
    name: 'Célula Aljavas',
    leader: 'Dani Mattos',
    location: 'Rua Amaro Rodrigues da Silva, 190, Cehab',
    neighborhood: 'Cehab',
    day: 'Segunda-feira',
    time: '19:00',
    contact: '(22) 99856-1110',
    latitude: -21.18840412609413,
    longitude: -41.88855234948428212
  },
  {
    id: 'c-so-mulheres',
    name: 'Célula Só Mulheres',
    leader: 'Tatiane Tinoco',
    location: 'Rua José Maria de Abreu, 77, Cehab',
    neighborhood: 'Cehab',
    day: 'Segunda-feira',
    time: '19:30',
    contact: '(22) 99846-7371',
    latitude: -21.18737378420089,
    longitude: -41.894991698629445
  },
  // TERÇA-FEIRA
  {
    id: 'c-rubi',
    name: 'Célula Rubi',
    leader: 'Aline Moreira',
    location: 'Rua Platão Boechat, 97, Cehab',
    neighborhood: 'Cehab',
    day: 'Terça-feira',
    time: '19:30',
    contact: '(22) 99848-3976',
    latitude: -21.188212,
    longitude: -41.896543
  },
  {
    id: 'c-dunamis-1',
    name: 'Célula Dunamis 1',
    leader: 'Pr. Saullinho',
    location: 'Rua Coronel José Cardoso, 320, Niterói',
    neighborhood: 'Niterói',
    day: 'Terça-feira',
    time: '19:30',
    contact: '(22) 99879-2971',
    latitude: -21.209734,
    longitude: -41.885321
  },
  {
    id: 'c-dunamis-2',
    name: 'Célula Dunamis 2',
    leader: 'Layla Werneck',
    location: 'Rua Coronel José Cardoso, 320, Niterói',
    neighborhood: 'Niterói',
    day: 'Terça-feira',
    time: '19:30',
    contact: '(22) 99861-1698',
    latitude: -21.209845,
    longitude: -41.885412
  },
  {
    id: 'c-chosen-1',
    name: 'Célula The Chosen 1',
    leader: 'Sávyo José',
    location: 'Rua Alagoas, 171, Lions',
    neighborhood: 'Lions',
    day: 'Terça-feira',
    time: '20:00',
    contact: '(22) 99924-2773',
    latitude: -21.198512,
    longitude: -41.887234
  },
  {
    id: 'c-chosen-2',
    name: 'Célula The Chosen 2',
    leader: 'Amanda Silva',
    location: 'Rua Alagoas, 171, Lions',
    neighborhood: 'Lions',
    day: 'Terça-feira',
    time: '20:00',
    contact: '(28) 99926-7279',
    latitude: -21.198612,
    longitude: -41.887345
  },
  {
    id: 'c-rde-univ-1',
    name: 'Célula RDE Universitária 1',
    leader: 'Daniel Garibaldi',
    location: 'Rua José de Assis Barbosa, 1050, Cehab',
    neighborhood: 'Cehab',
    day: 'Terça-feira',
    time: '22:00',
    contact: '(22) 99894-7942',
    latitude: -21.190512,
    longitude: -41.894234
  },
  {
    id: 'c-rde-univ-2',
    name: 'Célula RDE Universitária 2',
    leader: 'Thayná Corti',
    location: 'Rua José de Assis Barbosa, 1050, Cehab',
    neighborhood: 'Cehab',
    day: 'Terça-feira',
    time: '22:00',
    contact: '(22) 99704-9841',
    latitude: -21.190612,
    longitude: -41.894345
  },
  // QUARTA-FEIRA
  {
    id: 'c-caminhando-jesus-matinal',
    name: 'Célula Caminhando Com Jesus Matinal',
    leader: 'Carlos Eduardo',
    location: 'Rua Mozart Bastos Soares, 1390, Cehab',
    neighborhood: 'Cehab',
    day: 'Quarta-feira',
    time: '10:00',
    contact: '(22) 99848-4977',
    latitude: -21.186645,
    longitude: -41.896123
  },
  // SEXTA-FEIRA
  {
    id: 'c-caminhando-jesus',
    name: 'Célula Caminhando Com Jesus',
    leader: 'Carlos Eduardo',
    location: 'Rua Platão Boechat, 727, Cehab',
    neighborhood: 'Cehab',
    day: 'Sexta-feira',
    time: '19:30',
    contact: '(22) 99848-4977',
    latitude: -21.187812,
    longitude: -41.895843
  },
  {
    id: 'c-vida-cristo',
    name: 'Célula Vida em Cristo',
    leader: 'Pr. Maxwel',
    location: 'Rua Mozart Bastos Soares, 519, Cehab',
    neighborhood: 'Cehab',
    day: 'Sexta-feira',
    time: '19:30',
    contact: '(22) 98803-6583',
    latitude: -21.186645,
    longitude: -41.896123
  },
  // SÁBADO
  {
    id: 'c-rde-jovem',
    name: 'Célula RDE Jovem',
    leader: 'Davi Tinoco',
    location: 'Rua José Maria de Abreu, 77, Cehab',
    neighborhood: 'Cehab',
    day: 'Sábado',
    time: '16:00',
    contact: '(22) 99830-8370',
    latitude: -21.189212,
    longitude: -41.893543
  },
  {
    id: 'c-filhas',
    name: 'Célula Filhas',
    leader: 'Mayrielle Saleiro',
    location: 'Rua Rubens Boechat, 75, Lions',
    neighborhood: 'Lions',
    day: 'Sábado',
    time: '16:00',
    contact: '(22) 99265-7527',
    latitude: -21.192512,
    longitude: -41.888345
  }
];

export const COURSES_DATA: Course[] = [
  {
    id: 'e1',
    title: 'Módulo 1 - Introdução à teologia e a bíblia',
    instructor: 'Equipe Ágape',
    duration: '9 semanas',
    description: 'Conheça o que é teologia e entenda a Bíblia, sua origem, estrutura e autoridade como Palavra de Deus.',
    image: 'https://iili.io/f4UMtoX.md.png'
  },
  {
    id: 'e2',
    title: 'Módulo 2 - Doutrinas fundamentais da fé Cristã',
    instructor: 'Equipe Ágape',
    duration: '9 semanas',
    description: 'Aprenda as principais verdades da fé cristã e fortaleça sua base espiritual e doutrinária.',
    image: 'https://iili.io/f4QK8mJ.png'
  },
  {
    id: 'e3',
    title: 'Módulo 3 - Igreja, Vida Cristã e Ética',
    instructor: 'Equipe Ágape',
    duration: '9 semanas',
    description: 'Descubra o papel da Igreja e como viver a fé cristã de forma prática e ética no dia a dia.',
    image: 'https://iili.io/f4QKUzv.md.png'
  },
  {
    id: 'e4',
    title: 'Módulo 4 - História da Igreja e Escatologia',
    instructor: 'Equipe Ágape',
    duration: '9 semanas',
    description: 'Conheça a caminhada histórica da Igreja e as promessas bíblicas sobre o futuro e a volta de Cristo.',
    image: 'https://iili.io/f4QKgXR.png'
  },
];

export const MINISTRIES_DATA: Ministry[] = [
  {
    id: 'm1',
    name: 'Rede de Homens',
    tagline: 'Homens de Honra e Fé',
    description: 'Um espaço para homens crescerem em liderança bíblica, paternidade e integridade.',
    leader: 'Leonel Nunes',
    meetingInfo: 'Primeira quinta-feira do mês às 19:30',
    image: 'https://picsum.photos/seed/men-church/600/400',
    color: 'bg-blue-900'
  },
  {
    id: 'm2',
    name: 'Entre Elas',
    tagline: 'Mulheres com Propósito',
    description: 'Comunhão e ensino para mulheres que buscam ser canal de bênção em seus lres e na sociedade.',
    leader: 'Aline Moreira',
    meetingInfo: 'Segunda quinta-feira do mês às 19:30',
    image: 'https://picsum.photos/seed/women-church/600/400',
    color: 'bg-pink-800'
  },
  {
    id: 'm3',
    name: 'Rede de Casais',
    tagline: 'Aliança Eterna',
    description: 'Fortalecendo casamentos através de princípios cristãos e momentos especiais de lazer.',
    leader: 'Pr. Rondinerio e Berenice',
    meetingInfo: 'Terceira quinta-feira do mês às 19:30',
    image: 'https://picsum.photos/seed/couples-church/600/400',
    color: 'bg-red-900'
  },
  {
    id: 'm4',
    name: 'Rede Ellos',
    tagline: 'Nascidos para Brilhar',
    description: 'Uma geração apaixonada por Jesus, com adoração extravagante e amizades reais.',
    leader: 'Pr. Saulinho e Layla',
    meetingInfo: 'Todos os sábados às 19:30',
    image: 'https://picsum.photos/seed/youth-church/600/400',
    color: 'bg-indigo-700'
  },
  {
    id: 'm5',
    name: 'Ágape Kids',
    tagline: 'Pequenos Discípulos',
    description: 'Ensino lúdico e bíblico para crianças de 0 a 12 anos em todos os nossos cultos.',
    leader: 'Tia Janaína',
    meetingInfo: 'Durante os cultos da nossa igreja',
    image: 'https://picsum.photos/seed/kids-church/600/400',
    color: 'bg-orange-500'
  }
];

export const PASTORS = ['Pr. Marco Aurélio', 'Pra. Simone'];
