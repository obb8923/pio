
export function IMAGE_BORDER_RADIUS(
  {minus=0}: {minus?: number} = {}
): {
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderBottomLeftRadius: number;
  borderBottomRightRadius: number;
} {
  return {
    borderTopLeftRadius: 96 - minus,
    borderTopRightRadius: 96 - minus,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  };
}