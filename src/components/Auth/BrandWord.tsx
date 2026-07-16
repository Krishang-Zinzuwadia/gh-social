import { Text } from 'react-native';

type BrandWordProps = {
  className?: string;
};

export default function BrandWord({ className = '' }: BrandWordProps) {
  return (
    <Text className={`text-white ${className}`}>
      Wea<Text className="text-[#63E08A]">v</Text>e
    </Text>
  );
}
