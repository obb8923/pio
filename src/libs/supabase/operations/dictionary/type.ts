export type DictionaryColumns = {
  id: string;
  created_at: string;
  image_path: string | null;
  description: string | null;
  plant_name: string | null;
  type_code: number | null;
  activity_curve: number[] | null;
  updated_at: string | null;
  season:boolean[]
}; 