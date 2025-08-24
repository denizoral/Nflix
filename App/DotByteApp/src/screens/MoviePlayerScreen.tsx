import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

import { apiService, Movie } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type MoviePlayerRouteProp = RouteProp<RootStackParamList, 'MoviePlayer'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const MoviePlayerScreen: React.FC = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const route = useRoute<MoviePlayerRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { movieId } = route.params;

  useEffect(() => {
    loadMovie();
    
    // Hide status bar for fullscreen experience
    StatusBar.setHidden(true);
    
    return () => {
      // Show status bar when leaving
      StatusBar.setHidden(false);
    };
  }, [movieId]);

  useEffect(() => {
    // Auto-hide controls after 3 seconds
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  const loadMovie = async () => {
    try {
      setIsLoading(true);
      const movieData = await apiService.getMovie(movieId);
      setMovie(movieData);
      
      // Increment view count
      await apiService.incrementViews(movieId);
    } catch (error) {
      Alert.alert('Error', 'Failed to load movie', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      console.error('Error loading movie:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading movie...</Text>
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color="#e50914" />
        <Text style={styles.errorText}>Movie not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const videoUrl = apiService.getVideoUrl(movieId);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={toggleControls}
      >
        <Video
          style={styles.video}
          source={{ uri: videoUrl }}
          shouldPlay
          isLooping={false}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls={showControls}
        />
      </TouchableOpacity>

      {/* Custom Controls Overlay */}
      {showControls && (
        <View style={styles.controlsOverlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.backControl} onPress={goBack}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.movieInfo}>
              <Text style={styles.movieTitle} numberOfLines={1}>
                {movie.title}
              </Text>
              {movie.genre && (
                <Text style={styles.movieGenre}>{movie.genre}</Text>
              )}
            </View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <View style={styles.movieStats}>
              <View style={styles.statItem}>
                <Ionicons name="eye" size={16} color="#ccc" />
                <Text style={styles.statText}>{movie.views || 0} views</Text>
              </View>
              {movie.duration && (
                <View style={styles.statItem}>
                  <Ionicons name="time" size={16} color="#ccc" />
                  <Text style={styles.statText}>
                    {Math.floor(movie.duration / 60)}m
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Gradient Overlays */}
      <View style={styles.topGradient} pointerEvents="none" />
      <View style={styles.bottomGradient} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backControl: {
    marginRight: 15,
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  movieGenre: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  movieStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 5,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'transparent',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'transparent',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
  },
});

export default MoviePlayerScreen;