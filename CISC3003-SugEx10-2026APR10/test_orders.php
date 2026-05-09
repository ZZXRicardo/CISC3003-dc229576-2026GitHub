<?php
include 'includes/book-utilities.inc.php';

echo "<h1>订单数据测试</h1>";

// 测试所有客户的订单情况
$test_customers = [2, 3, 4, 5, 6, 7, 16, 17, 18, 19, 22, 23];

foreach ($test_customers as $customer_id) {
    $orders = readOrders($customer_id, 'data/orders.txt');
    echo "<h3>客户 ID: $customer_id</h3>";
    echo "<p>订单数量: " . count($orders) . "</p>";
    if (count($orders) > 0) {
        echo "<table border='1'><tr><th>Order ID</th><th>ISBN</th><th>Title</th><th>Category</th></tr>";
        foreach ($orders as $order) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($order['order_id']) . "</td>";
            echo "<td>" . htmlspecialchars($order['isbn']) . "</td>";
            echo "<td>" . htmlspecialchars($order['title']) . "</td>";
            echo "<td>" . htmlspecialchars($order['category']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p style='color: red;'>该客户没有订单</p>";
    }
    echo "<hr>";
}
?>