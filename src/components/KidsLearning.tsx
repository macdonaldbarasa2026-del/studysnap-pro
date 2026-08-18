import React from 'react';
import { VideoShelf } from './VideoShelf';
export const KidsLearning: React.FC<{ onBack: () => void }> = ({ onBack }) => <div className="min-h-screen bg-amber-50 p-6 pb-32"><button onClick={onBack} className="mb-5 px-4 py-2 rounded-xl bg-white font-bold">Back</button><VideoShelf age="kid" /></div>;
export default KidsLearning;
