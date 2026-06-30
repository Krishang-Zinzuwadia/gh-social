import React, { useState, useRef, useEffect } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Check, Plus, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { NebulaIcon } from '../icons';

interface SavePopupProps {
  isVisible: boolean;
  onClose: () => void;
  panelWidth: number;
  panelTranslateX: Animated.Value;
  overlayOpacity: Animated.Value;
  isGestureActive: boolean;
}

const INITIAL_COLLECTIONS: string[] = ['AI Projects', 'Web Development', 'Open Source', 'Inspiration'];

export function SavePopup({
  isVisible,
  onClose,
  panelWidth,
  panelTranslateX,
  overlayOpacity,
  isGestureActive,
}: SavePopupProps) {
  const [selected, setSelected] = useState<string | null>('AI Projects');
  const [collections, setCollections] = useState<string[]>(INITIAL_COLLECTIONS);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollection, setNewCollection] = useState('');
  const [status, setStatus] = useState<'idle' | 'saved'>('idle');

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const closeAnimated = () => {
    Animated.parallel([
      Animated.timing(panelTranslateX, {
        toValue: -panelWidth,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setStatus('idle');
      setIsCreating(false);
      setNewCollection('');
      onClose();
    });
  };

  const createCollection = () => {
    const name = newCollection.trim();
    if (!name) return;
    if (!collections.includes(name)) {
      setCollections((current) => [...current, name]);
    }
    setSelected(name);
    setIsCreating(false);
    setNewCollection('');
  };

  const saveRepository = () => {
    if (!selected) return;
    setStatus('saved');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(closeAnimated, 450);
  };

  const sheetHeight = 450;
  const translateY = panelTranslateX.interpolate({
    inputRange: [-panelWidth, 0],
    outputRange: [sheetHeight, 0],
    extrapolate: 'clamp',
  });

  if (!isVisible) return null;

  return (
    <View style={styles.root} pointerEvents={isGestureActive ? 'none' : 'auto'}>
      <Pressable style={StyleSheet.absoluteFill} onPress={closeAnimated}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </Pressable>

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Save Repository</Text>
            <Text style={styles.subtitle}>Choose a collection</Text>
          </View>
          <Pressable onPress={closeAnimated} style={styles.closeButton}>
            <X size={20} color="#FFFFFF" strokeWidth={1.8} />
          </Pressable>
        </View>

        {/* Collection cards */}
        <ScrollView 
          style={styles.scrollList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {collections.map((name) => {
            const active = selected === name;
            return (
              <TouchableOpacity
                key={name}
                onPress={() => setSelected(name)}
                activeOpacity={0.7}
                style={[
                  styles.collectionCard,
                  active ? styles.collectionCardActive : styles.collectionCardInactive,
                ]}
              >
                {/* Circular collection thumbnail */}
                <View style={styles.thumbnail}>
                  <NebulaIcon width={38} height={38} />
                </View>

                <Text style={styles.collectionName}>{name}</Text>
                
                {/* Radio selection indicator */}
                <View style={[styles.radio, active ? styles.radioActive : styles.radioInactive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footerContainer}>
          {isCreating ? (
            <View style={styles.createInputRow}>
              <TextInput
                autoFocus
                value={newCollection}
                onChangeText={setNewCollection}
                onSubmitEditing={createCollection}
                placeholder="Collection name"
                placeholderTextColor="#757575"
                style={styles.createInput}
              />
              <Pressable onPress={createCollection} style={styles.createSubmit}>
                <Check size={18} color="#0A0C09" />
              </Pressable>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsCreating(true)}
              activeOpacity={0.7}
              style={styles.createButton}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.createText}>Create new collection</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={saveRepository}
            activeOpacity={0.8}
            style={[styles.saveButton, !selected && { backgroundColor: '#1E241E', opacity: 0.5 }]}
            disabled={!selected}
          >
            <Text style={[styles.saveText, !selected && { color: '#8E8E93' }]}>
              {status === 'saved' ? 'Saved!' : selected ? `Save to ${selected}` : 'Save to Collection'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#0C0E0B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#8EFF7A',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    height: 450,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    
    // Cyberpunk glow style
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'NataSans-Bold',
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    color: '#8E8E93',
    fontFamily: 'NataSans-Regular',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    flex: 1,
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
    paddingVertical: 4,
  },
  collectionCard: {
    height: 58,
    borderRadius: 18, // Rounded corner styling of DescriptionCard
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  collectionCardInactive: {
    borderColor: '#2E4C2C', // Dim green border outline to match screenshots
    backgroundColor: '#0F110E',
  },
  collectionCardActive: {
    borderColor: '#8EFF7A', // Glowing green border
    backgroundColor: '#10150F', // Same card background as first tab
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  thumbnail: {
    width: 38,
    height: 38,
    borderRadius: 8, // Square collection thumbnails with rounded corners
    backgroundColor: '#10150F',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  collectionName: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'NataSans-Regular',
    fontSize: 15,
    lineHeight: 20,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInactive: {
    borderColor: '#303030',
    backgroundColor: 'rgba(28,28,28,0.5)',
  },
  radioActive: {
    borderColor: '#8EFF7A',
    backgroundColor: '#8EFF7A',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0C0E0B',
  },
  footerContainer: {
    gap: 12,
  },
  createButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  createText: {
    color: '#FFFFFF', // White accent color
    fontFamily: 'NataSans-Bold',
    fontSize: 15,
    lineHeight: 20,
  },
  createInputRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  createInput: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#8EFF7A',
    color: '#FFFFFF',
    fontFamily: 'NataSans-Regular',
    fontSize: 15,
    paddingHorizontal: 12,
    backgroundColor: '#0F110E',
  },
  createSubmit: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#8EFF7A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#58A351', // rich green button
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#58A351',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  saveText: {
    color: '#FFFFFF', // white text
    fontFamily: 'NataSans-Bold',
    fontSize: 16,
    lineHeight: 22,
  },
});
