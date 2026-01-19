package com.swift.csci.controllers;

import com.azure.core.annotation.QueryParam;
import com.swift.csci.audit.AuditEntryPublisher;
import com.swift.csci.audit.AuditLogEntry;
import com.swift.csci.audit.AuditUtils;
import com.swift.csci.exception.DynamoDBException;
import com.swift.csci.model.SuppressionData;
import com.swift.csci.repository.DynamoDbRepository;
import com.swift.csci.security.UserProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
import org.springframework.web.bind.annotation.*;
import static com.swift.csci.audit.Action.*;
import static com.swift.csci.audit.AuditUtils.*;
import java.util.*;

// Documentation of REST-related annotations:
// https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/package-summary.html
// https://www.java67.com/2019/04/top-10-spring-mvc-and-rest-annotations-examples-java.html


@RestController
@RequestMapping("/")
public class Controller {
    private static final Logger LOGGER = LoggerFactory.getLogger(Controller.class);

    private final DynamoDbRepository dynamoDbRepository;
    private final AuditEntryPublisher auditEntryPublisher;

    @Autowired
    public Controller(DynamoDbRepository dynamoDbRepository, AuditEntryPublisher auditEntryPublisher) {
        this.dynamoDbRepository = dynamoDbRepository;
        this.auditEntryPublisher = auditEntryPublisher;
    }




    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {

        LOGGER.trace("Health check");
        return new ResponseEntity<>("Health check!", HttpStatus.OK);
    }
    @GetMapping(value = "/samlInfo", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> samlInfo(@AuthenticationPrincipal Saml2AuthenticatedPrincipal authenticatedPrincipal) {
        try {
            LOGGER.info("Getting SAML info...");
            HashMap<String, Object> samlInfoResponse = new HashMap<>();

            String principalName = authenticatedPrincipal.getName();
            String principalDisplayName = Objects.requireNonNull(authenticatedPrincipal.getAttribute("http://schemas.microsoft.com/identity/claims/displayname")).toString();
            String principalGroupList = Objects.requireNonNull(authenticatedPrincipal.getAttribute("http://schemas.microsoft.com/ws/2008/06/identity/claims/groups")).toString();
            String principalAttributeMap = authenticatedPrincipal.getAttributes().toString();

            String[] principalDisplayNameSplit =  principalDisplayName.replace("[","").replace("]","").split(",");
            principalDisplayName = principalDisplayNameSplit[0];

            samlInfoResponse.put("principalName", principalName);
            samlInfoResponse.put("principalDisplayName", principalDisplayName);
            samlInfoResponse.put("principalGroupList", principalGroupList);
            samlInfoResponse.put("principalAttributeMap", principalAttributeMap);

            LOGGER.debug("Principal name: " + principalName);
            LOGGER.debug("Principal group list: " + principalGroupList);
            LOGGER.debug("Principal attribute map: " + principalAttributeMap);

            LOGGER.info("SAML info logged for current user");
            return new ResponseEntity<>(samlInfoResponse, HttpStatus.OK);
        }
        catch (Exception e)
        {
            LOGGER.error("Unable to provide SAML information.");
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping(value = "/userProfile")
    public ResponseEntity<UserProfile> userProfile(@AuthenticationPrincipal Saml2AuthenticatedPrincipal authenticatedPrincipal) {
        try{
            LOGGER.info("Getting user profile...");
            return new ResponseEntity<>(new UserProfile(authenticatedPrincipal), HttpStatus.OK);
        }
        catch (Exception e)
        {
            LOGGER.error("Unable to provide user profile information.");
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/getItem")
    public ResponseEntity<SuppressionData> getItem(@RequestParam String id, @RequestParam String serId) {
        try {
            LOGGER.info("Getting item with id: " + id + " and ser id: " + serId + "...");
            SuppressionData item = dynamoDbRepository.getItem(id, serId);
            if(item != null)
            {
                LOGGER.info("Got item with data: " + item.toString());
                return new ResponseEntity<>(item, HttpStatus.OK);
            }
            else
            {
                LOGGER.info("Item not found!");
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to get item.");
            throw new DynamoDBException("Failed to get item.", e);
        }
    }

    @GetMapping("/listItems")
    public ResponseEntity<List<SuppressionData>> listItems() {
        try {
            LOGGER.info("Listing all items...");
            List<SuppressionData> items = dynamoDbRepository.listItems();
            if(items != null)
            {
                List<SuppressionData> sortedList = new ArrayList<>(items);
                sortedList.sort(Comparator.comparing(SuppressionData::getId)); // sort by id
                LOGGER.info("Listing and sorting of items successful.");
                return new ResponseEntity<>(sortedList, HttpStatus.OK);
            }
            else
            {
                LOGGER.info("No items found.");
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

        } catch (Exception e) {
            LOGGER.error("Failed to list items.");
            throw new DynamoDBException("Failed to list items.", e);
        }
    }

    @DeleteMapping("/deleteItem")
    public ResponseEntity<String> deleteItem(@RequestParam String id, @RequestParam String serId) {
        try {
            LOGGER.info("Deleting item with finding title: " + id + " and ser id: " + serId + " ...");
            SuppressionData item = dynamoDbRepository.getItem(id, serId);
            if(item != null)
            {
                dynamoDbRepository.deleteItem(id, serId);
                auditEntryPublisher.publish(AuditLogEntry.create(DELETE, id, serId, computeDiffs(item, null, DELETE)));
                LOGGER.info("Deleted item with data: " + item.toString());
                return new ResponseEntity<>("Deleted item with data: " + item.toString(), HttpStatus.OK);
            }
            else
            {
                LOGGER.info("Item not found! Nothing to delete.");
                return new ResponseEntity<>("Item not found! Nothing to delete.", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to delete item.");
            throw new DynamoDBException("Failed to delete item.", e);
        }
    }

    @PutMapping("/updateItem")
    public ResponseEntity<String> updateItem(@RequestBody SuppressionData user_input) {
        try {
            LOGGER.info("Updating item with data: " + user_input.toString() + "...");
            if(user_input.getSerId() == null || Objects.equals(user_input.getSerId(), ""))
            {
                LOGGER.error("A SER Id (ser_id field) is required.");
                return new ResponseEntity<>("Cannot update item which is missing a SER Id.", HttpStatus.BAD_REQUEST);
            }
            if(user_input.getSerLink() == null || Objects.equals(user_input.getSerLink(), ""))
            {
                LOGGER.error("A SER link (ser_link field) is required.");
                return new ResponseEntity<>("Cannot update item which is missing a SER link.", HttpStatus.BAD_REQUEST);
            }
            if(user_input.getFindingTitle() == null || Objects.equals(user_input.getFindingTitle(), ""))
            {
                LOGGER.error("A finding title (finding_title field) is required.");
                return new ResponseEntity<>("Cannot update item which is missing a finding title.", HttpStatus.BAD_REQUEST);
            }
            if(user_input.getProductName() == null || Objects.equals(user_input.getProductName(), ""))
            {
                LOGGER.error("A Product Name (product_name field) is required.");
                return new ResponseEntity<>("Cannot update item which is missing a product name.", HttpStatus.BAD_REQUEST);
            }
            if(user_input.getDueDate() == null || Objects.equals(user_input.getDueDate(), ""))
            {
                LOGGER.error("A due date (due_date field) is required.");
                return new ResponseEntity<>("Cannot update item which is missing a due date.", HttpStatus.BAD_REQUEST);
            }
            SuppressionData item = dynamoDbRepository.getItem(user_input.getId(), user_input.getSerId());
            if(item != null)
            {
                if(user_input.equals(item))
                {
                    LOGGER.error("Input contains no changes.");
                    return new ResponseEntity<>("Input contains no changes.", HttpStatus.BAD_REQUEST);
                }
                else {
                    if(user_input.getProductName().equalsIgnoreCase("Inspector")) {
                        user_input.setFindingType("Vulnerabilities");
                    } else if(user_input.getProductName().equalsIgnoreCase("Security Hub")){
                        user_input.setFindingType("Industry and Regulatory Standards");
                    }
                    dynamoDbRepository.updateItem(user_input);
                    auditEntryPublisher.publish(AuditLogEntry.create(UPDATE, user_input.getId(), user_input.getSerId(), computeDiffs(item, user_input, UPDATE)));
                    LOGGER.info("Updated item with data: " + user_input.toString());
                    return new ResponseEntity<>("Updated item with data: " + user_input.toString(), HttpStatus.OK);
                }

            }
            else
            {
                LOGGER.info("Item not found! Nothing to update!");
                return new ResponseEntity<>("Item not found! Nothing to update!", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to update item.");
            throw new DynamoDBException("Failed to update item.", e);
        }
    }

    @PostMapping("/createItem")
    public ResponseEntity<String> createItem(@RequestBody SuppressionData user_input) {
        try {
            LOGGER.info("Creating item with data: " + user_input.toString() + "...");
            if(user_input.getSerLink() == null || Objects.equals(user_input.getSerLink(), ""))
            {
                LOGGER.error("A SER link (ser_link field) is required.");
                return new ResponseEntity<>("Cannot create item which is missing a SER link.", HttpStatus.BAD_REQUEST);
            }
            if(user_input.getProductName() == null || Objects.equals(user_input.getProductName(), ""))
            {
                LOGGER.error("A ProductName (product_name field) is required.");
                return new ResponseEntity<>("Cannot create item which is missing a ProductName.", HttpStatus.BAD_REQUEST);
            }

            SuppressionData item = dynamoDbRepository.getItem(user_input.getId(), user_input.getSerId());
            if(item != null)
            {
                LOGGER.error("Cannot create item which already exists.");
                return new ResponseEntity<>("Cannot create item which already exists.", HttpStatus.BAD_REQUEST);
            }
            else {
                System.out.println("Product Name is " + user_input.getProductName());
                if(user_input.getProductName().equalsIgnoreCase("Inspector")) {
                    user_input.setFindingType("Vulnerabilities");
                } else if(user_input.getProductName().equalsIgnoreCase("Security Hub")){
                    user_input.setFindingType("Industry and Regulatory Standards");
                }
                dynamoDbRepository.createItem(user_input);
                auditEntryPublisher.publish(AuditLogEntry.create(CREATE, user_input.getId(), user_input.getSerId(), computeDiffs(null, user_input, CREATE)));
                LOGGER.info("Created item with data: " + user_input.toString());
                return new ResponseEntity<>("Created item with data: " + user_input.toString(), HttpStatus.OK);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to create item.");
            throw new DynamoDBException("Failed to create item.", e);
        }
    }
}