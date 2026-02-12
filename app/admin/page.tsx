'use client';

import { useState, useEffect, useCallback } from 'react';

type Lang = 'fr' | 'en' | 'de' | 'lb';
const LANGS: Lang[] = ['fr', 'en', 'de', 'lb'];

interface MenuItem {
  id: string;
  category: 'starters' | 'platters' | 'mains' | 'desserts' | 'specials';
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  price: number;
  isAvailable: boolean;
}

interface Wine {
  id: string;
  name: string;
  region: string;
  country: string;
  grape: string;
  category: 'red' | 'white' | 'rosé' | 'orange' | 'sparkling';
  description: Record<Lang, string>;
  priceGlass: number;
  priceBottle: number;
  priceShop: number;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isOrganic: boolean;
  isBiodynamic: boolean;
}

interface SiteContent {
  hours: Record<Lang, string>;
  closedMessage: Record<Lang, string>;
  heroTagline: Record<Lang, string>;
  announcement: Record<Lang, string> | null;
  address: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  zenchefId: string;
}

type Tab = 'menu' | 'wines' | 'content';

function emptyLangRecord(): Record<Lang, string> {
  return { fr: '', en: '', de: '', lb: '' };
}

function newMenuItem(): MenuItem {
  return {
    id: `item-${Date.now()}`,
    category: 'starters',
    name: emptyLangRecord(),
    description: emptyLangRecord(),
    price: 0,
    isAvailable: true,
  };
}

function newWine(): Wine {
  return {
    id: `wine-${Date.now()}`,
    name: '',
    region: '',
    country: 'France',
    grape: '',
    category: 'red',
    description: emptyLangRecord(),
    priceGlass: 0,
    priceBottle: 0,
    priceShop: 0,
    image: '',
    isAvailable: true,
    isFeatured: false,
    isOrganic: false,
    isBiodynamic: false,
  };
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<Tab>('menu');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [wineItems, setWineItems] = useState<Wine[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const apiFetch = useCallback(async (url: string, opts?: RequestInit) => {
    return fetch(url, {
      ...opts,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...opts?.headers },
    });
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) return;
    const [menuRes, winesRes, contentRes] = await Promise.all([
      apiFetch('/api/admin/menu'),
      apiFetch('/api/admin/wines'),
      apiFetch('/api/admin/content'),
    ]);
    setMenuItems(await menuRes.json());
    setWineItems(await winesRes.json());
    setContent(await contentRes.json());
  }, [token, apiFetch]);

  useEffect(() => {
    if (token) loadData();
  }, [token, loadData]);

  const handleLogin = async () => {
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
    } else {
      setError('Invalid password');
    }
  };

  const saveMenu = async () => {
    const res = await apiFetch('/api/admin/menu', { method: 'POST', body: JSON.stringify(menuItems) });
    const data = await res.json();
    showToast(data.warning || 'Menu saved!');
  };

  const saveWines = async () => {
    const res = await apiFetch('/api/admin/wines', { method: 'POST', body: JSON.stringify(wineItems) });
    const data = await res.json();
    showToast(data.warning || 'Wines saved!');
  };

  const saveContent = async () => {
    const res = await apiFetch('/api/admin/content', { method: 'POST', body: JSON.stringify(content) });
    const data = await res.json();
    showToast(data.warning || 'Content saved!');
  };

  // === LOGIN GATE ===
  if (!token) {
    return (
      <div className="min-h-screen bg-sepia flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h1 className="font-playfair text-2xl text-ink mb-6 text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-stone/30 rounded px-3 py-2 mb-4 bg-parchment text-ink focus:outline-none focus:ring-2 focus:ring-wine/50"
          />
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button onClick={handleLogin} className="w-full bg-wine text-white py-2 rounded hover:bg-wine/90 transition">
            Login
          </button>
        </div>
      </div>
    );
  }

  // === ADMIN PANEL ===
  const inputCls = 'border border-stone/30 rounded px-2 py-1 bg-parchment text-ink text-sm w-full focus:outline-none focus:ring-1 focus:ring-wine/50';
  const btnCls = 'bg-wine text-white px-4 py-2 rounded text-sm hover:bg-wine/90 transition';
  const btnSmCls = 'bg-stone/20 text-ink px-2 py-1 rounded text-xs hover:bg-stone/30 transition';

  return (
    <div className="min-h-screen bg-sepia pt-6 px-4 pb-12">
      {toast && (
        <div className="fixed top-4 right-4 bg-wine text-white px-4 py-2 rounded shadow-lg z-50 text-sm">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-playfair text-3xl text-ink">Vins Fins Admin</h1>
          <button onClick={() => setToken('')} className="text-stone text-sm hover:text-ink">Logout</button>
        </div>

        <p className="text-stone text-xs mb-4">
          ⚠ Changes saved to local files. For production, connect a database.
        </p>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-stone/20 mb-6">
          {(['menu', 'wines', 'content'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-wine text-wine' : 'text-stone hover:text-ink'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* MENU TAB */}
        {tab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-playfair text-xl text-ink">Menu Items</h2>
              <div className="flex gap-2">
                <button onClick={() => setMenuItems([...menuItems, newMenuItem()])} className={btnSmCls}>+ Add Item</button>
                <button onClick={saveMenu} className={btnCls}>Save Menu</button>
              </div>
            </div>
            <div className="space-y-4">
              {menuItems.map((item, idx) => (
                <div key={item.id} className="bg-white p-4 rounded shadow-sm border border-stone/10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center">
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const updated = [...menuItems];
                          updated[idx] = { ...item, category: e.target.value as MenuItem['category'] };
                          setMenuItems(updated);
                        }}
                        className={inputCls + ' !w-auto'}
                      >
                        {['starters', 'platters', 'mains', 'desserts', 'specials'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-xs text-stone">
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={(e) => {
                            const updated = [...menuItems];
                            updated[idx] = { ...item, isAvailable: e.target.checked };
                            setMenuItems(updated);
                          }}
                        />
                        Available
                      </label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => {
                          const updated = [...menuItems];
                          updated[idx] = { ...item, price: Number(e.target.value) };
                          setMenuItems(updated);
                        }}
                        className={inputCls + ' !w-20'}
                        placeholder="€"
                      />
                    </div>
                    <button
                      onClick={() => setMenuItems(menuItems.filter((_, i) => i !== idx))}
                      className="text-red-500 text-xs hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGS.map((lang) => (
                      <div key={lang}>
                        <label className="text-xs text-stone uppercase">{lang} name</label>
                        <input
                          value={item.name[lang]}
                          onChange={(e) => {
                            const updated = [...menuItems];
                            updated[idx] = { ...item, name: { ...item.name, [lang]: e.target.value } };
                            setMenuItems(updated);
                          }}
                          className={inputCls}
                        />
                        <label className="text-xs text-stone uppercase mt-1 block">{lang} desc</label>
                        <input
                          value={item.description[lang]}
                          onChange={(e) => {
                            const updated = [...menuItems];
                            updated[idx] = { ...item, description: { ...item.description, [lang]: e.target.value } };
                            setMenuItems(updated);
                          }}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WINES TAB */}
        {tab === 'wines' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-playfair text-xl text-ink">Wines</h2>
              <div className="flex gap-2">
                <button onClick={() => setWineItems([...wineItems, newWine()])} className={btnSmCls}>+ Add Wine</button>
                <button onClick={saveWines} className={btnCls}>Save Wines</button>
              </div>
            </div>
            <div className="space-y-4">
              {wineItems.map((wine, idx) => (
                <div key={wine.id} className="bg-white p-4 rounded shadow-sm border border-stone/10">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium text-ink text-sm">{wine.name || '(new wine)'}</span>
                    <button
                      onClick={() => setWineItems(wineItems.filter((_, i) => i !== idx))}
                      className="text-red-500 text-xs hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                      <label className="text-xs text-stone">Name</label>
                      <input value={wine.name} onChange={(e) => { const u = [...wineItems]; u[idx] = { ...wine, name: e.target.value }; setWineItems(u); }} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-stone">Region</label>
                      <input value={wine.region} onChange={(e) => { const u = [...wineItems]; u[idx] = { ...wine, region: e.target.value }; setWineItems(u); }} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-stone">Country</label>
                      <input value={wine.country} onChange={(e) => { const u = [...wineItems]; u[idx] = { ...wine, country: e.target.value }; setWineItems(u); }} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-stone">Grape</label>
                      <input value={wine.grape} onChange={(e) => { const u = [...wineItems]; u[idx] = { ...wine, grape: e.target.value }; setWineItems(u); }} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-stone">Category</label>
                      <select value={wine.category} onChange={(e) => { const u = [...wineItems]; u[idx] = { ...wine, category: e.target.value as Wine['category'] }; setWineItems(u); }} className={inputCls}>
                        {['red', 'white', 'rosé', 'orange', 'sparkling'].map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-stone">Image URL</label>
                      <input value={wine.image} onChange={(e) => { const u = [...wineItems]; u[idx] = { ...wine, image: e.target.value }; setWineItems(u); }} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                      <label className="text-xs text-stone">€ Glass</label>
                      <input type="number" value={wine.priceGlass} onChange={(e) => { const u = [...wineItems]; u[idx] = { ...wine, priceGlass: Number(e.target.value) }; setWineItems(u); }} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-stone">€ Bottle</label>
                      <input type="number" value={wine.priceBottle} onChange={(e) => { const u = [...wineItems]; u[idx] = { ...wine, priceBottle: Number(e.target.value) }; setWineItems(u); }} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-stone">€ Shop</label>
                      <input type="number" value={wine.priceShop} onChange={(e) => { const u = [...wineItems]; u[idx] = { ...wine, priceShop: Number(e.target.value) }; setWineItems(u); }} className={inputCls} />
                    </div>
                  </div>
                  <div className="flex gap-4 mb-3 text-xs">
                    {(['isAvailable', 'isFeatured', 'isOrganic', 'isBiodynamic'] as const).map((field) => (
                      <label key={field} className="flex items-center gap-1 text-stone">
                        <input type="checkbox" checked={wine[field]} onChange={(e) => { const u = [...wineItems]; u[idx] = { ...wine, [field]: e.target.checked }; setWineItems(u); }} />
                        {field.replace('is', '')}
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGS.map((lang) => (
                      <div key={lang}>
                        <label className="text-xs text-stone uppercase">{lang} description</label>
                        <input
                          value={wine.description[lang]}
                          onChange={(e) => { const u = [...wineItems]; u[idx] = { ...wine, description: { ...wine.description, [lang]: e.target.value } }; setWineItems(u); }}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENT TAB */}
        {tab === 'content' && content && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-playfair text-xl text-ink">Site Content</h2>
              <button onClick={saveContent} className={btnCls}>Save Content</button>
            </div>
            <div className="space-y-6">
              {/* Multilingual fields */}
              {(['hours', 'closedMessage', 'heroTagline'] as const).map((field) => (
                <div key={field} className="bg-white p-4 rounded shadow-sm border border-stone/10">
                  <h3 className="font-medium text-ink text-sm mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1')}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGS.map((lang) => (
                      <div key={lang}>
                        <label className="text-xs text-stone uppercase">{lang}</label>
                        <input
                          value={(content[field] as Record<Lang, string>)[lang]}
                          onChange={(e) => setContent({ ...content, [field]: { ...(content[field] as Record<Lang, string>), [lang]: e.target.value } })}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Announcement (nullable) */}
              <div className="bg-white p-4 rounded shadow-sm border border-stone/10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-ink text-sm">Announcement</h3>
                  <label className="flex items-center gap-1 text-xs text-stone">
                    <input
                      type="checkbox"
                      checked={content.announcement !== null}
                      onChange={(e) => setContent({ ...content, announcement: e.target.checked ? emptyLangRecord() : null })}
                    />
                    Active
                  </label>
                </div>
                {content.announcement && (
                  <div className="grid grid-cols-2 gap-2">
                    {LANGS.map((lang) => (
                      <div key={lang}>
                        <label className="text-xs text-stone uppercase">{lang}</label>
                        <input
                          value={content.announcement![lang]}
                          onChange={(e) => setContent({ ...content, announcement: { ...content.announcement!, [lang]: e.target.value } })}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Simple fields */}
              <div className="bg-white p-4 rounded shadow-sm border border-stone/10">
                <h3 className="font-medium text-ink text-sm mb-2">Contact Info</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['address', 'phone', 'email', 'instagram', 'facebook', 'zenchefId'] as const).map((field) => (
                    <div key={field}>
                      <label className="text-xs text-stone capitalize">{field}</label>
                      <input
                        value={content[field]}
                        onChange={(e) => setContent({ ...content, [field]: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
