"use no memo";
import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import Markdown from 'react-native-markdown-display';
import BookSvg from '../../assets/icons/mi_book.svg';

type RepositoryData = {
  title: string;
  readmeSummary: string;
  readmeFull: string;
};

type ReadmeCardProps = {
  repository: RepositoryData;
  height: number;
  onReadFullPress: () => void;
};

export default function ReadmeCard({
  repository,
  height,
  onReadFullPress,
}: ReadmeCardProps) {
  return (
    <View style={{ position: 'relative', width: '100%', height }}>
      <View
        style={[
          styles.readmeCard,
          { height, width: '100%', position: 'absolute', left: 0, top: 0 },
        ]}
      >
        {/* Header row */}
        <View style={styles.rowCenter}>
          <BookSvg width={14} height={14} />
          <Text style={styles.customCardTitle}>README</Text>
        </View>

        {/* Markdown preview — clipped by overflow:hidden on the card */}
        <View style={styles.markdownWrapper}>
          <Markdown style={previewMarkdownStyles} rules={markdownRules}>
            {repository.readmeFull || repository.readmeSummary || ''}
          </Markdown>
        </View>

        {/* Read Full button pinned to the bottom */}
        <TouchableOpacity
          onPress={onReadFullPress}
          activeOpacity={0.7}
          style={styles.readFullLinkContainer}
        >
          <Text style={styles.readFullLink}>Read Full</Text>
          <ChevronRight size={12} color="#4ADE80" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  readmeCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4ADE80',
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  customCardTitle: {
    color: '#4ADE80',
    fontFamily: 'NataSans-Bold',
    fontSize: 13,
    lineHeight: 18,
  },
  markdownWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  readFullLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(74,222,128,0.15)',
    marginTop: 4,
  },
  readFullLink: {
    color: '#4ADE80',
    fontFamily: 'NataSans-Bold',
    fontSize: 10,
    lineHeight: 14,
  },
});

const previewMarkdownStyles = {
  body: {
    color: '#FFFFFF',
    fontFamily: 'NataSans-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  heading1: {
    color: '#4ADE80',
    fontFamily: 'NataSans-Bold',
    fontSize: 15,
    marginTop: 0,
    marginBottom: 4,
  },
  heading2: {
    color: '#4ADE80',
    fontFamily: 'NataSans-Bold',
    fontSize: 13,
    marginTop: 0,
    marginBottom: 4,
  },
  heading3: {
    color: '#4ADE80',
    fontFamily: 'NataSans-Bold',
    fontSize: 12,
    marginTop: 0,
    marginBottom: 2,
  },
  code_inline: {
    color: '#D1D5DB',
    backgroundColor: '#1F2937',
    fontSize: 11,
    fontFamily: 'Menlo',
  },
  code_block: {
    color: '#D1D5DB',
    backgroundColor: '#1F2937',
    fontSize: 11,
    fontFamily: 'Menlo',
    padding: 6,
    borderRadius: 6,
  },
  fence: {
    color: '#D1D5DB',
    backgroundColor: '#1F2937',
    fontSize: 11,
    fontFamily: 'Menlo',
    padding: 6,
    borderRadius: 6,
  },
  bullet_list: { marginVertical: 2 },
  ordered_list: { marginVertical: 2 },
  list_item: { marginBottom: 2 },
  paragraph: { marginTop: 0, marginBottom: 4 },
  link: { color: '#3B82F6' },
};

const markdownRules = {
  image: (node: any) => {
    return (
      <Image
        key={node.key}
        source={{ uri: node.attributes.src }}
        style={{ width: '100%', height: 100, resizeMode: 'contain', marginVertical: 4 }}
        accessible={!!node.attributes.alt}
        accessibilityLabel={node.attributes.alt}
      />
    );
  },
};
