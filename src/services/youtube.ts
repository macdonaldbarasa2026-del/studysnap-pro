import { authedFetch } from '../lib/authedFetch';

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

/**
 * Fetch educational videos for kids/baby or general learning
 */
export async function getLearningVideos(age: 'baby' | 'kid' | 'teen' | 'adult' = 'kid', topic: string = '', category: string = ''): Promise<YouTubeVideo[]> {
  try {
    const params = new URLSearchParams({ age, ...(topic ? { topic } : {}), ...(category ? { category } : {}) });
    const res = await authedFetch(`/api/learning-videos?${params}`);
    if (!res.ok) throw new Error('Failed to fetch learning videos');
    const data = await res.json();
    return data.videos || [];
  } catch (err) {
    console.error('[YouTube Client Error]:', err);
    return [];
  }
}

/**
 * General YouTube educational search with safe filters
 */
export async function searchYouTubeEducational(query: string, ageTier: 'baby' | 'kid' | 'teen' | 'adult' = 'teen', maxResults: number = 8): Promise<YouTubeVideo[]> {
  try {
    const params = new URLSearchParams({ q: query, ageTier, maxResults: String(maxResults) });
    const res = await authedFetch(`/api/youtube/search?${params}`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return data.videos || [];
  } catch (err) {
    console.error('[YouTube Search Error]:', err);
    return [];
  }
}

/**
 * Generate a complete AI-curated study playlist
 */
export async function generateStudyPlaylist(topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<StudyPlaylist> {
  const res = await authedFetch('/api/youtube/study-playlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, difficulty })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate study playlist');
  }
  return res.json();
}

/**
 * Fetch mind refresh break videos
 */
export async function getMindRefreshVideos(category: string = 'all'): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(`/api/youtube/mind-refresh?category=${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error('Failed to load break videos');
    const data = await res.json();
    return data.videos || [];
  } catch (err) {
    console.error('[Mind Refresh Error]:', err);
    return [];
  }
}

/**
 * Fetch research lecture videos
 */
export async function getResearchVideos(query: string = ''): Promise<YouTubeVideo[]> {
  try {
    const params = new URLSearchParams({ ...(query ? { q: query } : {}) });
    const res = await fetch(`/api/youtube/research-videos?${params}`);
    if (!res.ok) throw new Error('Failed to load research videos');
    const data = await res.json();
    return data.videos || [];
  } catch (err) {
    console.error('[Research Videos Error]:', err);
    return [];
  }
}
