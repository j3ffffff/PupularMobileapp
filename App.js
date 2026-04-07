import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AnimalsProvider, UserProvider, useUser } from './src/context/AppContext';
import { COLORS } from './src/constants/theme';

import OnboardingScreen from './src/screens/OnboardingScreen';
import SwipeScreen from './src/screens/SwipeScreen';
import LikesScreen from './src/screens/LikesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PetDetailScreen from './src/screens/PetDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, i) => {
        const { options } = descriptors[route.key];
        const focused = state.index === i;
        const icons = { Discover: ['flame', 'flame-outline'], Liked: ['heart', 'heart-outline'], Profile: ['person', 'person-outline'] };
        const [activeIcon, inactiveIcon] = icons[route.name] || ['ellipse', 'ellipse-outline'];

        return (
          <View key={route.key} style={styles.tabItem}>
            <View
              onStartShouldSetResponder={() => true}
              onResponderRelease={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={[styles.tabBtn, focused && styles.tabBtnActive]}
            >
              <Ionicons name={focused ? activeIcon : inactiveIcon} size={22} color={focused ? COLORS.white : COLORS.muted} />
              {focused && <Text style={styles.tabLabel}>{route.name}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Discover" component={SwipeScreen} />
      <Tab.Screen name="Liked" component={LikesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { profile } = useUser();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!profile.onboarded ? (
        // Not onboarded: only Onboarding screen available
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        // Onboarded: Main + modals. React Navigation transitions automatically.
        <Stack.Group>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="EditPreferences" component={OnboardingScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="PetDetail" component={PetDetailScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <AnimalsProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </AnimalsProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabBtnActive: {
    backgroundColor: COLORS.coral,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  tabLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
