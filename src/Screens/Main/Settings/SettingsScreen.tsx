import { useTheme } from '@/Theme';
import { Card, Icon, Modal, Spinner } from '@ui-kitten/components';
import React, { FC, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Share from 'react-native-share';
import { AppHeader, LinearGradientButton } from '@/Components';
import BackgroundLayout from '@/Components/BackgroundLayout';
import { TwoFactorAuthenticationModal, VerifyYourselfModal } from '@/Modals';
import { DeleteUser } from '@/Services/SettingsServies';
import { loadId } from '@/Storage/MainAppStorage';
import LogoutStore from '@/Store/Authentication/LogoutStore';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { UserState } from '@/Store/User';
import ChangeUserState from '@/Store/UserType/ChangeUserTypeState';
import Colors from '@/Theme/Colors';
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';

type SettingsScreenProps = {
  navigation: StackNavigationProp<MainStackNavigatorParamsList, 'Settings'>;
};

const SettingsScreen = ({ navigation }) => {
  const isFocuesed = useIsFocused();
  const dispatch = useDispatch();
  const { Layout } = useTheme();
  const [openDeactivateModal, setopenDeactivateModal] = useState<boolean>(false);
  // const [canAdvertise, setcanAdvertise] = useState(false);
  const user: any = useSelector((state: { user: UserState }) => state.user.item);

  // const [twoFAActive, setTwoFAActive] = useState(user?.isTwoFA);
  const [isSending, setisSending] = useState<boolean>(false);
  const [isSent, setisSent] = useState<boolean>(false);
  const [verifyType, setVerifyType] = useState<any>('');

  const getUserId = async () => {
    setVerifyType('');
    // const id: any = await loadUserId();
    // dispatch(FetchOne.action(id));
  };

  useEffect(() => {
    if (verifyType) {
      dispatch(ChangeModalState.action({ verifyYourselfModalVisibility: true }));
    }
  }, [verifyType]);

  let message = `${user?.firstname} ${user?.lastname} would like to invite you to TrackMyKidz. Give yourself some peace of mind, keep your kids safe and know their whereabouts even when you are not physically with them. Keep track of their in-school and out-of-school activities and schedule. You may download TrackMyKidz from the Apple App Store or Google PlayStore or by simply clicking on this link -`;

  const options = Platform.select({
    ios: {
      activityItemSources: [
        {
          // For using custom icon instead of default text icon at share preview when sharing with message.
          placeholderItem: {
            type: 'url',
            content: require('@/Assets/AppIcons/appstore.png'),
          },
          item: {
            default: { type: 'text', content: `${message} https://trackmykidz.com/apps/` },
          },
          linkMetadata: {
            icon: require('@/Assets/AppIcons/appstore.png'),
          },
        },
      ],
    },
    default: {
      title: 'TrackMykidz',
      subject: 'trackmykidz.com',
      message: `${message} https://trackmykidz.com/apps/`,
    },
  });

  const onShare = async () => {
    Share.open(
      // options
      {
        message: `${user?.firstname} ${user?.lastname} would like to invite you to TrackMyKidz. Give yourself some peace of mind, keep your kids safe and know their whereabouts even when you are not physically with them. Keep track of their in-school and out-of-school activities and schedule. You may download TrackMyKidz from the Apple App Store or Google PlayStore or by simply clicking on this link -`,
        url: 'https://trackmykidz.com/app',

        activityItemSources: [
          {
            placeholderItem: {
              type: 'url',
              content: require('@/Assets/AppIcons/appstore.png'),
            },
            item: {
              default: { type: 'url', content: require('@/Assets/AppIcons/appstore.png') },
            },
            linkMetadata: {
              title: 'TrackMykidz',
              // todo solve this
              // subject: 'trackmykidz.com',
              icon: require('@/Assets/AppIcons/appstore.png'),
            },
          },
        ],
      }
    )
      .then((res) => {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Invite',
          text2: 'Invitation has been sent.',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
          onShow: () => {},
          onHide: () => {},
          onPress: () => {},
        });
      })
      .catch((err) => {
        err && console.log(err);
      });
  };

  useEffect(() => {
    if (false) getUserId();
  }, [isFocuesed]);

  return (
    <BackgroundLayout title="Settings">
      <AppHeader title="" hideCalendar={true} hideCenterIcon={true} />
      <TwoFactorAuthenticationModal />
      <VerifyYourselfModal
        isActivationCode={verifyType === 'activation-code'}
        setIsActivationCode={setVerifyType}
      />
      <Modal
        visible={openDeactivateModal}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setopenDeactivateModal(false)}
      >
        <Card disabled={true} style={{ minHeight: 100, width: 300, borderRadius: 10 }}>
          {isSending ? (
            isSent ? (
              <View style={styles.sppinerContainer}>
                <Text style={styles.sent}>Your account has been successfully deactivated.</Text>
              </View>
            ) : (
              <View style={styles.sppinerContainer}>
                <Spinner status="primary" />
              </View>
            )
          ) : (
            <>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Account Deactivation</Text>
              <Text
                style={{
                  fontSize: 15,
                  color: 'grey',
                  marginTop: 10,
                  marginBottom: 20,
                }}
              >
                We hate to see you leave. Your account will be deactivated.
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginTop: 15,
                }}
              >
                <TouchableOpacity
                  onPress={async () => {
                    const userId = await loadId();

                    if (!userId) return;
                    DeleteUser(parseInt(userId, 0))
                      .then((res) => {
                        dispatch(
                          ChangeUserState.action({
                            // @ts-ignore
                            userType: '',
                          })
                        );

                        // @ts-ignore
                        dispatch(LogoutStore.action());
                        setopenDeactivateModal(false);
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  }}
                >
                  <Text style={styles.modalButton}>OKAY</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setopenDeactivateModal(false)}>
                  <Text style={styles.modalButton}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Card>
      </Modal>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.layout}>
          <View style={[styles.mainLayout, { paddingHorizontal: 20 }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('PersonalProfile')}
              style={[
                [
                  Layout.row,
                  Layout.justifyContentBetween,
                  Layout.alignItemsCenter,
                  styles.firstItem,
                ],
              ]}
            >
              <Text style={{ fontSize: 16 }}>Profile</Text>
              <Icon style={styles.icon} fill={Colors.gray} name="chevron-right-outline" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ChangePassword')}
              style={[
                [
                  Layout.row,
                  Layout.justifyContentBetween,
                  Layout.alignItemsCenter,
                  styles.otherItems,
                ],
              ]}
            >
              <Text style={{ fontSize: 16 }}>Reset Password</Text>
              <Icon style={styles.icon} fill={Colors.gray} name="chevron-right-outline" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={[
                [
                  Layout.row,
                  Layout.justifyContentBetween,
                  Layout.alignItemsCenter,
                  styles.otherItems,
                ],
              ]}
            >
              <Text style={{ fontSize: 16 }}>Notifications</Text>
              <Icon style={styles.icon} fill={Colors.gray} name="chevron-right-outline" />
            </TouchableOpacity>
            {/* <View style={[[Layout.row, Layout.justifyContentBetween, Layout.alignItemsCenter, { marginTop: 15 }]]}>
                        <Text style={{ fontSize: 16 }}>2 Factor Authentication</Text>
                        <Switch
                            trackColor={{ false: Colors.gray, true: Colors.primary }}
                            thumbColor={Colors.white}
                            ios_backgroundColor={Colors.gray}
                            onValueChange={(value) => {
                                setTwoFAActive(value)
                                dispatch(
                                    ChangeModalState.action({ twoFactorAuthenticationModalVisibility: value }),
                                )
                            }}
                            value={twoFAActive}
                        />
                    </View>
                    {twoFAActive && (<TouchableOpacity onPress={() => dispatch(
                        ChangeModalState.action({
                            twoFactorAuthenticationModalVisibility: true,
                        }),
                    )} style={[[Layout.row, Layout.justifyContentBetween, Layout.alignItemsCenter, { marginTop: 15, marginLeft: 15 }]]}>
                        <Text style={{ color: Colors.primary, fontSize: 16 }}>Setup 2 Factor Authentication</Text>
                        <Icon
                            style={styles.icon}
                            fill={Colors.gray}
                            name='chevron-right-outline'
                        />
                    </TouchableOpacity>)} */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ActivationCode')}
              style={[
                [
                  Layout.row,
                  Layout.justifyContentBetween,
                  Layout.alignItemsCenter,
                  styles.otherItems,
                ],
              ]}
            >
              <Text style={{ fontSize: 16 }}>Your Reference Code</Text>
              <Icon style={styles.icon} fill={Colors.gray} name="chevron-right-outline" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('DependentInfo')}
              style={[
                [
                  Layout.row,
                  Layout.justifyContentBetween,
                  Layout.alignItemsCenter,
                  styles.otherItems,
                ],
              ]}
            >
              <Text style={{ fontSize: 16 }}>Dependent Information</Text>
              <Icon style={styles.icon} fill={Colors.gray} name="chevron-right-outline" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('PaymentInfo')}
              style={[
                [
                  Layout.row,
                  Layout.justifyContentBetween,
                  Layout.alignItemsCenter,
                  styles.otherItems,
                ],
              ]}
            >
              <Text style={{ fontSize: 16 }}>Payment Information</Text>
              <Icon style={styles.icon} fill={Colors.gray} name="chevron-right-outline" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ReportProblem')}
              style={[
                [
                  Layout.row,
                  Layout.justifyContentBetween,
                  Layout.alignItemsCenter,
                  styles.otherItems,
                ],
              ]}
            >
              <Text style={{ fontSize: 16 }}>Report a problem</Text>
              <Icon style={styles.icon} fill={Colors.gray} name="chevron-right-outline" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ContactUs')}
              style={[
                [
                  Layout.row,
                  Layout.justifyContentBetween,
                  Layout.alignItemsCenter,
                  styles.otherItems,
                ],
              ]}
            >
              <Text style={{ fontSize: 16 }}>Contact Us</Text>
              <Icon style={styles.icon} fill={Colors.gray} name="chevron-right-outline" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onShare}
              style={[
                [
                  Layout.row,
                  Layout.justifyContentBetween,
                  Layout.alignItemsCenter,
                  styles.otherItems,
                ],
              ]}
            >
              <Text style={{ fontSize: 16 }}>Share with Friends</Text>
              <Icon style={styles.icon} fill={Colors.gray} name="chevron-right-outline" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('AppList')}
              style={[
                [
                  Layout.row,
                  Layout.justifyContentBetween,
                  Layout.alignItemsCenter,
                  styles.lastItem,
                ],
              ]}
            >
              <Text style={{ fontSize: 16 }}>Our Other Apps</Text>
              <Icon style={styles.icon} fill={Colors.gray} name="chevron-right-outline" />
            </TouchableOpacity>
            <View style={styles.buttonsContainer}>
              <View style={{ marginVertical: 15 }}>
                <LinearGradientButton
                  style={{
                    borderRadius: 25,
                    flex: 1,
                  }}
                  appearance="ghost"
                  size="medium"
                  status="control"
                  onPress={() => {
                    // todo slove this not a priority
                    dispatch(
                      ChangeUserState.action({
                        // @ts-ignore
                        userType: '',
                      })
                    );

                    // @ts-ignore
                    dispatch(LogoutStore.action());
                  }}
                >
                  Log Out
                </LinearGradientButton>
              </View>

              <TouchableOpacity
                style={styles.deleteBackground}
                onPress={() => setopenDeactivateModal(true)}
              >
                <Text style={styles.deleteButton}> Delete account</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 50 }} />
          </View>
        </View>
      </ScrollView>
    </BackgroundLayout>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
  },
  mainLayout: {
    flex: 9,
    marginTop: 40,
  },
  lastItem: {
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    elevation: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderColor: Colors.lightgray,
    paddingLeft: 10,
    paddingVertical: 5,
    borderTopWidth: 0,
  },
  firstItem: {
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    elevation: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderColor: Colors.lightgray,
    paddingLeft: 10,
    paddingVertical: 5,
  },
  otherItems: {
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    elevation: 1,
    borderColor: Colors.lightgray,
    paddingLeft: 10,
    paddingVertical: 5,
  },
  icon: {
    width: 32,
    height: 32,
  },
  background: {
    width: '100%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: Colors.primary,
  },
  button: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: 'bold',
    borderRadius: 10,
    paddingTop: 6,
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  backgroundOutline: {
    backgroundColor: Colors.transparent,
    marginBottom: 10,
    width: '100%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    color: Colors.primaryTint,
    paddingBottom: 6,
    marginTop: 15,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonOutline: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    borderRadius: 10,
    paddingTop: 6,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalButton: {
    marginLeft: 15,
    color: Colors.primary,
    fontSize: 16,
  },
  sppinerContainer: {
    flex: 1,
    height: 150,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sent: {
    fontSize: 16,
    marginLeft: 10,
    marginTop: 10,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  deleteBackground: {
    width: '100%',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 35,
  },

  deleteButton: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.primary,
    textAlign: 'center',
  },
});
