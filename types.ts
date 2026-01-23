
export interface EventItem {
  id: string;
  title: string;
  day: string;
  time: string;
  description: string;
  type: 'culto' | 'evento' | 'reuniao';
}

export interface CellGroup {
  id: string;
  name: string;
  leader: string;
  location: string;
  day: string;
  time: string;
  contact: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  description: string;
  image: string;
}

export interface PastoralSlot {
  id: string;
  pastor: string;
  date: string;
  time: string;
  available: boolean;
}

export interface Ministry {
  id: string;
  name: string;
  tagline: string;
  description: string;
  leader: string;
  meetingInfo: string;
  image: string;
  color: string;
}

export interface SpecialEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: 'conferencia' | 'retiro' | 'campanha' | 'outro';
  whatsappLink?: string;
}
