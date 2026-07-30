import Papa from 'papaparse';
import { lpData } from './data';
import { LandingPageConfig } from './types';

// Example CSV Format Expected:
// leadId,name,role,primaryColor,logoUrl,heroImageUrl,aboutImageUrl,instagramUrl,instagramHandle,googleMapsLink,address,whatsappNumber,whatsappMessage
export async function fetchAndApplyLeadData(leadId: string): Promise<void> {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsr2f2wl5gCD574nYnc3EAfRc-QQzqd6JCx59EokIBPHEk5Rt5vP6Kpd2WH2xbGY8EPDPYFiyOJlYw/pub?output=csv";
  if (!csvUrl) {
    console.warn("VITE_GOOGLE_SHEET_CSV_URL not set. Using default data.");
    return;
  }

  try {
    const response = await fetch(csvUrl);
    const csvContent = await response.text();
    
    // Using papaparse to parse CSV with headers
    const result = Papa.parse<any>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    const leadRow = result.data.find(row => row.leadId && row.leadId.trim() === leadId);

    if (leadRow) {
      applyLeadOverrides(leadRow);
    } else {
      console.warn(`Lead ${leadId} not found in the spreadsheet.`);
    }

  } catch (error) {
    console.error("Failed to fetch or parse CSV for lead data", error);
  }
}

function formatImageUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  let cleanUrl = url.trim();

  // Convert Google Drive view links to direct image links
  if (cleanUrl.includes('drive.google.com/file/d/')) {
    const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      cleanUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  // Convert Imgur HTML page links to direct image links
  if (cleanUrl.match(/^https?:\/\/imgur\.com\/[a-zA-Z0-9]+$/)) {
    cleanUrl = cleanUrl.replace('imgur.com', 'i.imgur.com') + '.jpg';
  }

  return cleanUrl;
}

function applyLeadOverrides(row: any) {
  // Theme
  if (row.primaryColor) lpData.theme.primaryColor = row.primaryColor.trim();
  if (row.secondaryColor) lpData.theme.secondaryColor = row.secondaryColor.trim();
  if (row.backgroundColor) lpData.theme.backgroundColor = row.backgroundColor.trim();
  if (row.textColor) lpData.theme.textColor = row.textColor.trim();
  if (row.logoUrl) lpData.theme.logoUrl = formatImageUrl(row.logoUrl) || lpData.theme.logoUrl;

  // Contact
  if (row.whatsappNumber) lpData.contact.whatsappNumber = row.whatsappNumber.trim();
  if (row.whatsappMessage) lpData.contact.whatsappMessage = row.whatsappMessage.trim();
  if (row.address) lpData.contact.address = row.address.trim();
  if (row.googleMapsLink) lpData.contact.googleMapsLink = row.googleMapsLink.trim();
  if (row.workingHours) lpData.contact.workingHours = row.workingHours.trim();

  // About
  if (row.name) lpData.about.name = row.name.trim();
  if (row.role) lpData.about.role = row.role.trim();
  if (row.aboutImageUrl) lpData.about.imageUrl = formatImageUrl(row.aboutImageUrl) || lpData.about.imageUrl;
  if (row.bio) lpData.about.bio = row.bio.trim();
  
  if (row.aboutCredential1 || row.aboutCredential2 || row.aboutCredential3) {
    lpData.about.credentials = [];
    if (row.aboutCredential1) lpData.about.credentials.push(row.aboutCredential1.trim());
    if (row.aboutCredential2) lpData.about.credentials.push(row.aboutCredential2.trim());
    if (row.aboutCredential3) lpData.about.credentials.push(row.aboutCredential3.trim());
  }

  // Space Description
  if (row.spaceTitle) lpData.space.sectionTitle = row.spaceTitle.trim();
  if (row.spaceSubtitle) lpData.space.sectionSubtitle = row.spaceSubtitle.trim();
  if (row.spaceDescription) lpData.space.text = row.spaceDescription.trim();

  // Hero
  if (row.heroImageUrl) lpData.hero.imageUrl = formatImageUrl(row.heroImageUrl) || lpData.hero.imageUrl;
  if (row.headline) lpData.hero.headline = row.headline.trim();
  if (row.subheadline) lpData.hero.subheadline = row.subheadline.trim();

  // Gallery (Instagram info)
  if (row.instagramUrl) lpData.gallery.instagramUrl = row.instagramUrl.trim();
  if (row.instagramHandle) lpData.gallery.instagramHandle = row.instagramHandle.trim();

  // Gallery Images (up to 4)
  if (row.galleryImage1Url) {
    if (!lpData.gallery.items[0]) lpData.gallery.items[0] = { id: '1', type: 'image', thumbnailUrl: '', postUrl: '', caption: '' };
    lpData.gallery.items[0].thumbnailUrl = formatImageUrl(row.galleryImage1Url) || '';
    if (row.galleryImage1Caption) lpData.gallery.items[0].caption = row.galleryImage1Caption.trim();
  }
  if (row.galleryImage2Url) {
    if (!lpData.gallery.items[1]) lpData.gallery.items[1] = { id: '2', type: 'image', thumbnailUrl: '', postUrl: '', caption: '' };
    lpData.gallery.items[1].thumbnailUrl = formatImageUrl(row.galleryImage2Url) || '';
    if (row.galleryImage2Caption) lpData.gallery.items[1].caption = row.galleryImage2Caption.trim();
  }
  if (row.galleryImage3Url) {
    if (!lpData.gallery.items[2]) lpData.gallery.items[2] = { id: '3', type: 'image', thumbnailUrl: '', postUrl: '', caption: '' };
    lpData.gallery.items[2].thumbnailUrl = formatImageUrl(row.galleryImage3Url) || '';
    if (row.galleryImage3Caption) lpData.gallery.items[2].caption = row.galleryImage3Caption.trim();
  }
  if (row.galleryImage4Url) {
    if (!lpData.gallery.items[3]) lpData.gallery.items[3] = { id: '4', type: 'image', thumbnailUrl: '', postUrl: '', caption: '' };
    lpData.gallery.items[3].thumbnailUrl = formatImageUrl(row.galleryImage4Url) || '';
    if (row.galleryImage4Caption) lpData.gallery.items[3].caption = row.galleryImage4Caption.trim();
  }

  // Testimonials (up to 3)
  if (row.testimonial1Name && row.testimonial1Text) {
    if (!lpData.testimonials.items[0]) lpData.testimonials.items[0] = { id: '1', name: '', text: '', rating: 5 };
    lpData.testimonials.items[0].name = row.testimonial1Name.trim();
    lpData.testimonials.items[0].text = row.testimonial1Text.trim();
  }
  if (row.testimonial2Name && row.testimonial2Text) {
    if (!lpData.testimonials.items[1]) lpData.testimonials.items[1] = { id: '2', name: '', text: '', rating: 5 };
    lpData.testimonials.items[1].name = row.testimonial2Name.trim();
    lpData.testimonials.items[1].text = row.testimonial2Text.trim();
  }
  if (row.testimonial3Name && row.testimonial3Text) {
    if (!lpData.testimonials.items[2]) lpData.testimonials.items[2] = { id: '3', name: '', text: '', rating: 5 };
    lpData.testimonials.items[2].name = row.testimonial3Name.trim();
    lpData.testimonials.items[2].text = row.testimonial3Text.trim();
  }

  // Services (up to 4)
  if (row.service1Title && row.service1Desc) {
    if (!lpData.services.items[0]) lpData.services.items[0] = { id: '1', title: '', description: '', iconName: 'Activity' };
    lpData.services.items[0].title = row.service1Title.trim();
    lpData.services.items[0].description = row.service1Desc.trim();
  }
  if (row.service2Title && row.service2Desc) {
    if (!lpData.services.items[1]) lpData.services.items[1] = { id: '2', title: '', description: '', iconName: 'Heart' };
    lpData.services.items[1].title = row.service2Title.trim();
    lpData.services.items[1].description = row.service2Desc.trim();
  }
  if (row.service3Title && row.service3Desc) {
    if (!lpData.services.items[2]) lpData.services.items[2] = { id: '3', title: '', description: '', iconName: 'Shield' };
    lpData.services.items[2].title = row.service3Title.trim();
    lpData.services.items[2].description = row.service3Desc.trim();
  }
  if (row.service4Title && row.service4Desc) {
    if (!lpData.services.items[3]) lpData.services.items[3] = { id: '4', title: '', description: '', iconName: 'Star' };
    lpData.services.items[3].title = row.service4Title.trim();
    lpData.services.items[3].description = row.service4Desc.trim();
  }

  // Space Images (up to 3)
  if (row.spaceImage1) {
    if (!lpData.space.images[0]) lpData.space.images[0] = { url: '', alt: 'Espaço 1' };
    lpData.space.images[0].url = formatImageUrl(row.spaceImage1) || '';
  }
  if (row.spaceImage2) {
    if (!lpData.space.images[1]) lpData.space.images[1] = { url: '', alt: 'Espaço 2' };
    lpData.space.images[1].url = formatImageUrl(row.spaceImage2) || '';
  }
  if (row.spaceImage3) {
    if (!lpData.space.images[2]) lpData.space.images[2] = { url: '', alt: 'Espaço 3' };
    lpData.space.images[2].url = formatImageUrl(row.spaceImage3) || '';
  }

  // FAQs (up to 3)
  if (row.faq1Question && row.faq1Answer) {
    if (!lpData.faq.items[0]) lpData.faq.items[0] = { id: '1', question: '', answer: '' };
    lpData.faq.items[0].question = row.faq1Question.trim();
    lpData.faq.items[0].answer = row.faq1Answer.trim();
  }
  if (row.faq2Question && row.faq2Answer) {
    if (!lpData.faq.items[1]) lpData.faq.items[1] = { id: '2', question: '', answer: '' };
    lpData.faq.items[1].question = row.faq2Question.trim();
    lpData.faq.items[1].answer = row.faq2Answer.trim();
  }
  if (row.faq3Question && row.faq3Answer) {
    if (!lpData.faq.items[2]) lpData.faq.items[2] = { id: '3', question: '', answer: '' };
    lpData.faq.items[2].question = row.faq3Question.trim();
    lpData.faq.items[2].answer = row.faq3Answer.trim();
  }
}
