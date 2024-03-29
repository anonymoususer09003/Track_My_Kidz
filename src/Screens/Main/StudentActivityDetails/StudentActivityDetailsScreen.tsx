import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import { AppHeader, LinearGradientButton } from '@/Components';
import { InstructionsModal } from '@/Modals';
import MapView from 'react-native-maps';

const StudentActivityDetailsScreen = () => {
  const navigation = useNavigation();
  // const dependent = route && route.params && route.params.dependent;

  // const RightActions = (dragX: any, item) => {
  //   const scale = dragX.interpolate({
  //     inputRange: [-100, 0],
  //     outputRange: [1, 0],
  //     extrapolate: 'clamp',
  //   });
  //   return (
  //     <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
  //       {!item.status && <TouchableOpacity
  //         style={{
  //           padding: 10,
  //           alignItems: 'center',
  //           justifyContent: 'center',
  //         }}>
  //         <Icon
  //           style={{ width: 30, height: 30 }} fill={Colors.primary}
  //           name="trash" />
  //       </TouchableOpacity>}
  //
  //     </View>
  //   );
  // };

  return (
    <>
      <AppHeader title="Trip Name" />
      <InstructionsModal />
      <View style={styles.layout}>
        <View style={{ padding: 10, width: '100%', height: '100%' }}>
          <View style={styles.item}>
            <Text style={styles.text}>{`Date:`}</Text>
            <Text style={styles.text}>{`Trip to:`}</Text>
            <Text style={styles.text}>{`Address: `}</Text>
          </View>
          <MapView
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            style={{ width: '100%', height: '65%', marginTop: 10 }}
          />
          <View style={{ marginTop: 20 }}>
            <LinearGradientButton onPress={() => navigation.goBack()} style={styles.footerButton}>
              Back
            </LinearGradientButton>
          </View>
        </View>
      </View>
    </>
  );
};

export default StudentActivityDetailsScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
  },
  item: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '96%',
    marginTop: 10,
    marginHorizontal: '2%',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  footer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: '96%',
    backgroundColor: '#fff',
    marginHorizontal: '2%',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  footerButton: {
    borderRadius: 20,
  },
});
