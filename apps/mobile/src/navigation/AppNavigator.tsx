import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Onboarding Screens
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { PregnancySetupScreen } from '../screens/onboarding/PregnancySetupScreen';

// Main Screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { JournalScreen } from '../screens/journal/JournalScreen';
import { MedicationsScreen } from '../screens/medications/MedicationsScreen';
import { VitalsScreen } from '../screens/vitals/VitalsScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

// Feature Screens
import { AIAssistantScreen } from '../screens/ai/AIAssistantScreen';
import { KickCounterScreen } from '../screens/vitals/KickCounterScreen';
import { BloodSugarScreen } from '../screens/vitals/BloodSugarScreen';
import { WeightTrackingScreen } from '../screens/vitals/WeightTrackingScreen';
import { CaregiverPortalScreen } from '../screens/caregivers/CaregiverPortalScreen';
import { AppointmentsScreen } from '../screens/appointments/AppointmentsScreen';
import { DiscreteModeScreen } from '../screens/settings/DiscreteModeScreen';
import { EmergencyScreen } from '../screens/emergency/EmergencyScreen';
import { PregnancyTimelineScreen } from '../screens/pregnancy/PregnancyTimelineScreen';
import { ConcernsScreen } from '../screens/concerns/ConcernsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="PregnancySetup" component={PregnancySetupScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Journal':
              iconName = focused ? 'journal' : 'journal-outline';
              break;
            case 'Meds':
              iconName = focused ? 'medkit' : 'medkit-outline';
              break;
            case 'Vitals':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'AI':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#DB2777',
        tabBarInactiveTintColor: '#78716C',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Meds" component={MedicationsScreen} />
      <Tab.Screen name="Vitals" component={VitalsScreen} />
      <Tab.Screen name="AI" component={AIAssistantScreen} />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: 'Provider Reports' }}
      />
      <Stack.Screen 
        name="Appointments" 
        component={AppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Stack.Screen 
        name="KickCounter" 
        component={KickCounterScreen}
        options={{ title: 'Kick Counter' }}
      />
      <Stack.Screen 
        name="BloodSugar" 
        component={BloodSugarScreen}
        options={{ title: 'Blood Sugar' }}
      />
      <Stack.Screen 
        name="WeightTracking" 
        component={WeightTrackingScreen}
        options={{ title: 'Weight' }}
      />
      <Stack.Screen 
        name="Caregivers" 
        component={CaregiverPortalScreen}
        options={{ title: 'Caregivers' }}
      />
      <Stack.Screen 
        name="DiscreteMode" 
        component={DiscreteModeScreen}
        options={{ title: 'Discrete Mode' }}
      />
      <Stack.Screen 
        name="Emergency" 
        component={EmergencyScreen}
        options={{ title: 'Emergency Info' }}
      />
      <Stack.Screen 
        name="Timeline" 
        component={PregnancyTimelineScreen}
        options={{ title: 'Pregnancy Timeline' }}
      />
      <Stack.Screen 
        name="Concerns" 
        component={ConcernsScreen}
        options={{ title: 'My Concerns' }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <>
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
}
