"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { StarInput } from "@/components/ui/StarRating";
import { useCreateReview } from "@/hooks/useReviews";
import { fmtRange } from "@/lib/utils";
import { reviewSchema, type ReviewValues } from "@/lib/validators";
import type { Booking } from "@/types";

export function ReviewModal({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  const create = useCreateReview();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewValues>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 0, comment: "" } });

  useEffect(() => {
    if (booking) reset({ rating: 0, comment: "" });
  }, [booking, reset]);

  return (
    <Modal open={Boolean(booking)} onClose={onClose} title="How was your trip?" description={booking ? `${booking.car.title}, ${fmtRange(booking.startDate, booking.endDate)}` : undefined}>
      <form
        noValidate
        className="space-y-5"
        onSubmit={handleSubmit((v) => {
          if (!booking) return;
          create.mutate({ bookingId: booking.id, rating: v.rating, comment: v.comment }, { onSuccess: onClose });
        })}
      >
        <FormField label="Your rating" error={errors.rating?.message}>
          <Controller control={control} name="rating" render={({ field }) => <StarInput value={field.value} onChange={field.onChange} />} />
        </FormField>
        <FormField label="Your review" htmlFor="review-comment" error={errors.comment?.message} hint="Was the car as described? How was the hand-off?">
          <textarea id="review-comment" rows={5} maxLength={1200} className="textarea textarea-bordered w-full" {...register("comment")} />
        </FormField>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Not now</button>
          <button type="submit" className="btn btn-primary" disabled={create.isPending}>
            {create.isPending && <span className="loading loading-spinner loading-sm" />}
            Post review
          </button>
        </div>
      </form>
    </Modal>
  );
}
