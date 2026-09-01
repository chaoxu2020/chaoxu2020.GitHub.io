(function () {
  "use strict";

  const STORAGE_PREFIX = "kotoba-align:v2:";
  const CORRECTION_STORAGE_PREFIX = "kotoba-align:review-corrections:";
  const LANGUAGE_KEY = "kotoba-align:language";
  const AUDIO_PATTERN = /\.(wav|mp3|m4a|aac|ogg|flac)$/i;
  const ENTITY_TYPES = new Set([
    "person",
    "birthday",
    "address",
    "phone",
    "policy_number",
    "amount",
    "insurance_company",
  ]);
  const ENTITY_ALIASES = new Map(
    Object.entries({
      person: "person",
      name: "person",
      person_name: "person",
      人名: "person",
      姓名: "person",
      birthday: "birthday",
      birthdate: "birthday",
      date_of_birth: "birthday",
      dob: "birthday",
      生日: "birthday",
      生年月日: "birthday",
      address: "address",
      地址: "address",
      住所: "address",
      phone: "phone",
      telephone: "phone",
      phone_number: "phone",
      电话: "phone",
      电话号码: "phone",
      電話番号: "phone",
      policy_number: "policy_number",
      policy_no: "policy_number",
      保单号: "policy_number",
      保單號: "policy_number",
      保険証券番号: "policy_number",
      amount: "amount",
      money: "amount",
      金额: "amount",
      金額: "amount",
      insurance_company: "insurance_company",
      insurer: "insurance_company",
      保险公司名: "insurance_company",
      保險公司名: "insurance_company",
      保険会社名: "insurance_company",
    }),
  );

  const COPY = {
    zh: {
      launcher: "导入 JSON 审核",
      title: "导入已标注结果进行审核",
      description:
        "选择此前导出的 ASR 与 NER JSON（可单选，也可同时选择两份），再选择对应音频。导入后会恢复文本和实体，并将所有任务设为待审核。",
      jsonLabel: "1. 选择标注结果 JSON",
      jsonHint:
        "支持 asr_reference_text.json、ner_entity_info.json 或包含 tasks 的合并文件",
      audioLabel: "2. 选择对应音频",
      chooseAudio: "选择多个音频",
      chooseFolder: "选择音频目录",
      audioHint: "按 JSON 中的 audio_file 文件名自动匹配，音频不会上传",
      selectedJson: "已选择 JSON",
      selectedAudio: "已选择音频",
      clearAudio: "清空音频",
      cancel: "取消",
      start: "载入并开始审核",
      loading: "正在读取并校验…",
      close: "关闭",
      ready:
        "已恢复 {tasks} 条标注，并自动修复 {repaired} 个实体位置，正在打开审核任务…",
      readyWithCorrections:
        "已恢复 {tasks} 条；自动修复 {repaired} 个实体，另有 {issues} 个实体已标记为待修正。",
      missingJson: "请至少选择一份 JSON 结果文件。",
      missingAudio: "请选择与结果对应的音频文件或音频目录。",
      parseFailed: "JSON 读取失败：{message}",
      unsupportedType: "包含不支持的实体类型：{types}",
      missingAudioFiles: "缺少 {count} 个音频：{names}",
      duplicateAudio: "存在同名音频文件：{names}",
      unrelatedResults:
        "所选 JSON 的 dataset 不一致，请确认它们来自同一批任务。",
      noTasks: "JSON 中没有找到可审核的 tasks。",
      invalidTask: "第 {index} 条任务缺少 segment_id、audio_file 或文本。",
      appNotReady: "原标注界面尚未就绪，请刷新页面后重试。",
      privacy: "结果与音频只在当前浏览器中读取，不会上传服务器。",
      toast: "审核任务已载入，请逐条核对并点击完成。",
      toastWithCorrections: "审核任务已载入；{count} 条任务需要人工修正实体。",
      correctionTaskLabel: "待修正",
      correctionTitle: "待修正实体",
      correctionRemaining: "还有 {count} 条任务待修正",
      correctionDescription:
        "原实体无法在当前 ASR 文本中准确定位，因此未自动写入。请打开对应任务，重新选择正确文字并添加实体。",
      correctionSelectTask: "选择下列任务开始修正：",
      correctionOriginal: "原实体",
      correctionAsr: "当前 ASR",
      correctionResolve: "我已核对并完成修正",
    },
    ja: {
      launcher: "JSON結果をレビュー",
      title: "注釈済みJSONを読み込んでレビュー",
      description:
        "出力済みのASR・NER JSON（1つまたは2つ）と対応音声を選択します。テキストとエンティティを復元し、全タスクをレビュー待ちとして開きます。",
      jsonLabel: "1. 注釈結果JSONを選択",
      jsonHint:
        "asr_reference_text.json、ner_entity_info.json、またはtasksを含む統合JSONに対応",
      audioLabel: "2. 対応音声を選択",
      chooseAudio: "音声を複数選択",
      chooseFolder: "音声フォルダを選択",
      audioHint:
        "JSON内のaudio_file名で照合します。音声はアップロードされません",
      selectedJson: "選択済みJSON",
      selectedAudio: "選択済み音声",
      clearAudio: "音声をクリア",
      cancel: "キャンセル",
      start: "読み込んでレビュー開始",
      loading: "読み込み・検証中…",
      close: "閉じる",
      ready:
        "{tasks}件の注釈を復元し、{repaired}件の位置を自動修正しました。レビュー画面を開いています…",
      readyWithCorrections:
        "{tasks}件を復元し、{repaired}件を自動修正しました。ほか{issues}件を要修正としてマークしました。",
      missingJson: "JSON結果ファイルを1つ以上選択してください。",
      missingAudio:
        "結果に対応する音声ファイルまたは音声フォルダを選択してください。",
      parseFailed: "JSONの読み込みに失敗しました：{message}",
      unsupportedType: "未対応のエンティティ種別があります：{types}",
      missingAudioFiles: "音声が{count}件不足しています：{names}",
      duplicateAudio: "同名の音声ファイルがあります：{names}",
      unrelatedResults:
        "選択したJSONのdatasetが一致しません。同じタスク一式か確認してください。",
      noTasks: "JSON内にレビュー可能なtasksがありません。",
      invalidTask:
        "{index}件目にsegment_id、audio_file、またはテキストがありません。",
      appNotReady:
        "元のアノテーション画面が準備できていません。再読み込み後にお試しください。",
      privacy:
        "結果と音声は現在のブラウザ内だけで読み込まれ、サーバーへ送信されません。",
      toast:
        "レビュータスクを読み込みました。1件ずつ確認して完了してください。",
      toastWithCorrections:
        "レビュータスクを読み込みました。{count}件はエンティティの手動修正が必要です。",
      correctionTaskLabel: "要修正",
      correctionTitle: "要修正エンティティ",
      correctionRemaining: "残り{count}件のタスクを修正してください",
      correctionDescription:
        "元のエンティティを現在のASRテキスト内で正確に特定できなかったため、自動登録していません。対象タスクを開き、正しい文字列を選択して追加してください。",
      correctionSelectTask: "修正するタスクを選択：",
      correctionOriginal: "元のエンティティ",
      correctionAsr: "現在のASR",
      correctionResolve: "確認・修正が完了しました",
    },
  };

  let locale = getLocale();
  let jsonFiles = [];
  const audioFiles = new Map();
  const duplicateAudioNames = new Set();
  let launcher;
  let overlay;
  let dialog;
  let statusNode;
  let jsonCountNode;
  let audioCountNode;
  let submitButton;
  let correctionPanel;
  let correctionHash = "";
  let correctionIssues = new Map();
  let resolvedCorrectionIds = new Set();
  let correctionRenderScheduled = false;
  let lastCorrectionRenderKey = "";

  function getLocale() {
    return window.localStorage.getItem(LANGUAGE_KEY) === "ja" ||
      document.documentElement.lang === "ja"
      ? "ja"
      : "zh";
  }

  function copy(key, replacements) {
    let value = COPY[locale][key] || key;
    for (const [name, replacement] of Object.entries(replacements || {})) {
      value = value.replace(`{${name}}`, String(replacement));
    }
    return value;
  }

  function basename(path) {
    return (
      String(path || "")
        .split(/[\\/]/)
        .pop() || ""
    );
  }

  function stringValue(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function numberValue(value) {
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function canonicalEntityType(value) {
    const raw = stringValue(value);
    if (!raw) return "";
    if (ENTITY_TYPES.has(raw)) return raw;
    return (
      ENTITY_ALIASES.get(raw.toLowerCase()) || ENTITY_ALIASES.get(raw) || ""
    );
  }

  function extractTaskArray(documentValue) {
    if (Array.isArray(documentValue)) return documentValue;
    if (!documentValue || typeof documentValue !== "object") return [];
    if (Array.isArray(documentValue.tasks)) return documentValue.tasks;
    if (Array.isArray(documentValue.results)) return documentValue.results;
    if (documentValue.task && typeof documentValue.task === "object") {
      return [documentValue.task];
    }
    if (
      documentValue.segment_id ||
      documentValue.audio_file ||
      documentValue.audio_id
    ) {
      return [documentValue];
    }
    return [];
  }

  function taskId(task) {
    return stringValue(
      task.segment_id ??
        task.segmentId ??
        task.audio_id ??
        task.audioId ??
        task.id,
    );
  }

  function taskAudioFile(task) {
    return stringValue(
      task.audio_file ??
        task.audioFile ??
        task.audio_name ??
        task.audioName ??
        task.metadata?.audio_file,
    );
  }

  function taskOriginalText(task) {
    return stringValue(
      task.original_reference_text ??
        task.originalReferenceText ??
        task.reference_text ??
        task.referenceText ??
        task.metadata?.text,
    );
  }

  function taskAsrText(task) {
    return stringValue(
      task.asr_reference_text ??
        task.asrText ??
        task.confirmed_asr_text ??
        task.confirmedAsrText ??
        task.corrected_text ??
        task.transcript,
    );
  }

  function sourceHasNer(task) {
    return (
      Object.prototype.hasOwnProperty.call(task, "entities") ||
      Object.prototype.hasOwnProperty.call(task, "annotations") ||
      Object.prototype.hasOwnProperty.call(task, "no_entity") ||
      Object.prototype.hasOwnProperty.call(task, "noEntity")
    );
  }

  function normalizeEntities(
    task,
    asrText,
    segmentId,
    unsupportedTypes,
    issues,
    repairStats,
  ) {
    const rawEntities = Array.isArray(task.entities)
      ? task.entities
      : Array.isArray(task.annotations)
        ? task.annotations
        : [];
    const normalized = [];
    const occupied = [];

    rawEntities.forEach((entity, index) => {
      if (!entity || typeof entity !== "object") return;
      const rawType = stringValue(
        entity.entity_type ??
          entity.entityType ??
          entity.type ??
          task.entity_type,
      );
      const entityType = canonicalEntityType(rawType);
      if (!entityType) {
        if (rawType) unsupportedTypes.add(rawType);
        return;
      }

      const rawText = stringValue(
        entity.ner_entity_text ??
          entity.text ??
          entity.value ??
          entity.entity_text,
      );
      if (!rawText) return;

      let start = numberValue(
        entity.text_start ??
          entity.textStart ??
          entity.char_start ??
          entity.start,
      );
      let end = numberValue(
        entity.text_end ?? entity.textEnd ?? entity.char_end ?? entity.end,
      );
      const declaredStart = start;
      const declaredEnd = end;
      let matchedText = rawText;
      const validRange =
        Number.isInteger(start) &&
        Number.isInteger(end) &&
        start >= 0 &&
        end > start &&
        asrText.slice(start, end) === rawText;

      if (!validRange) {
        start = findAvailableText(asrText, rawText, occupied);
        end = start >= 0 ? start + rawText.length : -1;
        if (start < 0) {
          const compactText = rawText.replace(/[\p{P}\p{Z}\s]+/gu, "");
          if (compactText && compactText !== rawText) {
            start = findAvailableText(asrText, compactText, occupied);
            end = start >= 0 ? start + compactText.length : -1;
            matchedText = compactText;
          }
        }
      }
      if (start < 0 || end <= start) {
        issues.push({
          segmentId,
          entityType,
          rawText,
          normalizedText: rawText.replace(/[\p{P}\p{Z}\s]+/gu, ""),
          declaredStart,
          declaredEnd,
          asrText,
        });
        return;
      }

      if (!validRange) repairStats.count += 1;
      matchedText = asrText.slice(start, end) || matchedText;

      occupied.push([start, end]);
      normalized.push({
        id: `${segmentId}-review-${index + 1}`,
        text: matchedText,
        start,
        end,
        entityType,
      });
    });

    return normalized.sort((left, right) => left.start - right.start);
  }

  function findAvailableText(fullText, text, occupied) {
    let offset = 0;
    while (offset <= fullText.length - text.length) {
      const found = fullText.indexOf(text, offset);
      if (found < 0) return -1;
      const end = found + text.length;
      if (
        !occupied.some(
          ([usedStart, usedEnd]) => found < usedEnd && usedStart < end,
        )
      ) {
        return found;
      }
      offset = found + 1;
    }
    return -1;
  }

  async function parseReviewFiles(files) {
    const documents = [];
    for (const file of files) {
      let parsed;
      try {
        parsed = JSON.parse((await file.text()).replace(/^\uFEFF/, ""));
      } catch (error) {
        throw new Error(
          `${file.name}: ${error instanceof Error ? error.message : "Invalid JSON"}`,
        );
      }
      documents.push({ file, value: parsed });
    }

    const datasets = new Set(
      documents
        .map(({ value }) => stringValue(value && value.dataset))
        .filter(Boolean),
    );
    if (datasets.size > 1) throw new Error(copy("unrelatedResults"));

    const merged = new Map();
    const order = [];
    for (const { value } of documents) {
      const tasks = extractTaskArray(value);
      for (const rawTask of tasks) {
        if (!rawTask || typeof rawTask !== "object") continue;
        const id = taskId(rawTask);
        if (!id) continue;
        if (!merged.has(id)) {
          merged.set(id, { segmentId: id, sources: [] });
          order.push(id);
        }
        merged.get(id).sources.push(rawTask);
      }
    }
    if (order.length === 0) throw new Error(copy("noTasks"));

    const unsupportedTypes = new Set();
    const issues = [];
    const repairStats = { count: 0 };
    const tasks = order.map((id, index) => {
      const mergedTask = merged.get(id);
      const sources = mergedTask.sources;
      const audioFile = sources.map(taskAudioFile).find(Boolean) || "";
      const originalText = sources.map(taskOriginalText).find(Boolean) || "";
      const asrText = sources.map(taskAsrText).find(Boolean) || originalText;
      const metadataSource = sources.find(
        (source) => source.metadata && typeof source.metadata === "object",
      );
      const metadata = metadataSource ? { ...metadataSource.metadata } : {};
      const nerSource = [...sources].reverse().find(sourceHasNer);
      const entities = nerSource
        ? normalizeEntities(
            nerSource,
            asrText,
            id,
            unsupportedTypes,
            issues,
            repairStats,
          )
        : [];
      const rawEntityCount = nerSource
        ? Array.isArray(nerSource.entities)
          ? nerSource.entities.length
          : Array.isArray(nerSource.annotations)
            ? nerSource.annotations.length
            : 0
        : 0;

      if (!audioFile || !originalText || !asrText) {
        throw new Error(copy("invalidTask", { index: index + 1 }));
      }

      const rawMetadataType = stringValue(metadata.entity_type);
      const metadataType = canonicalEntityType(rawMetadataType);
      if (rawMetadataType && !metadataType)
        unsupportedTypes.add(rawMetadataType);
      const rawSourceType = sources
        .map((source) => stringValue(source.entity_type ?? source.entityType))
        .find(Boolean);
      const sourceType = canonicalEntityType(rawSourceType);
      if (rawSourceType && !sourceType) unsupportedTypes.add(rawSourceType);
      const entityType =
        metadataType || sourceType || entities[0]?.entityType || "person";

      return {
        segmentId: id,
        audioFile,
        originalText,
        asrText,
        entityType,
        entities,
        noEntity: Boolean(nerSource) && rawEntityCount === 0,
        metadata,
      };
    });

    if (unsupportedTypes.size > 0) {
      throw new Error(
        copy("unsupportedType", { types: [...unsupportedTypes].join("、") }),
      );
    }
    return { tasks, issues, autoRepaired: repairStats.count };
  }

  function tsvCell(value) {
    const text =
      value == null
        ? ""
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value);
    return /[\t\r\n"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function buildTsv(tasks) {
    const reserved = new Set([
      "segment_id",
      "audio_file",
      "text",
      "entity_type",
    ]);
    const extras = [];
    const seen = new Set();
    tasks.forEach((task) => {
      Object.keys(task.metadata || {}).forEach((key) => {
        if (!reserved.has(key) && !seen.has(key)) {
          seen.add(key);
          extras.push(key);
        }
      });
    });
    const headers = [
      "segment_id",
      "audio_file",
      "text",
      "entity_type",
      ...extras,
    ];
    const rows = tasks.map((task) => {
      const values = {
        ...task.metadata,
        segment_id: task.segmentId,
        audio_file: task.audioFile,
        text: task.originalText,
        entity_type: task.entityType,
      };
      return headers.map((header) => tsvCell(values[header])).join("\t");
    });
    return `${headers.join("\t")}\n${rows.join("\n")}\n`;
  }

  function datasetHash(text) {
    let first = 0x811c9dc5;
    let second = 0x9e3779b9;
    for (let index = 0; index < text.length; index += 1) {
      const code = text.charCodeAt(index);
      first ^= code;
      first = Math.imul(first, 0x1000193);
      second ^= code + index;
      second = Math.imul(second, 0x85ebca6b);
    }
    return `${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0)
      .toString(16)
      .padStart(8, "0")}-${text.length}`;
  }

  function collectAudio(files) {
    for (const file of Array.from(files || [])) {
      if (
        !(file.type || "").startsWith("audio/") &&
        !AUDIO_PATTERN.test(file.name)
      ) {
        continue;
      }
      const name = basename(file.name);
      if (audioFiles.has(name) && audioFiles.get(name) !== file) {
        duplicateAudioNames.add(name);
      }
      audioFiles.set(name, file);
    }
    if (duplicateAudioNames.size > 0) {
      setStatus(
        copy("duplicateAudio", { names: [...duplicateAudioNames].join("、") }),
        true,
      );
    } else {
      setStatus("", false);
    }
    updateCounts();
  }

  function assignFiles(input, files) {
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function storeDrafts(tasks, hash) {
    tasks.forEach((task) => {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}${hash}:${task.segmentId}`,
        JSON.stringify({
          asrText: task.asrText,
          confirmedAsrText: task.asrText,
          asrConfirmed: true,
          entities: task.entities,
          noEntity: task.noEntity,
          warningsAcknowledged: false,
          status: "in_progress",
        }),
      );
    });
  }

  function currentSegmentId() {
    const eyebrow = document.querySelector(".audio-card .eyebrow");
    return eyebrow?.textContent?.replace(/^AUDIO\s*·\s*/i, "").trim() || "";
  }

  function unresolvedCorrectionIds() {
    return [...correctionIssues.keys()].filter(
      (segmentId) => !resolvedCorrectionIds.has(segmentId),
    );
  }

  function persistCorrectionState() {
    if (!correctionHash) return;
    window.localStorage.setItem(
      `${CORRECTION_STORAGE_PREFIX}${correctionHash}`,
      JSON.stringify({ resolved: [...resolvedCorrectionIds] }),
    );
  }

  function activateCorrections(issues, hash) {
    correctionHash = hash;
    correctionIssues = new Map();
    issues.forEach((issue) => {
      const taskIssues = correctionIssues.get(issue.segmentId) || [];
      taskIssues.push(issue);
      correctionIssues.set(issue.segmentId, taskIssues);
    });

    resolvedCorrectionIds = new Set();
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(
          `${CORRECTION_STORAGE_PREFIX}${correctionHash}`,
        ) || "null",
      );
      if (Array.isArray(saved?.resolved)) {
        saved.resolved.forEach((segmentId) => {
          if (correctionIssues.has(segmentId))
            resolvedCorrectionIds.add(segmentId);
        });
      }
    } catch {
      resolvedCorrectionIds = new Set();
    }
    lastCorrectionRenderKey = "";
    scheduleCorrectionRender();
  }

  function navigateToCorrection(segmentId) {
    const select = document.querySelector(".task-navigator select");
    if (!select) return;
    const option = [...select.options].find((item) =>
      item.textContent.includes(`${segmentId} ·`),
    );
    if (!option) return;
    select.value = option.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    scheduleCorrectionRender();
  }

  function markCorrectionResolved(segmentId) {
    if (!segmentId || !correctionIssues.has(segmentId)) return;
    resolvedCorrectionIds.add(segmentId);
    persistCorrectionState();
    lastCorrectionRenderKey = "";
    scheduleCorrectionRender();
  }

  function scheduleCorrectionRender() {
    if (correctionRenderScheduled) return;
    correctionRenderScheduled = true;
    window.requestAnimationFrame(() => {
      correctionRenderScheduled = false;
      renderCorrectionState();
    });
  }

  function renderCorrectionState() {
    if (!correctionPanel || !launcher) return;
    const unresolvedIds = unresolvedCorrectionIds();
    const currentId = currentSegmentId();
    const currentNeedsCorrection = unresolvedIds.includes(currentId);
    const navigator = document.querySelector(".task-navigator");

    navigator?.classList.toggle(
      "has-review-correction",
      currentNeedsCorrection,
    );
    if (navigator) {
      navigator.dataset.reviewCorrectionLabel = currentNeedsCorrection
        ? copy("correctionTaskLabel")
        : "";
    }

    let badge = launcher.querySelector("em");
    if (unresolvedIds.length > 0 && !badge) {
      badge = document.createElement("em");
      launcher.appendChild(badge);
    }
    if (badge) {
      badge.textContent = String(unresolvedIds.length);
      badge.hidden = unresolvedIds.length === 0;
    }

    const renderKey = `${locale}|${currentId}|${unresolvedIds.join("|")}`;
    if (renderKey === lastCorrectionRenderKey) return;
    lastCorrectionRenderKey = renderKey;
    correctionPanel.hidden = unresolvedIds.length === 0;
    correctionPanel.replaceChildren();
    if (unresolvedIds.length === 0) return;

    const header = document.createElement("header");
    const heading = document.createElement("h3");
    heading.textContent = copy("correctionTitle");
    const remaining = document.createElement("strong");
    remaining.textContent = copy("correctionRemaining", {
      count: unresolvedIds.length,
    });
    header.append(heading, remaining);

    const description = document.createElement("p");
    description.textContent = currentNeedsCorrection
      ? copy("correctionDescription")
      : copy("correctionSelectTask");

    const taskList = document.createElement("div");
    taskList.className = "review-correction-tasks";
    unresolvedIds.forEach((segmentId) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = segmentId;
      button.classList.toggle("is-current", segmentId === currentId);
      button.addEventListener("click", () => navigateToCorrection(segmentId));
      taskList.appendChild(button);
    });

    correctionPanel.append(header, description, taskList);
    if (!currentNeedsCorrection) return;

    const issueList = document.createElement("div");
    issueList.className = "review-correction-issues";
    correctionIssues.get(currentId).forEach((issue) => {
      const item = document.createElement("div");
      const originalLabel = document.createElement("span");
      originalLabel.textContent = `${copy("correctionOriginal")} · ${issue.entityType}`;
      const originalValue = document.createElement("strong");
      originalValue.textContent = issue.rawText;
      const asrLabel = document.createElement("span");
      asrLabel.textContent = copy("correctionAsr");
      const asrValue = document.createElement("small");
      asrValue.textContent = issue.asrText;
      item.append(originalLabel, originalValue, asrLabel, asrValue);
      issueList.appendChild(item);
    });

    const resolveButton = document.createElement("button");
    resolveButton.type = "button";
    resolveButton.className = "review-correction-resolve";
    resolveButton.textContent = copy("correctionResolve");
    resolveButton.addEventListener("click", () =>
      markCorrectionResolved(currentId),
    );
    correctionPanel.append(issueList, resolveButton);
  }

  async function startReview() {
    if (jsonFiles.length === 0) return setStatus(copy("missingJson"), true);
    if (audioFiles.size === 0) return setStatus(copy("missingAudio"), true);
    if (duplicateAudioNames.size > 0) {
      return setStatus(
        copy("duplicateAudio", { names: [...duplicateAudioNames].join("、") }),
        true,
      );
    }

    submitButton.disabled = true;
    submitButton.textContent = copy("loading");
    setStatus(copy("loading"), false);

    try {
      const { tasks, issues, autoRepaired } = await parseReviewFiles(jsonFiles);
      const missing = tasks
        .map((task) => basename(task.audioFile))
        .filter((name) => !audioFiles.has(name));
      if (missing.length > 0) {
        throw new Error(
          copy("missingAudioFiles", {
            count: missing.length,
            names: `${missing.slice(0, 5).join("、")}${missing.length > 5 ? "…" : ""}`,
          }),
        );
      }

      const originalImport = document.querySelector("details.task-import");
      const tsvInput = originalImport?.querySelector('input[accept*=".tsv"]');
      const appAudioInput = originalImport?.querySelector(
        'input[multiple][accept*="audio"]',
      );
      const loadButton = originalImport?.querySelector("button.button-primary");
      if (!originalImport || !tsvInput || !appAudioInput || !loadButton) {
        throw new Error(copy("appNotReady"));
      }

      const rawTsv = buildTsv(tasks);
      const hash = datasetHash(rawTsv);
      const tsvFile = new File([rawTsv], "segments.tsv", {
        type: "text/tab-separated-values;charset=utf-8",
      });
      storeDrafts(tasks, hash);
      activateCorrections(issues, hash);
      originalImport.open = true;
      assignFiles(tsvInput, [tsvFile]);
      assignFiles(
        appAudioInput,
        tasks.map((task) => audioFiles.get(basename(task.audioFile))),
      );

      setStatus(
        copy(issues.length > 0 ? "readyWithCorrections" : "ready", {
          tasks: tasks.length,
          repaired: autoRepaired,
          issues: issues.length,
        }),
        false,
      );
      window.setTimeout(() => {
        closeDialog();
        loadButton.click();
        const correctionTaskCount = new Set(
          issues.map((issue) => issue.segmentId),
        ).size;
        showToast(
          copy(correctionTaskCount > 0 ? "toastWithCorrections" : "toast", {
            count: correctionTaskCount,
          }),
        );
        scheduleCorrectionRender();
      }, 180);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(
        message.startsWith("JSON") || /\.json:/i.test(message)
          ? copy("parseFailed", { message })
          : message,
        true,
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = copy("start");
    }
  }

  function setStatus(message, isError) {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.classList.toggle("is-error", Boolean(isError));
    statusNode.hidden = !message;
  }

  function updateCounts() {
    if (jsonCountNode) {
      jsonCountNode.textContent = `${copy("selectedJson")}：${jsonFiles.length}`;
    }
    if (audioCountNode) {
      audioCountNode.textContent = `${copy("selectedAudio")}：${audioFiles.size}`;
    }
  }

  function updateLanguage() {
    locale = getLocale();
    if (!launcher || !dialog) return;
    launcher.querySelector("span").textContent = copy("launcher");
    dialog.querySelector("[data-copy=title]").textContent = copy("title");
    dialog.querySelector("[data-copy=description]").textContent =
      copy("description");
    dialog.querySelector("[data-copy=jsonLabel]").textContent =
      copy("jsonLabel");
    dialog.querySelector("[data-copy=jsonHint]").textContent = copy("jsonHint");
    dialog.querySelector("[data-copy=audioLabel]").textContent =
      copy("audioLabel");
    dialog.querySelector("[data-copy=chooseAudio]").textContent =
      copy("chooseAudio");
    dialog.querySelector("[data-copy=chooseFolder]").textContent =
      copy("chooseFolder");
    dialog.querySelector("[data-copy=audioHint]").textContent =
      copy("audioHint");
    dialog.querySelector("[data-copy=clearAudio]").textContent =
      copy("clearAudio");
    dialog.querySelector("[data-copy=privacy]").textContent = copy("privacy");
    dialog.querySelector("[data-copy=cancel]").textContent = copy("cancel");
    dialog
      .querySelector("[data-copy=close]")
      .setAttribute("aria-label", copy("close"));
    submitButton.textContent = copy("start");
    updateCounts();
    lastCorrectionRenderKey = "";
    scheduleCorrectionRender();
  }

  function openDialog() {
    setStatus("", false);
    overlay.hidden = false;
    document.body.classList.add("review-dialog-open");
    dialog.querySelector('input[type="file"]').focus();
  }

  function closeDialog() {
    overlay.hidden = true;
    document.body.classList.remove("review-dialog-open");
    launcher.focus();
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "review-import-toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.classList.add("is-visible"), 20);
    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 220);
    }, 4200);
  }

  function createUi() {
    launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "review-import-launcher";
    launcher.innerHTML = '<b aria-hidden="true">✓</b><span></span>';
    launcher.addEventListener("click", openDialog);

    overlay = document.createElement("div");
    overlay.className = "review-import-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <section class="review-import-dialog" role="dialog" aria-modal="true" aria-labelledby="review-import-title">
        <header>
          <div>
            <span class="review-import-eyebrow">JSON REVIEW</span>
            <h2 id="review-import-title" data-copy="title"></h2>
          </div>
          <button type="button" class="review-import-close" data-copy="close">×</button>
        </header>
        <p class="review-import-description" data-copy="description"></p>
        <div class="review-import-field">
          <label data-copy="jsonLabel"></label>
          <input class="review-json-input" type="file" accept=".json,application/json" multiple />
          <small data-copy="jsonHint"></small>
          <strong class="review-json-count"></strong>
        </div>
        <div class="review-import-field">
          <label data-copy="audioLabel"></label>
          <div class="review-audio-actions">
            <label class="review-file-button">
              <span data-copy="chooseAudio"></span>
              <input class="review-audio-input" type="file" accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.flac" multiple />
            </label>
            <label class="review-file-button">
              <span data-copy="chooseFolder"></span>
              <input class="review-folder-input" type="file" webkitdirectory directory multiple />
            </label>
            <button type="button" class="review-clear-audio" data-copy="clearAudio"></button>
          </div>
          <small data-copy="audioHint"></small>
          <strong class="review-audio-count"></strong>
        </div>
        <p class="review-import-privacy"><i aria-hidden="true">●</i><span data-copy="privacy"></span></p>
        <div class="review-import-status" role="status" hidden></div>
        <footer>
          <button type="button" class="review-cancel" data-copy="cancel"></button>
          <button type="button" class="review-submit"></button>
        </footer>
      </section>`;

    dialog = overlay.querySelector(".review-import-dialog");
    statusNode = overlay.querySelector(".review-import-status");
    jsonCountNode = overlay.querySelector(".review-json-count");
    audioCountNode = overlay.querySelector(".review-audio-count");
    submitButton = overlay.querySelector(".review-submit");
    correctionPanel = document.createElement("aside");
    correctionPanel.className = "review-correction-panel";
    correctionPanel.setAttribute("aria-live", "polite");
    correctionPanel.hidden = true;

    overlay
      .querySelector(".review-json-input")
      .addEventListener("change", (event) => {
        jsonFiles = Array.from(event.target.files || []);
        setStatus("", false);
        updateCounts();
      });
    overlay
      .querySelector(".review-audio-input")
      .addEventListener("change", (event) => {
        collectAudio(event.target.files);
      });
    overlay
      .querySelector(".review-folder-input")
      .addEventListener("change", (event) => {
        collectAudio(event.target.files);
      });
    overlay
      .querySelector(".review-clear-audio")
      .addEventListener("click", () => {
        audioFiles.clear();
        duplicateAudioNames.clear();
        overlay.querySelector(".review-audio-input").value = "";
        overlay.querySelector(".review-folder-input").value = "";
        setStatus("", false);
        updateCounts();
      });
    overlay
      .querySelector(".review-import-close")
      .addEventListener("click", closeDialog);
    overlay
      .querySelector(".review-cancel")
      .addEventListener("click", closeDialog);
    submitButton.addEventListener("click", startReview);
    overlay.addEventListener("mousedown", (event) => {
      if (event.target === overlay) closeDialog();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !overlay.hidden) closeDialog();
    });

    document.body.append(launcher, correctionPanel, overlay);
    updateLanguage();
  }

  function init() {
    createUi();
    const observer = new MutationObserver(() => {
      const nextLocale = getLocale();
      if (nextLocale !== locale) updateLanguage();
      scheduleCorrectionRender();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  window.KotobaReviewImport = {
    buildTsv,
    datasetHash,
    parseReviewFiles,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
