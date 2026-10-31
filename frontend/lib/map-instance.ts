import type { Map as MLMap } from "maplibre-gl";

export const mapInstance: { current: MLMap | null } = { current: null };
