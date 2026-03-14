import axios from 'axios';
import { supabase } from './supabase';
import { isMockMode } from './mockMode';
import {
  getMockBriques,
  getMockBriqueById,
  addMockBrique,
  updateMockBrique,
  deleteMockBrique,
  getMockDashboardStats,
} from './mockData';
import type { BriqueStatus } from '../types/brique';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

if (!isMockMode) {
  api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  });
}

async function mockRequest<T>(handler: () => T): Promise<{ data: T }> {
  await new Promise((r) => setTimeout(r, 200));
  return { data: handler() };
}

const originalGet = api.get.bind(api);
const originalPost = api.post.bind(api);
const originalPatch = api.patch.bind(api);
const originalDelete = api.delete.bind(api);

if (isMockMode) {
  (api as any).get = async function (url: string, config?: { params?: Record<string, string> }) {
    const params = config?.params ?? {};
    if (url === '/dashboard/stats') {
      return mockRequest(() => getMockDashboardStats(params.period || '7d'));
    }
    if (url === '/briques') {
      return mockRequest(() =>
        getMockBriques({
          status: params.status as BriqueStatus | undefined,
          origin: params.origin,
        })
      );
    }
    const match = url.match(/^\/briques\/([^/]+)$/);
    if (match) {
      const b = getMockBriqueById(match[1]);
      if (!b) throw new Error('Not found');
      return mockRequest(() => b);
    }
    return originalGet(url, config as any);
  };

  (api as any).post = async function (url: string, body?: any) {
    if (url === '/briques') {
      return mockRequest(() =>
        addMockBrique({
          title: body.title,
          purchaseValue: body.purchaseValue,
          saleValue: body.saleValue,
          status: body.status,
          origin: body.origin ?? null,
          phone: body.phone ?? null,
          socialMedia: body.socialMedia ?? null,
          notes: body.notes ?? null,
          entryDate: body.entryDate ?? new Date().toISOString().slice(0, 10),
          exitDate: body.exitDate ?? null,
          invoiceUrl: body.invoiceUrl ?? null,
        })
      );
    }
    const match = url.match(/^\/briques\/([^/]+)\/images$/);
    if (match && body?.imageUrl) {
      const b = getMockBriqueById(match[1]);
      if (!b) throw new Error('Not found');
      const images = [...(b.images ?? [])];
      images.push({
        id: crypto.randomUUID?.() ?? 'img-1',
        briqueId: match[1],
        imageUrl: body.imageUrl,
        createdAt: new Date().toISOString(),
      });
      updateMockBrique(match[1], { images });
      return mockRequest(() => ({ id: images[images.length - 1].id }));
    }
    return originalPost(url, body);
  };

  (api as any).patch = async function (url: string, body?: any) {
    const match = url.match(/^\/briques\/([^/]+)$/);
    if (match) {
      const updated = updateMockBrique(match[1], body);
      if (!updated) throw new Error('Not found');
      return mockRequest(() => updated);
    }
    return originalPatch(url, body);
  };

  (api as any).delete = async function (url: string) {
    const match = url.match(/^\/briques\/([^/]+)$/);
    if (match) {
      const ok = deleteMockBrique(match[1]);
      if (!ok) throw new Error('Not found');
      return mockRequest(() => ({}));
    }
    return originalDelete(url);
  };
}

export default api;
