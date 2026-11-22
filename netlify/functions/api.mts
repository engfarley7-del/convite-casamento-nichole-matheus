import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { createHash, timingSafeEqual } from 'node:crypto';
import seed from '../seed/wedding_data.json' with { type: 'json' };

// ---------- Storage ----------
const DATA_KEY = 'wedding-data';
const store = () => getStore({ name: 'convite-nichole-matheus', consistency: 'strong' });

type WeddingData = {
  settings: Record<string, any>;
  photos: Record<string, string | null>;
  gifts: any[];
  rsvps: any[];
  giftHistory: any[];
};

async function loadData(): Promise<{ data: WeddingData; etag?: string }> {
  const entry = await store().getWithMetadata(DATA_KEY, { type: 'json' });
  if (entry === null) {
    return { data: structuredClone(seed) as WeddingData };
  }
  // Dados salvos sempre vencem. Campos novos adicionados ao seed depois entram como padrão,
  // sem sobrescrever nada que já foi preenchido.
  const stored = entry.data as WeddingData;
  const seeded = seed as unknown as WeddingData;
  stored.settings = { ...seeded.settings, ...stored.settings };
  stored.photos = { ...seeded.photos, ...stored.photos };
  return { data: stored, etag: entry.etag };
}

// Grava com controle de versão (etag) para não perder reservas simultâneas.
async function mutate<T>(
  fn: (data: WeddingData) => { result: T; save: boolean },
): Promise<T> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data, etag } = await loadData();
    const { result, save } = fn(data);
    if (!save) return result;
    const res = await store().setJSON(
      DATA_KEY,
      data,
      etag ? { onlyIfMatch: etag } : { onlyIfNew: true },
    );
    if (res.modified) return result;
  }
  throw new Error('Conflito de gravação, tente novamente.');
}

// ---------- Auth ----------
function expectedToken(): string | null {
  const user = Netlify.env.get('ADMIN_USERNAME');
  const pass = Netlify.env.get('ADMIN_PASSWORD');
  if (!user || !pass) return null;
  return createHash('sha256').update(`nm-admin:${user.trim().toLowerCase()}:${pass.trim()}`).digest('hex');
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function isAdmin(req: Request) {
  const token = expectedToken();
  if (!token) return false;
  const given = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  return given.length > 0 && safeEqual(given, token);
}

// ---------- Helpers ----------
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const err = (message: string, status: number) => json({ error: message }, status);
const body = async (req: Request) => {
  try {
    return (await req.json()) as any;
  } catch {
    return {};
  }
};
const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

// ---------- Router ----------
export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, '').replace(/\/+$/, '') || '/';
  const method = req.method;
  const seg = path.split('/').filter(Boolean);

  try {
    // ===== Público =====
    if (method === 'GET' && path === '/config') {
      const { data } = await loadData();
      return json({ settings: data.settings, photos: data.photos });
    }

    if (method === 'GET' && path === '/presentes') {
      const { data } = await loadData();
      return json(
        (data.gifts || []).map((g) => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          category: g.category || 'Casa',
          isChosen: Boolean(g.isChosen),
          referenceUrl: g.referenceUrl || null,
        })),
      );
    }

    if (method === 'GET' && seg[0] === 'photos' && seg.length === 2) {
      const entry = await store().get(`photo-${seg[1]}`, { type: 'text' });
      const m = entry && /^data:([^;]+);base64,(.+)$/s.exec(entry);
      if (!m) return new Response('Not found', { status: 404 });
      return new Response(Buffer.from(m[2], 'base64'), {
        headers: { 'Content-Type': m[1], 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    }

    if (method === 'POST' && seg[0] === 'presentes' && seg[2] === 'reservar') {
      const guestName = String((await body(req)).guestName || '').trim().slice(0, 120);
      if (!guestName) return err('Por favor, informe seu nome para confirmar o presente.', 400);
      const id = seg[1];
      type Reserve = { status: 404 | 409 | 200; gift?: { id: string; name: string; isChosen: boolean } };
      const out = await mutate<Reserve>((data) => {
        const gift = (data.gifts || []).find((g) => g.id === id);
        if (!gift) return { result: { status: 404 }, save: false };
        if (gift.isChosen) return { result: { status: 409 }, save: false };
        const now = new Date().toISOString();
        gift.isChosen = true;
        gift.reservedBy = guestName;
        gift.reservedAt = now;
        (data.giftHistory ||= []).push({ action: 'RESERVE', giftId: gift.id, giftName: gift.name, guestName, timestamp: now });
        return { result: { status: 200, gift: { id: gift.id, name: gift.name, isChosen: true } }, save: true };
      });
      if (out.status === 404) return err('Presente não encontrado.', 404);
      if (out.status === 409) return err('Esse presente acabou de ser escolhido, que tal escolher outro?', 409);
      return json({ success: true, message: 'Muito obrigado por nos presentear!', gift: out.gift });
    }

    if (method === 'POST' && path === '/presenca') {
      const b = await body(req);
      const name = String(b.name || '').trim().slice(0, 120);
      if (!name) return err('Por favor, informe seu nome completo.', 400);
      const attending = b.attending !== false;
      await mutate((data) => {
        (data.rsvps ||= []).unshift({
          id: 'rsvp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          name,
          attending,
          guestsCount: Math.min(Math.max(Number(b.guestsCount) || 1, 1), 20),
          companionNames: String(b.companionNames || '').slice(0, 500),
          message: String(b.message || '').slice(0, 1000),
          createdAt: new Date().toISOString(),
        });
        return { result: null, save: true };
      });
      return json({
        success: true,
        message: attending
          ? 'Presença confirmada com sucesso! Mal podemos esperar para comemorar juntos.'
          : 'Agradecemos por nos avisar com antecedência. Sentiremos sua falta!',
      });
    }

    // ===== Login admin =====
    if (method === 'POST' && path === '/admin/login') {
      const token = expectedToken();
      if (!token) return err('Administrador não configurado no servidor.', 503);
      const b = await body(req);
      const login = String(b.login || b.email || b.username || '').trim().toLowerCase();
      const password = String(b.password || '').trim();
      const user = Netlify.env.get('ADMIN_USERNAME')!.trim().toLowerCase();
      const pass = Netlify.env.get('ADMIN_PASSWORD')!.trim();
      if (safeEqual(login, user) && safeEqual(password, pass)) {
        return json({ token, user: { username: user, name: 'Nichole & Matheus (Administrador)' } });
      }
      return err('Login ou senha incorretos.', 401);
    }

    // ===== Admin (exige token) =====
    if (seg[0] === 'admin') {
      if (!isAdmin(req)) return err('Acesso não autorizado. Faça login como administrador.', 401);
      const a = seg.slice(1);

      if (method === 'GET' && a[0] === 'presentes' && a[1] === 'export-csv') {
        const { data } = await loadData();
        let csv = 'ID,Item,Categoria,Status,Reservado Por,Data da Reserva\n';
        for (const g of data.gifts || []) {
          const date = g.reservedAt ? new Date(g.reservedAt).toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' }) : '';
          csv += [g.id, g.name, g.category || '', g.isChosen ? 'Escolhido' : 'Disponivel', g.reservedBy || '', date].map(csvCell).join(',') + '\n';
        }
        return new Response('﻿' + csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="presentes-nichole-matheus.csv"',
          },
        });
      }

      if (method === 'GET' && a[0] === 'presenca' && a[1] === 'export-csv') {
        const { data } = await loadData();
        let csv = 'Data de Resposta,Nome do Convidado,Vai Comparecer?,Total de Pessoas,Acompanhantes,Mensagem para os Noivos\n';
        for (const r of data.rsvps || []) {
          const date = r.createdAt ? new Date(r.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' }) : '';
          csv += [date, r.name, r.attending ? 'SIM' : 'NÃO', r.guestsCount || 1, r.companionNames || '', String(r.message || '').replace(/\n/g, ' ')].map(csvCell).join(',') + '\n';
        }
        return new Response('﻿' + csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="confirmacoes-presenca-nichole-matheus.csv"',
          },
        });
      }

      if (method === 'GET' && a[0] === 'presentes' && a.length === 1) {
        const { data } = await loadData();
        return json({ gifts: data.gifts || [], history: data.giftHistory || [] });
      }

      if (method === 'GET' && a[0] === 'presenca' && a.length === 1) {
        const { data } = await loadData();
        return json(data.rsvps || []);
      }

      if (method === 'POST' && a[0] === 'presentes' && a[2] === 'liberar') {
        const out = await mutate<any>((data) => {
          const gift = (data.gifts || []).find((g) => g.id === a[1]);
          if (!gift) return { result: null, save: false };
          const previousDonor = gift.reservedBy;
          gift.isChosen = false;
          gift.reservedBy = null;
          gift.reservedAt = null;
          (data.giftHistory ||= []).push({ action: 'RELEASE', giftId: gift.id, giftName: gift.name, previousDonor, timestamp: new Date().toISOString() });
          return { result: gift, save: true };
        });
        return out ? json({ success: true, gift: out }) : err('Presente não encontrado.', 404);
      }

      if (method === 'POST' && a[0] === 'presentes' && a[2] === 'marcar') {
        const guestName = String((await body(req)).guestName || 'Presente marcado pelo admin').trim();
        const out = await mutate<any>((data) => {
          const gift = (data.gifts || []).find((g) => g.id === a[1]);
          if (!gift) return { result: null, save: false };
          gift.isChosen = true;
          gift.reservedBy = guestName;
          gift.reservedAt = new Date().toISOString();
          (data.giftHistory ||= []).push({ action: 'ADMIN_MANUAL_RESERVE', giftId: gift.id, giftName: gift.name, guestName, timestamp: gift.reservedAt });
          return { result: gift, save: true };
        });
        return out ? json({ success: true, gift: out }) : err('Presente não encontrado.', 404);
      }

      if (method === 'POST' && a[0] === 'presentes' && a.length === 1) {
        const b = await body(req);
        if (!b.name) return err('Nome do presente é obrigatório.', 400);
        const gift = {
          id: 'gift-' + Date.now(),
          name: String(b.name).trim(),
          icon: b.icon || 'gift',
          category: b.category || 'Geral',
          referenceUrl: b.referenceUrl || null,
          isChosen: false,
          reservedBy: null,
          reservedAt: null,
        };
        await mutate((data) => {
          (data.gifts ||= []).push(gift);
          return { result: null, save: true };
        });
        return json({ success: true, gift });
      }

      if (method === 'PUT' && a[0] === 'presentes' && a.length === 2) {
        const b = await body(req);
        const out = await mutate<any>((data) => {
          const gift = (data.gifts || []).find((g) => g.id === a[1]);
          if (!gift) return { result: null, save: false };
          if (b.name !== undefined) gift.name = String(b.name).trim();
          if (b.icon !== undefined) gift.icon = b.icon;
          if (b.category !== undefined) gift.category = b.category;
          if (b.referenceUrl !== undefined) gift.referenceUrl = b.referenceUrl;
          if (b.isChosen !== undefined) gift.isChosen = Boolean(b.isChosen);
          if (b.reservedBy !== undefined) gift.reservedBy = b.reservedBy;
          return { result: gift, save: true };
        });
        return out ? json({ success: true, gift: out }) : err('Presente não encontrado.', 404);
      }

      if (method === 'DELETE' && a[0] === 'presentes' && a.length === 2) {
        await mutate((data) => {
          data.gifts = (data.gifts || []).filter((g) => g.id !== a[1]);
          return { result: null, save: true };
        });
        return json({ success: true });
      }

      if (method === 'DELETE' && a[0] === 'presenca' && a.length === 2) {
        await mutate((data) => {
          data.rsvps = (data.rsvps || []).filter((r) => r.id !== a[1]);
          return { result: null, save: true };
        });
        return json({ success: true });
      }

      if (method === 'PUT' && a[0] === 'config') {
        const b = await body(req);
        const settings = await mutate((data) => {
          data.settings = { ...data.settings, ...b };
          return { result: data.settings, save: true };
        });
        return json({ success: true, settings });
      }

      if (method === 'POST' && a[0] === 'photos' && a[1] === 'upload') {
        const b = await body(req);
        const slot = Number(b.slotId);
        if (!Number.isInteger(slot) || slot < 1 || slot > 14) return err('Slot de foto inválido (deve ser entre 1 e 14).', 400);
        if (typeof b.dataUrl !== 'string' || !/^data:image\/[a-z+.-]+;base64,/i.test(b.dataUrl)) return err('Imagem inválida.', 400);
        await store().set(`photo-${slot}`, b.dataUrl);
        const photos = await mutate((data) => {
          (data.photos ||= {})[String(slot)] = `/api/photos/${slot}?v=${Date.now()}`;
          return { result: data.photos, save: true };
        });
        return json({ success: true, photos });
      }

      if (method === 'DELETE' && a[0] === 'photos' && a.length === 2) {
        await store().delete(`photo-${a[1]}`);
        const photos = await mutate((data) => {
          (data.photos ||= {})[String(a[1])] = null;
          return { result: data.photos, save: true };
        });
        return json({ success: true, photos });
      }
    }

    return err('Rota não encontrada.', 404);
  } catch (e) {
    console.error('API error:', e);
    return err('Erro interno no servidor.', 500);
  }
};

export const config: Config = {
  path: '/api/*',
};
