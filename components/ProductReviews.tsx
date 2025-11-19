import { useState } from "react";
import { useStore, ProductReview } from "../lib/store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Star, ShoppingBag, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: number;
  productName: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { products, orders, isCustomerAuthenticated, currentCustomer, addReview } = useStore();
  const product = products.find(p => p.id === productId);
  const reviews = product?.customerReviews || [];
  
  // Check if current customer has purchased this product
  const hasPurchased = orders.some(order => 
    order.customerEmail === currentCustomer?.email &&
    order.items.some(item => item.productId === productId) &&
    (order.status === 'delivered' || order.status === 'shipped')
  );

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmitReview = () => {
    if (!isCustomerAuthenticated) {
      toast.error("Please login to submit a review");
      return;
    }

    if (!hasPurchased) {
      toast.error("Only verified customers who have purchased this product can leave reviews");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!title.trim() || !comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    addReview({
      productId,
      customerName: currentCustomer!.name,
      customerId: currentCustomer!.id,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      isVerifiedPurchase: true,
    });

    toast.success("Review submitted successfully!");
    setShowReviewForm(false);
    setRating(0);
    setTitle("");
    setComment("");
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  const averageRating = product?.rating || 0;
  const totalReviews = reviews.length;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Overall Score */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border">
              <div className="text-5xl mb-2" style={{ color: 'var(--primary)' }}>
                {averageRating.toFixed(1)}
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5"
                    fill={star <= Math.round(averageRating) ? 'var(--primary)' : 'none'}
                    stroke={star <= Math.round(averageRating) ? 'var(--primary)' : 'var(--muted-foreground)'}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {totalReviews} customer {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
              {product?.totalSales && (
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{product.totalSales.toLocaleString()}+ bought in past month</span>
                </div>
              )}
            </div>

            {/* Right: Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm text-foreground">{star}</span>
                    <Star className="h-4 w-4" fill="var(--primary)" stroke="var(--primary)" />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: 'var(--primary)'
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          <div className="pt-4 border-t border-border">
            {isCustomerAuthenticated ? (
              hasPurchased ? (
                !showReviewForm ? (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                ) : (
                  <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <h4 className="text-foreground">Write Your Review</h4>
                      <Button variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                    </div>

                    {/* Star Rating Input */}
                    <div className="space-y-2">
                      <Label>Your Rating *</Label>
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
                        placeholder="Sum up your experience in one line"
                        maxLength={100}
                      />
                    </div>

                    {/* Review Comment */}
                    <div className="space-y-2">
                      <Label htmlFor="review-comment">Your Review *</Label>
                      <Textarea
                        id="review-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        maxLength={1000}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {comment.length}/1000
                      </p>
                    </div>

                    <Button onClick={handleSubmitReview} className="w-full">
                      Submit Review
                    </Button>
                  </div>
                )
              ) : (
                <div className="p-4 bg-muted/20 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    Only verified customers who have purchased this product can leave reviews
                  </p>
                </div>
              )
            ) : (
              <div className="p-4 bg-muted/20 rounded-lg border border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Please login to write a review
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-foreground">Customer Reviews</h3>
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review this product!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewItem({ review }: { review: ProductReview }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        {/* Rating and Name */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
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
            <div>
              <p className="text-foreground">{review.title}</p>
            </div>
          </div>
          {review.isVerifiedPurchase && (
            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 border border-primary/20">
              <CheckCircle2 className="h-3 w-3" style={{ color: 'var(--primary)' }} />
              <span style={{ color: 'var(--primary)' }}>Verified Purchase</span>
            </div>
          )}
        </div>

        {/* Review Content */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.comment}
        </p>

        {/* Reviewer Info */}
        <div className="flex items-center gap-3 pt-2 text-sm text-muted-foreground border-t border-border">
          <span>{review.customerName}</span>
          <span>•</span>
          <span>{formatDate(review.createdAt)}</span>
          {review.isManualReview && (
            <>
              <span>•</span>
              <span className="text-xs px-2 py-0.5 rounded bg-muted border border-border">
                Admin Review
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
