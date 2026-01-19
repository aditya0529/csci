package com.swift.csci.audit;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Map;

import static net.logstash.logback.argument.StructuredArguments.v;

@Component
public class AuditEntryPublisherImpl implements AuditEntryPublisher {
    private static final String CICS_AUDIT = "cics-audit";
    private static final Logger logger = LoggerFactory.getLogger(CICS_AUDIT);

    private final AmazonS3 s3Client;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void configureObjectMapper() {
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    @Value("${audit.bucket.name:sw-csci-audit-logs-live-495854164695-eu-central-1-main-aws}")
    private String auditBucketName;

    @Value("${audit.s3.enabled:false}")
    private boolean s3Enabled;

    public AuditEntryPublisherImpl(AmazonS3 s3Client) {
        this.s3Client = s3Client;
    }
    @Override
    public void publish(AuditLogEntry<?> entry) {

        // To Cloudwatch
        System.out.println("Audit-Logger : writing to cloudwatch");
        logger.info(CICS_AUDIT,
                v("@timestamp", entry.getTime()),
                v("security control", entry.getSecurityControlId()),
                v("ser", entry.getSerId()),
                v("action", entry.getAction()),
                v("by", entry.getUserProfile().getDisplayName()),
                v("email", entry.getUserProfile().getEmail()),
                v("changes", entry.getContent())
        );

        if (s3Enabled) {
            // To S3 in LogArchive Account
            System.out.println("Audit-Logger : writing to s3");
            try {
                String json = objectMapper.writeValueAsString(Map.of(
                        "timestamp", entry.getTime(),
                        "securityControlId", entry.getSecurityControlId(),
                        "serId", entry.getSerId(),
                        "action", entry.getAction(),
                        "user", entry.getUserProfile(),
                        "changes", entry.getContent()
                ));
                String key = String.format("%s/%s/%s.json",
                        entry.getSerId(),
                        entry.getSecurityControlId(),
                        DateTimeFormatter.ISO_INSTANT.format(entry.getTime().atZone(ZoneOffset.UTC).toInstant())
                );
                byte[] jsonBytes = json.getBytes(StandardCharsets.UTF_8);
                MessageDigest md = MessageDigest.getInstance("MD5");
                byte[] md5Digest = md.digest(jsonBytes);
                String base64Md5 = Base64.getEncoder().encodeToString(md5Digest);


                ObjectMetadata metadata = new ObjectMetadata();
                metadata.setContentLength(jsonBytes.length);
                metadata.setContentType("application/json");
                metadata.setContentMD5(base64Md5);

                ByteArrayInputStream input = new ByteArrayInputStream(jsonBytes);
                s3Client.putObject(auditBucketName, key, input, metadata);
            } catch (Exception e) {
                logger.error("Failed to upload audit log to S3", e);
            }
        }
    }
}
