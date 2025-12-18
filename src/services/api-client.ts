import { client } from '../api/client.gen';

//const API_URL = 'http://46.191.173.6:7654';
const API_URL = 'https://localhost:7654';

export class AuthenticatedApiClient {
  constructor(baseUrl: string = API_URL) {
    client.setConfig({
      baseUrl: baseUrl,
    });
  }

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
    client.setConfig({
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  clearToken(): void {
    localStorage.removeItem('access_token');
    client.setConfig({
      headers: {
        'Authorization': undefined,
      },
    });
  }

  getClient() {
    return client;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const apiClient = new AuthenticatedApiClient();
