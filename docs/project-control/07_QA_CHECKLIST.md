# چک‌لیست ثابت QA پایان هر P

## 1. محدوده و رفتار

- [ ] فقط محدوده همان P تغییر کرده است.
- [ ] feature ممنوع یا refactor خارج از درخواست وارد نشده است.
- [ ] رفتارهای قبلی ناخواسته تغییر نکرده‌اند.
- [ ] داده demo از داده واقعی تفکیک شده است.

## 2. Route و Navigation

- [ ] pathهای قبلی حفظ شده‌اند.
- [ ] route جدید، در صورت مجاز بودن، در manifest و dispatcher ثبت شده است.
- [ ] duplicate path وجود ندارد.
- [ ] direct URL پاسخ 200 می‌دهد.
- [ ] active navigation درست است.
- [ ] lazy route بدون route error بارگذاری می‌شود.

## 3. UI

- [ ] فارسی و RTL حفظ شده است.
- [ ] Dark Mode سازگار است.
- [ ] desktop و mobile overflow ندارند.
- [ ] متن و کنترل‌ها overlap ندارند.
- [ ] loading، empty، error و disabled state بررسی شده‌اند.
- [ ] browser console خطای جدی ندارد.

## 4. Type و منطق

- [ ] TypeScript typeها دقیق‌اند.
- [ ] analyzer/service ورودی را mutate نمی‌کند.
- [ ] boundary و invalid input تست شده است.
- [ ] defaultها از config/service می‌آیند، نه منطق پراکنده.

## 5. Persistence

- [ ] storage key موجود تغییر نکرده است، مگر با migration مصوب.
- [ ] هر localStorage key جدید باید در storage registry و backup coverage بررسی شود.
- [ ] JSON خراب یا storage خالی رفتار امن دارد.
- [ ] reset فقط محدوده موردنظر را reset می‌کند.
- [ ] داده حیاتی در backup/restore policy تعیین تکلیف شده است.
- [ ] عملیات destructive confirmation و snapshot مناسب دارد.

## 6. Baseline و Audit

- [ ] اثر تغییر روی checksum و drift بررسی شده است.
- [ ] اگر backup coverage یا baseline تغییر کرده، legacy baseline و comparable checksum بررسی شده‌اند.
- [ ] warningهای legacy baseline نباید به عنوان data corruption یا خرابی داده نمایش داده شوند.
- [ ] signoff/resignoff در صورت نیاز ثبت می‌شود.
- [ ] event عملیاتی لازم در history ثبت می‌شود.
- [ ] retention/archive با تغییر ناسازگار نشده است.

## 7. Test و Build

- [ ] تست جدید متناسب با ریسک اضافه شده است.
- [ ] `npm test` موفق است.
- [ ] `npm run build` موفق است.
- [ ] warningها ثبت و طبقه‌بندی شده‌اند.
- [ ] dependency سنگین بدون تصمیم اضافه نشده است.
- [ ] bundle size در تغییرات frontend مقایسه شده است.

## 8. مستندات

- [ ] گزارش پایان P کامل است.
- [ ] phase log به‌روزرسانی شده است.
- [ ] current state با کد هم‌خوان است.
- [ ] تصمیم معماری جدید ثبت شده است.
- [ ] parking lot به‌روز شده است.

## قالب گزارش پایان هر P

1. هدف فاز و نتیجه نهایی
2. فایل‌های ساخته یا تغییر داده‌شده
3. routeهای اضافه/تغییرکرده
4. مدل‌ها و storage keyهای اضافه/تغییرکرده
5. service/analyzerهای اضافه/تغییرکرده
6. رفتارهای اصلی پیاده‌سازی‌شده
7. داده‌ها یا integrationهای هنوز mock/ساده
8. تست‌های اضافه‌شده
9. نتیجه `npm test`
10. نتیجه `npm run build` و اندازه bundle
11. warningها و ریسک‌های باقی‌مانده
12. تأیید عدم تغییر موارد ممنوع
13. پیشنهاد P بعدی

## الحاق P28 به QA

- [ ] در صورت اجرای WF-P29، entryهای منتقل‌شده route path صریح دارند و re-export خام از compat layer مرکزی نمی‌کنند.
- [ ] در صورت اجرای WF-P29، route manifest بدون duplicate باقی مانده و مسیرهای مستقیم مهم build می‌شوند.
- [ ] بعد از استخراج component مشترک، مصرف‌کننده‌ها همان رفتار قبلی را حفظ می‌کنند و localStorage/analyzer/service تغییر نمی‌کند.

## چک پیشنهادی برای WF-P29

- [ ] page body منتقل‌شده دیگر `WorkforceRouteAdapter` یا `WorkforcePages` را برای بدنه import نمی‌کند.
- [ ] فایل منتقل‌شده default component واقعی export می‌کند، نه re-export compat.
- [ ] route registry برای page منتقل‌شده همان URL قبلی را نگه می‌دارد.
- [ ] بعد از استخراج، `WorkforcePages.tsx` هم build می‌شود و fallback/compat pageهای باقی‌مانده سالم‌اند.
- [ ] اگر helper مشترک ساخته شد، service/analyzer/model را معکوس import نمی‌کند.
