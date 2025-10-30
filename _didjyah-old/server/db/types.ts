export type DidjyahType = "since" | "timer" | "stopwatch" | "daily" | "goal";

export type DidjyahInput = { blah: string };

// This type represents a record entry based on the `didjyah_records` table schema.
export type DidjyahRecord = {
  id: string;
  user_id: string;
  didjyah_id: string;
  // The "inputs" field uses JSON mode, so you can type it according to your needs.
  // In this example we assume it's a DidjyahInput.
  inputs?: DidjyahInput;
  test?: string;
  created_date: string;
  updated_date: string;
  end_date: string;
};

// This type is returned from the server when retrieving didjyahs.
// Note that "records" is now an array of DidjyahRecord.
export type DidjyahDb = {
  id: string;
  user_id: string;
  name: string;
  type: DidjyahType;
  icon?: string;
  color?: string;
  icon_color?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  daily_goal?: number;
  timer?: number;
  since_last?: boolean;
  stopwatch?: boolean;
  // The "inputs" field here is assumed to follow the DidjyahInput type.
  inputs?: DidjyahInput;
  records: DidjyahRecord[];
  created_date: string;
  updated_date: string;
};