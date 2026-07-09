import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

import { View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B1120' }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <StatusBar style="light" />
        <AppNavigator />
      </SafeAreaProvider>
    </View>
  );
}
