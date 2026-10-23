# نسخة Python من موقع صحة

هذه نسخة أولية محوّلة من المشروع المرفق إلى Flask، مع الاحتفاظ بواجهة HTML/CSS/JavaScript وأصول الصور، وتوجيه طلب الاستعلام من خلال Cloudflare Worker الحالي. لا تتصل هذه النسخة مباشرةً بـ D1؛ يظل الـ Worker مسؤولًا عن الوصول إلى D1، وأي ملفات مخزنة على R2 يمكن إرجاع روابطها من الـ Worker.

## تشغيل محلي على Windows

1. ثبّتي Python 3.11 أو أحدث من https://www.python.org/downloads/ مع تحديد خيار Add Python to PATH أثناء التثبيت.
2. افتحي Terminal داخل مجلد المشروع.
3. أنشئي بيئة افتراضية وثبّتي الحزم:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   py -m pip install -r requirements.txt
   ```

4. انسخي `.env.example` إلى ملف اسمه `.env`، ثم ضعي رابط الـ Worker والـ secret الصحيحين. لا تشاركي الـ secret ولا ترفعي `.env` إلى GitHub.
5. في PowerShell، عيّني المتغيرات من `.env` يدويًا للجلسة الحالية أو استخدمي أداة تحميل متغيرات بيئة. لتجربة سريعة:

   ```powershell
   $env:SEHA_WORKER_URL="https://YOUR-WORKER.workers.dev"
   $env:SEHA_API_SECRET="YOUR_REAL_SECRET"
   py app.py
   ```

6. افتحي http://127.0.0.1:5000

## نشر مجاني على Render

1. ارفعي ملفات هذا المجلد إلى مستودع GitHub جديد (لا ترفعي `.env` أو أي secret).
2. في Render اختاري New > Blueprint، ثم اربطي المستودع الذي يحتوي على `render.yaml`.
3. أضيفي `SEHA_WORKER_URL` و`SEHA_API_SECRET` من إعدادات Environment في Render.
4. انشري الموقع واختبري الصفحة الرئيسية و`/health` ثم تجربة استعلام حقيقية.

ملاحظة: الخطة المجانية لدى Render قد توقف الخدمة عند عدم الاستخدام؛ أول طلب بعد السكون قد يتأخر. راجعي حدود الخطة الحالية قبل الاعتماد عليها.

## ما تم نقله وما يحتاج اختبارًا

- نقل الصفحة الرئيسية من Blade إلى قالب HTML عادي.
- نقل ملفات CSS وJavaScript والصور الموجودة.
- نقل مسار `/api/seha/inquiries/sick-leave-details` إلى Flask مع التحقق من المدخلات وتمرير الطلب إلى Cloudflare Worker.
- لم يتم تغيير D1 أو R2، ولم تُنقل بيانات أو تُحذف.
- يلزم اختبار الاستعلام الفعلي بعد إدخال secret الصحيح؛ لم يكن secret موجودًا في الأرشيف، وهذا مقصود لأسباب أمنية.
