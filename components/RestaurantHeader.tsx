'use client';

interface RestaurantHeaderProps {
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  cuisine: string;
}

export default function RestaurantHeader({
  name,
  image,
  rating,
  deliveryTime,
  deliveryFee,
  cuisine,
}: RestaurantHeaderProps) {
  return (
    <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden rounded-b-2xl">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
          {name}
        </h1>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-sm sm:text-base">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold">{rating}</span>
          </div>
          <span>•</span>
          <span>{deliveryTime}</span>
          <span>•</span>
          <span>{deliveryFee}</span>
          <span>•</span>
          <span>{cuisine}</span>
        </div>
      </div>
    </div>
  );
}
