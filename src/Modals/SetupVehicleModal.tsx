import { Card, Modal, Text } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { ModalState } from '@/Store/Modal';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { LinearGradientButton } from '@/Components';
import Colors from '@/Theme/Colors';
import AddBusInformation from './AddBusInformation';
import { FindAllBus, PutBus } from '@/Services/BusConfiguration';
import { loadUserId } from '@/Storage/MainAppStorage';
import FetchOne from '@/Services/User/FetchOne';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';

type SetupVehicleModalProps = {
  activity?: any;
  setActivity?: Function;
  buses?: any[];
  setBuses?: Function;
  fromActivity?: any;
}
const SetupVehicleModal: FC<SetupVehicleModalProps> = ({
                                                         activity,
                                                         setActivity,
                                                         buses,
                                                         setBuses,
                                                         fromActivity,
                                                       }) => {
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.setupVehicleModal,
  );
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();
  const isBusVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.addButInformationModalVisibility,
  );
  // console.log("activity", activity);
  // const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const [showBuses, setShowBuses] = useState<boolean>(false);
  // const currentUser = useSelector(
  //   (state: { user: UserState }) => state.user.item
  // );
  const [instructor, setInstructor] = useState<any>(null);

  const getBuses = async () => {
    const id = await loadUserId();
    console.log(id);
    FindAllBus(id ? parseInt(id) : instructor?.instructorId, 0, 30)
      .then((res) => {
        console.log(res.data);
        setBuses && setBuses(res?.data?.result);
      })
      .catch((err) => {
        console.log('getBuses Error:', err);
      });
  };

  const handleFetchOne = async () => {
    const res = await FetchOne();
    if (res) {
      setInstructor(res);
    }
  };

  const updateBus = async (bus: any) => {
    console.log({
      ...bus,
      id: bus?.busId,
      studentsOnLongSeat: bus?.numberOfKidsOnLongSeat,
      activityId: activity?.activityId || 0,
      schoolId: instructor?.schoolId || 0,
      orgId: instructor?.orgId || 0,
      instructorId: instructor?.instructorId || 0,
    });
    if (fromActivity) {
      navigation.navigate('DragDropStudent', {
        bus: bus?.busId,
        activity: activity,
      });
      dispatch(ChangeModalState.action({ setupVehicleModal: false }));
    }

    PutBus({
      ...bus,
      id: bus?.busId,
      studentsOnLongSeat: bus?.numberOfKidsOnLongSeat,
      activityId: activity?.activityId || 0,
      schoolId: instructor?.schoolId || 0,
      orgId: instructor?.orgId || 0,
      instructorId: instructor?.instructorId || 0,
    })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    handleFetchOne();
    getBuses();
  }, [isVisible]);

  // @ts-ignore
  return (
    <>
      {isBusVisible && (
        <AddBusInformation activity={activity} fromActivity={fromActivity} />
      )}
      <Modal
        style={styles.container}
        visible={isVisible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => {
          dispatch(ChangeModalState.action({ setupVehicleModal: false }));
          setActivity && setActivity(null);
        }}
      >
        <Card style={styles.modal} disabled={true}>
          <View style={styles.buttonText}>
            <LinearGradientButton
              style={{
                borderRadius: 25,
                flex: 1,
              }}
              appearance="ghost"
              size="medium"
              status="control"
              onPress={() => {
                dispatch(
                  ChangeModalState.action({
                    // setupVehicleModal: false,
                    addButInformationModalVisibility: true,
                  }),
                );
              }}
            >
              Setup a new vehicle configuration
            </LinearGradientButton>
          </View>
          <View style={{ marginTop: 40 }}>
            <View style={styles.buttonText}>
              <LinearGradientButton
                style={{
                  borderRadius: 25,
                  flex: 1,
                }}
                appearance="ghost"
                size="medium"
                status="control"
                onPress={() => {
                  setShowBuses(true);
                  getBuses();
                }}
              >
                Use existing vehicle configuration
              </LinearGradientButton>
            </View>
          </View>
          {showBuses && (
            <ScrollView
              style={{
                borderWidth: 1,
                borderColor: Colors.primary,
                maxHeight: 150,
                marginTop: 20,
              }}
            >
              {buses &&
                buses.map((bus) => (
                  <TouchableOpacity
                    onPress={() => {
                      updateBus(bus);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 5,
                    }}
                  >
                    <Text>{`${bus && bus?.busName}`}</Text>
                    <View
                      style={{
                        width: '15%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-evenly',
                      }}
                    ></View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          )}
        </Card>
      </Modal>
    </>
  );
};
export default SetupVehicleModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
  },
  inputSettings: {
    marginTop: 7,
  },
  modal: { borderRadius: 10, minHeight: 200, justifyContent: 'center' },
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
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
