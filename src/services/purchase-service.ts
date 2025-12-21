import { AddPurchaseEntry, deleteApiV1EventsByEventIdPurchasesByPurchaseId, getApiV1EventsByEventIdPurchasesByPurchaseId, GetPurchaseEntry, patchApiV1EventsByEventIdPurchasesByPurchaseId, postApiV1EventsByEventIdPurchases, PurchaseShortEntry, UpdatePurchaseEntry } from '../api';
import { apiClient } from './api-client';

class PurchasesService {
  async getPurchaseById(eventId: string, purchaseId: string) {
    const response = await getApiV1EventsByEventIdPurchasesByPurchaseId({
        path: {eventId, purchaseId},
        client: apiClient.getClient(),
    });

    if(response.data)
          return response.data as GetPurchaseEntry;
    
    throw response.error
  }

  async createPurchase(eventId: string, purchase: AddPurchaseEntry) {
    const response = await postApiV1EventsByEventIdPurchases({
        path: {eventId},
        body: purchase,
        client: apiClient.getClient(),
    });

    if(response.data)
          return response.data as PurchaseShortEntry;
    
    throw response.error
  }

  async editPurchaseById(eventId: string, purchaseId: string, purchase: UpdatePurchaseEntry) {
    const response = await patchApiV1EventsByEventIdPurchasesByPurchaseId({
        path: {eventId, purchaseId},
        body: purchase,
        client: apiClient.getClient(),
    });

    if(response.data)
          return response.data as PurchaseShortEntry;
    
    throw response.error
  }

  async deletePurchaseById(eventId: string, purchaseId: string) {
    const response = await deleteApiV1EventsByEventIdPurchasesByPurchaseId({
        path: {eventId, purchaseId},
        client: apiClient.getClient(),
    });

    if(response.error)
      throw response.error
  }
}

export const purchaseService = new PurchasesService();