// Smart Customer Insights Engine
// Generates natural-language, actionable insights per customer
// based on order history, communication frequency, and spending patterns

export function generateInsights(customer, orders, logs) {
  const insights = [];
  const now = new Date();

  // ── Spending Analysis ──
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalSpend = completedOrders.reduce((sum, o) => sum + parseFloat(o.amount), 0);
  const avgOrderValue = completedOrders.length ? totalSpend / completedOrders.length : 0;

  if (totalSpend > 500) {
    insights.push({
      type: 'success',
      icon: '💎',
      title: 'High-Value Customer',
      detail: `Total spend of ₹${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })} across ${completedOrders.length} completed orders. Average order value: ₹${avgOrderValue.toFixed(0)}.`,
      action: 'Consider offering a loyalty discount or exclusive early access to new products.',
    });
  } else if (totalSpend > 200) {
    insights.push({
      type: 'info',
      icon: '📈',
      title: 'Growing Customer',
      detail: `Spent ₹${totalSpend.toFixed(0)} so far with ${completedOrders.length} completed orders.`,
      action: 'Upsell with complementary product bundles to increase average order value.',
    });
  } else if (orders.length > 0) {
    insights.push({
      type: 'warning',
      icon: '🌱',
      title: 'Early-Stage Customer',
      detail: `Only ₹${totalSpend.toFixed(0)} in total spend. Still building relationship.`,
      action: 'Send a personalized welcome offer or first-purchase discount to encourage repeat buying.',
    });
  }

  // ── Order Frequency & Recency ──
  if (orders.length > 0) {
    const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const lastOrderDate = new Date(sortedOrders[0].created_at);
    const daysSinceLastOrder = Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24));

    if (daysSinceLastOrder > 30) {
      insights.push({
        type: 'danger',
        icon: '⚠️',
        title: 'At Risk — Inactive Customer',
        detail: `No orders in ${daysSinceLastOrder} days. Last purchase was ${lastOrderDate.toLocaleDateString()}.`,
        action: 'Send a win-back email with a limited-time discount code or ask for feedback.',
      });
    } else if (daysSinceLastOrder > 14) {
      insights.push({
        type: 'warning',
        icon: '⏰',
        title: 'Cooling Down',
        detail: `Last order was ${daysSinceLastOrder} days ago.`,
        action: 'Schedule a follow-up call or send a "We miss you" email with personalized recommendations.',
      });
    } else {
      insights.push({
        type: 'success',
        icon: '🔥',
        title: 'Recently Active',
        detail: `Placed an order ${daysSinceLastOrder === 0 ? 'today' : `${daysSinceLastOrder} day${daysSinceLastOrder > 1 ? 's' : ''} ago`}.`,
        action: 'Great engagement! Ask for a product review or referral.',
      });
    }
  }

  // ── Pending Orders Alert ──
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');
  if (pendingOrders.length > 0) {
    const pendingTotal = pendingOrders.reduce((sum, o) => sum + parseFloat(o.amount), 0);
    insights.push({
      type: 'warning',
      icon: '📦',
      title: `${pendingOrders.length} Order${pendingOrders.length > 1 ? 's' : ''} In Progress`,
      detail: `₹${pendingTotal.toFixed(0)} worth of orders are still pending or processing.`,
      action: 'Ensure timely fulfillment to maintain customer satisfaction.',
    });
  }

  // ── Communication Gap ──
  if (logs.length === 0) {
    insights.push({
      type: 'danger',
      icon: '📭',
      title: 'No Communication Logged',
      detail: 'Zero interactions recorded with this customer.',
      action: 'Reach out with a personalized introduction email or schedule a discovery call.',
    });
  } else {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const lastLogDate = new Date(sortedLogs[0].created_at);
    const daysSinceLastLog = Math.floor((now - lastLogDate) / (1000 * 60 * 60 * 24));

    if (daysSinceLastLog > 14) {
      insights.push({
        type: 'warning',
        icon: '💬',
        title: 'Communication Gap',
        detail: `Last interaction was ${daysSinceLastLog} days ago (${sortedLogs[0].type}).`,
        action: 'Schedule a check-in to maintain relationship warmth.',
      });
    }

    // Communication preference
    const typeCounts = logs.reduce((acc, l) => { acc[l.type] = (acc[l.type] || 0) + 1; return acc; }, {});
    const preferredChannel = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    if (preferredChannel) {
      insights.push({
        type: 'info',
        icon: '📊',
        title: 'Preferred Channel',
        detail: `Most interactions via ${preferredChannel[0]} (${preferredChannel[1]} of ${logs.length} total).`,
        action: `Prioritize ${preferredChannel[0]} for future outreach to this customer.`,
      });
    }
  }

  // ── Cancelled Orders ──
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  if (cancelledOrders.length > 0) {
    const cancelRate = ((cancelledOrders.length / orders.length) * 100).toFixed(0);
    insights.push({
      type: 'danger',
      icon: '🚫',
      title: 'High Cancellation Rate',
      detail: `${cancelledOrders.length} of ${orders.length} orders cancelled (${cancelRate}%).`,
      action: 'Investigate cancellation reasons — consider reaching out for feedback.',
    });
  }

  // ── Cross-sell Opportunity ──
  if (completedOrders.length >= 2) {
    const products = [...new Set(completedOrders.map(o => o.product))];
    if (products.length < completedOrders.length) {
      insights.push({
        type: 'info',
        icon: '🔄',
        title: 'Repeat Buyer Detected',
        detail: `Purchased ${completedOrders.length} times but only ${products.length} unique products.`,
        action: 'Recommend new product categories to expand their purchase range.',
      });
    }
  }

  return insights;
}
