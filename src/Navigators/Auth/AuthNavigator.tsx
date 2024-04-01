import {
  EmailConfirmationScreen, FinalOrgRegistrationScreen, FinalRegistrationScreen,
  FirstSignUpScreen,
  ForgotPasswordScreen,
  ReactivateAccountScreen,
  ResendConfirmationScreen,
  ResetPasswordScreen,
  SignInScreen,
} from '@/Screens';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

export type AuthStackNavigatorParamsList = {
  Login: undefined;
  SignUp1: undefined;
  EmailConfirmation: {
    emailAddress?: string,
    user_type?: string,
    isDesignatedAdmin?: boolean,
    reactivate?: boolean
  } | undefined;
  FinalRegistrationScreen: { emailAddress: string, user_type: string, student: any, activation_code: string };
  FinalOrgRegistrationScreen: {
    emailAddress: any,
    registrationId: any,
    user_type: any,
    activation_code: any,
    details: {
      email: any,
      firstname: any,
      lastname: any,
      phoneNumber: any,
      state: any,
      country: any,
      city: any,
      zipcode: any,
      selected_entity: any,
      photo?: any,
    },
  } | undefined;
  ForgotPassword: undefined;
  ResendConfirmation: { resendCode: any };
  ReactivateAccount: undefined;
  ResetPassword: { emailAddress?: string, user_type?: string, code?: string };
};

const AuthNavigator = createStackNavigator<AuthStackNavigatorParamsList>();
const AuthStack = () => (
  <AuthNavigator.Navigator initialRouteName="Login">
    <AuthNavigator.Screen
      name="Login"
      component={SignInScreen}
      options={{ headerShown: false }}
    />
    <AuthNavigator.Screen
      name="SignUp1"
      component={FirstSignUpScreen}
      options={{
        headerShown: false,
      }}
    />
    <AuthNavigator.Screen
      name="EmailConfirmation"
      component={EmailConfirmationScreen}
      options={{
        headerShown: false,
      }}
    />
    <AuthNavigator.Screen
      name="FinalRegistrationScreen"
      component={FinalRegistrationScreen}
      options={{
        headerShown: false,
      }}
    />
    <AuthNavigator.Screen
      name="FinalOrgRegistrationScreen"
      component={FinalOrgRegistrationScreen}
      options={{
        headerShown: false,
      }}
    />
    <AuthNavigator.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{
        headerShown: false,
      }}
    />
    <AuthNavigator.Screen
      name="ResendConfirmation"
      component={ResendConfirmationScreen}
      options={{
        headerShown: false,
      }}
    />
    <AuthNavigator.Screen
      name="ReactivateAccount"
      component={ReactivateAccountScreen}
      options={{
        headerShown: false,
      }}
    />
    <AuthNavigator.Screen
      name="ResetPassword"
      component={ResetPasswordScreen}
      options={{
        headerShown: false,
      }}
    />
  </AuthNavigator.Navigator>
);
export default AuthStack;
