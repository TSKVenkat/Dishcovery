'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  email: string;
  successful_cooks: number;
  rank: number;
  rank_title: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="text-yellow-500" size={24} />;
    case 2:
      return <Medal className="text-gray-400" size={24} />;
    case 3:
      return <Medal className="text-amber-600" size={24} />;
    default:
      return <Award className="text-blue-400" size={20} />;
  }
};

const getRankTitleColor = (rank_title: string) => {
  switch (rank_title) {
    case 'Expert Chef':
      return 'text-yellow-500 dark:text-yellow-400';
    case 'Rookie Chef':
      return 'text-green-500 dark:text-green-400';
    case 'Amateur':
    default:
      return 'text-blue-500 dark:text-blue-400';
  }
};

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('user_profiles')
          .select('email, successful_cooks, rank')
          .order('successful_cooks', { ascending: false })
          .limit(10);

        if (error) throw error;

        const processedData = (data || []).map((entry, index) => ({
          email: entry.email || 'Anonymous Chef',
          successful_cooks: entry.successful_cooks || 0,
          rank: index + 1,
          rank_title: entry.rank || 'Amateur'
        }));

        setLeaderboardData(processedData);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg overflow-hidden border border-border/50">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Trophy className="text-yellow-500" size={28} />
          Cooking Champions
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Master Chefs</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Successful Cooks</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Achievement</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry) => (
                <tr 
                  key={entry.rank}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/40 dark:hover:bg-accent/30 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-sm font-medium">
                    <span className={`
                      inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold
                      ${entry.rank === 1 ? 'bg-yellow-100/80 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' : 
                        entry.rank === 2 ? 'bg-gray-100/80 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300' :
                        entry.rank === 3 ? 'bg-amber-100/80 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' :
                        'bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'} 
                    `}>
                      #{entry.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {entry.email}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <span className={`${getRankTitleColor(entry.rank_title)}`}>
                      {entry.rank_title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {entry.successful_cooks}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getRankIcon(entry.rank)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 