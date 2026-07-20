export interface SiteSetting {
  id: number;
  schoolName: string;
  tagline: string;
  email: string;
  phone1: string;
  phone2: string;
  address: string;
  logoUrl: string;
  logoPublicId: string;
  faviconUrl: string;
  faviconPublicId: string;
  facebookUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  whatsappUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFromName: string;
  smtpFromEmail: string;
}

export interface HeroSlide {
  id: number;
  title: string;
  caption: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  publicId: string;
  order: number;
}

export interface Facility {
  id: number;
  title: string;
  description: string;
  icon: string;
  link: string;
  order: number;
}

export interface Stat {
  id: number;
  label: string;
  value: string;
  icon: string;
  suffix?: string;
  imageUrl?: string;
  publicId?: string;
  order?: number;
}

export interface NewsPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  publicId: string;
  createdAt: string;
}

export interface TeacherStaff {
  id: number;
  name: string;
  designation: string;
  photoUrl: string;
  publicId: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  email: string;
  bio: string;
  order: number;
}

export interface Authority {
  id: number;
  name: string;
  designation: string;
  message: string;
  photoUrl: string;
  publicId: string;
  type: string;
  order: number;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  publicId: string;
  date: string;
}

export interface Club {
  id: number;
  name: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  coverPublicId: string;
  createdAt: string;
  members?: ClubMember[];
  gallery?: ClubGalleryImage[];
}

export interface ClubMember {
  id: number;
  clubId: number;
  name: string;
  role: string;
  photoUrl: string;
  publicId: string;
}

export interface ClubGalleryImage {
  id: number;
  clubId: number;
  imageUrl: string;
  publicId: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  album: string;
  imageUrl: string;
  publicId: string;
  createdAt: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface Routine {
  id: number;
  title: string;
  description: string;
  pdfUrl: string;
  publicId: string;
  classLevel: string;
  createdAt: string;
}

export interface ExamPdf {
  id: number;
  title: string;
  description: string;
  pdfUrl: string;
  publicId: string;
  classLevel: string;
  createdAt: string;
}

export interface AcademicBlock {
  id: number;
  section: string;
  title: string;
  content: string;
  imageUrl: string;
  publicId: string;
}

export interface AdmissionApplication {
  id: number;
  studentName: string;
  dob: string;
  classApplyingFor: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  documentUrl: string;
  documentPublicId: string;
  status: string;
  adminNotes: string;
  decidedBy: string;
  decidedAt?: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isDeactivated: boolean;
  createdAt: string;
}
