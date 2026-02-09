import { Biography } from "@/types";

export const biography: Biography = {
  shortBio:
    "Pianist Edisher Savitski is an Associate Professor at the University of Alabama School of Music and an Artistic Director of Toradze International Music Festival.",

  fullBio: `Pianist Edisher Savitski is an Associate Professor at the University of Alabama School of Music and an Artistic Director of Toradze International Music Festival. As a clinician he regularly conducts master classes throughout USA, Europe and China.

He has enjoyed critical acclaim throughout his career: "As each of Savitski's convulsive trills and ominous chords would hang in the air, it became clearer that indeed something special was happening. We will be lucky to hear Scriabin played anywhere near this powerfully any time soon" (Jack Walton, South Bend Tribune). "The piano of Edisher Savitski prays, laments and also makes joyful sounds; This amazing Georgian simply takes off to the sky!" (Hanuh Ron, Yediot Akhronot, Israel).

Dr. Edisher Savitski has been performing at prestigious venues worldwide. To name a few: Carnegie Zankel Hall and Carnegie Weill Hall, New York; Wigmore Hall, London; Great Hall of Mozarteum, Salzburg, Austria; Mariinsky Theater and Concert Hall, St. Petersburg, Russia; Teatro alla Scala, Milan, Italy as well as in other venues in USA, Canada, Germany, Georgia, Spain, Italy, Portugal, Switzerland, France, Russia, United Kingdom, Israel, Austria, Morocco, China, Japan and New Zealand.

He performed at major music festivals such as: Salzburg Festival, Austria; Gilmore Keyboard Festival, Ravinia Festival, USA; Ruhr Festival, Germany; Ravenna Festival, Stresa Festival, Maggio Musicale Festival in Florence, MITO Festival, Italy; Rachmaninoff and Tchaikovsky festivals through Pittsburgh Symphony. His performances were also heard in Grande Auditorio at Temporada Gulbenkian de Musica in Lisbon, Portugal; at Teatro la Fenice, Venice, Italy; Stadt-Casino Musiksaal in Basel, Switzerland; Salle Cortot in Paris, France; at Dame Myra Hess series in Chicago; Segerstrom Hall in California.

In November 2007, Dr. Savitski became first pianist who performed in an unprecedented live performance/press conference, from his home in South Bend, Indiana on a Yamaha Disklavier piano that was connected to another Disklavier piano in the Recital Hall of Yamaha Artist Services International in New York City. He is a Yamaha Artist.`,

  sections: [
    {
      id: "overview",
      title: "Overview",
      content: `As a clinician he regularly conducts master classes throughout USA, Europe and China. His performances have been praised by critics worldwide and broadcasted on live TV and radio throughout Europe and USA.

He has enjoyed critical acclaim throughout his career from prestigious publications worldwide.`,
      order: 1,
    },
    {
      id: "performance-venues",
      title: "Performance Venues & Festivals",
      content: `Dr. Edisher Savitski has been performing at prestigious venues worldwide including Carnegie Zankel Hall and Carnegie Weill Hall, New York; Wigmore Hall, London; Great Hall of Mozarteum, Salzburg, Austria; Mariinsky Theater and Concert Hall, St. Petersburg, Russia; Teatro alla Scala, Milan, Italy.

He performed at major music festivals such as Salzburg Festival, Austria; Gilmore Keyboard Festival, Ravinia Festival, USA; Ruhr Festival, Germany; Ravenna Festival, Stresa Festival, Maggio Musicale Festival in Florence, MITO Festival, Italy; Rachmaninoff and Tchaikovsky festivals through Pittsburgh Symphony.`,
      order: 2,
    },
    {
      id: "awards",
      title: "Awards & Recognition",
      content: `Edisher Savitski is the first prizewinner of the Third International Piano-E-Competition in 2006 and the Hilton Head International Piano Competition in 2001, and took top prizes at the First International Piano-E-Competition in Minneapolis and the William S. Byrd International Piano Competition in Michigan.

In 2007 Savitski's CD was released on Schubert Club's Ten Thousand Lakes label. His performances are frequently broadcasted on live TV and radio throughout Europe and USA.

In November 2007, Dr. Savitski became first pianist who performed in an unprecedented live performance/press conference, from his home in South Bend, Indiana on a Yamaha Disklavier piano that was connected to another Disklavier piano in the Recital Hall of Yamaha Artist Services International in New York City. He is a Yamaha Artist.`,
      order: 3,
    },
    {
      id: "education",
      title: "Education",
      content: `Born in Tbilisi, Georgia, Dr. Edisher Savitski studied in the Central Music School under Maya Beridze and in the Tbilisi State Conservatory under professor Nana Khubutia. During this time he became a prizewinner of the international charity program "New Names", Russia, and won collaborative piano competition arranged at the Tbilisi State Conservatory.

In 1998 he joined the renowned Alexander Toradze Piano Studio at the Indiana University South Bend, where he earned Master of Music degree, Artist diploma and has been awarded with the Performers Certificate. In Spring 2013 he earned Doctor of Musical Arts degree in performance from Michigan State University.`,
      order: 4,
    },
  ],

  highlights: [
    "Associate Professor at University of Alabama School of Music",
    "Artistic Director of Toradze International Music Festival",
    "Yamaha Artist",
    "First Prize - Third International Piano-E-Competition (2006)",
    "First Prize - Hilton Head International Piano Competition (2001)",
    "Performed at Carnegie Hall, Wigmore Hall, Teatro alla Scala, Mariinsky Theater",
    "Doctor of Musical Arts from Michigan State University",
    "Regular master classes throughout USA, Europe, and China",
  ],

  venues: {
    usa: [
      "Carnegie Zankel Hall, New York",
      "Carnegie Weill Hall, New York",
      "Gilmore Keyboard Festival",
      "Ravinia Festival",
      "Dame Myra Hess series, Chicago",
      "Segerstrom Hall, California",
    ],
    europe: [
      "Wigmore Hall, London",
      "Great Hall of Mozarteum, Salzburg, Austria",
      "Mariinsky Theater and Concert Hall, St. Petersburg, Russia",
      "Teatro alla Scala, Milan, Italy",
      "Salzburg Festival, Austria",
      "Ruhr Festival, Germany",
      "Ravenna Festival, Italy",
      "Stresa Festival, Italy",
      "Maggio Musicale Festival, Florence, Italy",
      "MITO Festival, Italy",
      "Grande Auditorio, Temporada Gulbenkian de Musica, Lisbon, Portugal",
      "Teatro la Fenice, Venice, Italy",
      "Stadt-Casino Musiksaal, Basel, Switzerland",
      "Salle Cortot, Paris, France",
    ],
    asia: ["China", "Japan"],
    other: ["Morocco", "New Zealand"],
  },

  testimonials: [
    {
      id: "walton-scriabin",
      quote: "As each of Savitski's convulsive trills and ominous chords would hang in the air, it became clearer that indeed something special was happening. We will be lucky to hear Scriabin played anywhere near this powerfully any time soon",
      author: "Jack Walton",
      source: "South Bend Tribune",
      performance: "Scriabin",
    },
    {
      id: "ron-georgian",
      quote: "The piano of Edisher Savitski prays, laments and also makes joyful sounds; This amazing Georgian simply takes off to the sky!",
      author: "Hanuh Ron",
      source: "Yediot Akhronot, Israel",
      performance: null,
    },
  ],
};
