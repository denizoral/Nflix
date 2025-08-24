import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { apiService, Movie } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [moviesData, popularData] = await Promise.all([
        apiService.getMovies(),
        apiService.getPopularMovies(),
      ]);
      setMovies(moviesData);
      setPopularMovies(popularData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load movies');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const playMovie = (movieId: string) => {
    navigation.navigate('MoviePlayer', { movieId });
  };

  const renderMovieItem = ({ item, index }: { item: Movie; index: number }) => (
    <TouchableOpacity 
      style={[styles.movieCard, index === 0 && styles.firstCard]}
      onPress={() => playMovie(item.id)}
    >
      <View style={styles.movieImageContainer}>
        <Ionicons name="film" size={40} color="#e50914" />
      </View>
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.movieDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>
        <View style={styles.movieStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={12} color="#999" />
            <Text style={styles.statText}>{item.views || 0}</Text>
          </View>
          {item.genre && (
            <View style={styles.statItem}>
              <Ionicons name="pricetag" size={12} color="#999" />
              <Text style={styles.statText}>{item.genre}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedMovie = ({ item }: { item: Movie }) => (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => playMovie(item.id)}
    >
      <View style={styles.featuredImageContainer}>
        <Ionicons name="film" size={60} color="#e50914" />
      </View>
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <TouchableOpacity style={styles.playButton} onPress={() => playMovie(item.id)}>
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.playText}>Play</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading movies...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.list}
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.welcomeText}>
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
              </Text>
              <Text style={styles.subtitle}>What do you want to watch today?</Text>
            </View>

            {/* Featured/Popular Movies */}
            {popularMovies.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Popular Movies</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={popularMovies.slice(0, 5)}
                  renderItem={renderFeaturedMovie}
                  keyExtractor={(item) => `featured-${item.id}`}
                  contentContainerStyle={styles.horizontalList}
                />
              </View>
            )}

            {/* All Movies */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {movies.length > 0 ? 'All Movies' : 'No Movies Available'}
              </Text>
              {movies.length > 0 ? (
                <FlatList
                  data={movies}
                  renderItem={renderMovieItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="film-outline" size={60} color="#555" />
                  <Text style={styles.emptyText}>No movies available yet</Text>
                  <Text style={styles.emptySubtext}>
                    Movies will appear here when they're uploaded
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e50914" />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  list: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#999',
    fontSize: 16,
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
  horizontalList: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: 280,
    height: 160,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginRight: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e50914',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  playText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  firstCard: {
    marginTop: 0,
  },
  movieImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieInfo: {
    flex: 1,
    padding: 15,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  movieDescription: {
    color: '#999',
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  movieStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen;