import React from "react"
import {Platform,View,ViewStyle,TouchableOpacity} from "react-native"
import { LiquidGlassView as LiquidGlassViewFromPackage ,isLiquidGlassSupported} from '@callstack/liquid-glass';

type LiquidGlassViewProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  effect?: 'clear' | 'regular' | 'none';
  tintColor?: string;
  interactive?: boolean;
  colorScheme?: 'light' | 'dark' | 'system';
  onPress?: () => void;
}
export const LiquidGlassView = ({children,style,effect='clear',tintColor=undefined,interactive=false,colorScheme='system',onPress}: LiquidGlassViewProps) => {

  return (
    <>
        { (Platform.OS === 'ios' && isLiquidGlassSupported) ? (
            <LiquidGlassViewFromPackage 
            style={style}
            interactive={interactive}
            effect={effect}
            tintColor={tintColor}
            colorScheme={colorScheme}
            onTouchEnd={onPress}
            >
                {children}
            </LiquidGlassViewFromPackage>
        ) : (
            interactive && onPress ? (
              <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                <View 
                className="bg-gray400/60 border border-1 border-gray200"
                style={{...style}}>
                    {children}
                </View>
              </TouchableOpacity>
            ) : (
              <View className="bg-gray400/60 border border-1 border-gray200" style={{...style}}>
                  {children}
              </View>
            )
        )}
    </>
  )
}