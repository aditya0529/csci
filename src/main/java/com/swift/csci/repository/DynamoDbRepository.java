package com.swift.csci.repository;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;
import com.swift.csci.model.SuppressionData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;


// Documentation of DynamoDBMapper methods:
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBMapper.Methods.html


@Repository
public class DynamoDbRepository {
    private static final Logger LOGGER = LoggerFactory.getLogger(DynamoDbRepository.class);

    @Autowired
    private DynamoDBMapper mapper;

    public SuppressionData getItem(String id, String ser_id) {
        return mapper.load(SuppressionData.class, id, ser_id);
    }

    public List<SuppressionData> listItems() {
        return mapper.scan(SuppressionData.class, new DynamoDBScanExpression());
    }

    public void deleteItem(String id, String ser_id) {
        mapper.delete(getItem(id, ser_id)); // TODO should nest functions like this?
    }

    public void updateItem(SuppressionData item) {
//        SuppressionData item = getItem(userInput.getFindingTitle(), userInput.getStandardId());
//        if (item == null) {
//            item = new SuppressionData();
//            item.setFindingTitle(finding_title);
//            item.setStandardId(standard_id);
//        }
        mapper.save(item);
    }

    public void createItem(SuppressionData item) {
        mapper.save(item);
    }
}
