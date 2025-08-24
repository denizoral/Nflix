import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { apiService, Movie } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const MoviesScreen: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    filterMovies();
  }, [searchQuery, movies]);

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      const moviesData = await apiService.getMovies();
      setMovies(moviesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load movies');
      console.error('Error loading movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMovies = () => {
    if (!searchQuery.trim()) {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (movie.description && movie.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredMovies(filtered);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMovies();
    setRefreshing(false);
  };

  const playMovie = (movieId: string) => {
    navigation.navigate('MoviePlayer', { movieId });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity style={styles.movieCard} onPress={() => playMovie(item.id)}>
      <View style={styles.movieImageContainer}>
        <Ionicons name="film" size={50} color="#e50914" />
      </View>
      
      <View style={styles.movieContent}>
        <View style={styles.movieHeader}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <TouchableOpacity style={styles.playButton} onPress={() => playMovie(item.id)}>
            <Ionicons name="play" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {item.description && (
          <Text style={styles.movieDescription} numberOfLines={3}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.movieMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="eye" size={14} color="#999" />
            <Text style={styles.metaText}>{item.views || 0} views</Text>
          </View>
          
          {item.genre && (
            <View style={styles.metaItem}>
              <Ionicons name="pricetag" size={14} color="#999" />
              <Text style={styles.metaText}>{item.genre}</Text>
            </View>
          )}
          
          <View style={styles.metaItem}>
            <Ionicons name="document" size={14} color="#999" />
            <Text style={styles.metaText}>{formatFileSize(item.fileSize)}</Text>
          </View>
          
          {item.duration && (
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color="#999" />
              <Text style={styles.metaText}>{formatDuration(item.duration)}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.movieDate}>
          Added {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={searchQuery ? "search" : "film-outline"} 
        size={60} 
        color="#555" 
      />
      <Text style={styles.emptyText}>
        {searchQuery ? 'No movies found' : 'No movies available'}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : 'Movies will appear here when they\'re uploaded'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Movies List */}
      <FlatList
        data={filteredMovies}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredMovies.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e50914" />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 10,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  movieImageContainer: {
    width: 100,
    height: 140,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieContent: {
    flex: 1,
    padding: 15,
  },
  movieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  movieTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  playButton: {
    backgroundColor: '#e50914',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieDescription: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  movieMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 4,
  },
  metaText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 4,
  },
  movieDate: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
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

export default MoviesScreen;