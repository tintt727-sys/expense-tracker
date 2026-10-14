const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  isAdmin?: boolean;
}

export const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { isAdmin, headers: customHeaders, ...restOptions } = options;

  const token = isAdmin
    ? localStorage.getItem('adminToken')
    : localStorage.getItem('userToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders as Record<string, string>)
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    headers,
    ...restOptions
  });

  if (response.status === 401) {
    if (isAdmin) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    } else {
      localStorage.removeItem('userToken');
      localStorage.removeItem('currentUser');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    const blob = await response.blob();
    return blob as unknown as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
};

export const api = {
  get: <T>(endpoint: string, isAdmin = false) =>
    request<T>(endpoint, { method: 'GET', isAdmin }),
  post: <T>(endpoint: string, body: any, isAdmin = false) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), isAdmin }),
  put: <T>(endpoint: string, body: any, isAdmin = false) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), isAdmin }),
  delete: <T>(endpoint: string, isAdmin = false) =>
    request<T>(endpoint, { method: 'DELETE', isAdmin }),
  downloadCsv: async (endpoint: string): Promise<void> => {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to download CSV');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  downloadBackup: async (): Promise<void> => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin/database/backup`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to download database backup');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};
