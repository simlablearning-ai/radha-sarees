import { useState } from "react";
import { useStore } from "../../lib/store";
import { syncedActions } from "../../lib/useData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Search, Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export function OrderManagement() {
  const { orders } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    const success = await syncedActions.updateOrderStatus(orderId, newStatus);
    if (success) {
      toast.success(`Order status updated to ${newStatus}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchQuery) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-chart-4/20 text-chart-4";
      case "processing":
        return "bg-chart-1/20 text-chart-1";
      case "shipped":
        return "bg-chart-2/20 text-chart-2";
      case "delivered":
        return "bg-chart-3/20 text-chart-3";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-2">Order Management</h2>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "processing" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("processing")}
          >
            Processing
          </Button>
          <Button
            variant={statusFilter === "shipped" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("shipped")}
          >
            Shipped
          </Button>
          <Button
            variant={statusFilter === "delivered" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("delivered")}
          >
            Delivered
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {filteredOrders.length} orders
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-foreground">#{order.id}</TableCell>
                      <TableCell className="text-foreground">{order.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">{order.customerEmail}</TableCell>
                      <TableCell className="text-foreground">{order.items?.length || 0} items</TableCell>
                      <TableCell className="text-foreground">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs border-0 ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-foreground mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="text-foreground">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="text-foreground">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="text-foreground">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="text-foreground">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-foreground mb-3">Shipping Address</h3>
                <div className="text-sm">
                  <p className="text-foreground">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-foreground">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}
                  </p>
                  <p className="text-foreground">{selectedOrder.shippingAddress?.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-foreground mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-foreground">{item.name}</p>
                          <p className="text-muted-foreground text-sm">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="text-foreground">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">Free</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">
                    ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Order Status */}
              <div>
                <h3 className="text-foreground mb-3">Order Status</h3>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    handleUpdateStatus(selectedOrder.id, e.target.value);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <Button onClick={() => setIsViewDialogOpen(false)} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
