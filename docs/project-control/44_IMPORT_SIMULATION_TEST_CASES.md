# Import Simulation Test Cases

آخرین به‌روزرسانی: 2026-06-29

## هدف

این سند سناریوهای تست شبیه‌سازی import را قبل از پیاده‌سازی واقعی import تعریف می‌کند. هدف این است که policyهای staging، dry-run، quarantine، confidence، review و rollback قبل از ساخت کد واقعی قابل بررسی باشند.

این سند فقط طراحی تست است و هیچ test runner، کد اجرایی، route، UI، database، migration، auth، repo یا localStorage ایجاد نمی‌کند.

## Import Simulation Test Cases چیست؟

`Import Simulation Test Cases` مجموعه سناریوهای مفهومی است که نشان می‌دهد هر نوع ورودی باید چه staging status، confidence، decision، review و audit output داشته باشد.

## چرا قبل از import واقعی لازم است؟

- قبل از ساخت کد، رفتار مورد انتظار روشن می‌شود.
- خطاهای مهم و edge caseها فراموش نمی‌شوند.
- مرز auto action، review، quarantine و rollback شفاف می‌شود.
- تیم‌های مختلف می‌توانند بدون دست زدن به main روی قراردادها توافق کنند.

## سناریوهای تست

| سناریو | input type | expected staging status | expected confidence | expected decision | expected review requirement | expected audit output | expected rollback requirement |
|---|---|---|---|---|---|---|---|
| valid bank excel | Bank Excel | `approved_for_import` | High | dry-run سپس Import Gate | ندارد یا review سبک | ImportDryRunReport، ImportAuditReference | rollback plan required |
| bank excel with changed columns | Bank Excel | `quarantined` | Low | block تا format approval | manager/admin | BankExcelFormatReport، QuarantineAuditTrail | ندارد تا import نشود |
| bank excel with missing amount | Bank Excel | `validation_failed` | Low | block/request correction | reviewer | ImportDryRunItem error | ندارد تا اصلاح شود |
| duplicate bank transaction | Bank Excel | `duplicate_candidate` | Medium | needs review/mark duplicate | reviewer | Duplicate warning، audit reason | rollback فقط اگر اشتباه import شده باشد |
| mobile receipt without financial event | Mobile receipt | `needs_review` | Medium | attach/create candidate | reviewer | Receipt match evidence | rollback/correction path |
| product excel with duplicate barcode | Product Excel | `duplicate_candidate` | Medium | needs review/mark duplicate | manager برای merge | DuplicateProductWarning | rollback برای merge/update |
| product excel with wrong weight | Product Excel | `validation_failed` | Low | request correction | reviewer | ProductValidationError | ندارد تا اصلاح شود |
| stone bank mismatch | Stone bank | `needs_review` | Medium | map manually یا request correction | reviewer/manager | Mapping warning | correction log |
| group code mismatch | Group codes | `conflict` | Conflict | blocked until decision | manager | Conflict audit | rollback plan اگر mapping اعمال شده باشد |
| production formula with missing material | Production formula input | `validation_failed` | Low | block/request correction | reviewer | Formula validation error | ندارد تا اصلاح شود |
| inventory import with negative stock | Inventory import | `conflict` | Conflict | blocked | manager | InventoryMismatchWarning | rollback plan اگر stock تغییر کرده باشد |
| low confidence match | Any import | `needs_review` | Low | review or blocked | reviewer | ConfidenceAssessment | بسته به اثر |
| conflict case | Any import | `conflict` | Conflict | blocked until manager decision | manager | Conflict report | rollback/correction plan |
| manual only case | Sensitive import | `needs_review` | Manual only | manual decision only | manager/admin | ManualOnlyReason | rollback plan required |

## معیار پذیرش شبیه‌سازی

- هر سناریو باید expected status روشن داشته باشد.
- هیچ conflict نباید approved import شود.
- low confidence نباید auto import شود.
- manual only نباید auto action داشته باشد.
- هر سناریوی sensitive باید audit و rollback readiness داشته باشد.

## محدودیت فعلی

این سند فقط test design است. هیچ تست اجرایی یا dependency جدید اضافه نمی‌شود.
