# Cockpit Prototype Pre-build Checklist

آخرین به‌روزرسانی: 2026-06-29

## وضعیت سند

این checklist باید قبل از هر کدنویسی احتمالی آینده تکمیل و توسط مرکز کنترل بررسی شود. CONTROL-P36 آن را اجرا یا approve نمی‌کند.

## Pre-build Checklist چیست؟

آخرین کنترل ایمنی پیش از ایجاد هر فایل prototype است تا پاک بودن checkpoint، ایزوله بودن محیط، مصنوعی بودن داده‌ها و آماده بودن test/rollback اثبات شود.

## کنترل‌های اجباری

| کنترل | معیار قبولی |
|---|---|
| Working tree | پاک و همگام با checkpoint تاییدشده |
| Backup/checkpoint | commit و امکان بازگشت مشخص است |
| Docs review | اسناد 96 تا 109 بررسی شده‌اند |
| Data boundary | هیچ داده واقعی استفاده نمی‌شود |
| Mock dataset | fixture مصنوعی و expected result تایید شده است |
| Database | هیچ dependency یا تغییری وجود ندارد |
| Auth | هیچ dependency یا تغییری وجود ندارد |
| Route | route اصلی ساخته یا تغییر نمی‌شود |
| Storage | production localStorage یا shared key استفاده نمی‌شود |
| Navigation | main navigation تغییر نمی‌کند |
| Actions | هیچ action برگشت‌ناپذیر یا واقعی وجود ندارد |
| Test plan | command، owner، pass/fail و evidence آماده است |
| Rollback plan | owner، scope و verification آماده است |
| Exit outcome | outcomeهای مجاز و معیار انتخاب مشخص‌اند |
| File scope | فهرست فایل‌های مجاز صریح و محدود است |
| Control approval | تصمیم صریح `approved_for_build` ثبت شده است |

## خروجی checklist

| Outcome | معنی |
|---|---|
| `approved_for_build` | فقط prototype ایزوله در scope مصوب مجاز است |
| `needs_revision` | موارد ناقص باید اصلاح و دوباره review شوند |
| `blocked` | blocker ایمنی یا معماری مانع ساخت است |
| `frozen` | هیچ ادامه‌ای تا دستور مستقل مرکز کنترل مجاز نیست |

## قانون توقف

- هر مورد اجباری ناقص باشد، خروجی نمی‌تواند `approved_for_build` باشد.
- conflict، داده واقعی، production dependency یا rollback نامشخص نتیجه را `blocked` می‌کند.
- بدون `approved_for_build` هیچ کدنویسی cockpit مجاز نیست.

## وضعیت فعلی

Checklist فقط طراحی شده است؛ اجرا نشده و approval ساخت صادر نشده است.
