// src/services/events-service.ts
import {
  getApiV1Events,
  getApiV1EventsByEventId,
  postApiV1Events,
} from '../api/sdk.gen';
import { apiClient } from './api-client';
import type { EventShortEntryResponse, EventShortEntry, GetEventEntry, AddEventEntry } from '@/api';

class EventsService {
  async getEvents(offset: number = 0, limit: number = 20): Promise<EventShortEntry[]> {
    const response = await getApiV1Events({
      query: { offset, limit },
      client: apiClient.getClient(),
    });

    const data = (response.data as EventShortEntryResponse).data ?? [];
    return data;
  }

  async getEventById(eventId: string): Promise<GetEventEntry> {
    const response = await getApiV1EventsByEventId({
      path: { eventId },
      client: apiClient.getClient(),
    });

    return response.data as GetEventEntry;
  }

  async createEvent(payload: AddEventEntry): Promise<EventShortEntry> {
    const response = await postApiV1Events({
      body: payload,
      client: apiClient.getClient(),
    });

    return response.data as EventShortEntry;
  }
}

export const eventsService = new EventsService();
