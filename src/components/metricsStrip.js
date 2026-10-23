/**
 * "What HelpBridge Did" Impact Metrics Strip
 * Surfaces real-time statistics of the synthesis & verification pipeline.
 */

export function renderMetricsStrip(metrics) {
  if (!metrics) return '';

  const {
    factsCount = 0,
    needsConfirmCount = 0,
    redFlagsCount = 0,
    durationSeconds = '0.0',
    reliabilityScore = 85
  } = metrics;

  const scoreClass = reliabilityScore >= 80 ? 'metric-good' : reliabilityScore >= 60 ? 'metric-warn' : 'metric-alert';

  return `
    <div class="metrics-strip" id="impact-metrics-strip" aria-label="Synthesis Metrics">
      <div class="metrics-title">
        <i class="fa-solid fa-chart-line"></i>
        <span>WHAT HELPBRIDGE DID</span>
      </div>
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-value">${factsCount}</div>
          <div class="metric-label">Facts Extracted</div>
        </div>
        <div class="metric-item ${needsConfirmCount > 0 ? 'metric-warn' : ''}">
          <div class="metric-value">${needsConfirmCount}</div>
          <div class="metric-label">Flagged for Re-check</div>
        </div>
        <div class="metric-item ${redFlagsCount > 0 ? 'metric-danger' : ''}">
          <div class="metric-value">${redFlagsCount}</div>
          <div class="metric-label">Red Flags Detected</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">${durationSeconds}s</div>
          <div class="metric-label">Processing Time</div>
        </div>
        <div class="metric-item ${scoreClass}">
          <div class="metric-value">${reliabilityScore}%</div>
          <div class="metric-label">Verification Score</div>
        </div>
      </div>
    </div>
  `;
}
