import {
  postApiV1AuthRegister,
  postApiV1AuthLogin,
  getApiV1AuthAccount,
} from '../api/sdk.gen';
import { apiClient } from './api-client';

class AuthService {
  async register(username: string, email: string, password: string) {
    const response = await postApiV1AuthRegister({
      body: {
        username,
        email,
        password,
      },
      client: apiClient.getClient(),
    });
    return response.data;
  }

  async login(username: string, password: string) {
    const response = await postApiV1AuthLogin({
      body: {
        username,
        password,
      },
      client: apiClient.getClient(),
    });

    return response.data;
  }

  async getAccount() {
    const response = await getApiV1AuthAccount({
      client: apiClient.getClient(),
    });
    return response.data;
  }

  logout(): void {
    apiClient.clearToken();
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }
}

export const authService = new AuthService();
