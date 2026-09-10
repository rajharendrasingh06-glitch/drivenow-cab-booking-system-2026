export interface CityLandmark {
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'airport' | 'railway' | 'tech_park' | 'commercial' | 'mall' | 'residential' | string;
}

export interface CityData {
  id: string;
  name: string;
  state: string;
  center: { lat: number; lng: number };
  centerLat: number;
  centerLng: number;
  popularLandmarks: CityLandmark[];
  landmarks: CityLandmark[];
  stateRtoCodes: string[];
  fleetCount: number;
  cityImage: string;
}

const RAW_INDIAN_CITIES = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    center: { lat: 19.0760, lng: 72.8777 },
    stateRtoCodes: ['MH 01', 'MH 02', 'MH 03', 'MH 47'],
    popularLandmarks: [
      { name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)', address: 'Fort, Mumbai, Maharashtra 400001', lat: 18.9402, lng: 72.8356, type: 'railway' },
      { name: 'Chhatrapati Shivaji Maharaj Int’l Airport (T2)', address: 'Sahar, Andheri East, Mumbai 400099', lat: 19.0896, lng: 72.8656, type: 'airport' },
      { name: 'Bandra Kurla Complex (BKC)', address: 'G Block, Bandra East, Mumbai 400051', lat: 19.0664, lng: 72.8690, type: 'tech_park' },
      { name: 'Gateway of India', address: 'Apollo Bandar, Colaba, Mumbai 400001', lat: 18.9220, lng: 72.8347, type: 'commercial' },
      { name: 'Phoenix Palladium Mall', address: '462, Senapati Bapat Marg, Lower Parel, Mumbai 400013', lat: 18.9953, lng: 72.8247, type: 'mall' },
      { name: 'Hiranandani Gardens', address: 'Powai, Mumbai, Maharashtra 400076', lat: 19.1176, lng: 72.9060, type: 'residential' },
      { name: 'Carter Road Promenade', address: 'Bandra West, Mumbai 400050', lat: 19.0667, lng: 72.8258, type: 'commercial' },
    ],
  },
  {
    id: 'navi-mumbai',
    name: 'Navi Mumbai',
    state: 'Maharashtra',
    center: { lat: 19.0330, lng: 73.0297 },
    stateRtoCodes: ['MH 43', 'MH 46'],
    popularLandmarks: [
      { name: 'Vashi Station & Plaza', address: 'Sector 30A, Vashi, Navi Mumbai 400703', lat: 19.0634, lng: 72.9995, type: 'railway' },
      { name: 'CBD Belapur Sector 11', address: 'CBD Belapur, Navi Mumbai 400614', lat: 19.0178, lng: 73.0401, type: 'commercial' },
      { name: 'Kharghar Central Park', address: 'Sector 23, Kharghar, Navi Mumbai 410210', lat: 19.0435, lng: 73.0712, type: 'residential' },
      { name: 'Seawoods Grand Central Mall', address: 'Sector 40, Nerul, Navi Mumbai 400706', lat: 19.0210, lng: 73.0180, type: 'mall' },
    ],
  },
  {
    id: 'thane',
    name: 'Thane',
    state: 'Maharashtra',
    center: { lat: 19.2183, lng: 72.9781 },
    stateRtoCodes: ['MH 04', 'MH 05'],
    popularLandmarks: [
      { name: 'Viviana Mall', address: 'Eastern Express Highway, Thane West 400606', lat: 19.2094, lng: 72.9734, type: 'mall' },
      { name: 'Thane Railway Station', address: 'Station Rd, Thane West 400601', lat: 19.1860, lng: 72.9759, type: 'railway' },
      { name: 'Majiwada Junction', address: 'Ghodbunder Rd, Majiwada, Thane 400601', lat: 19.2188, lng: 72.9866, type: 'commercial' },
      { name: 'Korum Mall', address: 'Mangal Pandey Rd, Near Cadbury, Thane 400606', lat: 19.2030, lng: 72.9691, type: 'mall' },
    ],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    state: 'Delhi NCR',
    center: { lat: 28.6139, lng: 77.2090 },
    stateRtoCodes: ['DL 01', 'DL 03', 'DL 08', 'DL 10', 'DL 12'],
    popularLandmarks: [
      { name: 'Indira Gandhi Int’l Airport (T3)', address: 'Palam, New Delhi 110037', lat: 28.5562, lng: 77.1000, type: 'airport' },
      { name: 'Connaught Place (Inner Circle)', address: 'Connaught Place, New Delhi 110001', lat: 28.6315, lng: 77.2167, type: 'commercial' },
      { name: 'New Delhi Railway Station (Paharganj)', address: 'Bhavbhuti Marg, New Delhi 110002', lat: 28.6429, lng: 77.2195, type: 'railway' },
      { name: 'Select CITYWALK Mall', address: 'A-3, District Centre, Saket, New Delhi 110017', lat: 28.5284, lng: 77.2188, type: 'mall' },
      { name: 'Hauz Khas Village', address: 'Deer Park, Hauz Khas, New Delhi 110016', lat: 28.5535, lng: 77.1945, type: 'commercial' },
    ],
  },
  {
    id: 'gurugram',
    name: 'Gurugram',
    state: 'Haryana',
    center: { lat: 28.4595, lng: 77.0266 },
    stateRtoCodes: ['HR 26', 'HR 55'],
    popularLandmarks: [
      { name: 'DLF Cyber City Building 10', address: 'DLF Phase 2, Gurugram, Haryana 122002', lat: 28.4950, lng: 77.0895, type: 'tech_park' },
      { name: 'Golf Course Road Horizon Center', address: 'Sector 43, DLF Phase 5, Gurugram 122002', lat: 28.4720, lng: 77.0987, type: 'commercial' },
      { name: 'Ambience Mall Gurugram', address: 'NH-8, Ambience Island, Gurugram 122002', lat: 28.5055, lng: 77.0970, type: 'mall' },
      { name: 'Sector 29 Food & Leisure District', address: 'Sector 29, Gurugram 122001', lat: 28.4682, lng: 77.0628, type: 'commercial' },
    ],
  },
  {
    id: 'noida',
    name: 'Noida',
    state: 'Uttar Pradesh',
    center: { lat: 28.5355, lng: 77.3910 },
    stateRtoCodes: ['UP 16'],
    popularLandmarks: [
      { name: 'DLF Mall of India', address: 'Sector 18, Noida, Uttar Pradesh 201301', lat: 28.5677, lng: 77.3211, type: 'mall' },
      { name: 'Noida Electronic City Metro', address: 'Sector 62, Noida 201309', lat: 28.6280, lng: 77.3670, type: 'tech_park' },
      { name: 'Advant Navis Business Park', address: 'Sector 142, Noida-Greater Noida Expy 201305', lat: 28.4988, lng: 77.4182, type: 'tech_park' },
    ],
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    center: { lat: 12.9716, lng: 77.5946 },
    stateRtoCodes: ['KA 01', 'KA 03', 'KA 04', 'KA 05', 'KA 51', 'KA 53'],
    popularLandmarks: [
      { name: 'Kempegowda Int’l Airport (KIA)', address: 'Devanahalli, Bengaluru, Karnataka 560300', lat: 13.1986, lng: 77.7066, type: 'airport' },
      { name: 'Koramangala Sony World Signal', address: '80 Feet Rd, Koramangala 4th Block, Bengaluru 560034', lat: 12.9352, lng: 77.6245, type: 'commercial' },
      { name: 'Manyata Tech Park', address: 'Nagavara, Outer Ring Road, Bengaluru 560045', lat: 13.0478, lng: 77.6208, type: 'tech_park' },
      { name: 'Indiranagar 100 Feet Road', address: 'HAL 2nd Stage, Indiranagar, Bengaluru 560038', lat: 12.9719, lng: 77.6412, type: 'commercial' },
      { name: 'Electronic City Phase 1 Infosys Gate', address: 'Electronic City, Bengaluru 560100', lat: 12.8399, lng: 77.6770, type: 'tech_park' },
      { name: 'Krantivira Sangolli Rayanna (Majestic) Station', address: 'Sevashrama, Bengaluru 560023', lat: 12.9781, lng: 77.5696, type: 'railway' },
    ],
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5204, lng: 73.8567 },
    stateRtoCodes: ['MH 12', 'MH 14'],
    popularLandmarks: [
      { name: 'Pune International Airport', address: 'New Airport Rd, Lohegaon, Pune 411032', lat: 18.5822, lng: 73.9197, type: 'airport' },
      { name: 'Hinjawadi Rajiv Gandhi Infotech Park', address: 'Phase 1, Hinjawadi, Pune 411057', lat: 18.5912, lng: 73.7389, type: 'tech_park' },
      { name: 'Koregaon Park North Main Road', address: 'Koregaon Park, Pune 411001', lat: 18.5362, lng: 73.8940, type: 'commercial' },
      { name: 'Phoenix Marketcity Viman Nagar', address: 'Viman Nagar, Pune 411014', lat: 18.5620, lng: 73.9168, type: 'mall' },
      { name: 'Pune Railway Station', address: 'Agarkar Nagar, Pune 411001', lat: 18.5289, lng: 73.8744, type: 'railway' },
    ],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    center: { lat: 17.3850, lng: 78.4867 },
    stateRtoCodes: ['TS 07', 'TS 08', 'TS 09', 'TS 10'],
    popularLandmarks: [
      { name: 'Rajiv Gandhi Int’l Airport (RGIA)', address: 'Shamshabad, Hyderabad 500409', lat: 17.2403, lng: 78.4294, type: 'airport' },
      { name: 'HITEC City Cyber Towers', address: 'Madhapur, Hyderabad 500081', lat: 17.4504, lng: 78.3808, type: 'tech_park' },
      { name: 'Gachibowli Financial District', address: 'Nanakramguda, Hyderabad 500032', lat: 17.4156, lng: 78.3427, type: 'tech_park' },
      { name: 'Banjara Hills Road No. 12', address: 'Banjara Hills, Hyderabad 500034', lat: 17.4123, lng: 78.4482, type: 'commercial' },
      { name: 'Secunderabad Railway Station', address: 'Station Rd, Secunderabad 500003', lat: 17.4344, lng: 78.5015, type: 'railway' },
    ],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    center: { lat: 13.0827, lng: 80.2707 },
    stateRtoCodes: ['TN 01', 'TN 02', 'TN 07', 'TN 09', 'TN 14'],
    popularLandmarks: [
      { name: 'Chennai International Airport (MAA)', address: 'GST Rd, Meenambakkam, Chennai 600027', lat: 12.9941, lng: 80.1709, type: 'airport' },
      { name: 'TIDEL Park OMR', address: 'Rajiv Gandhi Salai, Tharamani, Chennai 600113', lat: 12.9897, lng: 80.2483, type: 'tech_park' },
      { name: 'T. Nagar Pondy Bazaar', address: 'T. Nagar, Chennai 600017', lat: 13.0418, lng: 80.2341, type: 'commercial' },
      { name: 'Express Avenue Mall', address: 'Royapettah, Chennai 600014', lat: 13.0587, lng: 80.2641, type: 'mall' },
      { name: 'Chennai Central Railway Station', address: 'Kannappar Thidal, Periyamet, Chennai 600003', lat: 13.0823, lng: 80.2755, type: 'railway' },
    ],
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    center: { lat: 23.0225, lng: 72.5714 },
    stateRtoCodes: ['GJ 01', 'GJ 27'],
    popularLandmarks: [
      { name: 'Sardar Vallabhbhai Patel Int’l Airport', address: 'Hansol, Ahmedabad 380003', lat: 23.0734, lng: 72.6266, type: 'airport' },
      { name: 'SG Highway Iscon Cross Roads', address: 'SG Highway, Satellite, Ahmedabad 380015', lat: 23.0276, lng: 72.5074, type: 'commercial' },
      { name: 'Sabarmati Riverfront Promenade', address: 'Riverfront Rd, Ahmedabad 380009', lat: 23.0338, lng: 72.5794, type: 'commercial' },
      { name: 'Kalupur Railway Station', address: 'Sakhar Bazar, Kalupur, Ahmedabad 380002', lat: 23.0232, lng: 72.6009, type: 'railway' },
    ],
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    center: { lat: 15.2993, lng: 74.1240 },
    stateRtoCodes: ['GA 01', 'GA 02', 'GA 03', 'GA 07'],
    popularLandmarks: [
      { name: 'Dabolim Airport (GOI)', address: 'Airport Rd, Dabolim, Goa 403801', lat: 15.3808, lng: 73.8314, type: 'airport' },
      { name: 'Manohar International Airport (MOPA)', address: 'Mopa, Pernem, North Goa 403512', lat: 15.7667, lng: 73.8667, type: 'airport' },
      { name: 'Calangute Beach Circle', address: 'Calangute, North Goa 403516', lat: 15.5439, lng: 73.7553, type: 'commercial' },
      { name: 'Panaji Church Square', address: 'Altinho, Panaji, Goa 403001', lat: 15.4989, lng: 73.8278, type: 'commercial' },
      { name: 'Madgaon Junction', address: 'Margao, South Goa 403601', lat: 15.2736, lng: 73.9782, type: 'railway' },
    ],
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    center: { lat: 26.9124, lng: 75.7873 },
    stateRtoCodes: ['RJ 14', 'RJ 45'],
    popularLandmarks: [
      { name: 'Jaipur International Airport', address: 'Sanganer, Jaipur 302029', lat: 26.8289, lng: 75.8056, type: 'airport' },
      { name: 'Hawa Mahal Badi Chaupar', address: 'Badi Choupad, J.D.A. Market, Pink City, Jaipur 302002', lat: 26.9239, lng: 75.8267, type: 'commercial' },
      { name: 'World Trade Park (WTP)', address: 'Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur 302017', lat: 26.8533, lng: 75.8052, type: 'mall' },
      { name: 'Jaipur Junction Railway Station', address: 'Gopalbari, Jaipur 302006', lat: 26.9200, lng: 75.7878, type: 'railway' },
    ],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    center: { lat: 22.5726, lng: 88.3639 },
    stateRtoCodes: ['WB 01', 'WB 02', 'WB 06', 'WB 20'],
    popularLandmarks: [
      { name: 'Netaji Subhash Chandra Bose Int’l Airport', address: 'Jessore Rd, Dum Dum, Kolkata 700052', lat: 22.6547, lng: 88.4467, type: 'airport' },
      { name: 'Howrah Railway Station', address: 'Station Rd, Howrah, West Bengal 711101', lat: 22.5839, lng: 88.3426, type: 'railway' },
      { name: 'Park Street Dining & Business Hub', address: 'Park St, Mullick Bazar, Kolkata 700016', lat: 22.5518, lng: 88.3524, type: 'commercial' },
      { name: 'Salt Lake Sector V IT Hub', address: 'Sector V, Bidhannagar, Kolkata 700091', lat: 22.5807, lng: 88.4312, type: 'tech_park' },
      { name: 'South City Mall', address: '375, Prince Anwar Shah Rd, Kolkata 700068', lat: 22.5015, lng: 88.3621, type: 'mall' },
    ],
  },
];

const CITY_IMAGES: Record<string, string> = {
  mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
  'navi-mumbai': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=600&q=80',
  thane: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
  pune: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80',
  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
  noida: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
  gurugram: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
  bengaluru: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
  hyderabad: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=600&q=80',
  chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
  ahmedabad: 'https://images.unsplash.com/photo-1596405344246-b329d138feb4?auto=format&fit=crop&w=600&q=80',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
  jaipur: 'https://images.unsplash.com/photo-1603228254119-e6a528dc5686?auto=format&fit=crop&w=600&q=80',
  kolkata: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80',
};

export const INDIAN_CITIES: CityData[] = RAW_INDIAN_CITIES.map((c, idx) => ({
  ...c,
  centerLat: c.center.lat,
  centerLng: c.center.lng,
  landmarks: c.popularLandmarks,
  fleetCount: idx % 2 === 0 ? 30 : 28,
  cityImage: CITY_IMAGES[c.id] || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
}));

