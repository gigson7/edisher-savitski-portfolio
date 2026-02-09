// Script to help parse performances from the DOCX text
// This will help generate the TypeScript data structure

const fs = require('fs');

const rawText = `PAST PERFORMANCES

12/25/2025
Soloist
Tbilisi Youth Orchestra
Tbilisi, Georgia

12/16/2025
Soloist
Bishkek City Orchestra
Bishkek, Kyrgyzstan

12/12/2005
Soloist
Uzbekistan National Orchestra
Tashkent, Uzbekistan

11/05/2025
Studio Recital
Recital Hall
University of Alabama

06/13/2025
Chamber Concert
Toradze International Music Festival
Tbilisi, Georgia

04/15/2025
Solo Recital
Yamaha Artist Services
New York, NY

04/09/2025
Solo Recital
Roberts Hall
University of Alabama Huntsville

03/28/2025
Solo Recital
Moody Concert Hall
University of Alabama

03/06/2025
Chamber and Solo Performance
Havana, Cuba

10/23/24
Chamber Recital
With UA cellist Dr. Moises Molina
Moody Concert Hall
University of Alabama

7/9-19/2024
Performances and Masterclasses
Northern Lights Music Festival
MN

6/12/24
Performance with Gabriel Prokofiev
Main Stage of Rustaveli National Theatre
Tbilisi, Georgia

6/9/24
Performance at Rachmaninoff Marathon
Grand Hall, Tbilisi State Conservatory
Tbilisi, Georgia

6/7-19/2024
Performances and Masterclasses
Toradze International Music Festival
Tbilisi, Georgia

2/11/2024
Chamber Recital
Trout Quintet
Moody Concert Hall
University of Alabama
Tuscaloosa, AL

12/09/23
Solo Recital
Grand Hall
Tbilisi State Conservatory
Georgia

11/28/23
Solo Recital
Yamaha Artist Services
New York, NY

11/07/23
Solo Recital
LeBaron Recital Hall
University of Montevallo

09/26/23
Soloist with Huxford Symphony Orchestra
Moody Concert Hall
University of Alabama
Tuscaloosa, AL

07/07/23-07/21/23
Performances and Masterclasses
Northern Lights Music Festival
MN

05/30-06/07/23
Performances and Masterclasses
Toradze International Music Festival
Tbilisi, Georgia

04/18/23
Solo Recital
LeBaron Recital Hall
University of Montevallo

04/01/23
Solo Recital
Laidlaw Performing Arts Center
University of South Alabama

03/20/23
Piano Area Recital
Moody Concert Hall
University of Alabama

03/07/23
Chamber concert
Moody Concert Hall
University of Alabama
With Matt Maddows, horn

02/05/23
Solo Recital
St. James Concert Series
Fairhope, AL

10/11/22
Solo Recital
Shelton State College
Tuscaloosa, AL

10/02/22
Performance at Alexander Toradze Memorial Concert
Klavierhaus, NYC

07/24/22
Chamber Recital
Blodgett Recital Hall, Blue Lake Arts Festival
Schumann D minor Trio
With Walter Verdehr and Carl Donakovsky

07/23/22
Solo Recital
Stewart Shell, Blue Lake Arts Festival
Michigan

07/8-23/22
Performances and Masterclasses
Northern Lights Music Festival, MN
B'nai Abraham Cultural Center
With Yuri Gandelsman, Viola

05/31/22
Performance in memoriam of Lexo Toradze
President's palace
Tbilisi, Georgia

04/27/22
Solo Recital For Ukraine
Moody Concert Hall
University of Alabama

04/12/22
Moody Concert Hall
Tuscaloosa, AL
Beethoven Choral Fantasy

04/5-6/22
Recording session
Yamaha Artist Services, NYC

03/07/22
Roberts Hall
Huntsville, AL
Solo recital

01/31/22
Laidlaw Performing Arts Center
University of South Alabama
Solo recital

01/24/22
LeBaron Recital Hall
University of Montevallo
Solo recital

11/28/21
Recital Hall
University of Alabama
Recital with Allison Ringler, Horn

7/20/21
B'nai Abraham Cultural Center
Northern Lights Festival, Virginia, MN
"Trout" Quintet

7/19/21
Vermillion Community College
Northern Lights Festival, Ely, MN
"Trout" Quintet

7/7/21
B'nai Abraham Cultural Center
Northern Lights Festival, Virginia, MN
Brahms Trio Op. 114

7/6/21
Veda Zuponcic Auditorium
Northern Lights Festival, Aurora, MN
Brahms Trio Op. 114

7/2/21
Veda Zuponcic Auditorium
Northern Lights Festival, Aurora, MN
Solo Performance

3/21/21
Roberts Recital Hall – University of Alabama Huntsville
Solo recital/recording

2/28/21
Georgian Public Broadcaster
Tbilisi, Georgia
Performance on Live TV

12/12/20
Mtavari Arkhi TV
Tbilisi, Georgia
Performance on Live TV

07/08/20
B'nai Abraham Cultural Center
Northern Lights Festival, Virginia, MN
Solo Recital

07/ 6-7/20
B'nai Abraham Cultural Center
Northern Lights Festival, Virginia, MN
"Ghost" Trio

03/11/20
Boyd Recital Hall - Rowan University, Glassboro, NJ
Solo recital

11/21/19
Solo recital
Roberts Recital Hall
University of Alabama Huntsville

10/25/19
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Recital with Eldon Matlick, Professor of French Horn at the University of Oklahoma

09/06/19
National Palace, Tbilisi, Georgia.
Solo Recital at the Tbilisi Piano Fest

08/25/19
First Presbyterian Church, Tuscaloosa, AL
Solo Recital

08/07/19
Elite Music Camp, Tangshan, China
Performance at the Tangshan Grand Theatre

07/18/19
Tbilisi, Georgia
TV interview and performance on Georgian Public Broadcaster

04/23/19
Moody Music Building - UA Tuscaloosa, AL
Performing the Notebooks of Leonardo da Vinci, composed by Jocelyn Hagen. With University Chorus, University Singers, Faculty Chamber Orchestra

03/14/19
Solo Recital
Yamaha Artist Services
New York, NY

03/15/19
Yamaha Artist Services, New York, NY
Recording for Yamaha Disklavier Piano Technology

02/22/19
Tide Pointe Clubhouse, Holton Head Island, SC
Benefit solo recital for the Performing Arts Consortium

01/22/19
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Solo recital

01/18/19
Moody Music Building - UA Tuscaloosa, AL
Performance for students during Music Convocation

01/17/19
LeBaron Recital Hall, University of Montevallo, AL
Solo Recital

01/16/19
Recital Hall at Moody Music Building - UA Tuscaloosa, AL
Performance for students during the Studio Class

01/09/19
Recital Hall at Moody Music Building - UA Tuscaloosa, AL
Performance for students during the Studio Class

10/18/18
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Performance on Third Thursday of the Month Organ Concert, with Dr. Faythe Freese, organ

06/28/18
Solo recital
Palazzo Bassi-Brugnatelli,
Robbiate, Italy

06/01/18
Strada, Tbilisi, Georgia
Charity solo recital for children's hospice "Firefly World"

05/22/18
Tbilisi Conservatory, Tbilisi, Georgia
Performance at the concert "Women and Music"

05/17/18
Jule Collins Smith Museum of Fine Art, Auburn University, AL
Recital with UA faculty Jenny Gregoire, violin

04/16/18
Carlos Moseley Chamber Music Series, Converse College, Spartanburg, SC
Solo Recital

04/07/18
Pianoforte Studios Recital Hall, Chicago, IL
Solo Recital

03/12/18
LeBaron Recital Hall, University of Montevallo, AL
Solo Recital

02/18/18
St. James Concert Series, Fairhope, AL
Recital with UA faculty Jenny Gregoire, violin

02/26/18
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Recital with UA faculty Jenny Gregoire

11/30/17
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Performance with Huxford Symphony Orchestra
J. Brahms, Piano Concerto #2, Op. 83, Dr. Blake Richardson, conductor

09/08/17
Recital Hall at Moody Music Building - UA Tuscaloosa, AL
Recital with Dr. Osiris Molina, clarinet

08/24/17
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Recital with Dr. Jacob Adams, viola

06/16/17
D. Kakhidze Tbilisi Center for Music and Culture, Tbilisi, Georgia
Performance of S. Prokofiev's concerto #3, Op. 26, with Tbilisi Symphony Orchestra,
David Mukeria, conductor

06/05/17
Rustaveli Theatre, Tbilisi, Georgia
Performance at opening night of T. Amirejibi International Music Festival
D. Shostakovich concerto for piano and trumpet Op. 35, with UA faculty Eric Yates, trumpet and the Georgian Sinfonietta

05/31/17
Rustavi 2 TV, Tbilisi, Georgia
Interview and performance on Live TV special "The Other Midday"

05/18/17
Grand Hall, Kyiv National Conservatory, Kyiv, Ukraine
Charity Solo Recital

05/14/17
Grand Hall, Tbilisi State Conservatory, Tbilisi, Georgia
Recital at the 100-year anniversary of the Tbilisi State Conservatory

05/13/17
Grand Hall, Tbilisi State Conservatory, Tbilisi, Georgia
Recital with Violist George Zagareli, viola

04/26/17
Remote performance and masterclass
Yamaha Artist Services, New York, NY- Moody Concert Hall - UA School of Music, Tuscaloosa, AL

04/18/17
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Performance with DMA student Hynhee Byun, piano

04/14/17
Davis Hall, University of Northern Iowa, Cedar Falls, IA
Solo Recital

03/29/17
Goodwyn Auditorium, Auburn University at Montgomery, AL
Solo Recital

03/18/17
Greenville, South Carolina
Benefit concerts for Greenville Symphony

03/17/17
Greenville, South Carolina
Benefit concerts for Greenville Symphony

03/12/17
Meng Concert Hall, California State University, Fullerton
Solo Recital

02/11/17
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Performance at All State Orchestra Weekend

02/09/17
Alabama Piano Gallery, Birmingham, AL
Solo Recital

01/29/17
Soloist in two performances with Greenville Symphony Orchestra
S. Prokofiev, Piano Concerto #3, Op 26
Edvard Tchivzhel, Conductor
The Piece Concert Hall - Greenville, SC

01/28/17
Soloist in two performances with Greenville Symphony Orchestra
S. Prokofiev, Piano Concerto #3, Op 26
Edvard Tchivzhel, Conductor
The Piece Concert Hall - Greenville, SC

01/11/17
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Recital along with guest artist Tamar Licheli, Piano

12/05/16
Yamaha Artist Services, New York, NY
Solo Recital

11/22/16
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Solo Recital

11/07/16
Fairchild Theatre at Michigan State University, East Lansing, MI
Performance with Melanie Helton, Walter Verdehr, Irina Banova, Igor Cetkovich, Matthew Boothe

11/03/16
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Janacek Concertino with Contemporary Music Ensemble and Dr. Amir Zaheri

09/12/16
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
All Schubert recital with UA faculty: Jenny Gregoire, Jacob Adams, Carlton McCreery, Ben Crofut, David Tayloe

09/09/16
Recital Hall at Moody Music Building - UA Tuscaloosa, AL
Recital with Dr. Osiris Molina, Clarinet; Michael Tavani, Cello; Dr. Charles "Skip" Snead, Horn

08/05/16
Swarthout Recital Hall, Lawrence, KS
Performance at International Clarinetfest

07/12/16
Vimercate, Italy
Performance at Bassi-Brugnatelli Music Symposium

07/10/16
Vimercate, Italy
Solo recital at Bassi-Brugnatelli Music Symposium

07/09/16
Vimercate, Italy
Performance at Bassi-Brugnatelli Music Symposium

05/19/16
Dedoplistskaro, Georgia
Recital at the festival "From Easter to Ascension"

04/09/16
Bryant-Jordan Hall, UA School of Music, Tuscaloosa, AL
Performing with UA students at Capstone Song Initiative

04/06/16
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Performance with Joshua Williams, french horn recital

03/31/16
UA School of Music Recital Hall, Tuscaloosa, AL
All Shostakovich recital, with UA faculty: Carlton McCreery, cello and Jacob Adams, viola

03/29/16
Hulsey Recital Hall - University of Alabama Birmingham
All Shostakovich recital, with UA faculty: Carlton McCreery, cello and Jacob Adams, viola

01/23/16
Performance at UA School of Music, Tuscaloosa, AL
Piano area J.S. Bach project

11/04/15
Moody Concert Hall - UA School of Music, Tuscaloosa, AL
Solo Recital

10/23/15
Moody Concert Hall - UA School of Music, Tuscaloosa
Fall Spectrum Concert

10/16/15
Tabaret Hall University of Ottawa - Ottawa, Canada
Solo Recital

10/08/15
Recital Hall at Moody Music Building - UA Tuscaloosa, AL
Hispanic/Latino Heritage Month Concert
Performance with UA School of Music Faculty: Jeremy Crawford, Jacob Adams, Susan Williams

8/21/15
Concert Hall at Moody Music Building - UA Tuscaloosa
Convocation, concert of new faculty

07/23/15
Centro Cultural Conde Duque - Madrid, Spain
Performance with VCP International Trio at ClarinetFest 2015

07/11/15
Stewart Shell at Blue Lake Festival - Blue Lake, Michigan, USA
Performance with Blue Lake Festival Orchestra, with Walter Verdehr, violin, Gregory Beaver, cello, and Kevin Rhodes, conductor. L. Van Beethoven, Triple Concerto

05/26/15
The Great Hall of the State Conservatory of Uzbekistan - Tashkent, Uzbekistan
Soloist with National Symphony Orchestra of Uzbekistan. Tigran Shiganyan, conductor
Sergei Prokofiev, Concerto for Piano and Orchestra No.3 in C Major, Op.26
`;

console.log("Raw data loaded. Manual parsing required due to complex multi-line format.");
console.log("Total estimated performances: ~150+");
console.log("\nSample output structure would be:");
console.log(`{
  id: "perf-2015-05-26",
  date: "2015-05-26",
  type: "orchestra",
  title: "Soloist with National Symphony Orchestra of Uzbekistan",
  venue: "The Great Hall of the State Conservatory of Uzbekistan",
  location: "Tashkent",
  country: "Uzbekistan",
  organization: "National Symphony Orchestra of Uzbekistan",
  repertoire: ["Prokofiev - Concerto No. 3 in C Major, Op. 26"],
  collaborators: ["Tigran Shiganyan (conductor)"],
  isPast: true,
}`);