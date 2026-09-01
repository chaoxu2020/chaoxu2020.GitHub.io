# Kotoba Align ASR + NER

日语短句音频的 ASR 参考文本校对与 NER 实体标注工具。

公开站点：<https://chaoxu2020.github.io/kotoba-align-asr-ner/>

## 功能

- 导入 `segments.tsv` 与对应音频文件
- 根据实际发音校对 ASR 参考文本
- 从确认后的文本中标注 NER 实体
- 中文与日语界面切换
- 本机浏览器草稿恢复
- 读取已导出的 ASR / NER JSON 与对应音频，恢复为待审核任务
- 分别导出 ASR 与 NER JSON

## 审核已有标注

点击页面右下角“导入 JSON 审核”，可同时选择 `asr_reference_text.json` 与
`ner_entity_info.json`（也兼容只选其中一份或包含 `tasks` 的合并 JSON），再选择对应音频。
工具会按 `segment_id` 合并结果、按 `audio_file` 匹配音频，并恢复 ASR 文本、实体类型与字符位置。
空格、标点或旧字符位置导致的可确定错位会自动修复；仍无法在 ASR 中可靠定位的实体不会阻止整批导入，
对应任务会显示为“待修正”，并保留原实体与当前 ASR 的对照，供审核员重新选择正确文字后确认。
其余导入任务显示为“标注中”，需要审核员逐条确认完成后才能重新导出正式结果。

JSON 与音频仍然只在当前浏览器本机处理，不会上传服务器。

音频和标注草稿不会上传到服务器。

## 部署说明

此仓库保存 `kotoba-align-static-v0.2.0.zip` 的静态构建产物。资源路径已适配 GitHub Pages 项目地址 `/kotoba-align-asr-ner/`，推送到 `main` 后由 GitHub Actions 自动发布。
