import React, {ReactElement, ReactText, useEffect, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
} from 'react-native';
import {useTheme} from '@/Theme';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Button,
  Card,
  CheckBox,
  Icon,
  Input,
  Select,
  SelectItem,
  Spinner,
  Text,
} from '@ui-kitten/components';
import ChangeUserState from '@/Store/User/FetchOne';
import fetchOneUserService from '@/Services/User/FetchOne';
import {ImagePickerModal} from '@/Modals';
import FA5 from 'react-native-vector-icons/FontAwesome5';
import ProfileIcon from 'react-native-vector-icons/EvilIcons';
import ImagePicker from 'react-native-image-crop-picker';
import {AppHeader, ProfileAvatarPicker} from '@/Components';

import {
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import {loadUserId} from '@/Storage/MainAppStorage';
import {UpdateUser} from '../../../Services/SettingsServies';
import {Formik} from 'formik';
import * as yup from 'yup';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// @ts-ignore
import {useSelector, useDispatch} from 'react-redux';
import {UserState} from '@/Store/User';
import {PlaceState} from '@/Store/Places';
import {GetAllCities} from '@/Services/PlaceServices';
import FetchOne from '@/Store/User/FetchOne';
import Colors from '@/Theme/Colors';
import BackgroundLayout from '@/Components/BackgroundLayout';

const PersonalProfileScreen = () => {
  const userIcon = require('@/Assets/Images/approval_icon2.png');
  const phone = require('@/Assets/Images/phone.png');
  const marker = require('@/Assets/Images/marker.png');
  const email = require('@/Assets/Images/email.png');
  const {Layout} = useTheme();
  const [selectedImage, setSelectedImage] = React.useState('');

  const [uploadedImage, setUploadedImage] = React.useState();
  const [languages, setLanguages] = useState<Array<ReactText>>(['English']);
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const countries = useSelector(
    (state: {places: PlaceState}) => state.places.countries,
  );
  const [isEditMode, setisEditMode] = useState(false);
  const [isSending, setisSending] = useState(false);
  const [isSent, setisSent] = useState(false);
  const [userId, setuserId] = useState(null);
  const [visible, setVisible] = useState(false);
  const user = useSelector((state: {user: UserState}) => state.user.item);
  const isLoading = useSelector(
    (state: {user: UserState}) => state.user.fetchOne.loading,
  );
  const dispatch = useDispatch();

  const renderPersonIcon = (props: any) => (
    <Image
      source={userIcon}
      style={{height: 18, width: 18, marginRight: 10}}
      resizeMode="contain"
    />
  );
  const renderLocationIcon = (props: any) => (
    <Image
      source={marker}
      style={{height: 20, width: 20}}
      resizeMode="contain"
    />
  );
  const renderEmailIcon = (props: any) => (
    <Image
      source={email}
      style={{height: 18, width: 18, marginRight: 12}}
      resizeMode="contain"
    />
  );
  const renderPhoneIcon = (props: any) => (
    <Image
      source={phone}
      style={{height: 20, width: 20, marginRight: 10}}
      resizeMode="contain"
    />
  );

  const renderSchoolIcon = (props: any) => (
    <FA5
      name="school"
      size={20}
      style={{height: 20, width: 20, marginRight: 10}}
      color={Colors.secondaryDark}
      resizeMode="contain"
    />
  );
  const getUserId = async () => {
    const id: any = await loadUserId();
    setuserId(id);
    // dispatch(FetchOne.action(id));
  };

  useEffect(() => {
    getUserId();
  }, []);

  function getUriSource(): any {
    return {uri: selectedImage};
  }
  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  const imageCameraLaunch = () => {
    ImagePicker.openCamera({
      cropping: true,
      cropperCircleOverlay: true,
      width: 139,
      height: 130,
      compressImageQuality: 0.2,
      loadingLabelText: 'Loading image',
    }).then(image => {
      if (image != null) {
        const source = {uri: image?.path};
        setUploadedImage(image);
        setSelectedImage(source.uri);
        // uploadAvatarToAWS(source.uri).then(r => { console.log('here', r) }).catch((err) => { console.log('Errorr', err) })
      }
    });
  };
  const renderPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );
  const updateProfilePic = async () => {
    let formData = new FormData();
    formData.append(
      'image',
      uploadedImage
        ? {
            uri: uploadedImage?.path,
            name: uploadedImage.mime,
            type: uploadedImage.mime,
          }
        : '',
    );
    formData.append('id', user?.studentId);

    formData.append('parentId', user?.parentId);
    formData.append('firstname', user?.firstname);
    formData.append('lastname', user?.lastname);
    formData.append('phone', user?.phoneNumber);
    formData.append('email', user?.email);
    formData.append('school', user?.school);
    formData.append('country', user.country);
    formData.append('state', user.state);
    formData.append('city', user.city);

    formData.append('parentemail1', user?.parentemail1);
    formData.append('parentemail2', user?.parentemail2);
    console.log('formData', formData);
    // setisSending(true);
    // let objectToPass = {
    //   firstName: values.firstName,
    //   lastName: values.lastName,
    //   id: userId,
    //   country: values.country,
    //   state: values.state,
    //   city: values.city,
    // };
    UpdateUser(formData)
      .then(async (response: any) => {
        console.log('res', response);
        if (response.status == 200) {
          setisEditMode(false);
          setisSending(false);
          let res = await fetchOneUserService();
          console.log('res', res);
          // if (!res?.childTrackHistory) {
          //   // await BackgroundService.stop();
          // }
          // await BackgroundService.stop();
          dispatch(
            ChangeUserState.action({
              item: res,
              fetchOne: {loading: false, error: null},
            }),
          );
        }
      })
      .catch((error: any) => {
        console.log('err', error);
        Alert.alert(error.response.data.title, error.response.data.detail, [
          {text: 'OK', style: 'cancel'},
        ]);
        setisSending(false);
        setisEditMode(!isEditMode);
      });
  };

  useEffect(() => {
    if (selectedImage) {
      updateProfilePic();
    }
  }, [selectedImage]);
  const renderEditAvatarButton = (): React.ReactElement => (
    <Button
      style={styles.editAvatarButton}
      status="basic"
      accessoryRight={<Icon name="edit" />}
      onPress={() => setVisible(true)}
    />
  );

  const imageGalleryLaunch = () => {
    ImagePicker.openPicker({
      cropping: true,
      cropperCircleOverlay: true,
      width: 139,
      height: 130,
      compressImageQuality: 0.2,
      loadingLabelText: 'Loading image',
    }).then(image => {
      if (image != null) {
        const source = {uri: image?.path};
        setSelectedImage(source.uri);
      }
    });
  };

  const personalProfileValidationSchema = yup.object().shape({
    username: yup
      .string()
      .min(4, ({min}) => `Username is not up to ${min} characters`)
      .required('Username is required'),
    school: yup.string().when('professional', {
      is: (professional: boolean) => professional === true,
      then: yup.string().min(4).required('Year graduated is required'),
    }),
    yearGraduated: yup.string().when('professional', {
      is: (professional: boolean) => professional === true,
      then: yup.string().required('Year graduated is required'),
    }),
  });

  function getUriSource(): any {
    return {uri: selectedImage};
  }
  const renderEditButtonElement = (): ButtonElement => {
    const buttonElement: React.ReactElement<ButtonProps> =
      renderEditAvatarButton();

    return React.cloneElement(buttonElement, {
      style: [buttonElement.props.style, styles.editButton],
    });
  };

  return (
    <>
      {visible && (
        <ImagePickerModal
          openCamera={imageCameraLaunch}
          openGallery={imageGalleryLaunch}
          close={() => setVisible(false)}
        />
      )}
      <AppHeader hideCenterIcon hideCalendar={true} />
      {isLoading ? (
        <View style={styles.sppinerContainer}>
          <View style={styles.sppinerContainer}>
            {/* <Spinner status="primary" /> */}
          </View>
        </View>
      ) : (
        <BackgroundLayout title="Profile">
          <View style={{width: '100%', marginBottom: 20}}>
            {(selectedImage != '' || user?.studentPhoto.length > 0) && (
              <ProfileAvatarPicker
                style={styles.profileImage}
                // resizeMode='center'
                source={{
                  uri:
                    selectedImage ||
                    user?.studentPhoto + '?time' + new Date().getTime(),
                  headers: {Pragma: 'no-cache'},
                }}
                // source={{ uri: selectedImage || user?.studentPhoto }}
                editButton={true ? renderEditAvatarButton : null}
              />
            )}
            {user?.studentPhoto == null && selectedImage == '' && (
              <View
                style={[
                  styles.profileImage,
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Colors.lightgray,
                  },
                ]}>
                <Text style={{fontSize: 30}}>
                  {user?.firstname?.substring(0, 1)?.toUpperCase()}{' '}
                  {user?.lastname?.substring(0, 1)?.toUpperCase()}
                </Text>
                {true && renderEditButtonElement()}
              </View>
            )}
          </View>
          <KeyboardAwareScrollView
            style={styles.layout}
            extraScrollHeight={150}>
            <ScrollView style={styles.container}>
              <View style={[[Layout.column, Layout.justifyContentCenter]]}>
                <Formik
                  validationSchema={personalProfileValidationSchema}
                  validateOnMount={true}
                  initialValues={{
                    username: user?.username || '',
                    firstName: user?.firstname || '',
                    lastName: user?.lastname || '',
                    school: user?.school || '',
                    grade: user?.grade || '',
                    country: user?.country || '',
                    email: user?.email || '',
                    zipcode: user?.zipcode || '',
                    city: user?.city || '',
                    state: user?.state || '',
                    phone: user?.phone || '',
                    parentemail1: user?.parentemail1 || '',
                    parentemail2: user?.parentemail2 || '',
                  }}
                  onSubmit={(values, {resetForm}) => {
                    let formData = new FormData();
                    formData.append(
                      'image',
                      uploadedImage
                        ? {
                            uri: uploadedImage?.path,
                            name: uploadedImage.mime,
                            type: uploadedImage.mime,
                          }
                        : {
                            uri:
                              user?.studentPhoto ||
                              'https://pictures-tmk.s3.amazonaws.com/images/image/man.png',
                            name: 'avatar',
                            type: 'image/png',
                          },
                    );
                    formData.append('id', user.studentId);
                    formData.append('parentId', user?.parentId);
                    formData.append('firstname', values?.firstname);
                    formData.append('lastname', values?.lastname);
                    formData.append('phone', values?.phoneNumber);
                    formData.append('email', values?.email);
                    formData.append('school', values?.school);
                    formData.append('country', values.country);
                    formData.append('state', values.state);
                    formData.append('city', values.city);
                    formData.append('parentemail1', user?.parentemail1);
                    formData.append('parentemail2', user?.parentemail2);

                    setisSending(true);
                    // let objectToPass = {
                    //   firstName: values.firstName,
                    //   lastName: values.lastName,
                    //   id: userId,
                    //   country: values.country,
                    //   state: values.state,
                    //   city: values.city,
                    // };
                    UpdateUser(formData)
                      .then((response: any) => {
                        if (response.status == 200) {
                          setisEditMode(false);
                          setisSending(false);
                          getUserId();
                        }
                      })
                      .catch((error: any) => {
                        Alert.alert(
                          error.response.data.title,
                          error.response.data.detail,
                          [{text: 'OK', style: 'cancel'}],
                        );
                        setisSending(false);
                        setisEditMode(!isEditMode);
                      });
                  }}>
                  {({
                    handleChange,
                    handleSubmit,
                    setFieldValue,
                    values,
                    errors,
                    touched,
                  }) => (
                    <>
                      {isSending ? (
                        <View style={styles.sppinerContainer}>
                          {/* <Spinner status="primary" /> */}
                        </View>
                      ) : (
                        <>
                          <View style={{flexDirection: 'column'}}>
                            <Text style={styles.editLabel}>Email</Text>
                            <View style={styles.editField}>
                              {renderEmailIcon()}
                              <Text style={{fontSize: 15}}>{values.email}</Text>
                            </View>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              width: '100%',
                            }}>
                            {!isEditMode ? (
                              <View
                                style={{
                                  flexDirection: 'column',
                                  width: '45%',
                                }}>
                                <Text style={styles.editLabel}>First Name</Text>

                                <View style={styles.editField}>
                                  {renderPersonIcon()}
                                  <Text style={{fontSize: 15}}>
                                    {' '}
                                    {values.firstName}
                                  </Text>
                                </View>
                              </View>
                            ) : (
                              <Input
                                style={styles.inputSettings}
                                autoCapitalize="none"
                                label={evaProps => (
                                  <Text {...evaProps}>First Name</Text>
                                )}
                                value={values.firstName}
                                onChangeText={handleChange('firstName')}
                              />
                            )}

                            {!isEditMode ? (
                              <View
                                style={{
                                  flexDirection: 'column',
                                  width: '45%',
                                }}>
                                <Text style={styles.editLabel}>Last Name</Text>

                                <View style={styles.editField}>
                                  {renderPersonIcon()}
                                  <Text style={{fontSize: 15}}>
                                    {values.lastName}
                                  </Text>
                                </View>
                              </View>
                            ) : (
                              <Input
                                style={styles.inputSettings}
                                autoCapitalize="none"
                                label={evaProps => (
                                  <Text {...evaProps}>Last Name</Text>
                                )}
                                value={values.lastName}
                                onChangeText={handleChange('lastName')}
                              />
                            )}
                          </View>
                          {!isEditMode ? (
                            <View style={{flexDirection: 'column'}}>
                              <Text style={styles.editLabel}>School</Text>
                              <View style={styles.editField}>
                                {renderSchoolIcon()}
                                <Text style={{fontSize: 15}}>
                                  {values.school}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <Input
                              accessoryLeft={renderSchoolIcon()}
                              style={styles.inputSettings}
                              autoCapitalize="none"
                              label={evaProps => (
                                <Text {...evaProps}>School</Text>
                              )}
                              value={values.school}
                              onChangeText={handleChange('school')}
                            />
                          )}
                          {/* {!isEditMode ? (
                          <View style={{ flexDirection: "column" }}>
                            <Text style={styles.editLabel}>Grade</Text>
                            <Text style={styles.editField}>{values.grade}</Text>
                          </View>
                        ) : (
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>Grade</Text>
                            )}
                            value={values.grade}
                            onChangeText={handleChange("grade")}
                          />
                        )} */}

                          <View style={{flexDirection: 'column'}}>
                            <Text style={styles.editLabel}>
                              Parent 1/Guardian 1 Email
                            </Text>
                            <View style={styles.editField}>
                              {renderEmailIcon()}
                              <Text style={{fontSize: 15}}>
                                {values.parentemail1}
                              </Text>
                            </View>
                          </View>

                          <View style={{flexDirection: 'column'}}>
                            <Text style={styles.editLabel}>
                              Parent 2/Guardian 2 Email
                            </Text>
                            <View style={styles.editField}>
                              {renderEmailIcon()}
                              <Text style={{fontSize: 15}}>
                                {values.parentemail2}
                              </Text>
                            </View>
                          </View>

                          <View style={{flexDirection: 'column'}}>
                            <Text style={styles.editLabel}>Phone Number</Text>
                            <View style={styles.editField}>
                              {renderPhoneIcon()}
                              <Text style={{fontSize: 15}}>{values.phone}</Text>
                            </View>
                          </View>

                          {isEditMode ? (
                            <View style={{marginTop: 10}}>
                              <View style={styles.background}>
                                <TouchableOpacity
                                  style={styles.background}
                                  onPress={handleSubmit}>
                                  <Text style={styles.button}>Submit</Text>
                                </TouchableOpacity>
                              </View>
                              <Button
                                size="small"
                                appearance="outline"
                                onPress={() => {
                                  setFieldValue('firstName', user?.firstName);
                                  setFieldValue('lastName', user?.lastName);
                                  setFieldValue('country', user?.country);
                                  setFieldValue('state', user?.state);
                                  setFieldValue('city', user?.city);
                                  setisEditMode(false);
                                }}
                                style={{borderRadius: 10, width: '100%'}}>
                                Cancel
                              </Button>
                            </View>
                          ) : (
                            <View style={{marginTop: 10}}></View>
                          )}

                          <View style={{height: 100}} />
                        </>
                      )}
                    </>
                  )}
                </Formik>
              </View>
            </ScrollView>
          </KeyboardAwareScrollView>
        </BackgroundLayout>
      )}
    </>
  );
};

export default PersonalProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    //backgroundColor: 'background-basic-color-1',
  },
  layout: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
    padding: 20,
  },
  mainLayout: {
    flex: 9,
    marginTop: 40,
  },
  profileAvatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: 'center',
    backgroundColor: '#3AA5A2',
    tintColor: '#ECF1F7',
  },
  profileImage: {
    width: 126,
    height: 126,
    borderRadius: 63,
    alignSelf: 'center',
  },
  editAvatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  selectSettings: {
    marginTop: 18,
  },
  inputSettings: {
    marginTop: 7,
  },
  disabledInputSettings: {
    marginTop: 7,
    borderColor: Colors.transparent,
    backgroundColor: Colors.transparent,
    color: 'black',
    tintColor: 'black',
  },

  background: {
    width: '100%',
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 10,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editField: {
    paddingLeft: 10,
    backgroundColor: Colors.white,
    elevation: 2,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
  },
  editLabel: {
    fontSize: 15,
    color: '#8f9bb3',
    marginBottom: 4,
    marginTop: 8,
    fontWeight: 'bold',
  },
  professionalCheckbox: {
    marginTop: 10,
  },
  termsCheckBox: {
    marginTop: 24,
  },
  termsCheckBoxText: {
    color: 'text-hint-color',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 13,
    color: 'red',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.fieldLabel,
  },
  editButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    bottom: 0,
  },
  profileAvatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: 'center',
    backgroundColor: 'color-primary-default',
    tintColor: 'background-basic-color-1',
  },
  profileImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: 'center',
  },
  editAvatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
