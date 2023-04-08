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

  // const loadUserDetails = async () => {
  //   const id = await loadUserId();
  //   setUser({ parentId: id });
  //   GetParent(parseInt(id, 0)).then((response) => {
  //     console.log("response", response);
  //     fetchChildrens(response?.referenceCode);
  //   });
  //   // FetchOne().then((res) => {
  //   //   setUser(res);
  //   //   console.log("res---", res.students);
  //   //   setChildren(res.students);
  //   // });
  // };
  // const fetchChildrens = async (referenceCode: any) => {
  //   FetchOne(referenceCode).then((res) => {
  //     // setUser(res);
  //     console.log("res-children--", res);
  //     setChildren(res);
  //   });
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

  const closeRow = (index) => {
    console.log(index);
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };

  const RightActions = (dragX: any, item: any, index: number) => {
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
        <TouchableOpacity
          style={{
            padding: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            setSelectedActivationCode(item);
            prevOpenedRow?.close();
          }}
        >
          <MaterialIcon size={23} color={Colors.primary} name="qrcode-scan" />
        </TouchableOpacity>
        {false && (
          <TouchableOpacity
            style={{
              padding: 5,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              setSelectedStudentVisibility(item);

              if (prevOpenedRow) {
                prevOpenedRow?.close();
              }
            }}
          >
            <Entypo size={23} color={Colors.primary} name="eye" />
          </TouchableOpacity>
        )}
        {/* <TouchableOpacity
          style={{
            padding: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            setSelectedStudentVisibility(item);
            prevOpenedRow?.close();
          }}
        >
          <Entypo size={23} color={Colors.primary} name="eye" />
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => {
            setSelectedDependent(item);
            prevOpenedRow?.close();
          }}
          style={{
            padding: 5,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 12,
          }}
        >
          <Icon
            style={{ width: 23, height: 23 }}
            fill={Colors.primary}
            name="edit-2"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            padding: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            // DeleteStudent(item?.studentId).then((response) => {
            //     loadUserDetails();
            //     if (prevOpenedRow) {
            //         prevOpenedRow?.close();
            //     }
            // }).catch(error => console.log(error))
            prevOpenedRow?.close();
            navigation.navigate("ParentDeletePermission", {
              dependentId: item?.studentId,
              parentId: user?.parentId,
            });
          }}
        >
          <Icon
            style={{ width: 23, height: 23 }}
            fill={Colors.primary}
            name="trash"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const handleTrackHistory = async (
    status: boolean,
    id: any,
    index: number,
    coordinates: any
  ) => {
    try {
      const _date = moment(new Date()).format("YYYY-MM-DD");
      console.log("coordinates", coordinates);
      const _data = [...children];
      console.log("0000_data", _data);
      console.log("index", index);
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
    console.log("item", item);
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
      // const res = await TrackStudent(
      //   id,
      //   coordinates?.latitude || position?.latitude,
      //   coordinates?.logitude || position?.longitude,
      //   status,
      //   distanceAllowed,
      //   kilometers
      // );
      if (res && status) {
        Toast.show({
          type: "success",
          text2:
            "Now we will track the distance of the dependent and we will alert you.",
        });
      }
    } catch (err) {
      // Toast.show({
      //   type: "info",
      //   text2: "An error occured in track.",
      // });

      console.log(
        "err7289727878278927878293879289932676267267867267276276762",
        err
      );
    }
  };

  // const handleToggle=(item,)=>{
  //                           handleTrackStudent(
  //                           item?.studentId,
  //                           value,
  //                           true,
  //                           30,
  //                           index
  //                         );
  //                         handleTrackHistory(value, item?.studentId, index);
  // }

  const onSubmit = (values) => {
    console.log("values----", values);
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
    console.log("values----", values);
  };

  return (
    <>
      <AppHeader
        title={isVisible ? "Add Dependent" : "Dependent Info"}
        isBack
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
            <Text style={{ fontSize: 16, fontWeight: "600", width: "100%" }}>
              Have your dependent enter reference code or scan the QR code
              corresponding to his/her name
            </Text>
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "600", width: "100%" }}>
              Add a dependant to get started
            </Text>
          )}
        </View>
        <FlatList
          data={children}
          style={{ padding: 10, width: "100%" }}
          renderItem={({ item, index }) => (
            <Swipeable
              ref={(ref) => (row[index] = ref)}
              onSwipeableOpen={() => closeRow(index)}
              renderRightActions={(e) => RightActions(e, item, index)}
            >
              <View
                style={[
                  styles.item,
                  {
                    backgroundColor: !item.approve
                      ? "#fff"
                      : index % 3 === 0
                      ? "lightgreen"
                      : index % 2 === 0
                      ? "#F6DDCC"
                      : "#fff",
                  },
                ]}
                onPress={() =>
                  navigation.navigate("Activity", {
                    dependent: item,
                  })
                }
              >
                <View style={[styles.row, { justifyContent: "space-between" }]}>
                  <Text style={[styles.text, { fontWeight: "600" }]}>{`${
                    item?.firstname || ""
                  } ${item?.lastname || ""}`}</Text>
                  {false && (
                    <View style={styles.row}>
                      <TouchableOpacity
                        style={[styles.button, { borderRightWidth: 0.5 }]}
                      >
                        <FontAwesome
                          name="group"
                          color={Colors.primary}
                          size={20}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.button,
                          { borderLeftWidth: 0.5, borderRightWidth: 0.5 },
                        ]}
                      >
                        <FontAwesome
                          name="user"
                          color={Colors.primary}
                          size={20}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.button,
                          { borderLeftWidth: 0.5, borderRightWidth: 0.5 },
                        ]}
                      >
                        <Text style={styles.textButton}>Me</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, { borderLeftWidth: 0.5 }]}
                      >
                        <Text style={styles.textButton}>Off</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <Text style={styles.text}>{`${
                  (item?.childSchool ? item.childSchool : "") || ""
                }`}</Text>

                {/* {item?.status && (
                  <Text style={styles.text}>{`Status: ${item.status}`}</Text>
                )} */}
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
                    }}
                  >
                    <Text style={{ color: Colors.primary, fontSize: 16 }}>
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
                    }}
                  >
                    <Text style={{ color: Colors.primary, fontSize: 16 }}>
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
              </View>
            </Swipeable>
          )}
        />
      </View>
      <TouchableOpacity
        style={styles.floatButton}
        onPress={() => {
          // dispatch(ChangeModalState.action({ addStudentModal: true }))
          dispatch(
            ChangeModalState.action({
              dependentAddImport: true,
            })
          );
        }}
      >
        <AntDesign name="pluscircle" size={50} color={Colors.primary} />
      </TouchableOpacity>
    </>
  );
};

export default DependentInfoScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    paddingTop: 50,
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
    bottom: 20,
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
