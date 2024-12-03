import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import MelonMods from "./screens/MelonMods";
import Collection from "./screens/Collection";
import More from "./screens/More";

const Stack = createStackNavigator();

const MelonModsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#FFF',
      },
      headerTintColor: '#000',
      headerTitleAlign: 'center',
    }}>
      {/* <Stack.Navigator> */}
      <Stack.Screen
        name="MelonMods"
        component={MelonMods}
      />
    </Stack.Navigator>
  );
}

export { MelonModsNavigator };

// const ExploreNavigator = () => {
//   return (
//     <Stack.Navigator screenOptions={{
//       headerShown: true,
//       headerStyle: {
//         backgroundColor: '#616161',
//       },
//       headerTintColor: '#fff',
//       headerTitleAlign: 'center',
//     }}>
//       {/* <Stack.Navigator> */}
//       <Stack.Screen
//         name="Explore"
//         component={Explore}
//       />
//     </Stack.Navigator>
//   );
// }

// export { ExploreNavigator };

const CollectionNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#FFF',
      },
      headerTintColor: '#000',
      headerTitleAlign: 'center',
    }}>
      <Stack.Screen
        name="Collection"
        component={Collection}
      />
    </Stack.Navigator>
  );
}

export { CollectionNavigator };

const MoreNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#FFF',
      },
      headerTintColor: '#000',
      headerTitleAlign: 'center',
    }}>
      <Stack.Screen
        name="More"
        component={More}
      />
    </Stack.Navigator>
  );
}

export { MoreNavigator };