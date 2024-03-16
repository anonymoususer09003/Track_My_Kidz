import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Button,
  Input,
  StyleService,
  useStyleSheet,
  Layout,
  Spinner,
} from '@ui-kitten/components';
// @ts-ignore
import {loadUserId} from '@/Storage/MainAppStorage';

import LinearGradient from 'react-native-linear-gradient';
import {UpdateUser} from '../../../Services/SettingsServies';
import {Formik} from 'formik';
import {useSelector, useDispatch} from 'react-redux';
import {UserState} from '@/Store/User';
import FetchOne from '@/Store/User/FetchOne';
import Colors from '@/Theme/Colors';

const SocialMediaProfileScreen = () => {
  const dispatch = useDispatch();
  const styles = useStyleSheet(themedStyles);
  const [isEditMode, setisEditMode] = useState(false);
  const [isSending, setisSending] = useState(false);
  const [isSent, setisSent] = useState(false);
  const user = useSelector((state: {user: UserState}) => state.user.item);
  const isLoading = useSelector(
    (state: {user: UserState}) => state.user.fetchOne.loading,
  );
  const [userId, setuserId] = useState(null);
  const getUserId = async () => {
    const id = await loadUserId();
    setuserId(id);
    // dispatch(FetchOne.action(id));
  };
  useEffect(() => {
    getUserId();
  }, []);
  return (
    <KeyboardAvoidingView style={styles.container}>
      {isLoading ? (
        <View style={styles.sppinerContainer}>
          <View style={styles.sppinerContainer}>
            {/* <Spinner status="primary" /> */}
          </View>
        </View>
      ) : (
        <View style={styles.layout}>
          <View style={styles.mainLayout}>
            <Formik
              validateOnMount={true}
              initialValues={{
                facebook: user?.fbAccount || '',
                instagram: user?.instagramAccount || '',
                twitter: user?.twitterAccount || '',
                website: user?.websiteUrl || '',
              }}
              onSubmit={(values, {resetForm}) => {
                setisSending(true);
                let objectToPass = {
                  fbAccount: values.facebook,
                  websiteUrl: values.website,
                  twitterAccount: values.twitter,
                  instagramAccount: values.instagram,
                  id: userId,
                };
                UpdateUser(objectToPass)
                  .then((response: any) => {
                    if (response.status == 200) {
                      setisEditMode(false);
                      setisSending(false);
                      getUserId();
                    }
                  })
                  .catch((error: any) => {
                    Alert.alert(
                      error && error.data && error.data.title,
                      error && error.data && error.data.detail,
                      [{text: 'OK', style: 'cancel'}],
                    );
                    setisSending(false);
                    setisEditMode(!isEditMode);
                  });
              }}>
              {({handleChange, handleSubmit, values}) => (
                <>
                  {isSending ? (
                    isSent ? (
                      <View style={styles.sppinerContainer}>
                        <Text style={styles.sent}>User updated!</Text>
                      </View>
                    ) : (
                      <View style={styles.sppinerContainer}>
                        {/* <Spinner status="primary" /> */}
                      </View>
                    )
                  ) : (
                    <Layout style={styles.formContainer}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                        <Text style={styles.label}>Facebook</Text>

                        {isEditMode ? (
                          <Input
                            style={{
                              marginTop: 20,
                              width: '75%',
                              backgroundColor: Colors.white,
                            }}
                            textStyle={{color: Colors.primary}}
                            placeholderTextColor={'#9DD5D3'}
                            onChangeText={handleChange('facebook')}
                            value={values.facebook}
                            placeholder={
                              values.instagram === ''
                                ? 'Facebook username'
                                : null
                            }
                          />
                        ) : (
                          <Text style={styles.value}>
                            {user?.fbAccount || 'Facebook username'}
                          </Text>
                        )}
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                        <Text style={styles.label}>Instagram</Text>
                        {isEditMode ? (
                          <Input
                            style={{
                              marginTop: 20,
                              width: '75%',
                              backgroundColor: Colors.white,
                            }}
                            textStyle={{color: Colors.primary}}
                            placeholderTextColor={'#9DD5D3'}
                            placeholder={
                              values.instagram === ''
                                ? 'Instagram username'
                                : null
                            }
                            value={values.instagram}
                            onChangeText={handleChange('instagram')}
                          />
                        ) : (
                          <Text style={styles.value}>
                            {user?.instagramAccount || 'Instagram username'}
                          </Text>
                        )}
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                        <Text style={styles.label}>Twitter</Text>
                        {isEditMode ? (
                          <Input
                            style={{
                              marginTop: 20,
                              width: '75%',
                              backgroundColor: Colors.white,
                            }}
                            textStyle={{color: Colors.primary}}
                            placeholderTextColor={'#9DD5D3'}
                            placeholder={
                              values.twitter === '' ? 'Twitter username' : null
                            }
                            value={values.twitter}
                            onChangeText={handleChange('twitter')}
                          />
                        ) : (
                          <Text style={styles.value}>
                            {user?.twitterAccount || 'Twitter username'}
                          </Text>
                        )}
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                        <Text style={styles.label}>Website</Text>
                        {isEditMode ? (
                          <Input
                            style={{
                              marginTop: 20,
                              width: '75%',
                              backgroundColor: Colors.white,
                            }}
                            textStyle={{color: Colors.primary}}
                            placeholderTextColor={'#9DD5D3'}
                            placeholder={
                              values.website === '' ? 'Website URL' : null
                            }
                            value={values.website}
                            onChangeText={handleChange('website')}
                          />
                        ) : (
                          <Text style={styles.value}>
                            {user?.websiteUrl || 'Website URL'}
                          </Text>
                        )}
                      </View>
                      <Layout style={styles.buttonSettings}>
                        {isEditMode ? (
                          <View style={styles.background}>
                            <TouchableOpacity
                              style={styles.background}
                              onPress={handleSubmit}>
                              <Text style={styles.button}>Submit</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.background}>
                            <TouchableOpacity
                              style={styles.background}
                              onPress={() => setisEditMode(true)}>
                              <Text style={styles.button}>Edit</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </Layout>
                    </Layout>
                  )}
                </>
              )}
            </Formik>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default SocialMediaProfileScreen;

const themedStyles = StyleService.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
  },
  mainLayout: {
    flex: 9,
  },
  container: {
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: 'background-basic-color-1',
  },
  headerContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
  },
  buttonSettings: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'flex-end',
  },
  signInButton: {
    marginHorizontal: 2,
    borderRadius: 20,
    marginTop: 10,
  },
  sppinerContainer: {
    flex: 1,
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
  },
  label: {
    marginHorizontal: 10,
    marginTop: 15,
    fontSize: 16,
    width: '20%',
  },
  value: {
    fontSize: 15,
    color: Colors.primary,
    marginTop: 20,
    width: '75%',
    marginLeft: 20,
    paddingVertical: 10,
  },
  background: {
    width: '100%',
    borderTopRadius: 10,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    borderRadius: 10,
  },
});
