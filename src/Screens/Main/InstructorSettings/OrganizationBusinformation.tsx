import { Input, Text, Layout, Button, Icon } from "@ui-kitten/components";
import Modal from "react-native-modal";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { Formik } from "formik";
import * as yup from "yup";
import Colors from "@/Theme/Colors";
import { DeleteBusById } from "@/Services/BusConfiguration";
import { Dimensions, TouchableOpacity, FlatList } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";

// import Icon from "react-native-vector-icons/Entypo";

// import { useTheme } from "@/Theme";

import {
  GetInstructor,
  FindInstructorBySchoolOrg,
} from "@/Services/Instructor";
import { loadUserId } from "@/Storage/MainAppStorage";
import { GetSchool, UpdateSchool } from "@/Services/School";
import { AppHeader } from "@/Components";
import AddBusInformation from "@/Modals/AddBusInformation";
import ViewBusInformation from "@/Modals/ViewBusInformation";
import EditOrgInstructorsModal from "@/Modals/EditOrganizationInstructorModal";
import BackgroundLayout from "@/Components/BackgroundLayout";
const height = Dimensions.get("screen").height;

const OrgBusDetail = ({ route }: any) => {
  console.log("route------------", route.params.data.buses);
  const dispatch = useDispatch();
  const [selectedItem, setSelectedItem] = useState(null);
  const [visible, setVisible] = useState(false);
  const [buses, setBuses] = useState(route.params.data.buses);
  const isVisibleViewBusInfo = useSelector(
    (state: { modal: ModalState }) => state.modal.viewBusInformationModal
  );
  const showAddModal = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.addButInformationModalVisibility
  );
  const [SelectedBusInfo, setSelectedBusInfo] = useState({
    busName: "",
    numberOfRows: "",
    numberOfSeatsPerRow: "",
    numberOfKidsPerSeat: "",
    isLongSeat: "",
    numberOfKidsLongSeat: "",
  });

  const deleteBus = (id: any, index: any) => {
    DeleteBusById(id)
      .then((res) => {
        let temp = [...buses];
        temp.splice(index, 1);
        setBuses(temp);
        console.log("res", res);
      })
      .catch((err) => console.log("err", err));
  };

  return (
    <BackgroundLayout title="Bus Information">
      {/* {selectedItem && ( */}
      {showAddModal && (
        <AddBusInformation
          selectedItem={selectedItem}
          activity={null}
          buses={buses}
          setBuses={(bus) => setBuses(bus)}
        />
      )}

      {isVisibleViewBusInfo && (
        <ViewBusInformation
          numberOfRows={selectedItem?.numberOfRows}
          numberOfKidsInRow={selectedItem?.numberOfKidsPerSeat}
          isLongSeat={selectedItem?.longSeat}
          numberOfKidsLongSeat={selectedItem?.numberOfKidsOnLongSeat}
          busName={selectedItem?.busName}
          numberOfSeatsPerRow={selectedItem?.numberOfSeatsPerRow}
        />
      )}

      <View style={{ flex: 1 }}>
        <ScrollView
          style={{
            paddingRight: 19,

            backgroundColor: Colors.newBackgroundColor,
            flex: 1,
            borderRadius: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            {buses.map((item, index) => {
              return (
                <View key={index} style={styles.card}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedItem(item);
                      dispatch(
                        ChangeModalState.action({
                          viewBusInformationModal: true,
                        })
                      );
                    }}
                    style={{ width: "50%" }}
                  >
                    <Text>{item.busName}</Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      onPress={() => {
                        deleteBus(item.busId, index);
                      }}
                    >
                      <Image
                        style={styles.cardImage}
                        source={require("@/Assets/Images/deleteIcon.png")}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedItem(item);
                        dispatch(
                          ChangeModalState.action({
                            addButInformationModalVisibility: true,
                          })
                        );
                        // dispatch(ChangeModalState.action({ addStudentModal: true }))
                      }}
                      style={{ marginLeft: 10 }}
                    >
                      <Image
                        style={[styles.cardImage]}
                        source={require("@/Assets/Images/editIcon.png")}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
        <AppHeader
          hideCalendar={true}
          onAddPress={() => {
            setSelectedItem(null);
            dispatch(
              ChangeModalState.action({
                addButInformationModalVisibility: true,
              })
            );

            // dispatch(ChangeModalState.action({ addStudentModal: true }))
          }}
        />
      </View>
    </BackgroundLayout>
  );
};
export default OrgBusDetail;

const styles = StyleSheet.create({
  modal: {
    height: "100%",
    width: "100%",
    backgroundColor: "red",
    // elevation: 5,
    shadowColor: Colors.primaryGray,
    shadowOffset: {
      height: 5,
      width: 2,
    },
    borderRadius: 5,
    shadowRadius: 5,
    shadowOpacity: 0.3,
    zIndex: 166,

    // marginTop: "13%",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginTop: 15,
    alignItems: "center",

    borderRadius: 10,
    height: 50,
    backgroundColor: Colors.white,
    elevation: 2,
    alignSelf: "center",
    width: "95%",
    marginLeft: "4%",
  },
  cardImage: {
    height: 20,
    width: 20,
    resizeMode: "stretch",
  },
  background: {
    flex: 1,
    color: Colors.white,
    zIndex: 1,
    backgroundColor: Colors.primary,
  },
  topNav: {
    color: Colors.white,
    marginTop: 35,
  },

  heading: {
    fontWeight: "bold",
    marginTop: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "30%",
  },
  modalButton: {
    width: "95%",
    marginTop: 10,
  },
  selectInput: {
    marginTop: 10,
  },
  mainAsset: {
    alignItems: "center",
    height: 300,
    width: "100%",
    flex: 3,
  },
  mainContent: {
    flex: 4,
  },
  textContent: {
    fontSize: 16,
    padding: 10,
    width: "100%",
    borderBottomColor: Colors.lightgray,
    borderBottomWidth: 1,
  },
  extraImages: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    height: 100,
  },
  centerItems: {
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    fontSize: 10,
    color: "red",
  },
  formView: {
    flex: 9,
  },
  bottomView: {
    width: "100%",
    flexDirection: "row",
    position: "absolute",
    justifyContent: "center",
    backgroundColor: Colors.transparent,
    bottom: 0,
    height: 50,
  },
  linearBottom: {
    width: "100%",

    height: 50,
  },
  createPostButton: {
    margin: 3,
    width: "50%",

    height: 50,
    right: 0,
    backgroundColor: Colors.transparent,
    borderColor: Colors.transparent,
    borderWidth: 0,
  },
  ghostButton: {
    margin: 8,
    width: "100%",
    alignSelf: "center",
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  formContainer: {
    flex: 1,
    marginVertical: 20,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  backgroundButton: {
    width: "80%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  sent: {
    fontSize: 16,
    marginLeft: 10,
    marginTop: 10,
    fontWeight: "bold",
    color: Colors.gray,
    textAlign: "center",
  },
  selectSettings: {
    marginTop: 18,
  },
  tableHeadertext: {
    textAlign: "center",
    margin: 6,
    color: Colors.white,
  },
  tableHeadertext0: {
    textAlign: "center",
    margin: 6,
    color: Colors.black,
  },
  head0: {
    height: 50,
    padding: 5,
    backgroundColor: Colors.white,
    borderTopEndRadius: 5,
    borderBottomEndRadius: 5,

    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 10,
  },
  tableView: {
    marginTop: 70,
    marginBottom: 50,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    // justifyContent: 'space-between',
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    // marginBottom: 10,
    // borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  head: {
    height: 60,
    padding: 5,
    // width: 100,
    backgroundColor: Colors.primary,
  },
  floatButton: {
    alignSelf: "flex-end",
    marginRight: 15,
    marginTop: 10,
    // position: "absolute",
    // bottom: 20,
    // right: 20,
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
