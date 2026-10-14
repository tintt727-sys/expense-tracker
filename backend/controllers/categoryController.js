import prisma from '../models/prismaClient.js';

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const where = type && type !== 'all' ? { type } : {};

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return res.json({ categories });
  } catch (error) {
    console.error('getCategories error:', error);
    return res.status(500).json({ message: 'Error retrieving categories.' });
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, icon, type } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be income or expense.' });
    }

    const trimmedName = name.trim();
    const existing = await prisma.category.findFirst({
      where: {
        name: { equals: trimmedName },
        type
      }
    });

    if (existing) {
      return res.status(409).json({ message: `A category named "${trimmedName}" already exists for ${type}.` });
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        icon: icon || 'Tag',
        type
      }
    });

    return res.status(201).json({
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    console.error('createCategory error:', error);
    return res.status(500).json({ message: 'Failed to create category.' });
  }
};

// Update an existing category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, type } = req.body;

    const existing = await prisma.category.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (icon) updateData.icon = icon;
    if (type && ['income', 'expense'].includes(type)) updateData.type = type;

    const updated = await prisma.category.update({
      where: { id },
      data: updateData
    });

    return res.json({
      message: 'Category updated successfully.',
      category: updated
    });
  } catch (error) {
    console.error('updateCategory error:', error);
    return res.status(500).json({ message: 'Failed to update category.' });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    await prisma.category.delete({
      where: { id }
    });

    return res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('deleteCategory error:', error);
    return res.status(500).json({ message: 'Failed to delete category.' });
  }
};
