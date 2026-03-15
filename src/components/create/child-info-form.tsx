"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

interface ChildInfoFormProps {
  onSubmit: (name: string, birthYear: number) => void;
  isLoading: boolean;
}

export function ChildInfoForm({ onSubmit, isLoading }: ChildInfoFormProps) {
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [errors, setErrors] = useState<{ name?: string; birthYear?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length > 50) {
      newErrors.name = "Name must be 50 characters or less";
    }

    const year = Number(birthYear);
    if (!birthYear) {
      newErrors.birthYear = "Birth year is required";
    } else if (isNaN(year) || year < 2010 || year > new Date().getFullYear()) {
      newErrors.birthYear = "Enter a valid birth year (2010 or later)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(name.trim(), year);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="child-name" className="mb-1.5 block text-sm font-medium">
          Child&apos;s Name
        </label>
        <Input
          id="child-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter their first name"
          disabled={isLoading}
          className="h-12 text-base"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="birth-year" className="mb-1.5 block text-sm font-medium">
          Birth Year
        </label>
        <Input
          id="birth-year"
          type="number"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          placeholder="e.g. 2020"
          min={2010}
          max={new Date().getFullYear()}
          disabled={isLoading}
          className="h-12 text-base"
        />
        {errors.birthYear && (
          <p className="mt-1 text-sm text-destructive">{errors.birthYear}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="h-12 w-full">
        {isLoading ? "Saving..." : "Continue"}
        {!isLoading && <ArrowRight className="ml-2 size-4" data-icon="inline-end" />}
      </Button>
    </form>
  );
}
