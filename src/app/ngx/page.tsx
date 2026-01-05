/* --- MOBILE REFINEMENT: Ensuring 3 in a row --- */
@media (max-width: 768px) {
    .header-wrapper {
        padding: 4px 0 !important; /* تقليل الحشو العلوي والسفلي */
    }
    
    .widgets-grid-container {
        display: flex !important;
        flex-wrap: nowrap !important; /* منع القفز لسطر جديد نهائياً */
        justify-content: space-between !important; 
        gap: 2px !important; /* تقليل المسافة بين الكبسولات لأقصى حد */
        padding: 0 2px !important; /* تقليل الهوامش الجانبية */
        max-width: 100% !important;
        overflow-x: hidden; /* التأكد من عدم وجود تمرير جانبي */
    }

    .widget-item {
        flex: 1 1 auto !important; /* السماح للكبسولات بالتمدد والانكماش حسب المساحة */
        min-width: 0 !important; /* إلغاء الحد الأدنى للسماح بالاصطفاف */
        max-width: 33% !important; /* ضمان أن كل واحدة تأخذ ثلث المساحة بالضبط */
    }
}
