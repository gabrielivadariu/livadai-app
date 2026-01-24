import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HostDashboardScreen from "../screens/HostDashboardScreen";
import CreateActivityScreen from "../screens/CreateActivityScreen";
import EditExperienceScreen from "../screens/EditExperienceScreen";
import HostBookingsScreen from "../screens/HostBookingsScreen";
import ConversationsScreen from "../screens/ConversationsScreen";
import ChatScreen from "../screens/ChatScreen";
import HostProfileScreen from "../screens/HostProfileScreen";
import EditHostProfileScreen from "../screens/EditHostProfileScreen";
import HostWalletScreen from "../screens/HostWalletScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ExplorerProfileScreen from "../screens/ExplorerProfileScreen";
import BookingDetailScreen from "../screens/BookingDetailScreen";
import HostParticipantsScreen from "../screens/HostParticipantsScreen";
import GuestParticipationsScreen from "../screens/GuestParticipationsScreen";
import ExperienceDetailScreen from "../screens/ExperienceDetailScreen";

const Stack = createNativeStackNavigator();

export default function HostNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HostDashboard" component={HostDashboardScreen} options={{ title: "Host Dashboard", headerShown: false }} />
      <Stack.Screen name="CreateExperience" component={CreateActivityScreen} options={{ title: "Create Experience", headerShown: false }} />
      <Stack.Screen
        name="EditExperience"
        component={EditExperienceScreen}
        options={({ route }) => ({ title: route.params?.experience?.title || "Edit Experience" })}
      />
      <Stack.Screen name="HostBookings" component={HostBookingsScreen} options={{ title: "Bookings" }} />
      <Stack.Screen name="Conversations" component={ConversationsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.otherUserName || route.params?.experienceTitle || "Chat",
        })}
      />
      <Stack.Screen name="HostProfile" component={HostProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditHostProfile" component={EditHostProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HostWallet" component={HostWalletScreen} options={{ title: "Wallet / Payments" }} />
      <Stack.Screen name="GuestParticipations" component={GuestParticipationsScreen} options={{ title: "Experiences as Guest", headerShown: false }} />
      <Stack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PublicProfile" component={ExplorerProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookingDetailScreen" component={BookingDetailScreen} options={{ title: "Booking" }} />
      <Stack.Screen name="HostParticipants" component={HostParticipantsScreen} options={{ title: "Participanți" }} />
    </Stack.Navigator>
  );
}
