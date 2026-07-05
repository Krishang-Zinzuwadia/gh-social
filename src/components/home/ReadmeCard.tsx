import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BookSvg from '../../assets/icons/mi_book.svg';

type RepositoryData = {
  title: string;
  readmeSummary: string;
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
        <View>
          <View style={styles.rowCenter}>
            <BookSvg width={14} height={14} />
            <Text style={styles.customCardTitle}>README Summary</Text>
          </View>
          <Text style={styles.customCardDesc} numberOfLines={6} ellipsizeMode="tail">
            {repository.readmeSummary}
          </Text>
        </View>
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
    paddingBottom: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  rowCenter: {
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
  readFullLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 8,
  },
  readFullLink: {
    color: '#4ADE80',
    fontFamily: 'NataSans-Bold',
    fontSize: 10,
    lineHeight: 14,
  },
});
