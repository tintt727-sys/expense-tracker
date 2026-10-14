import prisma from '../models/prismaClient.js';

// Get all app settings (public or authenticated)
export const getSettings = async (req, res) => {
  try {
    const settingsList = await prisma.appSetting.findMany();
    const settings = settingsList.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Sensible defaults
    const response = {
      currency: settings.currency || 'MMK',
      theme: settings.theme || 'light',
      appName: settings.appName || 'Expense Tracker Pro',
      dateFormat: settings.dateFormat || 'YYYY-MM-DD',
      allowRegistration: settings.allowRegistration !== 'false',
      ...settings
    };

    return res.json({ settings: response });
  } catch (error) {
    console.error('getSettings error:', error);
    return res.status(500).json({ message: 'Error retrieving settings.' });
  }
};

// Update an app setting (Admin only or user preference)
export const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key) {
      return res.status(400).json({ message: 'Setting key is required.' });
    }

    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    const setting = await prisma.appSetting.upsert({
      where: { key },
      update: { value: stringValue },
      create: { key, value: stringValue }
    });

    return res.json({
      message: `Setting ${key} updated.`,
      setting
    });
  } catch (error) {
    console.error('updateSetting error:', error);
    return res.status(500).json({ message: 'Failed to update setting.' });
  }
};

// Update multiple settings at once
export const bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Settings object is required.' });
    }

    const updates = [];
    for (const [key, val] of Object.entries(settings)) {
      const stringValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
      updates.push(
        prisma.appSetting.upsert({
          where: { key },
          update: { value: stringValue },
          create: { key, value: stringValue }
        })
      );
    }

    await Promise.all(updates);

    return res.json({ message: 'Settings saved successfully.' });
  } catch (error) {
    console.error('bulkUpdateSettings error:', error);
    return res.status(500).json({ message: 'Failed to update settings.' });
  }
};
