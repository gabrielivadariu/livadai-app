import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, TextInput, Text, AppState, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { subscribeRefreshExperiences } from "../utils/eventBus";

const MarkerAvatar = React.memo(function MarkerAvatar({ id, coordinate, title, description, imageUrl, onPress }) {
  const [imageError, setImageError] = useState(false);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const handleLoad = useCallback(() => {
    setTracksViewChanges(false);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
    setTracksViewChanges(false);
  }, []);

  return (
    <Marker
      key={id}
      coordinate={coordinate}
      title={title}
      description={description}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      onPress={() => onPress(id)}
    >
      <View style={styles.markerShadow}>
        <View style={styles.markerCircle}>
          {imageUrl && !imageError ? (
            <Image source={{ uri: imageUrl }} style={styles.markerImage} onLoad={handleLoad} onError={handleError} />
          ) : (
            <Ionicons name="person" size={22} color="#334155" />
          )}
        </View>
      </View>
    </Marker>
  );
});

export default function ExperienceMapScreen({ navigation }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const mapRef = useRef(null);
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/experiences/map");
      setPoints(data || []);
    } catch (_e) {
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") load();
    });
    const unsubBus = subscribeRefreshExperiences(load);
    return () => {
      sub?.remove();
      unsubBus?.();
    };
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filteredPoints = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return points;
    return points.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const desc = (p.description || p.shortDescription || "").toLowerCase();
      const addr = (p.address || "").toLowerCase();
      return title.includes(term) || desc.includes(term) || addr.includes(term);
    });
  }, [points, searchTerm]);

  useEffect(() => {
    if (!mapRef.current || !filteredPoints.length) return;
    mapRef.current.fitToCoordinates(
      filteredPoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
      { edgePadding: { top: 80, bottom: 80, left: 80, right: 80 }, animated: true }
    );
  }, [filteredPoints]);

  const centerOnUser = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({});
      if (mapRef.current && pos?.coords) {
        mapRef.current.animateToRegion(
          {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          400
        );
      }
    } catch (_e) {
      // silent fail
    }
  };

  const handleMarkerPress = useCallback(
    (id) => navigation.navigate("ExperienceDetail", { id }),
    [navigation]
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <MapView
        style={{ flex: 1 }}
        ref={mapRef}
        initialRegion={{
          latitude: 45.9432,
          longitude: 24.9668,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {filteredPoints.map((p) => (
          <MarkerAvatar
            key={p._id}
            id={p._id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.title}
            description={p.shortDescription || (p.description ? `${p.description}`.slice(0, 80) : p.category)}
            imageUrl={p.host?.profileImage}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      <View style={[styles.searchBar, { top: insets.top + 10 }]}>
        <Ionicons name="search-outline" size={18} color="#334155" />
        <TextInput
          placeholder="Search places or experiences"
          placeholderTextColor="#94a3b8"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
      </View>

      <TouchableOpacity style={styles.locBtn} onPress={centerOnUser}>
        <Ionicons name="locate-outline" size={20} color="#0f172a" />
        <Text style={styles.locText}>My location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  searchInput: { flex: 1, color: "#0f172a" },
  locBtn: {
    position: "absolute",
    left: 16,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  locText: { color: "#0f172a", fontWeight: "700" },
  markerShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  markerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  markerImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
