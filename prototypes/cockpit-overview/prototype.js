(function runCockpitPrototype() {
  "use strict";

  const signals = Array.isArray(window.COCKPIT_MOCK_SIGNALS)
    ? window.COCKPIT_MOCK_SIGNALS.slice()
    : [];

  const criticalTypes = new Set([
    "financial_pressure_signal",
    "product_import_warning_signal",
    "crisis_signal"
  ]);

  const riskLabels = {
    high: "ریسک بالا",
    medium: "ریسک متوسط",
    low: "ریسک پایین",
    conflict: "تعارض",
    manual_only: "فقط بررسی انسانی"
  };

  const confidenceLabels = {
    high: "اطمینان بالا",
    medium: "اطمینان متوسط",
    low: "اطمینان پایین",
    conflict: "اطمینان متعارض",
    manual_only: "بدون اقدام خودکار"
  };

  const blockedStates = new Set(["conflict", "manual_only"]);

  function toFaNumber(value) {
    return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
  }

  function isBlocked(signal) {
    return blockedStates.has(signal.riskLevel) || signal.auditState === "audit_missing";
  }

  function createBadge(text, className) {
    const badge = document.createElement("span");
    badge.className = `badge ${className || ""}`.trim();
    badge.textContent = text;
    return badge;
  }

  function createCard(signal) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `signal-card${isBlocked(signal) ? " is-blocked" : ""}`;
    card.dataset.risk = signal.riskLevel;
    card.setAttribute("aria-label", `مشاهده جزئیات مفهومی ${signal.title}`);

    const top = document.createElement("div");
    top.className = "card-top";
    const type = document.createElement("span");
    type.className = "card-type";
    type.textContent = signal.signalType;
    top.append(type);
    if (isBlocked(signal)) {
      const blocked = document.createElement("span");
      blocked.className = "blocked-mark";
      blocked.textContent = "اقدام مسدود";
      top.append(blocked);
    }

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = signal.title;

    const summary = document.createElement("p");
    summary.className = "card-summary";
    summary.textContent = signal.summary;

    const metrics = document.createElement("div");
    metrics.className = "metric-row";
    const primaryMetric = document.createElement("strong");
    primaryMetric.className = "primary-metric";
    primaryMetric.textContent = signal.primaryMetric;
    const secondaryMetric = document.createElement("span");
    secondaryMetric.className = "secondary-metric";
    secondaryMetric.textContent = signal.secondaryMetric;
    metrics.append(primaryMetric, secondaryMetric);

    const badges = document.createElement("div");
    badges.className = "badge-row";
    badges.append(
      createBadge(riskLabels[signal.riskLevel] || signal.riskLevel, "badge-risk"),
      createBadge(confidenceLabels[signal.confidenceLevel] || signal.confidenceLevel, "badge-confidence"),
      createBadge(signal.auditState, signal.auditState === "audit_missing" ? "badge-audit-missing" : "")
    );

    const footer = document.createElement("div");
    footer.className = "card-footer";
    footer.innerHTML = `<span>${signal.sourceModule}</span><span>جزئیات مفهومی ←</span>`;

    card.append(top, title, summary, metrics, badges, footer);
    card.addEventListener("click", () => openConceptPanel(signal));
    return card;
  }

  function renderCards() {
    const criticalContainer = document.getElementById("critical-cards");
    const operationalContainer = document.getElementById("operational-cards");

    signals.forEach((signal) => {
      if (signal.signalType === "ai_suggestion_signal" || signal.signalType === "manager_review_queue_signal") return;
      const target = criticalTypes.has(signal.signalType) ? criticalContainer : operationalContainer;
      target.append(createCard(signal));
    });
  }

  function renderSummary() {
    const highRisk = signals.filter((signal) => signal.riskLevel === "high").length;
    const managerReview = signals.filter((signal) => signal.requiresManagerDecision).length;
    const blocked = signals.filter(isBlocked).length;
    document.getElementById("signal-count").textContent = toFaNumber(signals.length);
    document.getElementById("high-risk-count").textContent = toFaNumber(highRisk);
    document.getElementById("review-count").textContent = toFaNumber(managerReview);
    document.getElementById("blocked-count").textContent = toFaNumber(blocked);
  }

  function renderFocusPanels() {
    const aiSignal = signals.find((signal) => signal.signalType === "ai_suggestion_signal");
    const reviewSignal = signals.find((signal) => signal.signalType === "manager_review_queue_signal");

    if (aiSignal) {
      const aiContainer = document.getElementById("ai-suggestion");
      aiContainer.innerHTML = `<p class="panel-copy">${aiSignal.summary}</p>`;
      const meta = document.createElement("div");
      meta.className = "panel-meta";
      meta.append(
        createBadge(confidenceLabels[aiSignal.confidenceLevel], "badge-confidence"),
        createBadge("نیازمند تصمیم مدیر", ""),
        createBadge("بدون اقدام خودکار", "")
      );
      aiContainer.append(meta);
      makePanelInteractive(aiContainer.parentElement, aiSignal);
    }

    if (reviewSignal) {
      const reviewContainer = document.getElementById("manager-review");
      reviewContainer.innerHTML = `<p class="panel-copy">${reviewSignal.summary}</p>`;
      const meta = document.createElement("div");
      meta.className = "panel-meta";
      meta.append(
        createBadge(reviewSignal.primaryMetric, "badge-risk"),
        createBadge(reviewSignal.secondaryMetric, ""),
        createBadge(reviewSignal.auditState, "")
      );
      reviewContainer.append(meta);
      makePanelInteractive(reviewContainer.parentElement, reviewSignal);
    }
  }

  function makePanelInteractive(panel, signal) {
    panel.setAttribute("tabindex", "0");
    panel.setAttribute("role", "button");
    panel.setAttribute("aria-label", `مشاهده جزئیات مفهومی ${signal.title}`);
    panel.addEventListener("click", () => openConceptPanel(signal));
    panel.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openConceptPanel(signal);
      }
    });
  }

  function renderAuditSummary() {
    const auditMissing = signals.filter((signal) => signal.auditState === "audit_missing").length;
    const auditRequired = signals.filter((signal) => signal.auditState === "audit_required").length;
    const conflict = signals.filter((signal) => signal.riskLevel === "conflict").length;
    const target = document.getElementById("audit-summary-items");

    [
      ["Audit مفقود", toFaNumber(auditMissing)],
      ["Audit الزامی", toFaNumber(auditRequired)],
      ["تعارض", toFaNumber(conflict)],
      ["داده واقعی", "صفر"]
    ].forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "audit-pill";
      item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
      target.append(item);
    });
  }

  function detailRow(label, value) {
    const row = document.createElement("div");
    row.className = "detail-row";
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const valueElement = document.createElement("strong");
    valueElement.textContent = value;
    row.append(labelElement, valueElement);
    return row;
  }

  function openConceptPanel(signal) {
    const panel = document.getElementById("concept-panel");
    const content = document.getElementById("concept-content");
    document.getElementById("concept-title").textContent = signal.title;
    content.replaceChildren(
      detailRow("مقصد مفهومی", signal.drillDownTargetConcept),
      detailRow("پیشنهاد سیستم", signal.suggestedAction),
      detailRow("ریسک", riskLabels[signal.riskLevel] || signal.riskLevel),
      detailRow("اطمینان", confidenceLabels[signal.confidenceLevel] || signal.confidenceLevel),
      detailRow("Audit", signal.auditState),
      detailRow("منبع ساختگی", signal.sourceModule),
      detailRow("زمان ساختگی", signal.generatedAt)
    );

    if (isBlocked(signal)) {
      const notice = document.createElement("div");
      notice.className = "block-notice";
      notice.textContent = "این وضعیت به علت تعارض، تصمیم صرفاً انسانی یا Audit ناقص، هر اقدام خودکار را مسدود می‌کند.";
      content.append(notice);
    }

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.getElementById("close-concept").focus();
  }

  function closeConceptPanel() {
    const panel = document.getElementById("concept-panel");
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
  }

  document.getElementById("close-concept").addEventListener("click", closeConceptPanel);
  document.getElementById("concept-backdrop").addEventListener("click", closeConceptPanel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeConceptPanel();
  });

  renderSummary();
  renderCards();
  renderFocusPanels();
  renderAuditSummary();
})();
