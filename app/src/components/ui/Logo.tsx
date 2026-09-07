import { Image, StyleSheet } from 'react-native';

type Props = {
  size?: number;
};

export function Logo({ size = 76 }: Props) {
  return <Image source={require('../../../assets/icon.png')} style={[styles.image, { width: size, height: size }]} />;
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 22,
  },
});
