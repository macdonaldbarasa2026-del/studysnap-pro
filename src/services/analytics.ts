import { Timestamp } from 'firebase/firestore';

/**
 * Advanced Learning Data Analytics (Pythonic approach to data modeling).
 * Used for generating precise learning curves and "Neural Statistics".
 */

export interface LearningMetric {
  date: string;
  intensity: number;
  retention: number;
}

export class NeuralAnalytics {
  /**
   * Processes raw activity logs into a formatted learning intensity map.
   */
  static processLearningCurve(activities: any[]): LearningMetric[] {
    const map = new Map<string, { intensity: number; correct: number; total: number }>();

    activities.forEach(activity => {
      const date = activity.created_at instanceof Timestamp 
        ? activity.created_at.toDate().toISOString().split('T')[0]
        : new Date(activity.created_at).toISOString().split('T')[0];
      
      const record = map.get(date) || { intensity: 0, correct: 0, total: 0 };
      record.intensity += 1;
      
      if (activity.type === 'quiz_taken' && activity.accuracy !== undefined) {
        record.correct += activity.accuracy;
        record.total += 1;
      }
      
      map.set(date, record);
    });

    return Array.from(map.entries()).map(([date, stats]) => ({
      date,
      intensity: stats.intensity,
      retention: stats.total > 0 ? (stats.correct / stats.total) : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }
}
