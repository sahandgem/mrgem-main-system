# Manager Review Queue Rollback and Exit Plan

آخرین به‌روزرسانی: 2026-06-30

## وضعیت

این برنامه برای prototype احتمالی آینده است. در CONTROL-P45 هیچ prototype یا state اجرایی برای rollback وجود ندارد.

## Rollback چه زمانی فعال می‌شود؟

- استفاده، مشاهده یا نشت داده واقعی
- اتصال مستقیم یا غیرمستقیم به main
- نیاز به production route یا navigation
- اتصال به database، migration یا backend
- اتصال به auth یا نقش واقعی
- استفاده از localStorage، sessionStorage یا storage واقعی
- ساخت approve، reject، hold، escalate یا status mutation واقعی
- نمایش AI به‌عنوان تصمیم نهایی
- حذف یا پنهان شدن risk، confidence، audit یا blocked reason
- تغییر فایل خارج از file scope مصوب
- نبود test evidence یا rollback owner

## مراحل Rollback

1. توقف فوری build و عدم commit تغییر ناقض boundary.
2. ثبت دلیل، زمان، actor و فایل‌های متاثر.
3. حذف کامل پوشه prototype آینده.
4. حذف mock fixture و mock service مخصوص prototype.
5. پاک‌سازی کامل demo state.
6. بررسی `git status` و مقایسه با checkpoint پیش از build.
7. تایید نبود route، storage، database، auth یا production dependency باقی‌مانده.
8. ثبت نتیجه rollback و owner.

## قرارداد Rollback Record

- rollbackReason
- rollbackOwner
- affectedFiles
- startCheckpoint
- removedPrototypePath
- mockStateCleanupResult
- verificationResult
- completedAt
- approvalReference

## Exit Outcomeها

| Outcome | معنی |
|---|---|
| `approved_for_iteration` | فقط اصلاح ایزوله در scope تاییدشده |
| `needs_revision` | بازطراحی و review مجدد لازم است |
| `blocked` | blocker ایمنی مانع ادامه است |
| `rejected` | prototype برای ادامه رد شده است |
| `frozen` | هیچ ادامه‌ای تا approval مستقل مجاز نیست |

## قانون

هیچ build آینده بدون rollback owner، checkpoint، affected file scope و verification plan تایید نمی‌شود.
