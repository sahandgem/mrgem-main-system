(function runManagerReviewQueuePrototype() {
  "use strict";

  const items = Array.isArray(window.MANAGER_REVIEW_QUEUE_MOCK_ITEMS)
    ? window.MANAGER_REVIEW_QUEUE_MOCK_ITEMS.slice()
    : [];

  const labels = {
    priority: { urgent: "فوری", high: "بالا", normal: "عادی", low: "پایین" },
    risk: { high: "ریسک بالا", medium: "ریسک متوسط", low: "ریسک پایین", conflict: "تعارض", manual_only: "فقط انسانی" },
    confidence: { high: "اطمینان بالا", medium: "اطمینان متوسط", low: "اطمینان پایین", manual_only: "فقط انسانی" },
    audit: { audit_available: "Audit موجود", audit_required: "Audit الزامی", audit_missing: "Audit مفقود" },
    decision: {
      approve_concept: "تایید مفهومی",
      reject_concept: "رد مفهومی",
      hold_concept: "توقف مفهومی",
      request_correction_concept: "درخواست اصلاح مفهومی",
      escalate_concept: "ارجاع مفهومی"
    }
  };

  const filters = { priority: "all", risk: "all", audit: "all" };
  let selectedId = items.length ? items[0].reviewItemId : null;
  let noticeTimer = null;

  function toFaNumber(value) {
    return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
  }

  function isBlocked(item) {
    return item.auditState === "audit_missing" || item.riskLevel === "conflict" || item.riskLevel === "manual_only" || item.confidenceLevel === "manual_only";
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function createBadge(type, value) {
    const text = labels[type][value] || value;
    return createElement("span", `badge badge-${type}-${value.replace("audit_", "")}`, text);
  }

  function filteredItems() {
    return items.filter((item) =>
      (filters.priority === "all" || item.priority === filters.priority) &&
      (filters.risk === "all" || item.riskLevel === filters.risk) &&
      (filters.audit === "all" || item.auditState === filters.audit)
    );
  }

  function renderSummary() {
    const definitions = [
      ["کل صف", items.length],
      ["فوری", items.filter((item) => item.priority === "urgent").length],
      ["مسدود", items.filter(isBlocked).length],
      ["اطمینان پایین", items.filter((item) => item.confidenceLevel === "low").length],
      ["Audit مفقود", items.filter((item) => item.auditState === "audit_missing").length]
    ];
    const target = document.getElementById("summary-band");
    target.replaceChildren(...definitions.map(([label, value]) => {
      const item = createElement("div", "summary-item");
      item.append(createElement("span", "", label), createElement("strong", "", toFaNumber(value)));
      return item;
    }));
  }

  function renderLanes() {
    const target = document.getElementById("priority-lanes");
    target.replaceChildren(...["urgent", "high", "normal", "low"].map((priority) => {
      const lane = createElement("div", `lane lane-${priority}`);
      lane.append(
        createElement("span", "", labels.priority[priority]),
        createElement("strong", "", toFaNumber(items.filter((item) => item.priority === priority).length))
      );
      return lane;
    }));
  }

  function createReviewItem(item) {
    const button = createElement("button", `review-item${item.reviewItemId === selectedId ? " is-selected" : ""}`);
    button.type = "button";
    button.dataset.priority = item.priority;
    button.setAttribute("aria-label", `مشاهده جزئیات مفهومی ${item.title}`);

    const top = createElement("div", "item-top");
    top.append(createElement("span", "item-source", item.sourceModule), createBadge("priority", item.priority));
    const title = createElement("h3", "", item.title);
    const summary = createElement("p", "", item.summary);
    const meta = createElement("div", "item-meta");
    meta.append(createBadge("risk", item.riskLevel), createBadge("confidence", item.confidenceLevel), createBadge("audit", item.auditState));
    button.append(top, title, summary, meta);
    button.addEventListener("click", () => selectItem(item.reviewItemId));
    return button;
  }

  function renderList() {
    const visibleItems = filteredItems();
    const list = document.getElementById("review-list");
    const empty = document.getElementById("empty-state");
    document.getElementById("visible-count").textContent = `${toFaNumber(visibleItems.length)} مورد`;
    list.replaceChildren(...visibleItems.map(createReviewItem));
    empty.hidden = visibleItems.length !== 0;

    if (visibleItems.length && !visibleItems.some((item) => item.reviewItemId === selectedId)) {
      selectedId = visibleItems[0].reviewItemId;
      renderList();
      renderDetail();
    }
  }

  function selectItem(reviewItemId) {
    selectedId = reviewItemId;
    renderList();
    renderDetail();
  }

  function statusCard(label, value) {
    const card = createElement("div", "status-card");
    card.append(createElement("span", "", label), createElement("strong", "", value));
    return card;
  }

  function renderDetail() {
    const item = items.find((candidate) => candidate.reviewItemId === selectedId);
    if (!item) return;

    document.getElementById("detail-module").textContent = item.sourceModule;
    document.getElementById("detail-title").textContent = item.title;
    document.getElementById("detail-priority").textContent = labels.priority[item.priority];
    document.getElementById("detail-summary").textContent = item.summary;
    document.getElementById("evidence-summary").textContent = item.evidenceSummary;
    document.getElementById("ai-suggestion").textContent = item.aiSuggestion;

    document.getElementById("detail-statuses").replaceChildren(
      statusCard("ریسک", labels.risk[item.riskLevel]),
      statusCard("اطمینان", labels.confidence[item.confidenceLevel]),
      statusCard("Audit", labels.audit[item.auditState])
    );

    const blockedSection = document.getElementById("blocked-section");
    blockedSection.hidden = !isBlocked(item);
    document.getElementById("blocked-reason").textContent = item.blockedReason;

    const options = document.getElementById("decision-options");
    options.replaceChildren(...item.decisionOptions.map((option) => {
      const button = createElement("button", "concept-action", labels.decision[option]);
      button.type = "button";
      button.dataset.option = option;
      if (isBlocked(item) && option === "approve_concept") button.disabled = true;
      button.addEventListener("click", () => showConceptNotice(option, item));
      return button;
    }));

    const timeline = document.getElementById("audit-timeline");
    timeline.replaceChildren(
      createElement("li", "", `ایجاد item ساختگی در ${item.createdAt}`),
      createElement("li", "", `ثبت وضعیت ${labels.audit[item.auditState]}`),
      createElement("li", "", "نمایش در صف review بدون تغییر وضعیت واقعی")
    );
  }

  function showConceptNotice(option, item) {
    const notice = document.getElementById("concept-notice");
    const actionLabel = labels.decision[option] || option;
    notice.textContent = `${actionLabel} برای «${item.title}» فقط concept است و هیچ عملیات واقعی انجام نمی‌شود.`;
    notice.classList.add("is-visible");
    if (noticeTimer) window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => notice.classList.remove("is-visible"), 3200);
  }

  function bindFilters() {
    const priority = document.getElementById("priority-filter");
    const risk = document.getElementById("risk-filter");
    const audit = document.getElementById("audit-filter");
    priority.addEventListener("change", () => { filters.priority = priority.value; renderList(); });
    risk.addEventListener("change", () => { filters.risk = risk.value; renderList(); });
    audit.addEventListener("change", () => { filters.audit = audit.value; renderList(); });
    document.getElementById("reset-filters").addEventListener("click", () => {
      filters.priority = "all";
      filters.risk = "all";
      filters.audit = "all";
      priority.value = "all";
      risk.value = "all";
      audit.value = "all";
      renderList();
      renderDetail();
    });
  }

  renderSummary();
  renderLanes();
  bindFilters();
  renderList();
  renderDetail();
})();
