export interface Customer {
  customerId: number;
  name: string;
  address: string;
  email: string;
  mobile: string;
  postCode: string;
  gender: string;
  profileImage: string | null;
  isActive: boolean;
  createDate: string;
}
