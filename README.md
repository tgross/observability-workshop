# Observability in the Containerized World

*With the rise of containers and microservice architectures, we're suddenly all finding ourselves building distributed systems. And these distributed systems are even harder to debug than the systems we were building just a few years ago. In this workshop, we'll examine tools and techniques for observability and manageability in container environments, including log drivers, metrics collection, and distributed tracing.*

Presented at ContainerDays NYC, November 2016.

## Topics


### Distributed Tracing

There are ongoing efforts around distributed tracing, like Open Tracing and Zipkin, which are designed to provide an interoperable standard. These are all fairly experimental and getting them to interoperate with existing software like [Nginx's own `$request_id` tokens](https://www.nginx.com/blog/application-tracing-nginx-plus/) can be complicated.

The Node.js application explored in this workshop will demonstrate some basic tracing concepts and show how we can incorporate external transcation ids.

### Log Drivers

Docker log drivers encourage a model where the application writes all its logs to stdout where they can be shipped off the box to a log collection server like the ELK stack or a third party service like Splunk or Honeycomb. The log drivers in this workshop are configured to send all their logs to an ELK stack:

```
--log-driver=syslog \
--log-opt syslog-address=tcp://logstash.${domain}:514 \
```

We'll also look at options for performing offline analysis of the logs via Honeycomb.io.

### Monitoring

Environments with lots of container churn post scalability problems for traditional monitoring approaches. Using hostnames as an index into the data creates very high cardinality, which existing systems like Graphite handle poorly.


### Container Image Design

Shipping large container images to the host results in larger setup times and more load on private Docker registries. Ideally container images include only the application and its dependencies (runtimes, libraries, and configuration files). But this makes debugging problems more difficult. We can build and run containers in such as way as to expose a shared set of tools to the container without having to ship them inside every container.

To do this, we can mount tools from the host in `ro` mode to the container using `-v` mounts. On Joyent's Triton we mount `/native` which is tools from the underlying SmartOS host, which means we can use tools like DTrace even on Linux!

---

## The Workshop Environment

**Student machines:** each student has a hardware virtual machine running on Joyent's Triton Cloud under KVM. Although Joyent's primary offering is serving containers we can't use Docker inside those containers. Getting students to sign up for Triton during a short workshop is infeasible and takes up too much time. This also ensures that the "development environment" for all the students is identical and we won't need to worry about incompatibilities for Windows users. So long as the student has a `ssh` client they can participate fully.

The KVM machine is running Debian and is preconfigured to include Docker and a running stack of applications described by Docker Compose. These include Nginx, a Node.js application ("Fortunes"), and MySQL, as well as a client application providing continuous load to the stack. The applications are all built using the Autopilot Pattern to register themselves to the various workshop-level services described below.

**ELK:** the Docker log drivers in the Compose file ship the logs for all the applications to a shared Elasticsearch-Logstash-Kibana (ELK) stack that students will use to examine logs.

**Prometheus:** the ContainerPilot running inside each application will take measurements of the application and expose a Prometheus-compatible endpoint for scraping. A shared Prometheus server will scrape all student machines so that the students can examine monitoring and metrics.

**Consul:** a shared Consul cluster provides service discovery for the ELK and Prometheus services. All applications will register themselves with Consul via a Consul agent container running on the VM.


## The Applications

**Nginx:** the Nginx instance has a single backend which is the Fortunes application described below. The Nginx container is running under ContainerPilot, which we'll use to expose a Telemetry endpoint that we scrape with Prometheus. Nginx logs can be enriched with a lot of metadata about requests and the server responses, so we're collecting lots of extra data here:

```
access_log /var/log/nginx/access.log combined;
log_format combined '$remote_addr - $remote_user [$time_local] $host '
  '"$request" $status $bytes_sent $body_bytes_sent $request_time '
  '"$http_referer" "$http_user_agent" $request_length $http_authorization '
  '$http_x_forwarded_proto $http_x_forwarded_for $server_name';
```

**Node.js application:** this is a simple (and somewhat silly) Node.js application that replies to all responses with a "fortune." The fortune is loaded from a MySQL query but the key for that query comes from some manipulation of files on disk. The application is broken when we start the workshop, in two ways:

- it leaks file handles on the files it loads from disk
- the query it makes to MySQL is inefficient

The goal of the workshop is to identify both these bugs and fix them.

The Node.js application is running under ContainerPilot, which we'll use to expose the Telemetry endpoint we scrape with Prometheus. It is also configured for tracing using `opentracing-javascript`, where we correlate the traces with the Nginx request ID and then log them. Its logs are shipped to our ELK stack.

**Client application:** this container makes HTTP requests to the Nginx container continuously, to simulate load on the services.

**MySQL:** this container is running MySQL and serves queries for the Fortunes application decribed above. MySQL is running under ContainerPilot to expoe the Telemetry endpoint we scrape with Prometheus. Its logs are shipped to our ELK stack. The Fortunes application makes inefficient queries to MySQL (requring a full table scan) and we will identify and fix this bug in the workshop.
