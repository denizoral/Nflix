import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        },
      ]
    );
  };

  const ProfileItem: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
  }> = ({ icon, label, value }) => (
    <View style={styles.profileItem}>
      <View style={styles.profileItemIcon}>
        <Ionicons name={icon} size={20} color="#e50914" />
      </View>
      <View style={styles.profileItemContent}>
        <Text style={styles.profileItemLabel}>{label}</Text>
        <Text style={styles.profileItemValue}>{value}</Text>
      </View>
    </View>
  );

  const ActionItem: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
  }> = ({ icon, label, onPress, color = '#fff' }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.actionItemIcon}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.actionItemLabel, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#e50914" />
          </View>
          <Text style={styles.userName}>
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.username || 'User'
            }
          </Text>
          {user?.isAdmin && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <ProfileItem
            icon="person-outline"
            label="Username"
            value={user?.username || 'N/A'}
          />
          
          <ProfileItem
            icon="mail-outline"
            label="Email"
            value={user?.email || 'N/A'}
          />
          
          {user?.firstName && (
            <ProfileItem
              icon="text-outline"
              label="First Name"
              value={user.firstName}
            />
          )}
          
          {user?.lastName && (
            <ProfileItem
              icon="text-outline"
              label="Last Name"
              value={user.lastName}
            />
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <ActionItem
            icon="settings-outline"
            label="Settings"
            onPress={() => Alert.alert('Coming Soon', 'Settings will be available in a future update')}
          />
          
          <ActionItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Alert.alert('Support', 'For support, please contact the administrator')}
          />
          
          <ActionItem
            icon="information-circle-outline"
            label="About"
            onPress={() => Alert.alert('About DotByte', 'DotByte Mobile App\nVersion 1.0.0\n\nA streaming platform for your personal movie collection.')}
          />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <ActionItem
            icon="log-out-outline"
            label="Logout"
            onPress={handleLogout}
            color="#e50914"
          />
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>DotByte Mobile v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Connected to your DotByte server
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e50914',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  adminText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 2,
    borderRadius: 8,
  },
  profileItemIcon: {
    width: 40,
    alignItems: 'center',
  },
  profileItemContent: {
    flex: 1,
    marginLeft: 15,
  },
  profileItemLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 2,
  },
  profileItemValue: {
    color: '#fff',
    fontSize: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 2,
    borderRadius: 8,
  },
  actionItemIcon: {
    width: 40,
    alignItems: 'center',
  },
  actionItemLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    paddingBottom: 50,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  footerSubtext: {
    color: '#444',
    fontSize: 12,
  },
});

export default ProfileScreen;