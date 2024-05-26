import { View } from "react-native";
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import Home from "./home";
import Settings from "./settings";
import Chat from "./chat";
import { useEffect } from "react";
import SyncStorage from "sync-storage";

export default function Main() {
    const BottomTabs = createMaterialBottomTabNavigator();

    useEffect(() => {
        SyncStorage.set("completedIntro", true);
    }, []);

    return (
        <BottomTabs.Navigator>
            <BottomTabs.Screen name="B-Comfy" component={Home} options={{ tabBarIcon: "ticket" }}></BottomTabs.Screen>
            <BottomTabs.Screen name="Chat" component={Chat} options={{ tabBarIcon: "message" }}></BottomTabs.Screen>
            <BottomTabs.Screen name="Configuración" component={Settings} options={{ tabBarIcon: "cog" }}></BottomTabs.Screen>
        </BottomTabs.Navigator>
    )
}