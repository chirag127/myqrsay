import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button, Divider, Avatar, List, Switch, Portal, Dialog, Paragraph, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import LoadingIndicator from '../../components/common/LoadingIndicator';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, isLoading: authLoading } = useAuth();

  const [profileImage, setProfileImage] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Pick profile image
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        setSnackbarMessage('Permission to access media library was denied');
        setSnackbarVisible(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        // Here you would typically upload the image to your server
        setSnackbarMessage('Profile picture updated');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('Failed to pick image');
      setSnackbarVisible(true);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setLoading(true);

    try {
      await logout();
      // Navigation will be handled by the AppNavigator
    } catch (error) {
      setSnackbarMessage('Failed to logout. Please try again.');
      setSnackbarVisible(true);
      setLoading(false);
    }
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    setSnackbarMessage(
      notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled'
    );
    setSnackbarVisible(true);
  };

  if (!user) {
    return <LoadingIndicator fullScreen text="Loading profile..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Avatar.Text
                size={100}
                label={user.name.substring(0, 2).toUpperCase()}
                style={styles.avatar}
              />
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Text>
          </View>
        </View>

        {/* Profile Actions */}
        <View style={styles.section}>
          <List.Item
            title="Edit Profile"
            description="Update your personal information"
            left={props => <List.Icon {...props} icon="account-edit" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="My Addresses"
            description="Manage your delivery addresses"
            left={props => <List.Icon {...props} icon="map-marker" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Addresses')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Payment Methods"
            description="Manage your payment options"
            left={props => <List.Icon {...props} icon="credit-card" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('PaymentMethods')}
            style={styles.listItem}
          />
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <List.Item
            title="Notifications"
            description="Receive order updates and promotions"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                color="#ff6b00"
              />
            )}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Language"
            description="English"
            left={props => <List.Icon {...props} icon="translate" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              setSnackbarMessage('Language settings coming soon');
              setSnackbarVisible(true);
            }}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Dark Mode"
            description="Toggle dark theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={false}
                onValueChange={() => {
                  setSnackbarMessage('Dark mode coming soon');
                  setSnackbarVisible(true);
                }}
                color="#ff6b00"
              />
            )}
            style={styles.listItem}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <List.Item
            title="Help Center"
            description="Get help with your orders"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              setSnackbarMessage('Help center coming soon');
              setSnackbarVisible(true);
            }}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="About Us"
            description="Learn more about our restaurant"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              setSnackbarMessage('About us coming soon');
              setSnackbarVisible(true);
            }}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Privacy Policy"
            description="Read our privacy policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              setSnackbarMessage('Privacy policy coming soon');
              setSnackbarVisible(true);
            }}
            style={styles.listItem}
          />
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={() => setLogoutDialogVisible(true)}
            style={styles.logoutButton}
            icon="logout"
            color="#e74c3c"
          >
            Logout
          </Button>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Logout Dialog */}
      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to logout?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleLogout}
              loading={loading || authLoading}
              disabled={loading || authLoading}
              color="#e74c3c"
            >
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatar: {
    backgroundColor: '#ff6b00',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff6b00',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  roleContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  listItem: {
    paddingVertical: 8,
  },
  logoutContainer: {
    padding: 16,
    marginTop: 16,
  },
  logoutButton: {
    borderColor: '#e74c3c',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen;
