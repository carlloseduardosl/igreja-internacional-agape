
import React from 'react';
import { EventItem, CellGroup, Course, PastoralSlot, Ministry, SpecialEvent } from './types';

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
    category: 'retiro'
  }
];

export const CELLS_DATA: CellGroup[] = [
  { id: 'c1', name: 'Célula Boanerges', leader: 'André & Marina', location: 'Bairro Central', day: 'Terça-feira', time: '20:00', contact: '(11) 99999-0001' },
  { id: 'c2', name: 'Célula Emanuel', leader: 'Pr. Carlos', location: 'Jardim das Flores', day: 'Quinta-feira', time: '19:30', contact: '(11) 99999-0002' },
  { id: 'c3', name: 'Célula Águas Vivas', leader: 'Sara Lima', location: 'Vila Esperança', day: 'Terça-feira', time: '20:00', contact: '(11) 99999-0003' },
];

export const COURSES_DATA: Course[] = [
  { id: 'e1', title: 'Fundamentos da Fé', instructor: 'Pr. Marcos Souza', duration: '8 semanas', description: 'Conheça os pilares básicos do cristianismo e sua caminhada com Cristo.', image: 'https://picsum.photos/seed/faith/800/400' },
  { id: 'e2', title: 'Liderança Ágape', instructor: 'Bpa. Helen', duration: '12 semanas', description: 'Formação para novos líderes de células e ministérios.', image: 'https://picsum.photos/seed/leader/800/400' },
  { id: 'e3', title: 'Panorama Bíblico', instructor: 'Ev. Roberto', duration: '6 meses', description: 'Uma visão geral de Gênesis a Apocalipse.', image: 'https://picsum.photos/seed/bible/800/400' },
];

export const MINISTRIES_DATA: Ministry[] = [
  {
    id: 'm1',
    name: 'Homens Ágape',
    tagline: 'Homens de Honra e Fé',
    description: 'Um espaço para homens crescerem em liderança bíblica, paternidade e integridade.',
    leader: 'Pr. Carlos Eduardo',
    meetingInfo: 'Último Sábado do mês às 08:00',
    image: 'https://picsum.photos/seed/men-church/600/400',
    color: 'bg-blue-900'
  },
  {
    id: 'm2',
    name: 'Mulheres Ágape',
    tagline: 'Mulheres com Propósito',
    description: 'Comunhão e ensino para mulheres que buscam ser canal de bênção em seus lares e na sociedade.',
    leader: 'Pra. Eliane Castro',
    meetingInfo: 'Segundas-feiras às 19:30',
    image: 'https://picsum.photos/seed/women-church/600/400',
    color: 'bg-pink-800'
  },
  {
    id: 'm3',
    name: 'Rede de Casais',
    tagline: 'Aliança Eterna',
    description: 'Fortalecendo casamentos através de princípios cristãos e momentos especiais de lazer.',
    leader: 'Bpo. Ricardo & Helen',
    meetingInfo: 'Eventos Bimestrais',
    image: 'https://picsum.photos/seed/couples-church/600/400',
    color: 'bg-red-900'
  },
  {
    id: 'm4',
    name: 'Ágape Young',
    tagline: 'Nascidos para Brilhar',
    description: 'Uma geração apaixonada por Jesus, com adoração extravagante e amizades reais.',
    leader: 'Ev. Gabriel Lima',
    meetingInfo: 'Sábados às 19:30',
    image: 'https://picsum.photos/seed/youth-church/600/400',
    color: 'bg-indigo-700'
  },
  {
    id: 'm5',
    name: 'Rede Kids',
    tagline: 'Pequenos Discípulos',
    description: 'Ensino lúdico e bíblico para crianças de 0 a 12 anos em todos os nossos cultos.',
    leader: 'Tia Bete & Equipe',
    meetingInfo: 'Durante todos os Cultos',
    image: 'https://picsum.photos/seed/kids-church/600/400',
    color: 'bg-orange-500'
  }
];

export const PASTORS = ['Pr. Marco Aurélio', 'Pra. Simone', 'Pr. Carlos Eduardo'];
