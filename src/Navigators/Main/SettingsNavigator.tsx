import React from 'react'
import {
    SettingsScreen,
    PersonalProfileScreen,
    SocialMediaProfileScreen,
    OptionsScreen,
    AppListScreen,
    ServiceActivationScreen,
    PrivacySettingsScreen,
    ReportProblemScreen,
    BlockedAccountsScreen,
    ChangePasswordScreen,
    RequestOccasionScreen 
} from '@/Screens'
import { createStackNavigator } from '@react-navigation/stack'
import { AuthStackHeader } from '@/Components'
const SettingsNavigator = createStackNavigator()
const SettingsStack = () => (
    <SettingsNavigator.Navigator
        initialRouteName="SettingsHome"
    >
        <SettingsNavigator.Screen name="SettingsHome" component={SettingsScreen} options={{ headerShown: false }} />
        <SettingsNavigator.Screen name="PersonalProfile" component={PersonalProfileScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Personal Profile" back={true} />) }} />
        <SettingsNavigator.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Change password" back={true} />) }} />
        <SettingsNavigator.Screen name="SocialMediaProfile" component={SocialMediaProfileScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Social Media Links" back={true} />) }} />
        <SettingsNavigator.Screen name="Options" component={OptionsScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Options" back={true} />) }} />
        <SettingsNavigator.Screen name="AppList" component={AppListScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="App list" back={true} />) }} />
        <SettingsNavigator.Screen name="ServiceActivation" component={ServiceActivationScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Service activation" back={true} />) }} />
        <SettingsNavigator.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Privacy settings" back={true} />) }} />
        <SettingsNavigator.Screen name="RequestOccasion" component={RequestOccasionScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Requests" back={true} />) }} />
        <SettingsNavigator.Screen name="ReportProblem" component={ReportProblemScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Report a problem" back={true} />) }} />
        <SettingsNavigator.Screen name="BlockedAccounts" component={BlockedAccountsScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Blocked accounts" back={true} />) }} />


    </SettingsNavigator.Navigator>
)
export default SettingsStack
