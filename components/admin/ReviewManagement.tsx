import { useState } from "react";
import { useStore, ProductReview } from "../../lib/store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Star, Trash2, Plus, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function ReviewManagement() {
  const { products, addReview, deleteReview } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isVerifiedPurchase, setIsVerifiedPurchase] = useState(true);

  // Get all reviews across all products
  const allReviews: (ProductReview & { productName: string })[] = products.flatMap(product => 
    (product.customerReviews || []).map(review => ({
      ...review,
      productName: product.name
    }))
  );

  const handleSubmitReview = () => {
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!customerName.trim() || !title.trim() || !comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    addReview({
      productId: selectedProductId,
      customerName: customerName.trim(),
      rating,
      title: title.trim(),
      comment: comment.trim(),
      isVerifiedPurchase,
      isManualReview: true, // Mark as admin-added review
    });

    toast.success("Review added successfully!");
    
    // Reset form
    setShowAddForm(false);
    setSelectedProductId(null);
    setRating(0);
    setCustomerName("");
    setTitle("");
    setComment("");
    setIsVerifiedPurchase(true);
  };

  const handleDeleteReview = (reviewId: string, productName: string) => {
    if (confirm(`Delete this review for "${productName}"?`)) {
      deleteReview(reviewId);
      toast.success("Review deleted successfully!");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-2">Review Management</h2>
          <p className="text-muted-foreground">
            Manage customer reviews and add manual reviews
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Manual Review
        </Button>
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Add Manual Review
            </CardTitle>
            <CardDescription>
              Add a review on behalf of a customer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Selection */}
            <div className="space-y-2">
              <Label>Select Product *</Label>
              <Select
                value={selectedProductId?.toString() || ""}
                onValueChange={(value) => setSelectedProductId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name *</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., Priya Sharma"
                maxLength={100}
              />
            </div>

            {/* Star Rating Input */}
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className="h-8 w-8 transition-colors cursor-pointer"
                      fill={star <= (hoverRating || rating) ? 'var(--primary)' : 'none'}
                      stroke={star <= (hoverRating || rating) ? 'var(--primary)' : 'var(--muted-foreground)'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div className="space-y-2">
              <Label htmlFor="review-title">Review Title *</Label>
              <Input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sum up the experience in one line"
                maxLength={100}
              />
            </div>

            {/* Review Comment */}
            <div className="space-y-2">
              <Label htmlFor="review-comment">Review *</Label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share the customer's experience..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/1000
              </p>
            </div>

            {/* Verified Purchase Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border">
              <input
                type="checkbox"
                id="verified-purchase"
                checked={isVerifiedPurchase}
                onChange={(e) => setIsVerifiedPurchase(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="verified-purchase" className="cursor-pointer">
                Mark as Verified Purchase
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmitReview} className="flex-1">
                Add Review
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedProductId(null);
                  setRating(0);
                  setCustomerName("");
                  setTitle("");
                  setComment("");
                  setIsVerifiedPurchase(true);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews ({allReviews.length})</CardTitle>
          <CardDescription>
            View and manage all customer reviews across all products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Product Name */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20">
                          {review.productName}
                        </span>
                        {review.isVerifiedPurchase && (
                          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-chart-3/10 border border-chart-3/20">
                            <CheckCircle2 className="h-3 w-3 text-chart-3" />
                            <span className="text-chart-3">Verified Purchase</span>
                          </div>
                        )}
                        {review.isManualReview && (
                          <span className="text-xs px-2 py-1 bg-muted border border-border rounded">
                            Admin Review
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-4 w-4"
                            fill={star <= review.rating ? 'var(--primary)' : 'none'}
                            stroke={star <= review.rating ? 'var(--primary)' : 'var(--muted-foreground)'}
                          />
                        ))}
                      </div>

                      {/* Title */}
                      <p className="text-foreground">{review.title}</p>

                      {/* Comment */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{review.customerName}</span>
                        <span>•</span>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReview(review.id, review.productName)}
                      className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
