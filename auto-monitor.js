// AutoOps AI - Auto Monitor (20+ Realistic Error Scenarios)

const AutoOpsOrchestrator = require('./orchestrator');
const fs = require('fs').promises;

class AutoMonitor {
  constructor(checkInterval = 45000) {
    this.orchestrator = new AutoOpsOrchestrator();
    this.checkInterval = checkInterval;
    this.isMonitoring = false;
    this.currentStatus = 'healthy';
    this.incidentCount = 0;
    this.lastScenarioIndex = -1; // Track last scenario to ensure variety
  }

  async start() {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   🔍 AutoOps AI Monitor Started        ║');
    console.log('╚══════════════════════════════════════════╝\n');
    console.log(`📊 Check interval: ${this.checkInterval / 1000}s`);
    console.log(`🎯 Monitoring production environment`);
    console.log(`🔢 20+ unique error scenarios loaded\n`);
    
    this.isMonitoring = true;
    await this.updateStatus('healthy');
    
    this.monitorLoop();
  }

  async monitorLoop() {
    while (this.isMonitoring) {
      try {
        const logs = await this.fetchLogs();
        const hasErrors = logs.some(log => log.level === 'ERROR');
        
        if (hasErrors) {
          console.log(`\n🚨 [${new Date().toLocaleTimeString()}] INCIDENT DETECTED!\n`);
          await this.updateStatus('incident_detected');
          
          const incident = await this.orchestrator.processIncident(logs, 'Production');
          this.incidentCount++;
          
          console.log(`\n✅ Incident ${incident.id} resolved`);
          console.log(`💰 Cost: $${this.orchestrator.metrics.totalCost.toFixed(6)}`);
          console.log(`📊 Tokens: ${this.orchestrator.metrics.totalTokens.toLocaleString()}\n`);
          
          await this.updateStatus('resolved');
          await this.wait(5000);
          await this.updateStatus('healthy');
        } else {
          console.log(`✅ [${new Date().toLocaleTimeString()}] System healthy - no issues`);
          await this.updateStatus('healthy');
        }
        
      } catch (error) {
        console.error('❌ Monitor error:', error.message);
      }
      
      await this.wait(this.checkInterval);
    }
  }

  async fetchLogs() {
    // 30% chance of incident (realistic production rate)
    const shouldHaveError = Math.random() < 0.30;
    
    if (shouldHaveError) {
      return await this.generateRealisticErrorLogs();
    } else {
      return await this.generateHealthyLogs();
    }
  }

  async generateHealthyLogs() {
    const services = [
      'payment-api', 'user-service', 'auth-service', 
      'notification-service', 'api-gateway', 'order-service',
      'inventory-service', 'email-service', 'analytics-service'
    ];
    const service = services[Math.floor(Math.random() * services.length)];
    
    const healthyMessages = [
      'Request processed successfully',
      'Transaction completed',
      'User authenticated',
      'Cache hit - optimal performance',
      'Database query executed in 12ms',
      'Payment processed successfully'
    ];
    
    return [
      {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        service: service,
        message: healthyMessages[Math.floor(Math.random() * healthyMessages.length)]
      }
    ];
  }

  async generateRealisticErrorLogs() {
    // 20+ DIFFERENT REALISTIC PRODUCTION ERROR SCENARIOS
    const errorScenarios = [
      // 1. Database Connection Pool Exhaustion
      {
        service: 'payment-api',
        severity: 'critical',
        impactedUsers: 750 + Math.floor(Math.random() * 300),
        errors: [
          'Database connection pool exhausted. Max connections: 10, active: 10',
          'SequelizeConnectionAcquireTimeoutError: Operation timed out',
          'FATAL: remaining connection slots reserved for superuser',
          'pg_hba.conf rejects connection for host'
        ]
      },
      
      // 2. Redis Cache Failure
      {
        service: 'auth-service',
        severity: 'high',
        impactedUsers: 450 + Math.floor(Math.random() * 200),
        errors: [
          'Redis connection failed: ECONNREFUSED 127.0.0.1:6379',
          'Error: connect ETIMEDOUT',
          'RedisError: Maximum number of clients reached',
          'Cache write failed: READONLY You can\'t write against a read only replica'
        ]
      },
      
      // 3. API Rate Limit Exceeded
      {
        service: 'api-gateway',
        severity: 'critical',
        impactedUsers: 1100 + Math.floor(Math.random() * 400),
        errors: [
          'Rate limit exceeded: 1000 requests/minute',
          'HTTP 429: Too Many Requests from IP 192.168.1.45',
          'Request throttled for client',
          'Circuit breaker opened for downstream service'
        ]
      },
      
      // 4. Memory Leak / OOM
      {
        service: 'notification-service',
        severity: 'high',
        impactedUsers: 280 + Math.floor(Math.random() * 150),
        errors: [
          'FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory',
          'Process memory usage: 1.8GB / 2GB (90%)',
          'GC overhead limit exceeded',
          'Service crashed with exit code 137 (OOM Killed)'
        ]
      },
      
      // 5. Third-Party Payment Gateway Timeout
      {
        service: 'payment-api',
        severity: 'critical',
        impactedUsers: 580 + Math.floor(Math.random() * 250),
        errors: [
          'Stripe API timeout after 30000ms',
          'ESOCKETTIMEDOUT: socket hang up',
          'Payment gateway unreachable',
          'Request to https://api.stripe.com failed: connect ETIMEDOUT'
        ]
      },
      
      // 6. JWT Authentication Failures
      {
        service: 'auth-service',
        severity: 'critical',
        impactedUsers: 850 + Math.floor(Math.random() * 350),
        errors: [
          'JWT token validation failed: invalid signature',
          'Token expired at 2026-02-14T10:30:00Z',
          'JsonWebTokenError: jwt malformed',
          'Authentication failed: secret key mismatch detected'
        ]
      },
      
      // 7. Disk Space Exhaustion
      {
        service: 'logging-service',
        severity: 'high',
        impactedUsers: 0,
        errors: [
          'ENOSPC: no space left on device',
          'Failed to write log file: disk full',
          'Disk usage: 98% (49.5GB / 50GB)',
          'Unable to create temp file: /tmp filesystem full'
        ]
      },
      
      // 8. DNS Resolution Failure
      {
        service: 'email-service',
        severity: 'high',
        impactedUsers: 380 + Math.floor(Math.random() * 180),
        errors: [
          'getaddrinfo ENOTFOUND smtp.sendgrid.net',
          'DNS lookup failed for mail server',
          'Error: queryA ETIMEOUT',
          'Unable to resolve host: dns timeout after 5000ms'
        ]
      },
      
      // 9. Microservice Communication Failure
      {
        service: 'order-service',
        severity: 'critical',
        impactedUsers: 650 + Math.floor(Math.random() * 280),
        errors: [
          'Service mesh communication failed',
          'HTTP 503: Service Unavailable - inventory-service',
          'gRPC call failed: DEADLINE_EXCEEDED',
          'Downstream service timeout after 5000ms'
        ]
      },
      
      // 10. SSL Certificate Expired
      {
        service: 'api-gateway',
        severity: 'critical',
        impactedUsers: 1400 + Math.floor(Math.random() * 500),
        errors: [
          'SSL certificate expired on 2026-02-01',
          'Error: certificate has expired',
          'TLS handshake failed: certificate not valid',
          'HTTPS requests failing: ERR_CERT_DATE_INVALID'
        ]
      },
      
      // 11. Database Deadlock
      {
        service: 'order-service',
        severity: 'high',
        impactedUsers: 320 + Math.floor(Math.random() * 150),
        errors: [
          'Deadlock detected during transaction',
          'SequelizeTimeoutError: Lock wait timeout exceeded',
          'ERROR: deadlock detected - DETAIL: Process attempting to acquire row lock',
          'Transaction rolled back due to serialization failure'
        ]
      },
      
      // 12. S3 / Object Storage Failure
      {
        service: 'media-service',
        severity: 'high',
        impactedUsers: 420 + Math.floor(Math.random() * 200),
        errors: [
          'S3Error: NoSuchBucket - The specified bucket does not exist',
          'Access Denied: Insufficient permissions for s3:PutObject',
          'RequestTimeout: Your socket connection to the server was not read',
          'SlowDown: Please reduce your request rate'
        ]
      },
      
      // 13. Elasticsearch / Search Service Down
      {
        service: 'search-service',
        severity: 'high',
        impactedUsers: 550 + Math.floor(Math.random() * 250),
        errors: [
          'ElasticsearchConnectionError: Unable to connect to cluster',
          'NoLivingConnectionsError: All shards failed',
          'Search query timeout after 30000ms',
          'Cluster health status: RED - data loss detected'
        ]
      },
      
      // 14. Message Queue Overflow
      {
        service: 'event-processor',
        severity: 'critical',
        impactedUsers: 720 + Math.floor(Math.random() * 300),
        errors: [
          'RabbitMQ queue size exceeded: 100,000 messages pending',
          'Consumer lag detected: 45,000 messages behind',
          'Channel error: PRECONDITION_FAILED - cannot consume from exclusive queue',
          'Connection closed: frame_error - heartbeat timeout'
        ]
      },
      
      // 15. CDN Origin Server Error
      {
        service: 'cdn-origin',
        severity: 'critical',
        impactedUsers: 980 + Math.floor(Math.random() * 400),
        errors: [
          'CloudFront 502 Bad Gateway - origin server error',
          'Origin Response Timeout: 60000ms exceeded',
          'SSL/TLS negotiation failed with origin',
          'Origin returned invalid HTTP response code: 520'
        ]
      },
      
      // 16. Container Orchestration Failure
      {
        service: 'kubernetes-controller',
        severity: 'critical',
        impactedUsers: 1200 + Math.floor(Math.random() * 500),
        errors: [
          'Pod failed to start: ImagePullBackOff',
          'Node NotReady: kubelet stopped posting node status',
          'CrashLoopBackOff: container restarted 15 times',
          'OOMKilled: Container exceeded memory limit (2Gi)'
        ]
      },
      
      // 17. API Versioning Conflict
      {
        service: 'api-gateway',
        severity: 'high',
        impactedUsers: 340 + Math.floor(Math.random() * 180),
        errors: [
          'API version mismatch: client v2.1 requires server v2.x',
          'Deprecated endpoint called: /api/v1/users (sunset date passed)',
          'Breaking change detected in API contract',
          'Schema validation failed: required field missing in v3 request'
        ]
      },
      
      // 18. CORS / Security Policy Violation
      {
        service: 'web-app',
        severity: 'high',
        impactedUsers: 460 + Math.floor(Math.random() * 220),
        errors: [
          'CORS policy: No \'Access-Control-Allow-Origin\' header present',
          'Blocked by Content Security Policy: script-src violation',
          'Mixed Content: The page was loaded over HTTPS, but requested HTTP',
          'X-Frame-Options denied rendering in frame from origin'
        ]
      },
      
      // 19. Data Pipeline Failure
      {
        service: 'analytics-pipeline',
        severity: 'high',
        impactedUsers: 0,
        errors: [
          'Kafka consumer lag: 250,000 messages behind',
          'Data transformation failed: schema mismatch in Avro record',
          'Spark job failed: executor lost - node failure',
          'BigQuery insert failed: exceeded quota for tabledata.insertAll'
        ]
      },
      
      // 20. Load Balancer Health Check Failure
      {
        service: 'load-balancer',
        severity: 'critical',
        impactedUsers: 890 + Math.floor(Math.random() * 400),
        errors: [
          'Health check failed: /health returned 503',
          'All backend servers marked unhealthy',
          'Connection timeout: no response from instance after 10s',
          'Target deregistered: consecutive 5 failed health checks'
        ]
      },
      
      // 21. WebSocket Connection Storm
      {
        service: 'realtime-service',
        severity: 'critical',
        impactedUsers: 1050 + Math.floor(Math.random() * 450),
        errors: [
          'WebSocket connection limit exceeded: 50,000 concurrent connections',
          'Socket.io server overloaded: memory usage critical',
          'Connection refused: EMFILE - too many open files',
          'Heartbeat timeout: client connections stale'
        ]
      },
      
      // 22. OAuth / SSO Integration Failure
      {
        service: 'auth-service',
        severity: 'critical',
        impactedUsers: 670 + Math.floor(Math.random() * 300),
        errors: [
          'OAuth2 token exchange failed: invalid_grant',
          'SAML assertion validation error: signature mismatch',
          'Auth0 API rate limit exceeded: 1000 calls/hour',
          'Identity provider unreachable: timeout after 30s'
        ]
      },
      
      // 23. Cron Job / Scheduled Task Failure
      {
        service: 'scheduler-service',
        severity: 'high',
        impactedUsers: 0,
        errors: [
          'Cron job failed: daily_backup_0300 - exit code 1',
          'Scheduled task skipped: previous execution still running',
          'Job timeout: report_generation exceeded 1 hour limit',
          'Batch process failed: 15,000 records processed, 3,200 failed'
        ]
      }
    ];

    // Select a random scenario different from last one
    let scenarioIndex;
    do {
      scenarioIndex = Math.floor(Math.random() * errorScenarios.length);
    } while (scenarioIndex === this.lastScenarioIndex && errorScenarios.length > 1);
    
    this.lastScenarioIndex = scenarioIndex;
    const scenario = errorScenarios[scenarioIndex];
    
    // Generate log entries
    const logs = [
      {
        timestamp: new Date(Date.now() - 35000).toISOString(),
        level: 'INFO',
        service: scenario.service,
        message: 'Processing request...'
      }
    ];
    
    // Add 2-4 error logs with variation
    const errorCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < errorCount; i++) {
      logs.push({
        timestamp: new Date(Date.now() - (30000 - i * 7000)).toISOString(),
        level: 'ERROR',
        service: scenario.service,
        message: scenario.errors[i % scenario.errors.length]
      });
    }
    
    return logs;
  }

  async updateStatus(status) {
    this.currentStatus = status;
    
    const statusData = {
      status: status,
      timestamp: new Date().toISOString(),
      monitoring: this.isMonitoring,
      incidentsHandled: this.incidentCount
    };
    
    await fs.writeFile('data/monitor-status.json', JSON.stringify(statusData, null, 2));
  }

  stop() {
    console.log('\n🛑 Stopping monitor...');
    this.isMonitoring = false;
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const monitor = new AutoMonitor(45000);
monitor.start();

process.on('SIGINT', () => {
  monitor.stop();
  process.exit(0);
});