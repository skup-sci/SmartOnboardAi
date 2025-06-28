import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { UserSource } from '../types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';

interface SourceSelectorProps {
  selectedSource: UserSource;
  onSourceChange: (source: UserSource) => void;
}

const sources: UserSource[] = ['instagram', 'referral', 'blog', 'direct', 'unknown'];

const SourceSelector: React.FC<SourceSelectorProps> = ({
  selectedSource,
  onSourceChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Simulate traffic source:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sources.map((source) => (
          <TouchableOpacity
            key={source}
            style={[
              styles.sourceButton,
              selectedSource === source && {
                backgroundColor: COLORS.sourceColors[source],
                borderColor: COLORS.sourceColors[source],
              },
            ]}
            onPress={() => onSourceChange(source)}
          >
            <Text
              style={[
                styles.sourceText,
                selectedSource === source && styles.selectedSourceText,
              ]}
            >
              {source}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginLeft: SPACING.md,
    marginBottom: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  sourceButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  sourceText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
    textTransform: 'capitalize',
  },
  selectedSourceText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default SourceSelector;
