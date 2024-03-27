import { Card, Icon, Modal, Text } from '@ui-kitten/components';
import { actions } from '@/Context/state/Reducer';
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { UserState } from '@/Store/User';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { LinearGradientButton } from '@/Components';
import Colors from '@/Theme/Colors';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useStateValue } from '@/Context/state/State';
import { useNavigation } from '@react-navigation/native';
import { DeleteActivity } from '@/Services/Activity';
import SetChatParam from '@/Store/chat/SetChatParams';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';

type InstructorActivityModal = {
  selectedInstructions?: any;
  setSelectedInstructions?: any;
  visible?: any;
  item?: any;
  hide?: any;
  prevOpenedRow?: any;
  row?: any;
  buses?: any;
  showCancelModal?: any;
  getActivities?: any;
  setSelectedActivity?: any;
}

const InstructorActivityModal = (
  {
    selectedInstructions,
    setSelectedInstructions,
    visible,
    item,
    hide,
    prevOpenedRow,
    buses,
    showCancelModal,
    getActivities,
    row,
    setSelectedActivity,
  }: InstructorActivityModal) => {
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();
  const user: any = useSelector((state: { user: UserState }) => state.user.item);
  // todo check if it can be removed
  // const amountValues = [
  //   { id: 0, amount: 500, label: "$5" },
  //   { id: 1, amount: 1000, label: "$10" },
  //   {
  //     id: 3,
  //     amount: 2000,
  //     label: "$20",
  //   },
  //   { id: 4, amount: 5000, label: "$50" },
  //   { id: 5, amount: 10000, label: "$100" },
  // ];
  //
  // const { Layout } = useTheme();
  // const [selectedAmountIndex, setSelectedAmountIndex] =
  //   useState<IndexPath | null>(null);
  // const [cardData, setCardData] = useState({});
  // const [isValid, setIsValid] = useState(false);
  // const [payment, setPayment] = useState(false);
  // const [selectedIndex, setSelectedIndex] = React.useState(0);
  // const availableAmounts = [
  //   {
  //     amount: 1,
  //     label: "$50 - Annually (Best Deal)",
  //   },
  //   {
  //     amount: 5,
  //     label: "$4.99 - Monthly",
  //   },
  // ];
  // //   const isVisible = useSelector(
  //     (state: { modal: ModalState }) => state.modal.instructionsModalVisibility
  //   );
  console.log('item', item);
  const dispatch = useDispatch();
  const [{ item: activity }, _dispatch]: any = useStateValue();
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
            flexDirection: 'column',
            // alignItems: "center",
            // justifyContent: "space-between",
            // backgroundColor: "yellow",
            height: '100%',
          }}
        >
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              //   prevOpenedRow?.close();
              dispatch(
                ChangeModalState.action({
                  requestPermissionModalVisibility: true,
                }),
              );
              setSelectedActivity(item);
              _dispatch({
                type: actions.SET_SELECTED_ACTIVITY,
                payload: item,
              });
              hide();
            }}
          >
            <FontAwesome5 size={25} name="reply-all" color={Colors.primary} />
            <Text style={styles.textStyle}>Resend Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              console.log(item, buses);

              // todo check if it can be removed
              // const bus = buses.find((b) => b?.activityId === item?.activityId);
              // / // console.log();
              console.log('item-------', item);

              if (
                item?.countApprovedInstructors ||
                item?.countApprovedStudents
              ) {
                _dispatch({
                  type: actions.SET_SELECTED_ACTIVITY,
                  payload: item,
                });
                setSelectedActivity(item);
                dispatch(
                  ChangeModalState.action({ rollCallModalVisibility: true }),
                );
              } else {
                Alert.alert(`You don't have any approved participant `);
              }
              // else {
              //   setSelectedActivity(item);
              // }
              hide();
            }}
          >
            <Ionicons size={25} color={Colors.primary} name="checkbox" />
            <Text style={styles.textStyle}>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              if (prevOpenedRow) {
                prevOpenedRow?.close();
              }
              hide();
              setSelectedActivity(item);
              navigation.navigate('CreateActivity', {
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
            <Icon
              style={{ width: 25, height: 25 }}
              fill={Colors.primary}
              name="edit-2"
            />
            <Text style={styles.textStyle}>Edit Activity</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              if (prevOpenedRow) {
                prevOpenedRow?.close();
              }
              hide();
              navigation.navigate('ActivityDetails', {
                activity: item,
              });
            }}
          >
            <Entypo size={25} color={Colors.primary} name="location-pin" />
            <Text style={styles.textStyle}>View Attendees</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              setSelectedActivity(item);
              _dispatch({
                type: actions.SET_SELECTED_ACTIVITY,
                payload: item,
              });
              dispatch(
                ChangeModalState.action({
                  journeyTrackerModalVisibility: true,
                }),
              );

              hide();
              if (prevOpenedRow) {
                prevOpenedRow?.close();
              }
            }}
          >
            <Entypo size={25} color={Colors.primary} name="clock" />
            <Text style={styles.textStyle}>Journey Tracker</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              if (prevOpenedRow) {
                prevOpenedRow?.close();
              }
              hide();
              navigation.navigate('CreateActivity', {
                isEdit: false,
              });
              _dispatch({
                type: actions.SET_SELECTED_ACTIVITY,
                payload: item,
              });
            }}
          >
            <FontAwesome5 size={25} color={Colors.primary} name="copy" />
            <Text style={styles.textStyle}>Copy Activity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              if (prevOpenedRow) {
                prevOpenedRow?.close();
              }
              hide();
              _dispatch({
                type: actions.SET_SELECTED_ACTIVITY,
                payload: item,
              });

              dispatch(
                SetChatParam.action({
                  title: item?.activityName,
                  chatId: `activity_${item?.activityId}`,
                  subcollection: 'parent',
                  user: {
                    _id: user?.instructorId,
                    avatar: user?.imageurl,
                    name: user?.firstname
                      ? user?.firstname[0].toUpperCase() +
                      user?.firstname.slice(1) +
                      ' ' +
                      user?.lastname[0]?.toUpperCase()
                      : user?.firstname + '' + user?.lastname,
                  },
                }),
              );
              navigation.navigate('InstructorChatNavigator', {
                title: item?.activityName,
              });
            }}
          >
            <Ionicons
              size={25}
              color={Colors.primary}
              name="chatbox-ellipses"
            />
            <Text style={styles.textStyle}>Chat</Text>
          </TouchableOpacity>

          {!item?.status && (
            <TouchableOpacity
              style={styles.buttonStyle}
              onPress={() => {
                if (prevOpenedRow) {
                  prevOpenedRow?.close();
                }
                hide();
                showCancelModal(true);
                DeleteActivity(item?.activityId)
                  .then((res) => {
                    console.log(res);

                    getActivities();
                  })
                  .catch((err) => console.log(err));
              }}
            >
              <Icon
                style={{ width: 25, height: 25 }}
                fill={Colors.primary}
                name="trash"
              />
              <Text style={styles.textStyle}>Delete Activity</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              if (prevOpenedRow) {
                prevOpenedRow?.close();
              }
              hide();
              showCancelModal(true);
              // DeleteActivity(item?.activityId)
              //   .then((res) => {
              //     console.log(res);

              //     getActivities();
              //   })
              //   .catch((err) => console.log(err));
            }}
          >
            <Entypo size={30} color={Colors.primary} name="circle-with-cross" />
            <Text style={styles.textStyle}>End Activity</Text>
          </TouchableOpacity>
          <View style={{ width: '100%' }}>
            <LinearGradientButton
              onPress={() => {
                if (prevOpenedRow) {
                  prevOpenedRow?.close();
                }
                hide();
              }}
            >
              Close
            </LinearGradientButton>
          </View>
        </View>
      </Card>
    </Modal>
  );
};
export default InstructorActivityModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 10,
  },
  modal: { borderRadius: 10, backgroundColor: Colors.newBackgroundColor },
  header: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 1,
    flexDirection: 'row',
    color: Colors.white,
    zIndex: -1,
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottom: {
    flex: 1,
    flexDirection: 'row',
    height: 45,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  buttonText: {
    flex: 1,
    borderRadius: 25,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 2,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  textStyle: {
    width: '75%',
    // backgroundColor: "red",
    textAlign: 'center',
    color: Colors.black,
    fontWeight: '600',
  },
  buttonStyle: {
    padding: 5,
    alignItems: 'center',
    //   justifyContent: "center",
    //   padding: 5,
    width: '100%',
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 10,
    flexDirection: 'row',
    paddingLeft: 20,
    marginBottom: 10,
    elevation: 1.5,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
