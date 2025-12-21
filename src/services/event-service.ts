// src/services/events-service.ts
import {
  getApiV1Events,
  getApiV1EventsByEventId,
  postApiV1Events,
} from '../api/sdk.gen';
import { apiClient } from './api-client';
import type { EventShortEntryResponse, EventShortEntry, GetEventEntry, AddEventEntry } from '../api';

class EventsService {
  async getEvents(offset: number = 0, limit: number = 20): Promise<EventShortEntry[]> {
    const response = await getApiV1Events({
      query: { offset, limit },
      client: apiClient.getClient(),
    });

    if(response.data)
      return (response.data as EventShortEntryResponse).data ?? [];
        
    throw response.error
  }

  async getEventById(eventId: string): Promise<GetEventEntry> {
    const response = await getApiV1EventsByEventId({
      path: { eventId },
      client: apiClient.getClient(),
    });

    if(response.data)
      return response.data as GetEventEntry;
        
    throw response.error
  }

  async createEvent(payload: AddEventEntry): Promise<EventShortEntry> {
    const response = await postApiV1Events({
      body: payload,
      client: apiClient.getClient(),
    });

    if(response.data)
      return response.data as EventShortEntry;
        
    throw response.error
  }
}

export const eventsService = new EventsService();
