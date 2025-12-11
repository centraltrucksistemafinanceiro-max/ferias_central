import React from 'react';

export interface Employee {
  id: string;
  name: string;
  admissionDate: string;
  vacationStart: string;
  vacationEnd: string;
  returnDate: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  REGISTER = 'REGISTER',
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}