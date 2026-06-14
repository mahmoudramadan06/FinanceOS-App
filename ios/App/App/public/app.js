// البيانات الأساسية للتطبيق
let financeData = JSON.parse(localStorage.getItem('financeData')) || {
    cash: 0,
    card: 0,
    savings: 0
};

let notificationCooldowns = JSON.parse(localStorage.getItem('notificationCooldowns')) || {};

let myChart;

// عند فتح التطبيق، قم بتحديث الشاشة والرسوم البيانية
window.onload = function() {
    updateUI();
    initChart();
};

// تحديث النصوص والأرقام في الواجهة
function updateUI() {
    document.getElementById('cash-val').innerText = financeData.cash + " ج.م";
    document.getElementById('card-val').innerText = financeData.card + " ج.م";
    document.getElementById('savings-val').innerText = financeData.savings + " ج.م";
    
    let total = financeData.cash + financeData.card + financeData.savings;
    document.getElementById('total-balance').innerText = total + " ج.م";
}

// تشغيل وتحديث الرسم البياني
function initChart() {
    const ctx = document.getElementById('financeChart').getContext('2d');
    
    if (myChart) { myChart.destroy(); } // مسح الرسم القديم لتحديثه
    
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['كاش', 'فيزا', 'تحويش'],
            datasets: [{
                data: [financeData.cash, financeData.card, financeData.savings],
                backgroundColor: ['#4ade80', '#38bdf8', '#f472b6'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: { legend: { labels: { color: 'white' } } }
        }
    });
}

// إضافة معاملة مالية جديدة
function addTransaction() {
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    
    if (!amount || amount <= 0) {
        alert('من فضلك أدخل مبلغ صحيح');
        return;
    }
    
    // إضافة المبلغ للمكان المحدد
    financeData[type] += amount;
    
    // حفظ في ذاكرة الهاتف أوفلاين
    localStorage.setItem('financeData', JSON.stringify(financeData));
    
    // تحديث الواجهة والرسم البياني
    updateUI();
    initChart();
    
    // تفريغ خانة المدخلات
    document.getElementById('amount').value = '';
}

// نظام الإشعارات الذكي مع الـ Cooldown
function setNotification() {
    const itemName = document.getElementById('item-name').value;
    const cooldownMin = parseInt(document.getElementById('cooldown-min').value);
    
    if (!itemName || !cooldownMin) {
        alert('أدخل اسم المنتج ومدة المهلة');
        return;
    }
    
    const now = Date.now();
    const lastSent = notificationCooldowns[itemName] || 0;
    const cooldownMs = cooldownMin * 60 * 1000; // تحويل الدقائق لملي ثانية
    
    // التحقق هل التطبيق في فترة الـ Cooldown أم لا؟
    if (now - lastSent < cooldownMs) {
        const timeLeft = Math.ceil((cooldownMs - (now - lastSent)) / 1000 / 60);
        alert(`🚫 هذا التنبيه في فترة Cooldown! انتظر ${timeLeft} دقيقة قبل طلبه مجدداً.`);
        return;
    }
    
    // محاكاة إرسال إشعار محلي (سيتصل بـ Capacitor LocalNotifications لاحقاً)
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🎯 تذكير الشراء: ${itemName}`, { body: `حان وقت تفقد ميزانيتك لشراء المادة` });
    } else {
        // تنبيه عادي للمتصفح إذا لم نكن على الموبايل بعد
        alert(`🔔 إشعار محلي: حان وقت شراء ${itemName}!`);
    }
    
    // تحديث وقت آخر إرسال لحساب الـ Cooldown المرة القادمة
    notificationCooldowns[itemName] = now;
    localStorage.setItem('notificationCooldowns', JSON.stringify(notificationCooldowns));
    
    document.getElementById('item-name').value = '';
    document.getElementById('cooldown-min').value = '';
}