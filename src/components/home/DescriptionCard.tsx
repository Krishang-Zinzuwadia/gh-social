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
import StackFillSvg from '../../assets/icons/ri_stack-fill.svg';
import CommentSvg from '../../assets/icons/Vector (3).svg';

type RepositoryData = {
  description: string;
  techStack?: string[];
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
        <View style={styles.techStackItem}>
          <ReactLogoIcon size={26} />
          <Text style={styles.techStackLabel}>React</Text>
        </View>
        <View style={styles.techStackItem}>
          <MongoDBLogoIcon size={26} />
          <Text style={styles.techStackLabel}>MongoDB</Text>
        </View>
        <View style={styles.techStackItem}>
          <TailwindLogoIcon size={26} />
          <Text style={styles.techStackLabel}>Tailwind</Text>
        </View>
        <View style={styles.techStackItem}>
          <JavaLogoIcon size={24} />
          <Text style={styles.techStackLabel}>Javascript</Text>
        </View>
        <View style={styles.techStackItem}>
          <PythonLogoIcon size={26} />
          <Text style={styles.techStackLabel}>Python</Text>
        </View>
        <View style={styles.techStackItem}>
          <AndroidLogoIcon size={26} />
          <Text style={styles.techStackLabel}>Android SDK</Text>
        </View>
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
