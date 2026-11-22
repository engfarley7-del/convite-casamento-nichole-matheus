export interface HonoreeInvite {
  id: string;
  slug: string;
  names: string;
  type: 'couple' | 'bridesmaid' | 'groomsman';
  groomsmanColor?: string;
  bridesmaidColor: 'pink' | 'coral';
  colorLabel: string;
}

export interface WeddingSettings {
  coupleNames: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  arrivalTime: string;
  ceremonyTime: string;
  locationName: string;
  locationAddress: string;
  googleMapsUrl: string;
  pixKey: string;
  pixRecipient: string;
  groomsmenMessage: string;
  groomsmenGuidelines: string;
  groomsmenAttireColor: string;
  bridesmaidsMessage: string;
  bridesmaidsGuidelines: string;
  palettes: {
    pink: {
      name: string;
      enabled: boolean;
      colors: string[];
    };
    coral: {
      name: string;
      enabled: boolean;
      colors: string[];
    };
  };
  honorees?: HonoreeInvite[];
  storyText: string;
  musicUrl?: string;
  musicTrack?: string;
}

export type PhotoSlots = Record<string, string | null>;

export interface GiftItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  isChosen: boolean;
  referenceUrl?: string | null;
  // Admin only properties
  reservedBy?: string | null;
  reservedAt?: string | null;
}

export interface RsvpItem {
  id: string;
  name: string;
  attending: boolean;
  guestsCount: number;
  companionNames: string;
  message: string;
  createdAt: string;
}

export interface GiftHistoryItem {
  action: 'RESERVE' | 'RELEASE' | 'ADMIN_MANUAL_RESERVE';
  giftId: string;
  giftName: string;
  guestName?: string;
  previousDonor?: string;
  timestamp: string;
}

export interface PhotoSlotDefinition {
  id: number;
  label: string;
  page: string;
  aspectRatio: '4:5' | '16:9' | '1:1' | '3:4';
  description: string;
}

export const PHOTO_SLOTS_DEF: PhotoSlotDefinition[] = [
  { id: 1, label: 'FOTO 1', page: 'Início', aspectRatio: '4:5', description: 'Capa e abertura do convite (vertical)' },
  { id: 2, label: 'FOTO 2', page: 'Nossa História', aspectRatio: '4:5', description: 'Carrossel história 1' },
  { id: 3, label: 'FOTO 3', page: 'Nossa História', aspectRatio: '4:5', description: 'Carrossel história 2' },
  { id: 4, label: 'FOTO 4', page: 'Nossa História', aspectRatio: '4:5', description: 'Carrossel história 3' },
  { id: 5, label: 'FOTO 5', page: 'Detalhes', aspectRatio: '4:5', description: 'Destaque página de detalhes (vertical)' },
  { id: 6, label: 'FOTO 6', page: 'Presença', aspectRatio: '4:5', description: 'Destaque confirmação de presença (vertical)' },
  { id: 7, label: 'FOTO 7', page: 'Galeria', aspectRatio: '1:1', description: 'Galeria dos noivos 1' },
  { id: 8, label: 'FOTO 8', page: 'Galeria', aspectRatio: '1:1', description: 'Galeria dos noivos 2' },
  { id: 9, label: 'FOTO 9', page: 'Galeria', aspectRatio: '1:1', description: 'Galeria dos noivos 3' },
  { id: 10, label: 'FOTO 10', page: 'Galeria', aspectRatio: '1:1', description: 'Galeria dos noivos 4' },
  { id: 11, label: 'FOTO 11', page: 'Galeria', aspectRatio: '1:1', description: 'Galeria dos noivos 5' },
  { id: 12, label: 'FOTO 12', page: 'Galeria', aspectRatio: '1:1', description: 'Galeria dos noivos 6' },
  { id: 13, label: 'FOTO 13', page: 'Padrinhos', aspectRatio: '16:9', description: 'Banner da página dos padrinhos (horizontal)' },
  { id: 14, label: 'FOTO 14', page: 'Madrinhas', aspectRatio: '16:9', description: 'Banner da página das madrinhas (horizontal)' },
];
