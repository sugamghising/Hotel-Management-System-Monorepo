"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useCreateReservation } from "@/lib/hooks/useReservations";

import { StepIndicator } from "./StepIndicator";
import { Step1Dates } from "./Step1Dates";
import { Step2RoomRate } from "./Step2RoomRate";
import { Step3Guest } from "./Step3Guest";
import { Step4Guarantee } from "./Step4Guarantee";
import { Step5Review } from "./Step5Review";

const step1Schema = z
  .object({
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
    adultCount: z.number().int().min(1, "At least 1 adult required"),
    childCount: z.number().int().min(0),
    infantCount: z.number().int().min(0),
  })
  .superRefine((data, ctx) => {
    if (!data.checkInDate || !data.checkOutDate) return;
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkIn < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Check-in cannot be in the past",
        path: ["checkInDate"],
      });
    }
    if (checkOut <= checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Check-out must be after check-in",
        path: ["checkOutDate"],
      });
    }
    const nights = Math.max(
      0,
      Math.floor(
        (checkOut.getTime() - checkIn.getTime()) / 86400000,
      ),
    );
    if (nights < 1 || nights > 365) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stay must be 1\u2013365 nights",
        path: ["checkOutDate"],
      });
    }
  });

const step2Schema = z.object({
  roomTypeId: z.string().min(1, "Select a room type"),
  ratePlanId: z.string().min(1, "Select a rate plan"),
  roomId: z.string().optional(),
});

const step3Schema = z.object({
  guestId: z.string().min(1, "Select or create a guest"),
  source: z.string().min(1, "Booking source is required"),
});

const step4Schema = z
  .object({
    guaranteeType: z.string(),
    cardLastFour: z.string().optional(),
    cardExpiryMonth: z.string().optional(),
    cardExpiryYear: z.string().optional(),
    cardBrand: z.string().optional(),
    cardToken: z.string().optional(),
    corporateCode: z.string().optional(),
    guestNotes: z.string().max(2000).optional(),
    specialRequests: z.string().max(2000).optional(),
    internalNotes: z.string().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.guaranteeType === "CREDIT_CARD") {
      if (!data.cardLastFour || data.cardLastFour.length !== 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Last 4 digits required",
          path: ["cardLastFour"],
        });
      }
      if (!data.cardExpiryMonth || data.cardExpiryMonth.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiry month required",
          path: ["cardExpiryMonth"],
        });
      }
      if (!data.cardExpiryYear || data.cardExpiryYear.length !== 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiry year required",
          path: ["cardExpiryYear"],
        });
      }
    }
  });

const formSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
});

type ReservationFormData = z.infer<typeof formSchema>;

const defaultValues: ReservationFormData = {
  step1: {
    checkInDate: "",
    checkOutDate: "",
    adultCount: 2,
    childCount: 0,
    infantCount: 0,
  },
  step2: {
    roomTypeId: "",
    ratePlanId: "",
    roomId: "",
  },
  step3: {
    guestId: "",
    source: "DIRECT_WEB",
  },
  step4: {
    guaranteeType: "CREDIT_CARD",
    cardLastFour: "",
    cardExpiryMonth: "",
    cardExpiryYear: "",
    cardBrand: "",
    cardToken: "",
    corporateCode: "",
    guestNotes: "",
    specialRequests: "",
    internalNotes: "",
  },
};

export default function NewReservationClient() {
  const router = useRouter();
  const { hotelId } = useParams<{ hotelId: string }>();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedGuestName, setSelectedGuestName] = useState("");
  const [selectedRoomTypeName, setSelectedRoomTypeName] = useState("");
  const isSubmittedRef = useRef(false);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState,
  } = form;

  const createReservation = useCreateReservation();

  useEffect(() => {
    if (!formState.isDirty || isSubmittedRef.current) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formState.isDirty]);

  const handleNext = useCallback(async () => {
    const stepNames = ["step1", "step2", "step3", "step4"] as const;
    const valid = await trigger(stepNames[currentStep - 1], {
      shouldFocus: true,
    });
    if (valid) {
      setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, trigger]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push(`/hotels/${hotelId}/reservations`);
    }
  }, [currentStep, hotelId, router]);

  const handleStepClick = useCallback(
    (step: number) => {
      if (step <= currentStep || completedSteps.includes(step - 1)) {
        setCurrentStep(step);
      }
    },
    [currentStep, completedSteps],
  );

  const onSubmit = useCallback(
    (data: ReservationFormData) => {
      isSubmittedRef.current = true;
      const payload = {
        guestId: data.step3.guestId,
        checkInDate: data.step1.checkInDate,
        checkOutDate: data.step1.checkOutDate,
        adultCount: data.step1.adultCount,
        childCount: data.step1.childCount,
        infantCount: data.step1.infantCount,
        roomTypeId: data.step2.roomTypeId,
        ratePlanId: data.step2.ratePlanId,
        roomId: data.step2.roomId || undefined,
        source: data.step3.source,
        guaranteeType: data.step4.guaranteeType,
        cardLastFour: data.step4.cardLastFour || undefined,
        cardExpiryMonth: data.step4.cardExpiryMonth || undefined,
        cardExpiryYear: data.step4.cardExpiryYear || undefined,
        cardBrand: data.step4.cardBrand || undefined,
        corporateCode: data.step4.corporateCode || undefined,
        guestNotes: data.step4.guestNotes || undefined,
        specialRequests: data.step4.specialRequests || undefined,
        internalNotes: data.step4.internalNotes || undefined,
      };

      createReservation.mutate(payload, {
        onSuccess: (reservation: any) => {
          router.push(
            `/hotels/${hotelId}/reservations/${reservation.id}`,
          );
        },
      });
    },
    [createReservation, hotelId, router],
  );

  const handleSubmitClick = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  return (
    <Form {...form}>
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="New Reservation"
          subtitle="Create a new booking"
          breadcrumb={[
            {
              label: "Reservations",
              href: `/hotels/${hotelId}/reservations`,
            },
            { label: "New" },
          ]}
        />

        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <Step1Dates
                control={control}
                watch={watch}
                setValue={setValue}
                formState={formState}
                onNext={handleNext}
              />
            )}
            {currentStep === 2 && (
              <Step2RoomRate
                control={control}
                watch={watch}
                setValue={setValue}
                onNext={handleNext}
                onBack={handleBack}
                onRoomTypeChange={setSelectedRoomTypeName}
              />
            )}
            {currentStep === 3 && (
              <Step3Guest
                control={control}
                watch={watch}
                setValue={setValue}
                onNext={handleNext}
                onBack={handleBack}
                onGuestNameChange={setSelectedGuestName}
              />
            )}
            {currentStep === 4 && (
              <Step4Guarantee
                control={control}
                watch={watch}
                setValue={setValue}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 5 && (
              <Step5Review
                watch={watch}
                onBack={handleBack}
                onSubmit={handleSubmitClick}
                isPending={createReservation.isPending}
                guestName={selectedGuestName}
                roomTypeName={selectedRoomTypeName}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}
