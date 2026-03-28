import useColorPalette from '@/hooks/useColorPalette';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";

export default function RootLayout() {

  const colors = useColorPalette()
  
  return (  
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          paddingTop: 15
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textPrimary,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
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
              color={focused ? colors.primary : colors.textPrimary}
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
              color={focused ? colors.primary : colors.textPrimary}
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
              color={focused ? colors.primary : colors.textPrimary}
            />
          )
        }
      }/>
      <Tabs.Screen
        name='history'
        options={{
          title: "History",
          tabBarIcon: ({focused}) => (
            <Ionicons
              size={24}
              name={focused ? "time" : "time-outline"}
              color={focused ? colors.primary : colors.textPrimary}
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
              color={focused ? colors.primary : colors.textPrimary}
            />
          )
        }
      }/>
    </Tabs>
  );
}
