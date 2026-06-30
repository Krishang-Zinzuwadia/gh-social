import React, { useEffect, useMemo } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
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
            <X size={24} color="#A49898" strokeWidth={1.5} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={true} style={styles.popupContentScroll}>
          <Text style={styles.popupReadmeText}>
            {readmeText}
          </Text>
        </ScrollView>
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
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#8EFF7A',
    padding: 20,
    width: '90%',
    height: '75%',
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  popupTitle: {
    color: '#8EFF7A',
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
  popupReadmeText: {
    color: '#FFFFFF',
    fontFamily: 'NataSans-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
});
