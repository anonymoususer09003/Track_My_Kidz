import React, { useEffect, useState, useRef } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text, Icon, Toggle } from "@ui-kitten/components";
import { AppHeader } from "@/Components";
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import {
  EditDependentModal,
  WelcomeMessageModal,
  DependentAddImportModal,
  AddStudentModal,
  StudentActivationCodeModal,
  StudentVisibilityPermissionModal,
  DistanceAlert,
} from "@/Modals";

import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import Entypo from "react-native-vector-icons/Entypo";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";

import FetchOne from "@/Services/User/FetchOne";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
// import FetchOne from "@/Services/Parent/GetParentChildrens";
import { GetParent } from "@/Services/Parent";
import { loadUserId } from "@/Storage/MainAppStorage";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import GetParentChildrens from "@/Services/Parent/GetParentChildrens";
import { ModalState } from "@/Store/Modal";
import TrackHistory from "@/Services/Parent/TrackHistory";
import moment from "moment";
import TrackStudent from "@/Services/Parent/TrackStudent";
import Geolocation from "@react-native-community/geolocation";
import AntDesign from "react-native-vector-icons/AntDesign";
import BackgroundLayout from "@/Components/BackgroundLayout";

const DependentInfoScreen = () => {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [dependent, setDependent] = useState(null);
  const [selectedActivationCode, setSelectedActivationCode] = useState(null);
  const isEditVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.editDependentModalVisibility
  );
  const [selectedStudentVisibility, setSelectedStudentVisibility] =
    useState(null);
  const [children, setChildren] = useState([]);
  const [user, setUser] = useState(null);
  let prevOpenedRow: any;
  let row: Array<any> = [];
  const [position, setPosition] = useState({});

  useEffect(() => {
    console.log("-------00000");
    Geolocation.getCurrentPosition((pos) => {
      console.log("-------00000", pos);
      const crd = pos?.coords;
      setPosition({
        latitude: crd.latitude,
        longitude: crd.longitude,
        latitudeDelta: 0.0421,
        longitudeDelta: 0.0421,
      });
    });
  }, [focused]);

  // };
  const getChildrens = async (referCode: string) => {
    try {
      let res = await GetParentChildrens(referCode);
      setChildren(res);
    } catch (err) {
      console.log("err in children", err);
    }
  };
  const loadUserDetails = async () => {
    FetchOne()
      .then((res) => {
        getChildrens(res?.referenceCode);
      })
      .catch((err) => console.log("loadUserDetails", err));
  };

  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.addStudentModal
  );

  useEffect(() => {
    loadUserDetails();
  }, [focused, isVisible, isEditVisible]);

  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);

  useEffect(() => {
    if (selectedActivationCode) {
      dispatch(ChangeModalState.action({ studentActivationCodeModal: true }));
    }
  }, [selectedActivationCode]);

  useEffect(() => {
    if (selectedStudentVisibility) {
      dispatch(
        ChangeModalState.action({ studentVisibilityPermissionModal: true })
      );
    }
  }, [selectedStudentVisibility]);

  const handleTrackHistory = async (
    status: boolean,
    id: any,
    index: number,
    coordinates: any
  ) => {
    try {
      const _date = moment(new Date()).format("YYYY-MM-DD");

      const _data = [...children];

      const item = _data[index];

      item.childTrackHistory = status ? true : false;
      _data[index] = item;
      setChildren(_data);
      const res = await TrackHistory(
        status,
        id,
        _date,
        coordinates?.latitude || null,
        coordinates?.longitude || null
      );
      console.log("res", res);
      if (res && status) {
        Toast.show({
          type: "success",
          text2: "Now we will track the history of the dependent.",
        });
      }
    } catch (err) {
      Toast.show({
        type: "info",
        text2: "An error occured in distance.",
      });

      console.log("err history", err);
    }
  };

  const handleTrackStudent = async (
    id: any,
    status: boolean,
    distanceAllowed: any,
    kilometers: any,
    index: number,
    coordinates: any
  ) => {
    let _data = [...children];
    const item = _data[index];

    item.toggleAlert = status;
    _data[index] = item;
    setChildren(_data);

    console.log("coordinates", coordinates);
    let lang = coordinates?.longitude || position?.longitude || "0.000";
    let lat = coordinates?.latitude || position?.latitude || "0.000";
    try {
      let res = await fetch(
        `https://live-api.trackmykidz.com/user/parent/alert/trackStudent?studentId=${item?.studentId}&parentLatitude=${lat}&parentLongitude=${lang}&toggleAlert=${status}&distanceAllowed=${distanceAllowed}&kilometers=${kilometers}`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer " +
              "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjpbIlJPTEVfUEFSRU5UIl0sImlkIjoyMzcsInN1YiI6Im5vLnVtYW5zYWVlZDU0QGdtYWlsLmNvbSIsImlhdCI6MTY3NzUxODc0NywiZXhwIjoxNzA5MDc1Njk5fQ.u0HJP5zNTvk3DEQa12rk0Q5cbY5fslrGEB5dyzas-9hJYNYEuD1B4a0a0RkFg1CRLi-1_F2SJnoomp7nPw1Lng",
          },
        }
      );
      setVisible(false);

      if (res && status) {
        Toast.show({
          type: "success",
          text2:
            "Now we will track the distance of the dependent and we will alert you.",
        });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const onSubmit = (values) => {
    setVisible(false);
    handleTrackStudent(
      dependent?.studentId,
      dependent?.isToggle,
      values?.distance,
      values?.distanceinkm,
      dependent?.index,
      values?.location
    );
    handleTrackHistory(
      dependent?.isToggle,
      dependent?.studentId,
      dependent?.index,
      values?.location
    );
  };

  return (
    <BackgroundLayout title="Dependent Information">
      <AppHeader
        hideCalendar={true}
        onAddPress={() => {
          dispatch(
            ChangeModalState.action({
              dependentAddImport: true,
            })
          );
        }}
      />
      {visible && (
        <DistanceAlert
          onSubmit={(values) => {
            onSubmit(values);
          }}
          visible={visible}
          hide={() => setVisible(false)}
          selectedDependent={dependent}
          setSelectedDependent={() => setSelectedDependent(null)}
        />
      )}
      {!!selectedActivationCode && (
        <StudentActivationCodeModal
          student={selectedActivationCode}
          setStudent={setSelectedActivationCode}
        />
      )}
      {!!selectedStudentVisibility && (
        <StudentVisibilityPermissionModal
          student={selectedStudentVisibility}
          setStudent={setSelectedStudentVisibility}
        />
      )}
      {<AddStudentModal />}
      <DependentAddImportModal />
      {!!selectedDependent && isEditVisible && (
        <EditDependentModal
          selectedDependent={selectedDependent}
          setSelectedDependent={(val: any) => setSelectedDependent(val)}
        />
      )}
      <View style={styles.layout}>
        <View style={{ padding: 10 }}>
          {children.length > 0 ? (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                width: "100%",
                letterSpacing: 1.5,
                marginTop: 15,
              }}
            >
              Have your dependent enter reference code or scan the QR code
              corresponding to his/her name
            </Text>
          ) : (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                width: "100%",
                textAlign: "center",
              }}
            >
              Add a dependant to get started
            </Text>
          )}
        </View>
        <FlatList
          data={children}
          style={{ padding: 10, width: "100%" }}
          renderItem={({ item, index }) => (
            <>
              <View style={[styles.row, { justifyContent: "space-between" }]}>
                <Text
                  style={[
                    styles.text,
                    {
                      fontWeight: "600",
                      marginBottom: 10,
                      color: Colors.primary,
                      marginLeft: 10,
                    },
                  ]}
                >{`${item?.firstname || ""} ${item?.lastname || ""}`}</Text>
              </View>

              <View style={[styles.item]}>
                <Text style={styles.text}>{`${
                  (item?.childSchool ? item.childSchool : "") || ""
                }`}</Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginHorizontal: 20,
                  }}
                >
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: "45%",
                      flexDirection: "column-reverse",
                    }}
                  >
                    <Text style={{ fontSize: 16, marginTop: 10 }}>
                      Track History?
                    </Text>
                    <Toggle
                      checked={item.childTrackHistory}
                      onChange={(value) => {
                        console.log("values---", value);
                        if (item?.childTrackHistory && item.toggleAlert) {
                          Toast.show({
                            type: "success",
                            text2: "Alert needs the Track History to be on.",
                          });
                        } else {
                          handleTrackHistory(
                            value,
                            item?.studentId,
                            index,
                            position
                          );
                        }
                      }}
                    />
                  </View>
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: "45%",
                      flexDirection: "column-reverse",
                    }}
                  >
                    <Text style={{ fontSize: 16, marginTop: 10 }}>
                      Set Boundary
                    </Text>

                    <Toggle
                      checked={item.toggleAlert}
                      onChange={async (value) => {
                        console.log("value", value);

                        if (item?.childDeviceId) {
                          if (!item?.toggleAlert) {
                            setVisible(value);
                            setDependent({ ...item, index, isToggle: value });
                            // setSelectedDependent(item);
                          } else {
                            await handleTrackStudent(
                              item?.studentId,
                              value,
                              30,
                              false,

                              index,
                              false
                            );
                            await handleTrackHistory(
                              value,
                              item?.studentId,
                              index
                            );
                          }
                        } else {
                          Toast.show({
                            type: "info",
                            text2:
                              "To turn on boundry alert,dependent must register",
                          });
                        }
                      }}
                    />
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedActivationCode(item);
                    }}
                  >
                    <Image
                      style={styles.cardImage}
                      source={require("@/Assets/Images/qr.png")}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDependent(item);
                    }}
                  >
                    <Image
                      style={[styles.cardImage]}
                      source={require("@/Assets/Images/editIcon.png")}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("ParentDeletePermission", {
                        dependentId: item?.studentId,
                        parentId: user?.parentId,
                      });
                    }}
                  >
                    <Image
                      style={styles.cardImage}
                      source={require("@/Assets/Images/deleteIcon.png")}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* {item?.status && (
                  <Text style={styles.text}>{`Status: ${item.status}`}</Text>
                )} */}
            </>
          )}
        />
      </View>
    </BackgroundLayout>
  );
};

export default DependentInfoScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
  },
  item: {
    borderRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginBottom: 10,
    marginHorizontal: "2%",
    paddingVertical: 10,
    elevation: 2,
    overflow: "hidden",
    height: 170,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderColor: Colors.textInputBorderColor,
    marginTop: 20,
    paddingHorizontal: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 20,
    paddingTop: 15,
  },
  cardImage: {
    height: 20,
    width: 20,
    resizeMode: "stretch",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    marginVertical: 4,
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.primary,
    height: 30,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  textButton: {
    color: Colors.primary,
    fontSize: 16,
  },
  floatButton: {
    position: "absolute",
    bottom: 60,
    right: 20,
    shadowColor: Colors.primary,
    shadowOffset: {
      height: 10,
      width: 10,
    },
    shadowOpacity: 0.9,
    shadowRadius: 50,
    elevation: 5,
  },
});
