"use no memo";
import React, { useEffect, useMemo } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { X } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import BookSvg from '../../assets/icons/mi_book.svg';

interface ReadmePopupProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  readmeText: string;
}

export function ReadmePopup({ isVisible, onClose, title, readmeText }: ReadmePopupProps) {
  const scale = useMemo(() => new Animated.Value(0.95), []);
  const opacity = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(20), []);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, scale, opacity, translateY]);

  const closeAnimated = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      onClose();
    });
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.popupRoot, { opacity }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={closeAnimated}>
        <View style={styles.popupOverlay} />
      </Pressable>
      <Animated.View
        style={[
          styles.popupCard,
          { transform: [{ scale }, { translateY }] }
        ]}
      >
        <View style={styles.popupHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <BookSvg width={20} height={20} />
            <Text style={styles.popupTitle}>README Summary</Text>
          </View>
          <Pressable onPress={closeAnimated} style={styles.popupCloseButton}>
            <X size={24} color="#D1D5DB" strokeWidth={1} />
          </Pressable>
        </View>

        <View style={{ flex: 1, overflow: 'hidden' }}>
          <ScrollView
            style={styles.popupContentScroll}
            contentContainerStyle={styles.popupContentContainer}
            showsVerticalScrollIndicator={true}
            bounces={true}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
          >
            <Markdown style={markdownStyles} rules={markdownRules}>
              {readmeText}
            </Markdown>
          </ScrollView>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popupRoot: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  popupCard: {
    backgroundColor: '#0B130B',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    padding: 20,
    width: '90%',
    height: '75%',
    overflow: 'hidden',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'column',
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  popupTitle: {
    color: '#4ADE80',
    fontFamily: 'NataSans-Bold',
    fontSize: 15,
  },
  popupCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupContentScroll: {
    flex: 1,
  },
  popupContentContainer: {
    paddingBottom: 20,
  },
  popupReadmeText: {
    color: '#FFFFFF',
    fontFamily: 'NataSans-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
});

const markdownStyles = {
  body: {
    color: '#FFFFFF',
    fontFamily: 'NataSans-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  heading1: {
    color: '#4ADE80',
    fontFamily: 'NataSans-Bold',
    fontSize: 20,
    marginVertical: 10,
  },
  heading2: {
    color: '#4ADE80',
    fontFamily: 'NataSans-Bold',
    fontSize: 18,
    marginVertical: 8,
  },
  heading3: {
    color: '#4ADE80',
    fontFamily: 'NataSans-Bold',
    fontSize: 16,
    marginVertical: 6,
  },
  link: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  code_inline: {
    color: '#D1D5DB',
    backgroundColor: '#1F2937',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'Menlo',
  },
  code_block: {
    color: '#D1D5DB',
    backgroundColor: '#1F2937',
    padding: 10,
    borderRadius: 8,
    fontFamily: 'Menlo',
    marginVertical: 8,
  },
  fence: {
    color: '#D1D5DB',
    backgroundColor: '#1F2937',
    padding: 10,
    borderRadius: 8,
    fontFamily: 'Menlo',
    marginVertical: 8,
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  list_item: {
    marginBottom: 4,
  },
};

const markdownRules = {
  image: (node: any) => {
    return (
      <Image
        key={node.key}
        source={{ uri: node.attributes.src }}
        style={{ width: '100%', height: 200, resizeMode: 'contain', marginVertical: 8 }}
        accessible={!!node.attributes.alt}
        accessibilityLabel={node.attributes.alt}
      />
    );
  },
};
