import { Alert, Share } from 'react-native';

const APP_STORE_URL = 'https://apps.apple.com/us/app/pupular-adopt-a-pet/id6761799693';

export async function sharePupularApp() {
  try {
    await Share.share({
      title: 'Join me on Pupular',
      message: `I'm using Pupular to find rescue pets near me 🐾 Swipe through adoptable pets and find your future best friend: ${APP_STORE_URL}`,
      url: APP_STORE_URL,
    });
  } catch (error) {
    Alert.alert('Share unavailable', `We couldn't open the share sheet right now. ${error?.message || ''}`.trim());
  }
}
