import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useApp } from '../store/AppContext';
import { colors, radius, spacing } from '../theme/theme';
import TabIcon from './TabIcon';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import TributesScreen from '../screens/tribute/TributesScreen';
import CreateTributeScreen from '../screens/tribute/CreateTributeScreen';
import TributeDetailScreen from '../screens/tribute/TributeDetailScreen';
import QRScreen from '../screens/qr/QRScreen';
import PublicViewerScreen from '../screens/PublicViewerScreen';
import ProfileChooserScreen from '../screens/profiles/ProfileChooserScreen';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const TributesStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Forgot" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function TributesNavigator() {
  return (
    <TributesStack.Navigator screenOptions={{ headerShown: false }}>
      <TributesStack.Screen name="TributesList" component={TributesScreen} />
      <TributesStack.Screen name="CreateTribute" component={CreateTributeScreen} />
      <TributesStack.Screen name="TributeDetail" component={TributeDetailScreen} />
    </TributesStack.Navigator>
  );
}

const TAB_ICON = { Home: 'home', Tributes: 'tributes', QR: 'qr', Profile: 'profile' };

function TabBarIcon({ routeName, color, focused }) {
  return (
    <View style={[tabStyles.pill, focused && tabStyles.pillActive]}>
      <TabIcon name={TAB_ICON[routeName]} color={color} focused={focused} />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 74,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2, marginTop: 4 },
        tabBarIcon: ({ color, focused }) => (
          <TabBarIcon routeName={route.name} color={color} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tributes" component={TributesNavigator} />
      <Tab.Screen name="QR" component={QRScreen} options={{ tabBarLabel: 'QR Codes' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  pill: {
    width: 56,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: colors.lavenderMist,
    borderWidth: 1,
    borderColor: colors.lavender,
  },
});

export default function RootNavigator() {
  const { user, activeProfile, hasLoggedOut } = useApp();

  // Force a clean navigation tree whenever authentication/profile state changes.
  // This prevents React Navigation from retaining the dashboard from a previous
  // state. The dashboard only exists after a memorial profile is explicitly chosen.
  const flowKey = !user
    ? 'auth-flow'
    : !activeProfile
      ? `memorial-picker-${user.id}`
      : `memorial-dashboard-${user.id}-${activeProfile.id}`;

  return (
    <RootStack.Navigator key={flowKey} screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          {!hasLoggedOut && <RootStack.Screen name="Onboarding" component={OnboardingScreen} />}
          <RootStack.Screen name="Auth" component={AuthNavigator} initialParams={{ screen: 'Login' }} />
        </>
      ) : !activeProfile ? (
        <RootStack.Screen name="ChooseMemorial" component={ProfileChooserScreen} />
      ) : (
        <>
          <RootStack.Screen name="Main" component={MainTabs} />
          <RootStack.Screen
            name="Viewer"
            component={PublicViewerScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
}
