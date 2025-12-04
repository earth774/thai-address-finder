import { ThaiAddress } from '../types/address';
import geographyData from './geography.json';

interface GeographyItem {
  provinceNameTh: string;
  districtNameTh: string;
  subdistrictNameTh: string;
  postalCode: number;
}

// Transform geography data to ThaiAddress format
const addresses: ThaiAddress[] = (geographyData as unknown as GeographyItem[]).map((item) => ({
  province: item.provinceNameTh,
  district: item.districtNameTh,
  subDistrict: item.subdistrictNameTh,
  postalCode: String(item.postalCode),
}));

export { addresses };
