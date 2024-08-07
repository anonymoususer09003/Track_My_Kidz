import { Card, IndexPath, Modal, Text } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { ModalState } from '@/Store/Modal';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { loadId } from '@/Storage/MainAppStorage';
import Colors from '@/Theme/Colors';
// import { TouchableOpacity } from "react-native-gesture-handler";
import { GetAllGroup } from '@/Services/Group';
import { GROUPS } from '@/Constants';

const _groups = GROUPS;

type GroupSelectionModalProps = {
  individuals?: any;
  setIndividuals?: any;
  getGroupDetail?: any;
};
const GroupSelectionModal = ({ getGroupDetail }: GroupSelectionModalProps) => {
  const [groups, setGroups] = useState<any[]>([]);

  // const { Layout } = useTheme();
  const [selectedAmountIndex, setSelectedAmountIndex] = useState<IndexPath | null>(null);
  // const [cardData, setCardData] = useState({});
  const [page, pageNumber] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [payment, setPayment] = useState<boolean>(false);
  // const [selectedIndex, setSelectedIndex] = React.useState(0);
  // const availableAmounts = [
  //   {
  //     amount: 1,
  //     label: "$50 - Annually (Best Deal)",
  //   },
  //   {
  //     amount: 5,
  //     label: "$4.99 - Monthly",
  //   },
  // ];
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.groupSelectionModalVisibility
  );
  const dispatch = useDispatch();

  const getGroups = async (refreshing?: any) => {
    if (refreshing) {
      setRefreshing(true);
    }
    const id = await loadId();
    GetAllGroup(id, refreshing ? page : 0, pageSize)
      .then((res) => {
        setRefreshing(false);
        setPageSize(10);

        pageNumber(refreshing ? page + 1 : 1);
        setTotalRecords(res.totalRecords);
        if (refreshing) {
          setGroups([...groups, ...res?.result]);
        } else {
          setGroups(res?.result);
        }
      })
      .catch((err) => console.log('Err:', err));
  };

  useEffect(() => {
    if (isVisible) {
      getGroups();
    }
  }, [isVisible]);

  useEffect(() => {
    setPayment(false);
    setIsValid(false);
    setSelectedAmountIndex(null);
  }, [isVisible]);

  const handleGroup = (item: any) => {
    // data.push(item);
    // setIndividuals(data);
    getGroupDetail && getGroupDetail(item?.groupId);
    // dispatch(ChangeModalState.action({ groupSelectionModalVisibility: false }));
  };

  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={isVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(ChangeModalState.action({ groupSelectionModalVisibility: false }));
      }}
    >
      <Card style={styles.modal} disabled={true}>
        <View style={styles.body}>
          <View style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Text
              textBreakStrategy={'highQuality'}
              style={{
                textAlign: 'center',
                color: '#606060',
                fontSize: 18,
              }}
            >
              Select a Group
            </Text>
          </View>
        </View>
        <View style={{}}>
          <FlatList
            data={groups || []}
            style={{ padding: 10, width: '100%' }}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                  }}
                  onPress={() => handleGroup(item)}
                >
                  <Text>{item?.groupName || ''}</Text>
                </TouchableOpacity>
              );
            }}
            onEndReached={async () => {
              if (totalRecords > groups.length) {
                //   const userId = await loadUserId();
                getGroups(true);
              }
            }}
            refreshing={false}
            onRefresh={() => null}
          />
          {refreshing && <ActivityIndicator size="large" color={Colors.primary} />}
          {/* {groups.map((group, index) => (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: 5,
              }}
              onPress={() => handleGroup(group)}
            >
              <Text>{group.groupName || ""}</Text>
            </TouchableOpacity>
          ))} */}
        </View>
      </Card>
    </Modal>
  );
};
export default GroupSelectionModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    width: '90%',
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 1,
    flexDirection: 'row',
    color: Colors.white,
    zIndex: -1,
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottom: {
    flex: 1,
    flexDirection: 'row',
    height: 45,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  buttonText: {
    flex: 1,
    borderRadius: 25,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 2,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    flexDirection: 'row',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
