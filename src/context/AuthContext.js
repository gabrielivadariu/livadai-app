import React, { createContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import api from "../services/api";
import * as Notifications from "expo-notifications";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("user");
        const storedToken = await SecureStore.getItemAsync("token");
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        }
      } catch (_e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    await SecureStore.setItemAsync("token", data.token);
    await SecureStore.setItemAsync("user", JSON.stringify(data.user));
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    setUser(data.user);
    await registerPushToken();
  };

  const saveAuth = async (userPayload, token) => {
    if (token) {
      await SecureStore.setItemAsync("token", token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    await SecureStore.setItemAsync("user", JSON.stringify(userPayload));
    setUser(userPayload);
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    // nu logăm automat; returnăm user pentru fluxul de verificare email
    return data.user;
  };

  const becomeHost = async (payload) => {
    // rollback: placeholder no-op until host onboarding is reintroduced
    return Promise.resolve({ success: true, user, token: null });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  const registerPushToken = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      if (status !== "granted") {
        const permission = await Notifications.requestPermissionsAsync();
        finalStatus = permission.status;
      }
      if (finalStatus !== "granted") return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const expoPushToken = tokenData.data;
      if (!expoPushToken) return;
      await api.post("/push/token", { expoPushToken });
    } catch (err) {
      console.error("registerPushToken error", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, becomeHost, saveAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
