"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Star, 
  Check, 
  Camera, 
  Video, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Search, 
  Filter, 
  ThumbsUp, 
  AlertTriangle, 
  ArrowRight,
  User
} from "lucide-react";

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  color: string;
  size: string;
  fit: "Too Small" | "Slightly Small" | "True to Size" | "Slightly Large" | "Too Large";
  height?: number; // in cm
  weight?: number; // in kg
  recommend: boolean;
  images: string[];
  video?: boolean;
  helpfulCount: number;
  votedHelpful?: boolean;
  sellerReply?: string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  selectedSize?: string;
  selectedColor?: string;
}

const SEEDED_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Sarah M.",
    rating: 5,
    title: "Incredible fit and texture!",
    content: "This is exactly what I was looking for. The fabric is soft yet structured, and it holds its shape beautifully even after multiple washes. The attention to detail in the stitching is noticeable. Highly recommend for any minimalist wardrobe.",
    date: "May 12, 2026",
    verified: true,
    color: "White",
    size: "M",
    fit: "True to Size",
    height: 172,
    weight: 62,
    recommend: true,
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"],
    helpfulCount: 24,
  },
  {
    id: "rev-2",
    author: "David K.",
    rating: 5,
    title: "Perfect minimalist aesthetic",
    content: "Hard to find garments with this drape and fabric weight. It fits perfectly into a minimalist wardrobe. True to size and matches with almost anything. Extremely clean stitching on the sleeve cuffs.",
    date: "April 28, 2026",
    verified: true,
    color: "Black",
    size: "L",
    fit: "True to Size",
    height: 185,
    weight: 80,
    recommend: true,
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"],
    helpfulCount: 18,
  },
  {
    id: "rev-3",
    author: "Emma L.",
    rating: 4,
    title: "High quality, slightly relaxed fit",
    content: "Material is gorgeous and premium. The cut is slightly more relaxed than pictured, which I love, but keep that in mind if you prefer a tighter fit. Will definitely buy in other colors. Length is perfect for styling with heels.",
    date: "April 15, 2026",
    verified: true,
    color: "Beige",
    size: "S",
    fit: "Slightly Large",
    height: 165,
    weight: 54,
    recommend: true,
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800"],
    helpfulCount: 12,
    sellerReply: "Thank you for the detailed feedback, Emma! We deliberately designed this silhouette with a slightly elongated wide-leg shape for an elegant drape, but hemming is always an easy adjustment for flats."
  },
  {
    id: "rev-4",
    author: "Alexander S.",
    rating: 5,
    title: "Beautiful details and leather smell",
    content: "Incredible footwear. The calf leather is exceptionally supple right out of the box—no break-in period required. Elastic gussets are strong, and the double pull-tab makes it a breeze to slip on. Looks stunning with tailored trousers.",
    date: "March 30, 2026",
    verified: true,
    color: "Brown",
    size: "10",
    fit: "True to Size",
    height: 180,
    weight: 75,
    recommend: true,
    images: ["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800"],
    helpfulCount: 8,
  },
  {
    id: "rev-5",
    author: "Victoria B.",
    rating: 5,
    title: "Rich charcoal tone, soft feel",
    content: "I'm in love with this knitwear piece. The charcoal melange tone is deep and versatile. The fabric feels luxurious against the skin and does not scratch at all. I handwashed it once, and it did not lose shape.",
    date: "March 18, 2026",
    verified: true,
    color: "Charcoal",
    size: "M",
    fit: "True to Size",
    height: 170,
    weight: 58,
    recommend: true,
    images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800"],
    helpfulCount: 14,
  },
  {
    id: "rev-6",
    author: "Michael R.",
    rating: 4,
    title: "Sleek look, slightly snug chest",
    content: "Very clean lines. The material feels premium and holds its structure well. It fits perfectly in the sleeves, though it is slightly snug across the chest when fully buttoned. I would size up if you prefer layering thick sweaters under it.",
    date: "March 02, 2026",
    verified: true,
    color: "Navy",
    size: "L",
    fit: "Slightly Small",
    height: 188,
    weight: 85,
    recommend: true,
    images: ["https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800"],
    helpfulCount: 6,
  },
  {
    id: "rev-7",
    author: "Isabella G.",
    rating: 5,
    title: "Perfect addition, but shoulders run small",
    content: "It looks absolutely stunning. The material holds its own, and the design is truly luxury level. Be warned that the shoulders run a bit small. I initially ordered an XS but exchanged it for an S. Customer service made the swap effortless.",
    date: "February 22, 2026",
    verified: true,
    color: "White",
    size: "S",
    fit: "Slightly Small",
    height: 160,
    weight: 48,
    recommend: true,
    images: ["https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800"],
    helpfulCount: 9,
    sellerReply: "Thank you for the review, Isabella! We are glad our support team made the exchange process seamless for you. Enjoy your new size!"
  },
  {
    id: "rev-8",
    author: "Sophia H.",
    rating: 5,
    title: "Thick basic tee, not see-through",
    content: "Finally, a white t-shirt that isn't completely translucent! The cotton has a nice weight to it, feels high quality, and has survived several washes without shrinking. Ordered two more colors.",
    date: "February 10, 2026",
    verified: true,
    color: "White",
    size: "XS",
    fit: "True to Size",
    height: 158,
    weight: 45,
    recommend: true,
    images: [],
    helpfulCount: 3,
  }
];

const KEYWORD_TAGS = [
  "Quality", 
  "Comfort", 
  "Perfect Fit", 
  "Premium Fabric", 
  "Structured Cut", 
  "Slightly Relaxed"
];

export function ProductReviews({ 
  productId, 
  productName,
  selectedSize = "M",
  selectedColor = "Black"
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(SEEDED_REVIEWS);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStars, setFilterStars] = useState<number | null>(null);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterSize, setFilterSize] = useState("All");
  const [filterColor, setFilterColor] = useState("All");
  const [filterMedia, setFilterMedia] = useState("All"); // "All", "With Photos", "With Videos"
  const [sortBy, setSortBy] = useState("newest"); // "newest", "highest", "lowest", "helpful"
  
  // UI states
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedReviewId, setCopiedReviewId] = useState<string | null>(null);

  // New review form states
  const [newRating, setNewRating] = useState(5);
  const [newAuthor, setNewAuthor] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newFit, setNewFit] = useState<ReviewItem["fit"]>("True to Size");
  const [newHeight, setNewHeight] = useState<string>("");
  const [newWeight, setNewWeight] = useState<string>("");
  const [newRecommend, setNewRecommend] = useState(true);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [formSuccess, setFormSuccess] = useState(false);

  // Swipe gesture trackers for mobile Lightbox
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Calculate statistics
  const averageRating = 4.8;
  const totalReviewsCount = 286;
  const recommendPercentage = 96;

  const ratingsBreakdown = [
    { stars: 5, percentage: 84 },
    { stars: 4, percentage: 11 },
    { stars: 3, percentage: 3 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 },
  ];

  // Extract unique sizes and colors from seeded reviews for filters
  const uniqueSizes = Array.from(new Set(reviews.map(r => r.size)));
  const uniqueColors = Array.from(new Set(reviews.map(r => r.color)));

  // Extract all review images for the UGC Gallery
  const ugcImagesList = reviews
    .filter(r => r.images.length > 0)
    .map((r) => ({
      reviewId: r.id,
      imageUrl: r.images[0],
      author: r.author,
      rating: r.rating,
      verified: r.verified,
    }));

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowRight") {
        goToNextImage();
      } else if (e.key === "ArrowLeft") {
        goToPrevImage();
      } else if (e.key === "Escape") {
        setLightboxIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  const goToNextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev < ugcImagesList.length - 1 ? prev + 1 : 0));
  };

  const goToPrevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : ugcImagesList.length - 1));
  };

  // Mobile Swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNextImage();
      } else {
        goToPrevImage();
      }
    }
  };

  // Handle helpful votes
  const handleVoteHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          helpfulCount: r.votedHelpful ? r.helpfulCount - 1 : r.helpfulCount + 1,
          votedHelpful: !r.votedHelpful
        };
      }
      return r;
    }));
  };

  const handleReport = (reviewId: string) => {
    setCopiedReviewId(reviewId);
    setTimeout(() => setCopiedReviewId(null), 2500);
  };

  // Simulation upload images
  const handleSimulateUpload = () => {
    const urls = [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800"
    ];
    // Add random one
    const randomUrl = urls[Math.floor(Math.random() * urls.length)];
    if (newImages.length < 10) {
      setNewImages([...newImages, randomUrl]);
    }
  };

  const handleRemoveUploaded = (index: number) => {
    setNewImages(newImages.filter((_, idx) => idx !== index));
  };

  // Review submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newTitle || !newContent) return;

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: newAuthor,
      rating: newRating,
      title: newTitle,
      content: newContent,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      verified: true, // Mocked as true for buyers
      color: selectedColor,
      size: selectedSize,
      fit: newFit,
      height: newHeight ? parseInt(newHeight, 10) : undefined,
      weight: newWeight ? parseInt(newWeight, 10) : undefined,
      recommend: newRecommend,
      images: newImages,
      helpfulCount: 0,
    };

    // Prepend new review
    setReviews([newReview, ...reviews]);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowWriteModal(false);
      // Reset form fields
      setNewAuthor("");
      setNewTitle("");
      setNewContent("");
      setNewRating(5);
      setNewHeight("");
      setNewWeight("");
      setNewImages([]);
    }, 2000);
  };

  // Sorting & Live filtering logic
  const filteredReviews = reviews
    .filter((r) => {
      // 1. Keyword search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesContent = r.content.toLowerCase().includes(query) || r.title.toLowerCase().includes(query);
        const matchesAuthor = r.author.toLowerCase().includes(query);
        const matchesTags = r.color.toLowerCase().includes(query) || r.size.toLowerCase().includes(query);
        if (!matchesContent && !matchesAuthor && !matchesTags) return false;
      }
      // 2. Star filter
      if (filterStars !== null && r.rating !== filterStars) return false;
      // 3. Verified buyer filter
      if (filterVerifiedOnly && !r.verified) return false;
      // 4. Size filter
      if (filterSize !== "All" && r.size !== filterSize) return false;
      // 5. Color filter
      if (filterColor !== "All" && r.color !== filterColor) return false;
      // 6. Media presence filter
      if (filterMedia === "With Photos" && r.images.length === 0) return false;
      if (filterMedia === "With Videos" && !r.video) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating;
      }
      if (sortBy === "helpful") {
        return b.helpfulCount - a.helpfulCount;
      }
      return 0;
    });

  const renderStars = (ratingValue: number) => {
    return (
      <div className="flex gap-0.5 text-amber-500 font-serif">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-sm">
            {i < ratingValue ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  const activeLightboxReview = lightboxIndex !== null && ugcImagesList[lightboxIndex]
    ? reviews.find(r => r.id === ugcImagesList[lightboxIndex].reviewId)
    : null;

  return (
    <div id="reviews-section" className="py-12 border-t border-secondary mt-16 scroll-mt-24 select-none">
      
      {/* 1. Header ratings section */}
      <div className="flex flex-col items-center justify-center gap-2 mb-10 text-center">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground">Customer Reviews</h2>
        <div className="flex items-center gap-2 mt-1">
          {renderStars(5)}
          <span className="text-sm font-bold text-foreground">{averageRating}</span>
          <span className="text-xs font-semibold text-muted-foreground">({totalReviewsCount} Reviews)</span>
        </div>
      </div>

      {/* 2. Overview Statistics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16 border-y border-secondary/40 py-8 bg-secondary/5">
        
        {/* Overall Breakdown Card */}
        <div className="flex flex-col items-center justify-center text-center p-6 border-b lg:border-b-0 lg:border-r border-secondary/50">
          <span className="text-6xl font-serif font-semibold text-foreground tracking-tight mb-2">4.8</span>
          {renderStars(5)}
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-3.5">
            96% of buyers recommend this product
          </span>
        </div>

        {/* Distribute Rating bars */}
        <div className="flex flex-col gap-3.5 justify-center px-4">
          {ratingsBreakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-4 text-xs">
              <span className="w-12 font-bold text-muted-foreground flex items-center gap-1.5 justify-end">
                {row.stars} ★
              </span>
              <div className="flex-grow h-2 bg-secondary/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-500"
                  style={{ width: `${row.percentage}%` }}
                />
              </div>
              <span className="w-8 text-muted-foreground font-semibold text-right">{row.percentage}%</span>
            </div>
          ))}
        </div>

        {/* Keywords Cloud Tags */}
        <div className="flex flex-col justify-center px-6">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Most Mentioned Keywords
          </span>
          <div className="flex flex-wrap gap-2.5">
            {KEYWORD_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className={`text-[10px] font-semibold uppercase tracking-wider px-3.5 py-2 border rounded-full transition-all duration-200 ${
                  searchQuery.toLowerCase() === tag.toLowerCase()
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-background text-foreground border-secondary/60 hover:border-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Filters, Sort & Search Section */}
      <div className="flex flex-col gap-5 border-t border-secondary py-8 mb-8 mt-12">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Keyword Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews by keyword..."
              className="w-full text-xs pl-10 pr-8 py-2.5 border border-secondary bg-background focus:border-foreground outline-none transition-all rounded-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sorter and CTA write review */}
          <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs p-2 border border-secondary outline-none focus:border-foreground bg-background rounded-sm font-semibold text-foreground select-none"
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>

            <button
              onClick={() => setShowWriteModal(true)}
              className="text-xs font-bold uppercase tracking-widest bg-foreground hover:bg-foreground/90 text-background py-3 px-6 transition-all shadow-sm rounded-sm"
            >
              Write a Review
            </button>
          </div>

        </div>

        {/* Filters Selectors Row */}
        <div className="flex flex-wrap gap-3 items-center text-xs select-none">
          <div className="flex items-center gap-1 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] mr-1">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </div>

          {/* Stars Rating Filter */}
          <select
            value={filterStars === null ? "All" : filterStars}
            onChange={(e) => setFilterStars(e.target.value === "All" ? null : parseInt(e.target.value, 10))}
            className="p-2 border border-secondary bg-background focus:border-foreground outline-none rounded-sm font-medium"
          >
            <option value="All">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Size Filter */}
          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
            className="p-2 border border-secondary bg-background focus:border-foreground outline-none rounded-sm font-medium"
          >
            <option value="All">All Sizes</option>
            {uniqueSizes.map(s => <option key={s} value={s}>Size {s}</option>)}
          </select>

          {/* Color Filter */}
          <select
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
            className="p-2 border border-secondary bg-background focus:border-foreground outline-none rounded-sm font-medium"
          >
            <option value="All">All Colors</option>
            {uniqueColors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Media Filter */}
          <select
            value={filterMedia}
            onChange={(e) => setFilterMedia(e.target.value)}
            className="p-2 border border-secondary bg-background focus:border-foreground outline-none rounded-sm font-medium"
          >
            <option value="All">All Content</option>
            <option value="With Photos">With Photos</option>
            <option value="With Videos">With Videos</option>
          </select>

          {/* Verified buyer Checkbox */}
          <label className="flex items-center gap-2 pl-2 cursor-pointer text-xs font-semibold text-foreground/90">
            <input
              type="checkbox"
              checked={filterVerifiedOnly}
              onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
              className="accent-foreground h-3.5 w-3.5 cursor-pointer"
            />
            Verified Purchases Only
          </label>

          {/* Reset Filters button */}
          {(filterStars !== null || filterVerifiedOnly || filterSize !== "All" || filterColor !== "All" || filterMedia !== "All" || searchQuery) && (
            <button
              onClick={() => {
                setFilterStars(null);
                setFilterVerifiedOnly(false);
                setFilterSize("All");
                setFilterColor("All");
                setFilterMedia("All");
                setSearchQuery("");
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-500 ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 5. Reviews List */}
      <div className="flex flex-col divide-y divide-secondary/40 select-none">
        {filteredReviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground font-medium uppercase tracking-wider">
            No reviews match your filters.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="py-8 flex flex-col gap-4 text-left">
              
              {/* Header: user, rating, date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-foreground border border-secondary font-bold text-xs uppercase">
                    {rev.author.substring(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{rev.author}</span>
                      {rev.verified && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5 stroke-[3]" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">Purchased size {rev.size} / color {rev.color}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1">
                  {renderStars(rev.rating)}
                  <span className="text-[10px] text-muted-foreground font-medium">{rev.date}</span>
                </div>
              </div>

              {/* Body: Title, text */}
              <div className="flex flex-col gap-2">
                <h4 className="font-serif font-bold text-sm text-foreground">{rev.title}</h4>
                <p className="text-xs text-muted-foreground/90 leading-relaxed max-w-3xl whitespace-pre-line">
                  {rev.content}
                </p>
              </div>

              {/* Fit Details Block */}
              <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 bg-secondary/10 p-3 rounded max-w-lg select-none">
                {rev.height && <span>Height: <strong className="text-foreground">{rev.height} cm</strong></span>}
                {rev.weight && <span>Weight: <strong className="text-foreground">{rev.weight} kg</strong></span>}
                <span>Fit: <strong className="text-foreground">{rev.fit}</strong></span>
                <span>Would Recommend: <strong className={rev.recommend ? "text-green-600" : "text-red-500"}>{rev.recommend ? "Yes" : "No"}</strong></span>
              </div>

              {/* Customer review photos */}
              {rev.images.length > 0 && (
                <div className="flex gap-3.5 mt-2 flex-wrap">
                  {rev.images.map((imgUrl, imgIdx) => {
                    // Match with index in ugcImagesList
                    const listIdx = ugcImagesList.findIndex(g => g.imageUrl === imgUrl);
                    return (
                      <div
                        key={imgIdx}
                        onClick={() => listIdx !== -1 && setLightboxIndex(listIdx)}
                        className="h-24 w-18 overflow-hidden border border-secondary/50 rounded-lg shadow-sm hover:scale-[1.03] transition-transform duration-200 cursor-zoom-in bg-secondary/20 flex-shrink-0"
                      >
                        <img src={imgUrl} alt={`Review photo ${imgIdx + 1}`} className="h-full w-full object-cover object-center" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions row: Helpful & Report buttons */}
              <div className="flex gap-4 items-center mt-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <button
                  onClick={() => handleVoteHelpful(rev.id)}
                  className={`flex items-center gap-1.5 hover:text-foreground transition-colors ${rev.votedHelpful ? "text-foreground font-black" : ""}`}
                >
                  <ThumbsUp className={`h-3.5 w-3.5 ${rev.votedHelpful ? "fill-current" : ""}`} /> 
                  Helpful ({rev.helpfulCount})
                </button>
                <span className="text-secondary/40 font-normal">|</span>
                <button
                  onClick={() => handleReport(rev.id)}
                  className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> 
                  {copiedReviewId === rev.id ? "Reported" : "Report"}
                </button>
              </div>

              {/* Nested Seller Reply block */}
              {rev.sellerReply && (
                <div className="ml-4 sm:ml-8 mt-3 p-4 border-l-2 border-foreground/50 bg-secondary/15 rounded-r">
                  <div className="flex items-center gap-2 mb-1.5 text-[9px] font-bold uppercase tracking-widest text-foreground">
                    <span className="bg-foreground text-background px-1.5 py-0.5 rounded-sm">Staff</span> 
                    <span>Atelier Response</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed whitespace-pre-line">
                    "{rev.sellerReply}"
                  </p>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {/* 6. Fullscreen Immersive Lightbox Modal */}
      {lightboxIndex !== null && activeLightboxReview && (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md text-white select-none animate-fadeIn"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top header options */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/40">
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Customer Gallery ({lightboxIndex + 1} / {ugcImagesList.length})
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Center visual pane: Large image & Side card */}
          <div className="flex-grow flex flex-col lg:flex-row items-center justify-center overflow-hidden w-full max-w-7xl mx-auto px-4 gap-8">
            
            {/* Left Image Pane with Slide Buttons */}
            <div className="relative flex-grow flex items-center justify-center max-h-[55vh] lg:max-h-[75vh] max-w-[650px] aspect-[3/4] w-full overflow-hidden bg-zinc-900 border border-white/5 rounded-2xl shadow-2xl">
              <img
                src={ugcImagesList[lightboxIndex].imageUrl}
                alt="Fullscreen wear detail"
                className="h-full w-full object-contain"
              />
              
              {/* Previous Slider */}
              <button
                onClick={goToPrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 transition-colors z-20"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Next Slider */}
              <button
                onClick={goToNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 transition-colors z-20"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Right Side Review Card Pane */}
            <div className="w-full lg:w-96 text-left flex flex-col gap-4 bg-zinc-900 border border-white/10 p-6 rounded-2xl max-h-[35vh] lg:max-h-[75vh] overflow-y-auto scrollbar-thin select-none">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs uppercase">
                    {activeLightboxReview.author.substring(0, 2)}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-bold text-white">{activeLightboxReview.author}</span>
                    {activeLightboxReview.verified && (
                      <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest mt-0.5">Verified Purchase</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end leading-none">
                  {renderStars(activeLightboxReview.rating)}
                  <span className="text-[9px] text-white/50 mt-1 font-semibold">{activeLightboxReview.date}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
                <h4 className="font-serif font-bold text-sm text-white">{activeLightboxReview.title}</h4>
                <p className="text-xs text-white/70 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto pr-1">
                  {activeLightboxReview.content}
                </p>
              </div>

              {/* Fit Info block */}
              <div className="grid grid-cols-2 gap-3 text-[9px] font-bold uppercase tracking-widest text-white/60 bg-white/5 p-3 rounded border border-white/5">
                <div>Size: <strong className="text-white">{activeLightboxReview.size}</strong></div>
                <div>Color: <strong className="text-white">{activeLightboxReview.color}</strong></div>
                {activeLightboxReview.height && <div>Height: <strong className="text-white">{activeLightboxReview.height} cm</strong></div>}
                {activeLightboxReview.weight && <div>Weight: <strong className="text-white">{activeLightboxReview.weight} kg</strong></div>}
                <div className="col-span-2">Fit: <strong className="text-white">{activeLightboxReview.fit}</strong></div>
              </div>

              {/* Modal buttons helpful vote */}
              <button
                onClick={() => handleVoteHelpful(activeLightboxReview.id)}
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded border border-white/10 text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeLightboxReview.votedHelpful 
                    ? "bg-white text-black hover:bg-white/95" 
                    : "bg-transparent text-white hover:bg-white/5"
                }`}
              >
                <ThumbsUp className="h-4 w-4" /> 
                {activeLightboxReview.votedHelpful ? "Voted Helpful" : `Helpful (${activeLightboxReview.helpfulCount})`}
              </button>
            </div>

          </div>

          {/* Bottom strip thumbnails navigation */}
          <div className="px-6 py-4 border-t border-white/10 bg-black/40 select-none">
            <div className="flex gap-2.5 overflow-x-auto justify-center max-w-4xl mx-auto scrollbar-none py-1.5">
              {ugcImagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`h-16 w-12 overflow-hidden rounded bg-zinc-900 border flex-shrink-0 transition-all ${
                    idx === lightboxIndex 
                      ? "border-white scale-[1.08] shadow-lg opacity-100" 
                      : "border-transparent opacity-40 hover:opacity-100"
                  }`}
                  aria-label={`Jump to image ${idx + 1}`}
                >
                  <img src={img.imageUrl} alt="" className="h-full w-full object-cover object-center" />
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 7. Write a Review Modal Form Overlay */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm select-none p-4 animate-fadeIn">
          <div className="bg-background border border-secondary w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin rounded-lg shadow-2xl p-6 sm:p-8 text-left animate-scaleUp">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground">Write a Review</h3>
              <button
                onClick={() => setShowWriteModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close Write Review Form"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="flex flex-col gap-5">
              
              {/* Star Rating selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overall Rating</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewRating(i + 1)}
                      className="text-2xl text-amber-500 hover:scale-110 transition-transform"
                    >
                      {i < newRating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Author & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-author" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</label>
                  <input
                    id="form-author"
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Jane D."
                    className="text-xs p-3 border border-secondary focus:border-foreground bg-background outline-none transition-colors rounded-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Review Title</label>
                  <input
                    id="form-title"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Soft fabric, perfect fit!"
                    className="text-xs p-3 border border-secondary focus:border-foreground bg-background outline-none transition-colors rounded-sm"
                  />
                </div>
              </div>

              {/* Description Content */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-content" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Review Details</label>
                <textarea
                  id="form-content"
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your thoughts on fabric, quality, styling, and how it holds up."
                  className="text-xs p-3 border border-secondary focus:border-foreground bg-background outline-none transition-colors rounded-sm resize-none"
                />
              </div>

              {/* Sizing Auto-filled indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-secondary bg-secondary/10 rounded-sm text-xs select-none">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider">Purchased Size:</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    {selectedSize} <span className="text-[10px] text-green-600 font-semibold">✅ Auto-filled</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border border-secondary bg-secondary/10 rounded-sm text-xs select-none">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider">Purchased Color:</span>
                  <span className="font-bold text-foreground flex items-center gap-1 capitalize">
                    {selectedColor} <span className="text-[10px] text-green-600 font-semibold">✅ Auto-filled</span>
                  </span>
                </div>
              </div>

              {/* Height & Weight Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-height" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Height (Optional)</label>
                  <div className="relative">
                    <input
                      id="form-height"
                      type="number"
                      value={newHeight}
                      onChange={(e) => setNewHeight(e.target.value)}
                      placeholder="________"
                      className="w-full text-xs p-3 border border-secondary focus:border-foreground bg-background outline-none transition-colors rounded-sm pr-10"
                    />
                    <span className="absolute right-3 top-3.5 text-xs text-muted-foreground font-semibold">cm</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-weight" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weight (Optional)</label>
                  <div className="relative">
                    <input
                      id="form-weight"
                      type="number"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      placeholder="________"
                      className="w-full text-xs p-3 border border-secondary focus:border-foreground bg-background outline-none transition-colors rounded-sm pr-10"
                    />
                    <span className="absolute right-3 top-3.5 text-xs text-muted-foreground font-semibold">kg</span>
                  </div>
                </div>
              </div>

              {/* Fit selectors and Recommend option */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2 border-y border-secondary/40">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fit Information</span>
                  <div className="flex gap-2">
                    {(["Too Small", "Slightly Small", "True to Size", "Slightly Large", "Too Large"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setNewFit(opt)}
                        className={`text-[9px] font-bold uppercase px-2 py-1.5 border rounded-sm transition-all flex-grow ${
                          newFit === opt
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background text-foreground border-secondary/60 hover:border-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Would Recommend?</span>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setNewRecommend(true)}
                      className={`text-xs font-bold uppercase py-2 px-6 border rounded-sm transition-all flex-grow ${
                        newRecommend
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-background text-foreground border-secondary/60 hover:border-green-600"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRecommend(false)}
                      className={`text-xs font-bold uppercase py-2 px-6 border rounded-sm transition-all flex-grow ${
                        !newRecommend
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-background text-foreground border-secondary/60 hover:border-red-600"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Upload Zone */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Upload Customer Photos <span className="font-sans font-semibold text-muted-foreground/60">({newImages.length} of 10)</span>
                </span>
                
                <div className="flex gap-3 items-center">
                  {/* Mimic Upload Button */}
                  <button
                    type="button"
                    onClick={handleSimulateUpload}
                    disabled={newImages.length >= 10}
                    className="flex flex-col items-center justify-center h-20 w-16 border border-dashed border-secondary/80 hover:border-foreground rounded-lg transition-colors bg-secondary/5 gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[8px] font-bold uppercase tracking-wider leading-none text-muted-foreground">Add Photo</span>
                  </button>

                  {/* Upload preview images */}
                  <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
                    {newImages.map((url, idx) => (
                      <div key={idx} className="relative h-20 w-16 border border-secondary rounded-lg overflow-hidden flex-shrink-0 bg-secondary/10">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveUploaded(idx)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-0.5 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground font-semibold">
                  Only verified buyers can upload photos. All customer photo submissions require administrative moderation approval before publishing.
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full text-xs font-bold uppercase tracking-widest bg-foreground text-background py-4 hover:bg-foreground/90 transition-all rounded-sm mt-2"
              >
                Submit Review
              </button>

              {formSuccess && (
                <p className="text-xs text-green-600 font-semibold text-center mt-1 animate-pulse">
                  ✓ Thank you! Your review has been submitted for moderation and will show up once approved.
                </p>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
