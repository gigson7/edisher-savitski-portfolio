import { siteConfig } from "@/data/site-config";
import { Mail, MapPin, Building } from "lucide-react";

export function ContactInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-serif font-semibold text-primary-800 mb-4">
          Get in Touch
        </h3>
        <p className="text-lg text-primary-600 leading-relaxed">
          For booking inquiries, masterclass opportunities, or general questions,
          please feel free to reach out.
        </p>
      </div>

      <div className="space-y-4">
        {siteConfig.contact.email && (
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-accent-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary-700 mb-1">Email</p>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-lg text-primary-600 hover:text-accent-600 transition-colors"
              >
                {siteConfig.contact.email}
              </a>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Building className="w-5 h-5 text-accent-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-primary-700 mb-1">Institution</p>
            <p className="text-lg text-primary-600">University of Alabama</p>
            <p className="text-lg text-primary-600">School of Music</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-accent-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-primary-700 mb-1">Location</p>
            <p className="text-lg text-primary-600">Tuscaloosa, Alabama</p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-primary-200">
        <p className="text-sm text-primary-600 mb-3">
          For masterclass bookings and performance inquiries, please include:
        </p>
        <ul className="space-y-2 text-sm text-primary-600">
          <li>• Event date and location</li>
          <li>• Type of engagement (recital, masterclass, etc.)</li>
          <li>• Venue details</li>
          <li>• Estimated audience size</li>
        </ul>
      </div>
    </div>
  );
}
