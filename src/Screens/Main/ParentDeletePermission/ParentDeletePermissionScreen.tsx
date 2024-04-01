import React, { useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { Text, Button, Select, SelectItem } from '@ui-kitten/components';
import { AppHeader } from '@/Components';
import Colors from '@/Theme/Colors';
import { loadUserId } from '@/Storage/MainAppStorage';
import { DeleteStudent } from '@/Services/Student';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';

const permissions = ['Yes', 'No'];

const ParentDeletePermissionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MainStackNavigatorParamsList, 'ParentDeletePermission'>>();
  const [selectedItem, setSelectedItem] = useState(1);

  return (
    <>
      <AppHeader title="Delete Permission" isBack />
      <View style={{ padding: 10, marginTop: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', width: '100%' }}>
          Are you sure you want to give permission to delete account?
        </Text>
      </View>
      <Select
        style={{ width: '90%', marginHorizontal: '5%' }}
        value={permissions[selectedItem]}
        placeholder="Grade"
        onSelect={(index: any) => {
          setSelectedItem(index.row);
        }}
        label={(evaProps: any) => <Text {...evaProps}></Text>}
      >
        {permissions.map((permission, index) => {
          return <SelectItem key={index} title={permission} />;
        })}
      </Select>
      <Button
        style={styles.modalButton}
        size="small"
        onPress={async () => {
          const userId = await loadUserId();
          if (!userId) return;
          DeleteStudent(route?.params?.dependentId, userId)
            .then((response) => {
              console.log('response', response);
              navigation.goBack();
            })
            .catch((error) => console.log(error));
        }}
      >
        Submit
      </Button>
    </>
  );
};

export default ParentDeletePermissionScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 50,
  },
  modalButton: {
    width: '90%',
    marginTop: 30,
    marginHorizontal: '5%',
  },
  item: {
    borderRadius: 10,
    width: '96%',
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: '2%',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  button: {
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.primary,
    height: 30,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    color: Colors.primary,
    fontSize: 16,
  },
  floatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: Colors.primary,
    shadowOffset: {
      height: 10,
      width: 10,
    },
    shadowOpacity: 0.9,
    shadowRadius: 50,
    elevation: 5,
  },
});
