import { LinearGradientButton } from '@/Components';
import { useStateValue } from '@/Context/state/State';
import { GetOptIn, InstructorUpdateStatus, UpdateActivityByStatus } from '@/Services/Activity';
import { GetOptInGroup, UpdateGroupByStatus, UpdateInstructorGroupStatus } from '@/Services/Group';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import Colors from '@/Theme/Colors';
import { useIsFocused } from '@react-navigation/native';
import { Card, CheckBox, Modal, Text } from '@ui-kitten/components';
import React, { FC, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';

type ApproveActivityModal = {
  selectedChild?: any;
  setSelectedChild: (item: any) => void;
  activity: any;
  setActivity: Function;
  fromParent: any;
  visible: any;
  onClose: any;
}

const ApproveActivityModal: FC<ApproveActivityModal> = (
  {
    setSelectedChild,
    activity,
    setActivity,
    fromParent,
    visible,
    onClose,
  }) => {
  const [{ instructorDetail: instructorDetail }, _dispatch]: any = useStateValue();
  // const isVisible = useSelector(
  //   (state: { modal: ModalState }) => state.modal.approveActivityModalVisibility,
  // );
  const [infomation, setInformation] = useState<any>({});
  const getActivityOptInDetail = async (id: any) => {
    try {
      let res = await GetOptIn(id);

      setInformation({ ...infomation, ...res });
    } catch (err) {
      console.log('err', err);
    }
  };
  const getGroupOptInDetail = async (id: any) => {
    try {
      let res = await GetOptInGroup(id);

      setInformation({ ...infomation, ...res });
    } catch (err) {
      console.log('err', err);
    }
  };
  const [terms, setTerms] = useState<boolean>(false);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const parentApproval = () => {
    if (activity && activity?.activity) {
      const data = {
        activityId: activity?.activity?.activityId,
        status: 'approved',
        studentId: activity?.selectedStudentId,
        studentActivityId: activity?.studentId,
      };
      console.log('data', data);
      UpdateActivityByStatus(data)
        .then((res) => {
          console.log('accepted', res);
          dispatch(
            ChangeModalState.action({
              approveActivityModalVisibility: false,
            }),
          );
          onClose();
          setActivity(activity?.activity?.activityId);
          setSelectedChild(null);
        })
        .catch((err) => {
          dispatch(
            ChangeModalState.action({
              approveActivityModalVisibility: false,
            }),
          );
          onClose();
          setActivity(activity?.activity?.activityId);
          setSelectedChild(null);
        });
    } else {
      const data = {
        groupId: activity?.group?.groupId,
        status: 'approved',
        studentId: activity?.selectedStudentId,
        studentGroupId: activity?.studentId,
      };
      UpdateGroupByStatus(data)
        .then((res) => {
          console.log(res);
          dispatch(
            ChangeModalState.action({
              approveActivityModalVisibility: false,
            }),
          );
          onClose();
          // setSelectedChild();
          setActivity(activity?.group?.groupId);
          setSelectedChild(null);
        })
        .catch((err) => console.log(err));
    }
  };

  const instructorApproval = () => {
    console.log('activity0000888', activity);
    if (activity?.activityId) {
      const data = {
        activityId: activity?.activityId,
        status: 'approved',
        instructorEmail: instructorDetail.email,
      };
      InstructorUpdateStatus(data)
        .then((res) => {
          console.log('approved', res);
          dispatch(
            ChangeModalState.action({
              approveActivityModalVisibility: false,
            }),
          );
          onClose();
          // setSelectedChild();
          setActivity(activity?.activityId);
          setSelectedChild(null);

          // setSelectedChild(null);
        })
        .catch((err) => console.log(err));
    } else if (activity?.groupId) {
      const data = {
        groupyId: activity?.groupId,
        status: 'approved',
        instructorEmail: instructorDetail.email,
      };
      UpdateInstructorGroupStatus(data)
        .then((res) => {
          console.log(res);
          dispatch(
            ChangeModalState.action({
              approveActivityModalVisibility: false,
            }),
          );
          onClose();
          // setSelectedChild();
          setActivity(activity?.groupId);
          setSelectedChild(null);
          // setActivities(filter);
          // setSelectedChild(null);
        })
        .catch((err) => console.log(err));
    }
  };

  useEffect(() => {
    if (fromParent) {
      if (activity?.activity) {
        getActivityOptInDetail(activity?.activity?.activityId);
      } else if (activity?.group?.groupId) {
        getGroupOptInDetail(activity?.group?.groupId);
      }
    } else {
      // Alert.alert(activity?.activityId || activity?.groupId);
      if (activity?.activityId) {
        getActivityOptInDetail(activity?.activityId);
      } else if (activity?.groupId) {
        getGroupOptInDetail(activity?.groupId);
      }
    }
  }, [activity, isFocused, fromParent]);

  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        // setSelectedChild();
        dispatch(
          ChangeModalState.action({ approveActivityModalVisibility: false }),
        );
        onClose();
        // setActivity(null);
      }}
    >
      {(
        <Card style={styles.modal} disabled={true}>
          <View style={{ flex: 1 }}>
            <View style={styles.body}>
              <View style={{ paddingBottom: 10, paddingTop: 10 }}>
                <Text
                  textBreakStrategy={'highQuality'}
                  style={{
                    textAlign: 'center',
                    color: '#606060',
                    fontSize: 18,
                  }}
                >
                  You have opted to approve
                </Text>
              </View>
            </View>
            {
              <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
                <Text style={{ fontWeight: '600', fontSize: 16 }}>
                  Instructions
                </Text>
                <View style={{ maxHeight: 100 }}>
                  <ScrollView nestedScrollEnabled>
                    <Text style={{ fontSize: 15, marginTop: 10 }}>
                      {infomation?.instructions}
                    </Text>
                  </ScrollView>
                </View>
                <Text
                  style={{ fontWeight: '600', fontSize: 16, marginTop: 20 }}
                >
                  Disclaimer
                </Text>
                <View style={{ maxHeight: 100 }}>
                  <ScrollView nestedScrollEnabled>
                    <Text style={{ fontSize: 15, marginTop: 10 }}>
                      {infomation?.disclaimer}
                    </Text>
                  </ScrollView>
                </View>
                <Text
                  style={{ fontWeight: '600', fontSize: 16, marginTop: 20 }}
                >
                  Agreement
                </Text>
                <View style={{ maxHeight: 100 }}>
                  <ScrollView nestedScrollEnabled>
                    <Text style={{ fontSize: 15, marginTop: 10 }}>
                      {infomation?.agreement}
                    </Text>
                  </ScrollView>
                </View>
              </View>
            }
            <View style={{ flexDirection: 'row' }}>
              <CheckBox
                style={[styles.termsCheckBox, { flex: 1, marginRight: 18 }]}
                checked={terms}
                onChange={() => setTerms(!terms)}
              >
                {''}
              </CheckBox>
              <View style={[styles.termsCheckBox, { flex: 15 }]}>
                <Text>By checking the box, you agree to all of the above</Text>
              </View>
            </View>
            <View
              style={[
                styles.buttonText,
                { backgroundColor: terms ? Colors.primary : Colors.gray },
              ]}
            >
              <LinearGradientButton
                style={{
                  borderRadius: 25,
                  flex: 1,
                }}
                appearance="ghost"
                size="medium"
                disabled={!terms}
                status="control"
                onPress={() => {
                  fromParent ? parentApproval() : instructorApproval();
                }}
              >
                Confirm
              </LinearGradientButton>
            </View>
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
                      approveActivityModalVisibility: false,
                    }),
                  );
                  onClose();
                  // setSelectedChild();
                  // setActivity(null);
                }}
              >
                Cancel
              </LinearGradientButton>
            </View>
          </View>
        </Card>
      )}
    </Modal>
  );
};
export default ApproveActivityModal;

const styles = StyleSheet.create({
  container: {
    maxHeight: '80%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
  },
  modal: { borderRadius: 10 },
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
  termsCheckBox: {
    marginTop: 24,
  },
  termsCheckBoxText: {
    color: 'text-hint-color',
    marginLeft: 10,
  },
});
