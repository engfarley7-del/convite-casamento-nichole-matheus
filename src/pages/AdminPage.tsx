import React, { useState, useRef, useEffect } from 'react';
import { useWedding } from '../context/WeddingContext.tsx';
import { PHOTO_SLOTS_DEF, HonoreeInvite } from '../types.ts';
import { Monogram } from '../components/Monogram.tsx';
import { SpecialInvitePage } from './SpecialInvitePage.tsx';
import { GroomsmenPage } from './GroomsmenPage.tsx';
import { BridesmaidsPage } from './BridesmaidsPage.tsx';
import {
  Lock,
  LogOut,
  Camera,
  Upload,
  Trash2,
  Copy,
  Check,
  Download,
  Users,
  Gift,
  Settings,
  Image as ImageIcon,
  Plus,
  ExternalLink,
  Shield,
  Eye,
  X,
  Crown,
  Share2,
  MapPin,
} from 'lucide-react';

interface AdminPageProps {
  onNavigate?: (path: string) => void;
}

type PreviewTarget =
  | { kind: 'honoree'; honoree: HonoreeInvite }
  | { kind: 'padrinhos' }
  | { kind: 'madrinhas' };

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const {
    settings,
    photos,
    adminGifts,
    adminRsvps,
    adminHistory,
    adminToken,
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    adminReleaseGift,
    adminMarkGift,
    adminAddGift,
    adminDeleteGift,
    adminUpdateGift,
    adminUpdateSettings,
    adminUploadPhoto,
    adminDeletePhoto,
  } = useWedding();

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'honorees' | 'photos' | 'gifts' | 'rsvps' | 'settings'
  >('overview');

  // Preview Modal State
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(null);

  // Copied link feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSlotForUpload, setSelectedSlotForUpload] = useState<number | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Gift editing/marking state
  const [manualDonorName, setManualDonorName] = useState<{ [id: string]: string }>({});
  const [showAddGiftModal, setShowAddGiftModal] = useState(false);
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftCategory, setNewGiftCategory] = useState('Casa');
  const [newGiftIcon, setNewGiftIcon] = useState('gift');

  // Add Honoree Modal State
  const [showAddHonoreeModal, setShowAddHonoreeModal] = useState(false);
  const [newHonoreeNames, setNewHonoreeNames] = useState('');
  const [newHonoreeType, setNewHonoreeType] = useState<'couple' | 'bridesmaid'>('couple');
  const [newHonoreeColor, setNewHonoreeColor] = useState<'pink' | 'coral'>('pink');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [coordsInput, setCoordsInput] = useState('');
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const honorees = settings.honorees || [];
  const origin = window.location.origin;

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Build personalized WhatsApp share link
  const buildWhatsAppUrl = (h: HonoreeInvite) => {
    const inviteUrl = `${origin}/convite/${h.slug}`;
    const greeting =
      h.type === 'couple'
        ? `Olá, ${h.names}! 💕`
        : `Olá, ${h.names}! 💕`;
    const colorText =
      h.type === 'couple'
        ? `Traje especial definido para vocês: *${h.colorLabel}*.`
        : `Sua cor oficial como madrinha é: *${h.colorLabel}*.`;
    const msg = `${greeting}\n\nVocês fazem parte da nossa história e preparamos com muito carinho um *Convite Exclusivo de Padrinhos* para o nosso casamento (*Nichole & Matheus · 18/07/2027*)! 🤠💍\n\n${colorText}\n\nAcesse seu convite personalizado aqui:\n${inviteUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  };

  // Authorized CSV Download helper
  const handleDownloadCsv = async (endpoint: string, filename: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export error:', err);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    const res = await adminLogin(loginEmail, loginPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || 'Credenciais inválidas.');
    }
  };

  // Trigger file dialog for a photo slot
  const handleInitiateUpload = (slotId: number) => {
    setSelectedSlotForUpload(slotId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
  const [editGiftForm, setEditGiftForm] = useState<{ name: string; category: string }>({ name: '', category: '' });

  // Handle image file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || selectedSlotForUpload === null) return;

    setIsUploadingPhoto(true);
    const slot = selectedSlotForUpload;
    // Reduz a foto antes de enviar (limite de ~4,5 MB por requisição no servidor)
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      const MAX = 1800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      await adminUploadPhoto(slot, canvas.toDataURL('image/jpeg', 0.85));
      setIsUploadingPhoto(false);
      setSelectedSlotForUpload(null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setIsUploadingPhoto(false);
      setSelectedSlotForUpload(null);
    };
    img.src = objectUrl;
  };

  // Photo Slots status calculation
  const totalSlots = PHOTO_SLOTS_DEF.length; // 14
  const uploadedCount = PHOTO_SLOTS_DEF.filter((slot) => Boolean(photos[String(slot.id)])).length;
  const missingSlots = PHOTO_SLOTS_DEF.filter((slot) => !photos[String(slot.id)]);

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await adminUpdateSettings(settingsForm);
    if (success) {
      setSavedSettingsNotice(true);
      setTimeout(() => setSavedSettingsNotice(false), 3000);
    }
  };

  // New Gift Creation
  const handleCreateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftName.trim()) return;
    const ok = await adminAddGift({
      name: newGiftName.trim(),
      category: newGiftCategory,
      icon: newGiftIcon,
    });
    if (ok) {
      setShowAddGiftModal(false);
      setNewGiftName('');
    }
  };

  // Add New Honoree Invite
  const handleAddHonoree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHonoreeNames.trim()) return;

    const cleanSlug = newHonoreeNames
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, 'e')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const colorLabel =
      newHonoreeType === 'couple'
        ? newHonoreeColor === 'pink'
          ? 'Cinza Claro e Pink'
          : 'Cinza Claro e Laranja (Coral)'
        : newHonoreeColor === 'pink'
        ? 'Pink'
        : 'Laranja (Coral)';

    const newItem: HonoreeInvite = {
      id: `hon-${Date.now()}`,
      slug: cleanSlug || `convidado-${Date.now()}`,
      names: newHonoreeNames.trim(),
      type: newHonoreeType,
      groomsmanColor: newHonoreeType === 'couple' ? 'Cinza Claro' : undefined,
      bridesmaidColor: newHonoreeColor,
      colorLabel,
    };

    const updated = [...honorees, newItem];
    const ok = await adminUpdateSettings({ honorees: updated });
    if (ok) {
      setShowAddHonoreeModal(false);
      setNewHonoreeNames('');
    }
  };

  const handleRemoveHonoree = async (id: string) => {
    const updated = honorees.filter((h) => h.id !== id);
    await adminUpdateSettings({ honorees: updated });
  };

  // Grouped Honorees
  const pinkCouples = honorees.filter((h) => h.type === 'couple' && h.bridesmaidColor === 'pink');
  const coralCouples = honorees.filter((h) => h.type === 'couple' && h.bridesmaidColor === 'coral');
  const soloMadrinhas = honorees.filter((h) => h.type === 'bridesmaid');

  // If not logged in, render clean Pink & Coral login view (NO login hint!)
  if (!isAdminLoggedIn) {
    return (
      <div className="w-full min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-[#FCE8F0] border border-[#F2C6D8] flex items-center justify-center mx-auto text-[#C80064] shadow-xs">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold text-[#3D2C24]">
              Painel dos Noivos
            </h1>
            <p className="text-xs text-[#785E54] mt-1">
              Acesso restrito para {settings.coupleNames} gerenciarem o convite
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-serif font-bold text-[#3D2C24] uppercase tracking-wider mb-1">
                Login
              </label>
              <input
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="Digite seu login"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF5F4] border border-[#EAD4DC] rounded-xl text-sm text-[#3D2C24] placeholder-[#9E8B80] focus:outline-hidden focus:ring-2 focus:ring-[#EC008C]/25 focus:border-[#EC008C]"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#3D2C24] uppercase tracking-wider mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                placeholder="Digite sua senha"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF5F4] border border-[#EAD4DC] rounded-xl text-sm text-[#3D2C24] placeholder-[#9E8B80] focus:outline-hidden focus:ring-2 focus:ring-[#EC008C]/25 focus:border-[#EC008C]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 btn-pink-coral font-serif font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoggingIn ? 'Entrando...' : 'Entrar no Painel Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderHonoreeCard = (h: HonoreeInvite) => {
    const isPink = h.bridesmaidColor === 'pink';
    const inviteUrl = `${origin}/convite/${h.slug}`;

    return (
      <div
        key={h.id}
        className="p-3.5 bg-[#FAF5F4] rounded-2xl border border-[#EFE0E5] flex flex-col gap-3 transition-all hover:border-[#EC008C]/40"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#3D2C24]">
                {h.names}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  isPink
                    ? 'bg-[#FDF1F6] text-[#B8005C] border-[#F2C6D8]'
                    : 'bg-[#FFF4EA] text-[#D94E00] border-[#F7D1B3]'
                }`}
              >
                {h.type === 'couple' && (
                  <span className="w-2 h-2 rounded-full bg-[#9CA3AF] inline-block" />
                )}
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    isPink ? 'bg-[#EC008C]' : 'bg-[#FA6800]'
                  }`}
                />
                {h.colorLabel}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#785E54] truncate mt-0.5">
              {inviteUrl}
            </p>
          </div>

          <button
            onClick={() => handleRemoveHonoree(h.id)}
            title="Remover da lista"
            className="p-1.5 text-[#9E8B80] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Visualizar Convite */}
          <button
            type="button"
            onClick={() => setPreviewTarget({ kind: 'honoree', honoree: h })}
            className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FCFBF9] hover:bg-[#FDF1F6] text-[#B8005C] border border-[#F2C6D8] rounded-xl text-xs font-serif font-bold shadow-2xs transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visualizar</span>
          </button>

          {/* Copiar Link */}
          <button
            type="button"
            onClick={() => handleCopy(inviteUrl, h.id)}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 btn-pink-coral rounded-xl text-xs font-serif font-bold shadow-2xs transition-all"
          >
            {copiedKey === h.id ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              </>
            )}
          </button>

          {/* Enviar WhatsApp */}
          <a
            href={buildWhatsAppUrl(h)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[105px] flex items-center justify-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#1FB858] text-white rounded-xl text-xs font-sans font-bold shadow-2xs transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen pb-24 md:pb-16 px-4 sm:px-6">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-5xl mx-auto space-y-6 pt-4">
        {/* Top Admin Header */}
        <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Monogram size={40} variant="pinkCoral" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg sm:text-xl text-[#3D2C24]">
                  Painel Administrativo
                </h1>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FCE8F0] text-[#B8005C]">
                  Online
                </span>
              </div>
              <p className="text-xs text-[#785E54]">
                {settings.coupleNames} · 18/07/2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={adminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF5F4] hover:bg-[#FDF1F6] text-[#B8005C] border border-[#F2C6D8] rounded-lg text-xs font-serif font-bold shadow-2xs transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-[#F2E6EA] rounded-xl overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Shield },
            { id: 'honorees', label: `Padrinhos (${honorees.length})`, icon: Crown },
            { id: 'photos', label: `Fotos (${uploadedCount}/${totalSlots})`, icon: Camera },
            { id: 'gifts', label: `Presentes (${adminGifts.filter((g) => g.isChosen).length})`, icon: Gift },
            { id: 'rsvps', label: `Presença (${adminRsvps.length})`, icon: Users },
            { id: 'settings', label: 'Configurações', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-serif font-bold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FCFBF9] text-[#B8005C] shadow-xs'
                    : 'text-[#6B534B] hover:text-[#3D2C24]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & QUICK LINKS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Direct Links & Live Visual Previews */}
            <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif font-bold text-base text-[#3D2C24]">
                    Convites &amp; Links Exclusivos (Padrinhos e Madrinhas)
                  </h2>
                  <p className="text-xs text-[#785E54]">
                    Visualize o layout de cada convite e envie os links personalizados pelo WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('honorees')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 btn-pink-coral rounded-lg text-xs font-serif font-bold shrink-0 self-start sm:self-center"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Ver Todos os {honorees.length} Links</span>
                </button>
              </div>

              <div className="space-y-3">
                {/* Main Link */}
                <div className="p-3.5 bg-[#FAF5F4] rounded-xl border border-[#EFE0E5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-serif font-bold text-xs text-[#3D2C24] block">
                      Convite Principal (Todos os convidados)
                    </span>
                    <span className="font-mono text-xs text-[#785E54]">{origin}/</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('/')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#FCFBF9] text-[#3D2C24] border border-[#E4D7D0] rounded-lg text-xs font-serif font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Abrir</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(`${origin}/`, 'main')}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 btn-pink-coral rounded-lg text-xs font-serif font-bold shadow-2xs"
                    >
                      {copiedKey === 'main' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'main' ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Padrinhos Link + Visualizar Convite */}
                <div className="p-3.5 bg-[#FAF5F4] rounded-xl border border-[#EFE0E5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-xs text-[#3D2C24]">
                        Convite Geral dos Padrinhos (Cinza Claro)
                      </span>
                      <span className="text-[10px] bg-[#FFF0E2] text-[#D94E00] border border-[#F7D1B3] px-1.5 py-0.5 rounded font-bold">
                        Exclusivo
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#785E54]">{origin}/padrinhos</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewTarget({ kind: 'padrinhos' })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#FCFBF9] hover:bg-[#FFF4EA] text-[#D94E00] border border-[#F7D1B3] rounded-lg text-xs font-serif font-bold shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visualizar Convite</span>
                    </button>
                    <button
                      onClick={() => handleCopy(`${origin}/padrinhos`, 'padrinhos')}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 btn-pink-coral rounded-lg text-xs font-serif font-bold shadow-2xs"
                    >
                      {copiedKey === 'padrinhos' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'padrinhos' ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Madrinhas Link + Visualizar Convite */}
                <div className="p-3.5 bg-[#FAF5F4] rounded-xl border border-[#EFE0E5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-xs text-[#3D2C24]">
                        Convite Geral das Madrinhas (Pink &amp; Coral)
                      </span>
                      <span className="text-[10px] bg-[#FCE8F0] text-[#B8005C] border border-[#F2C6D8] px-1.5 py-0.5 rounded font-bold">
                        Exclusivo
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#785E54]">{origin}/madrinhas</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewTarget({ kind: 'madrinhas' })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#FCFBF9] hover:bg-[#FDF1F6] text-[#B8005C] border border-[#F2C6D8] rounded-lg text-xs font-serif font-bold shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visualizar Convite</span>
                    </button>
                    <button
                      onClick={() => handleCopy(`${origin}/madrinhas`, 'madrinhas')}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 btn-pink-coral rounded-lg text-xs font-serif font-bold shadow-2xs"
                    >
                      {copiedKey === 'madrinhas' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'madrinhas' ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Quick Preview Grid for all 7 Honorees */}
            <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-base text-[#3D2C24]">
                    Links Individuais · Lista de Padrinhos e Madrinhas
                  </h2>
                  <p className="text-xs text-[#785E54]">
                    Cada casal e madrinha solteira tem seu convite personalizado com a cor exata do traje.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {honorees.map((h) => renderHonoreeCard(h))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs">
                <span className="text-xs text-[#B8005C] font-serif font-bold uppercase">
                  Fotos dos Noivos
                </span>
                <p className="font-serif text-3xl font-bold text-[#3D2C24] mt-1 tabular-nums">
                  {uploadedCount} / {totalSlots}
                </p>
                <span className="text-xs text-[#785E54] mt-1 block">
                  {missingSlots.length > 0
                    ? `Faltam ${missingSlots.length} fotos para completar`
                    : 'Todas as fotos enviadas!'}
                </span>
              </div>

              <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs">
                <span className="text-xs text-[#D94E00] font-serif font-bold uppercase">
                  Presentes Escolhidos
                </span>
                <p className="font-serif text-3xl font-bold text-[#C80064] mt-1 tabular-nums">
                  {adminGifts.filter((g) => g.isChosen).length} / {adminGifts.length}
                </p>
                <span className="text-xs text-[#785E54] mt-1 block">
                  Nomes dos doadores mantidos em sigilo
                </span>
              </div>

              <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs">
                <span className="text-xs text-[#B8005C] font-serif font-bold uppercase">
                  Confirmados no RSVP
                </span>
                <p className="font-serif text-3xl font-bold text-[#3D2C24] mt-1 tabular-nums">
                  {adminRsvps
                    .filter((r) => r.attending)
                    .reduce((acc, r) => acc + (r.guestsCount || 1), 0)}{' '}
                  pessoas
                </p>
                <span className="text-xs text-[#785E54] mt-1 block">
                  {adminRsvps.filter((r) => r.attending).length} confirmações aceitas
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DEDICATED PADRINHOS & MADRINHAS MANAGEMENT + PREVIEW */}
        {activeTab === 'honorees' && (
          <div className="space-y-6">
            <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#3D2C24]">
                  Convites Exclusivos · Padrinhos e Madrinhas
                </h2>
                <p className="text-xs text-[#785E54]">
                  Visualize exatamente como cada convidado especial verá o convite e envie pelo WhatsApp com 1 clique.
                </p>
              </div>
              <button
                onClick={() => setShowAddHonoreeModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 btn-pink-coral rounded-xl text-xs font-serif font-bold shadow-sm shrink-0 self-start sm:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Padrinho / Madrinha</span>
              </button>
            </div>

            {/* Group 1: 2 Casais - Cinza Claro e Pink */}
            <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#EFE0E5] pb-2.5">
                <span className="w-3 h-3 rounded-full bg-[#9CA3AF]" />
                <span className="w-3 h-3 rounded-full bg-[#EC008C]" />
                <h3 className="font-serif font-bold text-base text-[#3D2C24]">
                  Casais · Cinza Claro &amp; Pink ({pinkCouples.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pinkCouples.map((h) => renderHonoreeCard(h))}
              </div>
            </div>

            {/* Group 2: 3 Casais - Cinza Claro e Laranja (Coral) */}
            <div className="bg-[#FCFBF9] border border-[#F2D9CB] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#EFE0E5] pb-2.5">
                <span className="w-3 h-3 rounded-full bg-[#9CA3AF]" />
                <span className="w-3 h-3 rounded-full bg-[#FA6800]" />
                <h3 className="font-serif font-bold text-base text-[#3D2C24]">
                  Casais · Cinza Claro &amp; Laranja / Coral ({coralCouples.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {coralCouples.map((h) => renderHonoreeCard(h))}
              </div>
            </div>

            {/* Group 3: Solteiras */}
            <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#EFE0E5] pb-2.5">
                <span className="w-3 h-3 rounded-full bg-[#EC008C]" />
                <span className="w-3 h-3 rounded-full bg-[#FA6800]" />
                <h3 className="font-serif font-bold text-base text-[#3D2C24]">
                  Madrinhas Solteiras ({soloMadrinhas.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {soloMadrinhas.map((h) => renderHonoreeCard(h))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHOTOS MANAGER (14 SLOTS) */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-serif font-bold text-lg text-[#3D2C24]">
                  Gerenciador de Fotos dos Noivos
                </h2>
                <div className="text-xs font-serif font-bold text-[#C80064]">
                  Total de fotos necessárias: 14 ({uploadedCount} enviadas, {missingSlots.length} pendentes)
                </div>
              </div>
              <p className="text-xs text-[#785E54]">
                Aqui você faz o upload, troca e exclusão de cada uma das 14 fotos.
                Visitantes comuns <strong>nunca</strong> veem essas opções de upload.
              </p>
            </div>

            {/* Grid of the 14 Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PHOTO_SLOTS_DEF.map((slot) => {
                const photoUrl = photos[String(slot.id)];

                return (
                  <div
                    key={slot.id}
                    className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-[#3D2C24]">
                          {slot.label}
                        </span>
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FCE8F0] text-[#B8005C]">
                          {slot.page}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#785E54] font-mono">
                        {slot.aspectRatio}
                      </span>
                    </div>

                    {/* Preview Area */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-[#F5ECEF] border border-[#F0D5DC] flex items-center justify-center">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={slot.label}
                          className="w-full h-full object-cover object-[center_22%]"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#785E54] p-2 text-center">
                          <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                          <span className="text-xs font-serif">Aguardando foto</span>
                          <span className="text-[10px] opacity-75">{slot.description}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-[#785E54] line-clamp-1">
                      {slot.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#EFE0E5]">
                      <button
                        onClick={() => handleInitiateUpload(slot.id)}
                        disabled={isUploadingPhoto}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 btn-pink-coral rounded-lg text-xs font-serif font-bold shadow-2xs transition-all active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{photoUrl ? 'Trocar' : 'Enviar'}</span>
                      </button>

                      {photoUrl && (
                        <button
                          onClick={() => adminDeletePhoto(slot.id)}
                          title="Remover foto"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: GIFTS LIST & PRIVACY DETAILS */}
        {activeTab === 'gifts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#3D2C24]">
                  Gerenciamento da Lista de Presentes
                </h2>
                <p className="text-xs text-[#785E54]">
                  Veja quem presenteou, edite a lista, libere presentes ou marque como presenteado manualmente.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleDownloadCsv('/api/admin/presentes/export-csv', 'presentes-nichole-matheus.csv')
                  }
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#FCFBF9] hover:bg-[#FDF1F6] text-[#B8005C] border border-[#F2C6D8] rounded-xl text-xs font-serif font-bold shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>

                <button
                  onClick={() => setShowAddGiftModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 btn-pink-coral rounded-xl text-xs font-serif font-bold shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Presente</span>
                </button>
              </div>
            </div>

            {/* Gifts Table */}
            <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5F4] border-b border-[#EFE0E5] text-[#3D2C24] font-serif font-bold">
                    <tr>
                      <th className="p-3.5">Item</th>
                      <th className="p-3.5">Categoria</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Presenteado por</th>
                      <th className="p-3.5">Data</th>
                      <th className="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE0E5]">
                    {adminGifts.map((gift) => (
                      <tr key={gift.id} className="hover:bg-[#FDF4F7]/50">
                        <td className="p-3.5 font-bold text-[#3D2C24]">
                          {editingGiftId === gift.id ? (
                            <input
                              type="text"
                              value={editGiftForm.name}
                              onChange={(e) => setEditGiftForm({ ...editGiftForm, name: e.target.value })}
                              className="px-2 py-1 bg-white border border-[#EAD4DC] rounded text-[11px] w-full min-w-[140px]"
                            />
                          ) : (
                            gift.name
                          )}
                        </td>
                        <td className="p-3.5 text-[#785E54]">
                          {editingGiftId === gift.id ? (
                            <input
                              type="text"
                              value={editGiftForm.category}
                              onChange={(e) => setEditGiftForm({ ...editGiftForm, category: e.target.value })}
                              className="px-2 py-1 bg-white border border-[#EAD4DC] rounded text-[11px] w-24"
                            />
                          ) : (
                            gift.category || 'Casa'
                          )}
                        </td>
                        <td className="p-3.5">
                          {gift.isChosen ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FDF1F6] text-[#B8005C] font-bold border border-[#F2C6D8]">
                              Presenteado 💛
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                              Disponível
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-semibold text-[#C80064]">
                          {gift.reservedBy || '—'}
                        </td>
                        <td className="p-3.5 text-[#785E54]">
                          {gift.reservedAt
                            ? new Date(gift.reservedAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          {gift.isChosen ? (
                            <button
                              onClick={() => adminReleaseGift(gift.id)}
                              className="px-2.5 py-1 bg-[#FFF0E2] hover:bg-[#FFE3C9] text-[#D94E00] rounded font-serif font-bold"
                              title="Liberar presente de volta para a lista pública"
                            >
                              Liberar
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="Nome para marcar"
                                value={manualDonorName[gift.id] || ''}
                                onChange={(e) =>
                                  setManualDonorName({ ...manualDonorName, [gift.id]: e.target.value })
                                }
                                className="px-2 py-1 bg-white border border-[#EAD4DC] rounded text-[11px] w-28"
                              />
                              <button
                                onClick={() => {
                                  const donor = manualDonorName[gift.id] || 'Presente marcado pelo admin';
                                  adminMarkGift(gift.id, donor);
                                }}
                                className="px-2 py-1 btn-pink-coral rounded font-serif font-bold"
                              >
                                Marcar
                              </button>
                            </div>
                          )}

                          {editingGiftId === gift.id ? (
                            <>
                              <button
                                onClick={async () => {
                                  if (!editGiftForm.name.trim()) return;
                                  await adminUpdateGift(gift.id, {
                                    name: editGiftForm.name.trim(),
                                    category: editGiftForm.category.trim() || 'Casa',
                                  });
                                  setEditingGiftId(null);
                                }}
                                className="px-2 py-1 bg-emerald-600 text-white rounded font-serif font-bold"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditingGiftId(null)}
                                className="px-2 py-1 bg-[#F0E6EA] text-[#785E54] rounded font-serif font-bold"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingGiftId(gift.id);
                                setEditGiftForm({ name: gift.name, category: gift.category || 'Casa' });
                              }}
                              className="px-2 py-1 bg-[#F4EAEF] text-[#B8005C] rounded font-serif font-bold"
                              title="Editar nome e categoria"
                            >
                              Editar
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`Excluir "${gift.name}" da lista?`)) adminDeleteGift(gift.id);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Excluir item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit History Log */}
            {adminHistory.length > 0 && (
              <div className="bg-[#FAF5F4] border border-[#EFE0E5] rounded-2xl p-4 shadow-xs space-y-2">
                <span className="text-xs font-serif font-bold text-[#3D2C24] block">
                  Histórico de Presentes (escolhas e liberações)
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1 text-[11px] text-[#785E54]">
                  {adminHistory.slice().reverse().map((h, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-[#EFE0E5]">
                      <span>
                        <strong>
                          {h.action === 'RESERVE'
                            ? 'Presenteado:'
                            : h.action === 'ADMIN_MANUAL_RESERVE'
                              ? 'Marcado pelo admin:'
                              : 'Liberação:'}
                        </strong>{' '}
                        {h.giftName}{' '}
                        {h.guestName
                          ? `por ${h.guestName}`
                          : (h as any).previousDonor
                            ? `(era de ${(h as any).previousDonor})`
                            : ''}
                      </span>
                      <span className="text-[#9E8B80]">
                        {new Date(h.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: RSVPS */}
        {activeTab === 'rsvps' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#3D2C24]">
                  Confirmações de Presença (RSVP)
                </h2>
                <p className="text-xs text-[#785E54]">
                  Total de respostas: {adminRsvps.length} convidados
                </p>
              </div>

              <button
                onClick={() =>
                  handleDownloadCsv(
                    '/api/admin/presenca/export-csv',
                    'confirmacoes-presenca-nichole-matheus.csv'
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-2 btn-pink-coral rounded-xl text-xs font-serif font-bold shadow-2xs self-start sm:self-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV de Presença</span>
              </button>
            </div>

            <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5F4] border-b border-[#EFE0E5] text-[#3D2C24] font-serif font-bold">
                    <tr>
                      <th className="p-3.5">Data</th>
                      <th className="p-3.5">Convidado</th>
                      <th className="p-3.5">Presença</th>
                      <th className="p-3.5">Pessoas</th>
                      <th className="p-3.5">Acompanhantes</th>
                      <th className="p-3.5">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE0E5]">
                    {adminRsvps.map((r) => (
                      <tr key={r.id} className="hover:bg-[#FDF4F7]/50">
                        <td className="p-3.5 text-[#785E54]">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="p-3.5 font-bold text-[#3D2C24]">{r.name}</td>
                        <td className="p-3.5">
                          {r.attending ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                              Confirmou SIM
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-800 font-bold border border-red-200">
                              Não comparecerá
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-bold tabular-nums">
                          {r.attending ? r.guestsCount || 1 : 0}
                        </td>
                        <td className="p-3.5 text-[#5A463C]">
                          {r.companionNames || '—'}
                        </td>
                        <td className="p-3.5 text-[#5A463C] max-w-xs truncate" title={r.message}>
                          {r.message || '—'}
                        </td>
                      </tr>
                    ))}
                    {adminRsvps.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#785E54] font-serif">
                          Nenhuma confirmação de presença recebida até o momento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & TEXTS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#3D2C24]">
                  Editar Textos e Dados do Casamento
                </h2>
                <p className="text-xs text-[#785E54]">
                  Altere nomes, horários, local, mensagens e paletas de cores.
                </p>
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 btn-pink-coral rounded-xl text-xs font-serif font-bold shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>

            {savedSettingsNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Alterações salvas com sucesso no servidor!</span>
              </div>
            )}

            {/* General Info */}
            <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-4">
              <span className="font-serif font-bold text-sm text-[#3D2C24] block">
                Dados Principais
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Nome dos Noivos
                  </label>
                  <input
                    type="text"
                    value={settingsForm.coupleNames}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, coupleNames: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Data do Casamento
                  </label>
                  <input
                    type="date"
                    value={settingsForm.weddingDate}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, weddingDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Horário de Chegada
                  </label>
                  <input
                    type="text"
                    value={settingsForm.arrivalTime}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, arrivalTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Horário da Cerimônia
                  </label>
                  <input
                    type="text"
                    value={settingsForm.ceremonyTime}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, ceremonyTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Nome do Local
                  </label>
                  <input
                    type="text"
                    value={settingsForm.locationName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, locationName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={settingsForm.locationAddress}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, locationAddress: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2 bg-[#FAF5F4] border border-[#EFE0E5] rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#3D2C24]">
                      <MapPin className="w-4 h-4 text-[#EC008C]" />
                      <span>Localização no Google Maps (Link ou Coordenadas)</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${settingsForm.locationName || ''} ${settingsForm.locationAddress || ''}`.trim() || 'Sítio Aguilera'
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FCFBF9] hover:bg-[#FDF1F6] text-[#B8005C] border border-[#F2C6D8] rounded-lg text-[11px] font-serif font-bold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Abrir Google Maps p/ Buscar</span>
                      </a>
                      {settingsForm.googleMapsUrl && (
                        <a
                          href={settingsForm.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FCFBF9] hover:bg-[#FFF4EA] text-[#D94E00] border border-[#F7D1B3] rounded-lg text-[11px] font-serif font-bold"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Testar Link Salvo</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans font-semibold text-[#6B534B] mb-1">
                      Cole aqui o link de compartilhamento do Google Maps:
                    </label>
                    <input
                      type="url"
                      placeholder="https://maps.app.goo.gl/... ou https://maps.google.com/..."
                      value={settingsForm.googleMapsUrl}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FCFBF9] border border-[#EAD4DC] rounded-lg text-xs font-mono"
                    />
                  </div>

                  {/* Quick helpers: Coordinates or Generate from Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Ou cole Lat, Long (ex: -13.021, -57.094)"
                        value={coordsInput}
                        onChange={(e) => setCoordsInput(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-[#FCFBF9] border border-[#EAD4DC] rounded-lg text-[11px] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const cleaned = coordsInput.replace(/\s+/g, '');
                          if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(cleaned)) {
                            setSettingsForm({
                              ...settingsForm,
                              googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${cleaned}`,
                            });
                          }
                        }}
                        className="px-2.5 py-1.5 btn-pink-coral rounded-lg text-[11px] font-serif font-bold shrink-0"
                      >
                        Aplicar Pin
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const query = `${settingsForm.locationName || ''} ${settingsForm.locationAddress || ''}`.trim();
                        if (query) {
                          setSettingsForm({
                            ...settingsForm,
                            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
                          });
                        }
                      }}
                      className="px-3 py-1.5 bg-[#FCFBF9] hover:bg-[#FDF1F6] text-[#3D2C24] border border-[#EAD4DC] rounded-lg text-[11px] font-serif font-bold text-center"
                    >
                      Gerar Link pelo Nome e Endereço
                    </button>
                  </div>

                  <p className="text-[11px] text-[#785E54] leading-relaxed">
                    Dica para sítio/área rural: clique em <strong>Abrir Google Maps p/ Buscar</strong>, toque ou clique com o botão direito exatamente na porteira do <strong>Sítio Aguilera</strong>, copie o link de compartilhar (ou os números de latitude e longitude) e cole acima antes de salvar.
                  </p>
                </div>
              </div>
            </div>

            {/* Pix Settings */}
            <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-4">
              <span className="font-serif font-bold text-sm text-[#3D2C24] block">
                Chave Pix para Presentes
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Chave Pix (E-mail / Telefone / CPF / Aleatória)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.pixKey}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, pixKey: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Favorecido e Banco
                  </label>
                  <input
                    type="text"
                    value={settingsForm.pixRecipient}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, pixRecipient: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Padrinhos & Madrinhas Messages */}
            <div className="bg-[#FCFBF9] border border-[#F0D5DC] rounded-2xl p-5 shadow-xs space-y-4">
              <span className="font-serif font-bold text-sm text-[#3D2C24] block">
                Mensagens Especiais dos Padrinhos e Madrinhas
              </span>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Mensagem de Agradecimento aos Padrinhos
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.groomsmenMessage}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, groomsmenMessage: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Orientações e Traje dos Padrinhos
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.groomsmenGuidelines}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, groomsmenGuidelines: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Mensagem de Agradecimento às Madrinhas
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.bridesmaidsMessage}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, bridesmaidsMessage: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Orientações e Traje das Madrinhas
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.bridesmaidsGuidelines}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, bridesmaidsGuidelines: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                {/* Palette toggles */}
                <div className="pt-2">
                  <span className="block text-xs font-serif font-bold text-[#3D2C24] mb-2">
                    Paletas das Madrinhas Ativas
                  </span>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-serif font-bold text-[#B8005C]">
                      <input
                        type="checkbox"
                        checked={settingsForm.palettes?.pink?.enabled}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            palettes: {
                              ...settingsForm.palettes,
                              pink: {
                                ...settingsForm.palettes.pink,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }
                        className="w-4 h-4 rounded accent-[#EC008C]"
                      />
                      <span>Paleta Pink (#EC008C, #F50087, #E3006C)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-serif font-bold text-[#D94E00]">
                      <input
                        type="checkbox"
                        checked={settingsForm.palettes?.coral?.enabled}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            palettes: {
                              ...settingsForm.palettes,
                              coral: {
                                ...settingsForm.palettes.coral,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }
                        className="w-4 h-4 rounded accent-[#FA6800]"
                      />
                      <span>Paleta Coral (#F59306, #FA6800, #F2380F)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 btn-pink-coral font-serif font-bold text-sm rounded-xl shadow-md transition-all"
            >
              Salvar Todas as Configurações
            </button>
          </form>
        )}

        {/* LIVE INVITE PREVIEW MODAL (Shows exact layout of Padrinhos / Madrinhas / Individual Invite) */}
        {previewTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md h-[90dvh] bg-[#F4F1EF] border border-[#F0D5DC] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              {/* Top Preview Action Bar */}
              <div className="bg-[#FCFBF9] border-b border-[#EFE0E5] px-4 py-3 flex items-center justify-between gap-2 shrink-0">
                <div className="min-w-0">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#B8005C] block">
                    Pré-visualização do Convite
                  </span>
                  <h3 className="font-serif font-bold text-sm text-[#3D2C24] truncate">
                    {previewTarget.kind === 'honoree'
                      ? previewTarget.honoree.names
                      : previewTarget.kind === 'padrinhos'
                      ? 'Página dos Padrinhos'
                      : 'Página das Madrinhas'}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {previewTarget.kind === 'honoree' && (
                    <>
                      <button
                        onClick={() =>
                          handleCopy(
                            `${origin}/convite/${previewTarget.honoree.slug}`,
                            `modal-${previewTarget.honoree.id}`
                          )
                        }
                        className="flex items-center gap-1 px-2.5 py-1.5 btn-pink-coral rounded-lg text-[11px] font-serif font-bold"
                      >
                        {copiedKey === `modal-${previewTarget.honoree.id}` ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === `modal-${previewTarget.honoree.id}` ? 'Copiado' : 'Link'}</span>
                      </button>
                      <a
                        href={buildWhatsAppUrl(previewTarget.honoree)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#25D366] text-white rounded-lg text-[11px] font-sans font-bold"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </>
                  )}
                  {onNavigate && (
                    <button
                      onClick={() => {
                        const targetPath =
                          previewTarget.kind === 'honoree'
                            ? `/convite/${previewTarget.honoree.slug}`
                            : previewTarget.kind === 'padrinhos'
                            ? '/padrinhos'
                            : '/madrinhas';
                        setPreviewTarget(null);
                        onNavigate(targetPath);
                      }}
                      title="Abrir em página inteira"
                      className="p-1.5 bg-[#FAF5F4] text-[#3D2C24] border border-[#EAD4DC] rounded-lg hover:bg-[#FDF1F6]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setPreviewTarget(null)}
                    aria-label="Fechar pré-visualização"
                    className="w-8 h-8 rounded-full bg-[#FCE8F0] text-[#B8005C] flex items-center justify-center hover:bg-[#F9D6E5]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Live Invite Preview Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {previewTarget.kind === 'honoree' && (
                  <SpecialInvitePage
                    honoreeOverride={previewTarget.honoree}
                    onNavigate={(p) => {
                      setPreviewTarget(null);
                      if (onNavigate) onNavigate(p);
                    }}
                    embeddedPreview
                  />
                )}
                {previewTarget.kind === 'padrinhos' && (
                  <GroomsmenPage
                    onNavigate={(p) => {
                      setPreviewTarget(null);
                      if (onNavigate) onNavigate(p);
                    }}
                  />
                )}
                {previewTarget.kind === 'madrinhas' && (
                  <BridesmaidsPage
                    onNavigate={(p) => {
                      setPreviewTarget(null);
                      if (onNavigate) onNavigate(p);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Honoree */}
        {showAddHonoreeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setShowAddHonoreeModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FCE8F0] text-[#B8005C] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-serif font-bold text-lg text-[#3D2C24]">
                Novo Convite Exclusivo
              </h3>

              <form onSubmit={handleAddHonoree} className="space-y-3">
                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Nome(s) do Casal ou Madrinha *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria & João ou Camila"
                    value={newHonoreeNames}
                    onChange={(e) => setNewHonoreeNames(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Tipo de Convite
                  </label>
                  <select
                    value={newHonoreeType}
                    onChange={(e) => setNewHonoreeType(e.target.value as 'couple' | 'bridesmaid')}
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  >
                    <option value="couple">Casal (Padrinho Cinza Claro + Madrinha)</option>
                    <option value="bridesmaid">Madrinha Solteira</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Cor do Vestido da Madrinha
                  </label>
                  <select
                    value={newHonoreeColor}
                    onChange={(e) => setNewHonoreeColor(e.target.value as 'pink' | 'coral')}
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  >
                    <option value="pink">Pink (#EC008C)</option>
                    <option value="coral">Laranja / Coral (#FA6800)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 btn-pink-coral font-serif font-bold text-xs rounded-xl shadow-sm mt-2"
                >
                  Gerar Link Personalizado
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Custom Gift */}
        {showAddGiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-[#FCFBF9] border border-[#F0D5DC] rounded-3xl p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setShowAddGiftModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FCE8F0] text-[#B8005C] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-serif font-bold text-lg text-[#3D2C24]">
                Novo Presente na Lista
              </h3>

              <form onSubmit={handleCreateGift} className="space-y-3">
                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Nome do Item *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jogo de Cama ou Aparelho de Jantar"
                    value={newGiftName}
                    onChange={(e) => setNewGiftName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Categoria
                  </label>
                  <select
                    value={newGiftCategory}
                    onChange={(e) => setNewGiftCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  >
                    <option value="Casa">Casa</option>
                    <option value="Cozinha">Cozinha</option>
                    <option value="Eletrodomésticos">Eletrodomésticos</option>
                    <option value="Sala">Sala</option>
                    <option value="Quarto">Quarto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#3D2C24] mb-1">
                    Ícone
                  </label>
                  <select
                    value={newGiftIcon}
                    onChange={(e) => setNewGiftIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF5F4] border border-[#EAD4DC] rounded-lg text-xs"
                  >
                    <option value="gift">Presente Padrão</option>
                    <option value="utensils">Cozinha / Utensílios</option>
                    <option value="coffee">Batedeira / Café</option>
                    <option value="tv">TV / Eletrônicos</option>
                    <option value="sparkles">Lavagem / Limpeza</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 btn-pink-coral font-serif font-bold text-xs rounded-xl shadow-sm mt-2"
                >
                  Cadastrar Presente
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
