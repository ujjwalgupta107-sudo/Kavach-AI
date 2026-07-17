import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { View, ViewStyle } from 'react-native';

interface LogoProps {
  size?: number;
  style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({ size = 80, style }) => {
  return (
    <View style={style}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#a855f7" />
            <Stop offset="0.5" stopColor="#8b5cf6" />
            <Stop offset="1" stopColor="#3b82f6" />
          </LinearGradient>
        </Defs>
        <Path
          d="M 35 15 L 75 15 L 60 45 L 85 45 L 45 90 L 55 55 L 25 55 Z"
          fill="url(#grad)"
        />
      </Svg>
    </View>
  );
};
