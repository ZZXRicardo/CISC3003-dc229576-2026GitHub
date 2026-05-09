<?php

// 函数1：读取客户数据到数组
function readCustomers($filename) {
    $customers = [];
    // 确保文件存在
    if (!file_exists($filename)) {
        return $customers;
    }
    $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $fields = explode(';', $line);
        // 期望12个字段，索引0-11
        if (count($fields) >= 12) {
            $customer = [
                'id' => $fields[0],
                'first_name' => $fields[1],
                'last_name' => $fields[2],
                'email' => $fields[3],
                'university' => $fields[4],
                'address' => $fields[5],
                'city' => $fields[6],
                'state' => $fields[7],
                'country' => $fields[8],
                'zip' => $fields[9],
                'phone' => $fields[10],
                'sales' => $fields[11]
            ];
            $customers[] = $customer;
        }
    }
    return $customers;
}

// 函数2：读取特定客户的订单
function readOrders($customer_id, $filename) {
    $orders = [];
    if (!file_exists($filename)) {
        return $orders;
    }
    $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $fields = explode(',', $line); // orders.txt 使用逗号分隔
        if (count($fields) >= 5) {
            // 字段：order_id, customer_id, isbn, title, category
            if ($fields[1] == $customer_id) {
                $order = [
                    'order_id' => $fields[0],
                    'customer_id' => $fields[1],
                    'isbn' => $fields[2],
                    'title' => $fields[3],
                    'category' => $fields[4]
                ];
                $orders[] = $order;
            }
        }
    }
    return $orders;
}

?>
