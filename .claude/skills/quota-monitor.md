# Quota Monitor Skill

## Description

Monitor and manage Google Custom Search API quota usage.

## Usage

```bash
# Check current quota
/quota-status

# Detailed quota breakdown
/quota-status --detailed

# Set quota alerts
/quota-alert --threshold=90

# Estimate cost
/quota-estimate --queries=500
```

## Features

### 1. Real-time Monitoring

```bash
# Current usage
/quota-status

Output:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 API Quota Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Date: 2025-11-18
 Used: 45 / 100 queries (45%)
 Remaining: 55 queries
 Searches: 15
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Reset: in 8 hours 23 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Usage History

```bash
/quota-history --days=7

Output:
Date       | Queries | Searches | Cost
-----------|---------|----------|--------
2025-11-18 |     45  |    15    | $0.00
2025-11-17 |    120  |    40    | $0.10
2025-11-16 |     89  |    30    | $0.00
2025-11-15 |    156  |    52    | $0.28
```

### 3. Cost Estimation

```bash
/quota-estimate --queries=500

Output:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Cost Estimation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Total Queries:     500
 Free Queries:      100
 Paid Queries:      400
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Daily Cost:        $2.00
 Monthly Cost:      $60.00
 Annual Cost:       $720.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Alert Configuration

```bash
# Set alert at 90% usage
/quota-alert --threshold=90 --notify=slack

# Set budget alert
/quota-alert --budget=100 --period=monthly
```

## Implementation

```typescript
class QuotaMonitor {
  async checkStatus() {
    const quota = await getQuotaData();
    const limit = getQuotaLimit();
    const usagePercent = (quota.queriesUsed / limit) * 100;

    return {
      date: quota.date,
      used: quota.queriesUsed,
      limit,
      remaining: limit - quota.queriesUsed,
      usagePercent,
      searches: quota.searches.length,
      resetTime: this.getResetTime(),
    };
  }

  getResetTime() {
    const now = new Date();
    const reset = new Date(now);
    reset.setUTCHours(24, 0, 0, 0);

    const diff = reset.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  async estimateCost(queries: number) {
    const freeQueries = 100;
    const paidQueries = Math.max(0, queries - freeQueries);
    const dailyCost = paidQueries * 0.005;

    return {
      totalQueries: queries,
      freeQueries: Math.min(queries, freeQueries),
      paidQueries,
      dailyCost,
      monthlyCost: dailyCost * 30,
      annualCost: dailyCost * 365,
    };
  }
}
```

## Alerts

### Slack Integration

```typescript
import { WebClient } from '@slack/web-api';

async function sendQuotaAlert(status) {
  const client = new WebClient(process.env.SLACK_TOKEN);

  if (status.usagePercent >= 90) {
    await client.chat.postMessage({
      channel: '#quota-alerts',
      text: `⚠️ *Quota Alert*\n` +
            `Usage: ${status.usagePercent.toFixed(1)}%\n` +
            `Remaining: ${status.remaining} queries\n` +
            `Resets in: ${status.resetTime}`,
    });
  }
}
```

### Email Notification

```typescript
import nodemailer from 'nodemailer';

async function sendEmailAlert(status) {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: process.env.ALERT_EMAIL,
    subject: 'API Quota Alert',
    html: `
      <h2>Quota Usage Warning</h2>
      <p>Your Google Custom Search API quota is at ${status.usagePercent}%</p>
      <ul>
        <li>Used: ${status.used} queries</li>
        <li>Remaining: ${status.remaining} queries</li>
        <li>Resets in: ${status.resetTime}</li>
      </ul>
    `,
  });
}
```

## Best Practices

1. **Daily Monitoring**
   ```bash
   # Add to cron (run every hour)
   0 * * * * /quota-status --alert
   ```

2. **Budget Alerts**
   ```bash
   # Alert at 50%, 75%, 90% usage
   /quota-alert --thresholds=50,75,90
   ```

3. **Cost Tracking**
   ```bash
   # Weekly cost report
   /quota-report --period=weekly --format=pdf
   ```

4. **Optimization**
   ```bash
   # Analyze query patterns
   /quota-analyze --optimize
   ```
