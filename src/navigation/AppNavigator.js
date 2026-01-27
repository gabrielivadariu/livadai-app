import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ExperienceListScreen from "../screens/ExperienceListScreen";
import ExperienceDetailScreen from "../screens/ExperienceDetailScreen";
import BookingScreen from "../screens/BookingScreen";
import ConversationsScreen from "../screens/ConversationsScreen";
import ChatScreen from "../screens/ChatScreen";
import CreateActivityScreen from "../screens/CreateActivityScreen";
import HostProfileScreen from "../screens/HostProfileScreen";
import EditHostProfileScreen from "../screens/EditHostProfileScreen";
import ReviewScreen from "../screens/ReviewScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import InfoScreen from "../screens/InfoScreen";
import ExplorerProfileScreen from "../screens/ExplorerProfileScreen";
import ExperienceMapScreen from "../screens/ExperienceMapScreen";
import MyActivitiesScreen from "../screens/MyActivitiesScreen";
import EditExplorerProfileScreen from "../screens/EditExplorerProfileScreen";
import HostNavigator from "./HostNavigator";
import HowItWorksHostScreen from "../screens/HowItWorksHostScreen";
import HostedExperiencesScreen from "../screens/HostedExperiencesScreen";
import DeleteAccountScreen from "../screens/DeleteAccountScreen";
import { livadaiColors } from "../theme/theme";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  backgroundColor: "#f5f7fb",
};
const headerTitleStyle = {
  color: livadaiColors.primary,
  fontWeight: "900",
  fontSize: 20,
};
const backTitleOptions = {
  headerBackTitleVisible: false,
  headerBackTitle: "",
  headerBackTitleStyle: { display: "none" },
};

function DummyTab() {
  return null;
}

function ExperiencesStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: false,
        headerStyle,
        headerTitleStyle,
        headerTintColor: livadaiColors.primary,
        ...backTitleOptions,
        headerTitleAlign: "left",
      })}
    >
      <Stack.Screen name="ExperienceList" component={ExperienceListScreen} options={backTitleOptions} />
      <Stack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} options={backTitleOptions} />
      <Stack.Screen name="Booking" component={BookingScreen} options={backTitleOptions} />
      <Stack.Screen name="Conversations" component={ConversationsScreen} options={backTitleOptions} />
      <Stack.Screen name="Chat" component={ChatScreen} options={backTitleOptions} />
      <Stack.Screen name="CreateActivity" component={CreateActivityScreen} options={backTitleOptions} />
      <Stack.Screen
        name="HostProfile"
        component={HostProfileScreen}
        options={{ headerShown: true, title: t("hostProfileTitle"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="EditHostProfile"
        component={EditHostProfileScreen}
        options={{ headerShown: true, title: t("editProfile"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ headerShown: true, title: t("leaveReview"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: true, title: t("notifications"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="Info"
        component={InfoScreen}
        options={({ route }) => ({ headerShown: true, title: route.params?.title || "Info", ...backTitleOptions })}
      />
      <Stack.Screen
        name="HowItWorksHost"
        component={HowItWorksHostScreen}
        options={{ headerShown: true, title: t("howItWorksHost"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="HostedExperiences"
        component={HostedExperiencesScreen}
        options={{ headerShown: true, title: t("hostedExperiences"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{ headerShown: true, title: t("deleteAccount"), ...backTitleOptions }}
      />
      <Stack.Screen name="PublicProfile" component={ExplorerProfileScreen} options={{ headerShown: false, ...backTitleOptions }} />
    </Stack.Navigator>
  );
}

function MapStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: false,
        headerStyle,
        headerTitleStyle,
        headerTintColor: livadaiColors.primary,
        ...backTitleOptions,
        headerTitleAlign: "left",
      })}
    >
      <Stack.Screen name="ExperienceMap" component={ExperienceMapScreen} options={backTitleOptions} />
      <Stack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} options={backTitleOptions} />
      <Stack.Screen name="Booking" component={BookingScreen} options={backTitleOptions} />
      <Stack.Screen name="Conversations" component={ConversationsScreen} options={backTitleOptions} />
      <Stack.Screen name="Chat" component={ChatScreen} options={backTitleOptions} />
      <Stack.Screen
        name="HostProfile"
        component={HostProfileScreen}
        options={{ headerShown: true, title: t("hostProfileTitle"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="EditHostProfile"
        component={EditHostProfileScreen}
        options={{ headerShown: true, title: t("editProfile"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ headerShown: true, title: t("leaveReview"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: true, title: t("notifications"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="Info"
        component={InfoScreen}
        options={({ route }) => ({ headerShown: true, title: route.params?.title || "Info", ...backTitleOptions })}
      />
      <Stack.Screen
        name="HowItWorksHost"
        component={HowItWorksHostScreen}
        options={{ headerShown: true, title: t("howItWorksHost"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="HostedExperiences"
        component={HostedExperiencesScreen}
        options={{ headerShown: true, title: t("hostedExperiences"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{ headerShown: true, title: t("deleteAccount"), ...backTitleOptions }}
      />
      <Stack.Screen name="PublicProfile" component={ExplorerProfileScreen} options={{ headerShown: false, ...backTitleOptions }} />
    </Stack.Navigator>
  );
}

function MyActivitiesStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: false,
        headerStyle,
        headerTitleStyle,
        headerTintColor: livadaiColors.primary,
        ...backTitleOptions,
        headerTitleAlign: "left",
      })}
    >
      <Stack.Screen name="MyActivities" component={MyActivitiesScreen} options={backTitleOptions} />
      <Stack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} options={backTitleOptions} />
      <Stack.Screen name="Booking" component={BookingScreen} options={backTitleOptions} />
      <Stack.Screen name="Chat" component={ChatScreen} options={backTitleOptions} />
      <Stack.Screen
        name="HostProfile"
        component={HostProfileScreen}
        options={{ headerShown: true, title: t("hostProfileTitle"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="EditHostProfile"
        component={EditHostProfileScreen}
        options={{ headerShown: true, title: t("editProfile"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ headerShown: true, title: t("leaveReview"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: true, title: t("notifications"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="HostedExperiences"
        component={HostedExperiencesScreen}
        options={{ headerShown: true, title: t("hostedExperiences"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{ headerShown: true, title: t("deleteAccount"), ...backTitleOptions }}
      />
      <Stack.Screen name="PublicProfile" component={ExplorerProfileScreen} options={{ headerShown: false, ...backTitleOptions }} />
    </Stack.Navigator>
  );
}

function ExplorerProfileStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: false,
        headerStyle,
        headerTitleStyle,
        headerTintColor: livadaiColors.primary,
        ...backTitleOptions,
        headerTitleAlign: "left",
      })}
    >
      <Stack.Screen name="ExplorerProfile" component={ExplorerProfileScreen} options={backTitleOptions} />
      <Stack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} options={backTitleOptions} />
      <Stack.Screen
        name="HostProfile"
        component={HostProfileScreen}
        options={{ headerShown: true, title: t("hostProfileTitle"), ...backTitleOptions }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} options={backTitleOptions} />
      <Stack.Screen
        name="EditExplorerProfile"
        component={EditExplorerProfileScreen}
        options={{ headerShown: true, title: t("editProfile"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="HostedExperiences"
        component={HostedExperiencesScreen}
        options={{ headerShown: true, title: t("hostedExperiences"), ...backTitleOptions }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{ headerShown: true, title: t("deleteAccount"), ...backTitleOptions }}
      />
      {/* rollback: become host disabled */}
    </Stack.Navigator>
  );
}

function MainTabs({ user }) {
  const { t } = useTranslation();
  const isHost = user?.role === "HOST" || user?.role === "BOTH";
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || 0;
  const bottomPad = Math.min(bottomInset, 12);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: livadaiColors.primary,
          borderTopColor: "#029db3",
          height: 50 + bottomPad,
          paddingBottom: Math.max(4, bottomPad),
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#e0f7fa",
        tabBarIcon: ({ color, size }) => {
          if (route.name === "ExperiencesTab") return <Ionicons name="list" size={size} color={color} />;
          if (route.name === "MapTab") return <Ionicons name="map-outline" size={size} color={color} />;
          if (route.name === "HostTab") return <Ionicons name="briefcase" size={size} color={color} />;
          return <Ionicons name="reader" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="ExperiencesTab" component={ExperiencesStack} options={{ title: t("experiences") }} />
      <Tab.Screen name="MapTab" component={MapStack} options={{ title: t("map") }} />
      <Tab.Screen
        name="MyActivitiesTab"
        component={MyActivitiesStack}
        options={{
          title: t("myActivitiesTab"),
        }}
      />
      {isHost ? (
        <Tab.Screen name="HostTab" component={HostNavigator} options={{ title: t("hostTab") }} />
      ) : (
        <Tab.Screen
          name="ExplorerProfileTab"
          component={ExplorerProfileStack}
          options={{
            title: t("profileTab"),
            tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} />,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return !user ? (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle,
        headerTitleStyle,
        headerTintColor: livadaiColors.primary,
        ...backTitleOptions,
        headerTitleAlign: "left",
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: true, title: "Resetare parolă", ...backTitleOptions }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ headerShown: true, title: "Resetare parolă", ...backTitleOptions }}
      />
      <Stack.Screen
        name="VerifyEmail"
        component={VerifyEmailScreen}
        options={{ headerShown: true, title: "Verifică emailul", ...backTitleOptions }}
      />
    </Stack.Navigator>
  ) : (
    <MainTabs user={user} />
  );
}
