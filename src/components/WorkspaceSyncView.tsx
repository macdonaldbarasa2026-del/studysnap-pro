import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, MessageSquare, RefreshCw, Layers } from 'lucide-react';
import { getGoogleAuthToken, initAuth, getCachedToken } from '../lib/googleAuth';

interface WorkspaceSyncViewProps {
  onBack: () => void;
}

export const WorkspaceSyncView: React.FC<WorkspaceSyncViewProps> = ({ onBack }) => {
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, accessToken) => {
        setToken(accessToken);
        setNeedsAuth(false);
        await fetchWorkspaceData(accessToken);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    
    // Also try to check if token exists already
    getCachedToken().then(t => {
      if (t) {
        setToken(t);
        setNeedsAuth(false);
        fetchWorkspaceData(t);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await getGoogleAuthToken();
      setToken(accessToken);
      setNeedsAuth(false);
      await fetchWorkspaceData(accessToken);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to authenticate with Study Workspace');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceData = async (accessToken: string) => {
    try {
      // Fetch Classroom sync Courses
      const coursesRes = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
      }

      // Fetch Chat sync Spaces
      const spacesRes = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (spacesRes.ok) {
        const spacesData = await spacesRes.json();
        setSpaces(spacesData.spaces || []);
      }
    } catch (err) {
      console.error('Error fetching workspace data:', err);
      setError('Failed to fetch data from Study Workspace');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="p-6 bg-white sticky top-0 z-10 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Study Workspace</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8 mt-4">
        {needsAuth ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <Layers size={48} className="mx-auto text-indigo-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sync Your School Accounts</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Sync your Classroom sync and Chat sync to access assignments, coursework, and study groups directly in StudySnap.
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : null}
              {loading ? 'Syncing...' : 'Sync Workspace Data'}
            </button>
            {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-emerald-800 font-medium text-sm">Successfully connected to Study Workspace</p>
              <button 
                onClick={() => fetchWorkspaceData(token)}
                className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors"
                title="Sync Now"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Classroom Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="text-emerald-600" size={24} />
                  <h2 className="text-xl font-bold text-slate-900">Classroom Courses</h2>
                </div>
                {courses.length === 0 ? (
                  <div className="p-6 border border-slate-200 rounded-3xl bg-white text-center">
                    <p className="text-slate-500 text-sm">No active courses found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.map((course: any) => (
                      <a 
                        key={course.id} 
                        href={course.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-5 border border-slate-200 rounded-3xl bg-white hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                      >
                        <h3 className="font-bold text-slate-900 line-clamp-1">{course.name}</h3>
                        {course.section && <p className="text-xs text-slate-500 mt-1">{course.section}</p>}
                        <div className="mt-4 flex gap-2">
                          <span 
                            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full"
                          >
                            Open in Classroom →
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="text-blue-600" size={24} />
                  <h2 className="text-xl font-bold text-slate-900">Chat Spaces</h2>
                </div>
                {spaces.length === 0 ? (
                  <div className="p-6 border border-slate-200 rounded-3xl bg-white text-center">
                    <p className="text-slate-500 text-sm">No chat spaces found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {spaces.map((space: any) => (
                      <a 
                        key={space.name} 
                        href={`https://chat.google.com/room/${space.name.replace('spaces/', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-5 border border-slate-200 rounded-3xl bg-white hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                      >
                        <h3 className="font-bold text-slate-900 line-clamp-1">{space.displayName || 'Direct Message'}</h3>
                        <p className="text-xs text-slate-500 mt-1 capitalize">{space.spaceType?.replace('_', ' ').toLowerCase() || 'Space'}</p>
                        <div className="mt-4 flex gap-2">
                          <span 
                            className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full"
                          >
                            Open in Chat →
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
