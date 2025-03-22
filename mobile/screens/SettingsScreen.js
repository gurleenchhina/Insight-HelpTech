import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Slider,
  Alert
} from 'react-native';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    textSize: 16,
    brightness: 80,
    safetyAlerts: true,
    ppeReminders: true,
  });
  
  const [user, setUser] = useState({
    id: 1,
    username: 'jsmith',
    firstName: 'John',
    lastName: 'Smith',
    techId: '1234',
  });
  
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // In a real app, we would save these changes to the server
    console.log(`Setting updated: ${key} = ${value}`);
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => {
            // In a real app, we would handle the logout process here
            console.log("User logged out");
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const textSizeLabel = () => {
    if (settings.textSize <= 14) return "Small";
    if (settings.textSize <= 18) return "Medium";
    return "Large";
  };
  
  const brightnessLabel = () => {
    if (settings.brightness <= 33) return "Low";
    if (settings.brightness <= 66) return "Medium";
    return "High";
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.userInfoContainer}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.userDetails}>Tech ID: {user.techId}</Text>
          <Text style={styles.userDetails}>Username: {user.username}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Text style={styles.settingDescription}>
              Enable dark mode for the app interface
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#cbd5e0", true: "#9ae6b4" }}
            thumbColor={settings.darkMode ? "#38a169" : "#a0aec0"}
            ios_backgroundColor="#cbd5e0"
            onValueChange={(value) => updateSetting('darkMode', value)}
            value={settings.darkMode}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Text Size ({textSizeLabel()})</Text>
            <Text style={styles.settingDescription}>
              Adjust the size of text throughout the app
            </Text>
          </View>
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>A</Text>
          <Slider
            style={styles.slider}
            minimumValue={12}
            maximumValue={24}
            step={2}
            value={settings.textSize}
            onValueChange={(value) => updateSetting('textSize', value)}
            minimumTrackTintColor="#38a169"
            maximumTrackTintColor="#cbd5e0"
            thumbTintColor="#38a169"
          />
          <Text style={styles.sliderLabelLarge}>A</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Brightness ({brightnessLabel()})</Text>
            <Text style={styles.settingDescription}>
              Adjust the brightness of the app interface
            </Text>
          </View>
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderIconLabel}>🔅</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={5}
            value={settings.brightness}
            onValueChange={(value) => updateSetting('brightness', value)}
            minimumTrackTintColor="#38a169"
            maximumTrackTintColor="#cbd5e0"
            thumbTintColor="#38a169"
          />
          <Text style={styles.sliderIconLabel}>🔆</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Safety Alerts</Text>
            <Text style={styles.settingDescription}>
              Receive alerts about product safety information
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#cbd5e0", true: "#9ae6b4" }}
            thumbColor={settings.safetyAlerts ? "#38a169" : "#a0aec0"}
            ios_backgroundColor="#cbd5e0"
            onValueChange={(value) => updateSetting('safetyAlerts', value)}
            value={settings.safetyAlerts}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>PPE Reminders</Text>
            <Text style={styles.settingDescription}>
              Show reminders about required protective equipment
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#cbd5e0", true: "#9ae6b4" }}
            thumbColor={settings.ppeReminders ? "#38a169" : "#a0aec0"}
            ios_backgroundColor="#cbd5e0"
            onValueChange={(value) => updateSetting('ppeReminders', value)}
            value={settings.ppeReminders}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.accountButton} onPress={() => {}}>
          <Text style={styles.accountButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.accountButton} onPress={() => {}}>
          <Text style={styles.accountButtonText}>Change Password</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.accountButton, styles.dangerButton]} 
          onPress={handleLogout}
        >
          <Text style={styles.dangerButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.accountButton} onPress={() => {}}>
          <Text style={styles.accountButtonText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.accountButton} onPress={() => {}}>
          <Text style={styles.accountButtonText}>Terms of Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.accountButton} onPress={() => {}}>
          <Text style={styles.accountButtonText}>Help & Support</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Insight HelpTech v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9ff',
  },
  userInfoContainer: {
    backgroundColor: '#38a169',
    padding: 20,
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 16,
    color: '#f0fff4',
    marginBottom: 2,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#718096',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginRight: 12,
  },
  sliderLabelLarge: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4a5568',
    marginLeft: 12,
  },
  sliderIconLabel: {
    fontSize: 20,
    color: '#4a5568',
    marginHorizontal: 8,
  },
  accountButton: {
    backgroundColor: '#edf2f7',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  accountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#fed7d7',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e53e3e',
    textAlign: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default SettingsScreen;