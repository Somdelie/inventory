"use client";

import React, { useState } from "react";
import Select from "react-tailwindcss-select";
import { SelectValue } from "react-tailwindcss-select/dist/components/type";

export default function DateFilters({
  data,
  onFilter,
  setIsSearch,
}: {
  data: any[];
  onFilter: any;
  setIsSearch: any;
}) {
  const [selectedFilter, setSelectedFilter] = useState<SelectValue>(null);
  const filterByMonth = (data: any[], key: string): any[] => {
    return data.filter((item) => item.month === key);
  };
  const handleChange = (item: any) => {
    const valueString = item!.value;
    setSelectedFilter(item);
    setIsSearch(false);
    const filteredData = filterByMonth(data, valueString);
    onFilter(filteredData);
  };

  const months = [
    { value: "January", label: "January" },
    { value: "February", label: "February" },
    { value: "March", label: "March" },
    { value: "April", label: "April" },
    { value: "May", label: "May" },
    { value: "June", label: "June" },
    { value: "July", label: "July" },
    { value: "August", label: "August" },
    { value: "September", label: "September" },
    { value: "October", label: "October" },
    { value: "November", label: "November" },
    { value: "December", label: "December" },
  ];
  const handleClear = () => {
    setSelectedFilter(null);
    setIsSearch(true);
    onFilter(data);
  };

  return (
    <div className="w-full">
      <Select
        value={selectedFilter}
        onChange={handleChange}
        options={months}
        primaryColor={"indigo"}
        isSearchable
        placeholder="Filter By Month"
      />
    </div>
  );
}
