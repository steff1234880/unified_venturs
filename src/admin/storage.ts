import { isLocalAdminMode } from '@/admin/auth/mode'
import * as localStorageApi from '@/admin/api/local-storage'
import * as supabaseApi from '@/admin/api/storage'

function getApi() {
  return isLocalAdminMode() ? localStorageApi : supabaseApi
}

export const addContactMessage = (...args: Parameters<typeof supabaseApi.addContactMessage>) =>
  getApi().addContactMessage(...args)

export const createItem = (...args: Parameters<typeof supabaseApi.createItem>) =>
  getApi().createItem(...args)

export const deleteItem = (...args: Parameters<typeof supabaseApi.deleteItem>) =>
  getApi().deleteItem(...args)

export const deleteMessage = (...args: Parameters<typeof supabaseApi.deleteMessage>) =>
  getApi().deleteMessage(...args)

export const fetchCollection = (...args: Parameters<typeof supabaseApi.fetchCollection>) =>
  getApi().fetchCollection(...args)

export const getDashboardStats = (...args: Parameters<typeof supabaseApi.getDashboardStats>) =>
  getApi().getDashboardStats(...args)

export const markMessageRead = (...args: Parameters<typeof supabaseApi.markMessageRead>) =>
  getApi().markMessageRead(...args)

export const updateItem = (...args: Parameters<typeof supabaseApi.updateItem>) =>
  getApi().updateItem(...args)

export { uploadImage, deleteImage } from './api/upload'
