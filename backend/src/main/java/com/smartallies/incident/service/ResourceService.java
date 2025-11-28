package com.smartallies.incident.service;

import com.smartallies.incident.model.IncidentType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ResourceService {

    private static final Map<IncidentType, List<String>> INCIDENT_RESOURCES = new HashMap<>();

    static {
        INCIDENT_RESOURCES.put(IncidentType.HUMAN, List.of(
                "Code of Conduct: https://inside.swissquote.com/"
        ));

        INCIDENT_RESOURCES.put(IncidentType.FACILITY, List.of(
                "Maintenance Request Portal: https://company.com/maintenance",
                "Facilities Hotline: +41 XX XXX XX XX",
                "Safety Guidelines: https://company.com/safety"
        ));

        INCIDENT_RESOURCES.put(IncidentType.EMERGENCY, List.of(
                "Swiss Police: 117",
                "Swiss Ambulance: 144",
                "Swiss Fire Department: 118",
                "Company Samaritans: 143",
                "Internal Security: +41 XX XXX XX XX"
        ));
    }

    public List<String> getResourcesForIncidentType(IncidentType type) {
        log.debug("Retrieving resources for incident type: {}", type);
        return new ArrayList<>(INCIDENT_RESOURCES.getOrDefault(type, List.of()));
    }
}
