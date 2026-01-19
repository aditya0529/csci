package com.swift.csci.model;


import com.amazonaws.services.dynamodbv2.datamodeling.*;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

// Documentation of annotations:
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBMapper.Annotations.html


@DynamoDBTable(tableName = "sw-securityhub-suppression-ser-db-v2-main-aws") // TODO avoid hardcoding
public class SuppressionData implements Serializable {
    private static final Logger LOGGER = LoggerFactory.getLogger(SuppressionData.class);

    @Serial
    private static final long serialVersionUID = 1L;
    @NotNull
    private String id = "";
    @NotNull
    private String ser_id = "";
    private String finding_title = "";

    private String findingType = "";

    private String product_name = "";
    private String ser_link = "";
    private String due_date = "";
    private String description = "";
    private String account_exception = "";
    private String account_inclusion = "";
    private String from_severity = "";
    private String to_severity = "";
    private String resource_type = "";
    private String resource_pattern = "";
    private String extra_resource_pattern = "";



    // attributeName was added to avoid the following error: com.amazonaws.services.dynamodbv2.model.AmazonDynamoDBException: One of the required keys was not given a value (Service: AmazonDynamoDBv2; Status Code: 400; Error Code: ValidationException;
    @DynamoDBHashKey(attributeName = "id") // partition key of table
    public String getId() {
        LOGGER.debug("Getting existing Id of item: " + this.id);
        return id;
    }
    public void setId(String id) {
        LOGGER.debug("Setting new Id of item: " + id);
        this.id = id;
    }
    @DynamoDBRangeKey(attributeName = "ser_id") // sort key of table
    public String getSerId() {
        return ser_id;
    }

    public void setSerId(String ser_id) {
        this.ser_id = ser_id;
    }

    @DynamoDBAttribute(attributeName = "finding_title")
    public String getFindingTitle() {
        return finding_title;
    }

    @DynamoDBAttribute(attributeName = "finding_type")
    public String getFindingType() {
        return findingType;
    }

    public void setFindingType(String findingType) {
        this.findingType = findingType;
    }

    public void setFindingTitle(String finding_title) {
        this.finding_title = finding_title;
    }

    @DynamoDBAttribute(attributeName = "product_name")
    public String getProductName() {
        return product_name;
    }

    public void setProductName(String product_name) {
        this.product_name = product_name;
    }

    @DynamoDBAttribute(attributeName = "account_exception")
    public String getAccountException() {
        return account_exception;
    }

    public void setAccountException(String account_exception) {
        this.account_exception = account_exception;
    }

    @DynamoDBAttribute(attributeName = "account_inclusion")
    public String getAccountInclusion() {
        return account_inclusion;
    }

    public void setAccountInclusion(String account_inclusion) {
        this.account_inclusion = account_inclusion;
    }

    @DynamoDBAttribute(attributeName = "resource_type")
    public String getResourceType() {
        return resource_type;
    }

    public void setResourceType(String resource_type) {
        this.resource_type = resource_type;
    }

    @DynamoDBAttribute(attributeName = "extra_resource_pattern")
    public String getExtraResourcePattern() {
        return extra_resource_pattern;
    }

    public void setExtraResourcePattern(String extra_resource_pattern) {
        this.extra_resource_pattern = extra_resource_pattern;
    }

    @DynamoDBAttribute(attributeName = "from_severity")
    public String getFromSeverity() {
        return from_severity;
    }

    public void setFromSeverity(String from_severity) {
        this.from_severity = from_severity;
    }

    @DynamoDBAttribute(attributeName = "resource_pattern")
    public String getResourcePattern() {
        return resource_pattern;
    }

    public void setResourcePattern(String resource_pattern) {
        this.resource_pattern = resource_pattern;
    }

    @DynamoDBAttribute(attributeName = "ser_link")
    public String getSerLink() {
        return ser_link;
    }

    public void setSerLink(String ser_link) {
        this.ser_link = ser_link;
    }

    @DynamoDBAttribute(attributeName = "to_severity")
    public String getToSeverity() {
        return to_severity;
    }

    public void setToSeverity(String to_severity) {
        this.to_severity = to_severity;
    }

    @DynamoDBAttribute(attributeName = "due_date")
    public String getDueDate() {
        return due_date;
    }

    public void setDueDate(String due_date) {
        this.due_date = due_date;
    }

    @DynamoDBAttribute(attributeName = "description")
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString()
    {
        return "Id : " + this.id + " | " + "ser_id: " + this.ser_id;
    }

    @Override
    public boolean equals(final Object obj)
    {
        if (obj == this)
            return true;

        if (!(obj instanceof SuppressionData otherObj))
            return false;

        return Objects.equals(this.id, otherObj.id) &&
                Objects.equals(this.ser_id, otherObj.ser_id) &&
                Objects.equals(this.finding_title, otherObj.finding_title) &&
                Objects.equals(this.product_name, otherObj.product_name) &&
                Objects.equals(this.ser_link, otherObj.ser_link) &&
                Objects.equals(this.due_date, otherObj.due_date) &&
                Objects.equals(this.description, otherObj.description) &&
                Objects.equals(this.account_exception, otherObj.account_exception) &&
                Objects.equals(this.account_inclusion, otherObj.account_inclusion) &&
                Objects.equals(this.from_severity, otherObj.from_severity) &&
                Objects.equals(this.to_severity, otherObj.to_severity) &&
                Objects.equals(this.resource_type, otherObj.resource_type) &&
                Objects.equals(this.resource_pattern, otherObj.resource_pattern) &&
                Objects.equals(this.extra_resource_pattern, otherObj.extra_resource_pattern);
    }

}