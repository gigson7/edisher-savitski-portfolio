import { Quote } from "lucide-react";
import { Testimonial } from "@/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="relative p-8 border border-primary-200 rounded-lg hover:border-gold-500 hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col">
      {/* Quote Icon */}
      <Quote className="w-10 h-10 text-gold-500 mb-4 opacity-50" />

      {/* Quote Text */}
      <blockquote className="text-lg text-primary-700 leading-relaxed mb-6 flex-grow italic">
        "{testimonial.quote}"
      </blockquote>

      {/* Attribution */}
      <div className="border-t border-primary-100 pt-4">
        <p className="font-semibold text-primary-800">{testimonial.author}</p>
        <p className="text-sm text-primary-600">{testimonial.source}</p>
        {testimonial.performance && (
          <p className="text-xs text-gold-600 mt-1">On {testimonial.performance}</p>
        )}
      </div>
    </div>
  );
}
