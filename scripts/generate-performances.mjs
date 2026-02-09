import fs from 'fs';
import { execSync } from 'child_process';

// Extract text from DOCX
const rawText = execSync('textutil -convert txt "/Users/nutsaguntsadze/VibeCoding/Edisher/PAST PERFORMANCES.docx" -stdout', {
  encoding: 'utf-8'
});

// Parse the performances
const lines = rawText.split('\n').filter(line => line.trim());
const performances = [];
let i = 1; // Skip "PAST PERFORMANCES" header

function parseDate(dateStr) {
  // Handle formats like "12/25/2025", "7/9-19/2024", "07/07/23-07/21/23"
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!match) return null;

  let [_, month, day, year] = match;
  if (year.length === 2) {
    year = '20' + year;
  }

  month = month.padStart(2, '0');
  day = day.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function determineType(title, details) {
  const combined = (title + ' ' + details).toLowerCase();

  if (combined.includes('orchestra') || combined.includes('soloist')) {
    return 'orchestra';
  }
  if (combined.includes('chamber') || combined.includes('trio') || combined.includes('quintet') ||
      combined.includes('with ') && !combined.includes('orchestra')) {
    return 'chamber';
  }
  if (combined.includes('masterclass') || combined.includes('festival') && combined.includes('performances')) {
    return 'masterclass';
  }
  return 'solo';
}

function parseLocation(loc) {
  if (!loc) return { location: '', country: '' };

  // Handle various formats
  if (loc.includes(',')) {
    const parts = loc.split(',').map(p => p.trim());
    if (parts.length === 2) {
      // "Tbilisi, Georgia" or "New York, NY"
      if (parts[1].length === 2) {
        return { location: loc, country: 'USA' };
      }
      return { location: parts[0], country: parts[1] };
    }
  }

  // Single word countries
  const countries = ['Georgia', 'Cuba', 'Italy', 'Spain', 'Ukraine', 'China', 'Canada', 'Kyrgyzstan', 'Uzbekistan'];
  for (const country of countries) {
    if (loc.includes(country)) {
      return { location: loc.replace(country, '').replace(',', '').trim(), country };
    }
  }

  return { location: loc, country: 'USA' };
}

function shouldFeature(title, venue, location, org) {
  const combined = [title, venue, location, org].join(' ').toLowerCase();

  const prestigiousIndicators = [
    'carnegie hall',
    'wigmore hall',
    'teatro alla scala',
    'yamaha artist services',
    'national palace',
    'symphony orchestra',
    'conservatory',
    'grand hall',
    'international',
    'kiev',
    'kyiv',
    'greenville symphony',
    'prokofiev',
    'festival',
    'charity',
    'benefit'
  ];

  return prestigiousIndicators.some(indicator => combined.includes(indicator));
}

while (i < lines.length) {
  const dateStr = lines[i]?.trim();
  if (!dateStr || dateStr === 'PAST PERFORMANCES') {
    i++;
    continue;
  }

  const parsedDate = parseDate(dateStr);
  if (!parsedDate) {
    i++;
    continue;
  }

  let title = '';
  let venue = '';
  let locationStr = '';
  let organization = '';
  let collaborators = [];
  let repertoire = [];

  // Collect info for this performance
  i++;
  const perfLines = [];
  while (i < lines.length && !parseDate(lines[i])) {
    perfLines.push(lines[i].trim());
    i++;
  }

  // Parse the collected lines
  if (perfLines.length > 0) {
    title = perfLines[0];

    // Look for venue, location, collaborators, repertoire
    for (let j = 1; j < perfLines.length; j++) {
      const line = perfLines[j];

      if (line.toLowerCase().startsWith('with ')) {
        collaborators.push(line.substring(5));
      } else if (line.includes(',') && (line.includes('AL') || line.includes('NY') || line.includes('Georgia') ||
                 line.includes('Cuba') || line.includes('Italy') || line.includes('China'))) {
        locationStr = line;
      } else if (line.toLowerCase().includes('university') || line.toLowerCase().includes('festival') ||
                 line.toLowerCase().includes('symphony') || line.toLowerCase().includes('orchestra') ||
                 line.toLowerCase().includes('conservatory')) {
        if (!venue) {
          venue = line;
        } else if (!organization) {
          organization = line;
        }
      } else if (line.includes('Op.') || line.includes('Concerto') || line.includes('Sonata') ||
                 line.includes('Trio') || line.includes('Quintet')) {
        repertoire.push(line);
      } else if (!venue) {
        venue = line;
      }
    }
  }

  const { location, country } = parseLocation(locationStr);
  const type = determineType(title, perfLines.join(' '));
  const isFeatured = shouldFeature(title, venue, location, organization);

  // Create unique ID
  let id = `perf-${parsedDate}`;
  let counter = 1;
  while (performances.some(p => p.id === id)) {
    id = `perf-${parsedDate}-${counter}`;
    counter++;
  }

  const performance = {
    id,
    date: parsedDate,
    type,
    title,
    venue: venue || 'Concert Hall',
    location: location || locationStr,
    country: country || 'USA',
  };

  if (organization) performance.organization = organization;
  if (collaborators.length > 0) performance.collaborators = collaborators;
  if (repertoire.length > 0) performance.repertoire = repertoire;
  performance.isPast = true;
  if (isFeatured) performance.isFeatured = true;

  performances.push(performance);
}

// Sort by date (most recent first)
performances.sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate TypeScript file
const tsContent = `import { Performance } from "@/types";
import { isPastDate } from "@/lib/utils";

export const performances: Performance[] = [
${performances.map(p => {
  const props = [`    id: "${p.id}"`];
  props.push(`    date: "${p.date}"`);
  props.push(`    type: "${p.type}"`);
  props.push(`    title: "${p.title.replace(/"/g, '\\"')}"`);
  props.push(`    venue: "${p.venue.replace(/"/g, '\\"')}"`);
  props.push(`    location: "${p.location.replace(/"/g, '\\"')}"`);
  props.push(`    country: "${p.country}"`);
  if (p.organization) props.push(`    organization: "${p.organization.replace(/"/g, '\\"')}"`);
  if (p.collaborators) props.push(`    collaborators: [${p.collaborators.map(c => `"${c.replace(/"/g, '\\"')}"`).join(', ')}]`);
  if (p.repertoire) props.push(`    repertoire: [${p.repertoire.map(r => `"${r.replace(/"/g, '\\"')}"`).join(', ')}]`);
  props.push(`    isPast: ${p.isPast}`);
  if (p.isFeatured) props.push(`    isFeatured: true`);

  return `  {\n${props.join(',\n')},\n  }`;
}).join(',\n')}
];

// Utility functions for filtering performances
export const getUpcomingPerformances = () =>
  performances
    .filter((p) => !p.isPast)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export const getPastPerformances = (limit?: number) => {
  const past = performances
    .filter((p) => p.isPast)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return limit ? past.slice(0, limit) : past;
};

export const getFeaturedPerformances = () =>
  performances.filter((p) => p.isFeatured);

export const getPerformancesByYear = () => {
  return performances.reduce(
    (acc, perf) => {
      const year = new Date(perf.date).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(perf);
      return acc;
    },
    {} as Record<number, Performance[]>
  );
};

export const getPerformancesByType = (type: Performance["type"]) =>
  performances.filter((p) => p.type === type);
`;

// Write to file
fs.writeFileSync('/Users/nutsaguntsadze/VibeCoding/Edisher/edisher-savitski-portfolio/data/performances.ts', tsContent, 'utf-8');

console.log(`✅ Successfully generated ${performances.length} performances!`);
console.log(`📅 Date range: ${performances[performances.length - 1].date} to ${performances[0].date}`);
console.log(`⭐ Featured performances: ${performances.filter(p => p.isFeatured).length}`);
