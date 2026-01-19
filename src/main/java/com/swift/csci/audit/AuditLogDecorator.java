package com.swift.csci.audit;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.util.ISO8601DateFormat;
import net.logstash.logback.decorate.JsonFactoryDecorator;

public class AuditLogDecorator implements JsonFactoryDecorator {

    @Override
    public JsonFactory decorate(JsonFactory factory) {
        final ObjectMapper codec = (ObjectMapper) factory.getCodec();
        codec.setDateFormat(new ISO8601DateFormat());
        return factory;
    }
}
