import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MelonModsNavigator, CollectionNavigator, MoreNavigator, MCPEModsNavigator } from '../CustomNavigation';

const Tab = createBottomTabNavigator();

export default function Home() {
    return (
        // <NavigationContainer>
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#ECEFF1'
                },
                tabBarActiveBackgroundColor: '#B3E5FC'
            }}
        >
            <Tab.Screen
                name="MelonModsTab" component={MelonModsNavigator}
                options={{
                    title: "MelonMods",
                    headerShown: false,
                    tabBarIcon: () => (
                        <Ionicons name="body-outline" color='#424242' size={20} />
                    ),
                }}
            />
            {/* <Tab.Screen
                name="MCPEModsTab" component={MCPEModsNavigator}
                options={{
                    title: "MCPEMods",
                    headerShown: false,
                    tabBarIcon: () => (
                        <Ionicons name="cube-outline" color='#424242' size={20} />
                    ),
                }}
            /> */}
            <Tab.Screen
                name="CollectionTab" component={CollectionNavigator}
                options={{
                    title: "Collection",
                    headerShown: false,
                    tabBarIcon: () => (
                        <Ionicons name="bookmarks-outline" color='#424242' size={20} />
                    ),
                }}
            />
            <Tab.Screen
                name="MoreTab" component={MoreNavigator}
                options={{
                    title: "More",
                    headerShown: false,
                    tabBarIcon: () => (
                        <Ionicons name="construct-outline" color='#424242' size={20} />
                    ),
                }}
            />
        </Tab.Navigator>
        // </NavigationContainer>
    );
}
