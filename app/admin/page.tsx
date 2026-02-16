"use client";

import { useState, useEffect, useCallback } from "react";
import type { MenuItem } from "@/data/menu";
import type { Wine } from "@/data/wines";
import type { SiteContent } from "@/data/content";

type Lang = "fr" | "en" | "de" | "lb";
const LANGS: Lang[] = ["fr", "en", "de", "lb"];
const LANG_LABELS: Record<Lang, string> = { fr: "Français", en: "English", de: "Deutsch", lb: "Lëtzebuergesch" };
const WINE_CATS = ["red", "white", "rosé", "orange", "sparkling"] as const;
const MENU_CATS = ["starters", "platters", "mains", "desserts", "specials"] as const;

type Tab = "menu" | "wines" | "content";

function emptyLR(): Record<Lang, string> {
  return { fr: "", en: "", de: "", lb: "" };
}

function newMenuItem(): MenuItem {
  return { id: `item-${Date.now()}`, category: "starters", name: emptyLR(), description: emptyLR(), price: 0, isAvailable: true };
}

function newWine(): Wine {
  return { id: `wine-${Date.now()}`, name: "", region: "", country: "", grape: "", category: "red", description: emptyLR(), priceGlass: 0, priceBottle: 0, priceShop: 0, image: "", isAvailable: true, isFeatured: false, isOrganic: false, isBiodynamic: false };
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("menu");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [wines, setWines] = useState<Wine[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");

  const headers = useCallback(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }), [token]);

  const loadData = useCallback(async () => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    const [m, w, c] = await Promise.all([
      fetch("/api/admin/data?type=menu", { headers: h }).then(r => r.json()),
      fetch("/api/admin/data?type=wines", { headers: h }).then(r => r.json()),
      fetch("/api/admin/data?type=content", { headers: h }).then(r => r.json()),
    ]);
    setMenu(m);
    setWines(w);
    setContent(c);
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const save = async (type: string, data: unknown) => {
    setSaving(true);
    await fetch("/api/admin/data", { method: "POST", headers: headers(), body: JSON.stringify({ type, data }) });
    setSaving(false);
    setSaved(type);
    setTimeout(() => setSaved(""), 2000);
  };

  const login = async () => {
    setError("");
    const res = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await res.json();
    if (data.token) { setToken(data.token); } else { setError("Mot de passe incorrect"); }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-sepia flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur p-8 rounded-lg shadow-lg max-w-sm w-full">
          <h1 className="font-playfair text-2xl text-ink mb-1 text-center">Vins Fins</h1>
          <p className="text-stone text-sm text-center mb-6">Administration</p>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            className="w-full border border-stone/30 rounded px-3 py-2 mb-3 bg-sepia/50 text-ink placeholder:text-stone/50 focus:border-wine"
          />
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <button onClick={login} className="w-full bg-wine text-white py-2 rounded hover:bg-wine/90 transition font-medium">
            Connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sepia">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-3xl text-ink">Administration</h1>
            <p className="text-stone text-sm">Vins Fins — Gestion du contenu</p>
          </div>
          <button onClick={() => setToken("")} className="text-stone hover:text-wine text-sm transition">Déconnexion</button>
        </div>

        <div className="flex gap-1 mb-6 border-b border-stone/20">
          {(["menu", "wines", "content"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${tab === t ? "border-wine text-wine" : "border-transparent text-stone hover:text-ink"}`}
            >
              {t === "menu" ? "🍽 Carte" : t === "wines" ? "🍷 Vins" : "📝 Contenu"}
            </button>
          ))}
        </div>

        {saving && <div className="text-stone text-sm mb-2">Enregistrement...</div>}
        {saved && <div className="text-green-700 text-sm mb-2">✓ {saved} sauvegardé</div>}

        {tab === "menu" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-playfair text-xl text-ink">Carte</h2>
              <button onClick={() => setMenu([...menu, newMenuItem()])} className="bg-wine text-white px-3 py-1.5 rounded text-sm hover:bg-wine/90 transition">+ Ajouter</button>
            </div>
            <div className="space-y-4">
              {menu.map((item, i) => (
                <div key={item.id} className="bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm border border-stone/10">
                  <div className="flex gap-3 mb-3 flex-wrap items-center">
                    <select value={item.category} onChange={e => { const m = [...menu]; m[i] = { ...item, category: e.target.value as MenuItem["category"] }; setMenu(m); }} className="border border-stone/30 rounded px-2 py-1 text-sm bg-sepia/50">
                      {MENU_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="number" value={item.price} onChange={e => { const m = [...menu]; m[i] = { ...item, price: Number(e.target.value) }; setMenu(m); }} className="border border-stone/30 rounded px-2 py-1 text-sm w-20 bg-sepia/50" placeholder="Prix €" />
                    <label className="flex items-center gap-1 text-sm text-stone">
                      <input type="checkbox" checked={item.isAvailable} onChange={e => { const m = [...menu]; m[i] = { ...item, isAvailable: e.target.checked }; setMenu(m); }} />
                      Disponible
                    </label>
                    <button onClick={() => setMenu(menu.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 text-sm ml-auto">Supprimer</button>
                  </div>
                  {LANGS.map(lang => (
                    <div key={lang} className="grid grid-cols-[80px_1fr_2fr] gap-2 mb-1 items-center">
                      <span className="text-xs text-stone font-medium uppercase">{LANG_LABELS[lang]}</span>
                      <input value={item.name[lang]} onChange={e => { const m = [...menu]; m[i] = { ...item, name: { ...item.name, [lang]: e.target.value } }; setMenu(m); }} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30" placeholder="Nom" />
                      <input value={item.description[lang]} onChange={e => { const m = [...menu]; m[i] = { ...item, description: { ...item.description, [lang]: e.target.value } }; setMenu(m); }} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30" placeholder="Description" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button onClick={() => save("menu", menu)} className="mt-4 bg-wine text-white px-6 py-2 rounded hover:bg-wine/90 transition font-medium">Sauvegarder la Carte</button>
          </div>
        )}

        {tab === "wines" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-playfair text-xl text-ink">Carte des Vins</h2>
              <button onClick={() => setWines([...wines, newWine()])} className="bg-wine text-white px-3 py-1.5 rounded text-sm hover:bg-wine/90 transition">+ Ajouter</button>
            </div>
            <div className="space-y-4">
              {wines.map((wine, i) => (
                <div key={wine.id} className="bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm border border-stone/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <input value={wine.name} onChange={e => { const w = [...wines]; w[i] = { ...wine, name: e.target.value }; setWines(w); }} className="border border-stone/30 rounded px-2 py-1 text-sm bg-sepia/50 col-span-2" placeholder="Nom du vin" />
                    <input value={wine.region} onChange={e => { const w = [...wines]; w[i] = { ...wine, region: e.target.value }; setWines(w); }} className="border border-stone/30 rounded px-2 py-1 text-sm bg-sepia/50" placeholder="Région" />
                    <input value={wine.country} onChange={e => { const w = [...wines]; w[i] = { ...wine, country: e.target.value }; setWines(w); }} className="border border-stone/30 rounded px-2 py-1 text-sm bg-sepia/50" placeholder="Pays" />
                    <input value={wine.grape} onChange={e => { const w = [...wines]; w[i] = { ...wine, grape: e.target.value }; setWines(w); }} className="border border-stone/30 rounded px-2 py-1 text-sm bg-sepia/50 col-span-2" placeholder="Cépage" />
                    <select value={wine.category} onChange={e => { const w = [...wines]; w[i] = { ...wine, category: e.target.value as Wine["category"] }; setWines(w); }} className="border border-stone/30 rounded px-2 py-1 text-sm bg-sepia/50">
                      {WINE_CATS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input value={wine.image} onChange={e => { const w = [...wines]; w[i] = { ...wine, image: e.target.value }; setWines(w); }} className="border border-stone/30 rounded px-2 py-1 text-sm bg-sepia/50" placeholder="Image URL" />
                  </div>
                  <div className="flex gap-2 mb-3 flex-wrap items-center">
                    <label className="text-sm text-stone">Verre €</label>
                    <input type="number" value={wine.priceGlass} onChange={e => { const w = [...wines]; w[i] = { ...wine, priceGlass: Number(e.target.value) }; setWines(w); }} className="border border-stone/30 rounded px-2 py-1 text-sm w-20 bg-sepia/50" />
                    <label className="text-sm text-stone">Bouteille €</label>
                    <input type="number" value={wine.priceBottle} onChange={e => { const w = [...wines]; w[i] = { ...wine, priceBottle: Number(e.target.value) }; setWines(w); }} className="border border-stone/30 rounded px-2 py-1 text-sm w-20 bg-sepia/50" />
                    <label className="text-sm text-stone">Boutique €</label>
                    <input type="number" value={wine.priceShop} onChange={e => { const w = [...wines]; w[i] = { ...wine, priceShop: Number(e.target.value) }; setWines(w); }} className="border border-stone/30 rounded px-2 py-1 text-sm w-20 bg-sepia/50" />
                    <label className="flex items-center gap-1 text-sm text-stone"><input type="checkbox" checked={wine.isAvailable} onChange={e => { const w = [...wines]; w[i] = { ...wine, isAvailable: e.target.checked }; setWines(w); }} /> Dispo</label>
                    <label className="flex items-center gap-1 text-sm text-stone"><input type="checkbox" checked={wine.isFeatured} onChange={e => { const w = [...wines]; w[i] = { ...wine, isFeatured: e.target.checked }; setWines(w); }} /> ⭐</label>
                    <label className="flex items-center gap-1 text-sm text-stone"><input type="checkbox" checked={wine.isOrganic} onChange={e => { const w = [...wines]; w[i] = { ...wine, isOrganic: e.target.checked }; setWines(w); }} /> Bio</label>
                    <label className="flex items-center gap-1 text-sm text-stone"><input type="checkbox" checked={wine.isBiodynamic} onChange={e => { const w = [...wines]; w[i] = { ...wine, isBiodynamic: e.target.checked }; setWines(w); }} /> Biodyn</label>
                    <button onClick={() => setWines(wines.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 text-sm ml-auto">Supprimer</button>
                  </div>
                  {LANGS.map(lang => (
                    <div key={lang} className="grid grid-cols-[80px_1fr] gap-2 mb-1 items-center">
                      <span className="text-xs text-stone font-medium uppercase">{LANG_LABELS[lang]}</span>
                      <input value={wine.description[lang]} onChange={e => { const w = [...wines]; w[i] = { ...wine, description: { ...wine.description, [lang]: e.target.value } }; setWines(w); }} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30" placeholder="Description" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button onClick={() => save("wines", wines)} className="mt-4 bg-wine text-white px-6 py-2 rounded hover:bg-wine/90 transition font-medium">Sauvegarder les Vins</button>
          </div>
        )}

        {tab === "content" && content && (
          <div className="space-y-6">
            <h2 className="font-playfair text-xl text-ink">Contenu du Site</h2>

            <fieldset className="bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm border border-stone/10">
              <legend className="font-playfair text-lg text-wine px-2">Hero Tagline</legend>
              {LANGS.map(lang => (
                <div key={lang} className="grid grid-cols-[80px_1fr] gap-2 mb-1 items-center">
                  <span className="text-xs text-stone font-medium uppercase">{LANG_LABELS[lang]}</span>
                  <input value={content.heroTagline[lang]} onChange={e => setContent({ ...content, heroTagline: { ...content.heroTagline, [lang]: e.target.value } })} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30" />
                </div>
              ))}
            </fieldset>

            <fieldset className="bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm border border-stone/10">
              <legend className="font-playfair text-lg text-wine px-2">Horaires</legend>
              {LANGS.map(lang => (
                <div key={lang} className="mb-2">
                  <span className="text-xs text-stone font-medium uppercase block mb-1">{LANG_LABELS[lang]}</span>
                  <input value={content.hours[lang]} onChange={e => setContent({ ...content, hours: { ...content.hours, [lang]: e.target.value } })} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30 w-full" />
                </div>
              ))}
            </fieldset>

            <fieldset className="bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm border border-stone/10">
              <legend className="font-playfair text-lg text-wine px-2">Message Fermé</legend>
              {LANGS.map(lang => (
                <div key={lang} className="grid grid-cols-[80px_1fr] gap-2 mb-1 items-center">
                  <span className="text-xs text-stone font-medium uppercase">{LANG_LABELS[lang]}</span>
                  <input value={content.closedMessage[lang]} onChange={e => setContent({ ...content, closedMessage: { ...content.closedMessage, [lang]: e.target.value } })} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30" />
                </div>
              ))}
            </fieldset>

            <fieldset className="bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm border border-stone/10">
              <legend className="font-playfair text-lg text-wine px-2">Annonce</legend>
              <p className="text-xs text-stone mb-2">Laisser vide pour désactiver</p>
              {LANGS.map(lang => (
                <div key={lang} className="grid grid-cols-[80px_1fr] gap-2 mb-1 items-center">
                  <span className="text-xs text-stone font-medium uppercase">{LANG_LABELS[lang]}</span>
                  <input value={content.announcement?.[lang] ?? ""} onChange={e => { const ann = content.announcement ? { ...content.announcement } : emptyLR(); ann[lang] = e.target.value; const allEmpty = LANGS.every(l => !ann[l]); setContent({ ...content, announcement: allEmpty ? null : ann }); }} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30" />
                </div>
              ))}
            </fieldset>

            <fieldset className="bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm border border-stone/10">
              <legend className="font-playfair text-lg text-wine px-2">Contact</legend>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-stone block mb-1">Adresse</label><input value={content.address} onChange={e => setContent({ ...content, address: e.target.value })} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30 w-full" /></div>
                <div><label className="text-xs text-stone block mb-1">Téléphone</label><input value={content.phone} onChange={e => setContent({ ...content, phone: e.target.value })} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30 w-full" /></div>
                <div><label className="text-xs text-stone block mb-1">Email</label><input value={content.email} onChange={e => setContent({ ...content, email: e.target.value })} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30 w-full" /></div>
                <div><label className="text-xs text-stone block mb-1">Zenchef ID</label><input value={content.zenchefId} onChange={e => setContent({ ...content, zenchefId: e.target.value })} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30 w-full" /></div>
                <div><label className="text-xs text-stone block mb-1">Instagram</label><input value={content.instagram} onChange={e => setContent({ ...content, instagram: e.target.value })} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30 w-full" /></div>
                <div><label className="text-xs text-stone block mb-1">Facebook</label><input value={content.facebook} onChange={e => setContent({ ...content, facebook: e.target.value })} className="border border-stone/20 rounded px-2 py-1 text-sm bg-sepia/30 w-full" /></div>
              </div>
            </fieldset>

            <button onClick={() => save("content", content)} className="bg-wine text-white px-6 py-2 rounded hover:bg-wine/90 transition font-medium">Sauvegarder le Contenu</button>
          </div>
        )}
      </div>
    </div>
  );
}
