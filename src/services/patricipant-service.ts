import { deleteApiV1EventsByEventIdParticipantsByParticipantId, getApiV1EventsByEventIdParticipants, getApiV1EventsByEventIdParticipantsByParticipantId, GetParticipantEntry, ParticipantShortEntry, ParticipantShortEntryResponse, postApiV1EventsByEventIdParticipants, UpsertParticipantEntry } from "../api";
import { apiClient } from "./api-client";


class ParticipantService {
  async getPartcipants(eventId: string, offset: number | undefined, limit: number | undefined, userId: string | undefined ) {
    const response = await getApiV1EventsByEventIdParticipants({
      path: {eventId},
      query: {offset, limit, userId},
      client: apiClient.getClient(),
    })

    if(response.data)
      return response.data as ParticipantShortEntryResponse;

    throw response.error
  }

  async getParticipantById(eventId: string, participantId: string) {
    const response = await getApiV1EventsByEventIdParticipantsByParticipantId({
        path: {eventId, participantId},
        client: apiClient.getClient(),
    });

    if(response.data)
      return response.data as GetParticipantEntry;

    throw response.error
  }

  async createParticipant(eventId: string, participant: UpsertParticipantEntry) {
    const response = await postApiV1EventsByEventIdParticipants({
        path: {eventId},
        body: participant,
        client: apiClient.getClient(),
    });

    if(response.data)
      return response.data as ParticipantShortEntry;

    throw response.error
  }

  async deleteParticipant(eventId: string, participantId: string) {
    const response = await deleteApiV1EventsByEventIdParticipantsByParticipantId({
        path: {eventId, participantId},
        client: apiClient.getClient(),
    });

    if(response.error)
      throw response.error
  }
}

export const participantService = new ParticipantService();