import React from 'react';
import { Card, Modal, Text } from '@ui-kitten/components';
import { loadUserId } from '@/Storage/MainAppStorage';
import { actions } from '@/Context/state/Reducer';
import { useDispatch } from 'react-redux';
import { GetInstructor } from '@/Services/Instructor';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import Colors from '@/Theme/Colors';
import { CancelOngoingActivity, DeleteActivity } from '@/Services/Activity';
import { useStateValue } from '@/Context/state/State';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';

const CancelActivityModal = ({
  selectedInstructions,
  setSelectedInstructions,
  visible,
  item,
  hide,
  prevOpenedRow,
  buses,
  getActivities,

  row,
}: {
  selectedInstructions?: any;
  setSelectedInstructions?: any;
  visible?: any;
  item?: any;
  hide?: any;
  prevOpenedRow?: any;
  row?: any;
  buses?: any;
  getActivities?: any;
}) => {
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();

  //   const isVisible = useSelector(
  //     (state: { modal: ModalState }) => state.modal.instructionsModalVisibility
  //   );
  const dispatch = useDispatch();
  const [{ item: activity }, _dispatch] : any= useStateValue();
  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        hide();
      }}
    >
      <Card style={styles.modal} disabled={true}>
        <View
          style={{
            flexDirection: "column",

            height: "100%",
          }}
        >
          <TouchableOpacity
            style={[
              styles.buttonStyle,
              {
                marginTop: 10,

                justifyContent: "center",
                paddingLeft: 0,
              },
            ]}
            onPress={async () => {
              const userId = await loadUserId();
              if (!userId) return
              GetInstructor(userId)
                .then((res) => {
                  console.log("res", res);
                  let body = {
                    activityId: item?.activityId,
                    instructorId: res?.instructorId,
                  };
                  console.log("body", body);
                  if (item.status != "cancel") {
                    CancelOngoingActivity(body)
                      .then((res) => {
                        console.log(res);
                        Toast.show({
                          type: "success",
                          text2: "Activity has been cancelled successfully ",
                        });
                        getActivities();
                        hide();
                      })
                      .catch((err) => console.log(err));
                  } else {
                    DeleteActivity(item.activityId)
                      .then((res) => {
                        console.log(res);
                        Toast.show({
                          type: "success",
                          text2: "Activity has been deleted successfully ",
                        });
                        getActivities();
                        hide();
                      })
                      .catch((err) => console.log(err));
                  }
                })
                .catch((err) => {
                  console.log("err", err);
                });
              //   console.log("logs", item);
              //   CancelOngoingActivity(item?.activityId)
              //     .then((res) => {
              //       console.log(res);

              //       getActivities();
              //       hide();
              //     })
              //     .catch((err) => console.log(err));
              //   hide();
            }}
          >
            {/* <Entypo size={25} color={Colors.primary} name="clock" /> */}
            <Text style={styles.textStyle}>
              {item.status == "cancel" ? "Delete Activity" : "Cancel Activity"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonStyle,
              {
                marginTop: 10,
                // backgroundColor: Colors.primary,
                justifyContent: "center",
                paddingLeft: 0,
              },
            ]}
            onPress={() => {
              hide();
              navigation.navigate("CreateActivity", {
                isEdit: true,
              });
              _dispatch({
                type: actions.SET_SELECTED_ACTIVITY,
                payload: item,
              });
              if (prevOpenedRow) {
                prevOpenedRow?.close();
              }
            }}
          >
            {/* <Icon
              style={{ width: 25, height: 25 }}
              fill={Colors.primary}
              name="edit-2"
            /> */}
            <Text style={styles.textStyle}>Reschedule Activity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.buttonStyle,
              {
                marginTop: 10,
                backgroundColor: Colors.primary,
                justifyContent: "center",
                paddingLeft: 0,
              },
            ]}
            onPress={() => {
              if (prevOpenedRow) {
                prevOpenedRow?.close();
              }
              hide();
            }}
          >
            {/* <Feather size={25} color={Colors.primary} name="copy" /> */}
            <Text style={styles.textStyle}>Close</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </Modal>
  );
};
export default CancelActivityModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: "center", fontWeight: "bold", fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 1,
    flexDirection: "row",
    color: Colors.white,
    zIndex: -1,
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  bottom: {
    flex: 1,
    flexDirection: "row",
    height: 45,
    marginTop: 10,
    justifyContent: "space-between",
  },
  buttonText: {
    flex: 1,
    borderRadius: 25,
    fontFamily: "Gill Sans",
    textAlign: "center",
    margin: 2,
    shadowColor: "rgba(0,0,0, .4)", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: "center",
    backgroundColor: Colors.primary,
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },
  textStyle: {
    width: "75%",
    // backgroundColor: "red",
    textAlign: "center",
    color: Colors.white,
    fontWeight: "bold",
  },
  buttonStyle: {
    padding: 5,
    alignItems: "center",
    //   justifyContent: "center",
    //   padding: 5,
    width: "100%",
    height: 50,
    backgroundColor: Colors.tintgray,
    borderRadius: 4,
    flexDirection: "row",
    paddingLeft: 20,
    marginBottom: 10,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
