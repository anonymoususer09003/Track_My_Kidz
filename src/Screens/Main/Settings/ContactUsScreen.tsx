import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, View } from 'react-native';
import { AppHeader, LinearGradientButton } from '@/Components';
import { Input, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { ContactUs } from '../../../Services/ContactUsServices';
import * as yup from 'yup';
import { Formik } from 'formik';
import Colors from '@/Theme/Colors';
import { useIsFocused } from '@react-navigation/native';
import { loadId } from '@/Storage/MainAppStorage';
import BackgroundLayout from '@/Components/BackgroundLayout';

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
  const [formikValues, setFomikValues] = useState({ message: '' });
  const resetErrors = () => setShowErrors(false);

  useEffect(() => {
    resetErrors();
    setFomikValues({ message: '' });
  }, [isFocuesed]);

  return (
    <BackgroundLayout title="Contact us">
      <View style={styles.layout}>
        <KeyboardAvoidingView style={styles.container}>
          <AppHeader hideCalendar={true} hideCenterIcon={true} />

          <View style={styles.mainLayout}>
            {isFocuesed && (
              <Formik
                validateOnMount
                enableReinitialize
                validationSchema={contactUsValidationSchema}
                initialValues={formikValues}
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
                      console.log(error);
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
                            Your message has been successfully submited.{'\n'}
                            Thank you for contacting us!
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.sppinerContainer}>
                          {/* <Spinner status="primary" /> */}
                        </View>
                      )
                    ) : (
                      <View style={styles.formContainer}>
                        <Input
                          style={styles.textInput}
                          textStyle={styles.textArea}
                          placeholder="Add your message here"
                          onChangeText={handleChange('message')}
                          onBlur={() => {
                            setisTouched(true);
                            setShowErrors(true);
                          }}
                          value={values.message}
                          multiline={true}
                          maxLength={500}
                          // status={isTouched && errors.message ? "danger" : ""}
                        />
                        <Text style={styles.message}>Min 50 characters</Text>
                        {errors.message && isTouched && showErrors ? (
                          <Text style={styles.errorText}>{errors.message}</Text>
                        ) : null}
                        <LinearGradientButton
                          onPress={() => (!isValid ? null : handleSubmit())}
                          gradient={isValid ? [Colors.primary, '#EC5ADD'] : ['grey', 'grey']}
                        >
                          Send
                        </LinearGradientButton>
                      </View>
                    )}
                  </>
                )}
              </Formik>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </BackgroundLayout>
  );
};

export default ContactUsScreen;

const themedStyles = StyleService.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
  },
  mainLayout: {
    flex: 9,
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
  },
  textInput: {
    textAlignVertical: 'top',
    // minHeight: 200,
    borderRadius: 10,
    elevation: 1,
  },
  textArea: {
    minHeight: 100,

    textAlignVertical: 'top',
  },
  container: {
    flex: 2,
    flexDirection: 'column',

    justifyContent: 'flex-start',

    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
  },
  headerContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,

    padding: 20,
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
    fontSize: 13,

    marginLeft: 10,
    marginTop: 10,

    fontWeight: '600',
    marginBottom: 20,
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
