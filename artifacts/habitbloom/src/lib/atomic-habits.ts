import { Habit } from './types';

export function formatStackSentence(
  anchor: Pick<Habit, 'tinyHabit'>,
  habit: Pick<Habit, 'tinyHabit'>,
): string {
  const anchorAction = anchor.tinyHabit.trim() || 'my anchor habit';
  const habitAction = habit.tinyHabit.trim() || 'this habit';
  return `After I ${anchorAction.toLowerCase()}, I will ${habitAction.toLowerCase()}.`;
}

export const DAILY_INSIGHTS = [
  'Start so small that showing up feels effortless.',
  'Your habits are votes for the person you are becoming.',
  'Stack a new habit onto one you already do without thinking.',
  'Make the right choice the easy choice — reduce friction first.',
  'Missing once is human. The real test is what you do next.',
  'Focus on who you are, not what you want to achieve.',
  'Consistency beats intensity when you are building a life.',
  'Prepare your environment tonight for the person you want to be tomorrow.',
  'A two-minute version of the habit still counts as progress.',
  'Identity grows one small action at a time.',
  'The best habit is the one you can repeat on an ordinary day.',
  'Tie your habit to a clear cue: time, place, or an existing routine.',
  'Celebrate showing up, not just finishing perfectly.',
  'Shrink the habit until it feels almost too easy to skip.',
  'Your future self is built from today\'s smallest repeatable actions.',
  'When motivation fades, your system should still be simple enough to follow.',
  'A habit stacked onto breakfast, coffee, or bedtime travels with your day.',
  'Progress is quiet. That does not mean it is not working.',
  'Choose one identity to strengthen this week, not ten.',
  'Return gently after a miss — the second skip is the costly one.',
  'Make the first step visible: lay out the book, mat, or bottle tonight.',
  'You do not need a perfect day. You need one honest vote for your identity.',
  'Let your streak be a record of returns, not just uninterrupted wins.',
  'The goal is not more discipline. The goal is a better default.',
  'Ask: what would a person with this identity do in the next two minutes?',
];

export function getDailyInsight(date: Date): string {
  return DAILY_INSIGHTS[date.getDate() % DAILY_INSIGHTS.length];
}

const COMPLETION_TEMPLATES = [
  (identity: string) => `One more vote for: ${identity}`,
  (identity: string) => `Today you practiced becoming ${identity.replace(/^I am /i, '')}.`,
  (identity: string) => `Small action, real identity: ${identity}`,
  (identity: string) => `That counts. ${identity}`,
];

export function getCompletionMessage(habit: Habit, date: Date = new Date()): string {
  const index = (date.getDate() + habit.id.length) % COMPLETION_TEMPLATES.length;
  return COMPLETION_TEMPLATES[index](habit.identityGoal);
}

export interface MissRecoveryMessageContext {
  isRecoveryDay: boolean;
  wilting: boolean;
}

export function getMissRecoveryMessage({
  isRecoveryDay,
  wilting,
}: MissRecoveryMessageContext): string {
  if (isRecoveryDay) {
    return 'Missing once is human. Today is about not missing twice — start with your smallest seed.';
  }
  if (wilting) {
    return 'Your forest is wilting. One small win today can steady the soil again.';
  }
  return 'Keep growing.';
}

export function getTodaysIdentityFocus(habits: Habit[], date: Date = new Date()): string | undefined {
  if (habits.length === 0) return undefined;
  const index = date.getDate() % habits.length;
  return habits[index]?.identityGoal;
}
