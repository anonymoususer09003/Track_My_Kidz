import React, { useEffect, useState } from 'react';
import { View, KeyboardAvoidingView, Alert, Image, TouchableOpacity, Linking } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { AppHeader } from '@/Components';
import {
  Button,
  Input,
  StyleService,
  useStyleSheet,
  Layout,
  Text,
  Spinner,
} from '@ui-kitten/components';
// @ts-ignore
import { ContactUs } from '../../../Services/ContactUsServices';
import * as yup from 'yup';
import { Formik } from 'formik';
import Colors from '@/Theme/Colors';
import { useIsFocused } from '@react-navigation/native';
import { loadId, loadUserId } from '@/Storage/MainAppStorage';

const ContactUsScreen = () => {
  const isFocuesed = useIsFocused();
  const [showErrors, setShowErrors] = useState(false);
  const styles = useStyleSheet(themedStyles);
  const contactUsValidationSchema = yup.object().shape({
    message: yup
      .string()
      .min(50, ({ min }) => `Message needs to be at least ${min} characters`)
      .required('Message is required'),
  });
  const [isTouched, setisTouched] = useState(false);
  const [isSending, setisSending] = useState(false);
  const [isSent, setisSent] = useState(false);

  const resetErrors = () => setShowErrors(false);

  useEffect(() => {
    resetErrors();
  }, [isFocuesed]);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <AppHeader title="Contact us" isBack />
      <View style={styles.layout}>
        <View style={styles.mainLayout}>
          <Formik
            validationSchema={contactUsValidationSchema}
            validateOnMount={true}
            initialValues={{ message: '' }}
            onSubmit={async (values, { resetForm }) => {
              setisSending(true);
              const userId = await loadId();
              let objectToPass = {
                id: 0,
                userId: userId,
                message: values.message,
              };
              ContactUs(objectToPass)
                .then((response: any) => {
                  if (response.status == 200) {
                    setisSent(true);
                    setTimeout(() => {
                      setisSent(false);

                      setisSending(false);
                    }, 3000);
                  }
                })
                .catch((error: any) => {
                  console.log('err', error);
                  Alert.alert('An error occured', 'Please try again', [
                    { text: 'OK', style: 'cancel' },
                  ]);

                  setisSending(false);
                });
              resetForm();
            }}
          >
            {({ handleChange, handleSubmit, values, errors, isValid }) => (
              <>
                {isSending ? (
                  isSent ? (
                    <View style={styles.sppinerContainer}>
                      <Text style={styles.sent}>
                        Your message has been successfully submited.{'\n'}Thank you for contacting
                        us!
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.sppinerContainer}>
                      {/* <Spinner status="primary" /> */}
                    </View>
                  )
                ) : (
                  <Layout style={styles.formContainer}>
                    <Input
                      style={{ marginTop: 20, fontSize: 20 }}
                      textStyle={{
                        minHeight: 200,
                        marginLeft: -1,
                        fontSize: 18,
                      }}
                      placeholder="Add your message here"
                      onChangeText={handleChange('message')}
                      onBlur={() => {
                        setisTouched(true);
                        setShowErrors(true);
                      }}
                      value={values.message}
                      multiline={true}
                      maxLength={500}
                      status={isTouched && errors.message ? 'danger' : ''}
                    />
                    <Text style={styles.message}>Min 50 characters</Text>
                    {errors.message && isTouched && showErrors ? (
                      <Text style={styles.errorText}>{errors.message}</Text>
                    ) : null}
                    <Layout style={styles.buttonSettings}>
                      {isValid ? (
                        <View style={styles.background}>
                          <TouchableOpacity
                            style={styles.background}
                            disabled={!isValid}
                            onPress={handleSubmit}
                          >
                            <Text style={styles.button}>Send</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.disabledBackground}>
                          <TouchableOpacity
                            style={styles.disabledBackground}
                            disabled={!isValid}
                            onPress={handleSubmit}
                          >
                            <Text style={[styles.button, { color: '#fff' }]}>Send</Text>
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
    </KeyboardAvoidingView>
  );
};

export default ContactUsScreen;

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
    backgroundColor: 'background-basic-color-1',
    justifyContent: 'flex-start',
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  signInButton: {
    marginHorizontal: 2,
    borderRadius: 20,
    marginTop: 10,
  },

  errorText: {
    fontSize: 10,
    color: 'red',
    marginLeft: 10,
    marginTop: 10,
  },
  message: {
    fontSize: 10,
    color: '#000000',
    marginLeft: 10,
    marginTop: 10,
  },
  socialIcons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
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
    color: 'grey',
    textAlign: 'center',
  },
  background: {
    width: '80%',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  disabledBackground: {
    width: '80%',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: Colors.lightgray,
  },
  button: {
    paddingTop: 5,
    fontSize: 17,
    color: 'white',
    borderRadius: 10,
  },
});
