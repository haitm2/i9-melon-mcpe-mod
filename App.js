import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './screens/Home';
import Premium from './screens/Premium';
import MelonDetail from './screens/MelonDetail';
import Splash from './screens/Splash';
import MelonSearch from './screens/MelonSearch';
import MelonTutorial from './screens/MelonTutorial';
import RequestMod from './screens/RequestMod';
import LuckyNumber from './screens/LuckyNumber';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: '#FFF',
          },
        }}
      >
        <Stack.Group>
          <Stack.Screen
            name="Splash"
            component={Splash}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={Home}
          />
          <Stack.Screen
            name="MelonDetail"
            component={MelonDetail}
            options={{ headerShown: true, headerBackTitle: null }}
          />
          <Stack.Screen
            name="MelonSearch"
            component={MelonSearch}
            options={{ headerShown: true, headerBackTitle: null }}
          />
          <Stack.Screen
            name="MelonTutorial"
            component={MelonTutorial}
            options={{ headerShown: true, headerBackTitle: null }}
          />
          <Stack.Screen
            name="RequestMod"
            component={RequestMod}
            options={{ headerShown: true, headerBackTitle: null }}
          />
          <Stack.Screen
            name="LuckyNumber"
            component={LuckyNumber}
            options={{ headerShown: true, headerBackTitle: null }}
          />
        </Stack.Group>
        <Stack.Group
          screenOptions={{ presentation: 'modal', headerShown: false, gestureEnabled: false }}
        >
          <Stack.Screen
            name="Premium"
            component={Premium}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
