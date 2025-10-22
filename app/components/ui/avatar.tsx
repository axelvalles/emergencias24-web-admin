import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}

interface AvatarNextProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

function AvatarNext({
  src,
  alt,
  fallback,
  className,
  size = "md",
}: AvatarNextProps) {
  const sizeValue =
    size === "sm"
      ? 40
      : size === "md"
        ? 60
        : size === "lg"
          ? 80
          : size === "xl"
            ? 120
            : 60;

  const sizeClasses = {
    sm: "h-[40px] w-[40px]",
    md: "h-[60px] w-[60px]",
    lg: "h-[80px] w-[80px]",
    xl: "h-[120px] w-[120px]",
  };

  return (
    <Avatar className={cn("relative rounded-lg", className, sizeClasses[size])}>
      {src ? (
        <img
          src={`${src}`}
          alt={alt || "Avatar"}
          width={sizeValue}
          height={sizeValue}
          className="rounded-lg"
        />
      ) : (
        <AvatarFallback className="rounded-lg">
          {fallback && (
            <img
              src={fallback}
              alt={alt || "Avatar"}
              width={sizeValue}
              height={sizeValue}
              className="rounded-lg"
            />
          )}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarNext };
