export type VehicleCompatibilityInfo = {
  brandAndModel: string
  chassisLabel: string
  startYear: number
  endYear: number
  timelineYears: { year: number; active: boolean }[]
  isUniversalOrAccessory: boolean
  isPrePaintedPianoBlack: boolean
  isTrunkMat: boolean
}

type KnownVehicleRule = {
  pattern: RegExp
  brandModel: string
  startYear: number
  endYear: number
  defaultChassis?: string
}

const KNOWN_VEHICLE_RULES: KnownVehicleRule[] = [
  // OPEL
  { pattern: /corsa\s*c\b/i, brandModel: "OPEL CORSA C", startYear: 2000, endYear: 2006 },
  { pattern: /corsa\s*d\b/i, brandModel: "OPEL CORSA D", startYear: 2006, endYear: 2014 },
  { pattern: /corsa\s*e\b/i, brandModel: "OPEL CORSA E", startYear: 2014, endYear: 2019 },
  { pattern: /corsa\s*f\b/i, brandModel: "OPEL CORSA F", startYear: 2019, endYear: 2024 },
  { pattern: /corsa\b/i, brandModel: "OPEL CORSA", startYear: 2000, endYear: 2003 },
  { pattern: /astra\s*j\b.*makyajl[ıi]/i, brandModel: "OPEL ASTRA J", startYear: 2012, endYear: 2015, defaultChassis: "Makyajlı Kasa" },
  { pattern: /astra\s*j\b.*makyajs[ıi]z/i, brandModel: "OPEL ASTRA J", startYear: 2009, endYear: 2012, defaultChassis: "Makyajsız Kasa" },
  { pattern: /astra\s*j\b/i, brandModel: "OPEL ASTRA J", startYear: 2009, endYear: 2015 },
  { pattern: /astra\s*h\b/i, brandModel: "OPEL ASTRA H", startYear: 2004, endYear: 2009 },
  { pattern: /astra\s*g\b/i, brandModel: "OPEL ASTRA G", startYear: 1998, endYear: 2004 },
  { pattern: /astra\s*k\b/i, brandModel: "OPEL ASTRA K", startYear: 2015, endYear: 2021 },
  { pattern: /astra\s*l\b/i, brandModel: "OPEL ASTRA L", startYear: 2022, endYear: 2026 },
  { pattern: /insignia\b/i, brandModel: "OPEL INSIGNIA", startYear: 2008, endYear: 2017 },
  { pattern: /vectra\s*c\b/i, brandModel: "OPEL VECTRA C", startYear: 2002, endYear: 2008 },
  { pattern: /vectra\s*b\b/i, brandModel: "OPEL VECTRA B", startYear: 1996, endYear: 2002 },
  { pattern: /mokka\b/i, brandModel: "OPEL MOKKA", startYear: 2021, endYear: 2025 },

  // CHEVROLET
  { pattern: /cruze\b.*makyajl[ıi]/i, brandModel: "CHEVROLET CRUZE", startYear: 2012, endYear: 2015, defaultChassis: "Makyajlı Kasa" },
  { pattern: /cruze\b.*makyajs[ıi]z/i, brandModel: "CHEVROLET CRUZE", startYear: 2009, endYear: 2012, defaultChassis: "Makyajsız Kasa" },
  { pattern: /cruze\b/i, brandModel: "CHEVROLET CRUZE", startYear: 2009, endYear: 2015 },
  { pattern: /aveo\b/i, brandModel: "CHEVROLET AVEO", startYear: 2011, endYear: 2015 },
  { pattern: /captiva\b/i, brandModel: "CHEVROLET CAPTIVA", startYear: 2007, endYear: 2015 },

  // VOLKSWAGEN
  { pattern: /golf\s*8\b/i, brandModel: "VOLKSWAGEN GOLF 8", startYear: 2020, endYear: 2025 },
  { pattern: /golf\s*7[.,]5\b/i, brandModel: "VOLKSWAGEN GOLF 7.5", startYear: 2017, endYear: 2020, defaultChassis: "Makyajlı Kasa (MK7.5)" },
  { pattern: /golf\s*7\b/i, brandModel: "VOLKSWAGEN GOLF 7", startYear: 2012, endYear: 2017, defaultChassis: "MK7 Kasa" },
  { pattern: /golf\s*6\b/i, brandModel: "VOLKSWAGEN GOLF 6", startYear: 2008, endYear: 2012, defaultChassis: "MK6 Kasa" },
  { pattern: /golf\s*5\b/i, brandModel: "VOLKSWAGEN GOLF 5", startYear: 2003, endYear: 2008, defaultChassis: "MK5 Kasa" },
  { pattern: /golf\s*4\b/i, brandModel: "VOLKSWAGEN GOLF 4", startYear: 1998, endYear: 2003, defaultChassis: "MK4 Kasa" },
  { pattern: /passat\s*b8[.,]5\b/i, brandModel: "VOLKSWAGEN PASSAT B8.5", startYear: 2019, endYear: 2023, defaultChassis: "Makyajlı Kasa (B8.5)" },
  { pattern: /passat\s*b8\b/i, brandModel: "VOLKSWAGEN PASSAT B8", startYear: 2014, endYear: 2019, defaultChassis: "B8 Kasa" },
  { pattern: /passat\s*b7\b/i, brandModel: "VOLKSWAGEN PASSAT B7", startYear: 2010, endYear: 2014, defaultChassis: "B7 Kasa" },
  { pattern: /passat\s*b6\b/i, brandModel: "VOLKSWAGEN PASSAT B6", startYear: 2005, endYear: 2010, defaultChassis: "B6 Kasa" },
  { pattern: /passat\s*cc\b/i, brandModel: "VOLKSWAGEN PASSAT CC", startYear: 2008, endYear: 2016 },
  { pattern: /polo\b.*aw/i, brandModel: "VOLKSWAGEN POLO AW", startYear: 2017, endYear: 2024 },
  { pattern: /polo\b/i, brandModel: "VOLKSWAGEN POLO", startYear: 2009, endYear: 2017 },
  { pattern: /scirocco\b/i, brandModel: "VOLKSWAGEN SCIROCCO", startYear: 2008, endYear: 2017 },
  { pattern: /jetta\b.*mk6/i, brandModel: "VOLKSWAGEN JETTA MK6", startYear: 2011, endYear: 2018 },
  { pattern: /jetta\b.*mk5/i, brandModel: "VOLKSWAGEN JETTA MK5", startYear: 2005, endYear: 2010 },
  { pattern: /jetta\b/i, brandModel: "VOLKSWAGEN JETTA", startYear: 2011, endYear: 2018 },
  { pattern: /tiguan\b/i, brandModel: "VOLKSWAGEN TIGUAN", startYear: 2016, endYear: 2024 },
  { pattern: /t-roc\b/i, brandModel: "VOLKSWAGEN T-ROC", startYear: 2018, endYear: 2025 },
  { pattern: /caddy\b/i, brandModel: "VOLKSWAGEN CADDY", startYear: 2011, endYear: 2020 },
  { pattern: /transporter\s*t6\b/i, brandModel: "VW TRANSPORTER T6", startYear: 2015, endYear: 2023 },
  { pattern: /transporter\s*t5\b/i, brandModel: "VW TRANSPORTER T5", startYear: 2003, endYear: 2015 },
  { pattern: /arteon\b/i, brandModel: "VOLKSWAGEN ARTEON", startYear: 2017, endYear: 2024 },

  // HONDA
  { pattern: /civic\b.*fe1/i, brandModel: "HONDA CIVIC FE1", startYear: 2021, endYear: 2025, defaultChassis: "FE1 Sedan Kasa" },
  { pattern: /civic\b.*fc5.*makyajl[ıi]/i, brandModel: "HONDA CIVIC FC5", startYear: 2019, endYear: 2021, defaultChassis: "FC5 Makyajlı Kasa" },
  { pattern: /civic\b.*fc5/i, brandModel: "HONDA CIVIC FC5", startYear: 2016, endYear: 2021, defaultChassis: "FC5 Kasa" },
  { pattern: /civic\b.*fb7/i, brandModel: "HONDA CIVIC FB7", startYear: 2012, endYear: 2016, defaultChassis: "FB7 Kasa" },
  { pattern: /civic\b.*fd6/i, brandModel: "HONDA CIVIC FD6", startYear: 2006, endYear: 2011, defaultChassis: "FD6 Kasa" },
  { pattern: /civic\b.*ies/i, brandModel: "HONDA CIVIC IES", startYear: 1998, endYear: 2001, defaultChassis: "IES Kasa" },
  { pattern: /civic\b.*vtec\s*2/i, brandModel: "HONDA CIVIC ES7 (VTEC 2)", startYear: 2001, endYear: 2006 },
  { pattern: /accord\b/i, brandModel: "HONDA ACCORD", startYear: 2008, endYear: 2015 },

  // BMW
  { pattern: /\bg20\b/i, brandModel: "BMW 3 SERİSİ G20", startYear: 2019, endYear: 2024, defaultChassis: "G20 Sedan Kasa" },
  { pattern: /\bf30\b/i, brandModel: "BMW 3 SERİSİ F30", startYear: 2012, endYear: 2018, defaultChassis: "F30 Sedan Kasa" },
  { pattern: /\be90\b.*lci/i, brandModel: "BMW 3 SERİSİ E90 LCI", startYear: 2008, endYear: 2011, defaultChassis: "Makyajlı (LCI) Kasa" },
  { pattern: /\be90\b/i, brandModel: "BMW 3 SERİSİ E90", startYear: 2005, endYear: 2011, defaultChassis: "E90 Sedan Kasa" },
  { pattern: /\be92\b/i, brandModel: "BMW 3 SERİSİ E92", startYear: 2006, endYear: 2013, defaultChassis: "E92 Coupe Kasa" },
  { pattern: /\be46\b/i, brandModel: "BMW 3 SERİSİ E46", startYear: 1998, endYear: 2005, defaultChassis: "E46 Kasa" },
  { pattern: /\be36\b/i, brandModel: "BMW 3 SERİSİ E36", startYear: 1991, endYear: 1998, defaultChassis: "E36 Kasa" },
  { pattern: /\bg30\b/i, brandModel: "BMW 5 SERİSİ G30", startYear: 2017, endYear: 2023, defaultChassis: "G30 Sedan Kasa" },
  { pattern: /\bf10\b/i, brandModel: "BMW 5 SERİSİ F10", startYear: 2010, endYear: 2017, defaultChassis: "F10 Sedan Kasa" },
  { pattern: /\be60\b/i, brandModel: "BMW 5 SERİSİ E60", startYear: 2003, endYear: 2010, defaultChassis: "E60 Sedan Kasa" },
  { pattern: /\be39\b/i, brandModel: "BMW 5 SERİSİ E39", startYear: 1996, endYear: 2003, defaultChassis: "E39 Sedan Kasa" },
  { pattern: /\bf20\b/i, brandModel: "BMW 1 SERİSİ F20", startYear: 2011, endYear: 2019, defaultChassis: "F20 Hatchback Kasa" },
  { pattern: /\bf40\b/i, brandModel: "BMW 1 SERİSİ F40", startYear: 2019, endYear: 2024, defaultChassis: "F40 Hatchback Kasa" },
  { pattern: /\bf32\b|\bf36\b/i, brandModel: "BMW 4 SERİSİ F32/F36", startYear: 2013, endYear: 2020, defaultChassis: "Coupe / Gran Coupe" },
  { pattern: /\bg22\b|\bg26\b/i, brandModel: "BMW 4 SERİSİ G22/G26", startYear: 2020, endYear: 2025 },

  // MERCEDES-BENZ
  { pattern: /\bw206\b/i, brandModel: "MERCEDES C SERİSİ W206", startYear: 2021, endYear: 2025, defaultChassis: "W206 Sedan Kasa" },
  { pattern: /\bw205\b/i, brandModel: "MERCEDES C SERİSİ W205", startYear: 2014, endYear: 2021, defaultChassis: "W205 Sedan Kasa" },
  { pattern: /\bw204\b.*makyajl[ıi]/i, brandModel: "MERCEDES C SERİSİ W204", startYear: 2011, endYear: 2014, defaultChassis: "W204 Makyajlı (FL) Kasa" },
  { pattern: /\bw204\b/i, brandModel: "MERCEDES C SERİSİ W204", startYear: 2007, endYear: 2014, defaultChassis: "W204 Kasa" },
  { pattern: /\bw213\b/i, brandModel: "MERCEDES E SERİSİ W213", startYear: 2016, endYear: 2023, defaultChassis: "W213 Kasa" },
  { pattern: /\bw212\b/i, brandModel: "MERCEDES E SERİSİ W212", startYear: 2009, endYear: 2016, defaultChassis: "W212 Kasa" },
  { pattern: /\bw177\b/i, brandModel: "MERCEDES A SERİSİ W177", startYear: 2018, endYear: 2024, defaultChassis: "W177 Kasa" },
  { pattern: /\bw176\b/i, brandModel: "MERCEDES A SERİSİ W176", startYear: 2012, endYear: 2018, defaultChassis: "W176 Hatchback Kasa" },
  { pattern: /\bc117\b|\bcla\b/i, brandModel: "MERCEDES CLA SERİSİ C117", startYear: 2013, endYear: 2019, defaultChassis: "C117 Kasa" },
  { pattern: /\bc118\b/i, brandModel: "MERCEDES CLA SERİSİ C118", startYear: 2019, endYear: 2024, defaultChassis: "C118 Kasa" },
  { pattern: /\bvito\b|\bw447\b/i, brandModel: "MERCEDES VITO W447", startYear: 2014, endYear: 2024 },

  // SEAT
  { pattern: /leon\b.*mk4/i, brandModel: "SEAT LEON MK4", startYear: 2020, endYear: 2025, defaultChassis: "MK4 (KL) Kasa" },
  { pattern: /leon\b.*mk3|leon\b.*5f|leon\b.*fr/i, brandModel: "SEAT LEON MK3 (5F)", startYear: 2012, endYear: 2020, defaultChassis: "MK3 / 5F Kasa" },
  { pattern: /leon\b.*mk2/i, brandModel: "SEAT LEON MK2 (1P)", startYear: 2005, endYear: 2012, defaultChassis: "MK2 / 1P Kasa" },
  { pattern: /leon\b/i, brandModel: "SEAT LEON", startYear: 2012, endYear: 2020 },
  { pattern: /ibiza\b.*6j/i, brandModel: "SEAT IBIZA 6J", startYear: 2008, endYear: 2017 },
  { pattern: /ibiza\b/i, brandModel: "SEAT IBIZA", startYear: 2012, endYear: 2022 },
  { pattern: /ateca\b/i, brandModel: "SEAT ATECA", startYear: 2016, endYear: 2024 },

  // AUDI
  { pattern: /a3\b.*8y/i, brandModel: "AUDI A3 8Y", startYear: 2020, endYear: 2025 },
  { pattern: /a3\b.*8v/i, brandModel: "AUDI A3 8V", startYear: 2012, endYear: 2020 },
  { pattern: /a3\b.*8p/i, brandModel: "AUDI A3 8P", startYear: 2004, endYear: 2012 },
  { pattern: /a3\b/i, brandModel: "AUDI A3", startYear: 2012, endYear: 2020 },
  { pattern: /a4\b.*b9/i, brandModel: "AUDI A4 B9", startYear: 2015, endYear: 2023 },
  { pattern: /a4\b.*b8/i, brandModel: "AUDI A4 B8", startYear: 2008, endYear: 2015 },
  { pattern: /a4\b/i, brandModel: "AUDI A4", startYear: 2008, endYear: 2016 },
  { pattern: /a5\b/i, brandModel: "AUDI A5", startYear: 2009, endYear: 2020 },
  { pattern: /a6\b/i, brandModel: "AUDI A6", startYear: 2011, endYear: 2022 },

  // RENAULT
  { pattern: /megane\s*4\b/i, brandModel: "RENAULT MEGANE 4", startYear: 2016, endYear: 2024, defaultChassis: "Megane IV Kasa" },
  { pattern: /megane\s*3\b/i, brandModel: "RENAULT MEGANE 3", startYear: 2009, endYear: 2016, defaultChassis: "Megane III Kasa" },
  { pattern: /megane\s*2\b/i, brandModel: "RENAULT MEGANE 2", startYear: 2002, endYear: 2009, defaultChassis: "Megane II Kasa" },
  { pattern: /clio\s*5\b/i, brandModel: "RENAULT CLIO 5", startYear: 2019, endYear: 2025, defaultChassis: "Clio V Kasa" },
  { pattern: /clio\s*4\b.*makyajl[ıi]/i, brandModel: "RENAULT CLIO 4", startYear: 2016, endYear: 2019, defaultChassis: "Makyajlı Kasa" },
  { pattern: /clio\s*4\b/i, brandModel: "RENAULT CLIO 4", startYear: 2012, endYear: 2019, defaultChassis: "Clio IV Kasa" },
  { pattern: /clio\s*3\b/i, brandModel: "RENAULT CLIO 3", startYear: 2005, endYear: 2012 },
  { pattern: /fluence\b/i, brandModel: "RENAULT FLUENCE", startYear: 2009, endYear: 2016 },
  { pattern: /symbol\b/i, brandModel: "RENAULT SYMBOL", startYear: 2013, endYear: 2021 },
  { pattern: /taliant\b/i, brandModel: "RENAULT TALIANT", startYear: 2021, endYear: 2025 },
  { pattern: /captur\b/i, brandModel: "RENAULT CAPTUR", startYear: 2013, endYear: 2023 },
  { pattern: /kadjar\b/i, brandModel: "RENAULT KADJAR", startYear: 2015, endYear: 2022 },
  { pattern: /austral\b/i, brandModel: "RENAULT AUSTRAL", startYear: 2022, endYear: 2026 },

  // FIAT
  { pattern: /egea\b.*cross/i, brandModel: "FIAT EGEA CROSS", startYear: 2021, endYear: 2025, defaultChassis: "Cross Kasa" },
  { pattern: /egea\b/i, brandModel: "FIAT EGEA", startYear: 2015, endYear: 2025, defaultChassis: "Sedan / HB Kasa" },
  { pattern: /linea\b.*makyajl[ıi]/i, brandModel: "FIAT LINEA", startYear: 2012, endYear: 2018, defaultChassis: "Makyajlı Kasa" },
  { pattern: /linea\b.*makyajs[ıi]z/i, brandModel: "FIAT LINEA", startYear: 2007, endYear: 2012, defaultChassis: "Makyajsız Kasa" },
  { pattern: /linea\b/i, brandModel: "FIAT LINEA", startYear: 2007, endYear: 2018 },
  { pattern: /punto\s*evo\b/i, brandModel: "FIAT PUNTO EVO", startYear: 2009, endYear: 2015 },
  { pattern: /grande\s*punto\b|punto\b/i, brandModel: "FIAT GRANDE PUNTO", startYear: 2005, endYear: 2015 },
  { pattern: /doblo\b/i, brandModel: "FIAT DOBLO", startYear: 2010, endYear: 2023 },
  { pattern: /fiorino\b/i, brandModel: "FIAT FIORINO", startYear: 2008, endYear: 2024 },
  { pattern: /bravo\b/i, brandModel: "FIAT BRAVO", startYear: 2007, endYear: 2014 },

  // FORD
  { pattern: /focus\b.*mk4|focus\s*4\b/i, brandModel: "FORD FOCUS MK4", startYear: 2018, endYear: 2024, defaultChassis: "MK4 Kasa" },
  { pattern: /focus\b.*3[.,]5|focus\b.*mk3[.,]5/i, brandModel: "FORD FOCUS MK3.5", startYear: 2014, endYear: 2018, defaultChassis: "Makyajlı (MK3.5) Kasa" },
  { pattern: /focus\b.*mk3|focus\s*3\b/i, brandModel: "FORD FOCUS MK3", startYear: 2011, endYear: 2014, defaultChassis: "MK3 Kasa" },
  { pattern: /focus\b.*mk2[.,]5|focus\s*2[.,]5\b/i, brandModel: "FORD FOCUS MK2.5", startYear: 2008, endYear: 2011, defaultChassis: "Makyajlı (MK2.5) Kasa" },
  { pattern: /focus\b.*mk2|focus\s*2\b/i, brandModel: "FORD FOCUS MK2", startYear: 2005, endYear: 2011, defaultChassis: "MK2 Kasa" },
  { pattern: /focus\b/i, brandModel: "FORD FOCUS", startYear: 2011, endYear: 2018 },
  { pattern: /fiesta\b.*mk7[.,]5/i, brandModel: "FORD FIESTA MK7.5", startYear: 2013, endYear: 2017, defaultChassis: "Makyajlı Kasa" },
  { pattern: /fiesta\b/i, brandModel: "FORD FIESTA", startYear: 2008, endYear: 2017 },
  { pattern: /courier\b/i, brandModel: "FORD TOURNEO COURIER", startYear: 2014, endYear: 2023 },
  { pattern: /connect\b/i, brandModel: "FORD TOURNEO CONNECT", startYear: 2009, endYear: 2018 },
  { pattern: /custom\b/i, brandModel: "FORD TRANSIT CUSTOM", startYear: 2012, endYear: 2023 },
  { pattern: /mondeo\b/i, brandModel: "FORD MONDEO", startYear: 2010, endYear: 2019 },
  { pattern: /kuga\b/i, brandModel: "FORD KUGA", startYear: 2013, endYear: 2023 },
  { pattern: /puma\b/i, brandModel: "FORD PUMA", startYear: 2020, endYear: 2025 },

  // HYUNDAI
  { pattern: /i20\b/i, brandModel: "HYUNDAI i20", startYear: 2014, endYear: 2023 },
  { pattern: /i30\b/i, brandModel: "HYUNDAI i30", startYear: 2012, endYear: 2020 },
  { pattern: /accent\s*blue\b/i, brandModel: "HYUNDAI ACCENT BLUE", startYear: 2011, endYear: 2018 },
  { pattern: /accent\s*era\b/i, brandModel: "HYUNDAI ACCENT ERA", startYear: 2006, endYear: 2012 },
  { pattern: /elantra\b/i, brandModel: "HYUNDAI ELANTRA", startYear: 2016, endYear: 2023 },
  { pattern: /tucson\b/i, brandModel: "HYUNDAI TUCSON", startYear: 2015, endYear: 2024 },
  { pattern: /bayon\b/i, brandModel: "HYUNDAI BAYON", startYear: 2021, endYear: 2025 },

  // TOYOTA
  { pattern: /corolla\b/i, brandModel: "TOYOTA COROLLA", startYear: 2013, endYear: 2024 },
  { pattern: /auris\b/i, brandModel: "TOYOTA AURIS", startYear: 2007, endYear: 2018 },
  { pattern: /yaris\b/i, brandModel: "TOYOTA YARIS", startYear: 2012, endYear: 2023 },
  { pattern: /c-hr\b|chr\b/i, brandModel: "TOYOTA C-HR", startYear: 2016, endYear: 2024 },

  // PEUGEOT & CITROEN
  { pattern: /peugeot\s*206\b|\b206\b/i, brandModel: "PEUGEOT 206", startYear: 1998, endYear: 2011 },
  { pattern: /peugeot\s*207\b|\b207\b/i, brandModel: "PEUGEOT 207", startYear: 2006, endYear: 2012 },
  { pattern: /peugeot\s*208\b|\b208\b/i, brandModel: "PEUGEOT 208", startYear: 2012, endYear: 2024 },
  { pattern: /peugeot\s*301\b|\b301\b/i, brandModel: "PEUGEOT 301", startYear: 2012, endYear: 2021 },
  { pattern: /peugeot\s*308\b|\b308\b/i, brandModel: "PEUGEOT 308", startYear: 2013, endYear: 2024 },
  { pattern: /peugeot\s*408\b|\b408\b/i, brandModel: "PEUGEOT 408", startYear: 2022, endYear: 2026 },
  { pattern: /peugeot\s*508\b|\b508\b/i, brandModel: "PEUGEOT 508", startYear: 2011, endYear: 2023 },
  { pattern: /peugeot\s*2008\b|\b2008\b/i, brandModel: "PEUGEOT 2008", startYear: 2019, endYear: 2025 },
  { pattern: /peugeot\s*3008\b|\b3008\b/i, brandModel: "PEUGEOT 3008", startYear: 2016, endYear: 2024 },
  { pattern: /rifter\b/i, brandModel: "PEUGEOT RIFTER", startYear: 2018, endYear: 2024 },
  { pattern: /c-elysee\b|c\s*elysee\b/i, brandModel: "CITROEN C-ELYSEE", startYear: 2012, endYear: 2021 },
  { pattern: /citroen\s*c3\b|\bc3\b/i, brandModel: "CITROEN C3", startYear: 2016, endYear: 2024 },
  { pattern: /citroen\s*c4\b|\bc4\b/i, brandModel: "CITROEN C4", startYear: 2011, endYear: 2024 },
  { pattern: /berlingo\b/i, brandModel: "CITROEN BERLINGO", startYear: 2018, endYear: 2024 },

  // SKODA, KIA, DACIA, NISSAN, TOGG, TESLA, CHERY, BYD, MG
  { pattern: /octavia\b.*a8/i, brandModel: "SKODA OCTAVIA A8", startYear: 2020, endYear: 2025 },
  { pattern: /octavia\b.*a7/i, brandModel: "SKODA OCTAVIA A7", startYear: 2013, endYear: 2020 },
  { pattern: /octavia\b/i, brandModel: "SKODA OCTAVIA", startYear: 2013, endYear: 2023 },
  { pattern: /superb\b/i, brandModel: "SKODA SUPERB", startYear: 2015, endYear: 2024 },
  { pattern: /scala\b/i, brandModel: "SKODA SCALA", startYear: 2019, endYear: 2025 },
  { pattern: /kamiq\b/i, brandModel: "SKODA KAMIQ", startYear: 2019, endYear: 2025 },
  { pattern: /ceed\b/i, brandModel: "KIA CEED", startYear: 2012, endYear: 2023 },
  { pattern: /cerato\b/i, brandModel: "KIA CERATO", startYear: 2016, endYear: 2024 },
  { pattern: /sportage\b/i, brandModel: "KIA SPORTAGE", startYear: 2016, endYear: 2024 },
  { pattern: /duster\b/i, brandModel: "DACIA DUSTER", startYear: 2014, endYear: 2024 },
  { pattern: /sandero\b/i, brandModel: "DACIA SANDERO", startYear: 2013, endYear: 2024 },
  { pattern: /qashqai\b/i, brandModel: "NISSAN QASHQAI", startYear: 2014, endYear: 2024 },
  { pattern: /lancer\b/i, brandModel: "MITSUBISHI LANCER", startYear: 2008, endYear: 2017 },
  { pattern: /t10x\b|togg\b/i, brandModel: "TOGG T10X", startYear: 2023, endYear: 2026 },
  { pattern: /model\s*y\b/i, brandModel: "TESLA MODEL Y", startYear: 2020, endYear: 2026 },
  { pattern: /model\s*3\b/i, brandModel: "TESLA MODEL 3", startYear: 2019, endYear: 2026 },
  { pattern: /omoda\s*5\b/i, brandModel: "CHERY OMODA 5", startYear: 2022, endYear: 2026 },
  { pattern: /tiggo\s*7\b/i, brandModel: "CHERY TIGGO 7 PRO", startYear: 2022, endYear: 2026 },
  { pattern: /tiggo\s*8\b/i, brandModel: "CHERY TIGGO 8 PRO", startYear: 2022, endYear: 2026 },
  { pattern: /seal\s*u\b|byd\b/i, brandModel: "BYD SEAL U", startYear: 2023, endYear: 2026 },
  { pattern: /mg\s*4\b|mg4\b/i, brandModel: "MG4 ELECTRIC", startYear: 2022, endYear: 2026 },
  { pattern: /mg\s*hs\b/i, brandModel: "MG HS", startYear: 2021, endYear: 2026 },
]

export function extractVehicleCompatibility(
  title: string,
  description?: string | null,
  metadata?: Record<string, any> | null
): VehicleCompatibilityInfo {
  const rawTitle = (title || "").trim()
  const rawDesc = (description || "").trim()
  const combined = `${rawTitle} ${rawDesc}`

  const isTrunkMat = /bagaj\s*havuzu/i.test(rawTitle)
  const isPrePaintedPianoBlack =
    /piano\s*black|parlak\s*siyah|boyal[ıi]/i.test(rawTitle) &&
    !/boyas[ıi]z/i.test(rawTitle)

  // Determine chassis sub-label
  let chassisLabel = "Standart Kasa"
  if (/makyajs[ıi]z/i.test(combined) && /hb|hatchback/i.test(combined)) {
    chassisLabel = "Makyajsız Hatchback Kasa"
  } else if (/makyajl[ıi]/i.test(combined) && /hb|hatchback/i.test(combined)) {
    chassisLabel = "Makyajlı Hatchback Kasa"
  } else if (/makyajs[ıi]z/i.test(combined) && /sedan/i.test(combined)) {
    chassisLabel = "Makyajsız Sedan Kasa"
  } else if (/makyajl[ıi]/i.test(combined) && /sedan/i.test(combined)) {
    chassisLabel = "Makyajlı Sedan Kasa"
  } else if (/makyajs[ıi]z/i.test(combined)) {
    chassisLabel = "Makyajsız Kasa"
  } else if (/makyajl[ıi]/i.test(combined)) {
    chassisLabel = "Makyajlı Kasa"
  } else if (/\bsedan\b/i.test(combined)) {
    chassisLabel = "Sedan Kasa"
  } else if (/\bhb\b|hatchback/i.test(combined)) {
    chassisLabel = "Hatchback Kasa"
  } else if (/\bcoupe\b/i.test(combined)) {
    chassisLabel = "Coupe Kasa"
  } else if (/\bsuv\b|cross/i.test(combined)) {
    chassisLabel = "SUV / Cross Kasa"
  }

  let matchedRule: KnownVehicleRule | undefined
  for (const rule of KNOWN_VEHICLE_RULES) {
    if (rule.pattern.test(rawTitle) || rule.pattern.test(rawDesc)) {
      matchedRule = rule
      break
    }
  }

  if (matchedRule?.defaultChassis && chassisLabel === "Standart Kasa") {
    chassisLabel = matchedRule.defaultChassis
  }

  // Extract explicit year range from title or description if present
  // Examples: "2009-2013", "2000 - 2003", "2017+", "2016 Yılı ve Sonrası", "2016"
  let startYear = matchedRule?.startYear || 0
  let endYear = matchedRule?.endYear || 0

  const rangeMatch =
    rawTitle.match(/\b(199\d|20[0-2]\d)\s*[-–/]\s*(199\d|20[0-2]\d)\b/) ||
    rawDesc.match(/\b(199\d|20[0-2]\d)\s*[-–/]\s*(199\d|20[0-2]\d)\b/)

  const openEndedMatch =
    rawTitle.match(/\b(20[0-2]\d)\s*(?:\+|ve\s*sonras[ıi]|y[ıi]l[ıi]\s*ve\s*sonras[ıi]|üzeri|uzeri)/i) ||
    rawDesc.match(/\b(20[0-2]\d)\s*(?:\+|ve\s*sonras[ıi]|y[ıi]l[ıi]\s*ve\s*sonras[ıi]|üzeri|uzeri)/i)

  const singleYearMatch = rawTitle.match(/\b(199\d|20[0-2]\d)\b/)

  if (rangeMatch) {
    const y1 = parseInt(rangeMatch[1], 10)
    const y2 = parseInt(rangeMatch[2], 10)
    if (y1 >= 1990 && y2 >= y1 && y2 <= 2027) {
      startYear = y1
      endYear = y2
    }
  } else if (openEndedMatch) {
    const y1 = parseInt(openEndedMatch[1], 10)
    if (y1 >= 2005 && y1 <= 2026) {
      startYear = y1
      endYear = Math.min(2026, y1 + 5)
    }
  } else if (!matchedRule && singleYearMatch) {
    const y1 = parseInt(singleYearMatch[1], 10)
    startYear = y1
    endYear = Math.min(2026, y1 + 3)
  }

  let brandAndModel = matchedRule?.brandModel || ""
  if (!brandAndModel) {
    // Fallback: take first 2-3 words of title before part keywords
    const cleaned = rawTitle
      .replace(
        /\b(uyumlu|body\s*kit|ön\s*ek|on\s*ek|ön\s*lip|arka\s*ek|difüzör|difuzor|marşpiyel|marspiyel|spoiler|spoyler|bagaj|havuzu|plastik|piano\s*black|parlak\s*siyah|boyasız|boyalı|seti|takımı|panjur|böbrek|yarasa|ayna|kapağı)\b.*/i,
        ""
      )
      .replace(/\b(199\d|20[0-2]\d)(\s*[-–/]\s*(199\d|20[0-2]\d))?\+?\b/g, "")
      .trim()

    brandAndModel = (cleaned || rawTitle.split(/\s+/).slice(0, 2).join(" ")).toUpperCase()
  }

  const isUniversalOrAccessory =
    /üniversal|universal|tüm\s*araçlar/i.test(combined) || (!matchedRule && startYear === 0)

  if (startYear === 0 || endYear === 0) {
    startYear = 2015
    endYear = 2024
  }

  // Build timeline array with 1-2 padding years before and after (total 6 to 8 segments)
  const activeSpan = endYear - startYear + 1
  const timelineYears: { year: number; active: boolean }[] = []

  if (activeSpan <= 6) {
    const padBefore = activeSpan <= 4 ? 2 : 1
    const padAfter = activeSpan <= 4 ? 2 : 1
    for (let y = startYear - padBefore; y <= endYear + padAfter; y++) {
      timelineYears.push({
        year: y,
        active: y >= startYear && y <= endYear,
      })
    }
  } else {
    // Sample up to 6 active years + 1 before + 1 after so the bar stays compact on mobile & desktop
    timelineYears.push({ year: startYear - 1, active: false })
    const step = Math.max(1, Math.floor((endYear - startYear) / 4))
    const picked = new Set<number>([startYear])
    for (let y = startYear + step; y < endYear; y += step) {
      if (picked.size < 4) picked.add(y)
    }
    picked.add(endYear)
    Array.from(picked)
      .sort((a, b) => a - b)
      .forEach((y) => timelineYears.push({ year: y, active: true }))
    timelineYears.push({ year: endYear + 1, active: false })
  }

  return {
    brandAndModel,
    chassisLabel,
    startYear,
    endYear,
    timelineYears,
    isUniversalOrAccessory,
    isPrePaintedPianoBlack,
    isTrunkMat,
  }
}
