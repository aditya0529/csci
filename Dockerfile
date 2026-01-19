# Base image with Java and Maven installed
FROM public.ecr.aws/docker/library/maven:3.9.2-amazoncorretto-17 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy pom.xml file into container
COPY pom.xml .

# Download Maven artifacts required for build
RUN mvn -q -B dependency:go-offline

# Copy source code into container
COPY src ./src

# Build the application into a .jar file
RUN mvn -q -B package -DskipTests


# Base image with Java and Maven installed
FROM public.ecr.aws/docker/library/maven:3.9.2-amazoncorretto-17

# Perform security-related yum updates
RUN yum update -y --security

# Update Java SDK
RUN yum update java-17-amazon-corretto-devel

# Set the working directory inside the container
WORKDIR /app

# Copy the Spring Boot JAR file from the first image to the current container
COPY --from=builder /app/target/csci-app-0.1.0.jar app.jar

# Expose the port your Spring Boot application is running on
EXPOSE 8443

# Specify volume for /tmp directory, which is the default value for Java's tmpDir property
VOLUME /tmp

# Start the Spring Boot application
CMD ["java", "-Dcom.amazonaws.sdk.enableDefaultMetrics=cloudwatchRegion=eu-central-1",  "-jar", "app.jar"]