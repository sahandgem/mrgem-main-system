# Project Stop Rules

آخرین به‌روزرسانی: 2026-06-30

## توقف فوری

کار باید فوراً متوقف شود اگر:

- working tree پیش از شروع dirty باشد.
- branch فعلی با branch ماموریت متفاوت باشد.
- فایل غیرمجاز تغییر کند.
- برای تکمیل کار به main merge نیاز باشد.
- تغییر `src` لازم شود ولی scope صریحاً آن را تایید نکرده باشد.
- تغییر `package.json` یا dependency لازم شود.
- database، migration یا auth لازم شود.
- storage، API، backend یا service واقعی لازم شود.
- داده واقعی وارد prototype یا mock fixture شود.
- prototype تاییدشده/frozen بدون approval جدا نیازمند تغییر باشد.
- Codex نتواند rollback، affected files یا verification را توضیح دهد.
- دو workstream همزمان مالک یک فایل حساس باشند.
- route، production navigation یا main behavior خارج از scope لازم شود.
- approval design به‌اشتباه برای prototype/implementation/merge استفاده شود.

## رفتار پس از Stop

1. edit جدید انجام نشود.
2. commit و push انجام نشود.
3. علت، branch، status و فایل‌های متاثر گزارش شوند.
4. تغییرهای همان ماموریت طبق rollback مصوب بازگردانده یا قرنطینه شوند.
5. پاک بودن working tree یا وضعیت دقیق باقی‌مانده گزارش شود.
6. تصمیم مورد نیاز به اتاق فرمان ارجاع شود.

## Stop Outcomeها

- `blocked_scope`
- `blocked_dirty_tree`
- `blocked_branch_conflict`
- `blocked_sensitive_file_conflict`
- `blocked_production_dependency`
- `blocked_real_data`
- `blocked_missing_rollback`
- `frozen_pending_control_room`

## قانون

Codex حق ندارد برای عبور از stop rule راه میان‌بر، dependency جایگزین، branch overwrite یا merge ضمنی ایجاد کند.
