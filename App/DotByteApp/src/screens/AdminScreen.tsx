import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  fileName?: string;
}

interface AdminStats {
  totalMovies: number;
  totalViews: number;
  activeUsers: number;
  storageUsed: number;
}

const AdminScreen: React.FC = () => {
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
  });
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [movieTitle, setMovieTitle] = useState('');
  const [movieDescription, setMovieDescription] = useState('');
  const [movieGenre, setMovieGenre] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const statsData = await apiService.getAdminStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const pickAndUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: false,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        if (!file.mimeType?.startsWith('video/')) {
          Alert.alert('Error', 'Please select a video file');
          return;
        }

        setPendingFile(file);
        setMovieTitle('');
        setMovieDescription('');
        setMovieGenre('');
        setShowMetadataModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
      console.error('File picker error:', error);
    }
  };

  const handleUploadConfirm = async () => {
    if (!pendingFile || !movieTitle.trim()) {
      Alert.alert('Error', 'Movie title is required');
      return;
    }

    setShowMetadataModal(false);
    
    setUploadProgress({
      isUploading: true,
      progress: 0,
      fileName: pendingFile.name,
    });

    try {
      const formData = new FormData();
      formData.append('movie', {
        uri: pendingFile.uri,
        type: pendingFile.mimeType || 'video/mp4',
        name: pendingFile.name,
      } as any);

      formData.append('title', movieTitle);
      if (movieDescription) formData.append('description', movieDescription);
      if (movieGenre) formData.append('genre', movieGenre);

      await apiService.uploadMovieWithProgress(formData, (progress) => {
        setUploadProgress(prev => ({
          ...prev,
          progress: Math.round(progress * 100),
        }));
      });

      setUploadProgress({
        isUploading: false,
        progress: 100,
      });

      setTimeout(() => {
        setUploadProgress({ isUploading: false, progress: 0 });
        Alert.alert('Success', 'Movie uploaded successfully!');
        setPendingFile(null);
        loadStats();
      }, 1000);
    } catch (error) {
      setUploadProgress({ isUploading: false, progress: 0 });
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'An error occurred');
      console.error('Upload error:', error);
    }
  };

  const scanMovieDirectory = async () => {
    Alert.alert(
      'Scan Directory',
      'This will scan the server movie directory for new files. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Scan',
          onPress: async () => {
            try {
              await apiService.scanMovieDirectory();
              Alert.alert('Success', 'Directory scan completed');
              loadStats();
            } catch (error) {
              Alert.alert('Error', 'Failed to scan directory');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const StatCard: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string | number;
    color: string;
  }> = ({ icon, title, value, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const ActionButton: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
    color: string;
    disabled?: boolean;
  }> = ({ icon, title, subtitle, onPress, color, disabled = false }) => (
    <TouchableOpacity
      style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const MetadataModal = () => (
    <Modal
      visible={showMetadataModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowMetadataModal(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Movie Details</Text>
          <Text style={styles.modalSubtitle}>{pendingFile?.name}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter movie title"
              value={movieTitle}
              onChangeText={setMovieTitle}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter movie description (optional)"
              value={movieDescription}
              onChangeText={setMovieDescription}
              multiline={true}
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Genre</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter genre (optional)"
              value={movieGenre}
              onChangeText={setMovieGenre}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowMetadataModal(false);
                setPendingFile(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleUploadConfirm}
            >
              <Text style={styles.confirmButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Upload Progress Notification */}
      {uploadProgress.isUploading && (
        <View style={styles.uploadNotification}>
          <View style={styles.uploadNotificationContent}>
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <View style={styles.uploadNotificationText}>
              <Text style={styles.uploadNotificationTitle}>Uploading: {uploadProgress.fileName}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${uploadProgress.progress}%` }]}
                />
              </View>
            </View>
            <Text style={styles.progressText}>{uploadProgress.progress}%</Text>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Manage your DotByte content</Text>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          {isLoadingStats ? (
            <ActivityIndicator size="large" color="#e50914" />
          ) : stats ? (
            <View style={styles.statsGrid}>
              <StatCard
                icon="videocam"
                title="Total Movies"
                value={stats.totalMovies}
                color="#e50914"
              />
              <StatCard
                icon="eye"
                title="Total Views"
                value={stats.totalViews}
                color="#4CAF50"
              />
              <StatCard
                icon="people"
                title="Active Users"
                value={stats.activeUsers}
                color="#2196F3"
              />
              <StatCard
                icon="server"
                title="Storage Used"
                value={formatFileSize(stats.storageUsed)}
                color="#FF9800"
              />
            </View>
          ) : (
            <Text style={styles.errorText}>Failed to load stats</Text>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <ActionButton
              icon="cloud-upload"
              title="Upload Movie"
              subtitle="Select video from device"
              onPress={pickAndUploadFile}
              color="#e50914"
              disabled={uploadProgress.isUploading}
            />
            <ActionButton
              icon="scan"
              title="Scan Directory"
              subtitle="Check for new files on server"
              onPress={scanMovieDirectory}
              color="#4CAF50"
            />
            <ActionButton
              icon="refresh"
              title="Refresh Stats"
              subtitle="Update dashboard data"
              onPress={loadStats}
              color="#2196F3"
            />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • Supported formats: MP4, MOV, AVI, MKV
            </Text>
            <Text style={styles.infoText}>
              • Files are uploaded to your DotByte server
            </Text>
            <Text style={styles.infoText}>
              • No file size restrictions on mobile uploads
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Metadata Modal */}
      <MetadataModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  uploadNotification: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  uploadNotificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  uploadNotificationText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  uploadNotificationTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e50914',
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statTitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  infoContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
    lineHeight: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#e50914',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminScreen;