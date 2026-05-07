"use client";

import React from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBox({ value, onChange, placeholder }: SearchBoxProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? 'Search...'}
      className="w-full p-2 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  );
}
