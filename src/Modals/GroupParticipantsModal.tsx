import React, { useEffect, useState, useRef } from 'react';

import { Text } from '@ui-kitten/components';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';

import Colors from '@/Theme/Colors';

import Ionicons from 'react-native-vector-icons/Ionicons';

import Modal from 'react-native-modal';
import { loadUserId, loadUserType } from '@/Storage/MainAppStorage';
const InstructorsStudentsModal = ({ isVisible, setIsVisible, participants }: any) => {
  const [userId, setUserId] = useState(null);
  const [userType, setUserType] = useState(null);

  const getUser = async () => {
    const userId = await loadUserId();
    setUserId(JSON.parse(userId));
    const userType = await loadUserType();
    setUserType(userType);
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <Modal
      // propagateSwipe={true}
      // coverScreen={true}
      isVisible={isVisible}
      backdropColor="rgba(0,0,0, 0)"
      style={{ margin: 0, marginTop: 50 }}
      // swipeDirection="down"
      onBackdropPress={() => {
        setIsVisible();
      }}
      onBackButtonPress={() => {
        setIsVisible();
      }}
    >
      <>
        <TouchableOpacity
          onPress={() => setIsVisible()}
          style={{ flex: 1, backgroundColor: 'transparent', height: 200 }}
        >
          <View style={styles.layout}>
            <View
              style={{
                marginTop: 10,
                maxHeight: 550,
                paddingVertical: 20,
                backgroundColor: Colors.white,
                width: '40%',
                borderRadius: 10,
              }}
            >
              {participants?.length > 0 && (
                <FlatList
                  data={participants}
                  renderItem={({ item, index }) => (
                    <View
                      style={{
                        marginVertical: 2,
                        padding: 2,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {item.image ? (
                          <Image
                            source={{ uri: item?.image }}
                            style={{ height: 25, width: 25, borderRadius: 25 }}
                          />
                        ) : (
                          <Ionicons
                            name="person"
                            color={Colors.primary}
                            size={20}
                            style={{ marginHorizontal: 5 }}
                          />
                        )}
                        {userType === 'parent' && (
                          <Text style={{ marginLeft: 5 }}>{`${item?.firstname} ${
                            (item?.parent1Id === userId ||
                              (item?.parent2Id == userId && userType === 'parent')) &&
                            item?.lastname
                              ? item?.lastname?.charAt(0)
                              : ''
                          }`}</Text>
                        )}
                        {userType != 'parent' && (
                          <Text style={{ marginLeft: 5 }}>{`${item?.firstName} ${
                            item?.lastName ? item?.lastName?.charAt(0) : ''
                          }`}</Text>
                        )}
                      </View>
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </>
    </Modal>
  );
};
export default InstructorsStudentsModal;

const styles = StyleSheet.create({
  container: {
    maxHeight: 192,

    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
  },
  tabButton: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: '33%',
    paddingVertical: 10,
  },
  tabText: {
    color: Colors.white,
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  topNav: {
    color: Colors.white,
  },
  layout: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: Colors.newBackgroundColor,
  },
  item: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '96%',
    backgroundColor: '#fff',
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
  bottomButton: {
    width: '80%',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buttonSettings: {
    marginTop: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
});
