import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (  
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#dedede",
          paddingTop: 15
        },
        tabBarActiveTintColor: "teal",
        tabBarInactiveTintColor: "black"
      }}
    >	
      <Tabs.Screen
        name='index'
        options={{
          title: "Home",
          tabBarIcon: ({focused}) => (
            <Ionicons
              size={24}
              name={focused ? "home-sharp" : "home-outline"}
              color={focused ? "teal" : "black"}
            />
          )
        }
      }/>
      <Tabs.Screen
        name='activities'
        options={{
          title: "Activities",
          tabBarIcon: ({focused}) => (
            <Ionicons
              size={24}
              name={focused ? "albums-sharp" : "albums-outline"}
              color={focused ? "teal" : "black"}
            />
          )
        }
      }/>
      <Tabs.Screen
        name='leaderboard'
        options={{
          title: "Leaderboard",
          tabBarIcon: ({focused}) => (
            <Ionicons
              size={24}
              name={focused ? "cellular" : "cellular-outline"}
              color={focused ? "teal" : "black"}
            />
          )
        }
      }/>
      <Tabs.Screen
        name='settings'
        options={{
          title: "Settings",
          tabBarIcon: ({focused}) => (
            <Ionicons
              size={24}
              name={focused ? "cog-sharp" : "cog-outline"}
              color={focused ? "teal" : "black"}
            />
          )
        }
      }/>
    </Tabs>
  );
}
