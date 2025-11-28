// ============================================================================
// Loading - Loading spinner component for async operations
// ============================================================================

import React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Props Interface
// ============================================================================

export interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

// ============================================================================
// Loading Component
// ============================================================================

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  className,
  text,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent text-primary",
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};

// ============================================================================
// Loading Overlay Component
// ============================================================================

export interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = "Loading...",
  className,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-200",
        className
      )}
    >
      <Loading size="lg" text={text} />
    </div>
  );
};

// ============================================================================
// Skeleton Loading Components
// ============================================================================

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
};
