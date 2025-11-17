import { useState } from "react";
import { useStore } from "../../lib/store";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

export function ReportManagement() {
  const { products, orders, customers } = useStore();

  const generateProductsCSV = () => {
    const headers = ["ID", "Name", "Category", "Price", "Stock", "Tags"];
    const rows = products.map(product => [
      product.id,
      product.name,
      product.category,
      product.price,
      product.stock || 0,
      product.tags?.join("; ") || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    downloadCSV(csv, "products-report.csv");
    toast.success("Products report downloaded!");
  };

  const generateOrdersCSV = () => {
    const headers = ["Order ID", "Customer Name", "Email", "Total Amount", "Status", "Date"];
    const rows = orders.map(order => [
      order.id,
      order.customerName,
      order.customerEmail,
      order.totalAmount,
      order.status,
      new Date(order.createdAt).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    downloadCSV(csv, "orders-report.csv");
    toast.success("Orders report downloaded!");
  };

  const generateCustomersCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Total Orders"];
    const rows = customers.map(customer => {
      const customerOrders = orders.filter(o => o.customerEmail === customer.email).length;
      return [
        customer.id,
        customer.name,
        customer.email,
        customer.phone || "",
        customerOrders,
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    downloadCSV(csv, "customers-report.csv");
    toast.success("Customers report downloaded!");
  };

  const generateSalesCSV = () => {
    const headers = ["Date", "Order ID", "Customer", "Items", "Total Amount", "Status"];
    const rows = orders.map(order => [
      new Date(order.createdAt).toLocaleDateString(),
      order.id,
      order.customerName,
      order.items?.length || 0,
      order.totalAmount,
      order.status,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    downloadCSV(csv, "sales-report.csv");
    toast.success("Sales report downloaded!");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground mb-2">Reports & Analytics</h2>
        <p className="text-muted-foreground">Generate and download business reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-1">Total Products</p>
            <h3>{products.length}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-1">Total Orders</p>
            <h3>{orders.length}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-1">Total Revenue</p>
            <h3>₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-1">Avg Order Value</p>
            <h3>₹{Math.round(averageOrderValue).toLocaleString('en-IN')}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Products Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Export all product data including name, category, price, stock, and tags.
            </p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-foreground">Total Products</p>
                <p className="text-muted-foreground text-sm">{products.length} items</p>
              </div>
            </div>
            <Button onClick={generateProductsCSV} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Products CSV
            </Button>
          </CardContent>
        </Card>

        {/* Orders Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Orders Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Export all order data including customer details, amounts, and status.
            </p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-foreground">Total Orders</p>
                <p className="text-muted-foreground text-sm">{orders.length} orders</p>
              </div>
            </div>
            <Button onClick={generateOrdersCSV} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Orders CSV
            </Button>
          </CardContent>
        </Card>

        {/* Customers Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Customers Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Export customer data including contact information and order history.
            </p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-foreground">Total Customers</p>
                <p className="text-muted-foreground text-sm">{customers.length} customers</p>
              </div>
            </div>
            <Button onClick={generateCustomersCSV} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Customers CSV
            </Button>
          </CardContent>
        </Card>

        {/* Sales Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sales Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Export detailed sales data with dates, amounts, and order status.
            </p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-foreground">Total Revenue</p>
                <p className="text-muted-foreground text-sm">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <Button onClick={generateSalesCSV} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Sales CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>About Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            All reports are generated in CSV (Comma Separated Values) format, which can be opened in Excel, Google Sheets, or any spreadsheet application.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-foreground mb-1">📊 Products Report</p>
              <p className="text-muted-foreground text-xs">
                Complete product catalog with pricing and inventory
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-foreground mb-1">🛒 Orders Report</p>
              <p className="text-muted-foreground text-xs">
                All customer orders with status and amounts
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-foreground mb-1">👥 Customers Report</p>
              <p className="text-muted-foreground text-xs">
                Customer database with contact details
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-foreground mb-1">💰 Sales Report</p>
              <p className="text-muted-foreground text-xs">
                Detailed sales transactions and revenue
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
