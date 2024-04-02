import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Image,
  FlatList,
  Linking,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/Theme";
// @ts-ignore

import LinearGradient from "react-native-linear-gradient";
import GetApps from "@/Services/Settings/GetApps";
import FastImage from "react-native-fast-image";
import Colors from "@/Theme/Colors";
import { AppHeader } from "@/Components";
import BackgroundLayout from "@/Components/BackgroundLayout";
const AppListScreen = () => {
  const [apps, setapps] = useState([]);
  useEffect(() => {
    GetApps()
      .then((response: any) => {
        if (response != null) {
          setapps(response);
        }
      })
      .catch((error: any) => {
        Alert.alert("Apps not loaded", "", [{ text: "OK", style: "cancel" }]);
      });
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View key={item?.id} style={styles.appContainer}>
      <View style={styles.topContainer}>
        <Text style={styles.appName}>{item?.appName}</Text>
      </View>
      <FastImage
        source={{ uri: item?.appImage }}
        style={{ width: "95%", height: 60, marginLeft: 10 }}
        resizeMode={"contain"}
      />
      <Text style={styles.appDescription}>{item?.appDescription}</Text>
      <TouchableOpacity>
        <LinearGradient
          colors={[Colors.primary, "#EC5ADD"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 1 }}
          style={{ width: "100%", height: 50, justifyContent: "center" }}
        >
          {!item?.comingSoon ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (item?.downloadLink !== null && item?.downloadLink !== "")
                  Linking.openURL(item?.downloadLink?.toString());
              }}
            >
              <Text style={styles.button}>Download</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (item?.downloadLink !== null)
                  Linking.openURL(item?.downloadLink?.toString());
              }}
            >
              <Text style={styles.button}>Coming soon...</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <BackgroundLayout title="Our Other Apps">
      <AppHeader hideCalendar={true} hideCenterIcon={true} />
      <View style={styles.layout}>
        <FlatList
          data={apps}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
        <View style={{ height: 50 }} />
      </View>
    </BackgroundLayout>
  );
};

export default AppListScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
    padding: 20,
  },
  mainLayout: {
    flex: 9,
  },
  appContainer: {
    marginBottom: 10,
    marginTop: 30,
    borderRadius: 20,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  appName: {
    color: "#404040",
    fontWeight: "bold",
    fontSize: 24,

    width: "40%",
    textAlign: "center",
  },
  appDescription: {
    fontSize: 16,
    marginLeft: 30,
    marginVertical: 30,
  },
  button: {
    alignItems: 'center',
    color: Colors.white,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 20,
  },
  background: {
    width: 150,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
});
