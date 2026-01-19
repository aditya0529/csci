package com.swift.csci.audit;

import com.swift.csci.security.UserProfile;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;

import java.time.LocalDateTime;

public class AuditLogEntry<T> {
    @NotNull
    private final Action action;
    @NotNull
    private final UserProfile userProfile;
    @NotNull
    private final T content;
    @NotNull
    private final LocalDateTime time;

    @NotNull
    private String serId;

    @NotNull
    private String securityControlId;


    public Action getAction() {
        return action;
    }

    public UserProfile getUserProfile() {
        return userProfile;
    }

    public T getContent() {
        return content;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public String getSerId() {
        return serId;
    }

    public String getSecurityControlId() {
        return securityControlId;
    }

    public static <T> AuditLogEntry<T> create(Action action, String securityControlId, String serId, T content) {
        return new AuditLogEntry<>(action, securityControlId, serId, content, LocalDateTime.now());
    }
    private AuditLogEntry(Action action, String securityControlId, String serId, T content, LocalDateTime time) {
        this.securityControlId = securityControlId;
        this.serId = serId;
        this.action = action;
        this.content = content;
        this.time = time;
        this.userProfile = new UserProfile((Saml2AuthenticatedPrincipal)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }
}
