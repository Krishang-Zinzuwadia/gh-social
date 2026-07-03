import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  ReactLogoIcon,
  MongoDBLogoIcon,
  TailwindLogoIcon,
  JavaLogoIcon,
  PythonLogoIcon,
  AndroidLogoIcon,
  JavascriptLogoIcon,
  TypescriptLogoIcon,
  CsharpLogoIcon,
  GoLogoIcon,
  PhpLogoIcon,
  RubyLogoIcon,
  RustLogoIcon,
  CplusplusLogoIcon,
  HtmlLogoIcon,
  CssLogoIcon,
  AstroLogoIcon,
  ShellLogoIcon,
} from '@/components/icons';
import { RepositoryData } from '../../data/repositories';
import StackFillSvg from '../../assets/icons/ri_stack-fill.svg';
import CommentSvg from '../../assets/icons/Vector (3).svg';

const ICON_MAP: Record<string, React.FC<{ size?: number; width?: number; height?: number }>> = {
  'React': ReactLogoIcon,
  'MongoDB': MongoDBLogoIcon,
  'Tailwind': TailwindLogoIcon,
  'Java': JavaLogoIcon,
  'Python': PythonLogoIcon,
  'Android SDK': AndroidLogoIcon,
  'Javascript': JavascriptLogoIcon,
  'JavaScript': JavascriptLogoIcon,
  'TypeScript': TypescriptLogoIcon,
  'C#': CsharpLogoIcon,
  'Go': GoLogoIcon,
  'PHP': PhpLogoIcon,
  'Ruby': RubyLogoIcon,
  'Rust': RustLogoIcon,
  'C++': CplusplusLogoIcon,
  'HTML': HtmlLogoIcon,
  'CSS': CssLogoIcon,
  'Astro': AstroLogoIcon,
  'Shell': ShellLogoIcon,
  'Bash': ShellLogoIcon,
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
        {repository.techStack?.slice(0, 6).map((tech) => {
          const Icon = ICON_MAP[tech];
          const isJS = tech === 'Javascript' || tech === 'JavaScript';
          const iconSize = isJS ? 24 : 26;
          
          return (
            <View key={tech} style={styles.techStackItem}>
              {Icon ? (
                <Icon size={iconSize} width={iconSize} height={iconSize} />
              ) : (
                <View style={{height: 26, width: 26, backgroundColor: '#1E241E', borderRadius: 6, alignItems: 'center', justifyContent: 'center'}}>
                  <Text style={{color: '#4ADE80', fontSize: 12, fontFamily: 'NataSans-Bold'}}>{tech.substring(0, 1).toUpperCase()}</Text>
                </View>
              )}
              <Text style={styles.techStackLabel} numberOfLines={1}>{tech}</Text>
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
    borderColor: '#4ADE80',
    backgroundColor: '#0A0A0A',
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
    color: '#4ADE80',
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
