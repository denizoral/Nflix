import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://DotByte.replit.app/api';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  profileImageUrl?: string;
}

export interface Movie {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  fileSize: number;
  duration?: number;
  genre?: string;
  views: number;
  rating?: number;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

class ApiService {
  private async getHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    
    const user = await this.handleResponse(response);
    // Store session for mobile app
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  async register(userData: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(userData),
    });
    
    const user = await this.handleResponse(response);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: await this.getHeaders(),
    });
    
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('authToken');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });
      
      if (response.status === 401) {
        await AsyncStorage.removeItem('user');
        return null;
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      await AsyncStorage.removeItem('user');
      return null;
    }
  }

  // Movie methods
  async getMovies(): Promise<Movie[]> {
    const response = await fetch(`${API_BASE_URL}/movies`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });
    
    return await this.handleResponse(response);
  }

  async getPopularMovies(): Promise<Movie[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/popular`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });
    
    return await this.handleResponse(response);
  }

  async getMovie(id: string): Promise<Movie> {
    const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });
    
    return await this.handleResponse(response);
  }

  async incrementViews(movieId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/movies/${movieId}/view`, {
      method: 'POST',
      headers: await this.getHeaders(),
    });
  }

  // Get video stream URL
  getVideoUrl(movieId: string): string {
    return `${API_BASE_URL}/movies/${movieId}/stream`;
  }

  // Admin methods
  async uploadMovie(formData: FormData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/movies/upload`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...(await this.getHeaders()).Authorization && { Authorization: (await this.getHeaders()).Authorization },
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
  }

  async getAdminStats(): Promise<{
    totalMovies: number;
    totalViews: number;
    activeUsers: number;
    storageUsed: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/analytics/stats`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });
    
    return await this.handleResponse(response);
  }

  async scanMovieDirectory(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/movies/scan`, {
      method: 'POST',
      headers: await this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
  }

  // Check stored user
  async getStoredUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  }
}

export const apiService = new ApiService();