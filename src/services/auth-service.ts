import { UserShortEntry } from '../api';
import {
  postApiV1AuthRegister,
  postApiV1AuthLogin,
  getApiV1AuthAccount,
  getApiV1AuthUsers,
  getApiV1AuthEmailConfirm,
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
    
    if(response.data)
          return response.data;
            
    throw response.error
  }

  async login(username: string, password: string) {
    const response = await postApiV1AuthLogin({
      body: {
        username,
        password,
      },
      client: apiClient.getClient(),
    });

    if(response.data)
          return response.data;
            
    throw response.error
  }

  async getAccount() {
    const response = await getApiV1AuthAccount({
      client: apiClient.getClient(),
    });
    return response.data;
  }

  async getUsers(userName: string | undefined) {
    const response = await getApiV1AuthUsers({
      query: {userName},
      client: apiClient.getClient(),
    });

    if(response.data)
          return response.data as UserShortEntry[];
            
    throw response.error
  }

  async confirmEmail(login: string, code: string) {
    const response = await getApiV1AuthEmailConfirm({
      query: {login, code},
      client: apiClient.getClient()
    })

    if(response.data)
          return response.data;
            
    throw response.error
  }

  logout(): void {
    apiClient.clearToken();
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }
}

export const authService = new AuthService();
