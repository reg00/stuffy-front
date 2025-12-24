// src/services/debt-service.ts
import {
  getApiV1EventsByEventIdDebts,
  getApiV1EventsByEventIdDebtsByDebtId,
  postApiV1EventsByEventIdDebtsByDebtIdConfirm,
  postApiV1EventsByEventIdDebtsByDebtIdSend,
} from '../api/sdk.gen';
import { apiClient } from './api-client';
import type { GetDebtEntry, GetDebtEntryResponse } from '../api';

class DebtsService {
  async getEventDebts(
    eventId: string,
    offset?: number,
    limit?: number,
  ): Promise<GetDebtEntryResponse> {
    const response = await getApiV1EventsByEventIdDebts({
      path: { eventId },
      query: { offset, limit },
      client: apiClient.getClient(),
    });

    if (response.data) return response.data as GetDebtEntryResponse;
    throw response.error;
  }

  async getEventDebtById(eventId: string, debtId: string): Promise<GetDebtEntry> {
    const response = await getApiV1EventsByEventIdDebtsByDebtId({
      path: { eventId, debtId },
      client: apiClient.getClient(),
    });

    if (response.data) return response.data as GetDebtEntry;
    throw response.error;
  }

  async sendEventDebt(eventId: string, debtId: string): Promise<void> {
    const response = await postApiV1EventsByEventIdDebtsByDebtIdSend({
      path: { eventId, debtId },
      client: apiClient.getClient(),
    });

    if (response.error) throw response.error;
  }

  async confirmEventDebt(eventId: string, debtId: string): Promise<void> {
    const response = await postApiV1EventsByEventIdDebtsByDebtIdConfirm({
      path: { eventId, debtId },
      client: apiClient.getClient(),
    });

    if (response.error) throw response.error;
  }
}

export const debtsService = new DebtsService();
