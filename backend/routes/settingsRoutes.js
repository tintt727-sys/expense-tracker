import { Router } from 'express';
import {
  getSettings,
  updateSetting,
  bulkUpdateSettings
} from '../controllers/settingsController.js';

const router = Router();

// Publicly read app settings (e.g., currency, theme, appName)
router.get('/', getSettings);

// Update settings
router.put('/single', updateSetting);
router.put('/bulk', bulkUpdateSettings);

export default router;
