import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
// import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Button, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LoadingIndicator from '../../components/common/LoadingIndicator';

const QRCodeScannerScreen = () => {
  const navigation = useNavigation();

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [flashMode, setFlashMode] = useState(false);

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Handle barcode scan
  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;

    setScanned(true);
    setLoading(true);

    try {
      // Check if the QR code is valid for our app
      if (data.startsWith('restaurant-menu://')) {
        // Extract table number or other information
        const params = new URLSearchParams(data.replace('restaurant-menu://', ''));
        const tableNumber = params.get('table');
        const menuId = params.get('menu');

        if (tableNumber) {
          // Navigate to menu with table number
          navigation.replace('Menu', { tableNumber });
          return;
        } else if (menuId) {
          // Navigate to specific menu
          navigation.replace('Menu', { menuId });
          return;
        }
      }

      // If we reach here, the QR code is not valid for our app
      setSnackbarMessage('Invalid QR code. Please scan a valid restaurant menu QR code.');
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage('Error scanning QR code. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Toggle flash
  const toggleFlash = () => {
    setFlashMode(!flashMode);
  };

  // If permission is null, we're still waiting
  if (hasPermission === null) {
    return <LoadingIndicator fullScreen text="Requesting camera permission..." />;
  }

  // If permission is denied
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off" size={64} color="#666" />
        <Text style={styles.permissionText}>Camera permission is required to scan QR codes.</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.permissionButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        style={styles.camera}
        type={BarCodeScanner.Constants.Type.back}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.flashButton}
              onPress={toggleFlash}
            >
              <Ionicons
                name={flashMode ? "flash" : "flash-off"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanAreaCorner1} />
            <View style={styles.scanAreaCorner2} />
            <View style={styles.scanAreaCorner3} />
            <View style={styles.scanAreaCorner4} />
          </View>

          <Text style={styles.instructions}>
            Align the QR code within the frame to scan
          </Text>

          {scanned && (
            <Button
              mode="contained"
              onPress={() => setScanned(false)}
              style={styles.scanAgainButton}
            >
              Scan Again
            </Button>
          )}
        </View>
      </BarCodeScanner>

      {loading && <LoadingIndicator fullScreen text="Processing QR code..." />}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Scan Again',
          onPress: () => setScanned(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  flashButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanArea: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanAreaCorner1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#fff',
  },
  scanAreaCorner2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
  },
  scanAreaCorner3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#fff',
  },
  scanAreaCorner4: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
  },
  instructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  scanAgainButton: {
    marginBottom: 40,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    paddingHorizontal: 24,
  },
});

export default QRCodeScannerScreen;
