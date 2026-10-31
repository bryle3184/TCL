export type Task = {
  _id: string;
  task: string;
  deadline?: string | null;
  live?: string;
  note?: string;
  assigned?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ArchivedTask = {
  _id: string;
  task: string;
  date?: string | null;
  live?: string;
  status?: string;
  note?: string;
  assigned?: string;
  archivedBy?: string;
  createdAt?: string;
};

export type CreativeAsset = {
  _id: string;
  campaign: string;
  platform: string;
  status: string;
  file?: string;
  link?: string;
  createdAt?: string;
};

export type Payout = {
  _id: string;
  name: string;
  campaign: string;
  date?: string;
  status: string;
  link?: string;
  createdAt?: string;
};

export type CsrTicket = {
  _id: string;
  customer: string;
  concern: string;
  date?: string;
  status: string;
  chatlink?: string;
  createdAt?: string;
};

export type Campaign = {
  _id: string;
  campaign: string;
  date?: string;
  budget?: number;
  link?: string;
  notes?: string;
  createdAt?: string;
};

export type MarketingContent = {
  _id: string;
  id?: string;
  schedule?: string;
  account?: string;
  platform?: string;
  event?: string;
  visual?: string;
  header?: string;
  subheader?: string;
  caption?: string;
  hashtags?: string;
  creatives?: string;
  campaign?: string;
  notes?: string;
  status: string;
  archive?: string;
  file?: string;
  createdAt?: string;
};

export type MarketingArchiveRecord = {
  _id: string;
  name: string;
  createdAt?: string;
};

export type AccountRecord = {
  _id: string;
  name: string;
  username: string;
  role: string;
  birthday?: string;
  createdAt?: string;
};

export type CalendarEvent = {
  host?: string;
  topic?: string;
  time?: string;
  platform?: string;
  employee?: string;
  reason?: string;
  id?: string;
};

export type CalendarMap = Record<string, CalendarEvent[]>;
