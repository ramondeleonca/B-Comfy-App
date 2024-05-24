import { AppRegistry } from "react-native";
import app from "./app.json";
import { PaperProvider } from "react-native-paper";
import SyncStorage from "sync-storage"
import Intro from "./screens/intro";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Main from "./screens/main";

export default function App() {
  SyncStorage.init();
  const completedIntro = SyncStorage.get("completedIntro") ?? false;

  const Stack = createNativeStackNavigator();

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator id="main" initialRouteName={completedIntro ? "main" : "intro"} screenOptions={{headerShown: false}}>
          <Stack.Screen name="intro" component={Intro}></Stack.Screen>
          <Stack.Screen name="main" component={Main}></Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

AppRegistry.registerComponent(app.expo.name, () => App);