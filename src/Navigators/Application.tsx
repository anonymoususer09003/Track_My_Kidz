import React, { useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { StartUpScreen } from '@/Screens'
import { useSelector } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native'
import { navigationRef } from '@/Navigators/Functions'
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, View } from 'react-native'
import { useTheme } from '@/Theme'
import { StartupState } from '@/Store/Startup'
import { customTheme, customMappings } from '../../trackmykidz-theme'
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components'
import * as eva from '@eva-design/eva'
import { AuthStack } from '.'
import { AuthenticationState } from '@/Store/Authentication'
import MainNavigator from '@/Navigators/Main/MainNavigator'
import Toast from 'react-native-toast-message'
import SafeAreaViewDecider from 'react-native-smart-statusbar'
import { LoadingModal } from '@/Modals'
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { FeatherIconsPack } from "@/Components/FeatherIconPacks";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import TwoFACodeModal from "../Modals/TwoFACodeModal";
import { default as mapping } from '../../mapping.json'; // <-- Import app mapping
import Colors from '@/Theme/Colors';
import AddBusInformation from '@/Modals/AddBusInformation'

// @refresh reset
const Application = () => {
  const { Layout, NavigationTheme } = useTheme()
  const { colors } = NavigationTheme
  const applicationIsLoading = useSelector(
    (state: { startup: StartupState }) => state.startup.loadingInitialData,
  )
  const loggedIn = useSelector(
    (state: { authentication: AuthenticationState }) =>
      state.authentication.loggedIn,
  )

  const config = {
    screens: {
      Main: {
        screens: {
          Drawer: {
            screens: {
              AccountDrawer: {
                screens: {
                  Blogs: "blogs"
                },
              },
            },
          },
        },
      },
    },
  };

  const linking = {
    prefixes: ['https://baftrends.com/', 'baftrends://'],
    config,
  };

  const MainStackNavigator = createStackNavigator()
  const MainStack = () => (
    <MainStackNavigator.Navigator
      screenOptions={{
        headerShown: false,

        headerBackTitleVisible: false,
        headerBackTitle: ' ',

      }}
    >
      {applicationIsLoading && (
        <MainStackNavigator.Screen
          name="Startup"
          component={StartUpScreen}
        />
      )}
      {!applicationIsLoading && loggedIn && (
        <MainStackNavigator.Screen name="Main" component={MainNavigator} />
      )}
      {!applicationIsLoading && !loggedIn && (
        <MainStackNavigator.Screen name="AuthNavigator" component={AuthStack} />
      )}
    </MainStackNavigator.Navigator>
  )

  useEffect(() => {
    if (MainNavigator == null && !applicationIsLoading) {
    }
  }, [applicationIsLoading])

  // on destroy needed to be able to reset when app close in background (Android)
  useEffect(
    () => () => {
      MainNavigator = null
    },
    [],
  )

  return (
    <>
      <IconRegistry icons={[EvaIconsPack, FeatherIconsPack]} />
      <ApplicationProvider {...eva} mapping={mapping} theme={customTheme}>
        <>
          {
            Platform.OS === 'ios' && (
              <View style={{ zIndex: 1 }}>
                <SafeAreaViewDecider
                  statusBarHiddenForNotch={false}
                  statusBarHiddenForNonNotch={false}
                  backgroundColor={Colors.primary}
                  barStyle="light-content"
                />
              </View>
            )
          }
          {
            Platform.OS === 'android' && (
              <StatusBar
                animated={true}
                backgroundColor={Colors.primary}
                barStyle="light-content"
              />
            )
          }
          <SafeAreaView style={[{ flex: 1 }, { backgroundColor: Colors.primary }]}>
            <NavigationContainer linking={linking} theme={NavigationTheme} ref={navigationRef}>
              {/* <AddBusInformation /> */}
              <LoadingModal />
              <TwoFACodeModal />
              <MainStack />
            </NavigationContainer>
            <Toast />
          </SafeAreaView>
          {
            Platform.OS === 'ios' && (
              <View style={{ zIndex: 1 }}>
                <SafeAreaViewDecider
                  statusBarHiddenForNotch={false}
                  statusBarHiddenForNonNotch={false}
                  backgroundColor={Colors.primary}
                  barStyle="light-content"
                />
              </View>
            )
          }

        </>
      </ApplicationProvider>
    </>

  )
}

export default Application
