import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(`${API_URL}/api/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
            // Navigate to login - handled by auth context
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
  }) {
    return this.client.post('/auth/register', data);
  }

  async logout() {
    return this.client.post('/auth/logout');
  }

  async refreshToken(refreshToken: string) {
    return this.client.post('/auth/refresh', { refreshToken });
  }

  // User endpoints
  async getProfile() {
    return this.client.get('/users/profile');
  }

  async updateProfile(data: any) {
    return this.client.put('/users/profile', data);
  }

  async getPreferences() {
    return this.client.get('/users/preferences');
  }

  async updatePreferences(data: any) {
    return this.client.put('/users/preferences', data);
  }

  // Pregnancy Profile endpoints
  async createPregnancy(data: any) {
    return this.client.post('/pregnancy', data);
  }

  async getCurrentPregnancy() {
    return this.client.get('/pregnancy/current');
  }

  async updatePregnancy(id: string, data: any) {
    return this.client.put(`/pregnancy/${id}`, data);
  }

  async getPregnancySummary(id: string) {
    return this.client.get(`/pregnancy/${id}/summary`);
  }

  // Symptom endpoints
  async logSymptoms(pregnancyId: string, data: any) {
    return this.client.post(`/pregnancy/${pregnancyId}/symptoms`, data);
  }

  async getSymptoms(pregnancyId: string, params?: { startDate?: string; endDate?: string }) {
    return this.client.get(`/pregnancy/${pregnancyId}/symptoms`, { params });
  }

  async getTodaySymptoms(pregnancyId: string) {
    return this.client.get(`/pregnancy/${pregnancyId}/symptoms/today`);
  }

  async getSymptomTrends(pregnancyId: string, days?: number) {
    return this.client.get(`/pregnancy/${pregnancyId}/symptoms/trends`, {
      params: { days },
    });
  }

  // Medication endpoints
  async addMedication(pregnancyId: string, data: any) {
    return this.client.post(`/pregnancy/${pregnancyId}/medications`, data);
  }

  async getMedications(pregnancyId: string) {
    return this.client.get(`/pregnancy/${pregnancyId}/medications`);
  }

  async logMedicationDose(pregnancyId: string, medicationId: string, data: any) {
    return this.client.post(`/pregnancy/${pregnancyId}/medications/${medicationId}/log`, data);
  }

  async getMedicationAdherence(pregnancyId: string) {
    return this.client.get(`/pregnancy/${pregnancyId}/medications/adherence`);
  }

  // Vitals endpoints
  async logBP(pregnancyId: string, data: { systolic: number; diastolic: number; heartRate?: number }) {
    return this.client.post(`/pregnancy/${pregnancyId}/vitals/bp`, data);
  }

  async getBPHistory(pregnancyId: string, days?: number) {
    return this.client.get(`/pregnancy/${pregnancyId}/vitals/bp`, { params: { days } });
  }

  async getBPTrends(pregnancyId: string) {
    return this.client.get(`/pregnancy/${pregnancyId}/vitals/bp/trends`);
  }

  async logBloodSugar(pregnancyId: string, data: any) {
    return this.client.post(`/pregnancy/${pregnancyId}/vitals/blood-sugar`, data);
  }

  async getBloodSugarHistory(pregnancyId: string, days?: number) {
    return this.client.get(`/pregnancy/${pregnancyId}/vitals/blood-sugar`, { params: { days } });
  }

  async logWeight(pregnancyId: string, data: { weightLbs?: number; weightKg?: number }) {
    return this.client.post(`/pregnancy/${pregnancyId}/vitals/weight`, data);
  }

  async getWeightHistory(pregnancyId: string) {
    return this.client.get(`/pregnancy/${pregnancyId}/vitals/weight`);
  }

  async logKicks(pregnancyId: string, data: { sessionDurationMinutes: number; kickCount: number }) {
    return this.client.post(`/pregnancy/${pregnancyId}/vitals/kicks`, data);
  }

  async getKicksToday(pregnancyId: string) {
    return this.client.get(`/pregnancy/${pregnancyId}/vitals/kicks/today`);
  }

  // Reports endpoints
  async generateReport(pregnancyId: string, options: any) {
    return this.client.post(`/pregnancy/${pregnancyId}/reports/generate`, options);
  }

  async getReports(pregnancyId: string) {
    return this.client.get(`/pregnancy/${pregnancyId}/reports`);
  }

  async getReport(pregnancyId: string, reportId: string) {
    return this.client.get(`/pregnancy/${pregnancyId}/reports/${reportId}`);
  }

  // Caregiver endpoints
  async inviteCaregiver(pregnancyId: string, data: { email: string; relationship: string }) {
    return this.client.post(`/pregnancy/${pregnancyId}/caregivers`, data);
  }

  async getCaregivers(pregnancyId: string) {
    return this.client.get(`/pregnancy/${pregnancyId}/caregivers`);
  }

  async updateCaregiverPermissions(pregnancyId: string, caregiverId: string, permissions: any) {
    return this.client.put(`/pregnancy/${pregnancyId}/caregivers/${caregiverId}`, { permissions });
  }

  // Concerns endpoints
  async addConcern(pregnancyId: string, data: { concernText: string; severity?: string }) {
    return this.client.post(`/pregnancy/${pregnancyId}/concerns`, data);
  }

  async getConcerns(pregnancyId: string) {
    return this.client.get(`/pregnancy/${pregnancyId}/concerns`);
  }

  async markConcernAddressed(pregnancyId: string, concernId: string) {
    return this.client.post(`/pregnancy/${pregnancyId}/concerns/${concernId}/address`);
  }
}

export const api = new ApiService();
