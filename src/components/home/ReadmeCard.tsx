import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { BookOpen, ChevronRight } from 'lucide-react-native';

import { REFERENCE_THEME } from '@/constants/theme';

type RepositoryData = {
  title: string;
  readmeSummary: string;
  readmeFull: string;
  techStack?: string[];
};

type ReadmeCardProps = {
  repository: RepositoryData;
  onReadFullPress: () => void;
  isActive: boolean;
  compact?: boolean;
};

const LANGUAGE_COLOURS: Record<string, string> = {
  Rust: '#DEA584',
  Go: '#00ADD8',
  Python: '#3572A5',
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Javascript: '#F7DF1E',
  React: '#61DAFB',
};

export default function ReadmeCard({
  repository,
  onReadFullPress,
  isActive,
  compact = false,
}: ReadmeCardProps) {
  const summary = repository.readmeSummary || repository.readmeFull || 'No summary available.';
  const [typed, setTyped] = useState(0);
  const cursorOpacity = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    const resetTimer = setTimeout(() => setTyped(0), 0);
    if (!isActive) {
      return () => clearTimeout(resetTimer);
    }

    const timer = setInterval(() => {
      setTyped((current) => {
        const next = Math.min(summary.length, current + 2);
        if (next >= summary.length) clearInterval(timer);
        return next;
      });
    }, 30);

    return () => {
      clearTimeout(resetTimer);
      clearInterval(timer);
    };
  }, [isActive, summary]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 1,
          delay: 449,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 1,
          delay: 449,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [cursorOpacity]);

  const language = repository.techStack?.[0] || 'Code';
  const languageColour = LANGUAGE_COLOURS[language] ?? '#8E8E93';

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View style={styles.headerLabel}>
          <BookOpen size={12} color={REFERENCE_THEME.accentLight} strokeWidth={2} />
          <Text style={styles.heading}>README</Text>
        </View>
        <View style={styles.language}>
          <View style={[styles.languageDot, { backgroundColor: languageColour }]} />
          <Text style={styles.languageText} numberOfLines={1}>{language}</Text>
        </View>
      </View>

      <View style={[styles.body, compact && styles.bodyCompact]}>
        <Text
          numberOfLines={compact ? 6 : 8}
          style={[styles.summary, compact && styles.summaryCompact]}
        >
          {summary.slice(0, typed)}
          <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>▍</Animated.Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onReadFullPress}
          style={({ pressed }) => [styles.readFull, pressed && styles.pressed]}
        >
          <Text style={styles.readFullText}>Read full</Text>
          <ChevronRight size={11} color={REFERENCE_THEME.accentLight} strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(28,28,30,0.78)',
    overflow: 'hidden',
  },
  cardCompact: {
    marginTop: 6,
  },
  header: {
    minHeight: 41,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerCompact: {
    minHeight: 35,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  headerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heading: {
    color: REFERENCE_THEME.accentLight,
    fontFamily: 'NataSans-Bold',
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.6,
  },
  language: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  languageDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  languageText: {
    maxWidth: 110,
    color: REFERENCE_THEME.textSecondary,
    fontFamily: 'NataSans-SemiBold',
    fontSize: 10.5,
    lineHeight: 14,
  },
  body: {
    paddingTop: 15,
    paddingHorizontal: 18,
    paddingBottom: 22,
    gap: 12,
  },
  bodyCompact: {
    paddingTop: 9,
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 6,
  },
  summary: {
    minHeight: 150,
    color: REFERENCE_THEME.textStrong,
    fontFamily: 'NataSans-Regular',
    fontSize: 14,
    lineHeight: 22.4,
    letterSpacing: -0.1,
  },
  summaryCompact: {
    minHeight: 54,
    fontSize: 11.5,
    lineHeight: 16,
  },
  cursor: {
    color: REFERENCE_THEME.accent,
    fontFamily: 'NataSans-Regular',
    fontSize: 13,
  },
  readFull: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readFullText: {
    color: REFERENCE_THEME.accentLight,
    fontFamily: 'NataSans-SemiBold',
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
