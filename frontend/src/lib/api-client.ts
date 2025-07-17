import { getToken } from './auth-token';
import { ApiResponse } from '../types/api';
import { API_BASE_URL } from './config';

// APIクライアントの設定
interface ApiClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

// HTTPメソッドの型
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// リクエストオプション
interface RequestOptions {
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL;
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 30000;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = getToken();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
      };
    }
    return {};
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const url = new URL(endpoint, this.baseURL);
      
      // URLパラメータの追加
      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
          ...authHeaders,
          ...options.headers,
        },
        signal: AbortSignal.timeout(this.timeout),
      };

      // ボディの追加（GET以外）
      if (options.body && method !== 'GET') {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url.toString(), config);
      const result = await response.json();

      // バックエンドが既にApiResponse形式で返している場合
      if ('success' in result && typeof result.success === 'boolean') {
        return result as ApiResponse<T>;
      }

      // それ以外の場合はHTTPステータスに基づいて判断
      if (!response.ok) {
        return {
          success: false,
          error: result.message || result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'リクエストがタイムアウトしました',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: '予期しないエラーが発生しました',
      };
    }
  }

  // 公開メソッド
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, options);
  }

  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, options);
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }
}

// デフォルトのAPIクライアントインスタンス
export const apiClient = new ApiClient();

// カスタムAPIクライアントの作成
export const createApiClient = (config: ApiClientConfig) => new ApiClient(config);