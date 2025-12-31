import { Goal } from '../models/Goal.js';

export const getGoals = async (req, res) => {
  try {
    const status = req.query.status || null;
    const goals = await Goal.findAll(1, status);
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

export const getGoalById = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
};

export const createGoal = async (req, res) => {
  try {
    const goalData = req.body;
    const goalId = await Goal.create(goalData);
    const newGoal = await Goal.findById(goalId);
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const goalData = req.body;

    // If status is being set to completed, set completed_at
    if (goalData.status === 'completed' && !goalData.completed_at) {
      goalData.completed_at = new Date().toISOString();
    }

    await Goal.update(id, goalData);
    const updatedGoal = await Goal.findById(id);
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    await Goal.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

