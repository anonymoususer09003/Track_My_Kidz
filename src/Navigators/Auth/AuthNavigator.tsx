import React from "react";
import {
  EmailConfirmationScreen,
  FinalRegistrationScreen,
  FirstSignUpScreen,
  ForgotPasswordScreen,
  ReactivateAccountScreen,
  ResendConfirmationScreen,
  ResetPasswordScreen,
  SignInScreen,
  FinalOrgRegistrationScreen,
} from "@/Screens";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthStackHeader } from "@/Components";
import { AuthProvider } from "./AuthProvider";

const AuthNavigator = createStackNavigator();
const AuthStack = () => (
  <AuthProvider>
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
          header: ({ navigation }) => (
            <AuthStackHeader
              navigation={navigation}
              title="Registration"
              back={true}
            />
          ),
        }}
      />
      <AuthNavigator.Screen
        name="EmailConfirmation"
        component={EmailConfirmationScreen}
        options={{
          header: ({ navigation }) => (
            <AuthStackHeader
              navigation={navigation}
              title="Email Confirmation"
              back={true}
            />
          ),
        }}
      />
      <AuthNavigator.Screen
        name="FinalRegistrationScreen"
        component={FinalRegistrationScreen}
        options={{
          header: ({ navigation }) => (
            <AuthStackHeader
              navigation={navigation}
              title="Registration"
              back={true}
            />
          ),
        }}
      />
      <AuthNavigator.Screen
        name="FinalOrgRegistrationScreen"
        component={FinalOrgRegistrationScreen}
        options={{
          header: ({ navigation }) => (
            <AuthStackHeader
              navigation={navigation}
              title="Registration"
              back={true}
            />
          ),
        }}
      />
      <AuthNavigator.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          header: ({ navigation }) => (
            <AuthStackHeader
              navigation={navigation}
              title="Forgot Password"
              back={true}
            />
          ),
        }}
      />
      <AuthNavigator.Screen
        name="ResendConfirmation"
        component={ResendConfirmationScreen}
        options={{
          header: ({ navigation }) => (
            <AuthStackHeader
              navigation={navigation}
              title="Resend Confirmation"
              back={true}
            />
          ),
        }}
      />
      <AuthNavigator.Screen
        name="ReactivateAccount"
        component={ReactivateAccountScreen}
        options={{
          header: ({ navigation }) => (
            <AuthStackHeader
              navigation={navigation}
              title="Reactivate Account"
              back={true}
            />
          ),
        }}
      />
      <AuthNavigator.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          header: ({ navigation }) => (
            <AuthStackHeader
              navigation={navigation}
              title="Reset Password"
              back={true}
            />
          ),
        }}
      />
    </AuthNavigator.Navigator>
  </AuthProvider>
);
export default AuthStack;
