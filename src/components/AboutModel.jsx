import React from 'react';
import { AboutModelDL } from './AboutModelDL';
import { AboutModelCV } from './AboutModelCV';

const ABOUT_MODE = import.meta.env.VITE_ABOUT_MODE || 'dl';

export function AboutModel() {
  return ABOUT_MODE === 'cv' ? <AboutModelCV /> : <AboutModelDL />;
}
