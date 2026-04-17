import { Alert, Share } from 'react-native';

export async function sharePupularApp() {
  try {
    await Share.share({
      title: 'Join me on Pupular',
      message: 'I\'m using Pupular to find rescue pets near me 🐾 Swipe through adoptable pets and find your future best friend: https://www.pupular.app',
      url: 'https://www.pupular.app',
    });
  } catch (error) {
    Alert.alert('Share unavailable', `We couldn't open the share sheet right now. ${error?.message || ''}`.trim());
  }
}
