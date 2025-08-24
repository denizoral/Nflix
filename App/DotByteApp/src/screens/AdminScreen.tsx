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
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        // Basic validation
        if (!file.mimeType?.startsWith('video/')) {
          Alert.alert('Error', 'Please select a video file');
          return;
        }

        await uploadMovie(file);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
      console.error('File picker error:', error);
    }
  };

  const uploadMovie = async (file: DocumentPicker.DocumentPickerAsset) => {
    setUploadProgress({
      isUploading: true,
      progress: 0,
      fileName: file.name,
    });

    try {
      const formData = new FormData();
      formData.append('movie', {
        uri: file.uri,
        type: file.mimeType || 'video/mp4',
        name: file.name,
      } as any);

      // Get movie metadata from user
      const movieTitle = await promptForText('Movie Title', `Enter title for ${file.name}:`);
      if (!movieTitle) {
        setUploadProgress({ isUploading: false, progress: 0 });
        return;
      }

      const movieDescription = await promptForText('Description (Optional)', 'Enter movie description:');
      const movieGenre = await promptForText('Genre (Optional)', 'Enter movie genre:');

      formData.append('title', movieTitle);
      if (movieDescription) formData.append('description', movieDescription);
      if (movieGenre) formData.append('genre', movieGenre);

      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 500);

      await apiService.uploadMovie(formData);

      clearInterval(progressInterval);
      setUploadProgress({
        isUploading: false,
        progress: 100,
      });

      Alert.alert(
        'Success',
        'Movie uploaded successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setUploadProgress({ isUploading: false, progress: 0 });
              loadStats(); // Refresh stats
            },
          },
        ]
      );
    } catch (error) {
      setUploadProgress({ isUploading: false, progress: 0 });
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'An error occurred');
      console.error('Upload error:', error);
    }
  };

  const promptForText = (title: string, message: string): Promise<string | null> => {
    return new Promise((resolve) => {
      Alert.prompt(
        title,
        message,
        [
          { text: 'Cancel', onPress: () => resolve(null), style: 'cancel' },
          { text: 'OK', onPress: (text) => resolve(text || null) },
        ],
        'plain-text'
      );
    });
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

  if (!user?.isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="shield-outline" size={60} color="#e50914" />
          <Text style={styles.errorText}>Access Denied</Text>
          <Text style={styles.errorSubtext}>Admin privileges required</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Manage your DotByte content</Text>
        </View>

        {/* Upload Progress */}
        {uploadProgress.isUploading && (
          <View style={styles.uploadProgressContainer}>
            <Text style={styles.uploadProgressTitle}>
              Uploading {uploadProgress.fileName}...
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${uploadProgress.progress}%` },
                ]}
              />
            </View>
            <Text style={styles.uploadProgressText}>
              {uploadProgress.progress}%
            </Text>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          {isLoadingStats ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e50914" />
              <Text style={styles.loadingText}>Loading stats...</Text>
            </View>
          ) : stats ? (
            <View style={styles.statsContainer}>
              <StatCard
                icon="film"
                title="Total Movies"
                value={stats.totalMovies}
                color="#e50914"
              />
              <StatCard
                icon="eye"
                title="Total Views"
                value={stats.totalViews}
                color="#1db954"
              />
              <StatCard
                icon="people"
                title="Active Users"
                value={stats.activeUsers}
                color="#ff6b6b"
              />
              <StatCard
                icon="server"
                title="Storage Used"
                value={formatFileSize(stats.storageUsed)}
                color="#4ecdc4"
              />
            </View>
          ) : (
            <Text style={styles.errorText}>Failed to load stats</Text>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <ActionButton
            icon="cloud-upload"
            title="Upload Movie"
            subtitle="Upload a new movie file"
            onPress={pickAndUploadFile}
            color="#e50914"
            disabled={uploadProgress.isUploading}
          />

          <ActionButton
            icon="folder-open"
            title="Scan Directory"
            subtitle="Scan server directory for new files"
            onPress={scanMovieDirectory}
            color="#1db954"
          />

          <ActionButton
            icon="refresh"
            title="Refresh Stats"
            subtitle="Update dashboard statistics"
            onPress={loadStats}
            color="#4ecdc4"
          />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  errorSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#999',
    fontSize: 16,
  },
  uploadProgressContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e50914',
  },
  uploadProgressTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e50914',
    borderRadius: 3,
  },
  uploadProgressText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'right',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#999',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    marginRight: '2%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statTitle: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionSubtitle: {
    color: '#999',
    fontSize: 14,
    marginTop: 2,
  },
  infoContainer: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default AdminScreen;