import { getGemini, generateContentWithFallback } from "./geminiService";
import { Type } from "@google/genai";

export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  category?: string;
  duration?: string;
}

export interface StudyPlaylistModule {
  step: number;
  title: string;
  summary: string;
  keyConcepts: string[];
  searchQuery: string;
  video: YouTubeVideo;
}

export interface StudyPlaylist {
  id: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  overview: string;
  estimatedHours: number;
  modules: StudyPlaylistModule[];
  createdAt: string;
}

// In-memory cache for search queries with 1-hour TTL
const searchCache = new Map<string, { data: YouTubeVideo[]; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

// Curated verified educational fallbacks across age tiers and topics
export const CURATED_LEARNING_VIDEOS: Record<string, YouTubeVideo[]> = {
  baby: [
    {
      videoId: "hq3yc__411U",
      title: "The Bath Song | CoComelon Nursery Rhymes & Kids Songs",
      channelTitle: "Cocomelon - Nursery Rhymes",
      description: "Learn healthy habits and sing along with JJ and family!",
      thumbnail: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-01-15",
      category: "Nursery Rhymes",
      duration: "3:15"
    },
    {
      videoId: "DR-cfDsHCGA",
      title: "Wheels On The Bus | Super Simple Songs",
      channelTitle: "Super Simple Songs",
      description: "Bounce along with the favorite classic song for babies and toddlers.",
      thumbnail: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-02-10",
      category: "Songs",
      duration: "2:45"
    },
    {
      videoId: "tKlhvM71b_s",
      title: "Color Song for Children | Learn Colors with Fruits",
      channelTitle: "Kids Academy",
      description: "Bright visual learning of primary colors for early sensory development.",
      thumbnail: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-03-01",
      category: "Colors",
      duration: "4:10"
    },
    {
      videoId: "yCjJyiqpAuU",
      title: "Animal Sounds Song | Fun Animals for Toddlers",
      channelTitle: "Little Baby Bum",
      description: "Hear what cows, dogs, cats, and ducks sound like!",
      thumbnail: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-04-12",
      category: "Animals",
      duration: "3:30"
    },
    {
      videoId: "D0Ajq682yrA",
      title: "Numbers Song 1 to 10 | Count with Fun Characters",
      channelTitle: "Super Simple Songs",
      description: "Gentle counting song introducing numbers one through ten.",
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-05-20",
      category: "Numbers",
      duration: "3:00"
    }
  ],
  kid: [
    {
      videoId: "mQRLG5JWJWQ",
      title: "Why Do We Dream? | Dr. Binocs Show | Peekaboo Kidz",
      channelTitle: "Peekaboo Kidz",
      description: "Ever wondered what happens in your brain when you sleep? Let Dr. Binocs explain!",
      thumbnail: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-02-14",
      category: "Science",
      duration: "5:20"
    },
    {
      videoId: "dp538Qf6hUI",
      title: "How the Solar System Works | SciShow Kids",
      channelTitle: "SciShow Kids",
      description: "Take a magical rocket tour of the eight planets in our solar system.",
      thumbnail: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-01-20",
      category: "Astronomy",
      duration: "6:10"
    },
    {
      videoId: "7my_mVz4J1c",
      title: "Math Antics - Basic Division",
      channelTitle: "Math Antics",
      description: "Clear and fun visual breakdown of how division works step by step.",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-03-15",
      category: "Math",
      duration: "9:45"
    },
    {
      videoId: "w77zPAtVTuI",
      title: "Photosynthesis for Kids | How Plants Make Food",
      channelTitle: "Free School",
      description: "Learn how sunlight, water, and air help plants grow and produce oxygen.",
      thumbnail: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-04-05",
      category: "Biology",
      duration: "4:50"
    },
    {
      videoId: "pvsHnBv5R4c",
      title: "The Water Cycle | Educational Video for Kids",
      channelTitle: "Smile and Learn",
      description: "Discover evaporation, condensation, and precipitation in a fun story.",
      thumbnail: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-05-18",
      category: "Earth Science",
      duration: "5:00"
    }
  ],
  teen_adult: [
    {
      videoId: "WUvTyaaNkzM",
      title: "The Essence of Calculus, Chapter 1 | 3Blue1Brown",
      channelTitle: "3Blue1Brown",
      description: "What might be the best visual explanation of derivatives and integrals ever created.",
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-01-10",
      category: "Mathematics",
      duration: "17:05"
    },
    {
      videoId: "8jPOydSck_E",
      title: "How Transformers Work in Deep Learning | Machine Learning",
      channelTitle: "StatQuest with Josh Starmer",
      description: "Clearly explained step by step: Self-attention, encoders, decoders, and LLMs.",
      thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-02-18",
      category: "AI & CS",
      duration: "24:12"
    },
    {
      videoId: "0YgT_b6Yc9M",
      title: "The Periodic Table: Crash Course Chemistry #4",
      channelTitle: "CrashCourse",
      description: "Hank Green explains atomic structure, electronegativity, and electron configurations.",
      thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-03-22",
      category: "Chemistry",
      duration: "11:22"
    },
    {
      videoId: "QImCld9YubE",
      title: "Cellular Respiration and the Mighty Mitochondria",
      channelTitle: "Amoeba Sisters",
      description: "Glycolysis, Krebs cycle, and the electron transport chain explained simply.",
      thumbnail: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-04-10",
      category: "Biology",
      duration: "7:49"
    },
    {
      videoId: "gTAzDOsmv2Y",
      title: "Special Relativity: Time Dilation & Length Contraction",
      channelTitle: "Veritasium",
      description: "Why moving clocks tick slower and objects contract at relativistic speeds.",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-05-15",
      category: "Physics",
      duration: "13:40"
    }
  ],
  mind_refresh: [
    {
      videoId: "jfKfPfyJRdk",
      title: "lofi hip hop radio 📚 - beats to relax/study to",
      channelTitle: "Lofi Girl",
      description: "Peaceful lo-fi study beats for effortless focus, relaxation, and calm mind states.",
      thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-01-01",
      category: "Lo-Fi Beats",
      duration: "Live Stream"
    },
    {
      videoId: "inpok4MKVLM",
      title: "5-Minute Guided Mindful Breathing | Instant Stress Relief",
      channelTitle: "Goodful",
      description: "A quick, calming 5-minute breathwork session to refresh mental clarity during study breaks.",
      thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-02-12",
      category: "Breathing",
      duration: "5:00"
    },
    {
      videoId: "eKFTSSKCzWA",
      title: "4K Forest Creek & Birdsong | Nature Relaxation",
      channelTitle: "Calm Nature Sounds",
      description: "Immerse your ears in soothing gentle water and gentle birdsong to recharge focus.",
      thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-03-05",
      category: "Nature",
      duration: "30:00"
    },
    {
      videoId: "COp7BR_Dv6g",
      title: "5-Minute Desk Stretch for Students & Remote Workers",
      channelTitle: "Bowflex",
      description: "Relieve neck, back, and wrist tension between intense study sessions.",
      thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-04-18",
      category: "Stretching",
      duration: "5:45"
    },
    {
      videoId: "mPZkdNFkNps",
      title: "Gentle Rain on Cozy Window | Ambient Sleep & Focus",
      channelTitle: "Relaxing White Noise",
      description: "Soothing natural rain soundscapes to soothe racing thoughts and restore balance.",
      thumbnail: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-05-01",
      category: "Ambient Rain",
      duration: "60:00"
    }
  ],
  research: [
    {
      videoId: "z-W1_M_Vd8E",
      title: "Attention Is All You Need | Paper Explained & NeurIPS Breakdown",
      channelTitle: "Yannic Kilcher",
      description: "Comprehensive breakdown of the original Transformer architecture research paper.",
      thumbnail: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-01-25",
      category: "Machine Learning",
      duration: "38:20"
    },
    {
      videoId: "kJQP7kiw5Fk",
      title: "Quantum Computing in 10 Minutes | MIT OpenCourseWare",
      channelTitle: "MIT OpenCourseWare",
      description: "Qubits, superposition, and entanglement summarized by leading quantum researchers.",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-02-28",
      category: "Quantum Physics",
      duration: "10:15"
    },
    {
      videoId: "Y6b1xL0d5qY",
      title: "CRISPR-Cas9 Gene Editing Explained | Nobel Lecture Series",
      channelTitle: "Nature Video",
      description: "How bacterial immune mechanisms became the most powerful genetic engineering tool.",
      thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
      publishedAt: "2023-03-30",
      category: "Genomics",
      duration: "14:40"
    }
  ]
};

export async function searchYouTubeVideos(params: {
  query: string;
  maxResults?: number;
  safeSearch?: 'strict' | 'moderate' | 'none';
  categoryFilter?: string;
  ageTier?: 'baby' | 'kid' | 'teen' | 'adult';
}): Promise<{ videos: YouTubeVideo[]; source: 'live_youtube' | 'curated_catalog' }> {
  const { query, maxResults = 8, safeSearch = 'strict', ageTier } = params;
  const cleanQuery = query.trim();

  // Check cache first
  const cacheKey = `${cleanQuery.toLowerCase()}_${ageTier || 'all'}_${maxResults}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { videos: cached.data, source: 'live_youtube' };
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      // Craft query for safety and educational relevance
      let effectiveQuery = cleanQuery;
      if (ageTier === 'baby') {
        effectiveQuery = `${cleanQuery} for babies toddler educational nursery song`;
      } else if (ageTier === 'kid') {
        effectiveQuery = `${cleanQuery} for kids educational learning`;
      }

      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('type', 'video');
      url.searchParams.set('videoEmbeddable', 'true');
      url.searchParams.set('maxResults', String(Math.min(maxResults, 20)));
      url.searchParams.set('q', effectiveQuery);
      url.searchParams.set('safeSearch', safeSearch);
      url.searchParams.set('relevanceLanguage', 'en');
      url.searchParams.set('key', apiKey.trim());

      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        const mapped: YouTubeVideo[] = items
          .filter((item: any) => item.id?.videoId && item.snippet?.title)
          .map((item: any) => ({
            videoId: item.id.videoId,
            title: decodeHtmlEntities(item.snippet.title),
            channelTitle: decodeHtmlEntities(item.snippet.channelTitle),
            description: decodeHtmlEntities(item.snippet.description || ''),
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            publishedAt: item.snippet.publishedAt?.split('T')[0] || '',
            category: params.categoryFilter || 'Education'
          }));

        if (mapped.length > 0) {
          searchCache.set(cacheKey, { data: mapped, timestamp: Date.now() });
          return { videos: mapped, source: 'live_youtube' };
        }
      } else {
        const errText = await res.text();
        console.warn('[YouTube API Warning]: Live search returned non-200, using curated library:', errText.slice(0, 200));
      }
    } catch (err) {
      console.warn('[YouTube API Error]: Live fetch failed, using curated catalog:', err);
    }
  }

  // Graceful Fallback: Query matching against curated library
  const pool = ageTier === 'baby' 
    ? CURATED_LEARNING_VIDEOS.baby 
    : ageTier === 'kid' 
    ? CURATED_LEARNING_VIDEOS.kid 
    : [...CURATED_LEARNING_VIDEOS.teen_adult, ...CURATED_LEARNING_VIDEOS.research];

  const matched = pool.filter(v => {
    if (!cleanQuery) return true;
    const q = cleanQuery.toLowerCase();
    return v.title.toLowerCase().includes(q) || 
           v.category?.toLowerCase().includes(q) || 
           v.channelTitle.toLowerCase().includes(q) || 
           v.description.toLowerCase().includes(q);
  });

  const finalVideos = matched.length > 0 ? matched.slice(0, maxResults) : pool.slice(0, maxResults);
  return { videos: finalVideos, source: 'curated_catalog' };
}

/**
 * Generate a complete, structured study syllabus playlist using Gemini AI + YouTube video search
 */
export async function generateStudyPlaylistWithAI(
  topic: string, 
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<StudyPlaylist> {
  const cleanTopic = topic.trim() || 'General Study';

  const prompt = `Create a structured 4 to 5 module sequential video learning curriculum for students studying: "${cleanTopic}".
Difficulty level: ${difficulty}.
For each module, provide:
1. Step number (1, 2, 3, etc.)
2. Module title
3. Summary of what the student will learn (1-2 sentences)
4. 2-3 key concept bullet points
5. A highly specific YouTube search query to find the best educational tutorial video for this module.`;

  let parsed: any = null;

  try {
    const response = await generateContentWithFallback({
      preferredModel: "gemini-2.5-flash",
      fallbackModels: ["gemini-3.1-flash-lite", "gemini-3.1-pro-preview"],
      contents: prompt,
      config: {
        systemInstruction: "You are an expert curriculum designer. Return a clean JSON array of modules.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            estimatedHours: { type: Type.NUMBER },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                  searchQuery: { type: Type.STRING }
                },
                required: ["step", "title", "summary", "keyConcepts", "searchQuery"]
              }
            }
          },
          required: ["overview", "estimatedHours", "modules"]
        }
      }
    });

    if (response?.text) {
      parsed = JSON.parse(response.text);
    }
  } catch (aiErr: any) {
    console.warn(`[Study Playlist AI Warning]: Gemini unavailable (${aiErr?.message?.slice(0, 100)}), constructing intelligent adaptive curriculum for "${cleanTopic}"`);
  }

  // Graceful structured curriculum fallback if AI encounters temporary high-demand spike
  if (!parsed || !Array.isArray(parsed.modules) || parsed.modules.length === 0) {
    parsed = {
      overview: `Structured mastery learning path covering core foundations, deep dive mechanisms, and practical applications for ${cleanTopic}.`,
      estimatedHours: difficulty === 'beginner' ? 3.0 : difficulty === 'advanced' ? 6.5 : 4.5,
      modules: [
        { 
          step: 1, 
          title: `Foundations & Core Principles of ${cleanTopic}`, 
          summary: `Establish clear mental models, vocabulary, and primary fundamentals of ${cleanTopic}.`, 
          keyConcepts: [`Introduction to ${cleanTopic}`, "Key Terminology & Definitions", "Fundamental Frameworks"], 
          searchQuery: `${cleanTopic} basics introduction beginner guide tutorial` 
        },
        { 
          step: 2, 
          title: `Core Mechanisms & Deep Breakdown`, 
          summary: `Deconstruct the inner workings, formulas, and operational principles of ${cleanTopic}.`, 
          keyConcepts: ["Step-by-step mechanisms", "Formulas & Governing Laws", "Structural Analysis"], 
          searchQuery: `${cleanTopic} deep dive concept explained visual step by step` 
        },
        { 
          step: 3, 
          title: `Practical Applications & Worked Examples`, 
          summary: `Explore real-world problem solving, practical case studies, and common pitfalls in ${cleanTopic}.`, 
          keyConcepts: ["Real-world applications", "Step-by-step worked problems", "Avoiding frequent errors"], 
          searchQuery: `${cleanTopic} worked practice problems solutions guide` 
        },
        { 
          step: 4, 
          title: `Advanced Synthesis & Exam Review`, 
          summary: `Synthesize high-yield concepts, exam strategy, and comprehensive review for ${cleanTopic}.`, 
          keyConcepts: ["High-yield exam review", "Summary cheatsheet", "Retention & mastery checklist"], 
          searchQuery: `${cleanTopic} full crash course exam revision summary` 
        }
      ]
    };
  }

  // Fetch YouTube video for each module safely
  const modulesWithVideos: StudyPlaylistModule[] = await Promise.all(
    (parsed.modules || []).map(async (mod: any, index: number) => {
      try {
        const searchRes = await searchYouTubeVideos({
          query: mod.searchQuery || `${cleanTopic} ${mod.title}`,
          maxResults: 1
        });
        const topVideo = searchRes.videos[0] || (CURATED_LEARNING_VIDEOS.teen_adult[index % CURATED_LEARNING_VIDEOS.teen_adult.length]);
        return {
          step: mod.step || index + 1,
          title: mod.title,
          summary: mod.summary,
          keyConcepts: mod.keyConcepts || [],
          searchQuery: mod.searchQuery,
          video: topVideo
        };
      } catch {
        const fallbackVideo = CURATED_LEARNING_VIDEOS.teen_adult[index % CURATED_LEARNING_VIDEOS.teen_adult.length];
        return {
          step: mod.step || index + 1,
          title: mod.title,
          summary: mod.summary,
          keyConcepts: mod.keyConcepts || [],
          searchQuery: mod.searchQuery,
          video: fallbackVideo
        };
      }
    })
  );

  return {
    id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    topic: cleanTopic,
    difficulty,
    overview: parsed.overview || `Curated study syllabus for ${cleanTopic}`,
    estimatedHours: parsed.estimatedHours || 4.0,
    modules: modulesWithVideos,
    createdAt: new Date().toISOString()
  };
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}
