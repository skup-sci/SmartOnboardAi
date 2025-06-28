import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { COLORS, FONT_SIZES, BORDER_RADIUS, SPACING } from '../constants';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  ...props
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.secondary;
      case 'outline':
        return 'transparent';
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    return variant === 'outline' ? COLORS.primary : COLORS.white;
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return SPACING.sm;
      case 'medium':
        return SPACING.md;
      case 'large':
        return SPACING.lg;
      default:
        return SPACING.md;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return FONT_SIZES.sm;
      case 'medium':
        return FONT_SIZES.md;
      case 'large':
        return FONT_SIZES.lg;
      default:
        return FONT_SIZES.md;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          padding: getPadding(),
          width: fullWidth ? '100%' : undefined,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? COLORS.primary : undefined,
        },
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: getTextColor(),
            fontSize: getFontSize(),
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonText: {
    fontWeight: '600',
  },
});

export default Button;
