import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  formControl?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  label,
  description,
  placeholder = "+1 (555) 123-4567",
  error,
  className,
  formControl = false
}: PhoneInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let phone = e.target.value;
    
    // Only allow digits, +, -, (, ), and spaces
    phone = phone.replace(/[^\d+\-() ]/g, "");
    
    onChange(phone);
  };

  if (formControl) {
    return (
      <FormItem className={className}>
        {label && <FormLabel>{label}</FormLabel>}
        <FormControl>
          <Input
            type="tel"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(error && "border-red-500", focused && "ring-2 ring-primary ring-opacity-50")}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        {error && <FormMessage>{error}</FormMessage>}
      </FormItem>
    );
  }

  return (
    <div className={className}>
      {label && <Label htmlFor="phone">{label}</Label>}
      <Input
        id="phone"
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(error && "border-red-500", focused && "ring-2 ring-primary ring-opacity-50")}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
