import React, { useEffect, useState, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Text, Icon } from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Switch,
} from "react-native";
import { AppHeader } from "@/Components";
import messaging from "@react-native-firebase/messaging";
import { UpdateDeviceToken } from "@/Services/User";
import { useDispatch, useSelector } from "react-redux";
import ChangeSearchString from "@/Store/Blogs/ChangeSearchString";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { navigateAndSimpleReset } from "@/Navigators/Functions";
import { WelcomeMessageModal, EditDependentModal } from "@/Modals";
import SearchBar from "@/Components/SearchBar/SearchBar";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { LinearGradientButton } from "@/Components";
import MapView from "react-native-maps";

const ActivityDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const activity = route?.params?.activity || null;
  const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [initialRoute, setInitialRoute] = useState("FeaturedScreen");
  const [loading, setLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedDependent, setSelectedDependent] = useState(null);
  console.log("acitvity", activity);
  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);

  return (
    <>
      <AppHeader title="" />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "60%",
          alignSelf: "center",
          marginVertical: 20,
        }}
      >
        <Text>List View</Text>
        <Switch
          style={{ marginLeft: 20 }}
          trackColor={{ false: "#767577", true: "#50CBC7" }}
          thumbColor={Colors.white}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => {
            setThumbnail(!thumbnail);
          }}
          value={thumbnail}
        />
        <Text>Map View</Text>
      </View>
      <View style={styles.layout}>
        {!thumbnail ? (
          <FlatList
            data={(activity && activity?.studentsActivity) || []}
            style={{ padding: 10, width: "100%" }}
            renderItem={({ item, index }) => (
              <View style={[styles.item]}>
                <Text
                  style={[styles.text, { fontWeight: "600" }]}
                >{`${item.firstName} ${item.lastName}`}</Text>
              </View>
            )}
          />
        ) : (
          <MapView
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 30,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <View style={styles.background}>
          <TouchableOpacity
            style={[styles.background]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.button}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default ActivityDetailsScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
  },
  item: {
    borderRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginVertical: 10,
    marginHorizontal: "2%",
    padding: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  background: {
    width: "80%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
});
