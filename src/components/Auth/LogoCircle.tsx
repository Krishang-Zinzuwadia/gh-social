import { Image, View } from "react-native";

interface LogoCircleProps {
  size?: number;
}

export default function LogoCircle({ size = 190 }: LogoCircleProps) {
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