'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, Menu, Camera, MessageSquare, UploadCloud, 
  Image as ImageIcon, ShieldCheck, Cpu, Truck, ChevronsLeftRight, 
  ArrowUpRight, X, Compass, Hammer, RefreshCcw, MapPin, 
  Phone, User, Bot, ChevronRight, ArrowUp 
} from 'lucide-react';
import Image from 'next/image';

// --- CONFIG & SYSTEM INSTRUCTIONS ---
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const CATALOG_ITEMS = [
  { id: 1, category: 'tiles', name: 'Floor & Wall Tiles', subtitle: 'Ceramic & Porcelain', desc: 'Premium grade ceramic and porcelain tiles perfect for high-traffic environments. Extremely durable, water-resistant, and available in over 100 textures.', price: '$5.50 - $12.00 / sq.ft.', img: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=800&q=80' },
  { id: 2, category: 'tiles', name: 'Backsplash Tiles', subtitle: 'Kitchen & Bath', desc: 'Designer backsplash tiles formulated for kitchen and bath environments. Heat-resistant and easy to clean, adding a premium architectural touch to any wall.', price: '$8.00 - $18.00 / sq.ft.', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80' },
  { id: 3, category: 'tiles', name: 'Mosaic Tiles', subtitle: 'Intricate Details', desc: 'Intricate, hand-placed mosaic sheets. Perfect for shower floors, feature walls, or high-contrast modern accents. Slip-resistant finishes available.', price: '$12.00 - $25.00 / sq.ft.', img: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?auto=format&fit=crop&w=800&q=80' },
  { id: 4, category: 'vinyl', name: 'Vinyl Planks', subtitle: 'Waterproof Core', desc: '100% waterproof luxury vinyl plank (LVP). Features an ultra-durable wear layer ideal for basements, commercial spaces, and active family homes.', price: '$3.50 - $7.00 / sq.ft.', img: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80' },
  { id: 5, category: 'vinyl', name: 'Premium Laminate', subtitle: 'High Durability', desc: 'High-density fiberboard (HDF) core laminate. Offers the most authentic hardwood visual with superior scratch and dent resistance compared to real wood.', price: '$2.50 - $5.50 / sq.ft.', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80' },
  { id: 6, category: 'vinyl', name: 'Vinyl Tiles & Loose Lay', subtitle: 'Commercial & Residential', desc: 'Heavy-duty vinyl format for rapid commercial installation. Features a specialized friction backing that requires minimal adhesive.', price: '$4.00 - $8.50 / sq.ft.', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
  { id: 7, category: 'accessories', name: 'Doors & Locks', subtitle: 'Hardware & Entrances', desc: 'Architectural interior doors available in solid wood, hollow core, and fire-rated options. Complete with premium modern locksets and hinges.', price: '$150 - $600 / unit', img: 'https://images.unsplash.com/photo-1534068590799-09895a702086?auto=format&fit=crop&w=800&q=80' },
  { id: 8, category: 'accessories', name: 'Tools & Supplies', subtitle: 'Professional Grade', desc: 'Professional grade tools for tile and vinyl installation. Including trowels, spacers, specialized cutters, and safety equipment.', price: 'Pricing varies per item', img: 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&w=800&q=80' },
  { id: 9, category: 'accessories', name: 'Cements & Grouts', subtitle: 'Installation Base', desc: 'High-adhesion thinset mortars, self-leveling compounds, and stain-resistant epoxy grouts. Available in a wide spectrum of colors to match any tile.', price: '$25 - $80 / bag', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80' },
  { id: 10, category: 'accessories', name: 'Trims & Baseboards', subtitle: 'Finishing Touches', desc: 'Architectural finishing touches including MDF baseboards, quarter rounds, shoe mouldings, and metal tile transition strips.', price: '$1.50 - $4.00 / linear ft.', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
];

const systemInstruction = `You are the JKN Architectural AI, an elite material consultant for JKN Flooring.
Your tone is профессионал, architectural, high-end, and helpful.

JKN Catalog Overview & Estimated Pricing:
- Tiles (Ceramic, Porcelain, Mosaic, Backsplash): $5.50 - $25.00 / sq.ft.
- Vinyl (Planks, Tiles, Loose Lay): $3.50 - $8.50 / sq.ft.
- Laminate (Premium HDF): $2.50 - $5.50 / sq.ft.
- Accessories (Doors, Locks): $150 - $600 / unit.
- Trims & Baseboards: $1.50 - $4.00 / linear ft.
- Cements & Grouts: $25 - $80 / bag.

CRITICAL FORMATTING: Whenever you recommend a product, you MUST append one of these exact strings so the UI can render a clickable card. ONLY use these:
[CARD: Vinyl Planks & Tiles | $3.50 - $8.50 / sq.ft. | https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=200&q=80 | #catalog]
[CARD: Ceramics & Mosaics | $5.50 - $25.00 / sq.ft. | https://images.unsplash.com/photo-1600607686527-6fb886090705?w=200&q=80 | #catalog]
[CARD: Installation Supplies | Cements, Grouts, Tools | https://images.unsplash.com/photo-1581141849291-1125c7b692b5?w=200&q=80 | #catalog]
[CARD: Doors, Trims & Accessories | Solid Wood & Baseboards | https://images.unsplash.com/photo-1534068590799-09895a702086?w=200&q=80 | #catalog]

Keep text concise. Break paragraphs with line breaks. Do not hallucinate products outside this catalog.`;

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(url: string, options: RequestInit) {
  const delays = [1000, 2000, 4000, 8000];
  for (let i = 0; i < delays.length; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === delays.length - 1) throw error;
      await wait(delays[i]);
    }
  }
}

function parseAndExtractCards(text: string) {
  const cardRegex = /\[CARD:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\]/g;
  const cards = [];
  let match;

  while ((match = cardRegex.exec(text)) !== null) {
    cards.push({
      title: match[1].trim(),
      subtitle: match[2].trim(),
      img: match[3].trim(),
      link: match[4].trim(),
    });
  }

  const cleanedText = text.replace(cardRegex, "").trim();
  return { cards, text: cleanedText };
}

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [catalogFilter, setCatalogFilter] = useState('all');

  // Vision State
  const [visionState, setVisionState] = useState('idle'); // idle | loading | output
  const [visionImg, setVisionImg] = useState('');
  const [visionResult, setVisionResult] = useState<any>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]); // API format
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Slider State
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isSliding, setIsSliding] = useState(false);

  // Global Effects
  useEffect(() => {
    // 3D Reveal Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.blur-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [catalogFilter]);

  useEffect(() => {
    if (isMobileMenuOpen || isAgentOpen || selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen, isAgentOpen, selectedProduct]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatTyping]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsAgentOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsAgentOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const handleSliderMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isSliding || !sliderRef.current) return;
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches?.[0]?.clientX || e.changedTouches?.[0]?.clientX;
    } else {
      clientX = e.clientX;
    }
    let rect = sliderRef.current.getBoundingClientRect();
    let position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(position, 100)));
  }, [isSliding]);

  useEffect(() => {
    const stopSliding = () => setIsSliding(false);
    window.addEventListener('mouseup', stopSliding);
    window.addEventListener('touchend', stopSliding);
    window.addEventListener('mousemove', handleSliderMove);
    window.addEventListener('touchmove', handleSliderMove, { passive: true });
    return () => {
      window.removeEventListener('mouseup', stopSliding);
      window.removeEventListener('touchend', stopSliding);
      window.removeEventListener('mousemove', handleSliderMove);
      window.removeEventListener('touchmove', handleSliderMove);
    };
  }, [handleSliderMove]);

  // Vision API Call
  const handleVisionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = ev.target?.result as string;
      const base64Data = result.split(',')[1];
      const mimeType = file.type;

      setVisionImg(result);
      setVisionState('loading');

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const payload = {
          contents: [{
            role: "user",
            parts: [
              { text: "Analyze this image representing a space or design inspiration. Explicitly recommend the closest matching product from the JKN Catalog. Provide the estimated cost. Format your output properly using the required CARD syntax." },
              { inlineData: { mimeType, data: base64Data } }
            ]
          }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        };

        const res = await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const text = res.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to analyze the image at this time.";
        setVisionResult(parseAndExtractCards(text));
        setVisionState('output');
      } catch (error) {
        console.error("Vision Error:", error);
        setVisionResult({ text: "Our vision analysis tool is currently experiencing heavy volume. Please try again later.", cards: [] });
        setVisionState('output');
      }
    };
    reader.readAsDataURL(file);
  };

  // Chat API Call
  const handleSendChat = async (textOverride: string | null = null) => {
    const text = textOverride || chatInput.trim();
    if (!text) return;

    const newUserMsg = { role: 'user', text };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsChatTyping(true);

    const apiHistory = [...chatHistory, { role: 'user', parts: [{ text }] }];
    setChatHistory(apiHistory);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: apiHistory,
        systemInstruction: { parts: [{ text: systemInstruction }] }
      };

      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseText = res.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I am currently unable to process your request.";
      const parsed = parseAndExtractCards(responseText);
      
      setChatMessages(prev => [...prev, { role: 'model', text: parsed.text, cards: parsed.cards }]);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: "Service temporarily unavailable. Please try again later.", cards: [] }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  return (
    <div className="font-sans text-obsidian bg-surface antialiased overflow-x-hidden selection:bg-obsidian selection:text-white relative min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --obsidian: #1d1d1f;
          --surface: #f5f5f7;
          --secondary: #86868b;
          --accent: #2997ff;
          --glass: rgba(255, 255, 255, 0.75);
          --glass-dark: rgba(29, 29, 31, 0.75);
        }

        body { font-family: 'Plus Jakarta Sans', sans-serif; scroll-behavior: smooth; }

        .text-obsidian { color: var(--obsidian); }
        .text-secondary { color: var(--secondary); }
        .text-accent { color: var(--accent); }
        .bg-obsidian { background-color: var(--obsidian); }
        .bg-surface { background-color: var(--surface); }
        .bg-accent { background-color: var(--accent); }
        .bg-glass { background-color: var(--glass); }
        .bg-glass-dark { background-color: var(--glass-dark); }
        .border-obsidian { border-color: var(--obsidian); }
        .border-accent { border-color: var(--accent); }
        .focus\:border-obsidian:focus { border-color: var(--obsidian); }
        .focus\:ring-accent\/50:focus { box-shadow: 0 0 0 2px rgba(41, 151, 255, 0.5); }
        
        .shadow-glass-inner { box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4), 0 8px 32px 0 rgba(0, 0, 0, 0.04); }
        .shadow-glass { box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.04); }
        .shadow-float { box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); }
        
        .tracking-tightest { letter-spacing: -0.05em; }
        
        .text-fluid-hero { font-size: clamp(3.5rem, 8vw, 10rem); }
        .text-fluid-h2 { font-size: clamp(2.5rem, 5vw, 6rem); }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(29, 29, 31, 0.15); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(29, 29, 31, 0.3); }

        .blur-reveal {
            opacity: 0; filter: blur(20px); transform: translateY(40px) scale(0.95);
            transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), filter 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: opacity, filter, transform;
        }
        .blur-reveal.active { opacity: 1; filter: blur(0px); transform: translateY(0) scale(1); }
        
        .img-container { overflow: hidden; position: relative; transform: translateZ(0); }
        .img-zoom { transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1); will-change: transform; }
        .img-container:hover .img-zoom { transform: scale(1.05); }

        .agent-pulse { animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        @keyframes pulse-ring {
            0% { transform: scale(0.85); box-shadow: 0 0 0 0 rgba(41, 151, 255, 0.4); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(41, 151, 255, 0); }
            100% { transform: scale(0.85); box-shadow: 0 0 0 0 rgba(41, 151, 255, 0); }
        }

        .chat-message-enter { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        .shimmer {
            background: #f6f7f8;
            background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
            background-repeat: no-repeat; background-size: 800px 100%;
            animation-duration: 1.5s; animation-fill-mode: forwards; animation-iteration-count: infinite;
            animation-name: placeholderShimmer; animation-timing-function: linear;
        }
        @keyframes placeholderShimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }
      `}} />

      {/* NAVBAR */}
      <header className="fixed top-0 inset-x-0 z-40 transition-all duration-700 pt-4 sm:pt-6 px-4 sm:px-8 pointer-events-none w-full max-w-[120rem] mx-auto">
        <div className="flex items-center justify-between w-full">
          <div 
            className="pointer-events-auto bg-glass backdrop-blur-2xl shadow-glass-inner rounded-full px-5 sm:px-6 py-3 sm:py-3.5 flex items-center transition-transform hover:scale-105 duration-300 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <span className="font-extrabold text-lg sm:text-xl tracking-tightest flex items-center gap-2 text-obsidian">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-obsidian rounded-full shadow-sm"></div>
              JKN<span className="font-medium text-secondary">Flooring</span>
            </span>
          </div>

          <button 
            onClick={() => setIsAgentOpen(true)}
            className="pointer-events-auto hidden md:flex items-center gap-3 bg-glass backdrop-blur-2xl shadow-glass-inner rounded-full py-2.5 px-4 w-[min(30vw,400px)] border border-white/50 hover:bg-white hover:shadow-md transition-all group"
          >
            <Sparkles className="w-4 h-4 text-accent group-hover:text-obsidian transition-colors" />
            <span className="text-sm font-medium text-secondary tracking-tight group-hover:text-obsidian transition-colors truncate">Ask AI Architectural Agent...</span>
            <div className="ml-auto flex items-center gap-1 bg-surface px-2 py-1 rounded-md border border-gray-200">
              <span className="text-[10px] font-bold text-secondary">⌘</span>
              <span className="text-[10px] font-bold text-secondary">K</span>
            </div>
          </button>

          <div className="pointer-events-auto hidden sm:flex items-center gap-4 bg-glass backdrop-blur-2xl shadow-glass-inner rounded-full p-1.5 pl-6">
            <a href="tel:9058404019" className="text-sm font-bold tracking-tight text-obsidian hover:text-accent transition-colors hidden lg:block">(905) 840-4019</a>
            <a href="#contact" className="bg-obsidian text-white px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide hover:bg-gray-800 transition-colors duration-300 shadow-md whitespace-nowrap">Get Quote</a>
          </div>

          <div className="pointer-events-auto sm:hidden flex items-center gap-2">
            <button onClick={() => setIsAgentOpen(true)} className="bg-glass backdrop-blur-2xl shadow-glass-inner p-3 rounded-full text-obsidian hover:bg-white transition-colors">
              <Sparkles className="w-5 h-5 text-accent" />
            </button>
            <button onClick={toggleMobileMenu} className="bg-glass backdrop-blur-2xl shadow-glass-inner p-3 rounded-full text-obsidian hover:bg-white transition-colors">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 z-30 bg-surface/95 backdrop-blur-3xl flex flex-col justify-center items-center gap-8 transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {['AI Visualizer', 'Transformations', 'Complete Catalog', 'Contact'].map((item) => (
          <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={toggleMobileMenu} className="text-[clamp(2rem,6vw,4rem)] font-bold tracking-tightest text-obsidian hover:scale-105 transition-transform">
            {item}
          </a>
        ))}
      </div>

      {/* HERO */}
      <section className="relative min-h-[90svh] sm:min-h-screen flex items-center justify-center px-4 sm:px-8 pt-32 pb-20 overflow-hidden w-full max-w-[120rem] mx-auto">
        <div className="absolute inset-3 sm:inset-6 rounded-[clamp(1.5rem,3vw,3.5rem)] overflow-hidden -z-10 shadow-float bg-obsidian">
          <img src="https://images.unsplash.com/photo-1585128792020-803d29415281?q=80&w=2000&auto=format&fit=crop" alt="Hardwood" className="w-full h-full object-cover img-zoom origin-center opacity-85" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent mix-blend-multiply"></div>
        </div>

        <div className="w-full text-center text-white z-10 blur-reveal px-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-glass-dark backdrop-blur-xl border border-white/10 mb-8 text-[clamp(0.6rem,1.5vw,0.85rem)] font-bold tracking-widest uppercase shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></span>
            Servicing the Greater Toronto Area
          </div>
          <h1 className="text-fluid-hero font-extrabold tracking-tightest leading-[0.85] mb-8 text-white drop-shadow-2xl">
            The Ground<br />We Walk.
          </h1>
          <p className="text-[clamp(1rem,1.5vw,1.5rem)] font-medium text-gray-200 max-w-[min(90%,800px)] mx-auto leading-snug mb-12 sm:mb-16 tracking-tight drop-shadow-sm">
            Architectural grade tiles, premium vinyl, laminate, and tailored accessories. Curated for spaces that demand perfection.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-[min(100%,700px)] mx-auto">
            <button onClick={() => document.getElementById('vision-tool')?.scrollIntoView()} className="w-full sm:w-auto bg-accent text-white px-8 py-4 rounded-full text-sm font-bold tracking-wide hover:bg-blue-600 transition-colors shadow-lg flex items-center justify-center gap-2">
              <Camera className="w-5 h-5" /> Try AI Visualizer
            </button>
            <div className="w-full sm:w-auto relative group cursor-pointer" onClick={() => setIsAgentOpen(true)}>
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 via-white/40 to-accent/30 rounded-full blur-md opacity-50 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative bg-glass-dark backdrop-blur-2xl border border-white/20 p-2 sm:p-3 rounded-full flex items-center gap-3 shadow-2xl transition-transform group-hover:scale-[1.02] duration-300">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0 agent-pulse">
                  <MessageSquare className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-grow text-left pr-4">
                  <p className="text-xs font-semibold text-gray-400 mb-0.5 uppercase tracking-widest">Chat with AI Agent</p>
                  <p className="text-sm text-white truncate">"Show me waterproof vinyl..."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION TOOL */}
      <section id="vision-tool" className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 py-[clamp(4rem,10vw,8rem)] relative z-20 blur-reveal">
        <div className="bg-white rounded-[clamp(2rem,5vw,3.5rem)] shadow-glass-inner border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
          <div className="w-full lg:w-5/12 p-[clamp(2rem,5vw,4rem)] bg-obsidian text-white flex flex-col justify-center relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full w-max mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">Gemini Vision AI</span>
            </div>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tightest leading-[1.1] mb-6">Snap a photo.<br />Get an estimate.</h2>
            <p className="text-gray-300 font-medium text-[clamp(1rem,1.2vw,1.125rem)] mb-8 leading-relaxed">
              Upload an inspiration photo or a picture of your current space. Our Gemini AI will instantly analyze the style, match it to our inventory, and generate an estimated pricing card.
            </p>
            <label className="w-full border-2 border-dashed border-white/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 hover:border-accent transition-all duration-300 group">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-accent" />
              </div>
              <span className="font-bold text-lg mb-1 text-white">Click to upload photo</span>
              <span className="text-xs text-gray-400 font-medium">JPEG, PNG, WEBP accepted</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleVisionUpload} />
            </label>
          </div>

          <div className="w-full lg:w-7/12 p-[clamp(2rem,5vw,4rem)] bg-surface flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] relative">
            {visionState === 'idle' && (
              <div className="text-center opacity-50 flex flex-col items-center">
                <ImageIcon className="w-16 h-16 text-secondary mb-4" />
                <p className="font-bold text-obsidian text-lg">Awaiting Image</p>
                <p className="text-sm text-secondary font-medium">Upload a photo to see AI recommendations here.</p>
              </div>
            )}
            
            {visionState === 'loading' && (
              <div className="w-full max-w-md flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold text-sm text-accent uppercase tracking-widest">Analyzing Image & Calculating Costs...</p>
                </div>
                <div className="w-full h-32 rounded-xl shimmer"></div>
                <div className="w-3/4 h-6 rounded-md shimmer"></div>
                <div className="w-1/2 h-6 rounded-md shimmer"></div>
              </div>
            )}

            {visionState === 'output' && (
              <div className="w-full flex flex-col gap-6 max-w-lg chat-message-enter">
                <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden shadow-sm relative">
                  <img src={visionImg} alt="Uploaded" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent flex items-end p-4">
                    <span className="text-white text-xs font-bold uppercase tracking-widest border border-white/30 px-2 py-1 rounded bg-black/30 backdrop-blur-md">Your Upload</span>
                  </div>
                </div>
                <div className="text-obsidian font-medium leading-relaxed text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: visionResult?.text?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}></div>
                <div className="flex flex-col gap-3">
                  {visionResult?.cards.map((c: any, i: number) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-3 bg-white flex items-center gap-3 cursor-pointer hover:border-accent hover:shadow-md transition-all duration-300" onClick={() => document.location.href='#catalog'}>
                        <img src={c.img} alt={c.title} className="w-14 h-14 rounded-lg object-cover" />
                        <div><p className="font-bold text-sm text-obsidian">{c.title}</p><p className="text-xs text-accent font-bold mt-0.5">{c.subtitle}</p></div>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                    </div>
                  ))}
                </div>
                <button onClick={() => document.location.href = '#contact'} className="w-full bg-obsidian text-white rounded-xl py-3 mt-2 font-bold tracking-wide hover:bg-gray-800 transition-colors shadow-md">Proceed to Quote</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 py-[clamp(3rem,8vw,6rem)] z-20 blur-reveal">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold tracking-tightest leading-none text-obsidian mb-4">Concrete Advantages.</h2>
          <p className="text-secondary font-medium text-[clamp(1rem,1.5vw,1.25rem)] max-w-2xl mx-auto">Why architects, builders, and homeowners in the GTA trust JKN Flooring exclusively.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            { icon: ShieldCheck, title: "Lifetime Warranty", desc: "Our premium vinyl and laminate installations come backed by a comprehensive structural lifetime warranty. Zero compromises." },
            { icon: Cpu, title: "AI-Backed Quoting", desc: "We leverage Google's Gemini Vision AI to ensure your quotes are hyper-accurate instantly, removing the guesswork from renovations." },
            { icon: Truck, title: "Fleet Delivery", desc: "Next-day local delivery across the GTA. Our massive in-stock warehouse means your project starts on your timeline, not ours." }
          ].map((feat, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mb-6"><feat.icon className="w-6 h-6 text-obsidian" /></div>
              <h3 className="text-xl font-bold text-obsidian mb-3 tracking-tight">{feat.title}</h3>
              <p className="text-secondary font-medium leading-relaxed text-sm">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BEFORE/AFTER SLIDER */}
      <section id="transformations" className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 pb-[clamp(4rem,10vw,8rem)] z-20 blur-reveal relative">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold tracking-tightest leading-none text-obsidian mb-2">Real Results.</h2>
          <p className="text-secondary font-medium text-[clamp(1rem,1.5vw,1.25rem)]">Drag the slider to see the JKN transformation.</p>
        </div>
        <div 
          ref={sliderRef}
          className="relative w-full aspect-[4/3] sm:aspect-[21/9] rounded-[clamp(1.5rem,3vw,2.5rem)] overflow-hidden cursor-ew-resize select-none shadow-2xl border border-gray-200 touch-pan-y"
          onMouseDown={() => setIsSliding(true)}
          onTouchStart={(e) => { setIsSliding(true); e.stopPropagation(); }}
        >
          {/* AFTER */}
          <img src="https://images.unsplash.com/photo-1585128792020-803d29415281?q=80&w=2000&auto=format&fit=crop" alt="After" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          <div className="absolute top-6 right-6 bg-glass backdrop-blur-xl px-4 py-2 rounded-full text-obsidian font-bold tracking-widest text-xs uppercase shadow-sm pointer-events-none z-10">After</div>
          
          {/* BEFORE */}
          <img 
            src="https://images.unsplash.com/photo-1543139571-aecd41e0537d?q=80&w=1760&auto=format&fit=crop" 
            alt="Before" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none filter sepia-[10%] grayscale-[20%]" 
            style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
          />
          <div className="absolute top-6 left-6 bg-glass-dark backdrop-blur-xl px-4 py-2 rounded-full text-white font-bold tracking-widest text-xs uppercase shadow-sm pointer-events-none z-10" style={{ opacity: sliderPos < 15 ? 0 : 1, transition: 'opacity 0.2s' }}>Before</div>
          
          {/* HANDLE */}
          <div className="absolute inset-y-0 w-1 bg-white cursor-ew-resize transform -translate-x-1/2 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20" style={{ left: `${sliderPos}%` }}>
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-xl border border-gray-100 pointer-events-none text-obsidian hover:scale-110 transition-transform">
              <ChevronsLeftRight className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 relative z-20 blur-reveal">
        <div className="bg-glass backdrop-blur-3xl shadow-glass-inner rounded-[clamp(1.5rem,3vw,3rem)] py-8 sm:py-10 px-4 sm:px-12 grid grid-cols-2 md:grid-cols-4 gap-y-10 md:gap-y-0 gap-x-4 md:gap-x-10 text-center items-center">
          <div className="flex flex-col justify-center"><p className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tightest text-obsidian leading-none mb-2">13<span className="text-secondary">+</span></p><p className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-widest">Years Expertise</p></div>
          <div className="flex flex-col justify-center md:border-l border-gray-300/50"><p className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tightest text-obsidian leading-none mb-2">02</p><p className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-widest">GTA Locations</p></div>
          <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-300/50 pt-8 md:pt-0"><p className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tightest text-obsidian leading-none mb-2">500<span className="text-[clamp(1.5rem,2vw,2rem)] text-secondary">+</span></p><p className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-widest">Products In-Stock</p></div>
          <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-300/50 pt-8 md:pt-0"><p className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tightest text-obsidian leading-none mb-2">100<span className="text-[clamp(1.5rem,2vw,2rem)] text-secondary">%</span></p><p className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-widest">Price Match</p></div>
        </div>
      </section>

      {/* CATALOG PORTFOLIO */}
      <section id="catalog" className="py-[clamp(4rem,10vw,8rem)] w-full max-w-[120rem] mx-auto px-4 sm:px-8">
        <div className="flex flex-col mb-[clamp(2rem,5vw,4rem)] blur-reveal">
          <h2 className="text-fluid-h2 font-extrabold tracking-tightest leading-none text-obsidian mb-6">Complete <br /><span className="text-secondary">Inventory.</span></h2>
          <p className="text-[clamp(1rem,1.5vw,1.25rem)] text-secondary max-w-2xl font-medium leading-relaxed">Explore our full architectural range. From foundational cements to premium mosaic finishing touches. Click any item for specs and pricing.</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-[clamp(3rem,6vw,5rem)] blur-reveal">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'tiles', label: 'Tiles' },
            { id: 'vinyl', label: 'Vinyl & Laminate' },
            { id: 'accessories', label: 'Accessories & Doors' }
          ].map(filter => (
            <button 
              key={filter.id}
              onClick={() => setCatalogFilter(filter.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all shadow-sm ${catalogFilter === filter.id ? 'bg-obsidian text-white' : 'bg-white border border-gray-200 text-secondary hover:text-obsidian hover:border-gray-400'}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[clamp(1.5rem,3vw,2.5rem)]">
          {CATALOG_ITEMS.filter(item => catalogFilter === 'all' || item.category === catalogFilter).map((item) => (
            <div key={item.id} onClick={() => setSelectedProduct(item)} className="blur-reveal bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl border border-gray-100 group cursor-pointer transition-all duration-500">
              <div className="img-container aspect-[4/3] rounded-xl mb-4 bg-gray-100">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover img-zoom" loading="lazy" />
              </div>
              <div className="px-2 pb-2">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">{item.subtitle}</p>
                <h3 className="text-xl font-extrabold tracking-tight text-obsidian flex justify-between items-center">
                  {item.name} <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-obsidian transition-colors" />
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT MODAL */}
      <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${selectedProduct ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
        {selectedProduct && (
          <div className={`relative w-full max-w-[800px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row transform transition-transform duration-300 ${selectedProduct ? 'scale-100' : 'scale-95'}`}>
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative bg-gray-100">
              <img src={selectedProduct.img} alt={selectedProduct.name} className="w-full h-full object-cover absolute inset-0" />
            </div>
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center relative">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 p-2 bg-surface hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-3xl font-extrabold tracking-tight text-obsidian mb-2">{selectedProduct.name}</h3>
              <p className="text-accent font-bold text-xl mb-4">{selectedProduct.price}</p>
              <div className="h-px w-full bg-gray-100 mb-4"></div>
              <p className="text-secondary font-medium leading-relaxed mb-8 text-sm sm:text-base">{selectedProduct.desc}</p>
              <button onClick={() => { setSelectedProduct(null); document.location.href='#contact'; }} className="w-full bg-obsidian text-white rounded-xl py-4 font-bold tracking-wide hover:bg-gray-800 transition-colors shadow-md">
                Request Consultation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SERVICES */}
      <section id="services" className="py-[clamp(4rem,12vw,10rem)] bg-obsidian text-white rounded-t-[clamp(2.5rem,6vw,5rem)] relative z-10 w-full">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-8">
          <h2 className="text-[clamp(3.5rem,8vw,10rem)] font-extrabold tracking-tightest leading-[0.85] mb-[clamp(4rem,10vw,8rem)] blur-reveal">Supply.<br />Install.<br /><span className="text-secondary">Transform.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(3rem,6vw,6rem)] border-t border-white/10 pt-[clamp(3rem,8vw,6rem)]">
            {[
              { icon: Compass, title: "Material Guidance", desc: "Consultation to help you navigate our vast selection of tiles, vinyl, and accessories. We match the exact specification to your architectural needs." },
              { icon: Hammer, title: "Expert Installation", desc: "Precision execution by our seasoned in-house teams. Flawless application utilizing our premium cements, grouts, and specialized tools." },
              { icon: RefreshCcw, title: "Full Renovation", desc: "End-to-end site prep. We handle subfloor leveling, baseboard moulding installation, and final high-end finishes including doors and locks." }
            ].map((srv, i) => (
              <div key={i} className="blur-reveal">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-8 border border-white/5"><srv.icon className="w-6 h-6 text-accent" /></div>
                <h3 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-tightest mb-4">{srv.title}</h3>
                <p className="text-secondary leading-relaxed font-medium text-[clamp(1rem,1.2vw,1.125rem)]">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative py-[clamp(4rem,10vw,8rem)] bg-surface w-full">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-8 relative z-10">
          <div className="bg-white rounded-[clamp(2rem,5vw,3.5rem)] shadow-glass p-[clamp(2rem,5vw,6rem)] border border-gray-100 flex flex-col xl:flex-row gap-[clamp(3rem,6vw,8rem)] items-center blur-reveal">
            <div className="w-full xl:w-5/12">
              <h2 className="text-fluid-h2 font-extrabold tracking-tightest mb-6 text-obsidian leading-tight">Start your<br />project.</h2>
              <p className="text-secondary text-[clamp(1rem,1.2vw,1.125rem)] font-medium mb-[clamp(2rem,5vw,4rem)] leading-relaxed">Connect with our team for a site visit or drop by our GTA showrooms.</p>
              <div className="space-y-[clamp(1.5rem,3vw,2.5rem)]">
                {[
                  { icon: MapPin, title: "Brampton HQ", desc: "21 Regan Rd, L7A 1B2\nOpen 7 Days a Week" },
                  { icon: MapPin, title: "Oakville Branch", desc: "500 Speers Rd, L6K 2G3\nOpen 7 Days a Week" },
                  { icon: Phone, title: "Direct Line", desc: "(905) 840-4019\nkkahlon966@gmail.com" }
                ].map((info, i) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="p-4 bg-surface rounded-2xl group-hover:bg-obsidian group-hover:text-white transition-colors duration-300 shrink-0"><info.icon className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-extrabold text-[clamp(1.125rem,2vw,1.5rem)] mb-1 text-obsidian">{info.title}</h4>
                      <p className="text-secondary font-medium text-[clamp(0.875rem,1vw,1rem)] whitespace-pre-line">{info.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full xl:w-7/12">
              <form className="space-y-[clamp(1rem,2vw,1.5rem)]" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[clamp(1rem,2vw,1.5rem)]">
                  <div className="space-y-2"><label className="text-[10px] font-bold text-secondary uppercase tracking-widest pl-2">First Name</label><input type="text" className="w-full bg-surface border-2 border-transparent rounded-2xl p-[clamp(1rem,2vw,1.5rem)] text-[clamp(1rem,1.2vw,1.125rem)] font-medium focus:border-obsidian focus:bg-white outline-none transition-all" placeholder="John" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-bold text-secondary uppercase tracking-widest pl-2">Last Name</label><input type="text" className="w-full bg-surface border-2 border-transparent rounded-2xl p-[clamp(1rem,2vw,1.5rem)] text-[clamp(1rem,1.2vw,1.125rem)] font-medium focus:border-obsidian focus:bg-white outline-none transition-all" placeholder="Doe" /></div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-bold text-secondary uppercase tracking-widest pl-2">Email Address</label><input type="email" className="w-full bg-surface border-2 border-transparent rounded-2xl p-[clamp(1rem,2vw,1.5rem)] text-[clamp(1rem,1.2vw,1.125rem)] font-medium focus:border-obsidian focus:bg-white outline-none transition-all" placeholder="hello@architect.com" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold text-secondary uppercase tracking-widest pl-2">Project Requirements</label><textarea rows={4} className="w-full bg-surface border-2 border-transparent rounded-2xl p-[clamp(1rem,2vw,1.5rem)] text-[clamp(1rem,1.2vw,1.125rem)] font-medium focus:border-obsidian focus:bg-white outline-none transition-all resize-none" placeholder="Looking for 500sqft of waterproof vinyl..."></textarea></div>
                <button type="submit" className="w-full bg-obsidian text-white rounded-2xl py-[clamp(1.25rem,2vw,1.5rem)] text-[clamp(1rem,1.2vw,1.125rem)] font-bold tracking-wide hover:bg-gray-800 transition-colors mt-4 shadow-md">Request Consultation</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface pb-[clamp(2rem,5vw,3rem)] pt-[clamp(2rem,5vw,3rem)] w-full">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-8 border-t border-gray-200/60 pt-[clamp(1.5rem,3vw,2rem)] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-extrabold text-[clamp(1.25rem,2vw,1.5rem)] tracking-tightest flex items-center gap-2 text-obsidian">
            <div className="w-2.5 h-2.5 bg-obsidian rounded-full"></div>JKN<span className="font-medium text-secondary">Flooring</span>
          </div>
          <p className="text-secondary font-medium text-[clamp(0.75rem,1vw,0.875rem)]">&copy; {new Date().getFullYear()} 2816473 Ontario Inc. All rights reserved.</p>
          <div className="flex gap-8 text-[clamp(0.75rem,1vw,0.875rem)] font-bold text-secondary tracking-wide">
            <a href="#" className="hover:text-obsidian transition-colors">Instagram</a>
            <a href="#" className="hover:text-obsidian transition-colors">HomeStars</a>
          </div>
        </div>
      </footer>

      {/* AI AGENT CHAT MODAL */}
      <div className={`fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 transition-all duration-500 ${isAgentOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm" onClick={() => setIsAgentOpen(false)}></div>
        <div className={`relative w-full max-w-[700px] bg-white shadow-2xl rounded-[clamp(1.5rem,2vw,2rem)] overflow-hidden flex flex-col mt-10 sm:mt-0 border border-gray-100 max-h-[85vh] transition-transform duration-500 ${isAgentOpen ? 'scale-100' : 'scale-95'}`}>
          <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-gray-100 bg-surface/50">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-accent" /></div>
            <div>
              <h3 className="font-bold text-obsidian text-sm flex items-center gap-2">
                JKN Architectural AI <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text text-[10px] font-extrabold uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded-full border border-gray-200">✨ Text Chat</span>
              </h3>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>Always Online</p>
            </div>
            <button onClick={() => setIsAgentOpen(false)} className="ml-auto p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"><X className="w-5 h-5" /></button>
          </div>

          <div ref={chatScrollRef} className="p-4 sm:p-6 overflow-y-auto flex-grow flex flex-col gap-4 bg-white" style={{ minHeight: '300px', maxHeight: '50vh' }}>
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1"><Bot className="w-4 h-4 text-accent" /></div>
              <div className="bg-surface p-3 sm:p-4 rounded-2xl rounded-tl-sm text-sm sm:text-base text-obsidian font-medium leading-relaxed">
                Hello. I'm the JKN Text Assistant. How can I help you spec materials for your project today?
              </div>
            </div>
            
            {chatMessages.length === 0 && (
              <div className="flex flex-wrap gap-2 mt-2 pl-11">
                <button onClick={() => handleSendChat("Show me waterproof vinyl options")} className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-secondary hover:text-obsidian hover:border-obsidian transition-colors bg-white shadow-sm">Waterproof Vinyl</button>
                <button onClick={() => handleSendChat("What do I need for tile installation?")} className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-secondary hover:text-obsidian hover:border-obsidian transition-colors bg-white shadow-sm">Tile Installation Needs</button>
              </div>
            )}

            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 max-w-[85%] chat-message-enter ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-obsidian' : 'bg-accent/10'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-accent" />}
                </div>
                <div className={`flex-grow`}>
                  <div className={`p-3 sm:p-4 rounded-2xl text-sm sm:text-base font-medium leading-relaxed ${msg.role === 'user' ? 'bg-obsidian text-white rounded-tr-sm' : 'bg-surface text-obsidian rounded-tl-sm'}`} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}></div>
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {msg.cards.map((c: any, i: number) => (
                        <div key={i} className="border border-gray-200 rounded-xl p-3 bg-white flex items-center gap-3 cursor-pointer hover:border-accent hover:shadow-md transition-all duration-300" onClick={() => { setIsAgentOpen(false); document.location.href='#catalog'; }}>
                          <img src={c.img} alt={c.title} className="w-12 h-12 rounded-lg object-cover" />
                          <div><p className="font-bold text-sm text-obsidian">{c.title}</p><p className="text-xs text-accent font-bold mt-0.5">{c.subtitle}</p></div>
                          <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isChatTyping && (
              <div className="flex gap-3 max-w-[85%] chat-message-enter">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1"><Bot className="w-4 h-4 text-accent" /></div>
                <div className="bg-surface p-4 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                className="w-full bg-surface text-obsidian text-sm sm:text-base font-medium rounded-full py-3 sm:py-4 pl-5 pr-12 outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder-gray-400" 
                placeholder="Type your request here..." 
                autoComplete="off" 
              />
              <button onClick={() => handleSendChat()} className="absolute right-2 w-8 h-8 sm:w-10 sm:h-10 bg-accent text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm">
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
