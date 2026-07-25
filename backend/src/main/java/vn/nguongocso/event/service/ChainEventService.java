package vn.nguongocso.event.service;


import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.event.dto.request.CorrectPackagingEventRequest;
import vn.nguongocso.event.dto.request.RecordHarvestEventRequest;
import vn.nguongocso.event.dto.request.RecordPackagingEventRequest;
import vn.nguongocso.event.dto.response.ChainEventResponse;

import java.util.UUID;

public interface ChainEventService {
    ChainEventResponse recordHarvestEvent(RecordHarvestEventRequest request, CustomUserDetails currentUser);
    ChainEventResponse recordPackagingEvent(RecordPackagingEventRequest request, CustomUserDetails currentUser);
    ChainEventResponse correctPackagingEvent(UUID originalEventId, CorrectPackagingEventRequest request, CustomUserDetails currentUser);
}

