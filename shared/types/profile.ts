export type SkinType = 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';

export type Climate = 'humid' | 'dry' | 'temperate';

export type SkinConcern = 'acne' | 'aging' | 'hyperpigmentation' | 'redness' | 'texture';

export interface UserSkinProfile {
  skinType: SkinType;
  climate: Climate;
  concerns: SkinConcern[];
}
