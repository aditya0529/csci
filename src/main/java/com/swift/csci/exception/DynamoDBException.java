package com.swift.csci.exception;


public class DynamoDBException extends RuntimeException {
    public DynamoDBException(String message) {
        super(message);
    }

    public DynamoDBException(String message, Throwable cause) {
        super(message, cause);
    }
}