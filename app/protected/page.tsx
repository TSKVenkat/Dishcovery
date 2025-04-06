'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ChefHat, Trophy, ArrowRight, UtensilsCrossed, ShoppingBasket, Star, Award, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Leaderboard from '@/components/Leaderboard';

interface UserProfile {
  rank: string;
  successful_cooks: number;
}

export default function ProtectedPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('rank, successful_cooks')
          .eq('user_id', user.id)
          .single();
        
        setUserProfile(profile);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const getNextRank = () => {
    if (!userProfile) return null;
    const { successful_cooks } = userProfile;

    if (successful_cooks >= 15) return null;
    if (successful_cooks >= 5) return { name: 'Expert Chef', remaining: 15 - successful_cooks };
    if (successful_cooks > 0) return { name: 'Rookie Chef', remaining: 5 - successful_cooks };
    return { name: 'Amateur', remaining: 1 };
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Expert Chef': return 'text-yellow-500';
      case 'Rookie Chef': return 'text-green-500';
      case 'Amateur': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const nextRank = getNextRank();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/5 to-transparent opacity-20" />
      
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Welcome to Dishcovery
        </h1>
        
        {userProfile && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Chef Rank Card */}
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 sm:p-6 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className={`p-3 sm:p-4 rounded-xl bg-primary/10 dark:bg-primary/20`}>
                    <ChefHat className="w-6 h-6 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground">Your Chef Rank</h2>
                    <p className={`text-base sm:text-xl font-semibold ${getRankColor(userProfile.rank)}`}>
                      {userProfile.rank}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <span className="text-sm sm:text-base text-foreground/80 font-medium">Successful Dishes</span>
                        <span className="text-sm sm:text-base text-primary font-bold">{userProfile.successful_cooks}</span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-primary/10 dark:bg-primary/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary/80 via-primary to-primary/90 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${userProfile.successful_cooks >= 15 ? 100 : 
                                   userProfile.successful_cooks >= 5 ? (((userProfile.successful_cooks - 5) / 10) * 100) :
                                   userProfile.successful_cooks > 0 ? ((userProfile.successful_cooks / 5) * 100) : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Rank Progress Card */}
              {nextRank && (
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 sm:p-6 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 rounded-xl bg-primary/10 dark:bg-primary/20">
                      <Award className="w-6 h-6 sm:w-10 sm:h-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-2xl font-bold text-foreground">Next Milestone</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">Keep cooking to level up!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 sm:mb-6 px-3 sm:px-4">
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${getRankColor(userProfile.rank)}`} />
                      <span className="text-sm sm:text-base font-medium text-foreground/80">{userProfile.rank}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary/60" />
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 sm:w-5 sm:h-5 text-${nextRank.name === 'Expert Chef' ? 'yellow' : 'green'}-500`} />
                      <span className="text-sm sm:text-base font-medium text-foreground/80">{nextRank.name}</span>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/50">
                    <div className="text-center mb-2 sm:mb-3">
                      <span className="text-2xl sm:text-3xl font-bold text-primary">{nextRank.remaining}</span>
                      <span className="text-sm sm:text-base text-foreground/80 ml-2">more {nextRank.remaining === 1 ? 'dish' : 'dishes'} to go!</span>
                    </div>
                    <div className="w-full bg-primary/10 dark:bg-primary/5 rounded-full h-1.5 sm:h-2 mb-1 sm:mb-2">
                      <div 
                        className="bg-gradient-to-r from-primary/80 via-primary to-primary/90 h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${((userProfile.successful_cooks % 5) / 5) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Link href="/protected/inventory" 
                className="group bg-card/50 backdrop-blur-sm hover:bg-card/60 rounded-xl p-4 sm:p-6 transition-all duration-300 border border-border/50 hover:border-primary/30">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-primary/10 dark:bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                    <ShoppingBasket className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-semibold text-foreground">Manage Inventory</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">Track your ingredients</p>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-auto text-primary transform translate-x-0 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                </div>
              </Link>

              <Link href="/protected/recipes" 
                className="group bg-card/50 backdrop-blur-sm hover:bg-card/60 rounded-xl p-4 sm:p-6 transition-all duration-300 border border-border/50 hover:border-primary/30">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-primary/10 dark:bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                    <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-semibold text-foreground">Get Recipes</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">Discover new dishes</p>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-auto text-primary transform translate-x-0 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                </div>
              </Link>

              <Link href="/protected/forum" 
                className="group bg-card/50 backdrop-blur-sm hover:bg-card/60 rounded-xl p-4 sm:p-6 transition-all duration-300 border border-border/50 hover:border-primary/30">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-primary/10 dark:bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-semibold text-foreground">Community</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">Join discussions</p>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-auto text-primary transform translate-x-0 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                </div>
              </Link>
            </div>
          </>
        )}

        {/* Leaderboard */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 sm:p-6">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}