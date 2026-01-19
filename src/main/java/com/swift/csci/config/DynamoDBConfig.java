package com.swift.csci.audit;

import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

public class AuditUtils {

    public static Map<String, Object> computeDiffs(Object oldObj, Object newObj, Action action) {
        Map<String, Object> changes = new LinkedHashMap<>();

        Class<?> clazz = (newObj != null) ? newObj.getClass() :
                (oldObj != null) ? oldObj.getClass() : null;

        if (clazz == null) return changes;

        for (Method method : clazz.getMethods()) {
            if (isGetter(method)) {
                try {
                    String field = getFieldName(method);
                    Object oldVal = (oldObj != null) ? method.invoke(oldObj) : null;
                    Object newVal = (newObj != null) ? method.invoke(newObj) : null;

                    switch (action) {
                        case CREATE:
                            if (newVal != null) {
                                changes.put(field, Map.ofEntries(
                                        Map.entry("old value", "null"),
                                        Map.entry("new value", newVal)
                                ));
                            }
                            break;
                        case DELETE:
                            if (oldVal != null) {
                                changes.put(field, Map.ofEntries(
                                        Map.entry("old value", oldVal),
                                        Map.entry("new value", "null")
                                ));
                            }
                            break;
                        case UPDATE:
                            if (!Objects.equals(oldVal, newVal)) {
                                assert oldVal != null;
                                assert newVal != null;
                                changes.put(field, Map.ofEntries(
                                        Map.entry("old value", oldVal),
                                        Map.entry("new value", newVal)
                                ));
                            }
                            break;
                    }

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        return changes;
    }

    private static boolean isGetter(Method method) {
        return method.getName().startsWith("get") &&
                method.getParameterCount() == 0 &&
                !method.getName().equals("getClass");
    }

    private static String getFieldName(Method getter) {
        String name = getter.getName().substring(3);
        return Character.toLowerCase(name.charAt(0)) + name.substring(1);
    }


}

package com.swift.csci.config;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.STSAssumeRoleSessionCredentialsProvider;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.securitytoken.AWSSecurityTokenService;
import com.amazonaws.services.securitytoken.AWSSecurityTokenServiceClientBuilder;
import com.swift.csci.exception.DynamoDBException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DynamoDBConfig {
    private static final Logger LOGGER = LoggerFactory.getLogger(DynamoDBConfig.class);

    // https://docs.aws.amazon.com/sdkref/latest/guide/feature-container-credentials.html
    boolean isRunningInContainer = (System.getenv("AWS_CONTAINER_CREDENTIALS_RELATIVE_URI") != null);

    @Value("${testing.dynamodb.accessKey:test}")
    private String localDatabaseAccessKeyForTesting;
    @Value("${testing.dynamodb.secretKey:test}")
    private String localDatabaseSecretKeyForTesting;

    @Value("${testing.dynamodb.endpoint:http://localhost:8000}")
    private String awsDynamoDBEndpointForTesting;

    @Value("${testing.aws.region:eu-central-1}")
    private String awsRegionForTesting;
    @Value("${amazon.crossAccountRoleArn:arn:aws:iam::717264881942:role/sw-csci-cross-account-dynamodb-role-main-aws}")
    private String crossAccountRoleArn;



    @Bean
    public DynamoDBMapper mapper() {
        return new DynamoDBMapper(amazonDynamoDBConfig());
    }

    @Bean
    public AmazonDynamoDB amazonDynamoDBConfig() {

        if (isRunningInContainer) {
            LOGGER.info("Application is running in a container in AWS.");
            LOGGER.info("Attempting to assume role + " + crossAccountRoleArn);

//            AssumeRoleRequest roleRequest = new AssumeRoleRequest();
//            roleRequest.setRoleArn(crossAccountRoleArn);
//            roleRequest.setRoleSessionName("csci");

//            StsClient stsClient = StsClient.builder()
//                    .build();

            try {
                // TODO do not hardcode serviceEndpoint, especially the region
                AwsClientBuilder.EndpointConfiguration endpointConfiguration = new AwsClientBuilder.EndpointConfiguration("https://sts.eu-central-1.amazonaws.com", Regions.EU_CENTRAL_1.getName());
                LOGGER.debug("Created endpoint configuration with name " + endpointConfiguration.getServiceEndpoint() + " and region " + endpointConfiguration.getSigningRegion());

                AWSSecurityTokenService stsClient = AWSSecurityTokenServiceClientBuilder.standard()
                        .withEndpointConfiguration(endpointConfiguration)
                        .build();
                LOGGER.debug("STS client created successfully.");

                STSAssumeRoleSessionCredentialsProvider assumeRoleProvider = new STSAssumeRoleSessionCredentialsProvider.Builder(
                        crossAccountRoleArn,
                        "csci")
                        .withStsClient(stsClient)
                        .build();
                LOGGER.debug("Credentials provider created successfully.");

                return AmazonDynamoDBClientBuilder.standard()
                        .withCredentials(assumeRoleProvider)
                        .build();
            }
            catch(Exception e)
            {
                LOGGER.error("Failed to refresh cross-account role credentials.");
                throw new DynamoDBException("Failed to refresh cross-account role credentials.", e);
            }


            // The else part is for local testing
        } else {
            LOGGER.info("Application is NOT running in a container, most likely running on-prem for testing.");
            BasicAWSCredentials awsCredentials = new BasicAWSCredentials(localDatabaseAccessKeyForTesting, localDatabaseSecretKeyForTesting);
            return AmazonDynamoDBClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(awsDynamoDBEndpointForTesting, awsRegionForTesting))
                    .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                    .build();
        }
    }
}