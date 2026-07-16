import { Image, View } from "react-native";

interface LogoPlaceholderProps {
  size?: number;
}

export default function LogoPlaceholder({ size = 190 }: LogoPlaceholderProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: size / 2,
        overflow: 'hidden',
      }}
    >
      <Image
        source={require('../../../assets/images/logo/weavelogo.png')}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    </View>
  );
}