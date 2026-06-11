"use client";

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
      className="space-y-3 rounded-lg border bg-background px-3 py-3 sm:px-4"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="inline-flex h-8 items-center gap-2 rounded-lg border border-input bg-background px-3 font-medium">
          <input
            type="checkbox"
            checked={filters.freeOnly}
            onChange={(event) =>
              updateFilter("freeOnly", event.currentTarget.checked)
            }
            className="size-4 accent-primary"
          />
          <span>공짜만 보기</span>
        </label>
        <label className="inline-flex h-8 items-center gap-2 rounded-lg border border-input bg-background px-3 font-medium">
          <input
            type="checkbox"
            checked={filters.unreservedOnly}
            onChange={(event) =>
              updateFilter("unreservedOnly", event.currentTarget.checked)
            }
            className="size-4 accent-primary"
          />
          <span>예약 안 된 것만</span>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm leading-6">
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
