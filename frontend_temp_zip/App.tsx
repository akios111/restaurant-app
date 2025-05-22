/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, StyleSheet, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens from their new locations
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import RestaurantListScreen from './src/screens/RestaurantListScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';
import BookingFormScreen from './src/screens/BookingFormScreen';
import EditBookingScreen from './src/screens/EditBookingScreen'; // Import the new screen

// Re-define or import UserReservation if it's not already globally available
// For now, let's assume it might be needed by EditBookingScreen
interface UserReservationForNav {
  reservation_id: number;
  reservation_date: string; 
  reservation_time: string; 
  people_count: number;
  restaurant_id: number; // Added restaurant_id for editing context
  restaurant_name: string;
  // restaurant_location is not strictly needed for edit form but good for context if shown
}

// Define Param List for type safety
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  RestaurantList: undefined;
  RestaurantDetail: { restaurantId: number; restaurantName: string; location: string; description?: string | null };
  BookingForm: { restaurantId: number; restaurantName: string };
  Profile: undefined;
  EditBooking: { reservationData: UserReservationForNav }; // Added EditBooking route
  // We will add more screens like RestaurantList, BookingForm, Profile later
};

// Define shared interfaces/types
export interface Restaurant {
  restaurant_id: number;
  name: string;
  location: string;
  description?: string | null;
}

// Screen prop types are now defined within each screen file, no longer needed here globally.

const Stack = createNativeStackNavigator<RootStackParamList>();

// Define the type for initialRouteName explicitly for clarity
type InitialRouteName = keyof RootStackParamList;

function App(): React.JSX.Element | null {
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<InitialRouteName>('Login'); // Default to Login

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token !== null) {
          // Here you might want to add token validation with your backend if necessary
          // For now, just checking if token exists
          setInitialRoute('Home');
        } else {
          setInitialRoute('Login');
        }
      } catch (e) {
        console.error('Failed to fetch the token from storage', e);
        setInitialRoute('Login'); // Fallback to Login screen on error
      } finally {
        setIsTokenLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isTokenLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName={initialRoute} // Dynamically set initial route
          screenOptions={{
            headerStyle: {
              backgroundColor: '#f4511e', // Example header color
            },
            headerTintColor: '#fff', // Header text color
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Welcome - Please Login' }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Create Account' }} 
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              title: 'Restaurant Booking App', 
              headerBackVisible: false, // No back button on Home screen if it's a main tab
            }} 
          />
          <Stack.Screen name="RestaurantList" component={RestaurantListScreen} options={{ title: 'Restaurants' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
          <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={({ route }) => ({ title: route.params.restaurantName })} />
          <Stack.Screen name="BookingForm" component={BookingFormScreen} options={({ route }) => ({ title: `Book: ${route.params.restaurantName}` })} />
          <Stack.Screen name="EditBooking" component={EditBookingScreen} options={{ title: 'Edit Reservation' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

// Styles for App.tsx are minimal now, or can be removed if not used for a wrapper View.
const styles = StyleSheet.create({
  loadingContainer: { // Style for the loading indicator view
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Or your app's background color
  }
  // Example style if needed for a root <View> in App.tsx, not currently used.
  // appContainer: {
  //   flex: 1,
  // }
});

export default App;
