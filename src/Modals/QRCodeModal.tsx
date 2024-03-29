import { Modal } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { ModalState } from '@/Store/Modal';
// import Modal from 'react-native-modal';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '@/Theme/Colors';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

type QRCodeModalProps = { showQR?: any, setShowQR?: any, navigation?: any, hideQr?: any, onScan: any }

const QRCodeModal: FC<QRCodeModalProps> = ({ onScan }) => {
  const dispatch = useDispatch();
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.qrcodeModalVisibility,
  );

  return (
    <>
      <Modal visible={isVisible} style={styles.modal}>
        <QRCodeScanner
          onRead={(e) => {
            onScan(e.data);
            console.log('e', e);
            // Linking.openURL(e.data).catch((err) =>
            //   console.error("An error occured", err)
            // );
          }}
          flashMode={RNCamera.Constants.FlashMode.torch}
          //   topContent={
          //     <Text style={styles.centerText}>
          //       Go to{" "}
          //       <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text> on
          //       your computer and scan the QR code.
          //     </Text>
          //   }
          bottomContent={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* <LinearGradientButton size="medium" style={{ marginRight: 15 }}>
                Rescan
              </LinearGradientButton> */}
              {/* <LinearGradientButton
                size="medium"
                onPress={() => {
                  dispatch(
                    ChangeModalState.action({
                      qrcodeModalVisibility: false,
                    })
                  );
                }}
              >
                Cancel
              </LinearGradientButton> */}
            </View>
          }
        />
      </Modal>
    </>
  );
};
export default QRCodeModal;

const styles = StyleSheet.create({
  modal: {
    width: '100%',
    height: '90%',
    zIndex: 0,
    backgroundColor: Colors.white,
    elevation: 5,
    shadowColor: Colors.primaryGray,
    shadowOffset: {
      height: 5,
      width: 2,
    },
    borderRadius: 5,
    shadowRadius: 5,
    shadowOpacity: 0.3,
  },
  background: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    backgroundColor: Colors.primary,
  },
  topNav: {
    color: Colors.white,
    marginTop: 35,
  },
  container: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderBottomWidth: 0.2,
    borderColor: Colors.primaryTint,
    padding: 10,
  },
  swipeAction: {
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 0.2,
    borderColor: Colors.primaryTint,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '30%',
  },
  modalButton: {
    width: '95%',
    marginTop: 10,
  },
  selectInput: {
    marginTop: 10,
  },
  mainAsset: {
    alignItems: 'center',
    height: 300,
    width: '100%',
    flex: 3,
  },
  mainContent: {
    flex: 4,
  },
  textContent: {
    fontSize: 16,
    padding: 10,
    width: '100%',
    borderBottomColor: Colors.lightgray,
    borderBottomWidth: 1,
  },
  extraImages: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: 100,
  },
  centerItems: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    fontSize: 10,
    color: 'red',
  },
  formView: {
    flex: 9,
  },
  bottomView: {
    width: '100%',
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: Colors.transparent,
    bottom: 0,
    height: 50,
  },
  linearBottom: {
    width: '100%',

    height: 50,
  },
  createPostButton: {
    margin: 3,
    width: '50%',

    height: 50,
    right: 0,
    backgroundColor: Colors.transparent,
    borderColor: Colors.transparent,
    borderWidth: 0,
  },
  ghostButton: {
    margin: 8,
    width: '100%',
    alignSelf: 'center',
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  formContainer: {
    flex: 1,
    marginVertical: 20,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  backgroundButton: {
    width: '80%',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sent: {
    fontSize: 16,
    marginLeft: 10,
    marginTop: 10,
    fontWeight: 'bold',
    color: Colors.gray,
    textAlign: 'center',
  },
  selectSettings: {
    marginTop: 18,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});
