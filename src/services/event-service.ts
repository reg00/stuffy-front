// src/services/events-service.ts
import {
  deleteApiV1EventsByEventId,
  getApiV1Events,
  getApiV1EventsByEventId,
  patchApiV1EventsByEventId,
  patchApiV1EventsByEventIdPhoto,
  postApiV1Events,
} from '../api/sdk.gen';
import { apiClient } from './api-client';
import type { EventShortEntryResponse, EventShortEntry, GetEventEntry, AddEventEntry, UpdateEventEntry } from '../api';

class EventsService {
  async getEvents(offset: number = 0, limit: number = 20): Promise<EventShortEntry[]> {
    const response = await getApiV1Events({
      query: { offset, limit, isActive: true },
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

  async editEvent(eventId: string, event: UpdateEventEntry): Promise<EventShortEntry> {
    const response = await patchApiV1EventsByEventId({
      path: {eventId},
      body: event,
      client: apiClient.getClient(),
    });

    if(response.data)
      return response.data as EventShortEntry;
        
    throw response.error
  }

  async editEventAvatar(eventId: string, file: File) {
    const response = await patchApiV1EventsByEventIdPhoto({
      path: {eventId},
      body: { file },
      client: apiClient.getClient(),
    });
    
    if (response.data)
      return response.data as EventShortEntry;
    
    throw response.error
  }

  async deleteApiV1EventsByEventId(eventId: string) {
    const response = await deleteApiV1EventsByEventId({
      path: { eventId },
      client: apiClient.getClient(),
    });

    if(response.error)
      throw response.error
  }
}

export const eventsService = new EventsService();
