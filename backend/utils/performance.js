const { performance } = require('perf_hooks');

// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.slowQueries = [];
    this.maxSlowQueries = 100;
  }

  // Start timing a query
  startTimer(queryName) {
    const startTime = performance.now();
    return {
      queryName,
      startTime,
      end: () => this.endTimer(queryName, startTime)
    };
  }

  // End timing and record metrics
  endTimer(queryName, startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Record metrics
    if (!this.metrics.has(queryName)) {
      this.metrics.set(queryName, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0
      });
    }
    
    const metric = this.metrics.get(queryName);
    metric.count++;
    metric.totalTime += duration;
    metric.avgTime = metric.totalTime / metric.count;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
    
    // Track slow queries (> 1 second)
    if (duration > 1000) {
      this.slowQueries.push({
        queryName,
        duration,
        timestamp: new Date()
      });
      
      // Keep only the most recent slow queries
      if (this.slowQueries.length > this.maxSlowQueries) {
        this.slowQueries = this.slowQueries.slice(-this.maxSlowQueries);
      }
    }
  }

  // Get performance metrics
  getMetrics() {
    const metrics = {};
    for (const [queryName, metric] of this.metrics) {
      metrics[queryName] = {
        ...metric,
        avgTime: Math.round(metric.avgTime * 100) / 100
      };
    }
    return metrics;
  }

  // Get slow queries
  getSlowQueries() {
    return this.slowQueries.slice().reverse(); // Most recent first
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear();
    this.slowQueries = [];
  }

  // Get summary statistics
  getSummary() {
    const metrics = this.getMetrics();
    const totalQueries = Object.values(metrics).reduce((sum, m) => sum + m.count, 0);
    const avgQueryTime = totalQueries > 0 
      ? Object.values(metrics).reduce((sum, m) => sum + m.totalTime, 0) / totalQueries
      : 0;
    
    return {
      totalQueries,
      avgQueryTime: Math.round(avgQueryTime * 100) / 100,
      slowQueriesCount: this.slowQueries.length,
      topSlowQueries: this.slowQueries
        .slice(0, 10)
        .map(q => ({ queryName: q.queryName, duration: Math.round(q.duration * 100) / 100 }))
    };
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Middleware to monitor API performance
const monitorPerformance = (req, res, next) => {
  const timer = performanceMonitor.startTimer(`${req.method} ${req.path}`);
  
  // Override res.json to capture response time
  const originalJson = res.json;
  res.json = function(data) {
    timer.end();
    return originalJson.call(this, data);
  };
  
  next();
};

// Query performance wrapper
const monitorQuery = (queryName) => {
  return (queryFn) => {
    return async (...args) => {
      const timer = performanceMonitor.startTimer(queryName);
      try {
        const result = await queryFn(...args);
        timer.end();
        return result;
      } catch (error) {
        timer.end();
        throw error;
      }
    };
  };
};

module.exports = {
  performanceMonitor,
  monitorPerformance,
  monitorQuery
};
