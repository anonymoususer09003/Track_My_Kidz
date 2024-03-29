import React, { FC } from 'react';
import { Image, KeyboardAvoidingView, View } from 'react-native';
import { Icon, Input, Layout, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Normalize } from '../../../Utils/Shared/NormalizeDisplay';
import { SendReactivateCode } from '@/Services/SignUpServices';
import Toast from 'react-native-toast-message';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { useDispatch } from 'react-redux';
import Colors from '@/Theme/Colors';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackNavigatorParamsList } from '@/Navigators/Auth/AuthNavigator';

type ReportProblemScreenProps = {
  navigation: StackNavigationProp<AuthStackNavigatorParamsList, 'ReactivateAccount'>;
};

const ReactivateAccountScreen: FC<ReportProblemScreenProps> = ({ navigation }) => {

  const styles = useStyleSheet(themedStyles);
  const dispatch = useDispatch();

  // @ts-ignore
  const renderPersonIcon = (props: any) => (
    <Icon {...props} name="person-outline" />
  );
  const reactivateValidationSchema = yup.object().shape({
    email: yup
      .string()
      .email('Please enter valid email')
      .required('Email is required'),
  });

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            maxHeight: Normalize(160),
            maxWidth: Normalize(160),
          }}
          source={require('@/Assets/Images/new-logo.png')}
          resizeMode="contain"
        />
      </View>

      <Formik
        validationSchema={reactivateValidationSchema}
        validateOnMount={true}
        initialValues={{ email: '' }}
        onSubmit={(values, { resetForm }) => {
          dispatch(ChangeModalState.action({ loading: true }));

          SendReactivateCode({
            email: values.email,
          }).then(() => {
            navigation.navigate('EmailConfirmation', { emailAddress: values.email, reactivate: true });
          })
            .catch(err => {
              Toast.show({
                type: 'info',
                position: 'top',
                text1: 'Info',
                text2: 'Please check your email address and try again ',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 30,
                bottomOffset: 40,
                onShow: () => {
                },
                onHide: () => {
                },
                onPress: () => {
                },
              });
            })
            .finally(() => {
              dispatch(ChangeModalState.action({ loading: false }));
            });
          resetForm();
          // navigation && navigation.navigate('Registration')
        }
        }
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
          <>
            <Layout style={styles.formContainer}>
              <Input
                placeholder="Email"
                accessoryRight={renderPersonIcon}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {(errors.email && touched.email) &&
                <Text style={styles.errorText}>{errors.email}</Text>
              }
              <View style={{ marginTop: 20 }}>
              </View>
            </Layout>
          </>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};
export default ReactivateAccountScreen;
const themedStyles = StyleService.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'background-basic-color-1',
  },
  headerContainer: {
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 3,
  },
  welcomeMessage: {
    marginTop: 16,
    color: Colors.primary,
  },
  reactivateAccButton: {
    marginHorizontal: 2,
    borderRadius: 20,
  },
  errorText: {
    fontSize: 10,
    color: 'red',
  },
});
