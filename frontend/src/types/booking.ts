export type Booking = {
  _id: string;
  serviceType?: string;
  address: string;
  phoneNumber: string;
  instruction: string;
  date: string;
  timeSlot: string;
  status: string;
  amount?: number;
  paymentStatus?: string;
  userId: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  assignments?: {
    employeeId: {
      _id?: string;
      name?: string;
      email?: string;
      phone?: string;
      role?: any;
    };
    status: string;
    assignedAt?: string;
    startTime?: string;
    endTime?: string;
    startPhoto?: string;
    endPhoto?: string;
    startLocation?: { latitude: number; longitude: number; address?: string };
    endLocation?: { latitude: number; longitude: number; address?: string };
  }[];
  startPhoto?: string;
  endPhoto?: string;
  completedAt?: string;
  createdAt?: string;
  allocatedTime?: number;
  timerStartedAt?: string;
};

export type AvailableEmployee = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  activeTasksCount: number;
};
