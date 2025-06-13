export type PlantType = "기타" | "꽃" | "관목" | "나무" | "선인장/다육" | "수중식물" | "덩굴식물" | "잔디류";
export type PlantTypeCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const PlantTypeMap: Record<PlantTypeCode, PlantType> = {
    0: "기타",
    1: "꽃",
    2: "관목",
    3: "나무",
    4: "선인장/다육",
    5: "수중식물",
    6: "덩굴식물",
    7: "잔디류"
};
export type found_plants_columns = {
    id: string;
    created_at: string;
    image_path: string;
    memo: string | null;
    lat: number;
    lng: number;
    description: string | null;
    plant_name: string | null; 
    type_code: PlantTypeCode ;
    activity_curve: number[] ;
    activity_notes: string ;
  }
  export type saveFoundPlantType = {
    userId: string;
    imagePath: string;
    memo: string | null;
    lat: number;
    lng: number;
    description: string | null;
    plantName: string | null; 
    type_code: PlantTypeCode ;
    activity_curve: number[] ;
    activity_notes: string ;
  }