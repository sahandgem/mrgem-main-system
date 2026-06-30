# Codex Execution Report Standard

آخرین به‌روزرسانی: 2026-06-30

## هدف

هر گزارش Codex باید امکان audit سریع scope، Git، side effect و rollback را برای اتاق کد و اتاق فرمان فراهم کند.

## قالب اجباری گزارش

1. **Branch:** branch اجراشده
2. **Preflight Git Status:** وضعیت پیش از کار و پاک/dirty بودن
3. **Created Files:** فهرست فایل‌های ساخته‌شده
4. **Changed Files:** فهرست فایل‌های تغییرکرده
5. **Unauthorized File Change:** بله/خیر و توضیح
6. **Code Changed:** بله/خیر
7. **src Changed:** بله/خیر
8. **package Changed:** بله/خیر
9. **Database/Auth Changed:** بله/خیر
10. **Storage/API/Backend Added:** بله/خیر
11. **Main Changed:** بله/خیر و hash قبل/بعد
12. **Merge Performed:** بله/خیر
13. **Verification:** test، build، static check یا manual review result
14. **Commit Hash:** hash و message
15. **Push Status:** target branch و نتیجه
16. **Rollback:** روش دقیق بازگشت
17. **Stop Rule Triggered:** بله/خیر و دلیل
18. **Residual Risk:** هشدارهای باقی‌مانده
19. **Next Step:** گام بعدی و approval مورد نیاز

## قواعد گزارش

- موارد انجام‌نشده صریحاً `انجام نشد` نوشته شوند.
- نتیجه manual review با static review مخلوط نشود.
- readiness به‌عنوان approval گزارش نشود.
- merge، implementation و prototype approval مستقل گزارش شوند.
- hash main و branch در ماموریت‌های حساس ثبت شود.
- اگر کار متوقف شد، commit/push انجام نشود مگر دستور صریح برای ثبت report-only وجود داشته باشد.

## قالب کوتاه توقف

- Branch
- Git status
- Stop rule
- شواهد
- فایل‌های متاثر
- آیا تغییر rollback شد
- commit/push انجام شد یا نه
- تصمیم مورد نیاز از اتاق فرمان
