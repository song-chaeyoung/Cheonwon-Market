"use client";

import { CheckIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { PERSON_NAMES } from "@/server/products/constants";

import {
  ALL_PERSON_FILTER_VALUE,
  personFilterSubjectLabel,
  type PersonFilterValue,
  type ProductFilters,
} from "./product-filters";

const inlineTriggerClassName =
  "inline-flex h-auto gap-0.5 rounded-sm border-0 p-0 align-baseline font-semibold text-primary underline decoration-primary/40 underline-offset-4 data-[size=default]:h-auto [&_svg]:text-primary!";

const checkboxChipClassName =
  "inline-flex h-9 cursor-pointer select-none items-center gap-1.5 rounded-full border border-input bg-background px-3.5 font-medium text-muted-foreground transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring has-checked:border-primary/40 has-checked:bg-primary/10 has-checked:text-primary";

const checkboxChipIconClassName = "hidden size-3.5 peer-checked:block";

type ProductFilterControlsProps = {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
};

export function ProductFilterControls({
  filters,
  onFiltersChange,
}: ProductFilterControlsProps) {
  function updateFilter<Key extends keyof ProductFilters>(
    key: Key,
    value: ProductFilters[Key],
  ) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <section
      aria-label="상품 필터"
      className="space-y-3 rounded-xl border bg-card px-3 py-3 shadow-xs sm:px-4"
    >
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <label className={checkboxChipClassName}>
          <input
            type="checkbox"
            checked={filters.freeOnly}
            onChange={(event) =>
              updateFilter("freeOnly", event.currentTarget.checked)
            }
            className="peer sr-only"
          />
          <CheckIcon aria-hidden="true" className={checkboxChipIconClassName} />
          <span>공짜만 보기</span>
        </label>
        <label className={checkboxChipClassName}>
          <input
            type="checkbox"
            checked={filters.unreservedOnly}
            onChange={(event) =>
              updateFilter("unreservedOnly", event.currentTarget.checked)
            }
            className="peer sr-only"
          />
          <CheckIcon aria-hidden="true" className={checkboxChipIconClassName} />
          <span>예약 안 된 것만</span>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm leading-6">
        <p>
          <Select
            value={filters.sellerName}
            onValueChange={(value) =>
              updateFilter("sellerName", value as PersonFilterValue)
            }
          >
            <SelectTrigger
              aria-label="등록자 필터"
              className={inlineTriggerClassName}
            >
              {personFilterSubjectLabel(filters.sellerName)}
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value={ALL_PERSON_FILTER_VALUE}>전체</SelectItem>
              {PERSON_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {" "}
          등록한 상품
        </p>
        <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
        <p>
          <Select
            value={filters.purchaseName}
            onValueChange={(value) =>
              updateFilter("purchaseName", value as PersonFilterValue)
            }
          >
            <SelectTrigger
              aria-label="예약자 필터"
              className={inlineTriggerClassName}
            >
              {personFilterSubjectLabel(filters.purchaseName)}
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value={ALL_PERSON_FILTER_VALUE}>전체</SelectItem>
              {PERSON_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {" "}
          예약한 상품
        </p>
      </div>
    </section>
  );
}
