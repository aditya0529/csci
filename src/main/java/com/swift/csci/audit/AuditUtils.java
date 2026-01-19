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
