export interface IJunkyard {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  inventoryLink: string;
  priceListLink: string;
  estimatedSize: number;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  costRating: '1' | '2' | '3' | '';
  createdAt: string;
  updatedAt: string;
} 