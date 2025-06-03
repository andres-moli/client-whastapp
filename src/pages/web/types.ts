export interface HeaderData {
  title: string;
  paragraph: string;
}

export interface AboutData {
  paragraph: string;
  Why: string[];
  Why2: string[];
}

export interface GalleryItem {
  title: string;
  largeImage: string;
  smallImage: string;
}

export interface Service {
  icon: string;
  name: string;
  text: string;
}

export interface Brand {
  name: string;
  logo: string;
}

export interface Testimonial {
  img: string;
  text: string;
  name: string;
}

export interface TeamMember {
  img: string;
  name: string;
  job: string;
}

export interface ContactData {
  address: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  youtube: string;
}

export interface Feature {
  icon: string;
  title: string;
  text: string;
}

export interface AppData {
  Header: HeaderData;
  About: AboutData;
  Gallery: GalleryItem[];
  Services: Service[];
  Marcas: Brand[];
  Testimonials: Testimonial[];
  Team: TeamMember[];
  Contact: ContactData;
  Features: Feature[];
}