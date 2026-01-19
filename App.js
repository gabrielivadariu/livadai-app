import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { NotificationsProvider } from "./src/context/NotificationsContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { livadaiTheme } from "./src/theme/theme";
import i18n from "./src/i18n/i18n";

export default function App() {
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("lang");
      if (saved) {
        await i18n.changeLanguage(saved);
      }
    })();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <PaperProvider theme={livadaiTheme}>
        <SafeAreaProvider>
          <AuthProvider>
            <NotificationsProvider>
              <StatusBar style="dark" />
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </NotificationsProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </I18nextProvider>
  );
}
