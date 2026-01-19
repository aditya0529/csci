package com.swift.csci.audit;

import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;

@FunctionalInterface
@Validated
public interface AuditEntryPublisher {

    void publish(@Valid AuditLogEntry<?> entry);
}
