// i18n.js — multilingual support (EN / AR / KU)

const TRANSLATIONS = {
  en: {
    nav: { verify: 'Verify Invoice', how: 'How It Works', about: 'About', contact: 'Contact', home: 'Home', myLoans: 'My Loans', products: 'Products', verifyPortal: 'Verification Portal' },
    hero: {
      badge: '🔒 Secure Document Verification',
      title: 'Verify Invoice <span class="gradient-text">Authenticity</span>',
      desc: 'Instantly verify any invoice or document issued by SHIRWAN IT. Scan the QR code or enter the invoice number to confirm it\'s genuine.',
      cta: 'Verify Now',
      learn: 'Learn How →'
    },
    stats: { verified: 'Invoices Verified', secure: 'Secure', free: 'Always Free' },
    verify: {
      label: 'Invoice Verification',
      title: 'Check Your Invoice',
      desc: 'Enter the invoice number from the bottom of your document, or scan the QR code directly.',
      tabManual: 'Enter Code',
      tabScan: 'Scan QR',
      placeholder: 'INV-PAY-ABC123-XYZ...',
      btn: 'Verify Invoice',
      startCamera: 'Start Camera',
      stopCamera: 'Stop Camera',
      scanHint: 'Point your camera at the QR code on the invoice',
      cameraNote: 'Camera permission is required. Your camera is never recorded.',
      recent: 'Recent Verifications'
    },
    result: {
      verified: 'Verified & Authentic',
      verifiedSub: 'This invoice is genuine and was issued by',
      notFound: 'Invoice Not Found',
      notFoundSub: 'No invoice with this code exists in our system.',
      invoice: 'Invoice #',
      customer: 'Customer',
      amount: 'Amount',
      date: 'Date',
      type: 'Type',
      status: 'Status',
      company: 'Company',
      created: 'Issued On',
      verifyCount: 'Times Verified',
      downloadBtn: 'Download Report',
      verifyAnotherBtn: 'Verify Another',
      paymentType: 'Payment Invoice',
      loanType: 'Loan Agreement',
      customerType: 'Customer Statement',
      companyDebtType: 'Company Debt Invoice'
    },
    how: {
      label: 'Simple Process',
      title: 'How Verification Works',
      desc: 'Three steps to confirm any invoice is authentic.',
      step1Title: 'Receive Invoice',
      step1Desc: 'Get your invoice from SHIRWAN IT. Every invoice has a unique QR code and invoice number at the bottom.',
      step2Title: 'Scan or Enter Code',
      step2Desc: 'Scan the QR code with your phone camera, or manually type the invoice number into the field above.',
      step3Title: 'Instant Result',
      step3Desc: 'We check our secure database in real time and show you full invoice details — customer, amount, date, and status.'
    },
    about: {
      label: 'About the System',
      title: 'Built for Trust & Transparency',
      desc1: 'SHIRWAN IT is a professional desktop application for managing loans, customers, and payments. Every invoice it generates carries a unique verification code.',
      desc2: 'This public verification portal lets anyone confirm that an invoice is genuine and has not been altered.',
      feat1: 'Real-time Firebase database lookup',
      feat2: 'Supports English, Arabic & Kurdish',
      feat3: 'Works on mobile & desktop',
      feat4: 'Free forever — no account needed'
    },
    footer: { rights: 'All rights reserved.', homeLink: 'Home', internetLink: 'Internet', solarLink: 'Solar', cameraLink: 'Camera', aboutLink: 'About Us', contactLink: 'Contact', emailLink: 'Email' },
    internet: {
      label: 'Internet Services',
      title: 'High-Speed Connectivity',
      desc: 'Reliable internet solutions for homes and businesses across Kurdistan.',
      card1Title: 'Home Broadband', card1Desc: 'Fast, stable home internet with unlimited data and 24/7 support.', card1Tag: 'From 10 Mbps',
      card2Title: 'Business Fibre', card2Desc: 'Enterprise-grade fibre connections with SLA guarantees and dedicated support.', card2Tag: 'Up to 1 Gbps',
      card3Title: 'Network Setup', card3Desc: 'Professional installation, routing, and network configuration for your premises.', card3Tag: 'Full setup included'
    },
    solar: {
      label: 'Solar Energy',
      title: 'Clean Power Solutions',
      desc: 'Solar panel systems for homes and businesses — reduce your electricity bill and help the environment.',
      card1Title: 'Residential Solar', card1Desc: 'Rooftop solar panels designed for homes, with full installation and warranty.', card1Tag: '3 kW – 20 kW',
      card2Title: 'Commercial Solar', card2Desc: 'Large-scale solar systems for businesses, factories, and commercial properties.', card2Tag: '20 kW – 500 kW',
      card3Title: 'Battery Storage', card3Desc: 'Store excess solar energy with battery backup systems for reliable 24/7 power.', card3Tag: 'Backup power'
    },
    cameraSection: {
      label: 'Security Camera Systems',
      title: 'Protect What Matters',
      desc: 'Professional CCTV and IP camera installations for homes, shops, and offices.',
      card1Title: 'CCTV Systems', card1Desc: 'HD CCTV cameras with night vision, motion detection, and remote viewing.', card1Tag: '1080p / 4K',
      card2Title: 'IP Cameras', card2Desc: 'Smart IP cameras with cloud storage, AI detection, and smartphone alerts.', card2Tag: 'Cloud enabled',
      card3Title: 'NVR / DVR Setup', card3Desc: 'Centralised recording systems with large storage and multi-camera management.', card3Tag: '24/7 recording'
    },
    contact: {
      label: 'Get In Touch',
      title: 'Contact Us',
      desc: 'Have questions about your invoice or our services? Reach out to us.',
      emailLabel: 'Email', phoneLabel: 'Phone', locationLabel: 'Location', locationValue: 'Duhok, Kurdistan Region, Iraq'
    },
    myLoans: {
      badge: '💼 Customer Portal',
      title: 'View Your Loans',
      desc: 'Enter the email address or phone number you provided when registering. We\'ll show all your loans, payments, and remaining balance instantly.',
      byEmail: 'By Email', byPhone: 'By Phone',
      emailLabel: 'Email Address', phoneLabel: 'Phone Number',
      lookupBtn: 'View My Loans',
      privacyNote: '🔒 Only you can see your own loans. Keep your contact info private.',
      notFoundTitle: 'No loans found',
      notFoundDesc: 'We couldn\'t find any loans matching that contact info. Make sure you\'re using the same email/phone you gave when you registered.',
      tryAgain: 'Try Again', loading: 'Looking up your loans…',
      switchAccount: 'Switch Account',
      totalLoans: 'Total Loans', borrowed: 'Total Borrowed', paid: 'Total Paid', remaining: 'Remaining',
      reminderTitle: 'Email Payment Reminders',
      reminderDesc: 'Get an email 3 days before each payment is due.',
      remindersOn: 'Email reminders enabled.', remindersOff: 'Email reminders disabled.',
      reminderError: 'Could not save preference.',
      loanLabel: 'Loan', months: 'months', of: 'of', nextDue: 'Next Due',
      payments: 'Payments', created: 'Created',
      status_active: 'Active', status_overdue: 'Overdue', status_paid: 'Paid Off',
      loanAmount: 'Loan Amount', totalPaid: 'Paid', monthlyPayment: 'Monthly',
      paymentHistory: 'Payment History', upcomingPayments: 'Upcoming Payments',
      noPayments: 'No payments yet.', allPaid: 'All payments completed.',
      overdueLabel: 'OVERDUE', close: 'Close', printStatement: 'Print Statement',
      emptyLoans: 'You have no loans on file yet.', lookupError: 'Lookup failed. Please try again.'
    },
    products: {
      badge: '🛒 Browse Products', title: 'Our Products',
      desc: 'Internet equipment, solar systems, and security cameras — quality products with full warranty.',
      catInternet: 'Internet', catSolar: 'Solar', catCamera: 'Camera',
      loading: 'Loading products…', empty: 'No products in this category yet.',
      viewDetails: 'View', price: 'Price',
      contactHint: '📞 Interested? Contact us to order:',
      addProduct: 'Add Product', backToList: 'Back to Products',
      notFound: 'Product not found.'
    },
    admin: {
      loginTitle: 'Admin Login', loginSub: 'You must be signed in to manage products.',
      signIn: 'Sign In', signOut: 'Sign Out',
      emailLabel: 'Email', passwordLabel: 'Password',
      backToProducts: '← Back to Products', viewProducts: '← View Products',
      tokenTitle: '🔑 GitHub Token (required for image uploads)',
      tokenDesc: 'Images are saved to the gallery/ folder on GitHub via the API. Your token is stored only in this browser.',
      tokenLabel: 'Personal Access Token', saveToken: 'Save Token',
      formTitleAdd: 'Add New Product', formTitleEdit: 'Edit Product',
      nameLabel: 'Product Name', namePlaceholder: 'e.g. TP-Link Wireless Router AC1200',
      categoryLabel: 'Category',
      priceLabel: 'Price (number only)', pricePlaceholder: 'e.g. 75000',
      shortDescLabel: 'Short Description', shortDescPlaceholder: 'One-line summary shown on the card',
      fullDescLabel: 'Full Description', fullDescPlaceholder: 'Full product details, specs, warranty info…',
      publishLabel: 'Publish immediately (visible to public)',
      imagesLabel: 'Product Images (max 10)',
      dropText: 'Click or drag images here', dropSub: 'JPG, PNG, WebP · Max 5 MB each',
      saveProduct: 'Save Product', updateProduct: 'Update Product',
      cancel: 'Cancel / Reset',
      existingProducts: 'Existing Products', allCat: 'All',
      editBtn: 'Edit', deleteBtn: 'Delete', noProducts: 'No products yet.',
      checkingAuth: 'Checking authentication…',
      imgbbTitle: '🖼️ Image Hosting Config (ImgBB)',
      imgbbDesc: 'Free image hosting. Setup: create free account at imgbb.com → go to api.imgbb.com → click "Get API key" → copy and paste it below.',
      imgbbKeyLabel: 'ImgBB API Key',
      saveConfig: 'Save Config'
    }
  },

  ar: {
    nav: { verify: 'التحقق من الفاتورة', how: 'كيف يعمل', about: 'عن النظام', contact: 'اتصل بنا', home: 'الرئيسية', myLoans: 'قروضي', products: 'المنتجات', verifyPortal: 'بوابة التحقق' },
    hero: {
      badge: '🔒 التحقق الآمن من المستندات',
      title: 'تحقق من <span class="gradient-text">صحة الفاتورة</span>',
      desc: 'تحقق فوراً من أي فاتورة صادرة عن نظام إدارة القروض. امسح رمز QR أو أدخل رقم الفاتورة للتأكد من صحتها.',
      cta: 'تحقق الآن',
      learn: 'تعرف على الطريقة ←'
    },
    stats: { verified: 'فاتورة تم التحقق منها', secure: 'آمن', free: 'مجاني دائماً' },
    verify: {
      label: 'التحقق من الفواتير',
      title: 'تحقق من فاتورتك',
      desc: 'أدخل رقم الفاتورة من أسفل المستند، أو امسح رمز QR مباشرة.',
      tabManual: 'أدخل الرمز',
      tabScan: 'مسح QR',
      placeholder: 'INV-PAY-ABC123-XYZ...',
      btn: 'التحقق من الفاتورة',
      startCamera: 'تشغيل الكاميرا',
      stopCamera: 'إيقاف الكاميرا',
      scanHint: 'وجّه الكاميرا نحو رمز QR في الفاتورة',
      cameraNote: 'مطلوب إذن الكاميرا. لن يتم تسجيل الكاميرا أبداً.',
      recent: 'عمليات التحقق الأخيرة'
    },
    result: {
      verified: 'تم التحقق — أصيلة',
      verifiedSub: 'هذه الفاتورة أصيلة وصادرة عن',
      notFound: 'الفاتورة غير موجودة',
      notFoundSub: 'لا توجد فاتورة بهذا الرمز في نظامنا.',
      invoice: 'رقم الفاتورة',
      customer: 'العميل',
      amount: 'المبلغ',
      date: 'التاريخ',
      type: 'النوع',
      status: 'الحالة',
      company: 'الشركة',
      created: 'تاريخ الإصدار',
      verifyCount: 'مرات التحقق',
      downloadBtn: 'تنزيل التقرير',
      verifyAnotherBtn: 'تحقق من أخرى',
      paymentType: 'فاتورة دفع',
      loanType: 'عقد قرض',
      customerType: 'كشف حساب عميل'
    },
    how: {
      label: 'عملية بسيطة',
      title: 'كيف يعمل التحقق',
      desc: 'ثلاث خطوات للتأكد من صحة أي فاتورة.',
      step1Title: 'استلام الفاتورة',
      step1Desc: 'احصل على فاتورتك من نظام إدارة القروض. كل فاتورة تحتوي على رمز QR فريد ورقم فاتورة.',
      step2Title: 'مسح أو إدخال الرمز',
      step2Desc: 'امسح رمز QR باستخدام كاميرا هاتفك، أو اكتب رقم الفاتورة يدوياً.',
      step3Title: 'نتيجة فورية',
      step3Desc: 'نتحقق من قاعدة البيانات الآمنة لحظياً ونعرض لك تفاصيل الفاتورة الكاملة.'
    },
    about: {
      label: 'عن النظام',
      title: 'مبني على الثقة والشفافية',
      desc1: 'نظام إدارة القروض هو تطبيق سطح مكتب احترافي لإدارة القروض والعملاء والمدفوعات.',
      desc2: 'تتيح هذه البوابة العامة للتحقق لأي شخص التأكد من صحة الفاتورة وعدم تعديلها.',
      feat1: 'بحث فوري في قاعدة بيانات Firebase',
      feat2: 'يدعم العربية والإنجليزية والكردية',
      feat3: 'يعمل على الجوال وسطح المكتب',
      feat4: 'مجاني دائماً — لا حاجة لحساب'
    },
    footer: { rights: 'جميع الحقوق محفوظة.', homeLink: 'الرئيسية', internetLink: 'إنترنت', solarLink: 'طاقة شمسية', cameraLink: 'كاميرا', aboutLink: 'عننا', contactLink: 'اتصل بنا', emailLink: 'بريد' },
    internet: {
      label: 'خدمات الإنترنت',
      title: 'اتصال عالي السرعة',
      desc: 'حلول إنترنت موثوقة للمنازل والشركات في كردستان.',
      card1Title: 'الإنترنت المنزلي', card1Desc: 'إنترنت منزلي سريع ومستقر مع بيانات غير محدودة ودعم على مدار الساعة.', card1Tag: 'من 10 ميغابت',
      card2Title: 'ألياف الأعمال', card2Desc: 'اتصالات ألياف بمستوى المؤسسات مع ضمانات SLA ودعم مخصص.', card2Tag: 'حتى 1 جيجابت',
      card3Title: 'إعداد الشبكة', card3Desc: 'تركيب وتوجيه وتكوين شبكة احترافي لمبانيك.', card3Tag: 'الإعداد الكامل مشمول'
    },
    solar: {
      label: 'الطاقة الشمسية',
      title: 'حلول الطاقة النظيفة',
      desc: 'أنظمة الألواح الشمسية للمنازل والشركات — قلل فاتورة الكهرباء وساعد البيئة.',
      card1Title: 'الطاقة الشمسية المنزلية', card1Desc: 'ألواح شمسية على الأسطح مصممة للمنازل مع تركيب كامل وضمان.', card1Tag: '3 كيلوواط – 20 كيلوواط',
      card2Title: 'الطاقة الشمسية التجارية', card2Desc: 'أنظمة شمسية واسعة النطاق للشركات والمصانع والعقارات التجارية.', card2Tag: '20 كيلوواط – 500 كيلوواط',
      card3Title: 'تخزين البطاريات', card3Desc: 'خزن الطاقة الشمسية الزائدة بأنظمة احتياطية للبطاريات للحصول على طاقة موثوقة.', card3Tag: 'طاقة احتياطية'
    },
    cameraSection: {
      label: 'أنظمة كاميرات المراقبة',
      title: 'احمِ ما يهمك',
      desc: 'تركيب كاميرات CCTV وIP احترافي للمنازل والمحلات والمكاتب.',
      card1Title: 'أنظمة CCTV', card1Desc: 'كاميرات CCTV عالية الدقة مع رؤية ليلية وكشف الحركة والمشاهدة عن بُعد.', card1Tag: '1080p / 4K',
      card2Title: 'كاميرات IP', card2Desc: 'كاميرات IP ذكية مع تخزين سحابي وكشف بالذكاء الاصطناعي وتنبيهات الهاتف.', card2Tag: 'مدعومة سحابياً',
      card3Title: 'إعداد NVR / DVR', card3Desc: 'أنظمة تسجيل مركزية مع تخزين كبير وإدارة متعددة الكاميرات.', card3Tag: 'تسجيل 24/7'
    },
    contact: {
      label: 'تواصل معنا',
      title: 'اتصل بنا',
      desc: 'هل لديك أسئلة حول فاتورتك أو خدماتنا؟ تواصل معنا.',
      emailLabel: 'بريد إلكتروني', phoneLabel: 'هاتف', locationLabel: 'الموقع', locationValue: 'دهوك، إقليم كردستان، العراق'
    },
    myLoans: {
      badge: '💼 بوابة العملاء', title: 'عرض قروضك',
      desc: 'أدخل البريد الإلكتروني أو رقم الهاتف الذي سجّلت به. سنعرض لك جميع قروضك ومدفوعاتك والرصيد المتبقي فوراً.',
      byEmail: 'بالبريد الإلكتروني', byPhone: 'برقم الهاتف',
      emailLabel: 'البريد الإلكتروني', phoneLabel: 'رقم الهاتف',
      lookupBtn: 'عرض قروضي',
      privacyNote: '🔒 فقط أنت يمكنك رؤية قروضك. احتفظ ببيانات التواصل الخاصة بك.',
      notFoundTitle: 'لا توجد قروض',
      notFoundDesc: 'لم نجد أي قروض بهذه البيانات. تأكد من استخدام نفس البريد أو الهاتف المسجّل.',
      tryAgain: 'حاول مرة أخرى', loading: 'جارٍ البحث عن قروضك…',
      switchAccount: 'تغيير الحساب',
      totalLoans: 'إجمالي القروض', borrowed: 'إجمالي المقترض', paid: 'إجمالي المدفوع', remaining: 'المتبقي',
      reminderTitle: 'تذكيرات الدفع بالبريد',
      reminderDesc: 'احصل على بريد إلكتروني قبل 3 أيام من موعد كل دفعة.',
      remindersOn: 'تم تفعيل التذكيرات.', remindersOff: 'تم إلغاء التذكيرات.',
      reminderError: 'تعذر حفظ الإعداد.',
      loanLabel: 'قرض', months: 'أشهر', of: 'من', nextDue: 'الدفعة القادمة',
      payments: 'الدفعات', created: 'تاريخ الإنشاء',
      status_active: 'نشط', status_overdue: 'متأخر', status_paid: 'مسدّد',
      loanAmount: 'مبلغ القرض', totalPaid: 'المدفوع', monthlyPayment: 'الدفعة الشهرية',
      paymentHistory: 'سجل الدفعات', upcomingPayments: 'الدفعات القادمة',
      noPayments: 'لا توجد دفعات بعد.', allPaid: 'تمت جميع الدفعات.',
      overdueLabel: 'متأخر', close: 'إغلاق', printStatement: 'طباعة الكشف',
      emptyLoans: 'لا توجد قروض مسجّلة بعد.', lookupError: 'فشل البحث. حاول مرة أخرى.'
    },
    products: {
      badge: '🛒 تصفح المنتجات', title: 'منتجاتنا',
      desc: 'معدات الإنترنت وأنظمة الطاقة الشمسية وكاميرات المراقبة — منتجات عالية الجودة مع ضمان كامل.',
      catInternet: 'إنترنت', catSolar: 'طاقة شمسية', catCamera: 'كاميرات',
      loading: 'جارٍ تحميل المنتجات…', empty: 'لا توجد منتجات في هذه الفئة بعد.',
      viewDetails: 'عرض', price: 'السعر',
      contactHint: '📞 مهتم؟ تواصل معنا للطلب:',
      addProduct: 'إضافة منتج', backToList: 'العودة للمنتجات',
      notFound: 'المنتج غير موجود.'
    },
    admin: {
      loginTitle: 'تسجيل دخول المسؤول', loginSub: 'يجب تسجيل الدخول لإدارة المنتجات.',
      signIn: 'تسجيل الدخول', signOut: 'تسجيل الخروج',
      emailLabel: 'البريد الإلكتروني', passwordLabel: 'كلمة المرور',
      backToProducts: '← العودة للمنتجات', viewProducts: '← عرض المنتجات',
      tokenTitle: '🔑 رمز GitHub (مطلوب لرفع الصور)',
      tokenDesc: 'يتم حفظ الصور في مجلد gallery/ على GitHub عبر الـ API. يُحفظ رمزك في هذا المتصفح فقط.',
      tokenLabel: 'رمز الوصول الشخصي', saveToken: 'حفظ الرمز',
      formTitleAdd: 'إضافة منتج جديد', formTitleEdit: 'تعديل المنتج',
      nameLabel: 'اسم المنتج', namePlaceholder: 'مثال: روتر TP-Link AC1200',
      categoryLabel: 'الفئة',
      priceLabel: 'السعر (أرقام فقط)', pricePlaceholder: 'مثال: 75000',
      shortDescLabel: 'وصف قصير', shortDescPlaceholder: 'ملخص سطر واحد يظهر على البطاقة',
      fullDescLabel: 'وصف كامل', fullDescPlaceholder: 'تفاصيل المنتج الكاملة، المواصفات، معلومات الضمان…',
      publishLabel: 'نشر فوراً (مرئي للعموم)',
      imagesLabel: 'صور المنتج (حتى 10)',
      dropText: 'انقر أو اسحب الصور هنا', dropSub: 'JPG، PNG، WebP · حد أقصى 5 ميغابايت لكل صورة',
      saveProduct: 'حفظ المنتج', updateProduct: 'تحديث المنتج',
      cancel: 'إلغاء / إعادة تعيين',
      existingProducts: 'المنتجات الحالية', allCat: 'الكل',
      editBtn: 'تعديل', deleteBtn: 'حذف', noProducts: 'لا توجد منتجات بعد.',
      checkingAuth: 'جارٍ التحقق من المصادقة…',
      imgbbTitle: '🖼️ إعداد استضافة الصور (ImgBB)',
      imgbbDesc: 'استضافة صور مجانية. الإعداد: أنشئ حساباً مجانياً في imgbb.com ← اذهب إلى api.imgbb.com ← انقر على "Get API key" ← انسخ والصق أدناه.',
      imgbbKeyLabel: 'مفتاح API لـ ImgBB',
      saveConfig: 'حفظ الإعداد'
    }
  },

  ku: {
    nav: { verify: 'پشتڕاستکردنەوەی پسوڵە', how: 'چۆن کار دەکات', about: 'دەربارە', contact: 'پەیوەندی', home: 'سەرەکی', myLoans: 'قەرزەکانم', products: 'بەرهەمەکان', verifyPortal: 'دەرگای پشتڕاستکردنەوە' },
    hero: {
      badge: '🔒 پشتڕاستکردنەوەی بەڵگەنامەی ئاسایشی',
      title: 'پشتڕاستکردنەوەی <span class="gradient-text">ڕاستی پسوڵە</span>',
      desc: 'بە فۆری هەر پسوڵەیەک کە لەلایەن سیستەمی بەڕێوەبردنی قەرز دەرکراوە پشتڕاست بکەرەوە. کۆدی QR بسکانە یان ژمارەی پسوڵەکە بنووسە.',
      cta: 'ئێستا پشتڕاست بکەرەوە',
      learn: 'ئاشنابوون ←'
    },
    stats: { verified: 'پسوڵەی پشتڕاستکراو', secure: 'ئاسایشی', free: 'هەمیشە خۆڕایی' },
    verify: {
      label: 'پشتڕاستکردنەوەی پسوڵە',
      title: 'پسوڵەکەت پشتڕاست بکەرەوە',
      desc: 'ژمارەی پسوڵە لە خوارەوەی بەڵگەکەت بنووسە، یان بەڕاستەوخۆ کۆدی QR بسکانە.',
      tabManual: 'کۆد بنووسە',
      tabScan: 'QR بسکانە',
      placeholder: 'INV-PAY-ABC123-XYZ...',
      btn: 'پسوڵەکە پشتڕاست بکەرەوە',
      startCamera: 'کامێرا دەستپێبکە',
      stopCamera: 'کامێرا ببەستە',
      scanHint: 'کامێراکەت بەرەو کۆدی QR لەسەر پسوڵەکەدا بگێڕە',
      cameraNote: 'مۆڵەتی کامێرا پێویستە. کامێراکەت هەرگیز تۆمار نابێت.',
      recent: 'پشتڕاستکردنەوەی دواتر'
    },
    result: {
      verified: 'پشتڕاستکراو — ڕاستە',
      verifiedSub: 'ئەم پسوڵەیە ڕاستە و دەرکراوە لەلایەن',
      notFound: 'پسوڵە نەدۆزرایەوە',
      notFoundSub: 'هیچ پسوڵەیەک بەم کۆدەوە لە سیستەمەکەماندا نییە.',
      invoice: 'ژمارەی پسوڵە',
      customer: 'کڕیار',
      amount: 'بڕ',
      date: 'ڕۆژ',
      type: 'جۆر',
      status: 'باری',
      company: 'کۆمپانیا',
      created: 'ڕۆژی دەرکردن',
      verifyCount: 'ژمارەی پشتڕاستکردنەوە',
      downloadBtn: 'داگرتنی ڕاپۆرت',
      verifyAnotherBtn: 'یەکێکی تر پشتڕاست بکەرەوە',
      paymentType: 'پسوڵەی پارەدان',
      loanType: 'ڕێکەوتنی قەرز',
      customerType: 'کشتی کڕیار'
    },
    how: {
      label: 'پرۆسەی سادە',
      title: 'پشتڕاستکردنەوە چۆن کار دەکات',
      desc: 'سێ هەنگاو بۆ پشتڕاستکردنەوەی ڕاستی هەر پسوڵەیەک.',
      step1Title: 'پسوڵەکە وەربگرە',
      step1Desc: 'پسوڵەکەت لە سیستەمی بەڕێوەبردنی قەرز وەربگرە. هەر پسوڵەیەک کۆدی QR و ژمارەی پسوڵەی تایبەتی خۆی هەیە.',
      step2Title: 'بسکانە یان کۆد بنووسە',
      step2Desc: 'کۆدی QR بە کامێرای مۆبایلەکەتدا بسکانە، یان ژمارەی پسوڵەکە بە دەست بنووسە.',
      step3Title: 'ئەنجامی فۆری',
      step3Desc: 'بنکەدراوی ئاسایشیمان بە فۆری بپشکنین و وردەکاری تەواوی پسوڵەکەت نیشانت بدەین.'
    },
    about: {
      label: 'دەربارەی سیستەمەکە',
      title: 'دروستکراوە بۆ متمانە و ئاڵوگۆڕی ئاشکرا',
      desc1: 'سیستەمی بەڕێوەبردنی قەرز بەرنامەیەکی ئەسایشی سەر مەیزەیە بۆ بەڕێوەبردنی قەرزەکان، کڕیارەکان و پارەدانەکان.',
      desc2: 'ئەم دەرگایە گشتییە بۆ پشتڕاستکردنەوە ئەیبەخشێت بە هەر کەسێک پشتڕاست بکاتەوە کە پسوڵەکە ڕاستە.',
      feat1: 'گەڕانی فۆری لە بنکەدراوی Firebase',
      feat2: 'پشتگیری ئینگلیزی، عەرەبی و کوردی',
      feat3: 'لەسەر مۆبایل و سەرمەیزیش کار دەکات',
      feat4: 'هەمیشە خۆڕایی — هیچ هەژمارێک پێویست نییە'
    },
    footer: { rights: 'هەموو مافەکان پارێزراون.', homeLink: 'سەرەکی', internetLink: 'ئینتەرنێت', solarLink: 'خۆرئەنەرژی', cameraLink: 'کامێرا', aboutLink: 'دەربارەمان', contactLink: 'پەیوەندی', emailLink: 'ئیمەیڵ' },
    internet: {
      label: 'خزمەتگوزاری ئینتەرنێت',
      title: 'پەیوەندیی بەرزخێرا',
      desc: 'چارەسەری ئینتەرنێتی متمانەپێکراو بۆ ماڵەکان و کارووبارەکان لە کوردستان.',
      card1Title: 'ئینتەرنێتی ماڵەوە', card1Desc: 'ئینتەرنێتی ماڵەوەی خێرا و جێگیر بە داتای نامحدود و پشتگیری ٢٤/٧.', card1Tag: 'لە ١٠ مێگابت',
      card2Title: 'فایبەری کار و کاسبی', card2Desc: 'پەیوەندی فایبەری ئاستی پرۆژەیی بە گەرەنتی SLA و پشتگیری تایبەت.', card2Tag: 'تا ١ گیگابت',
      card3Title: 'ڕێکخستنی تۆڕ', card3Desc: 'دامەزراندن و ڕووتینگ و ڕێکخستنی تۆڕی پیشەیی بۆ بینای تۆ.', card3Tag: 'ڕێکخستنی تەواو دەگیرێتەبەر'
    },
    solar: {
      label: 'وزەی خۆر',
      title: 'چارەسەری وزەی پاک',
      desc: 'سیستەمی پانێلی خۆر بۆ ماڵەکان و کارووبارەکان — فاتووری کارەباکەت کەم بکەرەوە و یارمەتی ژینگەدە.',
      card1Title: 'خۆرئەنەرژی ماڵانە', card1Desc: 'پانێلی خۆری سەر بام دیزاینکراوە بۆ ماڵەکان بە دامەزراندنی تەواو و گەرەنتی.', card1Tag: '٣ کیلۆوات – ٢٠ کیلۆوات',
      card2Title: 'خۆرئەنەرژی بازرگانی', card2Desc: 'سیستەمی خۆرئەنەرژی فراوان بۆ کارووبار، کارخانەکان و خانووەکانی بازرگانی.', card2Tag: '٢٠ کیلۆوات – ٥٠٠ کیلۆوات',
      card3Title: 'هەڵگرتنی باتری', card3Desc: 'وزەی خۆری زیادە هەڵبگرە بە سیستەمی باتری احتیاتی بۆ وزەیەکی متمانەپێکراو.', card3Tag: 'وزەی احتیاتی'
    },
    cameraSection: {
      label: 'سیستەمی کامێرای ئاسایش',
      title: 'لەئەوەی گرنگتە پاراستن بکە',
      desc: 'دامەزراندنی کامێرای CCTV و IP پیشەیی بۆ ماڵەکان، دوکانەکان و ئۆفیسەکان.',
      card1Title: 'سیستەمی CCTV', card1Desc: 'کامێرای CCTV HD بە دیدنی شەو، کتەپرسین بۆ جووڵەکردن، و بینینی لە دوور.', card1Tag: '1080p / 4K',
      card2Title: 'کامێرای IP', card2Desc: 'کامێرای IP زیرەک بە هەڵگرتنی هەور، کتەپرسینی AI، و ئاگادارکردنەوەی مۆبایل.', card2Tag: 'هەور چالاکە',
      card3Title: 'ڕێکخستنی NVR / DVR', card3Desc: 'سیستەمی تۆمارکردنی ناوەندی بە هەڵگرتنی زۆر و بەڕێوەبردنی کامێرای پردار.', card3Tag: 'تۆمارکردنی ٢٤/٧'
    },
    contact: {
      label: 'پەیوەندیمان پێوەبکە',
      title: 'پەیوەندی',
      desc: 'پرسیارت هەیە دەربارەی پسوڵەکەت یان خزمەتگوزاریەکانمان؟ پەیوەندیمان پێوەبکە.',
      emailLabel: 'ئیمەیڵ', phoneLabel: 'تەلەفۆن', locationLabel: 'شوێن', locationValue: 'دهوک، هەرێمی کوردستان، عێراق'
    },
    myLoans: {
      badge: '💼 دەرگای کڕیار', title: 'قەرزەکانت ببینە',
      desc: 'ئیمەیڵ یان ژمارەی تەلەفۆنی تۆمارکراوت بنووسە. هەموو قەرزەکانت، پارەدانەکانت و باقیەکەت بە فۆری نیشانت دەدەین.',
      byEmail: 'بە ئیمەیڵ', byPhone: 'بە تەلەفۆن',
      emailLabel: 'ئیمەیڵ', phoneLabel: 'ژمارەی تەلەفۆن',
      lookupBtn: 'قەرزەکانم ببینە',
      privacyNote: '🔒 تەنها تۆ دەتوانیت قەرزەکانت ببینیت. زانیاری پەیوەندیت بنێ.',
      notFoundTitle: 'هیچ قەرزێک نەدۆزرایەوە',
      notFoundDesc: 'هیچ قەرزێک بەم زانیارییەوە نەدۆزرایەوە. دڵنیابە لەوەی هەمان ئیمەیڵ یان تەلەفۆنی تۆمارکراوت بەکاردەهێنیت.',
      tryAgain: 'دووبارە هەوڵبدە', loading: 'قەرزەکانت دەگەڕێین…',
      switchAccount: 'گۆڕینی هەژمار',
      totalLoans: 'کۆی قەرزەکان', borrowed: 'کۆی قەرزگیراو', paid: 'کۆی پارەدراو', remaining: 'ماوە',
      reminderTitle: 'یادکردنەوەی پارەدان بە ئیمەیڵ',
      reminderDesc: '٣ ڕۆژ پێش کاتی پارەدان ئیمەیڵت دێتێ.',
      remindersOn: 'یادکردنەوەکان چالاک کراون.', remindersOff: 'یادکردنەوەکان ناچالاک کراون.',
      reminderError: 'نەتوانرا ئەنجامەکە پاشەکەوت بکات.',
      loanLabel: 'قەرز', months: 'مانگ', of: 'لە', nextDue: 'پارەدانی داهاتوو',
      payments: 'پارەدانەکان', created: 'ڕۆژی دروستکردن',
      status_active: 'چالاک', status_overdue: 'دواکەوتوو', status_paid: 'تەواوبووە',
      loanAmount: 'بڕی قەرز', totalPaid: 'پارەدراو', monthlyPayment: 'پارەدانی مانگانە',
      paymentHistory: 'مێژووی پارەدان', upcomingPayments: 'پارەدانەکانی داهاتوو',
      noPayments: 'هێشتا هیچ پارەدانێک نییە.', allPaid: 'هەموو پارەدانەکان تەواو بوون.',
      overdueLabel: 'دواکەوتوو', close: 'داخستن', printStatement: 'چاپکردنی کشتی',
      emptyLoans: 'هێشتا هیچ قەرزێک تۆمار نەکراوە.', lookupError: 'گەڕان سەرنەکەوت. دووبارە هەوڵبدە.'
    },
    products: {
      badge: '🛒 بەرهەمەکان ببینە', title: 'بەرهەمەکانمان',
      desc: 'ئامێری ئینتەرنێت، سیستەمی خۆرئەنەرژی، و کامێرای ئاسایش — بەرهەمی بەرزکوالێتی بە گەرەنتیی تەواو.',
      catInternet: 'ئینتەرنێت', catSolar: 'خۆرئەنەرژی', catCamera: 'کامێرا',
      loading: 'بەرهەمەکان بارئەکرێن…', empty: 'هێشتا هیچ بەرهەمێک لەم پۆلێنەدا نییە.',
      viewDetails: 'بینین', price: 'نرخ',
      contactHint: '📞 حازر بیت؟ پەیوەندیمان پێوەبکە بۆ داواکردن:',
      addProduct: 'بەرهەم زیادبکە', backToList: 'گەڕانەوە بۆ بەرهەمەکان',
      notFound: 'بەرهەمەکە نەدۆزرایەوە.'
    },
    admin: {
      loginTitle: 'چوونەژوورەوەی بەڕێوەبەر', loginSub: 'دەبێت بچیتە ژوورەوە بۆ بەڕێوەبردنی بەرهەمەکان.',
      signIn: 'چوونەژوورەوە', signOut: 'چوونەدەرەوە',
      emailLabel: 'ئیمەیڵ', passwordLabel: 'وشەی نهێنی',
      backToProducts: '← گەڕانەوە بۆ بەرهەمەکان', viewProducts: '← بینینی بەرهەمەکان',
      tokenTitle: '🔑 GitHub Token (پێویستە بۆ بارکردنی وێنە)',
      tokenDesc: 'وێنەکان لە مجلد gallery/ لەسەر GitHub پاشەکەوت دەکرێن. نیشانەکەت تەنها لەم براوزەرەدا پاشەکەوت دەکرێت.',
      tokenLabel: 'نیشانەی دەستڕاگەیشتنی کەسی', saveToken: 'پاشەکەوتکردنی نیشانە',
      formTitleAdd: 'بەرهەمی نوێ زیادبکە', formTitleEdit: 'بەرهەم دەستکاری بکە',
      nameLabel: 'ناوی بەرهەم', namePlaceholder: 'نموونە: TP-Link Router AC1200',
      categoryLabel: 'پۆل',
      priceLabel: 'نرخ (ژمارە تەنها)', pricePlaceholder: 'نموونە: 75000',
      shortDescLabel: 'پێناسەی کورت', shortDescPlaceholder: 'کورتەیەک کە لەسەر کارتەکەدا دەردەکەوێت',
      fullDescLabel: 'پێناسەی تەواو', fullDescPlaceholder: 'وردەکاری تەواوی بەرهەم، تایبەتمەندییەکان، زانیاری گەرەنتی…',
      publishLabel: 'بە فۆری بڵاوبکەرەوە (بۆ گشت دیارە)',
      imagesLabel: 'وێنەی بەرهەم (زۆرترین ١٠)',
      dropText: 'کلیک بکە یان وێنەکان ئێرەبکێشە', dropSub: 'JPG، PNG، WebP · زۆرترین ٥ مێگابایت بۆ هەر وێنەیەک',
      saveProduct: 'بەرهەم پاشەکەوت بکە', updateProduct: 'بەرهەم نوێ بکەرەوە',
      cancel: 'ڕەتکردنەوە / ڕیسێت',
      existingProducts: 'بەرهەمە ئێستاکانی', allCat: 'هەموو',
      editBtn: 'دەستکاری', deleteBtn: 'سڕینەوە', noProducts: 'هێشتا هیچ بەرهەمێک نییە.',
      checkingAuth: 'پشکنینی ناسنامە…',
      imgbbTitle: '🖼️ ڕێکخستنی ئەستێنی وێنە (ImgBB)',
      imgbbDesc: 'ئەستێنی وێنەی بەخۆڕایی. ڕێکخستن: ئەکاونتی بەخۆڕایی دروست بکە لە imgbb.com ← بڕۆ بۆ api.imgbb.com ← کلیک بکە لەسەر "Get API key" ← کۆپی بکە و لە خوارەوە بپێچێنەوە.',
      imgbbKeyLabel: 'کلیلی API ی ImgBB',
      saveConfig: 'پاشەکەوتکردنی ڕێکخستن'
    }
  }
};

// ── Language engine ────────────────────────────────────────────────────────

let currentLang = localStorage.getItem('verify_lang') || 'en';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('verify_lang', lang);

  // Update HTML dir
  const isRTL = lang === 'ar' || lang === 'ku';
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

  // Update active button
  ['en','ar','ku'].forEach(l => {
    document.getElementById(`btn-${l}`)?.classList.toggle('active', l === lang);
  });

  applyTranslations();
}

function t(keyPath) {
  const keys = keyPath.split('.');
  let val = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  for (const k of keys) {
    if (val == null) return keyPath;
    val = val[k];
  }
  return val || (TRANSLATIONS.en[keys[0]]?.[keys[1]] ?? keyPath);
}

function applyTranslations() {
  // data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (text && text !== key) el.innerHTML = text;
  });

  // data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const text = t(key);
    if (text && text !== key) el.placeholder = text;
  });

  // Update scan button text if scanner is running
  const scanBtn = document.getElementById('scanBtnText');
  if (scanBtn) {
    scanBtn.textContent = window._scannerRunning ? t('verify.stopCamera') : t('verify.startCamera');
  }
}

// Apply on load
document.addEventListener('DOMContentLoaded', () => setLang(currentLang));
