var subtotal = 0;

// 遍历 data.js 提供的数组
for (var i = 0; i < filenames.length; i++) {
    var total = calculateTotal(quantities[i], prices[i]);
    subtotal += total;
    
    // 调用 functions.js 中的函数打印 HTML
    outputCartRow(filenames[i], titles[i], quantities[i], prices[i], total);
}