import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  ReactLogoIcon,
  MongoDBLogoIcon,
  TailwindLogoIcon,
  JavaLogoIcon,
  PythonLogoIcon,
  AndroidLogoIcon,
} from '@/components/icons';
import { RepositoryData } from '../../data/repositories';
import StackFillSvg from '../../assets/icons/ri_stack-fill.svg';
import CommentSvg from '../../assets/icons/Vector (3).svg';

const ICON_MAP: Record<string, React.FC<{ size?: number }>> = {
  'React': ReactLogoIcon,
  'MongoDB': MongoDBLogoIcon,
  'Tailwind': TailwindLogoIcon,
  'Javascript': JavaLogoIcon,
  'JavaScript': JavaLogoIcon,
  'Python': PythonLogoIcon,
  'Android SDK': AndroidLogoIcon,
};

type DescriptionCardProps = {
  repository: RepositoryData;
  height: number;
  isSmallPhone: boolean;
};

export default function DescriptionCard({ repository, height, isSmallPhone }: DescriptionCardProps) {
  return (
    <View style={[styles.descriptionCard, { height }]}>
      {/* Header */}
      <View style={styles.header}>
        <CommentSvg width={14} height={14} />
        <Text style={styles.customCardTitle}>Description</Text>
      </View>
      <Text style={styles.customCardDesc} numberOfLines={5} ellipsizeMode="tail">
        {repository.description}
      </Text>
      {/* Tech Stack Section */}
      <View style={styles.techStackHeader}>
        <StackFillSvg width={14} height={14} />
        <Text style={styles.customCardTitle}>Tech Stack</Text>
      </View>
      <View style={styles.techStackGrid}>
        {repository.techStack?.map((tech) => {
          const Icon = ICON_MAP[tech];
          if (!Icon) return null;
          return (
            <View key={tech} style={styles.techStackItem}>
              <Icon size={tech === 'Javascript' || tech === 'JavaScript' ? 24 : 26} />
              <Text style={styles.techStackLabel}>{tech}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  descriptionCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8EFF7A',
    backgroundColor: '#0A0C0A',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  customCardTitle: {
    color: '#8EFF7A',
    fontFamily: 'NataSans-Bold',
    fontSize: 13,
    lineHeight: 18,
  },
  customCardDesc: {
    color: '#FFFFFF',
    fontFamily: 'NataSans-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  techStackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 10,
  },
  techStackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  techStackItem: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  techStackLabel: {
    color: '#FFFFFF',
    fontFamily: 'NataSans-Medium',
    fontSize: 8.5,
    lineHeight: 11,
    textAlign: 'center',
  },
});
