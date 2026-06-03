export interface ReservationFormData {
  step1: {
    checkInDate: string;
    checkOutDate: string;
    adultCount: number;
    childCount: number;
    infantCount: number;
  };
  step2: {
    roomTypeId: string;
    ratePlanId: string;
    roomId?: string;
  };
  step3: {
    guestId: string;
    source: string;
  };
  step4: {
    guaranteeType: string;
    cardLastFour?: string;
    cardExpiryMonth?: string;
    cardExpiryYear?: string;
    cardBrand?: string;
    cardToken?: string;
    corporateCode?: string;
    guestNotes?: string;
    specialRequests?: string;
    internalNotes?: string;
  };
}
