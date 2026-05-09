<?php
// 启用错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'includes/book-utilities.inc.php';

// 读取客户数据
$customers = readCustomers('data/customers.txt');

// 获取当前选中的客户ID
$selectedCustomerId = isset($_GET['customer_id']) ? $_GET['customer_id'] : null;
$selectedCustomer = null;
if ($selectedCustomerId !== null) {
    foreach ($customers as $c) {
        if ($c['id'] == $selectedCustomerId) {
            $selectedCustomer = $c;
            break;
        }
    }
    // 读取该客户的订单
    $orders = readOrders($selectedCustomerId, 'data/orders.txt');
    
    // 调试信息：显示读取的订单数量
    echo "<!-- Debug: selectedCustomerId = " . htmlspecialchars($selectedCustomerId) . " -->";
    echo "<!-- Debug: orders count = " . count($orders) . " -->";
    echo "<!-- Debug: empty(orders) = " . (empty($orders) ? 'true' : 'false') . " -->";
} else {
    $orders = [];
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>DC229576 zhangzhexuan</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>

    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <!-- 改用本地MDL，修复403错误 -->
    <link rel="stylesheet" href="css/material.min.css">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/demo-styles.css">
    
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- 改用本地JS -->
    <script src="js/material.min.js"></script>
    <script src="js/sparklines.js"></script>
    
    <script>
        $(document).ready(function() {
            $('.sparkline').sparkline('html', {
                type: 'bar',
                barColor: '#ff6e40',
                barWidth: 10,
                barSpacing: 2,
                height: '30px'
            });
        });
    </script>
</head>

<body>
    
<div class="mdl-layout mdl-js-layout mdl-layout--fixed-drawer
            mdl-layout--fixed-header">
            
    <?php include 'includes/header.inc.php'; ?>
    <?php include 'includes/left-nav.inc.php'; ?>
    
    <main class="mdl-layout__content mdl-color--grey-50">
        <section class="page-content">

            <div class="mdl-grid">

              <!-- 客户列表表格 -->
              <div class="mdl-cell mdl-cell--7-col card-lesson mdl-card  mdl-shadow--2dp">
                <div class="mdl-card__title mdl-color--orange">
                  <h2 class="mdl-card__title-text">Customer List</h2>
                </div>
                <div class="mdl-card__supporting-text">
                    <table class="mdl-data-table mdl-shadow--2dp">
                      <thead>
                        <tr>
                          <th class="mdl-data-table__cell--non-numeric">ID</th>
                          <th class="mdl-data-table__cell--non-numeric">Customer Name</th>
                          <th class="mdl-data-table__cell--non-numeric">University</th>
                          <th class="mdl-data-table__cell--non-numeric">Sales Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        <?php foreach ($customers as $customer): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($customer['id']); ?></td>
                            <td>
                                <a href="cisc3003-sugex10-after.php?customer_id=<?php echo urlencode($customer['id']); ?>">
                                    <?php echo htmlspecialchars($customer['first_name'] . ' ' . $customer['last_name']); ?>
                                </a>
                            </td>
                            <td><?php echo htmlspecialchars($customer['university']); ?></td>
                            <td>
                                <span class="sparkline"><?php echo htmlspecialchars($customer['sales']); ?></span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                      </tbody>
                    </table>
                </div>
              </div>  <!-- / mdl-cell + mdl-card -->
              
              
            <div class="mdl-grid mdl-cell--5-col">

    
                   <!-- 客户详情卡片 -->
                   <?php if ($selectedCustomer !== null): ?>
                   <div class="mdl-cell mdl-cell--12-col card-lesson mdl-card  mdl-shadow--2dp">
                     <div class="mdl-card__title mdl-color--deep-purple mdl-color-text--white">
                       <h2 class="mdl-card__title-text">Customer Details</h2>
                     </div>
                     <div class="mdl-card__supporting-text">
                         <h4><?php echo htmlspecialchars($selectedCustomer['first_name'] . ' ' . $selectedCustomer['last_name']); ?></h4>
                         <p><strong>Address:</strong> <?php echo htmlspecialchars($selectedCustomer['address']); ?></p>
                         <p><strong>City:</strong> <?php echo htmlspecialchars($selectedCustomer['city']); ?></p>
                         <p><strong>State:</strong> <?php echo htmlspecialchars($selectedCustomer['state']); ?></p>
                         <p><strong>Country:</strong> <?php echo htmlspecialchars($selectedCustomer['country']); ?></p>
                         <p><strong>ZIP:</strong> <?php echo htmlspecialchars($selectedCustomer['zip']); ?></p>
                         <p><strong>Phone:</strong> <?php echo htmlspecialchars($selectedCustomer['phone']); ?></p>
                         <p><strong>Email:</strong> <?php echo htmlspecialchars($selectedCustomer['email']); ?></p>
                         <p><strong>University:</strong> <?php echo htmlspecialchars($selectedCustomer['university']); ?></p>
                     </div>    
                   </div>  <!-- / mdl-cell + mdl-card -->   

                   <!-- 订单详情卡片 -->
                   <div class="mdl-cell mdl-cell--12-col card-lesson mdl-card  mdl-shadow--2dp">
                     <div class="mdl-card__title mdl-color--deep-purple mdl-color-text--white">
                       <h2 class="mdl-card__title-text">Order Details</h2>
                     </div>
                     <div class="mdl-card__supporting-text">       
                         <h4>Orders for <?php echo htmlspecialchars($selectedCustomer['first_name'] . ' ' . $selectedCustomer['last_name']); ?></h4>
                         <?php if (empty($orders)): ?>
                             <p>This customer has no orders.</p>
                         <?php else: ?>
                             <table class="mdl-data-table mdl-shadow--2dp">
                               <thead>
                                 <tr>
                                   <th class="mdl-data-table__cell--non-numeric">Order ID</th>
                                   <th class="mdl-data-table__cell--non-numeric">ISBN</th>
                                   <th class="mdl-data-table__cell--non-numeric">Title</th>
                                   <th class="mdl-data-table__cell--non-numeric">Category</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 <?php foreach ($orders as $order): ?>
                                 <tr>
                                   <td><?php echo htmlspecialchars($order['order_id']); ?></td>
                                   <td><?php echo htmlspecialchars($order['isbn']); ?></td>
                                   <td><?php echo htmlspecialchars($order['title']); ?></td>
                                   <td><?php echo htmlspecialchars($order['category']); ?></td>
                                 </tr>
                                 <?php endforeach; ?>
                               </tbody>
                             </table>
                         <?php endif; ?>
                         </div>    
                    </div>  <!-- / mdl-cell + mdl-card -->             
                   <?php endif; ?>

               </div>   
            
            
            </div>  <!-- / mdl-grid -->    

        </section>
    </main>    
</div>    <!-- / mdl-layout --> 
          
<footer style="text-align: center; padding: 20px; background: linear-gradient(135deg, #263238 0%, #37474f 100%); color: white; border-top: 5px solid #ff6e40; font-size: 20px; font-weight: bold; box-shadow: 0 -5px 15px rgba(0,0,0,0.3); position: fixed; bottom: 0; left: 0; width: 100%; z-index: 1000;">
    <div style="margin-bottom: 5px;">
        <span style="color: #ff6e40; font-size: 22px;">CISC3003 Web Programming</span>
    </div>
    <div style="margin-bottom: 5px;">
        <span style="background-color: #ff6e40; color: white; padding: 4px 12px; border-radius: 20px; font-size: 20px; display: inline-block;">
            DC229576
        </span>
    </div>
    <div style="margin-bottom: 5px;">
        <span style="font-size: 24px; color: #64ffda; text-shadow: 0 2px 4px rgba(0,0,0,0.5); font-weight: bold;">
            zhangzhexuan
        </span>
    </div>
    <div>
        <span style="font-size: 16px; color: #cfd8dc;">2026</span>
    </div>
</footer>
</body>
</html>