// src/lib/badgesApi.js
import { supabase } from './supabase';

// Get all available badges
export async function getAllBadges() {
  try {
    console.log('🏆 Fetching all badges from database...');
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: true });

    console.log('🏆 getAllBadges query result:', { data, error });
    console.log('🏆 Number of badges fetched:', data?.length || 0);

    if (error) {
      console.error('Error fetching badges:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching badges:', error);
    return { data: [], error: { message: error.message } };
  }
}

// Get badges earned by a student
export async function getStudentBadges(studentId) {
  try {
    const { data, error } = await supabase
      .from('student_badges')
      .select('*')
      .eq('student_id', studentId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching student badges:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching student badges:', error);
    return { data: [], error: { message: error.message } };
  }
}

// Award a badge to a student
export async function awardBadge(studentId, badgeId, activityContext = {}) {
  try {
    console.log('Awarding badge:', { studentId, badgeId, activityContext });

    // Check if student already has this badge
    const { data: existingBadge, error: checkError } = await supabase
      .from('student_badges')
      .select('*')
      .eq('student_id', studentId)
      .eq('badge_id', badgeId);

    if (existingBadge && existingBadge.length > 0) {
      console.log('Student already has this badge');
      return { data: existingBadge[0], error: null };
    }

    // Get badge details for the award
    const { data: badgeData, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single();

    if (badgeError) {
      console.error('Error fetching badge details:', badgeError);
      return { data: null, error: badgeError };
    }

    // Award the badge
    const { data, error } = await supabase
      .from('student_badges')
      .insert([{
        student_id: studentId,
        badge_id: badgeId,
        earned_at: new Date().toISOString(),
        badge_name: badgeData.title,
        badge_icon: badgeData.icon_url,
        badge_rarity: 'Common',
        activity_name: activityContext.activityName || '',
        activity_category: activityContext.category || '',
        activity_difficulty: activityContext.difficulty || '',
        session_score: activityContext.score?.toString() || ''
      }])
      .select('*');

    if (error) {
      console.error('Error awarding badge:', error);
      return { data: null, error };
    }

    console.log('Badge awarded successfully:', data);
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Unexpected error awarding badge:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Check if student should receive badges based on their progress
export async function checkAndAwardBadges(studentId) {
  try {
    console.log('🏆 Checking badges for student:', studentId);

    // Get all badges and their criteria
    const { data: allBadges, error: badgesError } = await getAllBadges();
    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return { data: [], error: badgesError };
    }

    // Get student's existing badges
    const { data: studentBadges, error: studentBadgesError } = await getStudentBadges(studentId);
    if (studentBadgesError) {
      console.error('Error fetching student badges:', studentBadgesError);
      return { data: [], error: studentBadgesError };
    }

    const earnedBadgeIds = studentBadges.map(sb => sb.badge_id);

    // Get student's progress data
    const { data: progress, error: progressError } = await supabase
      .from('user_activity_progress')
      .select(`
        *,
        activities (
          title,
          category,
          difficulty
        )
      `)
      .eq('user_id', studentId);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return { data: [], error: progressError };
    }

    console.log('🏆 Student progress data:', progress);
    console.log('🏆 Activity names in progress:', progress.map(p => ({
      activity_name: p.activity_name,
      activity_title: p.activities?.title,
      activity_category: p.activities?.category
    })));

    // Get student's streak data for login-based badges
    const { data: streakData, error: streakError } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', studentId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (streakError && streakError.code !== 'PGRST116') {
      console.error('Error fetching streak data:', streakError);
    }
    const currentStreak = streakData?.current_streak || 0;
    console.log('🏆 Current streak:', currentStreak);

    // Get student's expressions (emotion wheel submissions)
    const { data: expressions, error: expressionsError } = await supabase
      .from('Expressions')
      .select('id')
      .eq('user_id', studentId);

    if (expressionsError && expressionsError.code !== 'PGRST116') {
      console.error('Error fetching expressions:', expressionsError);
    }
    const emotionCount = expressions?.length || 0;
    console.log('🏆 Emotion wheel submissions:', emotionCount);

    const newlyEarnedBadges = [];

    // Check each badge's criteria
    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) {
        continue; // Already has this badge
      }

      const criteria = badge.criteria;
      let shouldAward = false;
      let activityContext = {};

      console.log(`🏆 Checking badge: ${badge.title}`, criteria);

      // Badge criteria checks based on your badge definitions
      // Login Streak Badges
      if (criteria.activity === 'login_streak' && criteria.days) {
        // Check login streak badges (Routine Starter, Routine Builder, etc.)
        shouldAward = currentStreak >= criteria.days;
        console.log(`🏆 Login streak check: current=${currentStreak}, required=${criteria.days}, award=${shouldAward}`);
      } else if (criteria.activity === 'emotion_wheel' && criteria.count) {
        // Emotion wheel badges (Emotion Spotter, Emotion Explorer, etc.)
        // Check expressions table for emotion submissions
        shouldAward = emotionCount >= criteria.count;
        console.log(`🏆 Emotion wheel check: count=${emotionCount}, required=${criteria.count}, award=${shouldAward}`);
      } else if (criteria.activity === 'street_game' && criteria.rounds) {
        // Street crossing game badges (First Step Crosser, Brave Crosser, etc.)
        const streetActivities = progress.filter(p => 
          p.activity_name?.toLowerCase().includes('street') ||
          p.activity_name?.toLowerCase().includes('crossing') ||
          p.activity_name?.toLowerCase().includes('safe') ||
          p.activities?.title?.toLowerCase().includes('street') ||
          p.activities?.title?.toLowerCase().includes('crossing') ||
          p.activities?.title?.toLowerCase().includes('safe')
        );
        shouldAward = streetActivities.length >= criteria.rounds;
        console.log(`🏆 Street crossing check: count=${streetActivities.length}, required=${criteria.rounds}, award=${shouldAward}`, 
          'Street activities found:', streetActivities.map(p => ({ name: p.activity_name, title: p.activities?.title })));
      } else if (criteria.activity === 'any' && criteria.count === 1) {
        // First Step badge
        shouldAward = progress.length > 0;
      } else if (criteria.score === 100 && criteria.activity === 'any') {
        // Perfect Scorer badge
        const perfectScores = progress.filter(p => p.score >= 100);
        shouldAward = perfectScores.length > 0;
        if (shouldAward && perfectScores.length > 0) {
          const perfectActivity = perfectScores[0];
          activityContext = {
            activityName: perfectActivity.activities?.title,
            category: perfectActivity.activities?.category,
            difficulty: perfectActivity.activities?.difficulty,
            score: perfectActivity.score
          };
        }
      } else if (criteria.activity === 'academic' && criteria.count === 5) {
        // Academic Star badge
        const academicActivities = progress.filter(p => 
          p.activities?.category?.toLowerCase().includes('academic') ||
          p.activities?.title?.toLowerCase().includes('academic')
        );
        shouldAward = academicActivities.length >= 5;
      } else if (criteria.activity === 'color' && criteria.count === 2) {
        // Color Master badge
        const colorActivities = progress.filter(p => 
          p.activities?.category?.toLowerCase().includes('color') ||
          p.activities?.title?.toLowerCase().includes('color')
        );
        // Check for different difficulties
        const difficulties = new Set(colorActivities.map(a => a.activities?.difficulty));
        shouldAward = colorActivities.length >= 2 && difficulties.size >= 2;
      } else if (criteria.activity === 'matching' && criteria.count === 1) {
        // Match Finder badge
        const matchingActivities = progress.filter(p => 
          p.activities?.title?.toLowerCase().includes('match') ||
          p.activities?.category?.toLowerCase().includes('match')
        );
        shouldAward = matchingActivities.length >= 1;
      } else if (criteria.activity === 'number_flashcard' && criteria.count === 1) {
        // Number Ninja badge
        const numberFlashcardActivities = progress.filter(p => 
          p.activity_name?.toLowerCase().includes('number') ||
          p.activities?.title?.toLowerCase().includes('number') ||
          p.activities?.category?.toLowerCase().includes('number')
        );
        shouldAward = numberFlashcardActivities.length >= 1;
        console.log(`🏆 Number Ninja check: count=${numberFlashcardActivities.length}, required=1, award=${shouldAward}`);
      } else if (criteria.unique_types === 3) {
        // Variety Champion badge - check for 3 different activity types
        // Since you only have 2 main categories (Academic, Social/Daily Life Skills),
        // we'll check for unique activity names instead
        const uniqueActivityNames = new Set(
          progress.map(p => p.activity_name || p.activities?.title).filter(Boolean)
        );
        shouldAward = uniqueActivityNames.size >= 3;
        console.log(`🏆 Variety Champion check: unique activities=${uniqueActivityNames.size}, required=3, award=${shouldAward}`, Array.from(uniqueActivityNames));
      } else if (criteria.min_score === 80 && criteria.count === 5) {
        // High Achiever badge
        const highScoreActivities = progress.filter(p => p.score >= 80);
        shouldAward = highScoreActivities.length >= 5;
      } else if (criteria.activity === 'social_daily_life' && criteria.count === 3) {
        // Daily Life Hero badge
        const dailyLifeActivities = progress.filter(p => 
          p.activities?.category?.toLowerCase().includes('social') ||
          p.activities?.category?.toLowerCase().includes('daily') ||
          p.activities?.category?.toLowerCase().includes('life')
        );
        shouldAward = dailyLifeActivities.length >= 3;
      }
      
      // ========================================================================
      // NEW COMPREHENSIVE BADGE CHECKS
      // ========================================================================
      
      // ACADEMIC ACTIVITY BADGES (Difficulty-Based)
      else if (criteria.activity === 'identification' && criteria.difficulty && criteria.count) {
        // Identification badges: Skill Spotter, Recognition Rookie, Recognition Pro
        const identificationActivities = progress.filter(p => 
          (p.activities?.title?.toLowerCase().includes('identification') ||
           p.activities?.category?.toLowerCase().includes('identification')) &&
          p.activities?.difficulty === criteria.difficulty
        );
        shouldAward = identificationActivities.length >= criteria.count;
        console.log(`🏆 Identification (${criteria.difficulty}) check: count=${identificationActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      else if (criteria.activity === 'number' && criteria.difficulty && criteria.count) {
        // Number badges: Number Ninja, Number Strategist, Number Sensei
        const numberActivities = progress.filter(p => 
          (p.activities?.title?.toLowerCase().includes('number') ||
           p.activities?.category?.toLowerCase().includes('number')) &&
          p.activities?.difficulty === criteria.difficulty
        );
        shouldAward = numberActivities.length >= criteria.count;
        console.log(`🏆 Number (${criteria.difficulty}) check: count=${numberActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      else if (criteria.activity === 'color' && criteria.difficulty && criteria.count) {
        // Color badges: Color Spotter, Color Explorer, Color Master
        const colorActivities = progress.filter(p => 
          (p.activities?.title?.toLowerCase().includes('color') ||
           p.activities?.category?.toLowerCase().includes('color')) &&
          p.activities?.difficulty === criteria.difficulty
        );
        shouldAward = colorActivities.length >= criteria.count;
        console.log(`🏆 Color (${criteria.difficulty}) check: count=${colorActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      else if (criteria.activity === 'puzzle' && criteria.difficulty && criteria.count) {
        // Puzzle badges: Puzzle Starter, Puzzle Thinker, Puzzle Mastermind
        const puzzleActivities = progress.filter(p => 
          (p.activities?.title?.toLowerCase().includes('puzzle') ||
           p.activities?.category?.toLowerCase().includes('puzzle')) &&
          p.activities?.difficulty === criteria.difficulty
        );
        shouldAward = puzzleActivities.length >= criteria.count;
        console.log(`🏆 Puzzle (${criteria.difficulty}) check: count=${puzzleActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      else if (criteria.activity === 'matching' && criteria.difficulty && criteria.count) {
        // Matching badges: Match Maker, Logic Matcher, Perfect Matcher
        const matchingActivities = progress.filter(p => 
          (p.activities?.title?.toLowerCase().includes('match') ||
           p.activities?.category?.toLowerCase().includes('match')) &&
          p.activities?.difficulty === criteria.difficulty
        );
        shouldAward = matchingActivities.length >= criteria.count;
        console.log(`🏆 Matching (${criteria.difficulty}) check: count=${matchingActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      else if (criteria.activity === 'memory' && criteria.difficulty && criteria.count) {
        // Memory badges: Memory Observer, Memory Builder, Memory Champion
        const memoryActivities = progress.filter(p => 
          (p.activities?.title?.toLowerCase().includes('memory') ||
           p.activities?.category?.toLowerCase().includes('memory')) &&
          p.activities?.difficulty === criteria.difficulty
        );
        shouldAward = memoryActivities.length >= criteria.count;
        console.log(`🏆 Memory (${criteria.difficulty}) check: count=${memoryActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      
      // SOCIAL & DAILY LIFE SKILL BADGES (Progression-Based)
      else if (criteria.activity === 'cashier' && criteria.count) {
        // Cashier badges: Cashier Beginner, Smart Shopper, Checkout Champion
        const cashierActivities = progress.filter(p => 
          p.activities?.title?.toLowerCase().includes('cashier') ||
          p.activity_name?.toLowerCase().includes('cashier')
        );
        shouldAward = cashierActivities.length >= criteria.count;
        console.log(`🏆 Cashier check: count=${cashierActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      else if (criteria.activity === 'money' && criteria.count) {
        // Money badges: Money Explorer, Value Identifier, Money Smart Star
        const moneyActivities = progress.filter(p => 
          p.activities?.title?.toLowerCase().includes('money') ||
          p.activity_name?.toLowerCase().includes('money')
        );
        shouldAward = moneyActivities.length >= criteria.count;
        console.log(`🏆 Money check: count=${moneyActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      else if (criteria.activity === 'greeting' && criteria.count) {
        // Greeting badges: First Greeting, Friendly Speaker, Social Confidence Star
        const greetingActivities = progress.filter(p => 
          p.activities?.title?.toLowerCase().includes('greeting') ||
          p.activities?.title?.toLowerCase().includes('social greeting') ||
          p.activity_name?.toLowerCase().includes('greeting')
        );
        shouldAward = greetingActivities.length >= criteria.count;
        console.log(`🏆 Greeting check: count=${greetingActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      else if (criteria.activity === 'hygiene' && criteria.count) {
        // Hygiene badges: Hygiene Starter, Clean Habit Builder, Hygiene Hero
        const hygieneActivities = progress.filter(p => 
          p.activities?.title?.toLowerCase().includes('hygiene') ||
          p.activity_name?.toLowerCase().includes('hygiene')
        );
        shouldAward = hygieneActivities.length >= criteria.count;
        console.log(`🏆 Hygiene check: count=${hygieneActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      else if (criteria.activity === 'chore' && criteria.count) {
        // Chore badges: Chore Starter, Helpful Hands, Household Helper Hero
        const choreActivities = progress.filter(p => 
          p.activities?.title?.toLowerCase().includes('chore') ||
          p.activities?.title?.toLowerCase().includes('household') ||
          p.activity_name?.toLowerCase().includes('chore')
        );
        shouldAward = choreActivities.length >= criteria.count;
        console.log(`🏆 Chore check: count=${choreActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      else if (criteria.activity === 'street' && criteria.count) {
        // Street crossing badges: Safety Learner, Street Smart, Safety Champion
        const streetActivities = progress.filter(p => 
          p.activities?.title?.toLowerCase().includes('street') ||
          p.activities?.title?.toLowerCase().includes('crossing') ||
          p.activity_name?.toLowerCase().includes('street')
        );
        shouldAward = streetActivities.length >= criteria.count;
        console.log(`🏆 Street crossing check: count=${streetActivities.length}, required=${criteria.count}, award=${shouldAward}`);
      }
      
      // ========================================================================
      // END NEW BADGE CHECKS
      // ========================================================================
      
      else if (criteria.unique_types === 5) {
        // All-Rounder badge - be more flexible with category detection
        const categories = progress.map(p => {
          // Get the category from the activity
          const activityCategory = p.activities?.category?.toLowerCase() || '';
          const activityTitle = p.activities?.title?.toLowerCase() || '';
          
          // Map to standardized category names
          if (activityCategory.includes('number') || activityTitle.includes('number') || activityTitle.includes('count')) {
            return 'Numbers';
          } else if (activityCategory.includes('shape') || activityTitle.includes('shape')) {
            return 'Shapes';
          } else if (activityCategory.includes('color') || activityTitle.includes('color')) {
            return 'Colors';
          } else if (activityCategory.includes('identification') || activityTitle.includes('identification')) {
            return 'Identification';
          } else if (activityCategory.includes('matching') || activityTitle.includes('matching')) {
            return 'Matching';
          } else if (activityCategory.includes('memory') || activityTitle.includes('memory')) {
            return 'Memory';
          } else if (activityCategory.includes('puzzle') || activityTitle.includes('puzzle')) {
            return 'Puzzles';
          } else if (activityCategory.includes('social') || activityCategory.includes('daily') || activityCategory.includes('life')) {
            return 'Social/Daily Life';
          } else if (activityCategory.includes('academic')) {
            return 'Academic';
          } else {
            return activityCategory || 'Other';
          }
        }).filter(Boolean);
        
        const uniqueCategories = new Set(categories);
        console.log('🏆 All-Rounder Debug:', {
          totalProgress: progress.length,
          rawCategories: progress.map(p => p.activities?.category),
          rawTitles: progress.map(p => p.activities?.title),
          standardizedCategories: categories,
          uniqueCategories: Array.from(uniqueCategories),
          uniqueCount: uniqueCategories.size,
          requiredCount: 5,
          progressDetails: progress.map(p => ({
            id: p.activity_id,
            category: p.activities?.category,
            title: p.activities?.title
          }))
        });
        shouldAward = uniqueCategories.size >= 5;
      }

      console.log(`🏆 Badge ${badge.title}: shouldAward = ${shouldAward}`);

      if (shouldAward) {
        const { data: awardedBadge, error: awardError } = await awardBadge(studentId, badge.id, activityContext);
        if (awardedBadge && !awardError) {
          newlyEarnedBadges.push(awardedBadge);
          console.log(`🏆 Awarded badge: ${badge.title}`);
        } else if (awardError) {
          console.error(`🏆 Error awarding badge ${badge.title}:`, awardError);
        }
      }
    }

    console.log('🏆 Newly earned badges:', newlyEarnedBadges);
    return { data: newlyEarnedBadges, error: null };
  } catch (error) {
    console.error('Unexpected error checking badges:', error);
    return { data: [], error: { message: error.message } };
  }
}