// 计算单个商品的总价 (数量 * 单价)
function calculateTotal(quantity, price) {
    return quantity * price;
}

// 动态输出表格的行
function outputCartRow(file, title, quantity, price, total) {
    document.write("<tr>");
    // 注意：根据第一阶段要求，图片放在 images 文件夹下，所以路径是 images/
    document.write("<td><img src='images/" + file + "'></td>");
    document.write("<td>" + title + "</td>");
    document.write("<td>" + quantity + "</td>");
    document.write("<td>$" + price.toFixed(2) + "</td>");
    document.write("<td>$" + total.toFixed(2) + "</td>");
    document.write("</tr>");
}/**
 * 
 */