import React, { useEffect, useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { Text, Icon } from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { LinearGradientButton } from "@/Components";
import { InstructionsModal } from "@/Modals";
const children = [
  {
    id: 1,
    name: "JV Basketball Team (Boys)",
    status: true,
    instructors: "Mark K., John B.",
    students: "10",
  },
  {
    id: 2,
    name: "JV Swim Team (Boys)",
    status: true,
    instructors: "Kent B., Mark K.",
    students: "5",
  },
];

const GroupScreen = ({ route }) => {
  const navigation = useNavigation();
  const dependent = route && route.params && route.params.dependent;
  const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [initialRoute, setInitialRoute] = useState("FeaturedScreen");
  const [loading, setLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedDependent, setSelectedDependent] = useState(null);

  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);

  const RightActions = (dragX: any, item) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });
    return (
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!item.status && (
          <TouchableOpacity
            onPress={() => setSelectedDependent(item)}
            style={{
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              style={{ width: 30, height: 30 }}
              fill={Colors.primary}
              name="trash"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <InstructionsModal />
      <View style={styles.layout}>
        <FlatList
          data={children}
          style={{ padding: 10, width: "100%" }}
          renderItem={({ item, index }) => (
            <Swipeable
              ref={swipeableRef}
              renderRightActions={(e) => RightActions(e, item)}
            >
              <View style={[styles.item, { backgroundColor: "#fff" }]}>
                <Text style={styles.text}>{`Group Name: ${item?.name}`}</Text>
                <Text style={styles.text}>{`Status: ${
                  item?.status ? "Active" : "Inactive"
                }`}</Text>
                <Text
                  style={styles.text}
                >{`Group Count: ${item?.students}`}</Text>
                <Text
                  style={styles.text}
                >{`Instructors: ${item?.instructors}`}</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  dispatch(
                    ChangeModalState.action({
                      instructionsModalVisibility: true,
                    })
                  )
                }
                style={[styles.footer, { backgroundColor: "#fff" }]}
              >
                <Text
                  style={styles.text}
                >{`Instructions / Disclaimer / Agreement`}</Text>
              </TouchableOpacity>
            </Swipeable>
          )}
        />
      </View>
    </>
  );
};

export default GroupScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
  },
  item: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginTop: 10,
    marginHorizontal: "2%",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  footer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginHorizontal: "2%",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
});
