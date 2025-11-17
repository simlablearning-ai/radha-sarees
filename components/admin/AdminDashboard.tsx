import { useStore } from "../../lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function AdminDashboard() {
  const { products, orders } = useStore();

  // Calculate stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  // Sales data for chart
  const salesData = [
    { month: 'Jan', sales: 45000 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 48000 },
    { month: 'Apr', sales: 61000 },
    { month: 'May', sales: 55000 },
    { month: 'Jun', sales: 67000 },
  ];

  // Category data
  const categoryData = [
    { name: 'Wedding', value: 45, color: 'var(--chart-1)' },
    { name: 'Ethnic', value: 38, color: 'var(--chart-2)' },
    { name: 'Casuals', value: 52, color: 'var(--chart-3)' },
    { name: 'Festival', value: 28, color: 'var(--chart-4)' },
    { name: 'Celebrity', value: 16, color: 'var(--chart-5)' },
  ];

  // Order status data
  const orderStatusData = [
    { status: 'Pending', count: pendingOrders, color: 'var(--chart-4)' },
    { status: 'Processing', count: orders.filter(o => o.status === 'processing').length, color: 'var(--chart-1)' },
    { status: 'Shipped', count: orders.filter(o => o.status === 'shipped').length, color: 'var(--chart-2)' },
    { status: 'Delivered', count: orders.filter(o => o.status === 'delivered').length, color: 'var(--chart-3)' },
  ];

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Revenue",
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: TrendingUp,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">{stat.title}</p>
                    <h3>{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--foreground)" />
                <YAxis stroke="var(--foreground)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  name="Sales (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="status" stroke="var(--foreground)" />
                <YAxis stroke="var(--foreground)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="count" name="Orders">
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(-5).reverse().map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div>
                    <p className="text-foreground">{order.id}</p>
                    <p className="text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        order.status === 'delivered'
                          ? 'bg-chart-3/20 text-chart-3'
                          : order.status === 'pending'
                          ? 'bg-chart-4/20 text-chart-4'
                          : 'bg-chart-1/20 text-chart-1'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
