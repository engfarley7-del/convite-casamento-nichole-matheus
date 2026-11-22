import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WeddingSettings, PhotoSlots, GiftItem, RsvpItem, GiftHistoryItem } from '../types.ts';

interface WeddingContextType {
  settings: WeddingSettings;
  photos: PhotoSlots;
  gifts: GiftItem[];
  adminGifts: GiftItem[];
  adminRsvps: RsvpItem[];
  adminHistory: GiftHistoryItem[];
  adminToken: string | null;
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  refreshPublicData: () => Promise<void>;
  refreshAdminData: () => Promise<void>;
  reserveGift: (giftId: string, guestName: string) => Promise<{ success: boolean; message: string; error?: string }>;
  submitRsvp: (data: { name: string; attending: boolean; guestsCount: number; companionNames: string; message: string }) => Promise<{ success: boolean; message: string; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  adminReleaseGift: (id: string) => Promise<boolean>;
  adminMarkGift: (id: string, guestName: string) => Promise<boolean>;
  adminAddGift: (gift: { name: string; icon: string; category: string; referenceUrl?: string }) => Promise<boolean>;
  adminUpdateGift: (id: string, gift: Partial<GiftItem>) => Promise<boolean>;
  adminDeleteGift: (id: string) => Promise<boolean>;
  adminUpdateSettings: (newSettings: Partial<WeddingSettings>) => Promise<boolean>;
  adminUploadPhoto: (slotId: number, dataUrl: string) => Promise<boolean>;
  adminDeletePhoto: (slotId: number) => Promise<boolean>;
}

const defaultSettings: WeddingSettings = {
  coupleNames: 'Nichole & Matheus',
  brideName: 'Nichole',
  groomName: 'Matheus',
  weddingDate: '2027-07-18',
  arrivalTime: '17:00',
  ceremonyTime: '17:30',
  locationName: 'Sítio Aguilera',
  locationAddress: 'Área Rural',
  googleMapsUrl: 'https://maps.google.com/?q=Sitio+Aguilera',
  pixKey: 'nichole.matheus@casamento2027.com.br',
  pixRecipient: 'Nichole & Matheus (Chave E-mail)',
  groomsmenMessage: 'Queremos vocês ao nosso lado nesse dia tão especial vivenciando cada segundo do nosso sonho!',
  groomsmenGuidelines: 'Pedimos que os padrinhos cheguem pontualmente às 16h00 para nossas fotos protocolares e alinhamento do cortejo. Traje completo: calça jeans alinhada, bota country limpa, chapéu de cowboy, cinto com fivela e blazer cinza claro com gravata country.',
  groomsmenAttireColor: 'Cinza Claro',
  bridesmaidsMessage: 'Vocês sempre acompanharam a nossa caminhada de perto e agora queremos vocês iluminando o nosso altar como testemunhas do nosso grande amor!',
  bridesmaidsGuidelines: 'Pedimos que as madrinhas cheguem pontualmente às 16h00 para nossas fotos oficiais e alinhamento do cortejo. Traje obrigatório: bota texana ou montaria com vestido longo fluido na paleta de cores que escolhemos (Pink ou Coral). Sem estampas.',
  palettes: {
    pink: {
      name: 'Pink',
      enabled: true,
      colors: ['#EC008C', '#F50087', '#E3006C'],
    },
    coral: {
      name: 'Coral',
      enabled: true,
      colors: ['#F59306', '#FA6800', '#F2380F'],
    },
  },
  honorees: [
    {
      id: 'hon-1',
      slug: 'delma-e-marlon',
      names: 'Delma & Marlon',
      type: 'couple',
      groomsmanColor: 'Cinza Claro',
      bridesmaidColor: 'pink',
      colorLabel: 'Cinza Claro e Pink',
    },
    {
      id: 'hon-2',
      slug: 'grasielma-e-paulo',
      names: 'Grasielma & Paulo',
      type: 'couple',
      groomsmanColor: 'Cinza Claro',
      bridesmaidColor: 'pink',
      colorLabel: 'Cinza Claro e Pink',
    },
    {
      id: 'hon-3',
      slug: 'keyla-e-welisson',
      names: 'Keyla & Welisson',
      type: 'couple',
      groomsmanColor: 'Cinza Claro',
      bridesmaidColor: 'coral',
      colorLabel: 'Cinza Claro e Laranja (Coral)',
    },
    {
      id: 'hon-4',
      slug: 'ana-paula-e-rafael',
      names: 'Ana Paula & Rafael',
      type: 'couple',
      groomsmanColor: 'Cinza Claro',
      bridesmaidColor: 'coral',
      colorLabel: 'Cinza Claro e Laranja (Coral)',
    },
    {
      id: 'hon-5',
      slug: 'fabiana-e-farley',
      names: 'Fabiana & Farley',
      type: 'couple',
      groomsmanColor: 'Cinza Claro',
      bridesmaidColor: 'coral',
      colorLabel: 'Cinza Claro e Laranja (Coral)',
    },
    {
      id: 'hon-6',
      slug: 'suzi',
      names: 'Suzi',
      type: 'bridesmaid',
      bridesmaidColor: 'pink',
      colorLabel: 'Pink',
    },
    {
      id: 'hon-7',
      slug: 'nathally',
      names: 'Náthally',
      type: 'bridesmaid',
      bridesmaidColor: 'coral',
      colorLabel: 'Laranja (Coral)',
    },
  ],
  storyText:
    'Nossa história começou em 2003, no rol do berço da igrejinha adventista de madeira, em Nova Maringá – MT. Crescemos, fomos desbravadores juntos na adolescência e seguimos nossos caminhos, sem imaginar que Deus ainda tinha planos especiais para nós.\n\nAté que, em 28 de março de 2024, entre conversas, amigos e um tereré no lago, nossos caminhos se cruzaram de um jeito diferente. Afinal, depois de tantos anos dividindo a mesma história, estava na hora de descobrir que, além de companheiros de jornada, poderíamos ser companheiros para a vida inteira!\n\nEm 31 de agosto de 2024, dissemos nosso primeiro “sim”, o do namoro. E, em outubro de 2026, dissemos “sim” ao casamento, escolhendo construir nossa família com Deus à frente de cada passo.\n\nParece que Deus já tinha preparado tudo desde o começo… só esqueceu de nos contar! Agora, seguimos juntos, prontos para a maior aventura de todas: a vida a dois, com muito amor, fé e tereré pelo caminho.',
};

const defaultPhotos: PhotoSlots = {
  '1': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.05.31__1__61f3a6a5.jpeg',
  '2': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.05.32_2924fb9a.jpeg',
  '3': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.40.54__1__bebc40e3.jpeg',
  '4': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.05.31_ea73d53f.jpeg',
  '5': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_21.31.21_75ed6f0d.jpeg',
  '6': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.05.32__1__339b21b8.jpeg',
  '7': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.05.31__1__61f3a6a5.jpeg',
  '8': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.05.31__2__bd613319.jpeg',
  '9': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.05.31_ea73d53f.jpeg',
  '10': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.05.32_2924fb9a.jpeg',
  '11': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.05.32__1__339b21b8.jpeg',
  '12': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.40.54__1__bebc40e3.jpeg',
  '13': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.40.54_bc12f0e1.jpeg',
  '14': '/assets/aistudio/WhatsApp_Image_2026-11-16_at_20.40.54__2__887275bf.jpeg',
};

const defaultGifts: GiftItem[] = [
  { id: 'gift-1', name: 'Máquina de lavar roupa 13kg', icon: 'washing-machine', category: 'Eletrodomésticos', isChosen: false },
  { id: 'gift-2', name: 'Geladeira', icon: 'refrigerator', category: 'Eletrodomésticos', isChosen: false },
  { id: 'gift-3', name: 'Forno elétrico', icon: 'microwave', category: 'Cozinha', isChosen: false },
  { id: 'gift-4', name: 'Air fryer', icon: 'utensils', category: 'Cozinha', isChosen: false },
  { id: 'gift-5', name: 'Liquidificador', icon: 'blender', category: 'Cozinha', isChosen: false },
  { id: 'gift-6', name: 'TV', icon: 'tv', category: 'Sala', isChosen: false },
  { id: 'gift-7', name: 'Batedeira', icon: 'coffee', category: 'Cozinha', isChosen: false },
  { id: 'gift-8', name: 'Ventilador', icon: 'wind', category: 'Casa', isChosen: false },
  { id: 'gift-9', name: 'Panela de pressão elétrica', icon: 'flame', category: 'Cozinha', isChosen: false },
  { id: 'gift-10', name: 'Ferro de passar roupa', icon: 'shirt', category: 'Casa', isChosen: false },
  { id: 'gift-11', name: 'Micro-ondas', icon: 'zap', category: 'Cozinha', isChosen: false },
  { id: 'gift-12', name: 'Aspirador de pó', icon: 'sparkles', category: 'Casa', isChosen: false },
];

const isJsonResponse = (res: Response) => {
  const ct = res.headers.get('content-type') || '';
  return res.ok && ct.toLowerCase().includes('application/json');
};

const WeddingContext = createContext<WeddingContextType | null>(null);

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WeddingSettings>(defaultSettings);
  const [photos, setPhotos] = useState<PhotoSlots>(defaultPhotos);
  const [gifts, setGifts] = useState<GiftItem[]>(defaultGifts);
  const [adminGifts, setAdminGifts] = useState<GiftItem[]>([]);
  const [adminRsvps, setAdminRsvps] = useState<RsvpItem[]>([]);
  const [adminHistory, setAdminHistory] = useState<GiftHistoryItem[]>([]);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('nm_admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Public Config & Gifts (falls back seamlessly to bundled defaults on static hosting like Netlify)
  const refreshPublicData = useCallback(async () => {
    try {
      setError(null);
      const [configRes, giftsRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/presentes'),
      ]);

      if (isJsonResponse(configRes)) {
        const configData = await configRes.json();
        if (configData.settings) {
          setSettings((prev) => ({ ...prev, ...configData.settings }));
        }
        if (configData.photos) {
          setPhotos({ ...defaultPhotos, ...configData.photos });
        }
      }

      if (isJsonResponse(giftsRes)) {
        const giftsData = await giftsRes.json();
        if (Array.isArray(giftsData)) {
          setGifts(giftsData);
        }
      }
    } catch (err) {
      // Static deploy without Node API server: keep bundled defaults silently
      console.warn('API indisponível, utilizando dados e fotos embutidos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Admin Data
  const refreshAdminData = useCallback(async () => {
    if (!adminToken) return;
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const [giftsRes, rsvpsRes] = await Promise.all([
        fetch('/api/admin/presentes', { headers }),
        fetch('/api/admin/presenca', { headers }),
      ]);

      if (isJsonResponse(giftsRes)) {
        const data = await giftsRes.json();
        setAdminGifts(data.gifts || []);
        setAdminHistory(data.history || []);
      }
      if (isJsonResponse(rsvpsRes)) {
        const rsvps = await rsvpsRes.json();
        setAdminRsvps(rsvps);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }, [adminToken]);

  useEffect(() => {
    refreshPublicData();
  }, [refreshPublicData]);

  useEffect(() => {
    if (adminToken) {
      refreshAdminData();
    }
  }, [adminToken, refreshAdminData]);

  // Guest Gift Reservation
  const reserveGift = async (giftId: string, guestName: string) => {
    try {
      const res = await fetch(`/api/presentes/${giftId}/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName }),
      });

      if (!isJsonResponse(res)) {
        // Static fallback if deployed without backend API
        if (res.status === 404 || res.headers.get('content-type')?.includes('text/html')) {
          setGifts((prev) =>
            prev.map((g) => (g.id === giftId ? { ...g, isChosen: true } : g))
          );
          return {
            success: true,
            message: 'Muito obrigado por nos presentear!',
          };
        }
      }

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Não foi possível reservar este presente.',
          error: data.error,
        };
      }

      // Optimistically update public list
      setGifts((prev) =>
        prev.map((g) => (g.id === giftId ? { ...g, isChosen: true } : g))
      );
      // Refresh to ensure sync
      await refreshPublicData();

      return {
        success: true,
        message: data.message || 'Muito obrigado por nos presentear!',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
      };
    }
  };

  // RSVP Submission
  const submitRsvp = async (data: {
    name: string;
    attending: boolean;
    guestsCount: number;
    companionNames: string;
    message: string;
  }) => {
    try {
      const res = await fetch('/api/presenca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!isJsonResponse(res)) {
        return {
          success: true,
          message: data.attending
            ? 'Presença confirmada com sucesso! Mal podemos esperar para comemorar juntos.'
            : 'Agradecemos por nos avisar com antecedência. Sentiremos sua falta!',
        };
      }
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, message: resData.error || 'Erro ao registrar presença.' };
      }
      return { success: true, message: resData.message };
    } catch (err) {
      return { success: false, message: 'Erro ao enviar confirmação. Tente novamente.' };
    }
  };

  // Admin Login
  const adminLogin = async (login: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, email: login, password }),
      });
      if (!isJsonResponse(res)) {
        return { success: false, error: 'Servidor indisponível. Tente novamente.' };
      }
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Falha no login.' };
      }
      localStorage.setItem('nm_admin_token', data.token);
      setAdminToken(data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  // Admin Logout
  const adminLogout = () => {
    localStorage.removeItem('nm_admin_token');
    setAdminToken(null);
    setAdminGifts([]);
    setAdminRsvps([]);
    setAdminHistory([]);
  };

  // Admin actions
  const adminReleaseGift = async (id: string) => {
    if (!adminToken) return false;
    try {
      const res = await fetch(`/api/admin/presentes/${id}/liberar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        await Promise.all([refreshAdminData(), refreshPublicData()]);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const adminMarkGift = async (id: string, guestName: string) => {
    if (!adminToken) return false;
    try {
      const res = await fetch(`/api/admin/presentes/${id}/marcar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestName }),
      });
      if (res.ok) {
        await Promise.all([refreshAdminData(), refreshPublicData()]);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const adminAddGift = async (gift: { name: string; icon: string; category: string; referenceUrl?: string }) => {
    if (!adminToken) return false;
    try {
      const res = await fetch('/api/admin/presentes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gift),
      });
      if (res.ok) {
        await Promise.all([refreshAdminData(), refreshPublicData()]);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const adminUpdateGift = async (id: string, gift: Partial<GiftItem>) => {
    if (!adminToken) return false;
    try {
      const res = await fetch(`/api/admin/presentes/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gift),
      });
      if (res.ok) {
        await Promise.all([refreshAdminData(), refreshPublicData()]);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const adminDeleteGift = async (id: string) => {
    if (!adminToken) return false;
    try {
      const res = await fetch(`/api/admin/presentes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        await Promise.all([refreshAdminData(), refreshPublicData()]);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const adminUpdateSettings = async (newSettings: Partial<WeddingSettings>) => {
    if (!adminToken) return false;
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        await refreshPublicData();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const adminUploadPhoto = async (slotId: number, dataUrl: string) => {
    if (!adminToken) return false;
    try {
      const res = await fetch('/api/admin/photos/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slotId, dataUrl }),
      });
      if (res.ok) {
        await refreshPublicData();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const adminDeletePhoto = async (slotId: number) => {
    if (!adminToken) return false;
    try {
      const res = await fetch(`/api/admin/photos/${slotId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        await refreshPublicData();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <WeddingContext.Provider
      value={{
        settings,
        photos,
        gifts,
        adminGifts,
        adminRsvps,
        adminHistory,
        adminToken,
        isAdminLoggedIn: Boolean(adminToken),
        isLoading,
        error,
        refreshPublicData,
        refreshAdminData,
        reserveGift,
        submitRsvp,
        adminLogin,
        adminLogout,
        adminReleaseGift,
        adminMarkGift,
        adminAddGift,
        adminUpdateGift,
        adminDeleteGift,
        adminUpdateSettings,
        adminUploadPhoto,
        adminDeletePhoto,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
