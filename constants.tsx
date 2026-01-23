
import React from 'react';
import { EventItem, CellGroup, Course, PastoralSlot, Ministry, SpecialEvent } from './types';

// Componente de Logo oficial: Imagem da Igreja Internacional Ágape
export const AgapeLogo = ({ className = "h-12 w-auto" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center overflow-hidden ml-4`}>
    <img 
      src="https://iili.io/f4RBYzP.jpg" 
      alt="Logo Igreja Internacional Ágape" 
      className="h-full w-auto object-contain"
    />
  </div>
);

export const CHURCH_HISTORY = `
Fundada sobre o pilar do amor incondicional (Ágape), a Igreja Internacional Ágape nasceu com a missão de restaurar vidas e famílias através do Evangelho de Jesus Cristo. 

Ao longo dos anos, expandimos nossas fronteiras, tornando-nos uma comunidade multicultural dedicada ao ensino da Palavra, à adoração genuína e ao serviço social. Nossa jornada é marcada por testemunhos de cura, libertação e uma busca constante pela presença de Deus.
`;

export const SCHEDULE_DATA: EventItem[] = [
  { id: '1', title: 'Culto de Celebração', day: 'Domingo', time: '19:00', description: 'Nosso encontro principal de celebração e adoração.', type: 'culto' },
  { id: '2', title: 'Culto das Redes', day: 'Quinta-feira', time: '19:30', description: 'Momento de lançar as redes.', type: 'culto' },
  { id: '3', title: 'Rede Ellos', day: 'Sábado', time: '19:30', description: 'Culto de jovens com louvor, adoração e comunhão.', type: 'evento' },
  { id: '4', title: 'Oração', day: 'Segunda à Sexta', time: '06:00 às 07:00', description: 'Momento de entregar tudo nas mãos de Deus.', type: 'reuniao' },
];

export const SPECIAL_EVENTS_DATA: SpecialEvent[] = [
  {
    id: 'se0',
    title: 'Retiro Ágape 2026',
    date: '14 a 18 de Fevereiro',
    time: 'Saída às 14:00',
    location: 'Chalé São Miguel – Valão do Cágado, Itaperuna',
    description: 'Inscrições até 31 de Janeiro!',
    image: 'https://iili.io/f4TWm9p.png',
    category: 'retiro',
    whatsappLink: 'https://wa.me/5522998484977?text=Olá,%20gostaria%20de%20mais%20informações%20sobre%20o%20Retiro%20Ágape%202026.'
  }
];

export const CELLS_DATA: CellGroup[] = [
  { 
    id: 'c1', 
    name: 'Célula Varre-Sai', 
    leader: 'Pr. Marco Aurélio', 
    location: 'Varre-Sai', 
    day: 'Segunda-feira', 
    time: '19:00', 
    contact: '(22) 99913-5656' 
  },
  { 
    id: 'c2', 
    name: 'Célula Rubi', 
    leader: 'Aline Moreira', 
    location: 'Rua Platão Boechat, 97, Cehab', 
    day: 'Terça-feira', 
    time: '19:30', 
    contact: '(22) 99848-3976' 
  },
  { 
    id: 'c3', 
    name: 'Célula RDE Universitária', 
    leader: 'Daniel Garibaldi', 
    location: 'Rua José de Assis Barbosa, Cehab', 
    day: 'Terça-feira', 
    time: '22:00', 
    contact: '(22) 99894-7942' 
  },
  { 
    id: 'c4', 
    name: 'Célula Caminhando Com Jesus', 
    leader: 'Carlos Eduardo', 
    location: 'Rua Platão Boechat, 727, Cehab', 
    day: 'Sexta-feira', 
    time: '19:30', 
    contact: '(22) 99848-4977' 
  },
];

export const COURSES_DATA: Course[] = [
  { 
    id: 'e1', 
    title: 'Módulo 1 - Introdução à teologia e a bíblia', 
    instructor: 'Equipe Ágape', 
    duration: '9 semanas', 
    description: 'Módulo 1 - Introdução à teologia e a bíblia', 
    image: 'https://iili.io/f4UMtoX.md.png' 
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
    leader: 'Pr. Rondinério & Berenice',
    meetingInfo: 'Terceira quinta-feira do mês às 19:30',
    image: 'https://picsum.photos/seed/couples-church/600/400',
    color: 'bg-red-900'
  },
  {
    id: 'm4',
    name: 'Rede Ellos',
    tagline: 'Nascidos para Brilhar',
    description: 'Uma geração apaixonada por Jesus, com adoração extravagante e amizades reais.',
    leader: 'Pr. Saullinho e Pra. Layla',
    meetingInfo: 'Sábados às 19:30',
    image: 'https://picsum.photos/seed/youth-church/600/400',
    color: 'bg-indigo-700'
  },
  {
    id: 'm5',
    name: 'Ágape Kids',
    tagline: 'Pequenos Discípulos',
    description: 'Ensino lúdico e bíblico para crianças de 0 a 12 anos em todos os nossos cultos.',
    leader: 'Tia Janaína & Equipe',
    meetingInfo: 'Durante todos os Cultos',
    image: 'https://picsum.photos/seed/kids-church/600/400',
    color: 'bg-orange-500'
  }
];

export const PASTORS = ['Pr. Marco Aurélio', 'Pra. Simone', 'Pr. Carlos Eduardo'];
