import { Video } from "@/types";

export const videos: Video[] = [
  {
    id: "video-1",
    youtubeId: "YY4NqAC0O58",
    title: "F. Schubert, \"Trout\" quintet",
    description: "Chamber music performance with Veriko Tchumburidze (violin), Nodar Zhvania (viola), and ensemble",
    repertoire: ["Schubert - Piano Quintet in A major, D. 667 \"Trout\""],
    featured: true,
  },
  {
    id: "video-2",
    youtubeId: "A7b5FRQejqo",
    title: "Johannes Brahms, Ballades 3 & 4, Op. 10",
    description: "Solo piano performance at Yamaha Artist Services, NYC",
    repertoire: ["Brahms - Ballade No. 3 in B minor, Op. 10", "Brahms - Ballade No. 4 in B major, Op. 10"],
    featured: true,
  },
  {
    id: "video-3",
    youtubeId: "MXGHLlFQfY8",
    title: "L. Van Beethoven, Sonata Op. 26 in A-flat Major",
    description: "Solo piano performance recorded March 21, 2021",
    performanceDate: "2021-03-21",
    repertoire: ["Beethoven - Piano Sonata No. 12 in A-flat Major, Op. 26"],
    featured: true,
  },
  {
    id: "video-4",
    youtubeId: "KU8rhQoe90M",
    title: "Joseph Haydn, Sonata in F Major, Hob XVI:23",
    description: "Solo piano performance",
    repertoire: ["Haydn - Piano Sonata in F Major, Hob. XVI:23"],
    featured: false,
  },
  {
    id: "video-5",
    youtubeId: "gi7w4Xzvpt8",
    title: "M. Mussorgsky, \"Pictures at an Exhibition\"",
    description: "Solo piano performance of Mussorgsky's famous suite",
    repertoire: ["Mussorgsky - Pictures at an Exhibition"],
    featured: true,
  },
  {
    id: "video-6",
    youtubeId: "-L_RCKJVNXc",
    title: "F. Schubert, Sonata in B-flat Major, D. 960",
    description: "Solo piano performance of Schubert's final piano sonata",
    repertoire: ["Schubert - Piano Sonata No. 21 in B-flat Major, D. 960"],
    featured: true,
  },
  {
    id: "video-7",
    youtubeId: "GSwW5yCse1s",
    title: "Chopin Sonata No. 3 in B Minor, Op. 58",
    description: "Solo piano performance",
    repertoire: ["Chopin - Piano Sonata No. 3 in B Minor, Op. 58"],
    featured: true,
  },
  {
    id: "video-8",
    youtubeId: "w5Tu3eXMDhM",
    title: "Gershwin, Rhapsody in Blue",
    description: "Solo piano performance of Gershwin's iconic American classic",
    repertoire: ["Gershwin - Rhapsody in Blue"],
    featured: true,
  },
  {
    id: "video-9",
    youtubeId: "D8LTAZKZxnc",
    title: "J. Bardanashvili, Fantasia",
    description: "Solo piano performance",
    repertoire: ["Joseph Bardanashvili - Fantasia"],
    featured: false,
  },
];

export const getFeaturedVideos = () => videos.filter((v) => v.featured);
