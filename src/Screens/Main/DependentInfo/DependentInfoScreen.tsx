import { AppHeader } from "@/Components";
import {
  AddStudentModal, DependentAddImportModal, DistanceAlert, EditDependentModal, StudentActivationCodeModal,
  StudentVisibilityPermissionModal
} from "@/Modals";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Text, Toggle } from "@ui-kitten/components";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList, Image, StyleSheet, TouchableOpacity, View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import Colors from "@/Theme/Colors";


import FetchOne from "@/Services/User/FetchOne";
// import FetchOne from "@/Services/Parent/GetParentChildrens";
import BackgroundLayout from "@/Components/BackgroundLayout";
import GetParentChildrens from "@/Services/Parent/GetParentChildrens";
import TrackHistory from "@/Services/Parent/TrackHistory";
import { ModalState } from "@/Store/Modal";
import Geolocation from "@react-native-community/geolocation";
import moment from "moment";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';

const DependentInfoScreen = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();
  const focused = useIsFocused();
  // const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedDependent, setSelectedDependent] = useState<any>(null);
  const [dependent, setDependent] = useState<any>(null);
  const [selectedActivationCode, setSelectedActivationCode] = useState<any>(null);
  const isEditVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.editDependentModalVisibility
  );
  const [selectedStudentVisibility, setSelectedStudentVisibility] =
    useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  // let prevOpenedRow: any;
  // let row: Array<any> = [];
  const [position, setPosition] = useState<any>({});

  useEffect(() => {
    console.log("-------00000");
    if(focused)
    {
      try{
    Geolocation.getCurrentPosition((pos: any) => {
      console.log("-------00000", pos);
      const crd = pos?.coords;
      setPosition({
        latitude: crd.latitude,
        longitude: crd.longitude,
        latitudeDelta: 0.0421,
        longitudeDelta: 0.0421,
      });
    }, );
  }
  catch(err)
  {
    console.log('err',err)
  }
  }
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
    coordinates?: any
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
        `https://live-api.trackmykidz.com/user/parent/v2/alert/trackStudent?studentId=${item?.studentId}&parentLatitude=${lat}&parentLongitude=${lang}&toggleAlert=${status}&distanceAllowed=${distanceAllowed}&kilometers=${kilometers}`,
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

  const onSubmit = (values: any) => {
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
          onSubmit={(values: any) => {
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
          style={{ padding: 10, width: "100%", marginBottom: 70 }}
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
