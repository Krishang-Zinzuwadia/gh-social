import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { X, Plus, Circle, Check } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  useSharedValue 
} from 'react-native-reanimated';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POPUP_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 420);
interface SavePopupProps {
  isVisible: boolean;
  onClose: () => void;
}
export function SavePopup({ isVisible, onClose }: SavePopupProps) {
  const [selected, setSelected] = useState('AI Projects');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  const collections = [
    { id: 'ai', name: 'AI Projects' },
    { id: 'web', name: 'Web Development' },
    { id: 'os', name: 'Open Source' },
    { id: 'insp', name: 'Inspiration' },
  ];
  // Animate popup slider from right
  const offset = useSharedValue(SCREEN_WIDTH);
  const overlayOpacity = useSharedValue(0);
  React.useEffect(() => {
    if (isVisible) {
      offset.value = withSpring(SCREEN_WIDTH - POPUP_WIDTH, { damping: 20, stiffness: 90 });
      overlayOpacity.value = withTiming(1, { duration: 250 });
    } else {
      offset.value = withSpring(SCREEN_WIDTH, { damping: 20, stiffness: 90 });
      overlayOpacity.value = withTiming(0, { duration: 250 });
      setSaveStatus('idle'); // Reset state
    }
  }, [isVisible]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));
  const handleSave = () => {
    if (saveStatus !== 'idle') return;
    setSaveStatus('loading');
    
    // Simulate API saving request
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 1500);
  };
  if (!isVisible) return null;
  return (
    <View style={styles.absoluteFillContainer}>
      {/* Dimmed Overlay */}
      <Pressable onPress={onClose} style={styles.overlayContainer}>
        <Animated.View style={[styles.overlay, overlayStyle]} />
      </Pressable>
      {/* Popup Container (Slides from right) */}
      <Animated.View style={[styles.popupContainer, animatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Save Repository</Text>
            <Text style={styles.subtitle}>Choose a collection</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#808581" />
          </Pressable>
        </View>
        {/* Collection List */}
        <View style={styles.listContainer}>
          {collections.map((col) => {
            const isSelected = selected === col.name;
            return (
              <Pressable
                key={col.id}
                onPress={() => setSelected(col.name)}
                style={[
                  styles.itemWrapper,
                  isSelected ? styles.itemSelectedBorder : styles.itemUnselectedBorder,
                ]}
              >
                {/* Glowing Sphere Icon on the left */}
                <View style={styles.glowingSphereContainer}>
                  <View style={styles.glowingSphereOuter}>
                    <View style={styles.glowingSphereCore} />
                  </View>
                </View>
                {/* Title */}
                <Text style={[styles.itemText, isSelected && styles.itemTextActive]}>
                  {col.name}
                </Text>
                {/* Custom Radio Button on the right */}
                <View style={styles.radioWrapper}>
                  {isSelected ? (
                    <View style={styles.radioOuterSelected}>
                      <View style={styles.radioInnerSelected} />
                    </View>
                  ) : (
                    <Circle size={20} strokeWidth={1.5} color="rgba(128, 133, 129, 0.6)" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
        {/* Create New Collection Option */}
        <Pressable 
          style={({ pressed }) => [
            styles.createRow, 
            pressed && styles.createRowPressed
          ]}
        >
          <Plus size={16} color="#ffffff" style={styles.createIcon} />
          <Text style={styles.createText}>Create new collection</Text>
        </Pressable>
        {/* Save Button */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleSave}
            disabled={saveStatus !== 'idle'}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
              saveStatus === 'success' && styles.saveButtonSuccess,
            ]}
          >
            {saveStatus === 'loading' && (
              <ActivityIndicator size="small" color="#0B0F0C" style={{ marginRight: 8 }} />
            )}
            {saveStatus === 'success' && (
              <Check size={18} color="#0B0F0C" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.saveButtonText}>
              {saveStatus === 'idle' && `Save to ${selected}`}
              {saveStatus === 'loading' && 'Saving...'}
              {saveStatus === 'success' && 'Saved!'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  absoluteFillContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  popupContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: POPUP_WIDTH,
    backgroundColor: '#0B0F0C',
    borderLeftWidth: 1,
    borderColor: 'rgba(142, 255, 122, 0.25)',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 36,
    zIndex: 9999,
    shadowColor: '#8EFF7A',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'NataSans-Bold',
    fontSize: 22,
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'NataSans-Regular',
    fontSize: 14,
    color: '#808581',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    gap: 12,
    marginBottom: 24,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 18, 0.4)',
    borderWidth: 1,
  },
  itemSelectedBorder: {
    borderColor: '#8EFF7A',
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  itemUnselectedBorder: {
    borderColor: 'rgba(128, 133, 129, 0.15)',
  },
  glowingSphereContainer: {
    marginRight: 16,
  },
  glowingSphereOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1500', // Dark amber base
    borderWidth: 1.5,
    borderColor: '#FFB23F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB23F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  glowingSphereCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFE97F',
    shadowColor: '#FFE97F',
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  itemText: {
    fontFamily: 'NataSans-Medium',
    fontSize: 15,
    color: '#808581',
    flex: 1,
  },
  itemTextActive: {
    color: '#ffffff',
  },
  radioWrapper: {
    marginLeft: 16,
  },
  radioOuterSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8EFF7A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  radioInnerSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8EFF7A',
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 'auto',
  },
  createRowPressed: {
    opacity: 0.7,
  },
  createIcon: {
    marginRight: 8,
  },
  createText: {
    fontFamily: 'NataSans-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  footer: {
    marginTop: 24,
  },
  saveButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#66D95B', // Primary green
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  saveButtonSuccess: {
    backgroundColor: '#8EFF7A',
  },
  saveButtonText: {
    fontFamily: 'NataSans-Bold',
    fontSize: 16,
    color: '#0B0F0C',
  },
});
