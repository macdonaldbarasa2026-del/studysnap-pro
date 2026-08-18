import React from 'react';
import { AdaptiveHome } from '../AdaptiveHome';
import { UserProfile, Subject, FocusStats, Theme } from '../../types';
import { hapticClick } from '../../lib/haptics';

interface HomeViewProps {
  userProfile: UserProfile | null;
  subjects: Subject[];
  stats: FocusStats;
  setView: (view: any) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  setIsThemePickerOpen: (isOpen: boolean) => void;
  setIsAddingSubject: (isOpen: boolean) => void;
  setSelectedSubject: (subject: Subject) => void;
  fetchNotes: (subjectId: string) => void;
  setIsFocusMode: (isOpen: boolean) => void;
  theme: Theme;
}

export const HomeView: React.FC<HomeViewProps> = ({
  userProfile,
  subjects,
  stats,
  setView,
  setIsMenuOpen,
  setIsThemePickerOpen,
  setIsAddingSubject,
  setSelectedSubject,
  fetchNotes,
  setIsFocusMode,
  theme,
}) => {
  const handleViewChange = (v: any) => {
    hapticClick();
    setView(v);
  };

  return (
    <AdaptiveHome 
      userProfile={userProfile}
      subjects={subjects}
      stats={stats}
      onViewChange={handleViewChange}
      themeName={theme}
      onMenuOpen={() => {
        hapticClick();
        setIsMenuOpen(true);
      }}
      onThemePickerOpen={() => {
        hapticClick();
        setIsThemePickerOpen(true);
      }}
      onAddSubject={() => {
        hapticClick();
        setIsAddingSubject(true);
      }}
      onSelectSubject={(s) => {
        hapticClick();
        setSelectedSubject(s);
        fetchNotes(s.id);
        setView('subject');
      }}
      onFocusMode={() => {
        hapticClick();
        setIsFocusMode(true);
      }}
    />
  );
};
