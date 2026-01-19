package com.swift.csci.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class UserProfile implements java.io.Serializable {

    private static final String DN_SAML_ATTRIBUTE = "http://schemas.microsoft.com/identity/claims/displayname";
    private static final String EMAIL_SAML_ATTRIBUTE = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

    private static final String readOnlyUsersEntitlementName = "GS_AADMGMT_AWSCSCI_Readonly_Users";
    private static final String adminsEntitlementName = "GS_AADMGMT_AWSCSCI_Admins";

    private final String displayName;
    private final String email;
    private final List<String> groups;

    private final String displayGroup;

    private boolean isAdmin = false;


    public UserProfile(Saml2AuthenticatedPrincipal principal) {
        this.groups = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        this.displayName = (String) Objects.requireNonNull(principal.getAttribute(DN_SAML_ATTRIBUTE))
                .stream().findFirst().orElse("NA");
        this.email = (String) Objects.requireNonNull(principal.getAttribute(EMAIL_SAML_ATTRIBUTE))
                .stream().findFirst().orElse("NA");
        if(this.groups.contains(adminsEntitlementName)) {
            isAdmin = true;
            this.displayGroup = "Admin";
        }
        else if(this.groups.contains(readOnlyUsersEntitlementName)) {
            this.displayGroup = "Readonly";
        }
        else {
            this.displayGroup = null;
        }
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmail() {
        return email;
    }

    public List<String> getGroups() {
        return groups;
    }

    public String getDisplayGroup() { return displayGroup; }

    public boolean isAdmin() {
        return isAdmin;
    }


    @Override
    public String toString() {
        return "UserProfile{" +
                "displayName='" + displayName + '\'' +
                ", email='" + email + '\'' +
                ", groups=" + groups + '\'' +
                ", displayGroup= " + displayGroup + '\'' +
                ", isAdmin=" + isAdmin +
                '}';
    }
}
