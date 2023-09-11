import {
  EmailConfirmationScreen, FinalOrgRegistrationScreen, FinalRegistrationScreen,
  FirstSignUpScreen,
  ForgotPasswordScreen,
  ReactivateAccountScreen,
  ResendConfirmationScreen,
  ResetPasswordScreen,
  SignInScreen
} from "@/Screens";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
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
  </AuthProvider>
);
export default AuthStack;
