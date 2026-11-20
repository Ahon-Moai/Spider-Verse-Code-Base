import React, { useState, useEffect } from 'react';
import {
  Layout,
  Save,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Film
} from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { ImageUploader } from './ImageUploader';
import { VideoUploader } from './VideoUploader';
import { VideoShowcaseCard } from '../types';

interface HomepageCMSProps {
  csrfToken: string;
}

export const HomepageCMS: React.FC<HomepageCMSProps> = ({ csrfToken }) => {
  const [activeTab, setActiveTab] = useState<
    | 'hero'
    | 'campaigns'
    | 'seasons'
    | 'video'
    | 'sections'
    | 'marquee'
    | 'reviews'
    | 'faqs'
    | 'articles'
  >('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<
    Array<{ id: string; name: string; brand: string; image?: string }>
  >([]);

  // Hero Form + 3 Carousel Slides
  const [heroForm, setHeroForm] = useState({
    headline: 'COLLECTION IS LIVE',
    tagline: '',
    specifier: "SEASON '26",
    primary_cta_text: 'Explore Model',
    secondary_cta_text: 'Shop All',
    image: '/src/assets/images/hero_f1_diecast_studio_1794664768996.jpg',
    video_url: ''
  });

  const [heroSlides, setHeroSlides] = useState<
    Array<{
      eyebrow: string;
      headline: string;
      cta_text: string;
      product_id: string;
      image: string;
      video_url: string;
      media_type: 'image' | 'video';
    }>
  >([
    {
      eyebrow: "SEASON '26",
      headline: 'COLLECTION IS LIVE',
      cta_text: 'Explore Model',
      product_id: '',
      image: '/src/assets/images/hero_f1_diecast_studio_1794664768996.jpg',
      video_url: '',
      media_type: 'image'
    },
    {
      eyebrow: '1:18 PRO DIECAST',
      headline: 'BUILT FOR THE GRID',
      cta_text: 'Explore Model',
      product_id: '',
      image: '/src/assets/images/campaign_f1_pro_118_1794664772367.jpg',
      video_url: '',
      media_type: 'image'
    },
    {
      eyebrow: '1:43 & 2.4GHZ RC',
      headline: 'RACE OR DISPLAY',
      cta_text: 'Explore Model',
      product_id: '',
      image: '/src/assets/images/campaign_f1_display_143_1794664770809.jpg',
      video_url: '',
      media_type: 'image'
    }
  ]);

  // Campaign Banners Form (For Him / For Her)
  const [campaignForm, setCampaignForm] = useState({
    section_title: 'FOR HIM | HER',
    for_him_title: 'For Him',
    for_him_button_text: 'SHOP DECANTS',
    for_him_image: '/src/assets/images/campaign_for_him_1791908163466.jpg',
    for_her_title: 'For Her',
    for_her_button_text: 'SHOP DECANTS',
    for_her_image: '/src/assets/images/campaign_for_her_1791908163547.jpg'
  });

  // Seasons Gallery Form
  const [seasonsHeader, setSeasonsHeader] = useState({
    section_title: 'SEASONS',
    section_subtitle: 'CHOOSE YOURS'
  });

  const [seasonCards, setSeasonCards] = useState<
    Array<{ id: string; name: string; description: string; image: string; alt?: string }>
  >([
    {
      id: 'season-autumn',
      name: 'Night Grid Aero',
      description: 'Floodlit street-circuit liveries & sculpted ground-effect wings',
      image: '/src/assets/images/series_f1_night_aero_1794664771085.jpg',
      alt: 'Crimson and obsidian F1 toy car under dramatic pit-lane floodlights'
    },
    {
      id: 'season-winter',
      name: '1990s Red Legends',
      description: 'Classic V10-era scarlet diecast icons on dark stone plinths',
      image: '/src/assets/images/series_f1_classic_red_1794664772823.jpg',
      alt: 'Vintage 1990s scarlet Formula 1 diecast race car on dark pedestal'
    },
    {
      id: 'season-summer',
      name: 'Carbon Pro 1:18',
      description: 'Matte weave chassis with halo cockpit & alloy suspension arms',
      image: '/src/assets/images/series_f1_carbon_stealth_1794664773109.jpg',
      alt: 'Stealth matte carbon 1:18 Formula 1 model car front wing and halo detail'
    },
    {
      id: 'season-spring',
      name: '2.4GHz RC Racers',
      description: 'High-torque radio-controlled F1 toy cars tuned for living-room sprints',
      image: '/src/assets/images/series_f1_rc_sprint_1794664772832.jpg',
      alt: 'Two high-speed RC Formula 1 toy cars lined up on starting grid'
    }
  ]);

  // Video Product Showcase Section State
  const [showcaseHeader, setShowcaseHeader] = useState({
    headline: 'AURA & SILLAGE IN MOTION',
    tagline:
      'Weightless liquid gold suspended in high-pressure glass atomizers. Experience the delicate art of artisanal decanting.',
    badge_text: 'ARRINA CINEMATIC ATELIER',
    is_enabled: true
  });

  const [showcaseCards, setShowcaseCards] = useState<VideoShowcaseCard[]>([]);

  // Dynamic Custom Sections (4 Sections)
  const [customSections, setCustomSections] = useState<
    Record<string, { title: string; subtitle: string; is_enabled: boolean; product_ids: string[] }>
  >({
    custom_section_1: {
      title: 'MOST LOVED DECANTS',
      subtitle: 'CURATED BESTSELLERS FOR DISCOVERING YOUR SIGNATURE SCENT',
      is_enabled: true,
      product_ids: ['prod-pure-portions', 'prod-vanilla01', 'prod-rose01']
    },
    custom_section_2: {
      title: 'ORIENTAL & OUD SELECTIONS',
      subtitle: 'DEEP, SMOKY & REFINED RESINS',
      is_enabled: true,
      product_ids: ['prod-genesis-leo', 'prod-venena']
    },
    custom_section_3: {
      title: 'FLORAL & AMBER ESSENCES',
      subtitle: 'RADIANT VELVET PETALS & SOLAR DEW',
      is_enabled: true,
      product_ids: ['prod-asdaaf-raneen', 'prod-rose01']
    },
    custom_section_4: {
      title: 'LIMITED VAULT EDITIONS',
      subtitle: 'EXCLUSIVE BATCH ALLOCATIONS',
      is_enabled: true,
      product_ids: ['prod-vanilla01', 'prod-genesis-leo', 'prod-pure-portions']
    }
  });

  // Marquee
  const [marqueeText, setMarqueeText] = useState('CURATE, JUDGE, REFINE, TEST');

  // FAQs
  const [faqs, setFaqs] = useState<Array<{ id: string; question: string; answer: string }>>([]);
  const [editingFaq, setEditingFaq] = useState<{
    id: string;
    question: string;
    answer: string;
  } | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<
    Array<{ id: string; quote: string; content: string; author: string; rating: number }>
  >([]);
  const [editingReview, setEditingReview] = useState<{
    id: string;
    quote: string;
    content: string;
    author: string;
    rating: number;
  } | null>(null);

  // Articles
  const [articles, setArticles] = useState<
    Array<{
      id: string;
      title: string;
      date: string;
      publisher: string;
      description: string;
      image: string;
    }>
  >([]);
  const [editingArticle, setEditingArticle] = useState<{
    id: string;
    title: string;
    date: string;
    publisher: string;
    description: string;
    image: string;
  } | null>(null);

  const fetchCMSData = async () => {
    setLoading(true);
    try {
      const [cmsRes, prodRes] = await Promise.all([
        fetch('/api/admin/homepage.php'),
        fetch('/api/admin/products.php')
      ]);

      const data = await cmsRes.json();
      const pData = await prodRes.json();

      if (pData.success && Array.isArray(pData.data)) {
        setAvailableProducts(
          pData.data.map((p: any) => ({ id: p.id, name: p.name, brand: p.brand, image: p.image }))
        );
      }

      if (data.success && data.data) {
        const payload = data.data;

        // Hero
        const heroSec = payload.sections?.hero;
        if (heroSec && heroSec.content) {
          const c = heroSec.content;
          setHeroForm((prev) => ({
            ...prev,
            headline: c.headline && !/by the ml/i.test(c.headline) ? c.headline : prev.headline,
            primary_cta_text:
              c.primary_cta_text && !/portions|decant/i.test(c.primary_cta_text)
                ? c.primary_cta_text
                : prev.primary_cta_text,
            secondary_cta_text:
              c.secondary_cta_text && !/decant/i.test(c.secondary_cta_text)
                ? c.secondary_cta_text
                : prev.secondary_cta_text,
            image: c.image || prev.image,
            video_url: c.video_url || ''
          }));

          if (Array.isArray(c.slides) && c.slides.length > 0) {
            setHeroSlides((prev) =>
              prev.map((def, idx) => {
                const s = c.slides[idx];
                if (!s) return def;
                return {
                  eyebrow: s.eyebrow ?? def.eyebrow,
                  headline: s.headline ?? def.headline,
                  cta_text: s.cta_text ?? def.cta_text,
                  product_id: s.product_id ?? def.product_id,
                  image: s.image ?? def.image,
                  video_url: s.video_url ?? '',
                  media_type: s.media_type === 'video' ? 'video' : 'image'
                };
              })
            );
          }
        }

        // Campaign Banners (For Him | Her)
        const campSec = payload.sections?.campaign_banners;
        if (campSec && campSec.content) {
          setCampaignForm((prev) => ({ ...prev, ...campSec.content }));
        }

        // Seasons Gallery
        const seasonsSec = payload.sections?.seasons_gallery;
        if (seasonsSec && seasonsSec.content) {
          setSeasonsHeader({
            section_title: seasonsSec.title || seasonsSec.content.section_title || 'SEASONS',
            section_subtitle:
              seasonsSec.subtitle || seasonsSec.content.section_subtitle || 'CHOOSE YOURS'
          });
          if (Array.isArray(seasonsSec.content.cards)) {
            setSeasonCards(seasonsSec.content.cards);
          }
        }

        // Video Showcase
        const vidSec = payload.sections?.video_showcase || payload.sections?.video_hero;
        if (vidSec && vidSec.content) {
          setShowcaseHeader({
            headline: vidSec.title || vidSec.content.headline || 'AURA & SILLAGE IN MOTION',
            tagline:
              vidSec.subtitle ||
              vidSec.content.tagline ||
              'Weightless liquid gold suspended in high-pressure glass atomizers.',
            badge_text: vidSec.content.badge_text || 'ARRINA CINEMATIC ATELIER',
            is_enabled: vidSec.is_enabled !== undefined ? Boolean(vidSec.is_enabled) : true
          });

          if (Array.isArray(vidSec.content.cards)) {
            setShowcaseCards(vidSec.content.cards);
          } else if (vidSec.content.video_url) {
            setShowcaseCards([
              {
                id: 'card-1',
                product_id: 'prod-pure-portions',
                title: vidSec.content.headline || 'Pure Portions (5ml)',
                video_url: vidSec.content.video_url,
                thumbnail_url: vidSec.content.poster_image,
                display_order: 1,
                is_enabled: true
              }
            ]);
          }
        }

        // Custom Sections
        const nextCustom: any = { ...customSections };
        ['custom_section_1', 'custom_section_2', 'custom_section_3', 'custom_section_4'].forEach(
          (key) => {
            if (payload.sections?.[key]) {
              const sec = payload.sections[key];
              nextCustom[key] = {
                title: sec.title || nextCustom[key].title,
                subtitle: sec.subtitle || nextCustom[key].subtitle,
                is_enabled: sec.is_enabled !== undefined ? Boolean(sec.is_enabled) : true,
                product_ids: Array.isArray(sec.content?.product_ids)
                  ? sec.content.product_ids
                  : nextCustom[key].product_ids
              };
            }
          }
        );
        setCustomSections(nextCustom);

        // Marquee
        const marqueeSec = payload.sections?.category_marquee;
        if (marqueeSec && marqueeSec.content?.items) {
          setMarqueeText(marqueeSec.content.items.join(', '));
        }

        // FAQs
        if (Array.isArray(payload.faqs)) setFaqs(payload.faqs);

        // Reviews
        if (Array.isArray(payload.reviews)) setReviews(payload.reviews);

        // Articles
        if (Array.isArray(payload.articles)) setArticles(payload.articles);
      }
    } catch (e) {
      console.error('Failed to load CMS data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMSData();
  }, []);

  const handleSaveVideoShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formattedCards = showcaseCards.map((card, index) => ({
        ...card,
        display_order: index + 1
      }));

      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: 'video_showcase',
          title: showcaseHeader.headline || 'AURA & SILLAGE IN MOTION',
          subtitle:
            showcaseHeader.tagline ||
            'Weightless liquid gold suspended in high-pressure glass atomizers.',
          content: {
            headline: showcaseHeader.headline,
            tagline: showcaseHeader.tagline,
            badge_text: showcaseHeader.badge_text,
            is_enabled: showcaseHeader.is_enabled,
            cards: formattedCards
          },
          is_enabled: showcaseHeader.is_enabled ? 1 : 0,
          display_order: 3
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Video Product Showcase saved successfully!');
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Video section'));
      }
    } catch (e) {
      alert('Error saving Video section');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCard = () => {
    const newCard: VideoShowcaseCard = {
      id: 'card-' + Date.now(),
      product_id: availableProducts[0]?.id || '',
      title: availableProducts[0]?.name || 'New Video Product Showcase',
      video_url:
        'https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-in-a-dark-background-41527-large.mp4',
      thumbnail_url:
        availableProducts[0]?.image ||
        '/src/assets/images/element_pure_portions_bottle_1791911761493.jpg',
      display_order: showcaseCards.length + 1,
      is_enabled: true
    };
    setShowcaseCards([...showcaseCards, newCard]);
  };

  const handleUpdateCard = (id: string, updates: Partial<VideoShowcaseCard>) => {
    setShowcaseCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        const updated = { ...card, ...updates };

        if (updates.product_id && updates.product_id !== card.product_id) {
          const matchedProd = availableProducts.find((p) => p.id === updates.product_id);
          if (matchedProd) {
            if (!updated.title || updated.title === card.title) updated.title = matchedProd.name;
            if (!updated.thumbnail_url || updated.thumbnail_url === card.thumbnail_url) {
              updated.thumbnail_url = matchedProd.image || '';
            }
          }
        }
        return updated;
      })
    );
  };

  const handleDeleteCard = (id: string) => {
    if (!confirm('Are you sure you want to delete this showcase video card?')) return;
    setShowcaseCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === showcaseCards.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...showcaseCards];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setShowcaseCards(next);
  };

  const handleSaveCustomSection = async (secKey: string) => {
    setSaving(true);
    const secData = customSections[secKey];
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: secKey,
          title: secData.title,
          subtitle: secData.subtitle,
          content: {
            is_enabled: secData.is_enabled,
            product_ids: secData.product_ids
          },
          is_enabled: secData.is_enabled ? 1 : 0,
          display_order: 4 + parseInt(secKey.slice(-1) || '1', 10)
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Collection "${secData.title}" saved successfully!`);
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save collection section'));
      }
    } catch (e) {
      alert('Error saving collection section');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCampaignBanners = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: 'campaign_banners',
          title: campaignForm.section_title || 'FOR HIM | HER',
          subtitle: 'GENDER CATEGORY CAMPAIGNS',
          content: campaignForm,
          is_enabled: true,
          display_order: 2.5
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Campaign Banners (For Him / Her) saved successfully!');
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Campaign Banners'));
      }
    } catch (e) {
      alert('Error saving Campaign Banners');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSeasonsGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: 'seasons_gallery',
          title: seasonsHeader.section_title || 'SEASONS',
          subtitle: seasonsHeader.section_subtitle || 'CHOOSE YOURS',
          content: {
            section_title: seasonsHeader.section_title,
            section_subtitle: seasonsHeader.section_subtitle,
            cards: seasonCards
          },
          is_enabled: true,
          display_order: 2.8
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Seasons Gallery saved successfully!');
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Seasons Gallery'));
      }
    } catch (e) {
      alert('Error saving Seasons Gallery');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSeasonCard = () => {
    const newCard = {
      id: 'season-' + Date.now(),
      name: 'New Racing Season',
      description: 'Season livery & collector edition details',
      image: '/src/assets/images/series_f1_night_aero_1794664771085.jpg',
      alt: 'Formula 1 racing season card image'
    };
    setSeasonCards([...seasonCards, newCard]);
  };

  const handleUpdateSeasonCard = (
    id: string,
    updates: Partial<{ name: string; description: string; image: string; alt: string }>
  ) => {
    setSeasonCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  };

  const handleDeleteSeasonCard = (id: string) => {
    if (!confirm('Are you sure you want to delete this seasonal card?')) return;
    setSeasonCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleMoveSeasonCard = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === seasonCards.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...seasonCards];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setSeasonCards(next);
  };

  const handleUpdateHeroSlide = (
    index: number,
    updates: Partial<{
      eyebrow: string;
      headline: string;
      cta_text: string;
      product_id: string;
      image: string;
      video_url: string;
      media_type: 'image' | 'video';
    }>
  ) => {
    setHeroSlides((prev) =>
      prev.map((slide, idx) => (idx === index ? { ...slide, ...updates } : slide))
    );
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const firstSlide = heroSlides[0];
    const heroPayload = {
      ...heroForm,
      specifier: firstSlide.eyebrow,
      headline: firstSlide.headline,
      primary_cta_text: firstSlide.cta_text,
      image: firstSlide.image,
      video_url: firstSlide.media_type === 'video' ? firstSlide.video_url : '',
      slides: heroSlides
    };

    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: 'hero',
          title: firstSlide.headline || 'COLLECTION IS LIVE',
          subtitle: firstSlide.eyebrow || "SEASON '26",
          content: heroPayload,
          is_enabled: true,
          display_order: 1
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Hero 3-Slide Carousel saved successfully!');
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Hero section'));
      }
    } catch (e) {
      alert('Error saving Hero section');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMarquee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const items = marqueeText
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: 'category_marquee',
          title: 'Category Marquee',
          content: { items },
          is_enabled: true,
          display_order: 2
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Category Marquee saved successfully!');
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Category Marquee'));
      }
    } catch (e) {
      alert('Error saving Category Marquee');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFaq = async (faqObj: { id: string; question: string; answer: string }) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'faq',
          ...faqObj
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('FAQ saved successfully!');
        setEditingFaq(null);
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save FAQ'));
      }
    } catch (e) {
      alert('Error saving FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/admin/homepage.php?type=faq&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success) {
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to delete FAQ'));
      }
    } catch (e) {
      alert('Error deleting FAQ');
    }
  };

  const handleSaveReview = async (revObj: {
    id: string;
    quote: string;
    content: string;
    author: string;
    rating: number;
  }) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'review',
          ...revObj
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Review saved successfully!');
        setEditingReview(null);
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Review'));
      }
    } catch (e) {
      alert('Error saving Review');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Review?')) return;
    try {
      const res = await fetch(
        `/api/admin/homepage.php?type=review&id=${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': csrfToken }
        }
      );
      const data = await res.json();
      if (data.success) {
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to delete Review'));
      }
    } catch (e) {
      alert('Error deleting Review');
    }
  };

  const handleSaveArticle = async (artObj: {
    id: string;
    title: string;
    date: string;
    publisher: string;
    description: string;
    image: string;
  }) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'article',
          ...artObj
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Article saved successfully!');
        setEditingArticle(null);
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Article'));
      }
    } catch (e) {
      alert('Error saving Article');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Article?')) return;
    try {
      const res = await fetch(
        `/api/admin/homepage.php?type=article&id=${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          headers: { 'X-CSRF-Token': csrfToken }
        }
      );
      const data = await res.json();
      if (data.success) {
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to delete Article'));
      }
    } catch (e) {
      alert('Error deleting Article');
    }
  };

  const inputCls =
    'w-full h-9 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors';
  const primaryBtnCls =
    'h-9 px-4 rounded-md bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-medium inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 whitespace-nowrap';
  const secondaryBtnCls =
    'h-9 px-3.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap';

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-zinc-900 dark:text-zinc-100" />
        <span>Loading live CMS content from database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
          Homepage Content Builder
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Modify live homepage copy, hero carousel, campaign banners, marquee ticker, FAQs, and reviews
        </p>
      </div>

      {/* Segmented Tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/80 dark:border-zinc-800 gap-1">
          {[
            { id: 'hero', label: 'Hero Banner' },
            { id: 'campaigns', label: 'Campaign Banners' },
            { id: 'seasons', label: 'Seasons Gallery' },
            { id: 'video', label: 'Video Showcase' },
            { id: 'sections', label: 'Custom Sections' },
            { id: 'marquee', label: 'Marquee Ticker' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'faqs', label: 'FAQs' },
            { id: 'articles', label: 'Journal Articles' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Hero 3-Carousel Banner Form */}
      {activeTab === 'hero' && (
        <form
          onSubmit={handleSaveHero}
          className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-6 space-y-6 text-xs"
        >
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                Hero 3-Carousel Settings (Media + Text + Product CTA)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
              3 Slides Active
            </span>
          </div>

          {/* Shared Secondary "Shop All" Button Text */}
          <div className="bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-4 max-w-md space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Second Button Text (Links to Shop All Collection)
            </label>
            <input
              type="text"
              value={heroForm.secondary_cta_text}
              onChange={(e) => setHeroForm({ ...heroForm, secondary_cta_text: e.target.value })}
              placeholder="Shop All"
              className={inputCls}
            />
          </div>

          {/* 3 Carousel Slide Cards */}
          <div className="space-y-5">
            {heroSlides.map((slide, idx) => {
              const slotLabel =
                idx === 0
                  ? 'Slide 1 — Primary Carousel'
                  : idx === 1
                  ? 'Slide 2 — Secondary Carousel'
                  : 'Slide 3 — Final Carousel';

              return (
                <div
                  key={idx}
                  className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/70 dark:border-zinc-800">
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {slotLabel}
                    </h4>

                    <div className="inline-flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-900 p-0.5 rounded-md self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleUpdateHeroSlide(idx, { media_type: 'image' })}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded cursor-pointer transition-colors ${
                          slide.media_type === 'image'
                            ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateHeroSlide(idx, { media_type: 'video' })}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded cursor-pointer transition-colors ${
                          slide.media_type === 'video'
                            ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        Video
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Eyebrow Text
                      </label>
                      <input
                        type="text"
                        value={slide.eyebrow}
                        onChange={(e) => handleUpdateHeroSlide(idx, { eyebrow: e.target.value })}
                        placeholder="e.g. SEASON '26"
                        className={inputCls}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Main Headline Text
                      </label>
                      <input
                        type="text"
                        value={slide.headline}
                        onChange={(e) => handleUpdateHeroSlide(idx, { headline: e.target.value })}
                        placeholder="e.g. COLLECTION IS LIVE"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Primary CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={slide.cta_text}
                        onChange={(e) => handleUpdateHeroSlide(idx, { cta_text: e.target.value })}
                        placeholder="e.g. View Car / Shop Model"
                        className={inputCls}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Assigned Product (Button Link)
                      </label>
                      <select
                        value={slide.product_id}
                        onChange={(e) => handleUpdateHeroSlide(idx, { product_id: e.target.value })}
                        className={`${inputCls} cursor-pointer`}
                      >
                        <option value="">-- Select Product (or scroll to grid) --</option>
                        {availableProducts.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.brand} — {prod.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <ImageUploader
                      label={
                        slide.media_type === 'video'
                          ? 'Poster / Fallback Image'
                          : 'Slide Background Image'
                      }
                      value={slide.image}
                      onChange={(url) => handleUpdateHeroSlide(idx, { image: url })}
                      csrfToken={csrfToken}
                    />

                    <VideoUploader
                      label="Slide Background Video (.mp4 / .webm)"
                      value={slide.video_url}
                      onChange={(url) =>
                        handleUpdateHeroSlide(idx, {
                          video_url: url,
                          media_type: url ? 'video' : slide.media_type
                        })
                      }
                      csrfToken={csrfToken}
                      placeholder="Upload video or paste .mp4 URL"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex justify-end">
            <button type="submit" disabled={saving} className={primaryBtnCls}>
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Hero Carousel'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Campaign Banners (For Him / For Her) */}
      {activeTab === 'campaigns' && (
        <form
          onSubmit={handleSaveCampaignBanners}
          className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-6 space-y-6 text-xs"
        >
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              Division Campaign Banners
            </h3>
          </div>

          <div className="max-w-md space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Section Title
            </label>
            <input
              type="text"
              value={campaignForm.section_title}
              onChange={(e) => setCampaignForm({ ...campaignForm, section_title: e.target.value })}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* For Him Box */}
            <div className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-5 space-y-4">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 pb-2.5 border-b border-zinc-200/70 dark:border-zinc-800">
                Left Campaign Banner
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Title
                  </label>
                  <input
                    type="text"
                    value={campaignForm.for_him_title}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, for_him_title: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={campaignForm.for_him_button_text}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, for_him_button_text: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <ImageUploader
                label="Campaign Image"
                value={campaignForm.for_him_image}
                onChange={(url) => setCampaignForm({ ...campaignForm, for_him_image: url })}
                csrfToken={csrfToken}
              />
            </div>

            {/* For Her Box */}
            <div className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-5 space-y-4">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 pb-2.5 border-b border-zinc-200/70 dark:border-zinc-800">
                Right Campaign Banner
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Title
                  </label>
                  <input
                    type="text"
                    value={campaignForm.for_her_title}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, for_her_title: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={campaignForm.for_her_button_text}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, for_her_button_text: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <ImageUploader
                label="Campaign Image"
                value={campaignForm.for_her_image}
                onChange={(url) => setCampaignForm({ ...campaignForm, for_her_image: url })}
                csrfToken={csrfToken}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex justify-end">
            <button type="submit" disabled={saving} className={primaryBtnCls}>
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Campaign Banners'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Seasons Gallery */}
      {activeTab === 'seasons' && (
        <form
          onSubmit={handleSaveSeasonsGallery}
          className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-6 space-y-6 text-xs"
        >
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              Seasons Campaign Gallery
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Section Title
              </label>
              <input
                type="text"
                value={seasonsHeader.section_title}
                onChange={(e) =>
                  setSeasonsHeader({ ...seasonsHeader, section_title: e.target.value })
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Section Subtitle
              </label>
              <input
                type="text"
                value={seasonsHeader.section_subtitle}
                onChange={(e) =>
                  setSeasonsHeader({ ...seasonsHeader, section_subtitle: e.target.value })
                }
                className={inputCls}
              />
            </div>
          </div>

          {/* Season Cards Manager */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Seasonal Cards ({seasonCards.length})
              </h4>
              <button type="button" onClick={handleAddSeasonCard} className={secondaryBtnCls}>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Season Card</span>
              </button>
            </div>

            {seasonCards.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                No season cards configured. Click &quot;Add Season Card&quot; to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seasonCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-200/70 dark:border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          Season #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSeasonCard(idx, 'up')}
                            className="p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 disabled:opacity-30 rounded cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === seasonCards.length - 1}
                            onClick={() => handleMoveSeasonCard(idx, 'down')}
                            className="p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 disabled:opacity-30 rounded cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSeasonCard(card.id)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Season Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Card Name
                        </label>
                        <input
                          type="text"
                          value={card.name}
                          onChange={(e) => handleUpdateSeasonCard(card.id, { name: e.target.value })}
                          className={inputCls}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Description
                        </label>
                        <input
                          type="text"
                          value={card.description}
                          onChange={(e) =>
                            handleUpdateSeasonCard(card.id, { description: e.target.value })
                          }
                          className={inputCls}
                        />
                      </div>

                      <ImageUploader
                        label="Seasonal Image"
                        value={card.image}
                        onChange={(url) => handleUpdateSeasonCard(card.id, { image: url })}
                        csrfToken={csrfToken}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex justify-end">
            <button type="submit" disabled={saving} className={primaryBtnCls}>
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Seasons Gallery'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Premium Video Showcase Manager */}
      {activeTab === 'video' && (
        <form
          onSubmit={handleSaveVideoShowcase}
          className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-6 space-y-6 text-xs"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                Video Product Showcase Settings
              </h3>
            </div>
            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <span className="text-zinc-600 dark:text-zinc-400 text-xs font-medium">
                Section Active
              </span>
              <input
                type="checkbox"
                checked={showcaseHeader.is_enabled}
                onChange={(e) =>
                  setShowcaseHeader({ ...showcaseHeader, is_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:peer-checked:after:bg-zinc-950 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100 relative" />
            </label>
          </div>

          {/* Section Header Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Badge / Ribbon Text
              </label>
              <input
                type="text"
                value={showcaseHeader.badge_text}
                onChange={(e) =>
                  setShowcaseHeader({ ...showcaseHeader, badge_text: e.target.value })
                }
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Section Headline
              </label>
              <input
                type="text"
                value={showcaseHeader.headline}
                onChange={(e) =>
                  setShowcaseHeader({ ...showcaseHeader, headline: e.target.value })
                }
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Tagline Narrative
              </label>
              <input
                type="text"
                value={showcaseHeader.tagline}
                onChange={(e) => setShowcaseHeader({ ...showcaseHeader, tagline: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          {/* Cards List Manager */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Showcase Video Cards ({showcaseCards.length})
              </h4>
              <button type="button" onClick={handleAddCard} className={secondaryBtnCls}>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Video Card</span>
              </button>
            </div>

            {showcaseCards.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                No video cards in showcase. Click &quot;Add Video Card&quot; to start.
              </div>
            ) : (
              <div className="space-y-4">
                {showcaseCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-4 space-y-4"
                  >
                    {/* Top Bar for Card */}
                    <div className="flex items-center justify-between border-b border-zinc-200/70 dark:border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          Card #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveCard(idx, 'up')}
                            className="p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 disabled:opacity-30 rounded cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === showcaseCards.length - 1}
                            onClick={() => handleMoveCard(idx, 'down')}
                            className="p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 disabled:opacity-30 rounded cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
                            Enabled
                          </span>
                          <input
                            type="checkbox"
                            checked={card.is_enabled !== false}
                            onChange={(e) =>
                              handleUpdateCard(card.id, { is_enabled: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:peer-checked:after:bg-zinc-950 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100 relative" />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Content Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Associated Product (Optional)
                          </label>
                          <select
                            value={card.product_id || ''}
                            onChange={(e) =>
                              handleUpdateCard(card.id, { product_id: e.target.value })
                            }
                            className={inputCls}
                          >
                            <option value="">-- Custom (No direct product link) --</option>
                            {availableProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.brand} - {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Card Title (Displayed on bottom panel)
                          </label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                            placeholder="Product name or headline"
                            className={inputCls}
                          />
                        </div>
                      </div>

                      <div>
                        <ImageUploader
                          label="Product Thumbnail Image"
                          value={card.thumbnail_url || ''}
                          onChange={(url) => handleUpdateCard(card.id, { thumbnail_url: url })}
                          csrfToken={csrfToken}
                          placeholder="Select thumbnail or upload image"
                        />
                      </div>
                    </div>

                    <div>
                      <VideoUploader
                        label="Product Video File (.mp4 / .webm)"
                        value={card.video_url}
                        onChange={(url) => handleUpdateCard(card.id, { video_url: url })}
                        csrfToken={csrfToken}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex justify-end">
            <button type="submit" disabled={saving} className={primaryBtnCls}>
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Video Showcase'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Custom Product Sections Form */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              Custom Dynamic Homepage Sections
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Customize up to 4 dynamic product collection sections on your storefront. Rename titles and select assigned products.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[
              'custom_section_1',
              'custom_section_2',
              'custom_section_3',
              'custom_section_4'
            ].map((secKey, idx) => {
              const sec = customSections[secKey] || {
                title: `Collection Section ${idx + 1}`,
                subtitle: 'Curated selection',
                is_enabled: true,
                product_ids: []
              };

              return (
                <div
                  key={secKey}
                  className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-5 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Section #{idx + 1}{' '}
                      <span className="text-zinc-400 font-normal">({secKey})</span>
                    </span>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
                        Active
                      </span>
                      <input
                        type="checkbox"
                        checked={sec.is_enabled}
                        onChange={(e) => {
                          setCustomSections({
                            ...customSections,
                            [secKey]: { ...sec, is_enabled: e.target.checked }
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:peer-checked:after:bg-zinc-950 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100 relative" />
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => {
                        setCustomSections({
                          ...customSections,
                          [secKey]: { ...sec, title: e.target.value }
                        });
                      }}
                      className={inputCls}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Subtitle / Descriptor
                    </label>
                    <input
                      type="text"
                      value={sec.subtitle}
                      onChange={(e) => {
                        setCustomSections({
                          ...customSections,
                          [secKey]: { ...sec, subtitle: e.target.value }
                        });
                      }}
                      className={inputCls}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Assigned Products ({sec.product_ids.length} selected)
                    </label>
                    <div className="max-h-40 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-1.5 space-y-1">
                      {availableProducts.map((p) => {
                        const isSelected = sec.product_ids.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <span className="truncate pr-2">
                              <strong className="font-semibold">{p.brand}</strong> — {p.name}
                            </span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const nextIds = e.target.checked
                                  ? [...sec.product_ids, p.id]
                                  : sec.product_ids.filter((id) => id !== p.id);
                                setCustomSections({
                                  ...customSections,
                                  [secKey]: { ...sec, product_ids: nextIds }
                                });
                              }}
                              className="accent-zinc-900 dark:accent-zinc-100 cursor-pointer shrink-0"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveCustomSection(secKey)}
                      className={primaryBtnCls}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Section #{idx + 1}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Marquee Form */}
      {activeTab === 'marquee' && (
        <form
          onSubmit={handleSaveMarquee}
          className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-6 space-y-5 text-xs"
        >
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <Layout className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              Category Marquee Ticker Settings
            </h3>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Infinite Marquee Words / Ticker Items (comma-separated)
            </label>
            <input
              type="text"
              value={marqueeText}
              onChange={(e) => setMarqueeText(e.target.value)}
              placeholder="CURATE, JUDGE, REFINE, TEST"
              className={`${inputCls} font-mono`}
            />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Example: CURATE, JUDGE, REFINE, TEST, COLLECTOR EDITIONS
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex justify-end">
            <button type="submit" disabled={saving} className={primaryBtnCls}>
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Marquee Ticker'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 5: Reviews Manager */}
      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-6 space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              Customer Reviews ({reviews.length})
            </h3>
            <button
              onClick={() =>
                setEditingReview({
                  id: 'rev-' + Date.now(),
                  quote: 'Awesome build quality!',
                  content: '100% authentic model and fast shipping in Dhaka!',
                  author: 'New Customer',
                  rating: 5
                })
              }
              className={primaryBtnCls}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Review</span>
            </button>
          </div>

          {editingReview && (
            <div className="bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 rounded-lg">
              <h4 className="font-semibold text-zinc-950 dark:text-zinc-100 text-xs">
                {reviews.some((r) => r.id === editingReview.id)
                  ? 'Edit Review'
                  : 'Create New Review'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={editingReview.author}
                    onChange={(e) =>
                      setEditingReview({ ...editingReview, author: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Rating (1–5 Stars)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editingReview.rating}
                    onChange={(e) =>
                      setEditingReview({ ...editingReview, rating: Number(e.target.value) })
                    }
                    className={`${inputCls} font-mono tabular-nums`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Quote Headline
                </label>
                <input
                  type="text"
                  value={editingReview.quote}
                  onChange={(e) => setEditingReview({ ...editingReview, quote: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Full Review Body Text
                </label>
                <textarea
                  value={editingReview.content}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, content: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={() => setEditingReview(null)} className={secondaryBtnCls}>
                  Cancel
                </button>
                <button onClick={() => handleSaveReview(editingReview)} className={primaryBtnCls}>
                  Save Review
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-950 dark:text-zinc-100 text-xs">
                    {rev.author}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300 text-xs">
                    {'★'.repeat(rev.rating)}
                  </span>
                </div>
                <p className="text-zinc-900 dark:text-zinc-200 font-medium text-xs">
                  &ldquo;{rev.quote}&rdquo;
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                  {rev.content}
                </p>
                <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-800 flex justify-end gap-1">
                  <button
                    onClick={() => setEditingReview(rev)}
                    className="p-1.5 rounded text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1.5 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: FAQs Manager */}
      {activeTab === 'faqs' && (
        <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-6 space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              Frequently Asked Questions ({faqs.length})
            </h3>
            <button
              onClick={() =>
                setEditingFaq({
                  id: 'faq-' + Date.now(),
                  question: 'New Question Title?',
                  answer: 'Detailed answer response explaining order or shipping policies.'
                })
              }
              className={primaryBtnCls}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </div>

          {editingFaq && (
            <div className="bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 rounded-lg">
              <h4 className="font-semibold text-zinc-950 dark:text-zinc-100 text-xs">
                {faqs.some((f) => f.id === editingFaq.id) ? 'Edit FAQ' : 'Create New FAQ'}
              </h4>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Question Title
                </label>
                <input
                  type="text"
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Detailed Answer Text
                </label>
                <textarea
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  rows={3}
                  className="w-full rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={() => setEditingFaq(null)} className={secondaryBtnCls}>
                  Cancel
                </button>
                <button onClick={() => handleSaveFaq(editingFaq)} className={primaryBtnCls}>
                  Save FAQ
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-4 flex justify-between items-start gap-4"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-950 dark:text-zinc-100 text-xs">
                    {faq.question}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditingFaq(faq)}
                    className="p-1.5 rounded text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-1.5 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Articles Manager */}
      {activeTab === 'articles' && (
        <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-6 space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              Journal / Editorial Articles ({articles.length})
            </h3>
            <button
              onClick={() =>
                setEditingArticle({
                  id: 'art-' + Date.now(),
                  title: 'New Article Headline',
                  date: 'FEB 20, 2026',
                  publisher: 'APEX PADDOCK',
                  description:
                    'Short introduction or preview snippet of the editorial collector guide.',
                  image: '/src/assets/images/article_decant_buyers_guide_1791908274237.jpg'
                })
              }
              className={primaryBtnCls}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Article</span>
            </button>
          </div>

          {editingArticle && (
            <div className="bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 rounded-lg">
              <h4 className="font-semibold text-zinc-950 dark:text-zinc-100 text-xs">
                {articles.some((a) => a.id === editingArticle.id)
                  ? 'Edit Article'
                  : 'Create New Article'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Article Title
                  </label>
                  <input
                    type="text"
                    value={editingArticle.title}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, title: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Date String
                  </label>
                  <input
                    type="text"
                    value={editingArticle.date}
                    onChange={(e) => setEditingArticle({ ...editingArticle, date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={editingArticle.publisher}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, publisher: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <ImageUploader
                label="Cover Image"
                value={editingArticle.image}
                onChange={(url) => setEditingArticle({ ...editingArticle, image: url })}
                csrfToken={csrfToken}
              />
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Description / Excerpt Snippet
                </label>
                <textarea
                  value={editingArticle.description}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={() => setEditingArticle(null)} className={secondaryBtnCls}>
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveArticle(editingArticle)}
                  className={primaryBtnCls}
                >
                  Save Article
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {articles.map((art) => (
              <div
                key={art.id}
                className="bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-4 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full aspect-[4/3] object-cover rounded-md mb-2.5 border border-zinc-200/60 dark:border-zinc-800"
                  />
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                    {art.date} · {art.publisher}
                  </span>
                  <h4 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100 mt-1">
                    {art.title}
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-1 line-clamp-3 leading-relaxed">
                    {art.description}
                  </p>
                </div>
                <div className="pt-2.5 border-t border-zinc-200/70 dark:border-zinc-800 flex justify-end gap-1">
                  <button
                    onClick={() => setEditingArticle(art)}
                    className="p-1.5 rounded text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(art.id)}
                    className="p-1.5 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
